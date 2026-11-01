import type { LangContent } from '../../lib/types';
import logicallyShot from '../../assets/work/logically.webp';
import citeImg from '../../assets/work/cite.webp';
import cokeImg from '../../assets/work/coke.webp';
import learnrImg from '../../assets/work/learnr.webp';
import lumiImg from '../../assets/work/lumi.webp';
import { RevealHeading } from '../ui/RevealHeading';
import { Reveal } from '../ui/Reveal';
import { CubeViz, KanbanViz, RagViz, Sprite } from '../ui/viz';
import { ArrowUpRight } from '../ui/icons';
import { LogicallyStory } from './LogicallyStory';

/** `en` is the page's English content: JD Matcher highlights match on the English project name, whatever the UI language. */
interface Props { t: LangContent; en: LangContent; }

type Media = { src: string; alt: string; bg: string } | { viz: 'cube' | 'agents' | 'kanban' | 'rag'; bg: string };

/** Header media per grid card, keyed by the English project name. */
const MEDIA: Record<string, Media> = {
  'Afforai Cite Extension': { src: citeImg, alt: 'Afforai Cite Extension in Microsoft Word: reference manager and AI research assistant panels', bg: '#6F5BEF' },
  'IRIS 3D Web/Desktop': { viz: 'cube', bg: 'var(--heather)' },
  'Coca-Cola AR Training': { src: cokeImg, alt: 'Coca-Cola logo', bg: '#E61D2B' },
  'LearnR (Aura Hackathon)': { src: learnrImg, alt: 'Aura Network × EduNext Hackathon “Hack To NFT And Beyond” final pitching banner', bg: '#1B1F4A' },
  'Lumi IoT Suite': { src: lumiImg, alt: '“Works with Lumi Life” badge from Lumi Vietnam', bg: '#0E8A4F' },
  'Multi-Agent Delivery System': { viz: 'agents', bg: 'var(--peach)' },
  'Logically Desktop & Mobile': { src: logicallyShot, alt: 'Logically research workspace, shared by the web, Windows and mobile apps', bg: '#FFFFFF' },
  'PeakApp AI Video Apps': { viz: 'kanban', bg: 'var(--oat)' },
  'FPT Partner Platform': { viz: 'kanban', bg: 'var(--heather)' },
  'Email Automation System': { viz: 'rag', bg: 'var(--heather)' },
};

function CardMedia({ media }: { media: Media | undefined }) {
  if (!media) return <span className="card-media-fill tex" />;
  if ('src' in media) return <img src={media.src} alt={media.alt} loading="lazy" decoding="async" width={1280} height={720} />;
  return (
    <span className="card-media-fill tex" aria-hidden="true">
      {media.viz === 'cube' && <span className="card-cube"><CubeViz /></span>}
      {media.viz === 'agents' && <span className="card-agents">{[1, 2, 3, 4, 5].map((r) => <Sprite key={r} row={r} />)}</span>}
      {media.viz === 'kanban' && <span className="card-viz"><KanbanViz /></span>}
      {media.viz === 'rag' && <span className="card-viz"><RagViz /></span>}
    </span>
  );
}

export function Projects({ t, en }: Props) {
  const p = t.projects.featured;
  const featuredKey = en.projects.featured.name;
  return (
    <section id="projects" className="section section-ivory">
      <div className="wrap">
        <div className="eyebrow mono">{t.projects.label}</div>
        <RevealHeading text={t.projects.title} className="section-title serif" />

        <article className="featured" data-jd-section="projects" data-jd-key={featuredKey}>
          <Reveal className="featured-copy">
            <div className="pill pill-accent"><span className="live-dot" aria-hidden="true" />{p.tag}</div>
            <h3 className="featured-name serif">{p.name}</h3>
            <p className="featured-sub">{p.sub}</p>
            <ul className="dash-list">{p.bullets.map((b) => <li key={b}>{b}</li>)}</ul>
          </Reveal>
          <Reveal className="featured-media" delay={0.1}>
            <a className="shot-link" href={p.url} target="_blank" rel="noreferrer">
              <figure className="shot">
                <img src={logicallyShot} alt={p.shot} width={1200} height={643} loading="lazy" decoding="async" />
                <figcaption><span>{p.shot}</span><span className="shot-visit">{p.visit} <ArrowUpRight size={14} /></span></figcaption>
              </figure>
            </a>
            <ul className="chips">{p.stack.map((s) => <li key={s}>{s}</li>)}</ul>
          </Reveal>
        </article>

        <LogicallyStory p={p} replay={t.projects.replay} label={t.projects.storyLabel} note={t.projects.storyNote} />

        <div className="project-grid">
          {t.projects.grid.map((g, i) => {
            const key = en.projects.grid[i].name;
            const media = MEDIA[key];
            return (
              <Reveal key={g.name} delay={(i % 3) * 0.06}>
                <article className="project-card" data-jd-section="projects" data-jd-key={key}>
                  <div className="card-media" style={{ background: media?.bg }}>
                    <CardMedia media={media} />
                    <span className="card-role">{g.role}</span>
                    {g.note && <span className="card-note">{g.note}</span>}
                  </div>
                  <div className="card-body">
                    <h3 className="serif">{g.name}</h3>
                    <p>{g.body}</p>
                    <ul className="chips chips-sm">{g.chips.map((c) => <li key={c}>{c}</li>)}</ul>
                    {g.link && (
                      <a
                        className="card-link" href={g.link.href}
                        {...(g.link.href.startsWith('http') ? { target: '_blank', rel: 'noreferrer' } : {})}
                      >
                        {g.link.label} {g.link.href.startsWith('#') ? '↓' : <ArrowUpRight size={14} />}
                      </a>
                    )}
                  </div>
                </article>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
