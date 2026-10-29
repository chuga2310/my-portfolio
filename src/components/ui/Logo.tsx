import type { CSSProperties } from 'react';
import { LOGOS, type LogoId } from '../../lib/logos';

interface Props { id: LogoId; size?: number; className?: string; mono?: boolean; }

/**
 * A brand mark from lib/logos. Decorative: callers always print the tool's name next to it.
 * `mono` draws it in the text colour and leaves the brand colour in --brand for CSS to reveal.
 */
export function Logo({ id, size = 20, className, mono = false }: Props) {
  const m = LOGOS[id];
  const brand = m.color ?? 'currentColor';
  return (
    <svg
      viewBox={m.viewBox} width={size} height={size} aria-hidden="true" focusable="false"
      className={`logo${className ? ` ${className}` : ''}`} fill={mono ? 'currentColor' : brand}
      style={mono ? ({ '--brand': brand } as CSSProperties) : undefined}
    >
      <path d={m.d} fillRule={m.evenodd ? 'evenodd' : undefined} clipRule={m.evenodd ? 'evenodd' : undefined} />
    </svg>
  );
}
