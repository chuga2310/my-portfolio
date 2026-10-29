import type { ReactNode } from 'react';
import { motion } from 'motion/react';
import { EASE_OUT } from '../../lib/motion';

interface Props { children: ReactNode; className?: string; delay?: number; y?: number; }

/** Fades a block up the first time it scrolls into view. */
export function Reveal({ children, className, delay = 0, y = 24 }: Props) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.6, ease: EASE_OUT, delay }}
    >
      {children}
    </motion.div>
  );
}
