import { useState, useMemo, useEffect } from 'react';
import { MotionConfig } from 'motion/react';
import { CONTENT } from './lib/content';
import type { Lang, Section } from './lib/types';
import { useActiveSection } from './hooks/useActiveSection';
import { useTheme } from './hooks/useTheme';
import { Header } from './components/nav/Header';
import { BackToTop } from './components/nav/BackToTop';
import { Hero } from './components/hero/Hero';
import { About } from './components/about/About';
import { Skills } from './components/skills/Skills';
import { Experience } from './components/experience/Experience';
import { Projects } from './components/projects/Projects';
import { Agents } from './components/agents/Agents';
import { Metrics } from './components/metrics/Metrics';
import { Awards } from './components/awards/Awards';
import { Contact } from './components/contact/Contact';
import { Tools } from './components/tools/Tools';

const SECTIONS: Section[] = [
  { id: 'hero',    key: 'hero'    },
  { id: 'about',   key: 'about'   },
  { id: 'skills',  key: 'skills'  },
  { id: 'tools',   key: 'tools'   },
  { id: 'exp',     key: 'exp'     },
  { id: 'projects',key: 'projects'},
  { id: 'agents',  key: 'agents'  },
  { id: 'metrics', key: 'metrics' },
  { id: 'awards',  key: 'awards'  },
  { id: 'contact', key: 'contact' },
];

export default function App() {
  const [lang, setLang] = useState<Lang>('en');
  const theme = useTheme();
  const t = useMemo(() => CONTENT[lang], [lang]);
  const { active, idx } = useActiveSection(SECTIONS);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  return (
    <MotionConfig reducedMotion="user">
      <a className="skip-link" href="#main">{t.ui.skip}</a>
      <Header lang={lang} setLang={setLang} theme={theme} t={t} sections={SECTIONS} active={active} idx={idx} />
      <main id="main">
        <Hero t={t} lang={lang} />
        <About t={t} />
        <Skills t={t} />
        <Tools t={t} />
        <Experience t={t} />
        <Projects t={t} />
        <Agents t={t} />
        <Metrics t={t} />
        <Awards t={t} />
        <Contact t={t} />
      </main>
      <BackToTop label={t.ui.backToTop} />
    </MotionConfig>
  );
}
