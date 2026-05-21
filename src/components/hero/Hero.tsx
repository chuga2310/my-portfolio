import type { LangContent } from '../../lib/types';
import { HeroScene } from './HeroScene';

interface Props { t: LangContent; }

function scrollTo(id: string, e: React.MouseEvent) {
  e.preventDefault();
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
}

export function Hero({ t }: Props) {
  return (
    <section id="hero" className="snap" data-screen-label="01 Hero">
      <HeroScene />
      <div className="hero">
        <div>
          <div className="kicker"><span className="accent">●</span>&nbsp;&nbsp;{t.hero.kicker}</div>
          <h1 className="display" style={{ marginTop: 24 }}>
            <span className="holo">{t.hero.name}</span>
          </h1>
          <div className="roles">{t.hero.roles.map((r) => <span key={r}>{r}</span>)}</div>
          <p className="tagline">{t.hero.tagline}</p>
          <div className="ctas">
            <a href="#projects" className="btn primary" onClick={(e) => scrollTo('projects', e)}>
              {t.hero.cta_primary} <span className="arrow">→</span>
            </a>
            <a href="#contact" className="btn ghost" onClick={(e) => scrollTo('contact', e)}>
              {t.hero.cta_secondary}
            </a>
          </div>
          <div className="meta-row">{t.hero.meta.map((m, i) => <span key={i}>· {m}</span>)}</div>
        </div>
      </div>
    </section>
  );
}
