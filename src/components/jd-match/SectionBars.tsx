import type { JdContent } from '../../lib/types';
import { GROUP_IDS, type GroupId, type SectionEvent } from '../../lib/jd/types';

interface Props {
  t: JdContent;
  /** Streaming: section events as they arrive. Done: the result's section scores. */
  sections: Partial<Record<GroupId, SectionEvent | number>>;
}

export function SectionBars({ t, sections }: Props) {
  return (
    <div className="jd-bars">
      {GROUP_IDS.map((g) => {
        const v = sections[g];
        const score = typeof v === 'number' ? v : v?.score;
        const known = score !== undefined;
        const counts = typeof v === 'object'
          ? `${t.levels.strong} ${v.strong} · ${t.levels.partial} ${v.partial} · ${t.levels.transferable} ${v.transferable} · ${t.levels.gap} ${v.gap}`
          : undefined;
        const pct = Math.max(0, Math.min(100, Math.round(score ?? 0)));
        return (
          <div className={`jd-bar${known ? ' is-in' : ''}`} key={g} title={counts}>
            <span className="jd-bar-label" id={`jd-bar-${g}`}>{t.groups[g]}</span>
            <span
              className="jd-bar-track"
              role="meter"
              aria-labelledby={`jd-bar-${g}`}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={pct}
              aria-valuetext={known ? `${pct}%` : t.status.pending}
            >
              <span className="jd-bar-fill" style={{ width: `${pct}%` }} />
            </span>
            <span className="jd-bar-val" aria-hidden="true">{known ? pct : '—'}</span>
          </div>
        );
      })}
    </div>
  );
}
