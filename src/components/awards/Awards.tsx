import type { LangContent } from '../../lib/types';
import { RevealHeading } from '../ui/RevealHeading';
import { Reveal } from '../ui/Reveal';
import { Cap } from '../ui/icons';

interface Props { t: LangContent; }

export function Awards({ t }: Props) {
  const w = t.awards;
  return (
    <section id="awards" className="section section-ivory">
      <div className="wrap">
        <div className="eyebrow mono">{w.label}</div>
        <RevealHeading text={w.title} className="section-title serif" />
        <div className="awards-grid">
          <ol className="awards-list">
            {w.awards.map((a, i) => (
              <li key={a.t}>
                <Reveal className="award" delay={i * 0.05} y={12}>
                  <span className="award-y mono">{a.y}</span>
                  <div>
                    <div className="award-t serif">{a.t}</div>
                    <div className="award-s">{a.s}</div>
                  </div>
                </Reveal>
              </li>
            ))}
          </ol>
          <Reveal className="edu-card" delay={0.1}>
            <div className="edu-label"><Cap size={18} />Education</div>
            <div className="edu-school serif">{w.edu.school}</div>
            <div className="edu-degree">{w.edu.degree}</div>
            <div className="edu-years mono">{w.edu.years}</div>
            <div className="edu-gpa">{w.edu.gpa}</div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
