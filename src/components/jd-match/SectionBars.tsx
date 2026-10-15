import type { JdContent } from '../../lib/types';
import { GROUP_IDS, type GroupId, type SectionEvent } from '../../lib/jd/types';

interface Props {
  t: JdContent;
  /** Streaming: section events as they arrive. Done: the result's section scores. */
  sections: Partial<Record<GroupId, SectionEvent | number>>;
  /** Groups the JD does not mention (when `sections` carries scores only). */
  unmentioned?: GroupId[];
}

/** A section event with no verdicts at all: the JD does not mention the group and its score only mirrors overall. */
const isEmpty = (v: SectionEvent | number | undefined) =>
  typeof v === 'object' && v.strong + v.partial + v.transferable + v.gap === 0;

export function SectionBars({ t, sections, unmentioned = [] }: Props) {
  const na = (g: GroupId) => unmentioned.includes(g) || isEmpty(sections[g]);
  // Unmentioned groups go last; the rest keep the fixed order.
  const order = [...GROUP_IDS.filter((g) => !na(g)), ...GROUP_IDS.filter(na)];

  return (
    <div className="jd-bars">
      {order.map((g) => {
        const v = sections[g];
        const label = <span className="jd-bar-label" id={`jd-bar-${g}`}>{t.groups[g]}</span>;

        if (na(g)) {
          return (
            <div className="jd-bar is-na" key={g}>
              {label}
              <span className="jd-bar-track" aria-hidden="true" />
              <span className="jd-bar-val">{t.groupNotMentioned}</span>
            </div>
          );
        }

        const score = typeof v === 'number' ? v : v?.score;
        const known = score !== undefined;
        const counts = typeof v === 'object'
          ? `${t.levels.strong} ${v.strong} · ${t.levels.partial} ${v.partial} · ${t.levels.transferable} ${v.transferable} · ${t.levels.gap} ${v.gap}`
          : undefined;
        const pct = Math.max(0, Math.min(100, Math.round(score ?? 0)));
        return (
          <div className={`jd-bar${known ? ' is-in' : ''}`} key={g}>
            <span className="jd-bar-label" id={`jd-bar-${g}`} title={counts}>{t.groups[g]}</span>
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
