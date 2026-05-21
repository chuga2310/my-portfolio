import type { LangContent, Section } from '../../lib/types';

interface Props {
  sections: Section[];
  active: string;
  t: LangContent;
}

export function Rail({ sections, active, t }: Props) {
  function scroll(id: string, e: React.MouseEvent) {
    e.preventDefault();
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  }
  return (
    <nav className="rail" aria-label="Sections">
      {sections.map((s) => (
        <a key={s.id} href={`#${s.id}`} className={active === s.id ? 'on' : ''} onClick={(e) => scroll(s.id, e)}>
          <span>{t.nav[s.key]}</span>
        </a>
      ))}
    </nav>
  );
}
