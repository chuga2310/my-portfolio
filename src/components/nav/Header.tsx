import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion, useScroll, useSpring } from 'motion/react';
import type { Lang, LangContent, Section } from '../../lib/types';
import { EASE_OUT, PILL_SPRING } from '../../lib/motion';
import { LangToggle } from '../ui/LangToggle';
import { ThemeToggle } from '../ui/ThemeToggle';
import type { ThemePref } from '../../hooks/useTheme';
import { ArrowRight, ChevronDown, Close, Menu } from '../ui/icons';

interface Props {
  lang: Lang;
  setLang: (l: Lang) => void;
  theme: { pref: ThemePref; setPref: (p: ThemePref) => void };
  t: LangContent;
  sections: Section[];
  active: string;
  idx: number;
}

const num = (i: number) => String(i).padStart(2, '0');

export function Header({ lang, setLang, theme, t, sections, active, idx }: Props) {
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 200, damping: 30, restDelta: 0.001 });
  const [open, setOpen] = useState(false);
  const opener = useRef<HTMLButtonElement | null>(null);
  const bar = useRef<HTMLElement>(null);
  const current = sections[idx] ?? sections[0];

  // --header-h follows the bar's real height (it wraps differently per breakpoint and language):
  // it offsets the page under the fixed header, anchor jumps and the one-screen sections.
  useEffect(() => {
    const el = bar.current;
    if (!el) return;
    const sync = () => document.documentElement.style.setProperty('--header-h', `${Math.round(el.getBoundingClientRect().height)}px`);
    sync();
    const ro = new ResizeObserver(sync);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  function openMenu(e: React.MouseEvent<HTMLButtonElement>) {
    opener.current = e.currentTarget;
    setOpen(true);
  }
  function closeMenu() {
    setOpen(false);
    opener.current?.focus();
  }

  return (
    <header ref={bar} className="site-header">
      <div className="wrap topbar">
        <a className="brand" href="#hero">
          <span className="brand-mark serif" aria-hidden="true">CL</span>
          <span className="brand-name serif">Cuong Le</span>
        </a>
        <div className="topbar-actions">
          <ThemeToggle {...theme} label={t.ui.theme} names={t.ui.themes} layoutId="theme-thumb-top" className="hide-sm" />
          <LangToggle lang={lang} setLang={setLang} label={t.ui.language} layoutId="lang-thumb-top" className="hide-sm" />
          <a className="btn btn-dark btn-sm hide-sm" href="#contact">{t.hero.cta_secondary}</a>
          <button
            type="button" className="icon-btn show-sm" aria-label={t.ui.menuOpen}
            aria-expanded={open} aria-controls="site-menu" onClick={openMenu}
          >
            <Menu size={18} />
          </button>
        </div>
      </div>

      <div className="subbar">
        <div className="wrap subbar-inner">
          <span className="subbar-current" aria-hidden="true">
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.span
                key={current.id} className="subbar-current-inner"
                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25, ease: EASE_OUT }}
              >
                <span className="mono subbar-num">{num(idx)}</span>
                <span>{t.nav[current.key]}</span>
              </motion.span>
            </AnimatePresence>
          </span>
          <nav aria-label={t.ui.sections} className="subnav">
            {sections.slice(1).map((s) => (
              <a key={s.id} href={`#${s.id}`} aria-current={active === s.id ? 'true' : undefined}>
                {active === s.id && <motion.span layoutId="nav-pill" className="nav-pill" transition={PILL_SPRING} />}
                <span className="nav-label">{t.nav[s.key]}</span>
              </a>
            ))}
          </nav>
          <button
            type="button" className="jump-btn" aria-expanded={open} aria-controls="site-menu" onClick={openMenu}
          >
            {t.ui.jumpTo} <ChevronDown size={14} />
          </button>
        </div>
        <motion.div className="scroll-progress" style={{ scaleX: progress }} aria-hidden="true" />
      </div>

      {/* Portalled: the header's backdrop-filter would otherwise trap the fixed overlay inside it. */}
      {createPortal(
        <AnimatePresence>
          {open && (
            <MenuSheet t={t} lang={lang} setLang={setLang} theme={theme} sections={sections} active={active} idx={idx} onClose={closeMenu} />
          )}
        </AnimatePresence>,
        document.body,
      )}
    </header>
  );
}

interface SheetProps extends Props { onClose: () => void; }

function MenuSheet({ t, lang, setLang, theme, sections, active, idx, onClose }: SheetProps) {
  const first = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    first.current?.focus();
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <motion.div className="menu-layer" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
      <button type="button" className="menu-backdrop" aria-label={t.ui.menuClose} tabIndex={-1} onClick={onClose} />
      <motion.nav
        id="site-menu" className="menu-sheet" aria-label={t.ui.sections} role="dialog" aria-modal="true"
        initial={{ opacity: 0, y: -12, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -8, transition: { duration: 0.15 } }} transition={{ duration: 0.28, ease: EASE_OUT }}
      >
        <div className="menu-head">
          <span className="mono menu-count">{num(idx)} / {num(sections.length)}</span>
          <button type="button" className="icon-btn" aria-label={t.ui.menuClose} onClick={onClose}><Close size={18} /></button>
        </div>
        <ul className="menu-list">
          {sections.map((s, i) => (
            <li key={s.id}>
              <a
                ref={i === 0 ? first : undefined} href={`#${s.id}`} onClick={onClose}
                className={active === s.id ? 'is-active' : ''} aria-current={active === s.id ? 'true' : undefined}
              >
                <span className="mono menu-num">{num(i)}</span>
                <span className="serif menu-label">{t.nav[s.key]}</span>
                {active === s.id && <span className="menu-dot" aria-hidden="true" />}
              </a>
            </li>
          ))}
        </ul>
        <div className="menu-foot">
          <LangToggle lang={lang} setLang={setLang} label={t.ui.language} layoutId="lang-thumb-menu" />
          <ThemeToggle {...theme} label={t.ui.theme} names={t.ui.themes} layoutId="theme-thumb-menu" />
          <a className="btn btn-dark" href={`mailto:${t.contact.email}`}>{t.contact.cta} <ArrowRight /></a>
        </div>
      </motion.nav>
    </motion.div>
  );
}
