import { useRef } from 'react';
import { motion } from 'motion/react';
import type { Lang, LangContent } from '../../lib/types';
import { EASE_OUT } from '../../lib/motion';
import { JdMatchPanel } from '../jd-match/JdMatchPanel';
import { RevealHeading } from '../ui/RevealHeading';
import { ArrowRight } from '../ui/icons';
import { Orbit, TileMarquee } from './Orbit';

interface Props { t: LangContent; lang: Lang; }

const rise = (delay: number) => ({
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.7, ease: EASE_OUT, delay },
});

export function Hero({ t, lang }: Props) {
  const stack = useRef<HTMLDivElement>(null);
  const roles = t.hero.roles;
  return (
    <section id="hero" className="hero">
      <Orbit t={t} contentRef={stack} />
      <TileMarquee t={t} />
      <div className="wrap hero-wrap">
        <div ref={stack} className="hero-stack">
          <motion.div className="pill" {...rise(0)}>
            <span className="live-dot" aria-hidden="true" />{t.hero.kicker}
          </motion.div>
          <RevealHeading as="h1" text={t.hero.name} className="hero-name serif" mutedAfterComma={false} delay={0.05} />
          <motion.p className="hero-roles serif" {...rise(0.25)}>
            {roles.map((r, i) => (
              <span key={r}>
                {i > 0 && <span className="role-dot" aria-hidden="true"> · </span>}
                {i === roles.length - 1 ? <em>{r}</em> : r}
              </span>
            ))}
          </motion.p>
          <motion.p className="hero-tagline" {...rise(0.35)}>{t.hero.tagline}</motion.p>
          <motion.div className="hero-jd" {...rise(0.45)}>
            <JdMatchPanel t={t} lang={lang} />
          </motion.div>
          <motion.div className="hero-ctas" {...rise(0.55)}>
            <a href="#projects" className="btn btn-dark btn-lg">{t.hero.cta_primary} <ArrowRight /></a>
            <a href="#contact" className="btn btn-ghost btn-lg">{t.hero.cta_secondary}</a>
          </motion.div>
          <motion.ul className="hero-meta" {...rise(0.65)}>
            {t.hero.meta.map((m) => <li key={m}><span className="meta-dot" aria-hidden="true" />{m}</li>)}
          </motion.ul>
        </div>
      </div>
    </section>
  );
}
