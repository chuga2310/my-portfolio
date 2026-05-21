import { useState, useEffect } from 'react';
import type { LangContent } from '../../lib/types';

interface Props { t: LangContent; }

function AgentsDiagram({ t }: Props) {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    let raf: number, last = performance.now();
    const loop = (now: number) => {
      if (now - last > 120) { setTick((x) => x + 1); last = now; }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);
  const active = tick % t.agents.nodes.length;
  return (
    <div className="agents-canvas">
      <div className="agents-row">
        {t.agents.nodes.map((n, i) => (
          <div
            key={n.id}
            className={`agent-node ${n.id}${active === i ? ' live' : ''}`}
            style={active === i ? {
              borderColor: 'var(--accent)',
              boxShadow: '0 0 0 1px rgba(var(--accent-rgb),0.6), 0 0 40px rgba(var(--accent-rgb),0.25)',
              background: 'rgba(var(--accent-rgb),0.06)',
            } : undefined}
          >
            <div className="num">{String(i + 1).padStart(2, '0')}</div>
            <div className="lab">{n.label}</div>
            <div className="sublab">{n.sub}</div>
          </div>
        ))}
      </div>
      <div className="agents-loops">
        {t.agents.loops.map((l) => <span key={l} className="l">{l}</span>)}
      </div>
      <div className="agents-note">{t.agents.note}</div>
    </div>
  );
}

export function Agents({ t }: Props) {
  return (
    <section id="agents" className="snap" data-screen-label="06 Agents">
      <div className="kicker">{t.agents.label}</div>
      <h2 className="section-title wide holo">{t.agents.title}</h2>
      <p className="body" style={{ marginTop: 16 }}>{t.agents.sub}</p>
      <AgentsDiagram t={t} />
    </section>
  );
}
