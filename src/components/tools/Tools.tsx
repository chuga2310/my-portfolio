import { motion } from 'motion/react';
import type { LangContent } from '../../lib/types';
import { EASE_OUT } from '../../lib/motion';
import { LOGOS } from '../../lib/logos';
import { RevealHeading } from '../ui/RevealHeading';
import { Reveal } from '../ui/Reveal';
import { Logo } from '../ui/Logo';

interface Props { t: LangContent; }

/**
 * The toolbox: platforms, clouds and software, one card per layer of a product. Logos sit in the
 * text colour and take their brand colour while their card is hovered or focused.
 */
export function Tools({ t }: Props) {
  const s = t.tools;
  return (
    <section id="tools" className="section section-ivory">
      <div className="wrap">
        <div className="tools-head">
          <div>
            <div className="eyebrow mono">{s.label}</div>
            <RevealHeading text={s.title} className="section-title serif" mutedAfterComma={false} />
          </div>
          <Reveal><p className="tools-sub">{s.sub}</p></Reveal>
        </div>
        <Reveal className="tool-langs">
          <span className="tool-langs-title mono">{s.languages.title}</span>
          <ul className="tool-list" aria-label={s.languages.title}>
            {s.languages.tools.map((id) => (
              <li key={id} className="tool-chip is-lang">
                <Logo id={id} size={20} />
                {LOGOS[id].title}
              </li>
            ))}
          </ul>
        </Reveal>
        <ul className="tools-grid">
          {s.groups.map((g, i) => (
            <motion.li
              key={g.id} className="tool-card" initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.15 }} transition={{ duration: 0.6, ease: EASE_OUT, delay: i * 0.05 }}
            >
              <div className="tool-card-top mono">
                <span>{String(i + 1).padStart(2, '0')}</span>
                <span>{s.count.replace('{n}', String(g.tools.length))}</span>
              </div>
              <h3 className="serif">{g.title}</h3>
              <p>{g.body}</p>
              <ul className="tool-list" aria-label={g.title}>
                {g.tools.map((id) => (
                  <li key={id} className="tool-chip">
                    <Logo id={id} size={16} mono />
                    {LOGOS[id].title}
                  </li>
                ))}
              </ul>
            </motion.li>
          ))}
        </ul>
      </div>
    </section>
  );
}
