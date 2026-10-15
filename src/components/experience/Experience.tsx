import type { LangContent } from '../../lib/types';
import { CONTENT } from '../../lib/content';

// JD Matcher highlights match on the English org name, whatever the UI language.
const JD_KEYS = CONTENT.en.exp.items.map((it) => it.org);

interface Props { t: LangContent; }

export function Experience({ t }: Props) {
  return (
    <section id="exp" className="snap" data-screen-label="04 Experience">
      <div className="kicker">{t.exp.label}</div>
      <h2 className="section-title holo">{t.exp.title}</h2>
      <div className="timeline">
        {t.exp.items.map((it, i) => (
          <div className="timeline-row" key={i} data-jd-section="exp" data-jd-key={JD_KEYS[i]}>
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
