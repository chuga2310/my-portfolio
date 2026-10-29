import { useEffect, useState } from 'react';

export type ThemePref = 'system' | 'light' | 'dark';

const KEY = 'theme';
const DARK = '(prefers-color-scheme: dark)';
const META = { light: '#FAF9F5', dark: '#1F1E1D' };

function stored(): ThemePref {
  try {
    const v = localStorage.getItem(KEY);
    return v === 'light' || v === 'dark' ? v : 'system';
  } catch {
    return 'system';
  }
}

/**
 * The visitor's theme choice (system by default). The resolved light/dark lands on <html data-theme>,
 * which the boot script in index.html also sets before first paint, so there is no flash.
 */
export function useTheme() {
  const [pref, setPref] = useState<ThemePref>(stored);

  useEffect(() => {
    const mq = window.matchMedia(DARK);
    const apply = () => {
      const mode = pref === 'system' ? (mq.matches ? 'dark' : 'light') : pref;
      document.documentElement.dataset.theme = mode;
      document.querySelector('meta[name="theme-color"]')?.setAttribute('content', META[mode]);
    };
    apply();
    try {
      if (pref === 'system') localStorage.removeItem(KEY);
      else localStorage.setItem(KEY, pref);
    } catch { /* private mode: the choice just isn't remembered */ }
    if (pref !== 'system') return;
    mq.addEventListener('change', apply);
    return () => mq.removeEventListener('change', apply);
  }, [pref]);

  return { pref, setPref };
}
