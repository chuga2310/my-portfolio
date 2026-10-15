import { useEffect, useState } from 'react';

/** Seconds left until `until` (epoch ms), ticking once a second. 0 when `until` is null or past. */
export function useCountdown(until: number | null): number {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!until) return;
    const tick = () => {
      const t = Date.now();
      setNow(t);
      if (t >= until) window.clearInterval(id);
    };
    const id = window.setInterval(tick, 1000);
    const first = window.setTimeout(tick, 0); // resync `now` when a new deadline arrives
    return () => { window.clearInterval(id); window.clearTimeout(first); };
  }, [until]);

  return until ? Math.max(0, Math.ceil((until - now) / 1000)) : 0;
}
