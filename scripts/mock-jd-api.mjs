#!/usr/bin/env node
// Local stand-in for the JD Matcher Gateway (docs/jd-matcher-api-contract.md).
// Dev only: never deployed, no network calls, no keys.
//
//   npm run mock:api                      # http://localhost:8787
//   MOCK_VARIANT=openai npm run mock:api  # default variant for every request
//   MOCK_COOLDOWN_SEC=120 npm run mock:api  # per-IP cooldown after an analysis (default 0 = off)
//   MOCK_SPEED=3 npm run mock:api         # 3x faster timings
//   MOCK_PAUSED=1 npm run mock:api        # demo switched off (GET /quota paused, POST 503 DEMO_PAUSED)
//
// Variants (MOCK_VARIANT, or put the token anywhere in the JD text, e.g. "mock:openai"):
//   self      Qwen3-4B on the personal machine (default)
//   openai    routed to OpenAI because the personal machine is offline
//   fallback  starts on the personal machine, `evaluate` falls back to OpenAI mid-run
//   error     stream fails during `evaluate` with LLM_UNAVAILABLE (quota refunded)
//   timeout   stream fails during `write` with TIMEOUT (quota not refunded)
//   drop      connection closes mid-stream without a result
//   internal  the gateway loses the AI service mid-stream and appends INTERNAL (quota refunded)
//   limited   personal machine offline and no OpenAI quota left: `route` fails, FALLBACK_LIMITED
//   paused    503 DEMO_PAUSED, and GET /quota reports paused for the next 60s
//   cap       503 DAILY_CAP_REACHED, and GET /quota reports dailyLeft 0 for the next 60s (also `503`)
//   busy      429 RATE_LIMITED with a short retryAfterSec (server busy, not a visitor limit)
//   400 | 403 | 413 | 429 | 502   the matching JSON error, before any stream (429 also starts a 30s cooldown)
// Every stage event carries a server-style `label` (+ `detail` when done) in the request lang, and
// `activity` lines stream under the running stage. One unknown event type is sent to test that
// clients ignore it.
// The same JD sent twice within 24h replays from cache (fast, cached: true, no quota).

import { createServer } from 'node:http';
import { createHash } from 'node:crypto';

const PORT = Number(process.env.PORT || 8787);
const DEFAULT_VARIANT = process.env.MOCK_VARIANT || 'self';
const COOLDOWN_SEC = Number(process.env.MOCK_COOLDOWN_SEC || 0);
const SPEED = Math.max(0.1, Number(process.env.MOCK_SPEED || 1));
const DAILY_CAP = 50;
const FORCED_COOLDOWN_SEC = 30; // `mock:429`
const BUSY_RETRY_SEC = 8; // `mock:busy`
const ALLOWED_ORIGIN = /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/;
const VARIANTS = [
  'self', 'openai', 'fallback', 'error', 'timeout', 'drop', 'internal', 'limited', 'paused', 'cap', 'busy',
  '400', '403', '413', '429', '502', '503',
];
const GROUPS = ['skills', 'experience', 'responsibilities', 'domain', 'extras'];

const SELF_MODEL = 'Qwen3-4B (fine-tuned)';
const OPENAI_MODEL = 'gpt-4.1-mini';

const nextAllowed = new Map(); // ip -> epoch ms
const cache = new Map(); // sha256(text|lang) -> { at, run: { events, lang } }
let usedToday = 0;
let pausedUntil = process.env.MOCK_PAUSED === '1' ? Infinity : 0;
let capUntil = 0;
const isPaused = () => Date.now() < pausedUntil;
const isCapped = () => Date.now() < capUntil;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms / SPEED));
const jitter = (ms) => Math.round(ms * (0.75 + Math.random() * 0.5));

function cors(req, res) {
  const origin = req.headers.origin;
  if (origin && ALLOWED_ORIGIN.test(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Vary', 'Origin');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Access-Control-Max-Age', '600');
  }
}

function json(res, status, body) {
  res.writeHead(status, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(body));
}

function quotaFor(ip) {
  const wait = Math.max(0, Math.ceil(((nextAllowed.get(ip) || 0) - Date.now()) / 1000));
  const dailyLeft = isCapped() ? 0 : Math.max(0, DAILY_CAP - usedToday);
  const paused = isPaused();
  return { allowed: wait === 0 && dailyLeft > 0 && !paused, retryAfterSec: wait, dailyLeft, paused };
}

async function readBody(req) {
  let raw = '';
  for await (const chunk of req) {
    raw += chunk;
    if (raw.length > 200_000) throw Object.assign(new Error('too large'), { tooLarge: true });
  }
  return JSON.parse(raw || '{}');
}

// ── Fake analysis ────────────────────────────────────────────────────────────

const EV = {
  afforai: { id: 'exp-afforai', label: 'Afforai (Logically)', section: 'exp', key: 'Afforai (Logically)' },
  logically: { id: 'proj-logically', label: 'Logically', section: 'projects', key: 'Logically' },
  fpt: { id: 'exp-fpt-telecom', label: 'FPT Telecom', section: 'exp', key: 'FPT Telecom' },
  iris: { id: 'proj-iris', label: 'IRIS 3D Web/Desktop', section: 'projects', key: 'IRIS 3D Web/Desktop' },
  agents: { id: 'proj-multi-agent', label: 'Multi-Agent Delivery System', section: 'projects', key: 'Multi-Agent Delivery System' },
  coca: { id: 'proj-cocacola-ar', label: 'Coca-Cola AR Training', section: 'projects', key: 'Coca-Cola AR Training' },
  lumi: { id: 'exp-lumi', label: 'Lumi Vietnam', section: 'exp', key: 'Lumi Vietnam' },
};

const REQS = [
  { kw: /react|frontend|front-end|typescript/i, group: 'skills', kind: 'must', ev: ['afforai', 'iris'],
    en: ['React + TypeScript frontend', 'Led frontend on IRIS 3D and Logically.'],
    vi: ['Frontend React + TypeScript', 'Lead frontend IRIS 3D và Logically.'] },
  { kw: /node|backend|api|express/i, group: 'skills', kind: 'must', ev: ['afforai'],
    en: ['Node.js backend & REST APIs', 'Owned the Node/Postgres/Mongo backend at Afforai.'],
    vi: ['Backend Node.js & REST API', 'Owner backend Node/Postgres/Mongo tại Afforai.'] },
  { kw: /llm|ai|rag|gpt|openai|machine learning/i, group: 'domain', kind: 'must', ev: ['logically', 'agents'],
    en: ['LLM / RAG product experience', 'Designed RAG over OpenAI, Anthropic and Gemini for Logically.'],
    vi: ['Kinh nghiệm sản phẩm LLM / RAG', 'Thiết kế RAG trên OpenAI, Anthropic, Gemini cho Logically.'] },
  { kw: /lead|manage|mentor|team/i, group: 'experience', kind: 'must', ev: ['fpt', 'coca'],
    en: ['Leading engineering teams', 'Led teams of 5–10 at FPT Telecom (Coca-Cola AR, Partner Platform).'],
    vi: ['Dẫn dắt team kỹ thuật', 'Dẫn team 5–10 người tại FPT Telecom (Coca-Cola AR, Partner Platform).'] },
  { kw: /agile|scrum|sprint|stakeholder/i, group: 'responsibilities', kind: 'responsibility', ev: ['fpt'],
    en: ['Run agile delivery with stakeholders', 'Ran Scrum across enterprise and AR/VR projects.'],
    vi: ['Vận hành agile cùng stakeholder', 'Chạy Scrum cho dự án enterprise và AR/VR.'] },
  { kw: /cloud|gcp|aws|devops|ci\/cd/i, group: 'skills', kind: 'nice', ev: ['afforai'], level: 'partial',
    en: ['Cloud & CI/CD', 'GCP deployments end to end; less AWS depth.'],
    vi: ['Cloud & CI/CD', 'Triển khai GCP end-to-end; AWS ít sâu hơn.'] },
  { kw: /mobile|react native|ios|android/i, group: 'experience', kind: 'nice', ev: ['lumi'],
    en: ['Mobile apps', 'React Native IoT apps at Lumi.'],
    vi: ['Ứng dụng mobile', 'App IoT React Native tại Lumi.'] },
  { kw: /3d|three|webgl/i, group: 'extras', kind: 'nice', ev: ['iris'],
    en: ['3D / WebGL', 'Three.js + Electron on IRIS 3D.'],
    vi: ['3D / WebGL', 'Three.js + Electron trên IRIS 3D.'] },
];

const GAPS = [
  { kw: /kubernetes|k8s/i, group: 'skills', kind: 'nice',
    en: ['Kubernetes in production', 'Containerised deploys, but no hands-on k8s cluster ops.'],
    vi: ['Kubernetes trên production', 'Có deploy container nhưng chưa vận hành cluster k8s.'] },
  { kw: /java|spring|\.net|c#/i, group: 'skills', kind: 'nice', level: 'transferable',
    en: ['JVM / .NET backend', 'Java Spring exposure; main stack is Node.'],
    vi: ['Backend JVM / .NET', 'Có làm Java Spring; stack chính là Node.'] },
  { kw: /phd|research|publication/i, group: 'extras', kind: 'nice',
    en: ['Academic research background', 'No research publications.'],
    vi: ['Nền tảng nghiên cứu học thuật', 'Chưa có công bố nghiên cứu.'] },
  { kw: /german|japanese|french|chinese/i, group: 'extras', kind: 'must',
    en: ['Additional spoken language', 'Vietnamese and English only.'],
    vi: ['Ngoại ngữ bổ sung', 'Chỉ tiếng Việt và tiếng Anh.'] },
];

function analyze(text, lang) {
  const hits = REQS.filter((r) => r.kw.test(text));
  const reqs = hits.length >= 3 ? hits : [...hits, ...REQS.filter((r) => !hits.includes(r)).slice(0, 3 - hits.length)];
  let gapReqs = GAPS.filter((g) => g.kw.test(text));
  if (gapReqs.length === 0) gapReqs = [GAPS[0]];

  const verdict = (r, i, level) => ({
    reqId: `r${i + 1}`,
    requirement: r[lang][0],
    kind: r.kind,
    group: r.group,
    level,
    note: r[lang][1],
    evidence: (r.ev || []).map((k) => EV[k]),
  });
  const matched = reqs.map((r, i) => verdict(r, i, r.level || (hits.includes(r) ? 'strong' : 'transferable')));
  const gaps = gapReqs.filter((g) => g.level !== 'transferable').map((g, i) => verdict(g, matched.length + i, 'gap'));
  for (const g of gapReqs.filter((x) => x.level === 'transferable')) matched.push(verdict(g, matched.length + gaps.length, 'transferable'));

  const weight = { strong: 1, partial: 0.7, transferable: 0.55, gap: 0.2 };
  const sections = {};
  const counts = {};
  const used = GROUPS.filter((g) => [...matched, ...gaps].some((v) => v.group === g));
  for (const g of GROUPS) {
    const vs = [...matched, ...gaps].filter((v) => v.group === g);
    const c = { strong: 0, partial: 0, transferable: 0, gap: 0 };
    vs.forEach((v) => { c[v.level]++; });
    counts[g] = c;
    if (vs.length) {
      const raw = vs.reduce((sum, v) => sum + weight[v.level], 0) / vs.length;
      sections[g] = Math.round(Math.min(97, Math.max(45, 40 + raw * 58)));
    }
  }
  const overall = Math.round(Math.min(97, Math.max(45, used.reduce((sum, g) => sum + sections[g], 0) / used.length)));
  // Groups the JD does not mention come last, all counts 0, score = overall.
  for (const g of GROUPS) if (!used.includes(g)) sections[g] = overall;
  const groupOrder = [...used, ...GROUPS.filter((g) => !used.includes(g))];
  const tier = overall >= 85 ? 'strong' : overall >= 72 ? 'good' : overall >= 60 ? 'partial' : 'stretch';

  const firstLine = text.split('\n').map((l) => l.trim()).find((l) => l.length > 3) || 'Job description';
  const title = firstLine.replace(/^(job title|position|vị trí)\s*[:-]\s*/i, '').slice(0, 70);
  const seniority = /senior|lead|principal|staff/i.test(text) ? 'Senior' : /junior|intern/i.test(text) ? 'Junior' : 'Mid–Senior';

  const highlights = [];
  for (const v of matched) for (const e of v.evidence) if (!highlights.some((h) => h.id === e.id)) highlights.push(e);

  const summary = lang === 'vi'
    ? `Cường đáp ứng ${matched.length}/${matched.length + gaps.length} yêu cầu chính, mạnh nhất ở ${matched[0].requirement.toLowerCase()}. Điểm cần bù: ${gaps.map((g) => g.requirement.toLowerCase()).join(', ')}.`
    : `Cuong covers ${matched.length} of ${matched.length + gaps.length} key requirements, strongest on ${matched[0].requirement.toLowerCase()}. Main gaps: ${gaps.map((g) => g.requirement.toLowerCase()).join(', ')}.`;

  return {
    title, seniority, requirements: matched.length + gaps.length, sections, counts, groupOrder,
    textLang: /[ăâđêôơưạảấầẩậắằẳặẹẻẽếềểệỉịọỏốồổộớờởợụủứừửựỳỷỹ]/i.test(text) ? 'vi' : 'en',
    result: { overall, tier, sections, job: { title, seniority }, matched, gaps, highlights: highlights.slice(0, 5), summary },
  };
}

// ── Server-written stage labels (the frontend renders these verbatim) ───────

const GROUP_NAME = {
  vi: { skills: 'Kỹ năng', experience: 'Kinh nghiệm', responsibilities: 'Trách nhiệm', domain: 'Lĩnh vực', extras: 'Khác' },
  en: { skills: 'Skills', experience: 'Experience', responsibilities: 'Responsibilities', domain: 'Domain', extras: 'Extras' },
};
const LEVEL_MARK = {
  vi: { strong: '✓ mạnh', partial: '~ một phần', transferable: '~ chuyển đổi được', gap: '✗ chưa có' },
  en: { strong: '✓ strong', partial: '~ partial', transferable: '~ transferable', gap: '✗ missing' },
};
const TIER_NAME = { strong: 'Strong match', good: 'Good match', partial: 'Partial match', stretch: 'Stretch' };
const num = (lang, n) => n.toLocaleString(lang === 'vi' ? 'vi-VN' : 'en-US');

const COPY = {
  vi: {
    accepted: 'Đã nhận JD, bắt đầu phân tích',
    acceptedCached: 'JD này vừa được phân tích, phát lại kết quả đã lưu',
    routeRun: 'Đang kiểm tra máy chủ model cá nhân…',
    routeSelf: 'Dùng Qwen3-4B trên máy cá nhân',
    routeOpenai: 'Máy cá nhân offline → chuyển sang OpenAI',
    routeLimited: 'Máy cá nhân offline, chưa thể dùng model dự phòng',
    normRun: 'Đang làm sạch JD, bỏ phần phúc lợi và giới thiệu công ty',
    normDone: (jdLang, n) => `JD ${jdLang === 'vi' ? 'tiếng Việt' : 'tiếng Anh'} · giữ ${n} ký tự nội dung chính`,
    extractRun: 'AI đang đọc JD và tách các yêu cầu…',
    extractDone: (title, n) => `${title} · ${n} yêu cầu`,
    extractDetail: (must, other) => `${must} bắt buộc, ${other} ưu tiên`,
    extractLine: (req, must) => `Tìm thấy yêu cầu ${must ? 'bắt buộc' : 'ưu tiên'}: ${req}`,
    retrieveRun: 'Đang đối chiếu từng yêu cầu với CV…',
    retrieveDone: (k, n) => `Tìm được bằng chứng cho ${k}/${n} yêu cầu`,
    retrieveLine: (req, ev) => `'${req}' → gần nhất: ${ev}`,
    retrieveNone: (req) => `'${req}' → chưa thấy bằng chứng trực tiếp`,
    evalRun: 'AI đang đánh giá theo từng nhóm…',
    evalFallback: 'Máy cá nhân phản hồi chậm → chuyển phần đánh giá sang OpenAI',
    evalDone: (s, p, g) => `${s} khớp mạnh · ${p} một phần · ${g} chưa có`,
    scoreDone: (o, tier) => `Mức phù hợp ~${o}% · ${tier}`,
    writeRun: 'AI đang viết nhận xét và chọn kinh nghiệm nổi bật…',
    writeLine: (label) => `Chọn làm nổi bật: ${label}`,
    writeDone: (n) => `Đã chọn ${n} kinh nghiệm nổi bật`,
    done: 'Hoàn tất phân tích',
  },
  en: {
    accepted: 'JD received, starting the analysis',
    acceptedCached: 'This JD was analyzed recently, replaying the saved result',
    routeRun: 'Checking the personal model server…',
    routeSelf: 'Using Qwen3-4B on the personal machine',
    routeOpenai: 'Personal machine offline → switching to OpenAI',
    routeLimited: 'Personal machine offline, backup model not available yet',
    normRun: 'Cleaning up the JD, dropping benefits and company intro',
    normDone: (jdLang, n) => `${jdLang === 'vi' ? 'Vietnamese' : 'English'} JD · kept ${n} characters of core content`,
    extractRun: 'AI is reading the JD and splitting out requirements…',
    extractDone: (title, n) => `${title} · ${n} requirements`,
    extractDetail: (must, other) => `${must} must-have, ${other} nice-to-have`,
    extractLine: (req, must) => `Found ${must ? 'must-have' : 'nice-to-have'}: ${req}`,
    retrieveRun: 'Matching each requirement against the CV…',
    retrieveDone: (k, n) => `Found evidence for ${k}/${n} requirements`,
    retrieveLine: (req, ev) => `'${req}' → closest: ${ev}`,
    retrieveNone: (req) => `'${req}' → no direct evidence yet`,
    evalRun: 'AI is evaluating each group…',
    evalFallback: 'Personal machine is slow → moving the evaluation to OpenAI',
    evalDone: (s, p, g) => `${s} strong · ${p} partial · ${g} missing`,
    scoreDone: (o, tier) => `Match ~${o}% · ${tier}`,
    writeRun: 'AI is writing the summary and picking standout experience…',
    writeLine: (label) => `Highlighting: ${label}`,
    writeDone: (n) => `Picked ${n} standout experiences`,
    done: 'Analysis complete',
  },
};

// ── SSE ──────────────────────────────────────────────────────────────────────

function sse(res, event, data) {
  res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
}

async function runStream(res, { text, lang, variant, signal, jobId }) {
  const a = analyze(text, lang);
  const c = COPY[lang];
  const first = variant === 'openai' ? 'openai' : 'self';
  const model = (p) => (p === 'self' ? SELF_MODEL : OPENAI_MODEL);
  const slow = first === 'self' ? 1.6 : 1; // the personal machine is slower than OpenAI
  const events = [];
  const emit = (event, data) => { if (!signal.aborted) { sse(res, event, data); events.push([event, data]); } };
  const activity = async (stage, lines, gap) => {
    for (const textLine of lines) {
      await sleep(jitter(gap));
      emit('activity', { stage, text: textLine });
    }
  };
  const total = () => events.filter(([e, d]) => e === 'stage' && d.status === 'done').reduce((sum, [, d]) => sum + (d.ms || 0), 0);
  // One stage: `running` (unless onlyDone), the work (run or a sleep), then `done` with its label/detail.
  const stage = async (id, { label, doneLabel, detail, ms = 0, extra = {}, meta, onlyDone, run } = {}) => {
    if (!onlyDone) emit('stage', { stage: id, status: 'running', label, ...extra });
    const t0 = Date.now();
    if (run) await run();
    else await sleep(ms);
    emit('stage', {
      stage: id, status: 'done', label: doneLabel ?? label, ...(detail ? { detail } : {}),
      ms: Math.round((Date.now() - t0) * SPEED), ...extra, ...(meta ? { meta } : {}),
    });
  };
  const fail = async (id, label, error, extra = {}, meta) => {
    emit('stage', { stage: id, status: 'failed', label, ...extra, ...(meta ? { meta } : {}) });
    emit('error', error);
    return null;
  };
  const all = [...a.result.matched, ...a.result.gaps];

  await stage('accepted', { label: c.accepted, ms: 40, onlyDone: true, meta: { jobId } });
  emit('telemetry', { note: 'unknown event types must be ignored by the client' });

  emit('stage', { stage: 'route', status: 'running', label: c.routeRun });
  await sleep(jitter(500));
  if (variant === 'limited') {
    return fail('route', c.routeLimited, { code: 'FALLBACK_LIMITED', retryable: true, retryAfterSec: 120 }, {}, { reason: 'offline' });
  }
  emit('stage', {
    stage: 'route', status: 'done', label: first === 'self' ? c.routeSelf : c.routeOpenai,
    ms: 480, provider: first, model: model(first), ...(first === 'openai' ? { meta: { reason: 'offline' } } : {}),
  });

  const kept = Math.round(text.length * 0.82);
  await stage('normalize', {
    label: c.normRun, doneLabel: c.normDone(a.textLang, num(lang, kept)), ms: jitter(260),
    meta: { lang: a.textLang, chars: kept },
  });

  const must = all.filter((v) => v.kind === 'must').length;
  await stage('extract', {
    label: c.extractRun,
    doneLabel: c.extractDone(a.title, a.requirements),
    detail: c.extractDetail(must, a.requirements - must),
    extra: { provider: first, model: model(first) },
    meta: { title: a.title, requirements: a.requirements },
    run: () => activity('extract', all.map((v) => c.extractLine(v.requirement, v.kind === 'must')), 1500 * slow / all.length + 120),
  });

  const withEvidence = all.filter((v) => v.evidence.length > 0);
  await stage('retrieve', {
    label: c.retrieveRun,
    doneLabel: c.retrieveDone(withEvidence.length, all.length),
    meta: { chunks: 12 + (text.length % 9) },
    run: () => activity('retrieve', all.slice(0, 4).map((v) => (v.evidence[0]
      ? c.retrieveLine(v.requirement, v.evidence[0].label)
      : c.retrieveNone(v.requirement))), 160),
  });

  if (variant === 'drop') {
    emit('stage', { stage: 'evaluate', status: 'running', label: c.evalRun, provider: first, model: model(first) });
    await sleep(1200);
    res.destroy();
    return null;
  }
  const evalProvider = variant === 'fallback' ? 'openai' : first;
  const evalModel = { provider: evalProvider, model: model(evalProvider) };
  const groupLines = async (n) => {
    for (const g of a.groupOrder.slice(0, n)) {
      await sleep(jitter(420 * (evalProvider === 'self' ? slow : 1)));
      const vs = all.filter((v) => v.group === g).slice(0, 2);
      if (vs.length) {
        const line = `${GROUP_NAME[lang][g]}: ${vs.map((v) => `${v.requirement} ${LEVEL_MARK[lang][v.level]}`).join(' · ')}`;
        emit('activity', { stage: 'evaluate', text: line.slice(0, 120) });
      }
      await sleep(jitter(220));
      emit('section', { group: g, score: a.sections[g], ...a.counts[g] });
    }
  };
  if (variant === 'error' || variant === 'internal') {
    // The model stops answering (error) or the gateway loses the AI service (internal): stage failed, quota refunded.
    emit('stage', { stage: 'evaluate', status: 'running', label: c.evalRun, ...evalModel });
    await groupLines(2);
    await sleep(900);
    return fail('evaluate', c.evalRun, { code: variant === 'error' ? 'LLM_UNAVAILABLE' : 'INTERNAL', retryable: true }, evalModel);
  }
  const levels = { strong: 0, partial: 0, transferable: 0, gap: 0 };
  all.forEach((v) => { levels[v.level]++; });
  await stage('evaluate', {
    label: c.evalRun,
    doneLabel: c.evalDone(levels.strong, levels.partial + levels.transferable, levels.gap),
    extra: evalModel,
    run: async () => {
      if (variant === 'fallback') {
        await sleep(1500); // the personal machine stalls; the gateway re-runs the call on OpenAI
        emit('stage', { stage: 'evaluate', status: 'running', label: c.evalFallback, ...evalModel });
      }
      await groupLines(GROUPS.length);
    },
  });

  const r = a.result;
  await stage('score', {
    label: c.scoreDone(r.overall, TIER_NAME[r.tier]), ms: jitter(90), onlyDone: true,
    meta: { overall: r.overall, tier: r.tier, verdicts: all.length },
  });
  if (variant === 'timeout') {
    emit('stage', { stage: 'write', status: 'running', label: c.writeRun, ...evalModel });
    await sleep(jitter(1600));
    return fail('write', c.writeRun, { code: 'TIMEOUT', retryable: false }, evalModel);
  }
  await stage('write', {
    label: c.writeRun,
    doneLabel: c.writeDone(r.highlights.length),
    extra: evalModel,
    run: () => activity('write', r.highlights.slice(0, 3).map((h) => c.writeLine(h.label)), 1100 * slow / 3),
  });

  emit('stage', { stage: 'done', status: 'done', label: c.done, ms: total() });
  emit('result', { jobId, cached: false, provider: evalProvider, model: model(evalProvider), ...r });
  return { events, lang };
}

async function replay(res, run, signal) {
  const jobId = `job_${Date.now().toString(36)}`;
  for (const [event, data] of run.events) {
    if (signal.aborted) return;
    let out = data;
    if (event === 'result') out = { ...data, jobId, cached: true };
    else if (event === 'stage' && data.stage === 'accepted') {
      out = { ...data, label: COPY[run.lang].acceptedCached, meta: { jobId, cached: true } };
    }
    sse(res, event, out);
    await sleep(event === 'activity' ? 12 : 35);
  }
}

// ── HTTP ─────────────────────────────────────────────────────────────────────

const server = createServer(async (req, res) => {
  cors(req, res);
  const url = new URL(req.url || '/', 'http://localhost');
  const ip = req.socket.remoteAddress || 'local';

  if (req.method === 'OPTIONS') { res.writeHead(204); res.end(); return; }

  if (req.method === 'GET' && url.pathname === '/quota') {
    await sleep(120);
    json(res, 200, quotaFor(ip));
    return;
  }

  if (req.method === 'POST' && url.pathname === '/analyze') {
    let body;
    try {
      body = await readBody(req);
    } catch (err) {
      json(res, err.tooLarge ? 413 : 400, { error: err.tooLarge ? 'PAYLOAD_TOO_LARGE' : 'INVALID_INPUT' });
      return;
    }
    const text = typeof body.text === 'string' ? body.text.trim() : '';
    const lang = body.lang === 'en' ? 'en' : 'vi';
    const token = /mock:([a-z0-9]+)/i.exec(text)?.[1]?.toLowerCase();
    const variant = token && VARIANTS.includes(token) ? token : DEFAULT_VARIANT;

    await sleep(jitter(250));
    if (variant === 'paused') pausedUntil = Date.now() + 60_000;
    if (isPaused()) { json(res, 503, { error: 'DEMO_PAUSED' }); return; }
    if (variant === '413') { json(res, 413, { error: 'PAYLOAD_TOO_LARGE' }); return; }
    if (variant === '400' || text.length < 50 || text.length > 15000) { json(res, 400, { error: 'INVALID_INPUT' }); return; }
    if (variant === '403') { json(res, 403, { error: 'BOT_CHECK_FAILED' }); return; }
    if (variant === '502') { json(res, 502, { error: 'UPSTREAM_UNAVAILABLE' }); return; }
    if (variant === 'cap' || variant === '503') capUntil = Date.now() + 60_000;
    if (isCapped() || usedToday >= DAILY_CAP) { json(res, 503, { error: 'DAILY_CAP_REACHED' }); return; }
    if (variant === 'busy') { json(res, 429, { error: 'RATE_LIMITED', retryAfterSec: BUSY_RETRY_SEC }); return; }

    const key = createHash('sha256').update(`${lang}|${text}`).digest('hex');
    const hit = cache.get(key);
    const fresh = hit && Date.now() - hit.at < 24 * 3600_000;
    const q = quotaFor(ip);
    if (variant === '429') {
      nextAllowed.set(ip, Date.now() + FORCED_COOLDOWN_SEC * 1000); // so GET /quota agrees after a reload
      json(res, 429, { error: 'RATE_LIMITED', retryAfterSec: FORCED_COOLDOWN_SEC });
      return;
    }
    if (!fresh && !q.allowed) { json(res, 429, { error: 'RATE_LIMITED', retryAfterSec: q.retryAfterSec }); return; }

    const ac = new AbortController();
    res.on('close', () => ac.abort());
    res.writeHead(200, { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache', Connection: 'keep-alive' });
    const ping = setInterval(() => res.write(': ping\n\n'), 10_000);
    try {
      if (fresh) {
        await replay(res, hit.run, ac.signal);
      } else {
        usedToday++;
        if (COOLDOWN_SEC > 0) nextAllowed.set(ip, Date.now() + COOLDOWN_SEC * 1000);
        const jobId = `job_${Date.now().toString(36)}`;
        const run = await runStream(res, { text, lang, variant, signal: ac.signal, jobId });
        if (run) cache.set(key, { at: Date.now(), run });
        else if (['error', 'internal', 'limited'].includes(variant)) { usedToday--; nextAllowed.delete(ip); } // refunded
      }
    } finally {
      clearInterval(ping);
      if (!res.destroyed) res.end();
    }
    return;
  }

  json(res, 404, { error: 'NOT_FOUND' });
});

server.listen(PORT, () => {
  console.log(`[mock-jd-api] http://localhost:${PORT}  variant=${DEFAULT_VARIANT}  cooldown=${COOLDOWN_SEC}s  speed=${SPEED}x`);
});
