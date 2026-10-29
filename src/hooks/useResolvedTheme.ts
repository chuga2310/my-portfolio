import { useSyncExternalStore } from 'react';

function subscribe(onChange: () => void) {
  const obs = new MutationObserver(onChange);
  obs.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
  return () => obs.disconnect();
}

type Mode = 'light' | 'dark';
const read = (): Mode => (document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light');

/** The theme actually showing, as set on <html data-theme> by useTheme. */
export function useResolvedTheme(): Mode {
  return useSyncExternalStore(subscribe, read, (): Mode => 'light');
}
