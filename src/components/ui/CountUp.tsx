import { useEffect, useRef } from 'react';
import { animate, useInView, useReducedMotion } from 'motion/react';
import { EASE_OUT } from '../../lib/motion';

// "10+", "Top 5", "9.22" count up; values with more than one number ("5–10") render as-is.
const NUMERIC = /^(\D*)(\d+(?:\.\d+)?)(\D*)$/;

export function CountUp({ value }: { value: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.6 });
  const reduce = useReducedMotion();

  useEffect(() => {
    const m = value.match(NUMERIC);
    const el = ref.current;
    if (!m || !el || !inView || reduce) return;
    const [, prefix, num, suffix] = m;
    const decimals = (num.split('.')[1] ?? '').length;
    const controls = animate(0, parseFloat(num), {
      duration: 1.1,
      ease: EASE_OUT,
      onUpdate: (v) => { el.textContent = `${prefix}${v.toFixed(decimals)}${suffix}`; },
    });
    return () => controls.stop();
  }, [value, inView, reduce]);

  return (
    <>
      <span ref={ref} aria-hidden="true">{value}</span>
      <span className="sr-only">{value}</span>
    </>
  );
}
