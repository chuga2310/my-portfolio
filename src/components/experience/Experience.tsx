import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import type { LangContent } from '../../lib/types';
import { CONTENT } from '../../lib/content';
import { HIGHLIGHT_EVENT } from '../../lib/jd/highlight';
import type { Highlight } from '../../lib/jd/types';
import { EASE_OUT, PILL_SPRING } from '../../lib/motion';
import { RevealHeading } from '../ui/RevealHeading';
import { Reveal } from '../ui/Reveal';

// JD Matcher highlights match on the English org name, whatever the UI language.
const JD_KEYS = CONTENT.en.exp.items.map((it) => it.org);

interface Props { t: LangContent; }

/**
 * Desktop: a compact timeline (one line per job) beside a detail card for the selected job, so the
 * whole section fits one screen. Below 1024px every row shows its own details instead.
 */
export function Experience({ t }: Props) {
  const e = t.exp;
  const [active, setActive] = useState(0);
  const job = e.items[active];

  useEffect(() => {
    const onHighlight = (ev: Event) => {
      const hit = (ev as CustomEvent<Highlight[]>).detail.find((h) => h.section === 'exp' && JD_KEYS.includes(h.key));
      if (hit) setActive(JD_KEYS.indexOf(hit.key));
    };
    window.addEventListener(HIGHLIGHT_EVENT, onHighlight);
    return () => window.removeEventListener(HIGHLIGHT_EVENT, onHighlight);
  }, []);

  return (
    <section id="exp" className="section section-oat">
      <div className="wrap">
        <div className="eyebrow mono">{e.label}</div>
        <RevealHeading text={e.title} className="section-title serif" />
        <div className="exp-layout">
          <Reveal className="exp-timeline-wrap">
            <ol className="exp-timeline" aria-label={e.rail}>
              {e.items.map((it, i) => (
                <li key={it.y} className={`exp-row${active === i ? ' is-active' : ''}`} data-jd-section="exp" data-jd-key={JD_KEYS[i]}>
                  <button
                    type="button" className="exp-row-head" aria-pressed={active === i} aria-controls="exp-detail"
                    onClick={() => setActive(i)} onMouseEnter={() => setActive(i)} onFocus={() => setActive(i)}
                  >
                    <span className="exp-node" aria-hidden="true">
                      {active === i && <motion.span layoutId="exp-node" className="exp-node-dot" transition={PILL_SPRING} />}
                    </span>
                    <span className="exp-when mono">{it.y}</span>
                    <span className="exp-org serif">{it.org}</span>
                    <span className="exp-role">{it.role}</span>
                  </button>
                  {/* Small screens show every job's details inline. */}
                  <div className="exp-row-body">
                    <span className="exp-loc">{it.loc}</span>
                    <p>{it.body}</p>
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
                  <div className="exp-detail-role">{job.role}</div>
                  <p>{job.body}</p>
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
