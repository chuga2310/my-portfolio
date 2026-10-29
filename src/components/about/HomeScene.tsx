import { useEffect, useRef, useState, type ReactNode } from 'react';
import { useReducedMotion } from 'motion/react';
import type { AboutContent } from '../../lib/types';
import { useResolvedTheme } from '../../hooks/useResolvedTheme';
import { activityAt, createHome, type Home } from './home';

const STEP = 5;
const hhmm = (m: number) => `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;
/** Minutes past midnight in Hanoi (UTC+7), rounded to the dial's step. */
function hanoiNow() {
  const d = new Date();
  const m = (d.getUTCHours() * 60 + d.getUTCMinutes() + 7 * 60) % 1440;
  return Math.floor(m / STEP) * STEP;
}
/** Light theme opens on a working hour, dark on an evening at home — the current time when it fits. */
function defaultMinute(theme: 'light' | 'dark') {
  const now = hanoiNow();
  if (theme === 'light') return now >= 390 && now < 1110 ? now : 600;
  return now >= 1110 && now < 1380 ? now : 1170;
}

interface Props { d: AboutContent['day']; place: ReactNode; note: ReactNode; }

/** The pixel room plus the 24-hour dial that drives it, inside the About card. */
export function HomeScene({ d, place, note }: Props) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const home = useRef<Home | null>(null);
  const theme = useResolvedTheme();
  const reduce = useReducedMotion();
  // A theme switch moves the dial to that theme's part of the day.
  const [pick, setPick] = useState(() => ({ theme, minute: defaultMinute(theme) }));
  if (pick.theme !== theme) setPick({ theme, minute: defaultMinute(theme) });
  const minute = pick.minute;
  const act = d.acts[activityAt(minute)];
  const kid = useRef(d.kid);
  useEffect(() => { kid.current = d.kid; }, [d.kid]);

  useEffect(() => {
    const el = canvas.current;
    if (!el) return;
    const h = createHome(el, () => kid.current);
    home.current = h;
    h.resize();
    const ro = new ResizeObserver(() => h.resize());
    ro.observe(el.parentElement ?? el);
    const io = new IntersectionObserver(([e]) => h.setVisible(e.isIntersecting));
    io.observe(el);
    return () => { ro.disconnect(); io.disconnect(); h.destroy(); home.current = null; };
  }, []);

  useEffect(() => { home.current?.setMinute(minute); }, [minute]);
  useEffect(() => { home.current?.setReduced(!!reduce); }, [reduce]);

  return (
    <>
      <div className="home-stage">
        <canvas
          ref={canvas} role="img" aria-label={`${d.scene} ${hhmm(minute)} — ${act}`}
          onPointerMove={(e) => {
            const r = e.currentTarget.getBoundingClientRect();
            home.current?.pointer(e.clientX - r.left, e.clientY - r.top);
          }}
          onPointerLeave={() => home.current?.pointer(null)}
        />
      </div>
      <figcaption>
        {place}
        <div className="day">
          <div className="day-head">
            <span className="day-zone mono">UTC+7</span>
            <span className="day-time mono">{hhmm(minute)}</span>
            <span className="day-act">{act}</span>
            <button type="button" className="day-now" onClick={() => setPick({ theme, minute: hanoiNow() })}>{d.now}</button>
          </div>
          <input
            type="range" className="day-range" min={0} max={1440 - STEP} step={STEP} value={minute}
            aria-label={d.label} aria-valuetext={`${hhmm(minute)}, ${act}`}
            onChange={(e) => setPick({ theme, minute: Number(e.target.value) })}
          />
          <div className="day-scale mono" aria-hidden="true"><span>00</span><span>06</span><span>12</span><span>18</span><span>24</span></div>
        </div>
        {note}
      </figcaption>
    </>
  );
}
