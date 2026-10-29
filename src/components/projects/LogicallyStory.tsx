import { useEffect, useRef, useState } from 'react';
import {
  AnimatePresence, motion, useInView, useMotionValueEvent, useReducedMotion, useScroll, useSpring, type PanInfo,
} from 'motion/react';
import type { FeaturedProject, StoryStep } from '../../lib/types';
import { CARD_SPRING, EASE_OUT } from '../../lib/motion';
import { useMediaQuery } from '../../hooks/useMediaQuery';
import logicallyShot from '../../assets/work/logically.webp';
import { ArrowUp, Check, Replay } from '../ui/icons';

interface Props { p: FeaturedProject; replay: string; label: string; note: string; }

const STEPS = ['retrieved 42 sources · semantic-scholar, serper', 'reranked & deduped → 12 contexts', 'LLM call · anthropic-sonnet-4 · 1.2s'];
const CARD_BG = ['var(--peach)', 'var(--heather)', 'var(--cactus)'];
/** Deck slots, front to back (sizes measured on claude.com's role deck). */
const SLOTS = [{ scale: 1, y: 0 }, { scale: 0.94, y: -26 }, { scale: 0.876, y: -54 }];
const TICKS = 15;
const SWIPE_PX = 110;

/**
 * Research → Cite → Write. On wide screens the band pins for three screens of scroll and each third
 * flicks the front card to the back (with reduced motion the rail and a swipe drive it instead).
 * Below 1024px the three steps stack along a timeline, each card playing as it scrolls into view.
 */
export function LogicallyStory({ p, replay, label, note }: Props) {
  const outer = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const wide = useMediaQuery('(min-width: 1024px)');
  const pinned = wide && !reduce;
  const [idx, setIdx] = useState(0);
  const [run, setRun] = useState(0);
  const { scrollYProgress } = useScroll({ target: outer, offset: ['start start', 'end end'] });
  const step = p.story[idx];
  const last = p.story.length - 1;
  const stacked = !wide;

  // Snap stops sit at 0, ½ and 1 of the pinned travel; the nearest one is the current step.
  useMotionValueEvent(scrollYProgress, 'change', (v) => {
    if (pinned) setIdx(Math.min(last, Math.max(0, Math.round(v * last))));
  });

  function goTo(i: number) {
    const next = Math.min(last, Math.max(0, i));
    const stop = outer.current?.querySelectorAll<HTMLElement>('.story-snap')[next];
    if (pinned && stop) {
      stop.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      setIdx(next);
    }
  }

  if (stacked) return <StoryStack steps={p.story} prompt={p.prompt} shotAlt={p.shot} replay={replay} label={label} />;

  return (
    <div ref={outer} className={`story${pinned ? ' is-pinned' : ''}`}>
      {pinned && p.story.map((s, i) => (
        // One snap stop per step, spread over the pinned travel (story height minus the sticky panel).
        <span key={s.key} className="story-snap" style={{ top: `calc((100% - 100svh + var(--header-h)) * ${i / last})` }} aria-hidden="true" />
      ))}
      <div className="story-sticky">
        <div className="story-band">
          <div className="story-rail" role="group" aria-label={label}>
            <div className="story-ticks" aria-hidden="true">
              {Array.from({ length: TICKS }, (_, i) => (
                <i key={i} className={`${i % 7 === 0 ? 'is-major' : ''}${i <= (idx / last) * (TICKS - 1) ? ' is-passed' : ''}`} />
              ))}
            </div>
            {/* The marker jumps stop to stop; ticks between stops fill in as it passes them. */}
            <motion.span
              className="story-rail-dot" aria-hidden="true"
              initial={false} animate={{ top: `${(idx / last) * 100}%` }} transition={CARD_SPRING}
            />
            {p.story.map((s, i) => (
              <button
                key={s.key} type="button" className={`story-stop mono${idx === i ? ' is-active' : ''}`}
                style={{ top: `${(i / last) * 100}%` }} aria-current={idx === i ? 'step' : undefined} onClick={() => goTo(i)}
              >
                {s.key}
              </button>
            ))}
          </div>

          <div className="story-copy">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={idx} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.3, ease: EASE_OUT }}
              >
                <span className="story-step mono">{`0${idx + 1} / 0${p.story.length} · ${step.key}`}</span>
                <h4 className="serif">{step.title}</h4>
                <p>{step.body}</p>
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="deck-wrap">
            <Deck idx={idx} run={run} prompt={p.prompt} shotAlt={p.shot} onSwipe={(dir) => goTo(idx + dir)} />
            {/* Replays the front card's animation, like a video control in the card's corner. */}
            <button type="button" className="deck-replay" aria-label={replay} title={replay} onClick={() => setRun((r) => r + 1)}>
              <Replay size={15} />
            </button>
          </div>
        </div>
        {pinned && <p className="story-note mono">{note}</p>}
      </div>
    </div>
  );
}

interface StackProps { steps: StoryStep[]; prompt: string; shotAlt: string; replay: string; label: string; }

/** Phones and tablets: the steps one under another; the timeline fills as the reader scrolls. */
function StoryStack({ steps, prompt, shotAlt, replay, label }: StackProps) {
  const list = useRef<HTMLOListElement>(null);
  const { scrollYProgress } = useScroll({ target: list, offset: ['start 75%', 'end 65%'] });
  const fill = useSpring(scrollYProgress, { stiffness: 140, damping: 30, restDelta: 0.001 });
  return (
    <ol ref={list} className="story-steps" aria-label={label}>
      <motion.span className="story-steps-fill" style={{ scaleY: fill }} aria-hidden="true" />
      {steps.map((s, i) => (
        <StackStep key={s.key} step={s} i={i} total={steps.length} prompt={prompt} shotAlt={shotAlt} replay={replay} />
      ))}
    </ol>
  );
}

interface StepProps { step: StoryStep; i: number; total: number; prompt: string; shotAlt: string; replay: string; }

function StackStep({ step, i, total, prompt, shotAlt, replay }: StepProps) {
  const card = useRef<HTMLDivElement>(null);
  // The card's animation starts the first time it is mostly on screen; replay restarts it.
  const seen = useInView(card, { once: true, amount: 0.5 });
  const [run, setRun] = useState(0);
  return (
    <li className={`story-steps-item${seen ? ' is-on' : ''}`}>
      <span className="story-steps-dot" aria-hidden="true" />
      <span className="story-step mono">{`0${i + 1} / 0${total} · ${step.key}`}</span>
      <h4 className="serif">{step.title}</h4>
      <p>{step.body}</p>
      <div ref={card} className="story-steps-card tex" style={{ backgroundColor: CARD_BG[i] }}>
        {seen && i === 0 && <ResearchCard key={run} active prompt={prompt} />}
        {seen && i === 1 && <CiteCard key={run} active />}
        {i === 2 && (
          <div className="deck-shot"><img src={logicallyShot} alt={shotAlt} width={1200} height={643} loading="lazy" /></div>
        )}
        {i < 2 && (
          <button type="button" className="deck-replay" aria-label={replay} title={replay} onClick={() => setRun((r) => r + 1)}>
            <Replay size={15} />
          </button>
        )}
      </div>
    </li>
  );
}

interface DeckProps { idx: number; run: number; prompt: string; shotAlt: string; onSwipe: (dir: number) => void; }

function Deck({ idx, run, prompt, shotAlt, onSwipe }: DeckProps) {
  // Remember the previous front card so the card leaving the front can flick instead of sliding.
  const [hist, setHist] = useState({ cur: idx, prev: idx });
  if (hist.cur !== idx) setHist({ cur: idx, prev: hist.cur });
  const forward = idx > hist.prev;

  function animFor(card: number) {
    const slot = (card - idx + 3) % 3;
    const was = (card - hist.prev + 3) % 3;
    const to = SLOTS[slot];
    if (forward && was === 0 && slot === 2) {
      return {
        animate: { rotate: [0, 9, 0], x: [0, 28, 0], y: [0, -20, to.y], scale: [1, 1, to.scale], zIndex: [3, 3, 1] },
        transition: { duration: 0.8, times: [0, 0.42, 1], ease: EASE_OUT },
      };
    }
    if (!forward && was === 2 && slot === 0 && hist.prev !== idx) {
      return {
        animate: { rotate: [0, -6, 0], x: [0, -20, 0], y: [to.y - 54, -70, 0], scale: [0.876, 0.96, 1], zIndex: [1, 3, 3] },
        transition: { duration: 0.7, times: [0, 0.45, 1], ease: EASE_OUT },
      };
    }
    return { animate: { rotate: 0, x: 0, y: to.y, scale: to.scale, zIndex: 3 - slot }, transition: CARD_SPRING };
  }

  function onDragEnd(_: unknown, info: PanInfo) {
    if (Math.abs(info.offset.x) > SWIPE_PX) onSwipe(1);
  }

  return (
    <div className="deck">
      {[0, 1, 2].map((card) => {
        const front = card === idx;
        const a = animFor(card);
        return (
          <motion.div
            key={card} className={`deck-card tex${front ? ' is-front' : ''}`} style={{ backgroundColor: CARD_BG[card] }}
            initial={false} animate={a.animate} transition={a.transition}
            drag={front && idx < 2 ? 'x' : false} dragConstraints={{ left: 0, right: 0 }} dragElastic={0.5}
            onDragEnd={onDragEnd} aria-hidden={!front}
          >
            {card === 0 && <ResearchCard key={front ? `on-${run}` : 'off'} active={front} prompt={prompt} />}
            {card === 1 && <CiteCard key={front ? `on-${run}` : 'off'} active={front} />}
            {card === 2 && (
              <div className="deck-shot"><img src={logicallyShot} alt={front ? shotAlt : ''} width={1200} height={643} loading="lazy" /></div>
            )}
          </motion.div>
        );
      })}
    </div>
  );
}

/** Prompt types out, steps pop in, the answer streams. Mounted fresh each time the card comes to the front. */
function ResearchCard({ active, prompt }: { active: boolean; prompt: string }) {
  const reduce = useReducedMotion();
  const instant = !active || !!reduce;
  const [typed, setTyped] = useState(instant ? prompt.length : 0);
  const [steps, setSteps] = useState(instant ? STEPS.length : 0);
  const [answer, setAnswer] = useState(instant);

  useEffect(() => {
    if (instant) return;
    const timers: number[] = [];
    let i = 0;
    const tick = window.setInterval(() => {
      i += 1;
      setTyped(i);
      if (i >= prompt.length) {
        window.clearInterval(tick);
        STEPS.forEach((_, s) => timers.push(window.setTimeout(() => setSteps(s + 1), 300 + s * 350)));
        timers.push(window.setTimeout(() => setAnswer(true), 300 + STEPS.length * 350 + 200));
      }
    }, 26);
    return () => { window.clearInterval(tick); timers.forEach((t) => window.clearTimeout(t)); };
  }, [instant, prompt]);

  return (
    <div className="deck-research">
      <div className="deck-bubble deck-prompt">
        <span>{prompt.slice(0, typed)}{typed < prompt.length && <span className="deck-caret" />}</span>
        <span className="deck-prompt-bar"><span aria-hidden="true">+</span><span className="deck-send"><ArrowUp size={13} strokeWidth={2.6} /></span></span>
      </div>
      <div className="deck-bubble deck-steps">
        <span className="mono deck-query"><span className="deck-path">/api/search</span> q="quantum entanglement reviews"</span>
        {STEPS.map((s, i) => (
          <motion.span key={s} className="deck-step" initial={false} animate={{ opacity: i < steps ? 1 : 0.25, y: i < steps ? 0 : 4 }}>
            <span className="deck-check"><Check size={9} strokeWidth={3.4} /></span>{s}
          </motion.span>
        ))}
      </div>
      <motion.div className="deck-bubble deck-answer" initial={false} animate={{ opacity: answer ? 1 : 0, y: answer ? 0 : 8 }}>
        <span className="mono deck-dim">streaming response…</span>
        <span className="serif deck-quote">“Recent reviews consolidate three regimes…</span>
        <span className="deck-cites"><i>1</i><i>2</i><i>5</i><span>→ expand citations</span></span>
      </motion.div>
    </div>
  );
}

/** Word-style page: a reference is picked and the citation lands at the cursor. */
function CiteCard({ active }: { active: boolean }) {
  const reduce = useReducedMotion();
  const [inserted, setInserted] = useState(!active || !!reduce);
  useEffect(() => {
    if (inserted) return;
    const t = window.setTimeout(() => setInserted(true), 900);
    return () => window.clearTimeout(t);
  }, [inserted]);
  return (
    <div className="deck-cite">
      <div className="deck-page">
        <i /><i />
        <span className="deck-page-text">
          …uniform nanoparticle distribution improves tensile strength{' '}
          <AnimatePresence>
            {inserted && (
              <motion.span className="deck-citation" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: 'spring', stiffness: 420, damping: 22 }}>
                (Lee, 1999)
              </motion.span>
            )}
          </AnimatePresence>
        </span>
        <i /><i className="is-short" /><i />
      </div>
      <div className="deck-refs">
        <span className="deck-refs-title">References</span>
        <span className={`deck-ref${inserted ? ' is-picked' : ''}`}>Lee, K. W. (1999)</span>
        <span className="deck-ref">Garcia, M. L. (2002)</span>
        <span className="deck-ref">Chen, X. (1982)</span>
        <span className="deck-insert">Insert citation</span>
      </div>
    </div>
  );
}
