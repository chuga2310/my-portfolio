import homeUrl from '../../assets/pixel/home-bg.png';
import officeUrl from '../../assets/pixel/office-day.png';
import crewUrl from '../../assets/pixel/home-crew.png';
import teamUrl from '../../assets/pixel/office-crew.png';
import poufUrl from '../../assets/pixel/home-pouf.png';
import chairsUrl from '../../assets/pixel/office-chairs.png';
import type { DayActivity } from '../../lib/types';

/**
 * My day on one canvas: two 340×146 pixel rooms — the company office for working hours, home for
 * mornings and evenings — whose window, wall clock, lighting and people follow the minute picked on the
 * day dial. Hovering my daughter names her.
 */

export interface Home {
  setMinute: (m: number) => void;
  setVisible: (v: boolean) => void;
  setReduced: (r: boolean) => void;
  /** CSS-pixel pointer position over the canvas, or null when it leaves. */
  pointer: (x: number | null, y?: number) => void;
  resize: () => void;
  destroy: () => void;
}

const W = 340;
const H = 146;
/** Start minute of each activity; the last one wraps past midnight. */
export const DAY: [number, DayActivity][] = [
  [390, 'morning'], [510, 'deep'], [720, 'lunch'], [810, 'ship'], [1110, 'play'], [1230, 'game'], [1380, 'sleep'],
];
export function activityAt(m: number): DayActivity {
  let act: DayActivity = 'sleep';
  for (const [from, id] of DAY) if (m >= from) act = id;
  return act;
}
const AT_OFFICE: DayActivity[] = ['deep', 'lunch', 'ship'];

const HOME_WINDOW = { x: 115, y: 10, w: 52, h: 29 };
const OFFICE_WINDOW = { x: 115, y: 9, w: 120, h: 30 };
const CLOCK = { x: 94, y: 21, r: 9 };
/** Right-hand monitor screens: mine (home and office), then my two colleagues' at the office. */
const SCREENS = [{ x: 49, y: 37 }, { x: 121, y: 39 }, { x: 193, y: 37 }];
const TV = { x: 263, y: 26, w: 50, h: 22 };
const POUF = { x: 268, y: 98 };
/** Sitting right at the desk (desks top out at y 58 in both rooms). */
const DESK_SPOT = { x: 28, y: 62 };
const DESK_TOP = 58;
const RUG_SPOT = { x: 124, y: 70 };
/** Colleagues are two of the agents from the office scene: the developer and the Figma analyst. */
const TEAM = [{ row: 4, x: 100 }, { row: 3, x: 172 }];
const INK = '#141413';

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
const mix = (a: number[], b: number[], t: number) => a.map((v, i) => Math.round(v + (b[i] - v) * t));
const rgb = (c: number[], a = 1) => `rgba(${c[0]}, ${c[1]}, ${c[2]}, ${a})`;

/** Sky colour through the day: night, dawn, day, dusk. */
const SKY: [number, number[]][] = [
  [0, [20, 26, 56]], [330, [24, 30, 64]], [390, [242, 180, 140]], [450, [156, 201, 232]],
  [1020, [156, 201, 232]], [1110, [232, 149, 107]], [1170, [42, 44, 84]], [1440, [20, 26, 56]],
];
function skyAt(m: number) {
  for (let i = 1; i < SKY.length; i++) {
    const [m0, c0] = SKY[i - 1];
    const [m1, c1] = SKY[i];
    if (m <= m1) return mix(c0, c1, (m - m0) / (m1 - m0));
  }
  return SKY[0][1];
}
/** How dark the room is (0 = full daylight), before lamps and screens. */
function darkness(m: number) {
  if (m >= 450 && m <= 1020) return 0;
  if (m > 1020 && m < 1170) return ((m - 1020) / 150) * 0.55;
  if (m > 330 && m < 450) return (1 - (m - 330) / 120) * 0.55;
  return 0.55;
}

export function createHome(canvas: HTMLCanvasElement, kidName: () => string): Home {
  const ctx = canvas.getContext('2d');
  const img = (src: string) => { const i = new Image(); i.src = src; return i; };
  const home = img(homeUrl);
  const office = img(officeUrl);
  const crew = img(crewUrl);
  const team = img(teamUrl);
  const pouf = img(poufUrl);
  const chairs = img(chairsUrl);
  const ready = (i: HTMLImageElement) => i.complete && i.naturalWidth > 0;

  let minute = 600;
  let visible = false;
  let reduced = false;
  let raf = 0;
  let scale = 2;
  let dpr = 1;
  let hover: [number, number] | null = null;
  /** Where my daughter was last drawn, for the hover test. */
  let kidBox: { x: number; y: number; w: number; h: number } | null = null;

  function resize() {
    const cssW = canvas.parentElement?.clientWidth ?? canvas.clientWidth;
    if (!cssW) return;
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    scale = cssW / W;
    canvas.style.height = `${Math.round(H * scale)}px`;
    canvas.width = Math.round(cssW * dpr);
    canvas.height = Math.round(H * scale * dpr);
    draw(performance.now());
  }

  const me = (col: number, row: number, x: number, y: number) => {
    if (ctx && ready(crew)) ctx.drawImage(crew, col * 32, row * 64, 32, 64, Math.round(x), Math.round(y), 32, 64);
  };
  const mate = (col: number, row: number, x: number, y: number) => {
    if (ctx && ready(team)) ctx.drawImage(team, col * 32, row * 64, 32, 64, Math.round(x), Math.round(y), 32, 64);
  };
  /** Office chair at the desk whose sprite sits at x: seen from behind (over a back turned to the screen) or from the front. */
  const chair = (x: number, front: boolean) => {
    if (ctx && ready(chairs)) ctx.drawImage(chairs, front ? 32 : 0, 0, 32, 46, x, DESK_TOP + (front ? 30 : 36), 32, 46);
  };
  /** Someone at a desk: facing the screen with the chair in front, or turned round with it behind. */
  const seated = (draw: () => void, x: number, facingScreen: boolean) => {
    if (facingScreen) { draw(); chair(x, false); } else { chair(x, true); draw(); }
  };

  function drawSky(now: number, win: { x: number; y: number; w: number; h: number }) {
    if (!ctx) return;
    const { x, y, w, h } = win;
    const sky = skyAt(minute);
    ctx.fillStyle = rgb(sky);
    ctx.fillRect(x, y, w, h);
    const night = minute < 360 || minute > 1150;
    if (night) {
      ctx.fillStyle = '#F5F4ED';
      for (let i = 0; i < 9; i++) {
        ctx.globalAlpha = Math.sin(now / 600 + i * 1.7) > 0.2 ? 1 : 0.4;
        ctx.fillRect(x + ((i * 17) % w), y + ((i * 11) % (h - 4)) + 1, 1, 1);
      }
      ctx.globalAlpha = 1;
      ctx.fillStyle = '#F2EBC9';
      ctx.beginPath();
      ctx.arc(x + w - 12, y + 9, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = rgb(sky);
      ctx.beginPath();
      ctx.arc(x + w - 10, y + 8, 3.4, 0, Math.PI * 2);
      ctx.fill();
    } else {
      // The sun crosses the window from morning to evening.
      const t = clamp((minute - 360) / (1140 - 360), 0, 1);
      ctx.fillStyle = '#FFE08A';
      ctx.beginPath();
      ctx.arc(x + 6 + t * (w - 12), y + h - 4 - Math.sin(t * Math.PI) * (h - 10), 3.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
      const drift = reduced ? 0 : (now / 400) % (w + 20);
      ctx.fillRect(x + ((drift + 4) % (w + 20)) - 14, y + 8, 12, 3);
      ctx.fillRect(x + ((drift + 30) % (w + 20)) - 14, y + 16, 9, 2);
    }
  }

  function drawClock() {
    if (!ctx) return;
    const { x, y, r } = CLOCK;
    ctx.fillStyle = '#FAF9F5';
    ctx.strokeStyle = '#3A3A4A';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    const hand = (turns: number, len: number, width: number) => {
      const a = turns * Math.PI * 2 - Math.PI / 2;
      ctx.lineWidth = width;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + Math.cos(a) * len, y + Math.sin(a) * len);
      ctx.stroke();
    };
    ctx.strokeStyle = INK;
    hand((minute % 720) / 720, r * 0.5, 1.4);
    ctx.strokeStyle = '#C2603F';
    hand((minute % 60) / 60, r * 0.78, 1);
  }

  function drawMonitor(now: number, i: number) {
    if (!ctx) return;
    const { x, y } = SCREENS[i];
    ctx.fillStyle = INK;
    ctx.fillRect(x, y, 22, 10);
    const tick = Math.floor(now / 160) + i * 3;
    const colors = ['#D97757', '#BCD1CA', '#E8E6DC', '#CBCADB'];
    for (let r = 0; r < 4; r++) {
      const n = r + (reduced ? 0 : tick);
      ctx.fillStyle = colors[n % 4];
      ctx.fillRect(x + 2 + (n % 3 === 1 ? 3 : 0), y + 1 + r * 2.5, 4 + ((n * 7) % 12), 1);
    }
  }

  /** A tiny platformer on the TV: a hero hops over coins. */
  function drawGame(now: number) {
    if (!ctx) return;
    const { x, y, w, h } = TV;
    ctx.save();
    ctx.beginPath();
    ctx.rect(x, y, w, h);
    ctx.clip();
    ctx.fillStyle = '#5DA9E9';
    ctx.fillRect(x, y, w, h);
    const s = reduced ? 0 : now / 1000;
    ctx.fillStyle = '#4C9A4A';
    ctx.fillRect(x, y + h - 5, w, 5);
    for (let i = 0; i < 4; i++) {
      const cx = x + ((i * 13 - s * 18) % (w + 10) + w + 10) % (w + 10) - 5;
      ctx.fillStyle = '#F4C542';
      ctx.fillRect(Math.round(cx), y + h - 11, 2, 2);
    }
    const hop = Math.abs(Math.sin(s * 3)) * 7;
    ctx.fillStyle = '#E04E3A';
    ctx.fillRect(x + 10, Math.round(y + h - 10 - hop), 4, 5);
    ctx.restore();
  }

  function glow(x: number, y: number, r: number, color: string) {
    if (!ctx) return;
    const g = ctx.createRadialGradient(x, y, 1, x, y, r);
    g.addColorStop(0, color);
    g.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = g;
    ctx.fillRect(x - r, y - r, r * 2, r * 2);
  }

  function hearts(t: number, x: number, y: number) {
    if (!ctx || reduced) return;
    const hp = (t / 1800) % 1;
    ctx.globalAlpha = 1 - hp;
    ctx.fillStyle = '#E36A6A';
    const hy = y - hp * 16;
    ctx.fillRect(x, hy, 2, 2); ctx.fillRect(x + 3, hy, 2, 2); ctx.fillRect(x, hy + 1, 5, 2); ctx.fillRect(x + 1, hy + 3, 3, 1); ctx.fillRect(x + 2, hy + 4, 1, 1);
    ctx.globalAlpha = 1;
  }

  /** The office: deep work at my desk, lunch at the round table, afternoons of standups and shipping. */
  function drawOffice(act: DayActivity, now: number, t: number, f6: number) {
    if (!ctx) return;
    drawSky(now, OFFICE_WINDOW);
    if (ready(office)) ctx.drawImage(office, 0, 0);
    drawClock();
    // Afternoons alternate: heads down at the desks, then a standup at the whiteboard.
    const standup = act === 'ship' && !reduced && Math.floor(t / 7000) % 2 === 1;
    if (act === 'lunch') {
      me(f6, 0, 226, 72);
      mate(f6, TEAM[0].row, 292, 72);
      // Two bowls and a little steam on the table.
      ctx.fillStyle = '#FAF9F5';
      ctx.fillRect(260, 120, 8, 3);
      ctx.fillRect(278, 120, 8, 3);
      if (!reduced) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        for (let i = 0; i < 2; i++) {
          const p = ((t / 1500) + i / 2) % 1;
          ctx.globalAlpha = 1 - p;
          ctx.fillRect(263 + i * 18, 117 - p * 10, 1, 2);
        }
        ctx.globalAlpha = 1;
      }
      chair(DESK_SPOT.x, false);
      chair(TEAM[0].x, false);
      TEAM.slice(1).forEach((m) => { drawMonitor(now, 2); seated(() => mate(6 + f6, m.row, m.x, DESK_SPOT.y), m.x, true); });
      return;
    }
    if (standup) {
      [DESK_SPOT.x, ...TEAM.map((m) => m.x)].forEach((x) => chair(x, false));
      me(6 + f6, 0, 250, 44);
      TEAM.forEach((m, i) => mate(6 + f6, m.row, 276 + i * 26, 44));
      return;
    }
    // At the desks; now and then I turn round in my chair to take a call.
    const call = act === 'ship' && Math.floor(t / 4000) % 3 === 2;
    drawMonitor(now, 0);
    if (call) seated(() => me(3 + f6, 1, DESK_SPOT.x, DESK_SPOT.y), DESK_SPOT.x, false);
    else seated(() => me(6 + f6, 0, DESK_SPOT.x, DESK_SPOT.y), DESK_SPOT.x, true);
    TEAM.forEach((m, i) => { drawMonitor(now, i + 1); seated(() => mate(6 + f6, m.row, m.x, DESK_SPOT.y), m.x, true); });
  }

  /** Home: breakfast and play with my daughter, a game in the evening, then lights out. */
  function drawHome(act: DayActivity, now: number, t: number, f6: number) {
    if (!ctx) return;
    drawSky(now, HOME_WINDOW);
    if (ready(home)) ctx.drawImage(home, 0, 0);
    drawClock();
    chair(DESK_SPOT.x, false);
    if (act === 'game') drawGame(now);
    if (act === 'game' && ready(pouf)) {
      ctx.drawImage(pouf, POUF.x, POUF.y);
      me(6 + f6, 0, POUF.x + 4, POUF.y - 34);
      // The front of the bean bag hides my legs.
      ctx.drawImage(pouf, 0, 24, pouf.width, pouf.height - 24, POUF.x, POUF.y + 24, pouf.width, pouf.height - 24);
    } else if (ready(pouf)) {
      ctx.drawImage(pouf, POUF.x, POUF.y);
    }
    kidBox = null;
    if (act !== 'morning' && act !== 'play') return;
    const hop = act === 'play' && !reduced ? Math.abs(Math.sin(t / 260)) * 2 : 0;
    me(f6, 0, RUG_SPOT.x, RUG_SPOT.y - hop);
    // My daughter wanders round the play mat: right, down, left, then a little pause.
    const row = act === 'play' ? 3 : 2;
    const p = reduced ? 0.9 : (t / 7000) % 1;
    const leg = Math.floor(p * 4);
    const f = (p * 4) % 1;
    const path: [number, number][] = [[160, 72], [180, 72], [180, 84], [160, 84]];
    const [x0, y0] = path[leg];
    const [x1, y1] = path[(leg + 1) % 4];
    const kx = x0 + (x1 - x0) * f;
    const ky = y0 + (y1 - y0) * f;
    const col = leg === 3 ? f6 : leg === 0 ? 6 + f6 : leg === 1 ? 18 + f6 : 12 + f6;
    if (act === 'play') {
      // A ball bounces ahead of her.
      const b = reduced ? 0 : Math.abs(Math.sin(t / 220)) * 8;
      ctx.fillStyle = '#E04E3A';
      ctx.beginPath();
      ctx.arc(kx + 26, ky + 60 - b, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(kx + 25, ky + 58 - b, 1, 1);
    }
    me(col, row, kx, ky);
    kidBox = { x: kx + 6, y: ky + 26, w: 20, h: 38 };
    hearts(t, RUG_SPOT.x + 22, RUG_SPOT.y + 10);
  }

  function drawLighting(act: DayActivity, t: number) {
    if (!ctx) return;
    let dark = darkness(minute);
    const lampsOn = dark > 0.1 && act !== 'sleep' && act !== 'game';
    if (lampsOn) dark *= 0.35;
    if (dark <= 0) return;
    ctx.fillStyle = `rgba(14, 18, 40, ${dark})`;
    ctx.fillRect(0, 0, W, H);
    ctx.globalCompositeOperation = 'lighter';
    if (act === 'game') glow(TV.x + TV.w / 2, TV.y + TV.h, 70, `rgba(93, 169, 233, ${0.18 + 0.05 * Math.sin(t / 300)})`);
    if (AT_OFFICE.includes(act)) glow(SCREENS[0].x + 6, SCREENS[0].y + 10, 50, 'rgba(120, 160, 220, 0.16)');
    if (act === 'sleep') glow(HOME_WINDOW.x + HOME_WINDOW.w / 2, HOME_WINDOW.y + HOME_WINDOW.h + 30, 60, 'rgba(120, 140, 200, 0.08)');
    if (lampsOn) glow(150, 90, 120, 'rgba(255, 196, 120, 0.12)');
    ctx.globalCompositeOperation = 'source-over';
  }

  function drawKidTip() {
    if (!ctx || !hover || !kidBox) return;
    const [hx, hy] = hover;
    const b = kidBox;
    if (hx < b.x || hx > b.x + b.w || hy < b.y || hy > b.y + b.h) return;
    const name = kidName();
    ctx.font = `600 7px "Hanken Grotesk", system-ui, sans-serif`;
    const w = ctx.measureText(name).width + 10;
    const x = clamp(b.x + b.w / 2 - w / 2, 2, W - w - 2);
    const y = b.y - 14;
    ctx.fillStyle = INK;
    ctx.beginPath();
    ctx.roundRect(x, y, w, 11, 5.5);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(b.x + b.w / 2 - 3, y + 11);
    ctx.lineTo(b.x + b.w / 2 + 3, y + 11);
    ctx.lineTo(b.x + b.w / 2, y + 14);
    ctx.fill();
    ctx.fillStyle = '#FAF9F5';
    ctx.textBaseline = 'middle';
    ctx.fillText(name, x + 5, y + 6);
  }

  function draw(now: number) {
    if (!ctx) return;
    const act = activityAt(minute);
    const t = reduced ? 0 : now;
    const f6 = Math.floor(t / 170) % 6;
    const k = scale * dpr;
    ctx.setTransform(k, 0, 0, k, 0, 0);
    ctx.imageSmoothingEnabled = false;
    ctx.clearRect(0, 0, W, H);
    if (AT_OFFICE.includes(act)) { kidBox = null; drawOffice(act, now, t, f6); }
    else drawHome(act, now, t, f6);
    drawLighting(act, t);
    if (act === 'sleep' && !reduced) {
      ctx.fillStyle = '#FAF9F5';
      ctx.font = '600 8px "JetBrains Mono", monospace';
      for (let i = 0; i < 3; i++) {
        const p = ((t / 2400) + i / 3) % 1;
        ctx.globalAlpha = Math.sin(p * Math.PI);
        ctx.fillText('z', 284 + p * 14 + i * 2, 100 - p * 30);
      }
      ctx.globalAlpha = 1;
    }
    drawKidTip();
  }

  function frame(now: number) {
    raf = 0;
    draw(now);
    if (visible && !reduced) raf = requestAnimationFrame(frame);
  }

  return {
    setMinute(m) { minute = ((m % 1440) + 1440) % 1440; if (!raf) draw(performance.now()); },
    setVisible(v) {
      visible = v;
      if (v && !raf && !reduced) raf = requestAnimationFrame(frame);
      if (!v && raf) { cancelAnimationFrame(raf); raf = 0; }
    },
    setReduced(r) { reduced = r; draw(performance.now()); if (!r && visible && !raf) raf = requestAnimationFrame(frame); },
    pointer(x, y) {
      hover = x === null || y === undefined ? null : [x / scale, y / scale];
      const b = kidBox;
      const on = !!(hover && b && hover[0] >= b.x && hover[0] <= b.x + b.w && hover[1] >= b.y && hover[1] <= b.y + b.h);
      canvas.style.cursor = on ? 'help' : '';
      if (!raf) draw(performance.now());
    },
    resize,
    destroy() { if (raf) cancelAnimationFrame(raf); raf = 0; visible = false; },
  };
}
