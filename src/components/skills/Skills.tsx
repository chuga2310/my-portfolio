import { useMemo, useState, type CSSProperties } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import type { LangContent, SkillCard } from '../../lib/types';
import { EASE_OUT } from '../../lib/motion';
import { RevealHeading } from '../ui/RevealHeading';
import { Reveal } from '../ui/Reveal';
import { SkillPulses, type SkillEdges } from './SkillPulses';

interface Props { t: LangContent; }

// Map geometry in a 1120×760 box: centre node, one node per hat, one label per chip.
const W = 1120;
const H = 760;
const CENTER = { x: 590, y: 380 };
const BRANCHES = [{ x: 280, y: 380 }, { x: 860, y: 200 }, { x: 860, y: 570 }];
const LEAVES: [number, number][][] = [
  [[221, 542], [120, 582], [114, 473], [52, 428], [80, 318], [115, 245], [190, 192], [208, 144]],
  [[690, 140], [667, 57], [773, 60], [818, 18], [910, 62], [992, 18], [995, 105], [1070, 145], [1050, 232], [1064, 320]],
  [[985, 470], [1052, 505], [1062, 618], [1050, 676], [965, 724], [855, 742], [755, 728], [640, 700], [690, 640], [620, 580]],
];

/** Falls back to a fan around the hat when a card has more chips than placed labels. */
function leafAt(bi: number, li: number, total: number): [number, number] {
  const placed = LEAVES[bi]?.[li];
  if (placed) return placed;
  const b = BRANCHES[bi];
  const dir = Math.atan2(b.y - CENTER.y, b.x - CENTER.x) || Math.PI;
  const a = dir - 1.2 + (2.4 * li) / Math.max(1, total - 1);
  const r = li % 2 ? 230 : 160;
  return [b.x + r * Math.cos(a), b.y + r * Math.sin(a)];
}

const pct = (v: number, of: number) => `${(v / of) * 100}%`;

export function Skills({ t }: Props) {
  const s = t.skills;
  const [hover, setHover] = useState<number | null>(null);
  const [onHat, setOnHat] = useState(false);
  const [pinned, setPinned] = useState<number | null>(null);
  const active = hover ?? pinned;
  // The group's description sits above its hat while the hat is hovered or pinned, not over a skill.
  const tipFor = hover !== null ? (onHat ? hover : null) : pinned;
  const state = (i: number) => (active === null ? '' : active === i ? ' is-on' : ' is-dim');
  const pin = (i: number) => setPinned((p) => (p === i ? null : i));
  const hatIn = (i: number) => { setHover(i); setOnHat(true); };
  const hatOut = () => { setHover(null); setOnHat(false); };
  const leafIn = (i: number) => { setHover(i); setOnHat(false); };
  const edges = useMemo<SkillEdges>(() => ({
    center: [CENTER.x, CENTER.y],
    hats: BRANCHES.map((b) => [b.x, b.y]),
    leaves: s.cards.map((c, bi) => c.chips.map((_, li) => leafAt(bi, li, c.chips.length))),
  }), [s.cards]);

  return (
    <section id="skills" className="section section-white">
      <div className="wrap skills-wrap">
        <div className="eyebrow mono">{s.label}</div>
        <RevealHeading text={s.title} className="section-title serif" />

        <p className="skills-hint">{s.hint}</p>

        <div className="skill-map" onMouseLeave={hatOut}>
          <svg className="skill-lines" viewBox={`0 0 ${W} ${H}`} aria-hidden="true">
            {s.cards.map((c, bi) => (
              <g key={c.tag} className={`skill-branch${state(bi)}`}>
                <motion.line
                  x1={CENTER.x} y1={CENTER.y} x2={BRANCHES[bi].x} y2={BRANCHES[bi].y} className="trunk"
                  initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }} viewport={{ once: true, amount: 0.3 }}
                  transition={{ duration: 0.7, ease: EASE_OUT, delay: 0.1 + bi * 0.08 }}
                />
                {c.chips.map((chip, li) => {
                  const [x, y] = leafAt(bi, li, c.chips.length);
                  return (
                    <motion.line
                      key={chip} x1={BRANCHES[bi].x} y1={BRANCHES[bi].y} x2={x} y2={y}
                      initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }} viewport={{ once: true, amount: 0.3 }}
                      transition={{ duration: 0.6, ease: EASE_OUT, delay: 0.35 + bi * 0.12 + li * 0.04 }}
                    />
                  );
                })}
              </g>
            ))}
          </svg>
          <SkillPulses width={W} height={H} edges={edges} active={active} />

          <motion.div
            className="skill-center" style={{ left: pct(CENTER.x, W), top: pct(CENTER.y, H) }}
            initial={{ opacity: 0, scale: 0.85 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}
            transition={{ duration: 0.6, ease: EASE_OUT }}
          >
            <span className="brand-mark serif" aria-hidden="true">CL</span>
            <span className="serif">{s.center}</span>
          </motion.div>

          {s.cards.map((c, bi) => (
            <motion.button
              key={c.tag} type="button" className={`skill-hat serif${state(bi)}`} aria-pressed={pinned === bi}
              style={{ left: pct(BRANCHES[bi].x, W), top: pct(BRANCHES[bi].y, H) }}
              initial={{ opacity: 0, scale: 0.85 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}
              transition={{ duration: 0.6, ease: EASE_OUT, delay: 0.2 + bi * 0.1 }}
              aria-describedby={tipFor === bi ? `skill-group-${bi}` : undefined}
              onMouseEnter={() => hatIn(bi)} onMouseLeave={() => setOnHat(false)} onFocus={() => hatIn(bi)} onBlur={hatOut}
              onClick={() => pin(bi)}
            >
              {c.title}
            </motion.button>
          ))}

          <AnimatePresence>
            {tipFor !== null && (
              <motion.div
                key={tipFor} id={`skill-group-${tipFor}`} role="tooltip" className="skill-group-tip"
                style={{ left: pct(BRANCHES[tipFor].x, W), top: pct(BRANCHES[tipFor].y, H) }}
                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 4 }}
                transition={{ duration: 0.2, ease: EASE_OUT }}
              >
                <span className="skill-tag mono">{s.cards[tipFor].tag}</span>
                <span className="skill-group-title">{s.cards[tipFor].title}</span>
                <p>{s.cards[tipFor].body}</p>
              </motion.div>
            )}
          </AnimatePresence>

          {s.cards.map((c, bi) => c.chips.map((chip, li) => {
            const [x, y] = leafAt(bi, li, c.chips.length);
            const tipId = `skill-tip-${bi}-${li}`;
            return (
              <motion.span
                key={`${c.tag}-${chip}`} className={`skill-leaf${state(bi)}`}
                style={{ left: pct(x, W), top: pct(y, H), '--d': `${-((bi * 7 + li * 3) % 9) * 0.45}s` } as CSSProperties}
                initial={{ opacity: 0, scale: 0.85 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}
                transition={{ duration: 0.5, ease: EASE_OUT, delay: 0.55 + bi * 0.12 + li * 0.04 }}
                onMouseEnter={() => leafIn(bi)}
              >
                <button type="button" aria-describedby={tipId} onFocus={() => leafIn(bi)} onBlur={hatOut}>{chip}</button>
                <span role="tooltip" id={tipId} className="tip">{c.tips[li]}</span>
              </motion.span>
            );
          }))}
        </div>

        <div className="skill-cards" role="group" aria-label={s.areas}>
          {s.cards.map((c, bi) => (
            <Reveal key={c.tag} delay={bi * 0.06}>
              <SkillAreaCard
                card={c} on={active === bi} pressed={pinned === bi}
                onEnter={() => setHover(bi)} onLeave={() => setHover(null)} onPin={() => pin(bi)}
              />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

interface CardProps { card: SkillCard; on: boolean; pressed: boolean; onEnter: () => void; onLeave: () => void; onPin: () => void; }

function SkillAreaCard({ card, on, pressed, onEnter, onLeave, onPin }: CardProps) {
  return (
    <div className={`skill-card${on ? ' is-on' : ''}`} onMouseEnter={onEnter} onMouseLeave={onLeave}>
      <button type="button" className="skill-card-head" aria-pressed={pressed} onClick={onPin} onFocus={onEnter} onBlur={onLeave}>
        <span className="skill-tag mono">{card.tag}</span>
        <span className="skill-card-title">{card.title}</span>
        <span className="skill-card-body">{card.body}</span>
      </button>
      {/* Below the map breakpoint the chips live on the card, with the same tooltips. */}
      <ul className="chips skill-card-chips">
        {card.chips.map((chip, i) => (
          <li key={chip} className="skill-chip">
            <button type="button" aria-describedby={`skill-card-tip-${card.tag}-${i}`}>{chip}</button>
            <span role="tooltip" id={`skill-card-tip-${card.tag}-${i}`} className="tip">{card.tips[i]}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
