import type { LangContent } from '../../lib/types';

interface Props { t: LangContent; }

export function Experience({ t }: Props) {
  return (
    <section id="exp" className="snap" data-screen-label="04 Experience">
      <div className="kicker">{t.exp.label}</div>
      <h2 className="section-title holo">{t.exp.title}</h2>
      <div className="timeline">
        {t.exp.items.map((it, i) => (
          <div className="timeline-row" key={i}>
            <div className="timeline-y">{it.y}</div>
            <div className="timeline-r">
              <div className="org">{it.org}<span className="role">{it.role}</span></div>
              <div className="loc">{it.loc}</div>
              <div className="body">{it.body}</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
