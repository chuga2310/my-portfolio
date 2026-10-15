import type { Lang, LangContent } from '../../lib/types';
import { JdMatchPanel } from '../jd-match/JdMatchPanel';

interface Props { t: LangContent; lang: Lang; }

function scrollTo(id: string, e: React.MouseEvent) {
  e.preventDefault();
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
}

export function Hero({ t, lang }: Props) {
  return (
    <section id="hero" className="snap" data-screen-label="01 Hero">
      <div className="hero-grid">
        <div className="hero hero-intro">
          <div className="kicker"><span className="accent">●</span>&nbsp;&nbsp;{t.hero.kicker}</div>
          <h1 className="display" style={{ marginTop: 24 }}>
            <span className="holo">{t.hero.name}</span>
          </h1>
          <div className="roles">{t.hero.roles.map((r) => <span key={r}>{r}</span>)}</div>
          <p className="tagline">{t.hero.tagline}</p>
        </div>
        <div className="hero-panel">
          <JdMatchPanel t={t} lang={lang} />
        </div>
        <div className="hero hero-rest">
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
