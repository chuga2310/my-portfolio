import { motion } from 'motion/react';
import type { JdContent } from '../../lib/types';
import { fmt, formatMs } from '../../lib/jd/format';
import { STAGE_IDS, type Provider, type RouteReason } from '../../lib/jd/types';
import type { StageState, Stages } from './panelState';
import { Check, Close, Minus } from '../ui/icons';

function StageIcon({ status }: { status: StageState['status'] }) {
  if (status === 'running') return <span className="jd-stage-icon is-running"><span className="jd-spinner is-xs" /></span>;
  const glyph = status === 'done' ? <Check size={11} strokeWidth={3.2} />
    : status === 'failed' ? <Close size={11} strokeWidth={3} />
      : status === 'skipped' ? <Minus size={11} strokeWidth={3} /> : null;
  return (
    <motion.span
      key={status} className={`jd-stage-icon is-${status}`}
      initial={status === 'pending' ? false : { scale: 0.6, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 500, damping: 26 }}
    >
      {glyph}
    </motion.span>
  );
}
const REASONS: RouteReason[] = ['offline', 'busy', 'not_configured'];

function providerName(provider: Provider, model: string | undefined, t: JdContent): string {
  if (provider === 'openai') return 'OpenAI';
  const base = model?.replace(/\s*\(.*\)\s*$/, '').trim() || 'Qwen3-4B';
  return `${base} · ${t.provider.self}`;
}

/** The provider that actually ran most recently (a call may fall back mid-run). */
function currentProvider(stages: Stages): { provider: Provider; model?: string } | null {
  for (let i = STAGE_IDS.length - 1; i >= 0; i--) {
    const s = stages[STAGE_IDS[i]];
    if (s.provider && s.status !== 'pending') return { provider: s.provider, model: s.model };
  }
  return null;
}

export function ProviderBadge({ stages, t }: { stages: Stages; t: JdContent }) {
  const cur = currentProvider(stages);
  if (!cur) return null;
  const reason = stages.route.meta?.reason;
  const knownReason = REASONS.find((r) => r === reason);
  return (
    <div className={`jd-provider is-${cur.provider}`}>
      <span className="jd-provider-pill mono" title={cur.model}>
        <span className="jd-provider-dot" aria-hidden="true" />
        {providerName(cur.provider, cur.model, t)}
      </span>
      {cur.provider === 'openai' && (
        <span className="jd-provider-reason">
          {t.provider.fallback}{knownReason ? `: ${t.provider.reasons[knownReason]}` : ''}
        </span>
      )}
    </div>
  );
}

interface Props { t: JdContent; stages: Stages; }

export function PipelineTimeline({ t, stages }: Props) {
  const routed = stages.route.provider;
  return (
    <ol className="jd-timeline" aria-label={t.pipeline}>
      {STAGE_IDS.map((id) => {
        const s = stages[id];
        const running = s.status === 'running';
        const switched = id !== 'route' && s.provider && routed && s.provider !== routed;
        // Second line: the server's detail; once the stage is over, its last activity line;
        // older servers without labels fall back to what the meta says.
        let detail = s.detail ?? (running ? undefined : s.activity.at(-1));
        if (!detail && !s.label && id === 'extract' && s.meta?.title !== undefined) {
          detail = fmt(t.extracted, { title: String(s.meta.title), n: Number(s.meta.requirements ?? 0) });
        }
        if (!detail && !s.label && id === 'route' && s.status === 'failed') {
          const reason = REASONS.find((r) => r === s.meta?.reason);
          if (reason) detail = t.provider.reasons[reason];
        }
        const firstSeq = s.activitySeq - s.activity.length;
        return (
          <li key={id} className={`jd-stage is-${s.status}`}>
            <span className="jd-stage-mark" aria-hidden="true"><StageIcon status={s.status} /></span>
            <span className="jd-stage-body">
              {/* Server text is rendered as text, never as HTML. */}
              <span className="jd-stage-label">{s.label ?? t.stages[id]}</span>
              {detail && <span className="jd-stage-detail">{detail}</span>}
              {running && s.activity.length > 0 && (
                <span className="jd-activity">
                  {s.activity.map((line, i) => (
                    <motion.span
                      key={firstSeq + i} className="jd-activity-line mono"
                      initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}
                    >
                      {line}
                    </motion.span>
                  ))}
                </span>
              )}
              {switched && s.provider && (
                <span className="jd-stage-meta switch">→ {providerName(s.provider, s.model, t)}</span>
              )}
            </span>
            <span className="jd-stage-ms mono">
              {s.ms !== undefined && s.status === 'done' ? formatMs(s.ms) : ''}
              <span className="sr-only"> {t.status[s.status]}</span>
            </span>
          </li>
        );
      })}
    </ol>
  );
}
