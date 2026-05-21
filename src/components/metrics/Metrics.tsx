import type { LangContent } from '../../lib/types';

interface Props { t: LangContent; }

export function Metrics({ t }: Props) {
  return (
    <section id="metrics" className="snap" data-screen-label="07 Metrics">
      <div className="kicker">{t.metrics.label}</div>
      <h2 className="section-title holo">{t.metrics.title}</h2>
      <div className="metrics-grid">
        {t.metrics.items.map((m, i) => (
          <div className="metric-cell" key={i}>
            <div className="v">{m.v}</div>
            <div className="k">{m.k}</div>
            <div className="sub">{m.sub}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
