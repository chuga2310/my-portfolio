import type { LangContent } from '../../lib/types';
import { HanoiGlobe } from './HanoiGlobe';

interface Props { t: LangContent; accentHex: string; }

export function About({ t, accentHex }: Props) {
  return (
    <section id="about" className="snap" data-screen-label="02 About">
      <div className="kicker">{t.about.label}</div>
      <h2 className="section-title wide holo">{t.about.title}</h2>
      <div className="about-grid">
        <div>
          <p className="body">{t.about.body}</p>
          <div className="about-stats">
            {t.about.stats.map((s) => (
              <div className="stat-cell" key={s.k}>
                <div className="v">{s.v}</div>
                <div className="k">{s.k}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="globe-wrap">
          <div className="corners"><div className="tl" /><div className="br" /></div>
          <HanoiGlobe accentHex={accentHex} />
          <div className="badge">
            <div className="label-mono" style={{ color: 'var(--accent)' }}>{t.about.mapLabel}</div>
            <div className="city">{t.about.mapCity}</div>
            <div className="coord">{t.about.mapCoord}</div>
            <div className="note">{t.about.mapNote}</div>
          </div>
        </div>
      </div>
    </section>
  );
}
