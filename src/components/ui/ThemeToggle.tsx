import { motion } from 'motion/react';
import type { ThemePref } from '../../hooks/useTheme';
import { PILL_SPRING } from '../../lib/motion';
import { Monitor, Moon, Sun } from './icons';

const PREFS: ThemePref[] = ['system', 'light', 'dark'];
const ICONS = { system: Monitor, light: Sun, dark: Moon };

interface Props {
  pref: ThemePref;
  setPref: (p: ThemePref) => void;
  label: string;
  names: Record<ThemePref, string>;
  layoutId: string;
  className?: string;
}

/** System / light / dark, as a segmented control with a sliding thumb like the language switch. */
export function ThemeToggle({ pref, setPref, label, names, layoutId, className = '' }: Props) {
  return (
    <div role="group" aria-label={label} className={`lang-toggle theme-toggle ${className}`}>
      {PREFS.map((p) => {
        const Icon = ICONS[p];
        return (
          <button key={p} type="button" aria-pressed={pref === p} aria-label={names[p]} title={names[p]} onClick={() => setPref(p)}>
            {pref === p && <motion.span layoutId={layoutId} className="lang-thumb" transition={PILL_SPRING} />}
            <span className="lang-label"><Icon size={15} /></span>
          </button>
        );
      })}
    </div>
  );
}
