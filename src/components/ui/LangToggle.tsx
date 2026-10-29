import { motion } from 'motion/react';
import type { Lang } from '../../lib/types';
import { PILL_SPRING } from '../../lib/motion';

const LANGS: Lang[] = ['en', 'vi'];

interface Props { lang: Lang; setLang: (l: Lang) => void; label: string; layoutId: string; className?: string; }

export function LangToggle({ lang, setLang, label, layoutId, className = '' }: Props) {
  return (
    <div role="group" aria-label={label} className={`lang-toggle ${className}`}>
      {LANGS.map((l) => (
        <button key={l} type="button" aria-pressed={lang === l} className="mono" onClick={() => setLang(l)}>
          {lang === l && <motion.span layoutId={layoutId} className="lang-thumb" transition={PILL_SPRING} />}
          <span className="lang-label">{l.toUpperCase()}</span>
        </button>
      ))}
    </div>
  );
}
