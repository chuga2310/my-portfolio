import { useEffect, useState } from 'react';
import { animate, motion, useMotionValue, useReducedMotion, useTransform } from 'motion/react';
import type { JdContent } from '../../lib/types';
import { fmt } from '../../lib/jd/format';
import { highlightOnPage } from '../../lib/jd/highlight';
import { EASE_OUT } from '../../lib/motion';
import { GROUP_IDS, type MatchResult as Result, type Verdict } from '../../lib/jd/types';
import { SectionBars } from './SectionBars';
import { Sparkle } from '../ui/icons';

const PREVIEW = 4;
const RING_R = 46;

function VerdictList({ t, title, items, empty }: { t: JdContent; title: string; items: Verdict[]; empty?: string }) {
  const [all, setAll] = useState(false);
  const shown = all ? items : items.slice(0, PREVIEW);
  return (
    <div className="jd-verdicts">
      <div className="jd-label mono">{title} · {items.length}</div>
      {items.length === 0 && empty && <p className="jd-muted">{empty}</p>}
      <ul>
        {shown.map((v) => (
          <li key={v.reqId} className={`is-${v.level}`}>
            <span className={`jd-level is-${v.level}`}>{t.levels[v.level]}</span>
            <span className="jd-req">
              {v.requirement}
              {v.note && <span className="jd-note">{v.note}</span>}
            </span>
          </li>
        ))}
      </ul>
      {items.length > PREVIEW && (
        <button type="button" className="jd-link" aria-expanded={all} onClick={() => setAll(!all)}>
          {all ? t.result.showLess : fmt(t.result.showAll, { n: items.length })}
        </button>
      )}
    </div>
  );
}

/** Ring that draws to the score while the number counts up. */
function ScoreRing({ value, label }: { value: number; label: string }) {
  const reduce = useReducedMotion();
  const count = useMotionValue(reduce ? value : 0);
  const shown = useTransform(count, (v) => `~${Math.round(v)}%`);
  useEffect(() => {
    if (reduce) return;
    const c = animate(count, value, { duration: 1.1, ease: EASE_OUT });
    return () => c.stop();
  }, [count, value, reduce]);
  return (
    <div className="jd-score" role="img" aria-label={label}>
      <svg viewBox="0 0 104 104" aria-hidden="true">
        <circle cx="52" cy="52" r={RING_R} className="jd-score-track" />
        <motion.circle
          cx="52" cy="52" r={RING_R} className="jd-score-fill" transform="rotate(-90 52 52)"
          initial={{ pathLength: reduce ? value / 100 : 0 }} animate={{ pathLength: value / 100 }}
          transition={{ duration: 1.1, ease: EASE_OUT }}
        />
      </svg>
      <motion.span className="jd-score-num serif" aria-hidden="true">{shown}</motion.span>
    </div>
  );
}

interface Props { t: JdContent; result: Result; }

export function MatchResult({ t, result }: Props) {
  const { highlights } = result;
  // No verdict in a group = the JD does not mention it (its section score only mirrors overall).
  const verdicts = [...result.matched, ...result.gaps];
  const unmentioned = GROUP_IDS.filter((g) => !verdicts.some((v) => v.group === g));
  return (
    <div className="jd-result">
      <div className="jd-score-row">
        <ScoreRing value={result.overall} label={`${t.result.score}: ~${result.overall}%`} />
        <div className="jd-score-meta">
          <span className={`jd-tier is-${result.tier}`}>{t.tiers[result.tier]}</span>
          <span className="jd-job">
            {result.job.title}{result.job.seniority ? ` · ${result.job.seniority}` : ''}
          </span>
          {result.cached && <span className="jd-cached mono">{t.result.cached}</span>}
        </div>
      </div>

      <p className="jd-summary">{result.summary}</p>

      <SectionBars t={t} sections={result.sections} unmentioned={unmentioned} />

      {highlights.length > 0 && (
        <div className="jd-evidence">
          <button
            type="button"
            className="btn btn-dark btn-sm"
            aria-describedby="jd-highlight-hint"
            onClick={() => highlightOnPage(highlights)}
          >
            <Sparkle size={15} /> {t.result.highlight}
          </button>
          <span id="jd-highlight-hint" className="sr-only">{t.result.highlightHint}</span>
          <div className="jd-chips" aria-label={t.result.evidence}>
            {highlights.map((h) => (
              <button key={h.id} type="button" className="jd-chip" onClick={() => highlightOnPage([h])}>
                {h.label}
              </button>
            ))}
          </div>
        </div>
      )}

      <VerdictList t={t} title={t.result.matched} items={result.matched} />
      <VerdictList t={t} title={t.result.gaps} items={result.gaps} empty={t.result.noGaps} />
    </div>
  );
}
