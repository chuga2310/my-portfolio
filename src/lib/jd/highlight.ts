import type { Highlight } from './types';

// Experience rows and project cards carry data-jd-section / data-jd-key, where the key is the
// English org or project name (CONTENT.en), which is what the API returns as `highlight.key`.

const GLOW_CLASS = 'jd-glow';
const GLOW_MS = 6000;
let clearTimer = 0;

function targetsFor(highlights: Highlight[]): HTMLElement[] {
  const found: HTMLElement[] = [];
  for (const h of highlights) {
    if (h.section !== 'exp' && h.section !== 'projects') continue;
    const sel = `[data-jd-section="${h.section}"][data-jd-key="${CSS.escape(h.key)}"]`;
    document.querySelectorAll<HTMLElement>(sel).forEach((el) => {
      if (!found.includes(el)) found.push(el);
    });
  }
  return found;
}

export function hasPageTargets(highlights: Highlight[]): boolean {
  return targetsFor(highlights).length > 0;
}

/** Glows the matching items and scrolls to the most relevant one. Returns false when none exist. */
export function highlightOnPage(highlights: Highlight[]): boolean {
  const targets = targetsFor(highlights);
  window.clearTimeout(clearTimer);
  document.querySelectorAll(`.${GLOW_CLASS}`).forEach((el) => el.classList.remove(GLOW_CLASS));

  const first = targets[0] ?? (highlights[0] && document.getElementById(highlights[0].section));
  if (!first) return false;

  targets.forEach((el) => {
    void el.offsetWidth; // restart the animation when clicked twice
    el.classList.add(GLOW_CLASS);
  });

  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  first.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'center' });
  if (!first.hasAttribute('tabindex')) first.setAttribute('tabindex', '-1');
  first.focus({ preventScroll: true });

  clearTimer = window.setTimeout(() => targets.forEach((el) => el.classList.remove(GLOW_CLASS)), GLOW_MS);
  return true;
}
