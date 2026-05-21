import type { LangContent } from '../../lib/types';
import { TiltCard } from '../ui/TiltCard';

interface Props { t: LangContent; }

export function Skills({ t }: Props) {
  return (
    <section id="skills" className="snap" data-screen-label="03 Skills">
      <div className="kicker">{t.skills.label}</div>
      <h2 className="section-title holo">{t.skills.title}</h2>
      <div className="skills-grid">
        {t.skills.cards.map((c) => (
          <TiltCard key={c.tag} className="skill-card">
            <span className="tag">{c.tag}</span>
            <h3>{c.title}</h3>
            <p>{c.body}</p>
            <div className="chips">{c.chips.map((ch) => <span key={ch} className="chip">{ch}</span>)}</div>
          </TiltCard>
        ))}
      </div>
    </section>
  );
}
