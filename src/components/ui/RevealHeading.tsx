import { Fragment } from 'react';
import { motion, type Variants } from 'motion/react';
import { EASE_OUT } from '../../lib/motion';

interface Props {
  text: string;
  as?: 'h1' | 'h2' | 'h3';
  className?: string;
  id?: string;
  /** Words after the first comma render muted ("Three hats, one operator."). */
  mutedAfterComma?: boolean;
  delay?: number;
}

const container: Variants = {
  hidden: {},
  show: (delay: number) => ({ transition: { staggerChildren: 0.06, delayChildren: delay } }),
};
const word: Variants = {
  hidden: { opacity: 0, y: '0.3em' },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: EASE_OUT } },
};

/** A heading whose words fade up one by one the first time it scrolls into view. */
export function RevealHeading({ text, as = 'h2', className, id, mutedAfterComma = true, delay = 0 }: Props) {
  const Tag = as === 'h1' ? motion.h1 : as === 'h3' ? motion.h3 : motion.h2;
  const words = text.split(' ');
  const comma = mutedAfterComma ? words.findIndex((w) => w.endsWith(',')) : -1;
  return (
    // Keyed by text so a language switch replays the reveal instead of leaving new words hidden.
    <Tag
      key={text} className={className} id={id} custom={delay} variants={container}
      initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.5 }}
    >
      <span className="sr-only">{text}</span>
      {words.map((w, i) => (
        <Fragment key={`${i}-${w}`}>
          {i > 0 && ' '}
          <motion.span aria-hidden="true" variants={word} className={`word${comma >= 0 && i > comma ? ' is-muted' : ''}`}>
            {w}
          </motion.span>
        </Fragment>
      ))}
    </Tag>
  );
}
