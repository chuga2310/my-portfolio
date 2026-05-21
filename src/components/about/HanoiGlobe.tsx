import { useRef, useEffect } from 'react';
import { mountHanoiGlobe } from '../../lib/hanoiGlobe';

interface Props { accentHex: string; }

export function HanoiGlobe({ accentHex }: Props) {
  const hostRef = useRef<HTMLDivElement>(null);
  const apiRef = useRef<ReturnType<typeof mountHanoiGlobe> | null>(null);

  useEffect(() => {
    if (!hostRef.current) return;
    apiRef.current = mountHanoiGlobe(hostRef.current, { accent: accentHex });
    return () => { apiRef.current?.destroy(); apiRef.current = null; };
  }, []);

  useEffect(() => {
    apiRef.current?.setAccent(accentHex);
  }, [accentHex]);

  return <div ref={hostRef} className="canvas-host" />;
}
