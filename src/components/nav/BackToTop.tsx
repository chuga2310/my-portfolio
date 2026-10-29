import { useState } from 'react';
import { AnimatePresence, motion, useMotionValueEvent, useReducedMotion, useScroll } from 'motion/react';
import { EASE_OUT } from '../../lib/motion';
import { ArrowUp } from '../ui/icons';

/** Floating "back to top", shown once the page has scrolled away from the hero. */
export function BackToTop({ label }: { label: string }) {
  const { scrollY } = useScroll();
  const reduce = useReducedMotion();
  const [show, setShow] = useState(false);
  useMotionValueEvent(scrollY, 'change', (y) => setShow(y > window.innerHeight * 0.5));

  return (
    <AnimatePresence>
      {show && (
        <motion.button
          type="button" className="to-top" aria-label={label} title={label}
          initial={{ opacity: 0, scale: 0.8, y: 12 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.8, y: 12 }}
          transition={{ duration: 0.25, ease: EASE_OUT }}
          onClick={() => window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' })}
        >
          <ArrowUp size={18} strokeWidth={2.2} />
        </motion.button>
      )}
    </AnimatePresence>
  );
}
