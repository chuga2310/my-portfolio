import { useState, useMemo, useEffect, useRef } from 'react';
import { CONTENT } from './lib/content';
import type { Lang, Section } from './lib/types';
import { mountParticleBg } from './lib/particleBg';
import { useScrollProgress } from './hooks/useScrollProgress';
import { useActiveSection } from './hooks/useActiveSection';
import { TopNav } from './components/nav/TopNav';
import { Rail } from './components/nav/Rail';
import { ScrollProgress } from './components/nav/ScrollProgress';
import { Hero } from './components/hero/Hero';
import { About } from './components/about/About';
import { Skills } from './components/skills/Skills';
import { Experience } from './components/experience/Experience';
import { Projects } from './components/projects/Projects';
import { Agents } from './components/agents/Agents';
import { Metrics } from './components/metrics/Metrics';
import { Awards } from './components/awards/Awards';
import { Contact } from './components/contact/Contact';

const ACCENT_HEX = '#00E5FF';

const SECTIONS: Section[] = [
  { id: 'hero',    key: 'hero'    },
  { id: 'about',   key: 'about'   },
  { id: 'skills',  key: 'skills'  },
  { id: 'exp',     key: 'exp'     },
  { id: 'projects',key: 'projects'},
  { id: 'agents',  key: 'agents'  },
  { id: 'metrics', key: 'metrics' },
  { id: 'awards',  key: 'awards'  },
  { id: 'contact', key: 'contact' },
];

export default function App() {
  const [lang, setLang] = useState<Lang>('en');
  const t = useMemo(() => CONTENT[lang], [lang]);
  const bgApi = useRef<ReturnType<typeof mountParticleBg> | null>(null);
  const progress = useScrollProgress();
  const { active, idx } = useActiveSection(SECTIONS);

  useEffect(() => {
    document.documentElement.style.setProperty('--accent', ACCENT_HEX);
    document.documentElement.style.setProperty('--accent-rgb', '0, 229, 255');
    bgApi.current = mountParticleBg({ accent: ACCENT_HEX });
    return () => { bgApi.current?.destroy(); bgApi.current = null; };
  }, []);

  return (
    <>
      <TopNav lang={lang} setLang={setLang} t={t} />
      <Rail sections={SECTIONS} active={active} t={t} />
      <ScrollProgress value={progress} idx={idx} total={SECTIONS.length} />
      <div className="scroller">
        <Hero t={t} />
        <About t={t} accentHex={ACCENT_HEX} />
        <Skills t={t} />
        <Experience t={t} />
        <Projects t={t} />
        <Agents t={t} />
        <Metrics t={t} />
        <Awards t={t} />
        <Contact t={t} />
      </div>
    </>
  );
}
