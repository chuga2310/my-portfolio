import type { LangContent } from '../../lib/types';
import { TiltCard } from '../ui/TiltCard';

interface Props { t: LangContent; }

export function Awards({ t }: Props) {
  return (
    <section id="awards" className="snap" data-screen-label="08 Awards">
      <div className="kicker">{t.awards.label}</div>
      <h2 className="section-title holo">{t.awards.title}</h2>
      <div className="awards-grid">
        <div className="awards-list">
          {t.awards.awards.map((a, i) => (
            <div className="item" key={i}>
              <div className="y">{a.y}</div>
              <div>
                <div className="t">{a.t}</div>
                <div className="s">{a.s}</div>
              </div>
            </div>
          ))}
        </div>
        <TiltCard className="edu-card" intensity={4}>
          <div className="label-mono" style={{ color: 'var(--accent)' }}>Education</div>
          <div className="degree">{t.awards.edu.school}</div>
          <div style={{ color: 'var(--text-mute)', fontSize: 14, marginTop: 4 }}>{t.awards.edu.degree}</div>
          <div className="years">{t.awards.edu.years}</div>
          <div className="gpa">{t.awards.edu.gpa}</div>
        </TiltCard>
      </div>
    </section>
  );
}
