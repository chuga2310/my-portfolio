import type { CSSProperties } from 'react';

// Small decorative visuals shared by the hero tiles and project cards. All aria-hidden by their containers.

/** Idle pixel character from agents-idle.png; rows: 0 user, 1 BA, 2 planner, 3 dev, 4 reviewer, 5 QA, 6 delivery. */
export const Sprite = ({ row, size = 'md' }: { row: number; size?: 'sm' | 'md' }) => (
  <span className={`sprite${size === 'sm' ? ' sprite-sm' : ''}`} style={{ '--row': row } as CSSProperties} />
);

export const RagViz = () => (
  <svg viewBox="0 0 84 64" fill="none" className="viz">
    <rect x="2" y="6" width="18" height="12" rx="2" fill="#FFFFFF" /><rect x="2" y="26" width="18" height="12" rx="2" fill="#FFFFFF" />
    <rect x="2" y="46" width="18" height="12" rx="2" fill="#FFFFFF" />
    <path className="viz-flow" d="M20 12 L36 30 M20 32 L36 32 M20 52 L36 34" stroke="#141413" strokeWidth="1.4" />
    <ellipse cx="44" cy="22" rx="8" ry="3" fill="#FFFFFF" stroke="#141413" strokeWidth="1.2" />
    <path d="M36 22 V42 A8 3 0 0 0 52 42 V22" fill="#FFFFFF" stroke="#141413" strokeWidth="1.2" />
    <path className="viz-flow" d="M53 32 L68 32" stroke="#141413" strokeWidth="1.4" />
    <circle cx="75" cy="32" r="7" fill="#D97757" />
  </svg>
);

export const KanbanViz = () => (
  <svg viewBox="0 0 80 64" fill="none" className="viz">
    <rect x="1" y="1" width="24" height="62" rx="4" fill="rgba(255,255,255,0.55)" />
    <rect x="28" y="1" width="24" height="62" rx="4" fill="rgba(255,255,255,0.55)" />
    <rect x="55" y="1" width="24" height="62" rx="4" fill="rgba(255,255,255,0.55)" />
    <rect x="4" y="5" width="18" height="9" rx="2" fill="#FFFFFF" /><rect x="4" y="17" width="18" height="9" rx="2" fill="#FFFFFF" />
    <rect x="4" y="29" width="18" height="9" rx="2" fill="#FFFFFF" />
    <rect className="viz-hop" x="31" y="5" width="18" height="9" rx="2" fill="#D97757" />
    <rect x="31" y="17" width="18" height="9" rx="2" fill="#FFFFFF" />
    <rect x="58" y="5" width="18" height="9" rx="2" fill="#141413" /><rect x="58" y="17" width="18" height="9" rx="2" fill="#141413" />
  </svg>
);

const CUBE_FACES = ['translateZ(20px)', 'rotateY(90deg) translateZ(20px)', 'rotateY(180deg) translateZ(20px)',
  'rotateY(-90deg) translateZ(20px)', 'rotateX(90deg) translateZ(20px)', 'rotateX(-90deg) translateZ(20px)'];
export const CubeViz = () => (
  <span className="viz-cube-stage"><span className="viz-cube">{CUBE_FACES.map((f) => <i key={f} style={{ transform: f }} />)}</span></span>
);
