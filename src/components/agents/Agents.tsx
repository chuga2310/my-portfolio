import { useEffect, useRef, useState, type ReactNode } from 'react';
import { useReducedMotion } from 'motion/react';
import type { AgentId, LangContent, OfficeLine, OfficeScenario } from '../../lib/types';
import { RevealHeading } from '../ui/RevealHeading';
import { Reveal } from '../ui/Reveal';
import { Alert, ArrowUp, Branch, Bug, Check } from '../ui/icons';
import { createOffice, SCENARIOS, type Office } from './office';

interface Props { t: LangContent; }

const ICONS: Record<OfficeScenario, ReactNode> = {
  ship: <Check size={14} strokeWidth={2.4} />,
  review: <Alert size={14} />,
  bug: <Bug size={14} />,
  parallel: <Branch size={14} />,
};

/**
 * The AIDLC team as a pixel office on one canvas. A request typed above lands on the orchestrator in
 * the middle, which routes it desk by desk; the scenario buttons replay the happy path, a failed
 * review, a bug found in testing, or three tasks in their own git worktrees. Only the prompt, the
 * buttons and the status line are DOM.
 */
export function Agents({ t }: Props) {
  const a = t.agents;
  const canvas = useRef<HTMLCanvasElement>(null);
  const typed = useRef<HTMLSpanElement>(null);
  const office = useRef<Office | null>(null);
  const text = useRef(a);
  const reduce = useReducedMotion();
  const [playing, setPlaying] = useState<OfficeScenario | null>(null);
  const [status, setStatus] = useState<{ who: AgentId | 'you'; line: OfficeLine; lane: string | null } | null>(null);

  useEffect(() => {
    const el = canvas.current;
    if (!el) return;
    const o = createOffice(el, {
      getText: () => text.current,
      onType: (s) => { if (typed.current) typed.current.textContent = s; },
      onLine: (who, line, lane) => setStatus(who && line ? { who, line, lane } : null),
      onScenario: setPlaying,
    });
    office.current = o;
    o.resize();
    const ro = new ResizeObserver(() => o.resize());
    ro.observe(el.parentElement ?? el);
    const io = new IntersectionObserver(([e]) => o.setVisible(e.isIntersecting), { threshold: 0.25 });
    io.observe(el);
    return () => { ro.disconnect(); io.disconnect(); o.destroy(); office.current = null; };
  }, []);

  useEffect(() => { text.current = a; office.current?.sync(); }, [a]);
  useEffect(() => { office.current?.setReduced(!!reduce); }, [reduce]);

  const speaker = status ? (status.who === 'you' ? a.you : a.nodes.find((n) => n.id === status.who)?.label) : undefined;
  const prompt = playing === 'parallel' ? a.prompts.parallel : a.prompts.single;

  return (
    <section id="agents" className="section section-white">
      <div className="wrap">
        <Reveal className="office-frame">
          <div className="office-bar">
            <div className="office-prompt">
              <span className="office-you">{a.you}</span>
              <p className="office-prompt-text">
                <span className="office-to mono">{a.to}</span>
                <span className="sr-only">{prompt}</span>
                <span ref={typed} aria-hidden="true" />
                <span className="office-caret" aria-hidden="true" />
              </p>
              <span className="office-send" aria-hidden="true"><ArrowUp size={14} strokeWidth={2.4} /></span>
            </div>
            <div className="office-scenarios" role="group" aria-label={a.scenarioLabel}>
              {SCENARIOS.map((id) => (
                <button
                  key={id} type="button" className={`office-scn is-${id}`} aria-pressed={playing === id}
                  onClick={() => office.current?.play(id)}
                >
                  {ICONS[id]}{a.scenarios[id]}
                </button>
              ))}
            </div>
            <p className="office-status" aria-live="polite">
              {speaker && status && <>{status.lane && <span className="office-lane mono">{status.lane}</span>}<b>{speaker}</b> — {a.lines[status.line]}</>}
            </p>
          </div>
          <div className="office-stage">
            {/* Sits on the scene's wall strip on wide screens; above the scene on narrow ones. */}
            <div className="office-intro">
              <div className="eyebrow mono">{a.label}</div>
              <RevealHeading text={a.title} className="section-title serif agents-title" mutedAfterComma={false} />
              <p className="agents-sub">{a.sub}</p>
              <p className="agents-note">{a.note}</p>
            </div>
            <canvas
              ref={canvas} role="img" aria-label={a.office}
              onPointerMove={(e) => {
                const r = e.currentTarget.getBoundingClientRect();
                office.current?.pointer(e.clientX - r.left, e.clientY - r.top);
              }}
              onPointerLeave={() => office.current?.pointer(null)}
            />
          </div>
          <ol className="sr-only" aria-label={a.office}>
            {a.nodes.map((n) => <li key={n.id}>{n.label}: {n.sub}</li>)}
          </ol>
        </Reveal>
      </div>
    </section>
  );
}
