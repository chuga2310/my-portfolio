import { useEffect, useRef } from 'react';
import { useReducedMotion } from 'motion/react';

type Pt = [number, number];
export interface SkillEdges { center: Pt; hats: Pt[]; leaves: Pt[][]; }

interface Props { width: number; height: number; edges: SkillEdges; active: number | null; }

interface Pulse { bi: number; li: number; d: number; speed: number; }
interface Ripple { x: number; y: number; age: number; bi: number; }

const CLAY = '217, 119, 87';
const MAX_PULSES = 26;
const SPAWN_MS = 320;
/** Satellites circling the centre node: ellipse radii, speed (rad/s), phase, size. */
const SATELLITES: [number, number, number, number, number][] = [
  [150, 92, 0.55, 0, 3.2], [150, 92, 0.55, Math.PI, 2.4], [205, 128, -0.32, 1.2, 2.6], [205, 128, -0.32, 4.1, 2],
];

const dist = (a: Pt, b: Pt) => Math.hypot(b[0] - a[0], b[1] - a[1]);

/**
 * One canvas under the map's labels: data pulses run from the centre out to a hat and on to one of
 * its skills (a ripple marks the arrival), and a few satellites circle the centre. The hovered group
 * gets most of the traffic; the rest fade back. Paused off-screen and absent with reduced motion.
 */
export function SkillPulses({ width, height, edges, active }: Props) {
  const ref = useRef<HTMLCanvasElement>(null);
  const activeRef = useRef(active);
  const reduce = useReducedMotion();

  useEffect(() => { activeRef.current = active; }, [active]);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx || reduce) return;
    let raf = 0;
    let last = 0;
    let spawn = 0;
    let visible = false;
    let k = 1;
    let dpr = 1;
    const pulses: Pulse[] = [];
    const ripples: Ripple[] = [];

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      k = canvas.clientWidth / width;
      canvas.width = Math.round(canvas.clientWidth * dpr);
      canvas.height = Math.round(canvas.clientHeight * dpr);
    };

    const pathOf = (p: Pulse) => {
      const hat = edges.hats[p.bi];
      const leaf = edges.leaves[p.bi][p.li];
      const a = dist(edges.center, hat);
      return { hat, leaf, a, total: a + dist(hat, leaf) };
    };

    const add = () => {
      const on = activeRef.current;
      const bi = on !== null && Math.random() < 0.7 ? on : Math.floor(Math.random() * edges.hats.length);
      const li = Math.floor(Math.random() * edges.leaves[bi].length);
      pulses.push({ bi, li, d: 0, speed: 230 + Math.random() * 120 });
    };

    const glow = (x: number, y: number, r: number, alpha: number) => {
      const g = ctx.createRadialGradient(x, y, 0, x, y, r * 3);
      g.addColorStop(0, `rgba(${CLAY}, ${alpha})`);
      g.addColorStop(1, `rgba(${CLAY}, 0)`);
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(x, y, r * 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = `rgba(${CLAY}, ${Math.min(1, alpha + 0.25)})`;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    };

    const frame = (now: number) => {
      raf = 0;
      const dt = Math.min(64, now - (last || now)) / 1000;
      last = now;
      spawn += dt * 1000;
      if (spawn > SPAWN_MS && pulses.length < MAX_PULSES) { spawn = 0; add(); }
      const on = activeRef.current;
      const weight = (bi: number) => (on === null ? 0.75 : on === bi ? 1 : 0.18);

      ctx.setTransform(k * dpr, 0, 0, k * dpr, 0, 0);
      ctx.clearRect(0, 0, width, height);

      for (let i = pulses.length - 1; i >= 0; i--) {
        const p = pulses[i];
        const { hat, leaf, a, total } = pathOf(p);
        p.d += p.speed * dt;
        if (p.d >= total) { ripples.push({ x: leaf[0], y: leaf[1], age: 0, bi: p.bi }); pulses.splice(i, 1); continue; }
        const [from, to, f] = p.d < a ? [edges.center, hat, p.d / a] : [hat, leaf, (p.d - a) / (total - a)];
        const x = from[0] + (to[0] - from[0]) * f;
        const y = from[1] + (to[1] - from[1]) * f;
        // A short tail behind the head reads as motion even at low frame rates.
        for (let t = 3; t >= 1; t--) {
          const back = Math.max(0, f - t * 0.035);
          glow(from[0] + (to[0] - from[0]) * back, from[1] + (to[1] - from[1]) * back, 1.4, 0.12 * weight(p.bi));
        }
        glow(x, y, 2.6, 0.55 * weight(p.bi));
      }

      for (let i = ripples.length - 1; i >= 0; i--) {
        const r = ripples[i];
        r.age += dt;
        if (r.age > 0.7) { ripples.splice(i, 1); continue; }
        const f = r.age / 0.7;
        ctx.strokeStyle = `rgba(${CLAY}, ${(1 - f) * 0.6 * weight(r.bi)})`;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(r.x, r.y, 6 + f * 22, 0, Math.PI * 2);
        ctx.stroke();
      }

      const [cx, cy] = edges.center;
      const s = now / 1000;
      for (const [rx, ry, speed, phase, size] of SATELLITES) {
        const ang = phase + s * speed;
        for (let t = 0; t < 6; t++) {
          const a2 = ang - Math.sign(speed) * t * 0.05;
          glow(cx + Math.cos(a2) * rx, cy + Math.sin(a2) * ry, size * (1 - t * 0.12), t ? 0.08 : on === null ? 0.5 : 0.3);
        }
      }

      if (visible) raf = requestAnimationFrame(frame);
    };

    const start = () => { if (!raf && visible) { last = 0; raf = requestAnimationFrame(frame); } };
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      if (visible) start();
      else if (raf) { cancelAnimationFrame(raf); raf = 0; }
    });
    io.observe(canvas);
    resize();
    return () => { ro.disconnect(); io.disconnect(); if (raf) cancelAnimationFrame(raf); };
  }, [width, height, edges, reduce]);

  return <canvas ref={ref} className="skill-pulses" aria-hidden="true" />;
}
