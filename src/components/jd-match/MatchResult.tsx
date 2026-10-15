import { useState } from 'react';
import type { JdContent } from '../../lib/types';
import { fmt } from '../../lib/jd/format';
import { highlightOnPage } from '../../lib/jd/highlight';
import { GROUP_IDS, type MatchResult as Result, type Verdict } from '../../lib/jd/types';
import { SectionBars } from './SectionBars';

const PREVIEW = 4;

function VerdictList({ t, title, items, empty }: { t: JdContent; title: string; items: Verdict[]; empty?: string }) {
  const [all, setAll] = useState(false);
  const shown = all ? items : items.slice(0, PREVIEW);
  return (
    <div className="jd-verdicts">
      <div className="label-mono">{title} · {items.length}</div>
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

interface Props { t: JdContent; result: Result; }

export function MatchResult({ t, result }: Props) {
  const { highlights } = result;
  // No verdict in a group = the JD does not mention it (its section score only mirrors overall).
  const verdicts = [...result.matched, ...result.gaps];
  const unmentioned = GROUP_IDS.filter((g) => !verdicts.some((v) => v.group === g));
  return (
    <div className="jd-result">
      <div className="jd-score-row">
        <div className="jd-score" aria-label={`${t.result.score}: ~${result.overall}%`}>
          <span className="holo">~{result.overall}%</span>
        </div>
        <div className="jd-score-meta">
          <span className={`jd-tier is-${result.tier}`}>{t.tiers[result.tier]}</span>
          <span className="jd-job">
            {result.job.title}{result.job.seniority ? ` · ${result.job.seniority}` : ''}
          </span>
          {result.cached && <span className="jd-cached">{t.result.cached}</span>}
        </div>
      </div>

      <p className="jd-summary">{result.summary}</p>

      <SectionBars t={t} sections={result.sections} unmentioned={unmentioned} />

      {highlights.length > 0 && (
        <div className="jd-evidence">
          <button
            type="button"
            className="btn primary jd-btn jd-highlight-btn"
            aria-describedby="jd-highlight-hint"
            onClick={() => highlightOnPage(highlights)}
          >
            ✦ {t.result.highlight}
          </button>
          <span id="jd-highlight-hint" className="sr-only">{t.result.highlightHint}</span>
          <div className="chips" aria-label={t.result.evidence}>
            {highlights.map((h) => (
              <button key={h.id} type="button" className="chip jd-chip" onClick={() => highlightOnPage([h])}>
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
