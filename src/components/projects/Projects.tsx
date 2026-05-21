import type { LangContent } from '../../lib/types';
import { TiltCard } from '../ui/TiltCard';
import { FeaturedWindow } from './FeaturedWindow';

interface Props { t: LangContent; }

export function Projects({ t }: Props) {
  const p = t.projects.featured;
  return (
    <section id="projects" className="snap" data-screen-label="05 Projects">
      <div className="kicker">{t.projects.label}</div>
      <h2 className="section-title holo">{t.projects.title}</h2>
      <div className="featured">
        <div className="left">
          <div className="tag"><span className="pulse" /> {p.tag}</div>
          <h3 className="name">{p.name}</h3>
          <p className="sub">{p.sub}</p>
          <ul>{p.bullets.map((b) => <li key={b}>{b}</li>)}</ul>
          <div className="chips" style={{ marginTop: 12 }}>{p.stack.map((s) => <span className="chip" key={s}>{s}</span>)}</div>
          <a className="url-link" href={p.url} target="_blank" rel="noreferrer">↗ {p.urlLabel}</a>
        </div>
        <div className="right"><FeaturedWindow /></div>
      </div>
      <div className="proj-grid">
        {t.projects.grid.map((g) => (
          <TiltCard key={g.name} className="proj-card" intensity={5}>
            <div className="prole">{g.role}</div>
            <div className="pname">{g.name}</div>
            <div className="pbody">{g.body}</div>
            <div className="chips">{g.chips.map((c) => <span key={c} className="chip">{c}</span>)}</div>
          </TiltCard>
        ))}
      </div>
    </section>
  );
}
