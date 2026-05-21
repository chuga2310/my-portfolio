import { useState, useEffect } from 'react';
import type { Section } from '../lib/types';

export function useActiveSection(sections: Section[]) {
  const [active, setActive] = useState(sections[0]?.id ?? '');
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            setActive(e.target.id);
            const i = sections.findIndex((s) => s.id === e.target.id);
            if (i >= 0) setIdx(i);
          }
        });
      },
      { threshold: 0.55 }
    );
    sections.forEach((s) => {
      const el = document.getElementById(s.id);
      if (el) obs.observe(el);
    });
    return () => obs.disconnect();
  }, [sections]);

  return { active, idx };
}
