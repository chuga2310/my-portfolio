import type { LangContent } from '../../lib/types';

interface Props { t: LangContent; }

export function Contact({ t }: Props) {
  return (
    <section id="contact" className="snap" data-screen-label="09 Contact">
      <div className="kicker">{t.contact.label}</div>
      <h2 className="section-title wide holo">{t.contact.title}</h2>
      <p className="body" style={{ marginTop: 16 }}>{t.contact.sub}</p>
      <div className="contact-grid">
        <div className="contact-links">
          {t.contact.links.map((l) =>
            l.href ? (
              <a key={l.k} className="row link" href={l.href} target={l.href.startsWith('http') ? '_blank' : undefined} rel="noreferrer">
                <div className="k">{l.k}</div>
                <div className="v">{l.v}</div>
                <div className="arrow">↗</div>
              </a>
            ) : (
              <div key={l.k} className="row">
                <div className="k">{l.k}</div>
                <div className="v">{l.v}</div>
                <div className="arrow">·</div>
              </div>
            )
          )}
        </div>
        <div>
          <a className="btn primary" href={`mailto:${t.contact.email}`}>
            {t.contact.cta} <span className="arrow">→</span>
          </a>
          <div className="foot-mono">{t.contact.foot}</div>
        </div>
      </div>
    </section>
  );
}
