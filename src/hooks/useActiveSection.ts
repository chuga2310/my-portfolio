import { useState, useEffect } from 'react';
import type { Section } from '../lib/types';

/** Index of the section crossing the middle of the viewport (works for sections taller than the screen). */
export function useActiveSection(sections: Section[]) {
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          const i = sections.findIndex((s) => s.id === e.target.id);
          if (i >= 0) setIdx(i);
        });
      },
      { rootMargin: '-45% 0px -50% 0px' },
    );
    sections.forEach((s) => {
      const el = document.getElementById(s.id);
      if (el) obs.observe(el);
    });
    return () => obs.disconnect();
  }, [sections]);

  return { active: sections[idx]?.id ?? '', idx };
}
