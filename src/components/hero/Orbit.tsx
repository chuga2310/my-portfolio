import { useEffect, useRef, type RefObject } from 'react';
import { useAnimationFrame, useInView, useReducedMotion } from 'motion/react';
import type { LangContent, OrbitId } from '../../lib/types';
import { TileFace } from './tiles';

// Projects (Logically, Coca-Cola, RAG, sprint planning, Lumi) spread between the languages,
// frameworks and platforms I build with.
const OUTER_RING: OrbitId[] = [
  'logically', 'claude', 'typescript', 'react', 'coke', 'gcp', 'rag', 'java', 'openai', 'nextjs', 'lumi', 'nodejs', 'sprint', 'rust',
  'gemini', 'vercel',
];
const INNER_RING: OrbitId[] = ['javascript', 'springboot', 'postgres', 'threejs', 'n8n', 'electron'];

interface Props { t: LangContent; contentRef: RefObject<HTMLElement | null>; }

const OUTER = { size: 104, period: 140 };
const INNER = { size: 84, period: 100 };
const TAU = Math.PI * 2;

/**
 * Two rings of tiles circling the hero copy in opposite directions. Positions are written straight
 * to the DOM each frame; tiles fade out where they pass behind the copy. Desktop only (CSS hides it).
 */
export function Orbit({ t, contentRef }: Props) {
  const root = useRef<HTMLDivElement>(null);
  const outer = useRef<(HTMLDivElement | null)[]>([]);
  const inner = useRef<(HTMLDivElement | null)[]>([]);
  const angle = useRef(0);
  const paused = useRef(false);
  const box = useRef({ w: 0, h: 0, cx: 0, cy: 0, cw: 0, ch: 0 });
  const inView = useInView(root);
  const reduce = useReducedMotion();

  useEffect(() => {
    const host = root.current;
    const content = contentRef.current;
    if (!host || !content) return;
    const measure = () => {
      const r = host.getBoundingClientRect();
      const c = content.getBoundingClientRect();
      box.current = {
        w: r.width, h: r.height,
        cx: c.left - r.left + c.width / 2, cy: c.top - r.top + c.height / 2,
        cw: c.width, ch: c.height,
      };
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(host);
    ro.observe(content);
    return () => ro.disconnect();
  }, [contentRef]);

  function place(els: (HTMLDivElement | null)[], ids: OrbitId[], rx: number, ry: number, size: number, turn: number) {
    const { cx, cy, cw, ch } = box.current;
    ids.forEach((_, i) => {
      const el = els[i];
      if (!el) return;
      const a = (i / ids.length) * TAU + turn;
      const x = cx + rx * Math.cos(a);
      const y = cy + ry * Math.sin(a);
      // Fade tiles as they pass behind the copy block.
      const dx = Math.max(Math.abs(x - cx) - (cw / 2 + size / 2), 0);
      const dy = Math.max(Math.abs(y - cy) - (ch / 2 + size / 2), 0);
      const op = Math.min(1, Math.hypot(dx, dy) / 70);
      el.style.transform = `translate3d(${x - size / 2}px, ${y - size / 2}px, 0)`;
      el.style.opacity = String(op);
      el.style.visibility = op < 0.02 ? 'hidden' : 'visible';
    });
  }

  useAnimationFrame((_, delta) => {
    const { w, h, cw, ch } = box.current;
    if (!w || !inView || root.current?.offsetParent === null) return;
    if (!reduce && !paused.current) angle.current += (delta / 1000) * (TAU / OUTER.period);
    const rxA = Math.max(cw / 2 + 170, Math.min(780, w * 0.54));
    const ryA = Math.max(ch / 2 + 40, Math.min(480, h * 0.54));
    place(outer.current, OUTER_RING, rxA, ryA, OUTER.size, angle.current + 0.14);
    place(inner.current, INNER_RING, rxA * 0.72, ryA * 0.7, INNER.size, -angle.current * (OUTER.period / INNER.period) + 0.45);
  });

  const hold = { onPointerEnter: () => { paused.current = true; }, onPointerLeave: () => { paused.current = false; } };

  return (
    <div ref={root} className="orbit" aria-hidden="true">
      {OUTER_RING.map((id, i) => (
        <div key={id} ref={(el) => { outer.current[i] = el; }} className="orbit-tile" {...hold}>
          <TileFace id={id} size="lg" />
          <p className="tile-cap">{t.hero.orbit[id]}</p>
        </div>
      ))}
      {INNER_RING.map((id, i) => (
        <div key={id} ref={(el) => { inner.current[i] = el; }} className="orbit-tile" {...hold}>
          <TileFace id={id} size="md" />
          <p className="tile-cap">{t.hero.orbit[id]}</p>
        </div>
      ))}
    </div>
  );
}

const MARQUEE: OrbitId[] = ['logically', 'claude', 'typescript', 'rag', 'react', 'coke', 'java', 'openai', 'sprint', 'nextjs', 'lumi', 'nodejs', 'gcp', 'rust'];

/** Small screens: the orbit becomes one drifting row of tiles. */
export function TileMarquee({ t }: { t: LangContent }) {
  return (
    <div className="tile-marquee" aria-hidden="true">
      <div className="tile-marquee-track">
        {[...MARQUEE, ...MARQUEE].map((id, i) => (
          <div key={`${id}-${i}`} className="marquee-tile">
            <TileFace id={id} size="sm" />
            <p className="tile-cap">{t.hero.orbit[id]}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
