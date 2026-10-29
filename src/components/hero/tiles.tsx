import type { ReactNode } from 'react';
import type { OrbitId } from '../../lib/types';
import lumi from '../../assets/tiles/lumi.webp';
import coke from '../../assets/tiles/coke.webp';
import { KanbanViz, RagViz } from '../ui/viz';
import { Logo } from '../ui/Logo';
import type { LogoId } from '../../lib/logos';

// Tile faces for the hero orbit and the small-screen marquee. All decorative (the orbit is aria-hidden).

const img = (src: string) => <img src={src} alt="" loading="lazy" decoding="async" />;

/** `ink` pins a single-colour logo's colour when the tile's background does not follow the theme. */
interface Face { node: ReactNode; bg: string; kind: 'image' | 'viz' | 'logo'; ink?: string; }

const logo = (id: LogoId): Face => ({ node: <Logo id={id} size={48} />, bg: 'var(--paper)', kind: 'logo' });

const TILE_FACES: Record<OrbitId, Face> = {
  logically: { node: <Logo id="logically" size={50} />, bg: '#FFFFFF', kind: 'logo', ink: '#141413' },
  coke: { node: img(coke), bg: '#E61D2B', kind: 'image' },
  rag: { node: <RagViz />, bg: 'var(--heather)', kind: 'viz' },
  sprint: { node: <KanbanViz />, bg: 'var(--oat)', kind: 'viz' },
  lumi: { node: img(lumi), bg: '#0E8A4F', kind: 'image' },
  claude: logo('claude'),
  openai: logo('openai'),
  gemini: logo('gemini'),
  n8n: logo('n8n'),
  typescript: logo('typescript'),
  javascript: logo('javascript'),
  java: logo('java'),
  rust: logo('rust'),
  react: logo('react'),
  nextjs: logo('nextjs'),
  springboot: logo('springboot'),
  threejs: logo('threejs'),
  electron: logo('electron'),
  nodejs: logo('nodejs'),
  postgres: logo('postgres'),
  gcp: logo('gcp'),
  vercel: logo('vercel'),
};

export function TileFace({ id, size }: { id: OrbitId; size: 'lg' | 'md' | 'sm' }) {
  const f = TILE_FACES[id];
  return (
    <span className={`tile-face tile-${size} is-${f.kind}${f.kind === 'viz' ? ' tex' : ''}`} style={{ backgroundColor: f.bg, color: f.ink }}>
      {f.node}
    </span>
  );
}
