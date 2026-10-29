import floorUrl from '../../assets/pixel/office-floor.png';
import propsUrl from '../../assets/pixel/office-props.png';
import crewUrl from '../../assets/pixel/office-crew.png';
import type { AgentId, AgentNode, OfficeLine, OfficeScenario } from '../../lib/types';

/**
 * The agents office on one canvas: a 720×400 pixel scene — a strip of wall on top (left clear for the
 * HTML title, the plan board on the right) over two identical workrooms. A team is the orchestrator on
 * its hub plus seven agents at their desks; every brief leaves the orchestrator and every result comes
 * back to it, as in ~/.claude/agents. One task runs in one git worktree with one team in workroom 1;
 * a second task gets its own worktree and its own whole team, which lights up workroom 2.
 */

export const SCENARIOS: OfficeScenario[] = ['ship', 'review', 'bug', 'parallel'];

export interface OfficeText {
  nodes: AgentNode[];
  lines: Record<OfficeLine, string>;
  board: string[];
  rooms: string[];
  roomIdle: string;
  prompts: { single: string; parallel: string };
  worktrees: string[];
  shipped: { one: string; many: string; sub: string; subMany: string };
}

export interface OfficeHooks {
  getText: () => OfficeText;
  /** The prompt as typed so far. */
  onType: (typed: string) => void;
  /** Latest thing said: who ('you' = the visitor), what, and in which worktree. */
  onLine: (who: AgentId | 'you' | null, line: OfficeLine | null, lane: string | null) => void;
  onScenario: (id: OfficeScenario | null) => void;
}

export interface Office {
  play: (id: OfficeScenario) => void;
  setVisible: (v: boolean) => void;
  setReduced: (r: boolean) => void;
  resize: () => void;
  pointer: (x: number | null, y?: number) => void;
  /** Re-emits the typed prompt and status line, e.g. after a language switch. */
  sync: () => void;
  destroy: () => void;
}

const W = 720;
const H = 400;
/** Height of the wall strip above the floor. */
const WALL = 136;
/** Width of one workroom; team t works in the room starting at x = t × ROOM_W. */
const ROOM_W = 360;
const ORDER: AgentId[] = ['orch', 'memory', 'ba', 'figma', 'dev', 'review', 'qa', 'ship'];
const ORCH = 0;
/** The prompt box above the canvas. */
const TOP = -1;
/** The orchestrator's feet, room-relative. */
const HUB = { x: 180, y: 372 };
/** Desk centre x (room-relative) and desk top y per agent (index 1–7), as baked into office-props.png. */
const DESKS: Record<number, [number, number]> = {
  1: [44, 170], 2: [112, 170], 3: [180, 170], 4: [248, 170], 5: [316, 170], 6: [56, 282], 7: [304, 282],
};
/** Room-relative x of an agent, its sprite top, and where it holds a card. */
const rx = (i: number) => (i === ORCH || i === TOP ? HUB.x : DESKS[i][0]);
const bodyTop = (i: number) => (i === ORCH ? HUB.y - 62 : DESKS[i][1] + 20);
const hand = (i: number): [number, number] => (i === TOP ? [HUB.x, WALL - 30] : [rx(i), bodyTop(i) + 36]);
/** Narrower than this (CSS px), the two workrooms stack instead of sitting side by side. */
const STACK_BELOW = 600;
/** Band between stacked rooms that carries workroom 2's name. */
const GAP = 22;
/** Everything that moves runs this much slower than the raw script timings. */
const PACE = 1.35;
const INK = '#141413';
const IVORY = '#FAF9F5';
const CLAY = '#D97757';
const OLIVE = '#788C5D';
const RED = '#C0453A';
/** One colour per worktree team. */
const LANES = [CLAY, '#5B7FB8'];
const BOARD_X = W - 220;
const SANS = '"Hanken Grotesk", system-ui, sans-serif';
const MONO = '"JetBrains Mono", ui-monospace, monospace';
/** Forces the next status emit, even when it is empty. */
const STALE = '?';

// ── Scripts ─────────────────────────────────────────────────────────────────────

interface Job { who: AgentId; line: OfficeLine; row?: number; fail?: boolean; fast?: boolean; }

const RECALL: Job = { who: 'memory', line: 'recall', row: 0 };
const RECORD: Job = { who: 'memory', line: 'record', row: 7 };
const HEAD: Job[] = [RECALL, { who: 'ba', line: 'ba', row: 1 }, { who: 'figma', line: 'figma', row: 2 }, { who: 'dev', line: 'dev', row: 3 }];
const TAIL: Job[] = [{ who: 'ship', line: 'ship', row: 6 }, RECORD];
const fast = (j: Job): Job => ({ ...j, fast: true });

/** Failure scenarios fast-forward the shared start so the interesting part comes quickly. */
const SCRIPTS: Record<Exclude<OfficeScenario, 'parallel'>, Job[]> = {
  ship: [...HEAD, { who: 'review', line: 'reviewOk', row: 4 }, { who: 'qa', line: 'qaOk', row: 5 }, ...TAIL],
  review: [
    ...HEAD.map(fast),
    { who: 'review', line: 'reviewFail', row: 4, fail: true },
    { who: 'orch', line: 'fix', row: 3 },
    { who: 'dev', line: 'devFix', row: 3 },
    { who: 'review', line: 'rereview', row: 4 },
    { who: 'qa', line: 'qaOk', row: 5 },
    ...TAIL,
  ],
  bug: [
    ...HEAD.map(fast),
    { who: 'review', line: 'reviewOk', row: 4, fast: true },
    { who: 'qa', line: 'qaFail', row: 5, fail: true },
    { who: 'orch', line: 'fix', row: 3 },
    { who: 'dev', line: 'devFix', row: 3 },
    { who: 'review', line: 'rereview', row: 4 },
    { who: 'qa', line: 'retest', row: 5 },
    ...TAIL,
  ],
};

/** One whole team per worktree, all running at once. */
const TEAM_SCRIPTS: Job[][] = [
  [RECALL, { who: 'ba', line: 'ba', row: 1 }, { who: 'figma', line: 'figma', row: 2 }, { who: 'dev', line: 'dev', row: 3 }, { who: 'review', line: 'reviewOk', row: 4 }, { who: 'qa', line: 'qaOk', row: 5 }, ...TAIL],
  [RECALL, { who: 'dev', line: 'devFix', row: 3 }, { who: 'review', line: 'reviewOk', row: 4 }, { who: 'qa', line: 'qaOk', row: 5 }, ...TAIL],
];

const WORK: Record<AgentId, number> = { orch: 1300, memory: 1100, ba: 1300, figma: 1500, dev: 1700, review: 1400, qa: 1700, ship: 1200 };

type Card = 'brief' | 'ok' | 'fail';
type RowState = 'idle' | 'active' | 'done' | 'fail';
interface Seg {
  k: 'type' | 'fly' | 'work' | 'banner' | 'hold'; t0: number; t1: number; who: number; to: number;
  card?: Card; line?: OfficeLine; fail?: boolean;
}
interface Timeline { segs: Seg[]; rows: [number, number, RowState][]; end: number; }

/** One team's run: typed prompt → orchestrator → each job out and back → result up to the prompt. */
function build(jobs: Job[], typeMs: number, plan: OfficeLine, start: number, quick: boolean): Timeline {
  const segs: Seg[] = [];
  const rows: Timeline['rows'] = [];
  const at = (s: Omit<Seg, 't0' | 't1'>, t0: number, dur: number) => { segs.push({ ...s, t0, t1: t0 + dur }); return t0 + dur; };
  const dispatch = (job: Job, t0: number) => {
    const w = ORDER.indexOf(job.who);
    const f = (job.fast ? 0.45 : 1) * PACE;
    if (job.row !== undefined) rows.push([t0, job.row, 'active']);
    if (w === ORCH) return at({ k: 'work', who: ORCH, to: ORCH, line: job.line }, t0, WORK.orch * f);
    let t = at({ k: 'fly', who: ORCH, to: w, card: 'brief' }, t0, 620 * f);
    t = at({ k: 'work', who: w, to: w, line: job.line, fail: job.fail }, t, WORK[job.who] * f);
    if (job.row !== undefined) rows.push([t, job.row, job.fail ? 'fail' : 'done']);
    return at({ k: 'fly', who: w, to: ORCH, card: job.fail ? 'fail' : 'ok' }, t, 540 * f);
  };
  let t = at({ k: 'type', who: TOP, to: TOP }, 0, typeMs);
  t = at({ k: 'fly', who: TOP, to: ORCH, card: 'brief', line: start === 0 ? 'sent' : undefined }, t + start, 800 * PACE);
  t = at({ k: 'work', who: ORCH, to: ORCH, line: plan }, t, (quick ? 900 : 1400) * PACE);
  for (const job of jobs) t = dispatch(job, t);
  t = at({ k: 'fly', who: ORCH, to: TOP, card: 'ok' }, t, 900 * PACE);
  t = at({ k: 'banner', who: ORCH, to: ORCH, line: 'done' }, t, 3200);
  segs.sort((a, b) => a.t0 - b.t0);
  return { segs, rows, end: t };
}

interface Run { id: OfficeScenario; teams: Timeline[]; end: number; }

function buildRun(id: OfficeScenario, text: OfficeText): Run {
  if (id === 'parallel') {
    const typeMs = text.prompts.parallel.length * 26 + 300;
    const teams = TEAM_SCRIPTS.map((jobs, l) => build(jobs, typeMs, l === 0 ? 'planTeams' : 'plan', l * 450, false));
    const end = Math.max(...teams.map((tm) => tm.end)) + 600;
    // Each team holds its banner until the slowest one is done.
    for (const tm of teams) { const last = tm.segs[tm.segs.length - 1]; last.t1 = end; tm.end = end; }
    return { id, teams, end };
  }
  const quick = id === 'review' || id === 'bug';
  const tm = build(SCRIPTS[id], text.prompts.single.length * (quick ? 16 : 26) + 300, 'plan', 0, quick);
  tm.segs.push({ k: 'hold', who: ORCH, to: ORCH, t0: tm.end, t1: tm.end + 500 });
  tm.end += 500;
  return { id, teams: [tm], end: tm.end };
}

// ── Drawing helpers ─────────────────────────────────────────────────────────────

const ease = (p: number) => (p < 0.5 ? 4 * p * p * p : 1 - (-2 * p + 2) ** 3 / 2);
const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
/** Cheap deterministic noise for code-line widths. */
const hash = (n: number) => { const s = Math.sin(n * 127.1) * 43758.5453; return s - Math.floor(s); };

function rect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, c: string) {
  ctx.fillStyle = c;
  ctx.fillRect(Math.round(x), Math.round(y), w, h);
}

/** The right-hand monitor of an agent's desk (room-relative), where its work shows. */
function screenOf(i: number) {
  const [x, y] = DESKS[i];
  return { x: x + 5, y: y - ((i - 1) % 2 ? 19 : 21), w: 22, h: 10 };
}

function drawScreen(ctx: CanvasRenderingContext2D, i: number, p: number, now: number, fail: boolean) {
  if (i < 1) return;
  const s = screenOf(i);
  const tick = Math.floor(now / 160);
  ctx.save();
  ctx.beginPath();
  ctx.rect(s.x, s.y, s.w, s.h);
  ctx.clip();
  const lines = (bg: string, colors: string[], scroll: number) => {
    rect(ctx, s.x, s.y, s.w, s.h, bg);
    for (let r = 0; r < 4; r++) {
      const n = r + scroll;
      rect(ctx, s.x + 2 + (n % 3 === 1 ? 3 : 0), s.y + 1 + r * 2.5, 4 + Math.floor(hash(n) * 12), 1, colors[n % colors.length]);
    }
  };
  switch (ORDER[i]) {
    case 'memory':
      lines('#F0EEE6', ['#5E5D59', '#A3492B'], tick % 8);
      break;
    case 'ba':
      rect(ctx, s.x, s.y, s.w, s.h, '#FFFFFF');
      for (let r = 0; r < 4; r++) {
        rect(ctx, s.x + 2, s.y + 1 + r * 2.4, 1.5, 1.5, p * 4.4 > r + 0.4 ? OLIVE : '#C2C0B6');
        rect(ctx, s.x + 5, s.y + 1.4 + r * 2.4, 6 + Math.floor(hash(r + 3) * 10), 1, '#3D3D3A');
      }
      break;
    case 'figma': {
      rect(ctx, s.x, s.y, s.w, s.h, '#2C2C2C');
      const frames: [number, number, number, number, string][] = [
        [2, 1, 6, 8, '#F24E1E'], [9, 1, 5, 4, '#A259FF'], [9, 6, 5, 3, '#1ABCFE'], [15, 1, 5, 8, '#0ACF83'],
      ];
      frames.forEach(([x, y, w, h, c], k) => { if (p * 5 > k + 0.3) rect(ctx, s.x + x, s.y + y, w, h, c); });
      if (tick % 4 < 2) rect(ctx, s.x + 2 + ((tick * 3) % 18), s.y + 8, 1, 1, '#FFFFFF');
      break;
    }
    case 'dev':
      lines('#141413', [CLAY, '#BCD1CA', '#E8E6DC', '#CBCADB'], tick);
      break;
    case 'review':
      rect(ctx, s.x, s.y, s.w, s.h, '#FFFFFF');
      for (let r = 0; r < 4; r++) {
        const n = r + (tick % 6);
        rect(ctx, s.x, s.y + r * 2.5, s.w, 2, n % 3 === 0 ? '#F4CFC7' : n % 3 === 1 ? '#D6E6C8' : '#FFFFFF');
        rect(ctx, s.x + 2, s.y + 0.6 + r * 2.5, 5 + Math.floor(hash(n) * 11), 1, '#3D3D3A');
      }
      break;
    case 'qa':
      rect(ctx, s.x, s.y, s.w, s.h, '#F0EEE6');
      rect(ctx, s.x + 2, s.y + 1, 11, 6, '#FFFFFF');
      rect(ctx, s.x + 15, s.y + 1, 4, 7, '#FFFFFF');
      rect(ctx, s.x + 2, s.y + 8, Math.round(17 * Math.min(1, p * 1.3)), 1, fail && p > 0.4 ? RED : OLIVE);
      if (fail && p > 0.35) {
        const bx = s.x + 3 + ((tick * 2) % 14);
        rect(ctx, bx, s.y + 3, 3, 2, INK);
        rect(ctx, bx - 1, s.y + 2 + (tick % 2), 1, 1, INK);
        rect(ctx, bx + 3, s.y + 2 + ((tick + 1) % 2), 1, 1, INK);
      }
      break;
    case 'ship':
      rect(ctx, s.x, s.y, s.w, s.h, '#FFFFFF');
      for (let r = 0; r < 3; r++) rect(ctx, s.x + 3, s.y + 2 + r * 2.5, Math.round(14 * clamp(p * 3 - r, 0, 1)), 1, '#5E5D59');
      if (p > 0.75) rect(ctx, s.x + 15, s.y + 6, 4, 3, OLIVE);
      break;
    default:
      break;
  }
  // A failing review or test flashes the monitor red.
  if (fail && p > 0.55 && tick % 2 === 0) { ctx.fillStyle = 'rgba(192, 69, 58, 0.35)'; ctx.fillRect(s.x, s.y, s.w, s.h); }
  ctx.restore();
}

/** The wall screen: the plan for one team, or one progress bar per worktree team. */
function drawBoard(ctx: CanvasRenderingContext2D, x: number, title: string, draw: (bx: number, by: number) => void) {
  const y = 12;
  const w = 208;
  const h = 78;
  rect(ctx, x, y, w, h, '#3D3D3A');
  rect(ctx, x + 2, y + 2, w - 4, h - 4, '#FFFFFF');
  rect(ctx, x + 2, y + 2, w - 4, 12, '#F0EEE6');
  rect(ctx, x + w / 2 - 14, y + h, 28, 4, '#3D3D3A');
  ctx.font = `600 7px ${MONO}`;
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#5E5D59';
  ctx.fillText(title, x + 8, y + 8.5);
  draw(x + 8, y + 20);
}

function planRows(ctx: CanvasRenderingContext2D, bx: number, by: number, labels: string[], states: RowState[], now: number) {
  ctx.font = `500 8px ${SANS}`;
  labels.slice(0, 8).forEach((label, r) => {
    const x = bx + (r < 4 ? 0 : 98);
    const y = by + (r % 4) * 13.5;
    const st = states[r] ?? 'idle';
    if (st === 'idle') { ctx.strokeStyle = '#B0AEA5'; ctx.lineWidth = 1; ctx.strokeRect(x + 0.5, y + 0.5, 7, 7); }
    else {
      ctx.globalAlpha = st === 'active' ? 0.55 + 0.45 * Math.sin(now / 180) : 1;
      rect(ctx, x, y, 8, 8, st === 'active' ? CLAY : st === 'done' ? OLIVE : RED);
      ctx.globalAlpha = 1;
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      if (st === 'done') { ctx.moveTo(x + 2, y + 4.2); ctx.lineTo(x + 3.6, y + 5.8); ctx.lineTo(x + 6.2, y + 2.4); }
      if (st === 'fail') { ctx.moveTo(x + 2.2, y + 2.2); ctx.lineTo(x + 5.8, y + 5.8); ctx.moveTo(x + 5.8, y + 2.2); ctx.lineTo(x + 2.2, y + 5.8); }
      ctx.stroke();
    }
    ctx.fillStyle = st === 'idle' ? '#87867F' : INK;
    ctx.fillText(label, x + 13, y + 4.4);
  });
}

function worktreeRows(ctx: CanvasRenderingContext2D, bx: number, by: number, names: string[], progress: number[]) {
  names.slice(0, progress.length).forEach((name, l) => {
    const y = by + 4 + l * 22;
    rect(ctx, bx, y, 7, 7, LANES[l]);
    ctx.font = `600 7.5px ${MONO}`;
    ctx.fillStyle = INK;
    ctx.fillText(name, bx + 12, y + 4);
    rect(ctx, bx + 96, y + 1.5, 92, 4, '#E8E6DC');
    rect(ctx, bx + 96, y + 1.5, Math.round(92 * clamp(progress[l] ?? 0, 0, 1)), 4, LANES[l]);
  });
}

function drawCard(ctx: CanvasRenderingContext2D, x: number, y: number, card: Card, color: string, tilt: number) {
  ctx.save();
  ctx.translate(Math.round(x), Math.round(y));
  ctx.rotate(tilt);
  rect(ctx, -4, -5, 8, 10, INK);
  rect(ctx, -3, -4, 6, 8, '#FFFFFF');
  if (card === 'brief') { rect(ctx, -3, -4, 6, 2, color); rect(ctx, -2, -1, 4, 1, '#B0AEA5'); rect(ctx, -2, 1, 3, 1, '#B0AEA5'); }
  else { rect(ctx, -2, -1, 4, 4, card === 'ok' ? OLIVE : RED); rect(ctx, -2, -3, 4, 1, color); }
  ctx.restore();
}

/** Dark speech bubble with a pointer, anchored at (x, y) in CSS pixels; clamped to [minX, maxX]. */
function drawBubble(ctx: CanvasRenderingContext2D, x: number, y: number, minX: number, maxX: number, num: string, title: string, body: string) {
  ctx.font = `600 13px ${SANS}`;
  const titleW = ctx.measureText(title).width;
  ctx.font = `11px ${MONO}`;
  const numW = ctx.measureText(num).width + 6;
  ctx.font = `12.5px ${SANS}`;
  const bodyW = ctx.measureText(body).width;
  const w = Math.ceil(Math.max(numW + titleW, bodyW) + 22);
  const h = 44;
  const left = clamp(x - w / 2, minX + 6, maxX - w - 6);
  const top = Math.max(4, y - h - 8);
  ctx.save();
  ctx.shadowColor = 'rgba(20, 20, 19, 0.35)';
  ctx.shadowBlur = 14;
  ctx.shadowOffsetY = 6;
  ctx.fillStyle = INK;
  ctx.beginPath();
  ctx.roundRect(left, top, w, h, 10);
  ctx.fill();
  ctx.restore();
  ctx.fillStyle = INK;
  ctx.beginPath();
  const px = clamp(x, left + 12, left + w - 12);
  ctx.moveTo(px - 6, top + h - 0.5);
  ctx.lineTo(px + 6, top + h - 0.5);
  ctx.lineTo(px, top + h + 6);
  ctx.fill();
  ctx.textBaseline = 'alphabetic';
  ctx.font = `11px ${MONO}`;
  ctx.fillStyle = '#E58A6B';
  ctx.fillText(num, left + 11, top + 18);
  ctx.font = `600 13px ${SANS}`;
  ctx.fillStyle = IVORY;
  ctx.fillText(title, left + 11 + numW, top + 18);
  ctx.font = `12.5px ${SANS}`;
  ctx.fillStyle = '#C2C0B6';
  ctx.fillText(body, left + 11, top + 35);
}

/** A rounded label in CSS pixels: worktree flags, room names, team headers. */
function drawPill(ctx: CanvasRenderingContext2D, x: number, y: number, text: string, bg: string, fg: string, font: string) {
  ctx.font = font;
  const w = ctx.measureText(text).width + 16;
  ctx.fillStyle = bg;
  ctx.beginPath();
  ctx.roundRect(x - w / 2, y - 10, w, 20, 10);
  ctx.fill();
  ctx.fillStyle = fg;
  ctx.textBaseline = 'middle';
  ctx.fillText(text, x - w / 2 + 8, y + 0.5);
}

function drawBanner(ctx: CanvasRenderingContext2D, cx: number, cy: number, p: number, title: string, sub: string, small: boolean) {
  const s = ease(clamp(p / 0.18, 0, 1));
  const tf = `600 ${small ? 14 : 18}px ${SANS}`;
  ctx.font = tf;
  const tw = ctx.measureText(title).width;
  ctx.font = `13px ${SANS}`;
  const sw = sub ? ctx.measureText(sub).width : 0;
  const r = small ? 10 : 13;
  const w = Math.max(tw + r * 2 + 14, sw) + (small ? 24 : 40);
  const h = sub ? 64 : 40;
  const ty = sub ? -9 : 0;
  ctx.save();
  ctx.globalAlpha = s;
  ctx.translate(cx, cy + (1 - s) * 14);
  ctx.scale(0.92 + 0.08 * s, 0.92 + 0.08 * s);
  ctx.shadowColor = 'rgba(20, 20, 19, 0.4)';
  ctx.shadowBlur = 24;
  ctx.shadowOffsetY = 10;
  ctx.fillStyle = INK;
  ctx.beginPath();
  ctx.roundRect(-w / 2, -h / 2, w, h, 14);
  ctx.fill();
  ctx.shadowColor = 'transparent';
  const left = -w / 2 + (small ? 12 : 20);
  ctx.fillStyle = OLIVE;
  ctx.beginPath();
  ctx.arc(left + r, ty, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#FFFFFF';
  ctx.lineWidth = small ? 2 : 2.4;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.beginPath();
  ctx.moveTo(left + r * 0.45, ty);
  ctx.lineTo(left + r * 0.9, ty + r * 0.4);
  ctx.lineTo(left + r * 1.5, ty - r * 0.42);
  ctx.stroke();
  ctx.textBaseline = 'middle';
  ctx.font = tf;
  ctx.fillStyle = IVORY;
  ctx.fillText(title, left + r * 2 + 8, ty);
  if (sub) {
    ctx.font = `13px ${SANS}`;
    ctx.fillStyle = '#C2C0B6';
    ctx.fillText(sub, -w / 2 + 20, 17);
  }
  ctx.restore();
}

interface Bit { x: number; y: number; vx: number; vy: number; c: string; }
const CONFETTI = [CLAY, OLIVE, '#5B7FB8', '#EBC9B7', '#CBCADB', INK];

// ── Office ──────────────────────────────────────────────────────────────────────

export function createOffice(canvas: HTMLCanvasElement, hooks: OfficeHooks): Office {
  const ctx = canvas.getContext('2d');
  const floor = new Image();
  const props = new Image();
  const crew = new Image();
  floor.src = floorUrl;
  props.src = propsUrl;
  crew.src = crewUrl;

  let visible = false;
  let reduced = false;
  let started = false;
  let auto = true;
  let finished = false;
  let run: Run | null = null;
  let clock = 0;
  let raf = 0;
  let last = 0;
  let scale = 2;
  let dpr = 1;
  let cssW = 0;
  let stacked = false;
  let hover: { team: number; i: number } | null = null;
  let typed = STALE;
  let lineKey = STALE;
  let bits: Bit[] = [];
  let burst = -1;

  const parallel = () => run?.id === 'parallel';
  const promptOf = () => (parallel() ? hooks.getText().prompts.parallel : hooks.getText().prompts.single);
  /** Where a room's top-left corner lands: side by side on wide canvases, one under the other on phones. */
  const ox = (team: number) => (stacked ? 0 : team * ROOM_W);
  const oy = (team: number) => (stacked ? team * (H - WALL + GAP) : 0);
  const ax = (i: number, team: number) => ox(team) + rx(i);
  const sceneW = () => (stacked ? ROOM_W : W);
  const sceneH = () => (stacked ? H + GAP + (H - WALL) : H);

  function resize() {
    cssW = canvas.parentElement?.clientWidth ?? canvas.clientWidth;
    if (!cssW) return;
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    stacked = cssW < STACK_BELOW;
    scale = cssW / sceneW();
    const cssH = Math.round(sceneH() * scale);
    canvas.style.height = `${cssH}px`;
    canvas.parentElement?.style.setProperty('--office-wall', `${Math.round(WALL * scale)}px`);
    canvas.width = Math.round(cssW * dpr);
    canvas.height = Math.round(cssH * dpr);
    draw(performance.now());
  }

  function play(id: OfficeScenario, byUser = true) {
    if (byUser) auto = false;
    started = true;
    run = buildRun(id, hooks.getText());
    clock = 0;
    finished = false;
    typed = STALE;
    lineKey = STALE;
    bits = [];
    burst = -1;
    hooks.onScenario(id);
    loop();
  }

  const activeAt = (tm: Timeline, t: number) => tm.segs.filter((s) => t >= s.t0 && t < s.t1);

  function rowStates(tm: Timeline, t: number): RowState[] {
    const out: RowState[] = Array(8).fill('idle');
    for (const [at, r, st] of tm.rows) if (at <= t) out[r] = st;
    return out;
  }

  function progress(tm: Timeline, t: number) {
    const works = tm.segs.filter((s) => s.k === 'work' && s.who !== ORCH);
    return works.length ? works.filter((s) => s.t1 <= t).length / works.length : 0;
  }

  function emit() {
    if (!run) return;
    const prompt = promptOf();
    const typeSeg = run.teams[0].segs[0];
    const n = clock < typeSeg.t1 ? Math.floor(prompt.length * clamp(clock / (typeSeg.t1 - 300), 0, 1)) : prompt.length;
    const shown = prompt.slice(0, n);
    if (shown !== typed) { typed = shown; hooks.onType(shown); }
    // The status line follows whoever spoke last, in either room.
    let pick: { s: Seg; team: number } | null = null;
    run.teams.forEach((tm, team) => {
      for (const s of tm.segs) {
        if (s.t0 > clock) break;
        if (s.line && (!pick || s.t0 >= pick.s.t0)) pick = { s, team };
      }
    });
    const said = pick as { s: Seg; team: number } | null;
    const key = said ? `${said.team}:${said.s.who}:${said.s.line}` : '';
    if (key !== lineKey) {
      lineKey = key;
      const lane = said && parallel() ? hooks.getText().worktrees[said.team] ?? null : null;
      hooks.onLine(said ? (said.s.who === TOP ? 'you' : ORDER[said.s.who]) : null, said?.s.line ?? null, lane);
    }
  }

  /** Floor-level layers for one room's team: spokes, hub rug, then (after props) screens, people, cards. */
  function drawTeamFloor(tm: Timeline, team: number, now: number) {
    if (!ctx) return;
    const active = activeAt(tm, clock);
    const flies = active.filter((s) => s.k === 'fly');
    const works = active.filter((s) => s.k === 'work');
    const color = parallel() ? LANES[team % LANES.length] : CLAY;
    const hubX = rx(ORCH);
    ctx.save();
    ctx.translate(ox(team), oy(team));
    ORDER.forEach((_, i) => {
      if (i === ORCH) return;
      const fly = flies.find((s) => (s.who === i || s.to === i) && s.who !== TOP && s.to !== TOP);
      const [fx, fy] = [rx(i), bodyTop(i) + 62];
      const steps = Math.floor(Math.hypot(fx - hubX, fy - HUB.y) / 5);
      ctx.fillStyle = fly ? color : 'rgba(150, 136, 115, 0.45)';
      for (let d = 2; d < steps - 1; d++) {
        const f = d / steps;
        ctx.fillRect(Math.round(hubX + (fx - hubX) * f), Math.round(HUB.y - 2 + (fy - HUB.y + 2) * f), fly ? 2 : 1, fly ? 2 : 1);
      }
    });
    const busy = works.some((s) => s.who === ORCH) || flies.some((s) => s.who === ORCH || s.to === ORCH);
    ctx.fillStyle = '#E9DDCB';
    ctx.beginPath();
    ctx.ellipse(hubX, HUB.y - 1, 42, 12, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = busy ? `rgba(217, 119, 87, ${0.55 + 0.35 * Math.sin(now / 200)})` : 'rgba(217, 119, 87, 0.45)';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.restore();
  }

  function drawTeamPeople(tm: Timeline, team: number, now: number) {
    if (!ctx) return;
    const active = activeAt(tm, clock);
    const prog = (s: Seg) => clamp((clock - s.t0) / (s.t1 - s.t0), 0, 1);
    const works = active.filter((s) => s.k === 'work');
    const flies = active.filter((s) => s.k === 'fly');
    const frameT = reduced ? 0 : now;
    const multi = parallel();
    const color = multi ? LANES[team % LANES.length] : CLAY;

    ctx.save();
    ctx.translate(ox(team), oy(team));
    for (const s of works) drawScreen(ctx, s.who, prog(s), frameT, !!s.fail);

    for (const s of works) {
      if (s.who === ORCH) continue;
      const g = ctx.createRadialGradient(rx(s.who), bodyTop(s.who) + 62, 1, rx(s.who), bodyTop(s.who) + 62, 22);
      g.addColorStop(0, multi ? `${color}99` : 'rgba(217, 119, 87, 0.5)');
      g.addColorStop(1, 'rgba(217, 119, 87, 0)');
      ctx.fillStyle = g;
      ctx.fillRect(rx(s.who) - 24, bodyTop(s.who) + 54, 48, 16);
    }

    if (crew.complete && crew.naturalWidth) {
      const f6 = Math.floor(frameT / 170) % 6;
      const order = ORDER.map((_, i) => i).sort((a, b) => bodyTop(a) - bodyTop(b));
      for (const i of order) {
        let row = i;
        let col = f6;
        const work = works.find((s) => s.who === i);
        if (i === ORCH) {
          const out = flies.find((s) => s.who === ORCH && s.card === 'brief' && s.to !== TOP);
          const back = flies.find((s) => s.to === ORCH && s.who !== TOP);
          if (out) { row = 8; col = 3 + f6; }
          else if (work || flies.some((s) => s.to === TOP || s.who === TOP)) col = 6 + f6;
          else if (back) col = (rx(back.who) < HUB.x - 20 ? 18 : rx(back.who) > HUB.x + 20 ? 12 : 6) + f6;
        } else if (work) {
          if (ORDER[i] === 'memory') { row = 9; col = f6; } else col = 6 + f6;
        }
        ctx.drawImage(crew, col * 32, row * 64, 32, 64, rx(i) - 16, bodyTop(i), 32, 64);
      }
    }

    if (!reduced) {
      for (const s of flies) {
        if (!s.card) continue;
        const e = ease(prog(s));
        const [xa, y0] = hand(s.who);
        const [xb, y1] = hand(s.to);
        const arc = s.who === TOP || s.to === TOP ? 0 : 14 + Math.abs(xb - xa) * 0.06;
        drawCard(ctx, xa + (xb - xa) * e, y0 + (y1 - y0) * e - arc * 4 * e * (1 - e), s.card, color, (e - 0.5) * 0.6 * Math.sign(xb - xa || 1));
      }
    }
    ctx.restore();
  }

  /** Text for one team in CSS pixels: plates, the speaker's bubble or a hover tooltip. */
  function drawTeamLabels(tm: Timeline | null, team: number, text: OfficeText) {
    if (!ctx) return;
    const active = tm ? activeAt(tm, clock) : [];
    const works = active.filter((s) => s.k === 'work');
    const flies = active.filter((s) => s.k === 'fly');
    const banner = active.find((s) => s.k === 'banner') ?? (finished && tm ? tm.segs.find((s) => s.k === 'banner') : undefined);
    const multi = parallel();
    const color = multi ? LANES[team % LANES.length] : CLAY;
    const toX = (lx: number) => lx * scale;
    const y0 = oy(team);
    ctx.font = `11px ${MONO}`;
    ctx.textBaseline = 'middle';
    const fits = (f: (i: number) => string) => ORDER.every((_, i) => ctx.measureText(f(i)).width + 26 < 68 * scale);
    const num = (i: number) => String(i + 1).padStart(2, '0');
    const full = (i: number) => `${num(i)} · ${text.nodes[i]?.label ?? ''}`;
    const name = (i: number) => text.nodes[i]?.label ?? '';
    const roomy = fits(full);
    const plate = roomy ? full : fits(name) ? name : num;
    const lit = new Set<number>([...works.map((s) => s.who), ...flies.map((s) => s.to)]);
    ORDER.forEach((_, i) => {
      const on = lit.has(i);
      ctx.font = `11px ${MONO}`;
      // When plates are tight the speaker's bubble already carries the name.
      const label = on && roomy ? full(i) : plate(i);
      const w = ctx.measureText(label).width + 16;
      const x = clamp(toX(ax(i, team)) - w / 2, 2, cssW - w - 2);
      const y = (y0 + bodyTop(i) + 64) * scale;
      ctx.fillStyle = on ? (multi ? color : INK) : 'rgba(250, 249, 245, 0.92)';
      ctx.beginPath();
      ctx.roundRect(x, y, w, 20, 10);
      ctx.fill();
      if (!on) { ctx.strokeStyle = 'rgba(31, 30, 29, 0.14)'; ctx.lineWidth = 1; ctx.stroke(); }
      ctx.fillStyle = on ? IVORY : '#3D3D3A';
      ctx.fillText(label, x + 8, y + 10.5);
    });
    // The working agent says what it is doing; hovering any agent shows its job instead.
    const speaker = works[works.length - 1];
    const hovered = hover && hover.team === team ? hover.i : null;
    const tipFor = hovered ?? speaker?.who ?? null;
    if (tipFor !== null && !banner) {
      const node = text.nodes[tipFor];
      const body = tipFor === speaker?.who && speaker.line ? text.lines[speaker.line] : node?.sub ?? '';
      drawBubble(ctx, toX(ax(tipFor, team)), (y0 + bodyTop(tipFor) + 18) * scale, 0, cssW, num(tipFor), node?.label ?? '', body);
    }
  }

  function draw(now: number) {
    if (!ctx) return;
    const text = hooks.getText();
    const teams = run?.teams ?? [];
    const multi = parallel();

    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const k = scale * dpr;

    // The wall strip: the plan board on the right, or pinned to the left edge when the canvas is narrow.
    ctx.setTransform(k, 0, 0, k, 0, 0);
    ctx.imageSmoothingEnabled = false;
    const bx = stacked ? 8 : BOARD_X;
    if (multi && run) drawBoard(ctx, bx, `GIT WORKTREES · ${run.teams.length} TEAMS`, (x, y) => worktreeRows(ctx, x, y, text.worktrees, run!.teams.map((tm) => progress(tm, clock))));
    else drawBoard(ctx, bx, 'AIDLC PLAN', (x, y) => planRows(ctx, x, y, text.board, run ? rowStates(run.teams[0], clock) : [], now));

    ctx.setTransform(k, 0, 0, k, 0, 0);
    // On phones workroom 2 is cut from the right half of each layer and drawn under workroom 1.
    const layer = (img: HTMLImageElement) => {
      if (!img.complete || !img.naturalWidth) return;
      if (!stacked) { ctx.drawImage(img, 0, 0); return; }
      ctx.drawImage(img, 0, 0, ROOM_W, H, 0, 0, ROOM_W, H);
      ctx.drawImage(img, ROOM_W, WALL, ROOM_W, H - WALL, 0, H + GAP, ROOM_W, H - WALL);
    };
    layer(floor);
    teams.forEach((tm, team) => drawTeamFloor(tm, team, now));
    if (!teams.length) drawTeamFloor({ segs: [], rows: [], end: 0 }, 0, now);
    layer(props);
    teams.forEach((tm, team) => drawTeamPeople(tm, team, now));
    if (!teams.length) drawTeamPeople({ segs: [], rows: [], end: 0 }, 0, now);

    // Workroom 2 sits dark until a second worktree brings its own team.
    if (teams.length < 2) {
      ctx.fillStyle = 'rgba(31, 30, 29, 0.38)';
      ctx.fillRect(ox(1) + (stacked ? 0 : 3), oy(1) + WALL, ROOM_W - (stacked ? 0 : 3), H - WALL);
    }

    // Confetti from each shipping team's hub.
    teams.forEach((tm, team) => {
      const banner = activeAt(tm, clock).find((s) => s.k === 'banner');
      if (!banner || finished || reduced) return;
      if (team === 0 && burst !== banner.t0) {
        burst = banner.t0;
        bits = Array.from({ length: 70 }, (_, n) => {
          const a = -Math.PI / 2 + (hash(n) - 0.5) * 2.4;
          const v = 70 + hash(n + 9) * 110;
          return { x: HUB.x, y: HUB.y - 40, vx: Math.cos(a) * v, vy: Math.sin(a) * v, c: CONFETTI[n % CONFETTI.length] };
        });
      }
      for (const b of bits) rect(ctx, ox(team) + b.x, oy(team) + b.y, 2, 2, b.c);
    });
    if (bits.length && !reduced) for (const b of bits) { b.vy += 160 / 60; b.x += b.vx / 60; b.y += b.vy / 60; }

    // Screen-space pass: room names, the idle room's sign, plates and bubbles.
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const toX = (lx: number) => lx * scale;
    [0, 1].forEach((room) => {
      const wt = teams[room] ? text.worktrees[room] : null;
      const label = `${(text.rooms[room] ?? '').toUpperCase()}${wt ? ` · ${wt}` : ''}`;
      ctx.font = `600 10.5px ${MONO}`;
      ctx.textBaseline = 'alphabetic';
      ctx.fillStyle = teams[room] && multi ? LANES[room] : 'rgba(61, 61, 58, 0.6)';
      // Wide: bottom-left of each room. Stacked: in the band just above each room, clear of the plates.
      const ly = stacked ? (room === 0 ? WALL - 8 : H + GAP - 7) : H - 7;
      ctx.fillText(label, toX(ox(room) + 10), ly * scale);
    });
    if (teams.length < 2) drawPill(ctx, toX(ox(1) + ROOM_W / 2), (oy(1) + (WALL + H) / 2) * scale, text.roomIdle, 'rgba(20, 20, 19, 0.82)', IVORY, `500 ${stacked ? 11 : 12}px ${SANS}`);
    if (teams.length) teams.forEach((tm, team) => drawTeamLabels(tm, team, text));
    else drawTeamLabels(null, 0, text);

    // Each team's banner sits over its own room once it ships.
    teams.forEach((tm, team) => {
      const banner = activeAt(tm, clock).find((s) => s.k === 'banner') ?? (finished ? tm.segs.find((s) => s.k === 'banner') : undefined);
      if (!banner) return;
      const p = finished ? 1 : clamp((clock - banner.t0) / 3000, 0, 1);
      const sh = text.shipped;
      drawBanner(ctx, toX(ox(team) + ROOM_W / 2), (oy(team) + WALL + 80) * scale, p, multi ? `${text.worktrees[team] ?? ''} · ${sh.one}` : sh.one, multi ? '' : sh.sub, multi);
    });
    if (multi && run && (finished || run.teams.every((tm) => tm.segs.some((s) => s.k === 'banner' && s.t0 + 600 <= clock)))) {
      const start = Math.max(...run.teams.map((tm) => tm.segs.find((s) => s.k === 'banner')?.t0 ?? 0)) + 600;
      drawBanner(ctx, cssW / 2, (stacked ? H : WALL + 160) * scale, finished ? 1 : clamp((clock - start) / 3000, 0, 1), text.shipped.many, text.shipped.subMany, false);
    }
  }

  function frame(now: number) {
    raf = 0;
    const dt = Math.min(100, now - (last || now));
    last = now;
    if (run && !finished) {
      clock = Math.min(clock + dt, run.end);
      if (clock >= run.end) {
        if (auto && !reduced) { play(SCENARIOS[(SCENARIOS.indexOf(run.id) + 1) % SCENARIOS.length], false); return; }
        finished = true;
        hooks.onScenario(null);
      }
    }
    emit();
    draw(now);
    // With reduced motion nothing moves between scenarios, so the loop rests until the next play.
    const still = reduced && (!run || finished);
    if (visible && !still) raf = requestAnimationFrame(frame);
  }

  function loop() {
    if (!raf && visible) { last = 0; raf = requestAnimationFrame(frame); }
  }

  return {
    play: (id) => play(id),
    setVisible(v) {
      visible = v;
      if (v && !started && !reduced) play('ship', false);
      if (v) { loop(); draw(performance.now()); }
      else if (raf) { cancelAnimationFrame(raf); raf = 0; }
    },
    setReduced(r) { reduced = r; if (r) auto = false; draw(performance.now()); },
    resize,
    pointer(x, y) {
      hover = null;
      if (x !== null && y !== undefined) {
        const lx = x / scale;
        const ly = y / scale;
        const team = stacked ? (ly >= H + GAP ? 1 : 0) : lx >= ROOM_W ? 1 : 0;
        if (run && team < run.teams.length) {
          const py = ly - oy(team);
          const hit = ORDER.findIndex((_, i) => Math.abs(lx - ax(i, team)) < 16 && py > bodyTop(i) + 12 && py < bodyTop(i) + 64);
          if (hit >= 0) hover = { team, i: hit };
        }
      }
      canvas.style.cursor = hover === null ? '' : 'help';
      if (!raf) draw(performance.now());
    },
    sync() { typed = STALE; lineKey = STALE; emit(); draw(performance.now()); },
    destroy() { if (raf) cancelAnimationFrame(raf); raf = 0; visible = false; },
  };
}
