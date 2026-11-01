import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import type { ExpItem, Lang, LangContent } from '../../lib/types';
import { formatSpan, jobMonths } from '../../lib/career';
import { LOGOS } from '../../lib/logos';
import { Logo } from '../ui/Logo';
import { HIGHLIGHT_EVENT } from '../../lib/jd/highlight';
import type { Highlight } from '../../lib/jd/types';
import { EASE_OUT, PILL_SPRING } from '../../lib/motion';
import { RevealHeading } from '../ui/RevealHeading';
import { Reveal } from '../ui/Reveal';

/** `en` is the page's English content: JD Matcher highlights match on the English org name, whatever the UI language. */
interface Props { t: LangContent; lang: Lang; en: LangContent; }

/**
 * Desktop: a compact timeline (one line per job) beside a detail card for the selected job, so the
 * whole section fits one screen. Below 1024px every row shows its own details instead.
 */
export function Experience({ t, lang, en }: Props) {
  const e = t.exp;
  const jdKeys = useMemo(() => en.exp.items.map((it) => it.org), [en]);
  const [active, setActive] = useState(0);
  const job = e.items[active];

  useEffect(() => {
    const onHighlight = (ev: Event) => {
      const hit = (ev as CustomEvent<Highlight[]>).detail.find((h) => h.section === 'exp' && jdKeys.includes(h.key));
      if (hit) setActive(jdKeys.indexOf(hit.key));
    };
    window.addEventListener(HIGHLIGHT_EVENT, onHighlight);
    return () => window.removeEventListener(HIGHLIGHT_EVENT, onHighlight);
  }, [jdKeys]);

  return (
    <section id="exp" className="section section-oat">
      <div className="wrap">
        <div className="eyebrow mono">{e.label}</div>
        <RevealHeading text={e.title} className="section-title serif" />
        <div className="exp-layout">
          <Reveal className="exp-timeline-wrap">
            <ol className="exp-timeline" aria-label={e.rail}>
              {e.items.map((it, i) => (
                <li key={it.y} className={`exp-row${active === i ? ' is-active' : ''}`} data-jd-section="exp" data-jd-key={jdKeys[i]}>
                  <button
                    type="button" className="exp-row-head" aria-pressed={active === i} aria-controls="exp-detail"
                    onClick={() => setActive(i)} onMouseEnter={() => setActive(i)} onFocus={() => setActive(i)}
                  >
                    <span className="exp-node" aria-hidden="true">
                      {active === i && <motion.span layoutId="exp-node" className="exp-node-dot" transition={PILL_SPRING} />}
                    </span>
                    <span className="exp-when mono">{it.y}<span className="exp-span">{formatSpan(jobMonths(it), lang)}</span></span>
                    <span className="exp-org serif">{it.org}</span>
                    <span className="exp-role">{it.role}</span>
                  </button>
                  {/* Small screens show every job's details inline. */}
                  <div className="exp-row-body">
                    <span className="exp-loc">{it.loc}</span>
                    <p>{it.body}</p>
                    <JobTools job={it} label={e.stack} />
                  </div>
                </li>
              ))}
            </ol>
          </Reveal>
          <Reveal className="exp-detail-wrap" delay={0.1}>
            <div id="exp-detail" className="exp-detail" aria-live="polite">
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={active} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.25, ease: EASE_OUT }}
                >
                  <div className="exp-detail-top">
                    <span className="mono exp-detail-when">{job.y}</span>
                    <span className="exp-loc">{job.loc}</span>
                  </div>
                  <h3 className="serif">{job.org}</h3>
                  <div className="exp-detail-role">{job.role} · <span className="exp-detail-span">{formatSpan(jobMonths(job), lang)}</span></div>
                  <p>{job.body}</p>
                  <JobTools job={job} label={e.stack} />
                  <div className="exp-detail-count mono" aria-hidden="true">
                    {String(active + 1).padStart(2, '0')} / {String(e.items.length).padStart(2, '0')}
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/** The tools a job used, as small logo chips. */
function JobTools({ job, label }: { job: ExpItem; label: string }) {
  return (
    <ul className="exp-tools" aria-label={label}>
      {job.tools.map((id) => (
        <li key={id} className="exp-tool"><Logo id={id} size={13} />{LOGOS[id].title}</li>
      ))}
    </ul>
  );
}
