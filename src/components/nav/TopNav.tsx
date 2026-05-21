import type { Lang, LangContent } from '../../lib/types';

interface Props {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: LangContent;
}

export function TopNav({ lang, setLang }: Props) {
  return (
    <div className="nav">
      <div className="brand">
        <span className="dot" />
        <span>CUONG.LE / PORTFOLIO · 2026</span>
      </div>
      <div className="lang" role="tablist" aria-label="Language">
        <button className={lang === 'en' ? 'on' : ''} onClick={() => setLang('en')}>EN</button>
        <button className={lang === 'vi' ? 'on' : ''} onClick={() => setLang('vi')}>VI</button>
      </div>
    </div>
  );
}
