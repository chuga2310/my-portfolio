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
//   400 | 403 | 413 | 429 | 502 | 503   the matching JSON error, before any stream (429 also starts a 30s cooldown)
// The same JD sent twice within 24h replays from cache (fast, cached: true, no quota).

import { createServer } from 'node:http';
import { createHash } from 'node:crypto';

const PORT = Number(process.env.PORT || 8787);
const DEFAULT_VARIANT = process.env.MOCK_VARIANT || 'self';
const COOLDOWN_SEC = Number(process.env.MOCK_COOLDOWN_SEC || 0);
const SPEED = Math.max(0.1, Number(process.env.MOCK_SPEED || 1));
const DAILY_CAP = 50;
const FORCED_COOLDOWN_SEC = 30; // `mock:429`
const ALLOWED_ORIGIN = /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/;
const VARIANTS = [
  'self', 'openai', 'fallback', 'error', 'timeout', 'drop', 'internal', 'limited', 'paused',
  '400', '403', '413', '429', '502', '503',
];
const GROUPS = ['skills', 'experience', 'responsibilities', 'domain', 'extras'];

const SELF_MODEL = 'Qwen3-4B (fine-tuned)';
const OPENAI_MODEL = 'gpt-4.1-mini';

const nextAllowed = new Map(); // ip -> epoch ms
const cache = new Map(); // sha256(text|lang) -> { at, events }
let usedToday = 0;
let pausedUntil = process.env.MOCK_PAUSED === '1' ? Infinity : 0;
const isPaused = () => Date.now() < pausedUntil;

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
  const dailyLeft = Math.max(0, DAILY_CAP - usedToday);
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

// ── SSE ──────────────────────────────────────────────────────────────────────

function sse(res, event, data) {
  res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
}

async function runStream(res, { text, lang, variant, signal, jobId }) {
  const a = analyze(text, lang);
  const first = variant === 'openai' ? 'openai' : 'self';
  const model = (p) => (p === 'self' ? SELF_MODEL : OPENAI_MODEL);
  const slow = first === 'self' ? 1.6 : 1; // the personal machine is slower than OpenAI
  const events = [];
  const emit = (event, data) => { if (!signal.aborted) { sse(res, event, data); events.push([event, data]); } };
  const total = () => events.filter(([e, d]) => e === 'stage' && d.status === 'done').reduce((sum, [, d]) => sum + (d.ms || 0), 0);
  const stage = async (id, ms, extra = {}, { run, meta, onlyDone } = {}) => {
    if (!onlyDone) emit('stage', { stage: id, status: 'running', ...extra });
    const t0 = Date.now();
    if (run) await run();
    else await sleep(ms);
    emit('stage', { stage: id, status: 'done', ms: Math.round((Date.now() - t0) * SPEED), ...extra, ...(meta ? { meta } : {}) });
  };
  const fail = async (id, error, extra = {}, meta) => {
    emit('stage', { stage: id, status: 'running', ...extra });
    await sleep(jitter(1400));
    emit('stage', { stage: id, status: 'failed', ...extra, ...(meta ? { meta } : {}) });
    emit('error', error);
    return null;
  };

  await stage('accepted', 40, {}, { onlyDone: true, meta: { jobId } });
  if (variant === 'limited') {
    return fail('route', { code: 'FALLBACK_LIMITED', retryable: true, retryAfterSec: 120 }, {}, { reason: 'offline' });
  }
  emit('stage', { stage: 'route', status: 'running' });
  await sleep(jitter(350));
  emit('stage', {
    stage: 'route', status: 'done', ms: 340, provider: first, model: model(first),
    ...(first === 'openai' ? { meta: { reason: 'offline' } } : {}),
  });
  await stage('normalize', jitter(180), {}, { meta: { lang: a.textLang, chars: text.length } });
  await stage('extract', jitter(1300 * slow), { provider: first, model: model(first) },
    { meta: { title: a.title, requirements: a.requirements } });
  await stage('retrieve', jitter(420), {}, { meta: { chunks: 12 + (text.length % 9) } });

  if (variant === 'drop') {
    emit('stage', { stage: 'evaluate', status: 'running', provider: first, model: model(first) });
    await sleep(1200);
    res.destroy();
    return null;
  }
  if (variant === 'error') {
    return fail('evaluate', { code: 'LLM_UNAVAILABLE', retryable: true }, { provider: first, model: model(first) });
  }

  const evalProvider = variant === 'fallback' ? 'openai' : first;
  const evalModel = { provider: evalProvider, model: model(evalProvider) };
  const sectionsUpTo = async (n) => {
    for (const g of a.groupOrder.slice(0, n)) {
      await sleep(jitter(650 * (evalProvider === 'self' ? slow : 1)));
      emit('section', { group: g, score: a.sections[g], ...a.counts[g] });
    }
  };
  if (variant === 'internal') {
    // The gateway lost the AI service mid-stream: stage failed, then INTERNAL (quota refunded).
    emit('stage', { stage: 'evaluate', status: 'running', ...evalModel });
    await sectionsUpTo(2);
    await sleep(800);
    emit('stage', { stage: 'evaluate', status: 'failed', ...evalModel });
    emit('error', { code: 'INTERNAL', retryable: true });
    return null;
  }
  await stage('evaluate', 0, evalModel, {
    run: async () => {
      if (variant === 'fallback') await sleep(1500); // personal machine stalls, gateway switches
      await sectionsUpTo(GROUPS.length);
    },
  });
  await stage('score', jitter(90), {}, {
    onlyDone: true,
    meta: { overall: a.result.overall, tier: a.result.tier, verdicts: a.result.matched.length + a.result.gaps.length },
  });
  if (variant === 'timeout') return fail('write', { code: 'TIMEOUT', retryable: false }, evalModel);
  await stage('write', jitter(1200 * slow), evalModel);

  emit('stage', { stage: 'done', status: 'done', ms: total() });
  emit('result', { jobId, cached: false, provider: evalProvider, model: model(evalProvider), ...a.result });
  return events;
}

async function replay(res, events, signal) {
  const jobId = `job_${Date.now().toString(36)}`;
  for (const [event, data] of events) {
    if (signal.aborted) return;
    let out = data;
    if (event === 'result') out = { ...data, jobId, cached: true };
    else if (event === 'stage' && data.stage === 'accepted') out = { ...data, meta: { jobId, cached: true } };
    sse(res, event, out);
    await sleep(35);
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
    if (variant === '503' || usedToday >= DAILY_CAP) { json(res, 503, { error: 'DAILY_CAP_REACHED' }); return; }

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
        await replay(res, hit.events, ac.signal);
      } else {
        usedToday++;
        if (COOLDOWN_SEC > 0) nextAllowed.set(ip, Date.now() + COOLDOWN_SEC * 1000);
        const jobId = `job_${Date.now().toString(36)}`;
        const events = await runStream(res, { text, lang, variant, signal: ac.signal, jobId });
        if (events) cache.set(key, { at: Date.now(), events });
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
