import type { LangContent } from '../../lib/types';
import { RevealHeading } from '../ui/RevealHeading';
import { Reveal } from '../ui/Reveal';
import { CountUp } from '../ui/CountUp';

interface Props { t: LangContent; }

export function Metrics({ t }: Props) {
  return (
    <section id="metrics" className="section section-dark">
      <div className="wrap">
        <div className="eyebrow mono">{t.metrics.label}</div>
        <RevealHeading text={t.metrics.title} className="section-title serif" />
        <dl className="metrics-grid">
          {t.metrics.items.map((m, i) => (
            <Reveal key={m.k} className="metric" delay={(i % 3) * 0.06}>
              <dt className="metric-k">{m.k}</dt>
              <dd className="metric-v serif"><CountUp value={m.v} /></dd>
              <dd className="metric-sub">{m.sub}</dd>
            </Reveal>
          ))}
        </dl>
      </div>
    </section>
  );
}
