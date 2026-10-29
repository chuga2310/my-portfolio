import type { ExpItem, Lang } from './types';

// Job durations come from each job's start/end month, so they stay in step with the timeline.

/** 'YYYY-MM' → months since year 0; null means the job is ongoing. */
function monthIndex(ym: string | null, now = new Date()) {
  if (!ym) return now.getFullYear() * 12 + now.getMonth();
  const [y, m] = ym.split('-').map(Number);
  return y * 12 + (m - 1);
}

export function jobMonths(job: Pick<ExpItem, 'from' | 'to'>) {
  return Math.max(1, monthIndex(job.to) - monthIndex(job.from));
}

/** "3 yrs 5 mos" / "3 năm 5 tháng". */
export function formatSpan(months: number, lang: Lang) {
  const y = Math.floor(months / 12);
  const m = months % 12;
  if (lang === 'vi') return [y && `${y} năm`, m && `${m} tháng`].filter(Boolean).join(' ');
  return [y && `${y} yr${y > 1 ? 's' : ''}`, m && `${m} mo${m > 1 ? 's' : ''}`].filter(Boolean).join(' ');
}
