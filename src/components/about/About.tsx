import type { LangContent } from '../../lib/types';
import { RevealHeading } from '../ui/RevealHeading';
import { Reveal } from '../ui/Reveal';
import { CountUp } from '../ui/CountUp';
import { HomeScene } from './HomeScene';

interface Props { t: LangContent; }

export function About({ t }: Props) {
  const a = t.about;
  return (
    <section id="about" className="section section-oat">
      <div className="wrap">
        <div className="eyebrow mono">{a.label}</div>
        <RevealHeading text={a.title} className="section-title serif about-title" mutedAfterComma={false} />
        <div className="about-grid">
          <Reveal className="about-copy">
            <p className="lead">{a.body}</p>
            <dl className="stat-row">
              {a.stats.map((s) => (
                <div key={s.k} className="stat">
                  <dt>{s.k}</dt>
                  <dd className="serif"><CountUp value={s.v} /></dd>
                </div>
              ))}
            </dl>
          </Reveal>
          <Reveal className="about-figure-wrap" delay={0.1}>
            <figure className="about-figure">
              <HomeScene
                d={a.day}
                place={(
                  <div className="about-place">
                    <div>
                      <div className="about-label">{a.mapLabel}</div>
                      <div className="about-city serif">{a.mapCity}</div>
                    </div>
                    <div className="about-coord mono">{a.mapCoord.replace(', ', '\n')}</div>
                  </div>
                )}
                note={<p className="about-note">{a.mapNote}</p>}
              />
            </figure>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
