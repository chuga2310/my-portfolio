export interface NavContent {
  hero: string; about: string; skills: string; exp: string;
  projects: string; agents: string; metrics: string; awards: string; contact: string;
}
export interface HeroContent {
  kicker: string; name: string; roles: string[]; tagline: string;
  cta_primary: string; cta_secondary: string; meta: string[];
}
export interface AboutContent {
  label: string; title: string; body: string;
  stats: Array<{ k: string; v: string }>;
  mapLabel: string; mapCity: string; mapCoord: string; mapNote: string;
}
export interface SkillCard { tag: string; title: string; body: string; chips: string[]; }
export interface SkillsContent { label: string; title: string; cards: SkillCard[]; }
export interface ExpItem { y: string; org: string; role: string; loc: string; body: string; }
export interface ExpContent { label: string; title: string; items: ExpItem[]; }
export interface FeaturedProject {
  tag: string; name: string; url: string; urlLabel: string;
  sub: string; bullets: string[]; stack: string[];
}
export interface GridProject { name: string; role: string; body: string; chips: string[]; }
export interface ProjectsContent { label: string; title: string; featured: FeaturedProject; grid: GridProject[]; }
export interface AgentNode { id: string; label: string; sub: string; }
export interface AgentsContent { label: string; title: string; sub: string; nodes: AgentNode[]; loops: string[]; note: string; }
export interface MetricItem { v: string; k: string; sub: string; }
export interface MetricsContent { label: string; title: string; items: MetricItem[]; }
export interface AwardItem { y: string; t: string; s: string; }
export interface EduInfo { school: string; degree: string; years: string; gpa: string; }
export interface AwardsContent { label: string; title: string; awards: AwardItem[]; edu: EduInfo; }
export interface ContactLink { k: string; v: string; href: string | null; }
export interface ContactContent { label: string; title: string; sub: string; email: string; phone: string; links: ContactLink[]; cta: string; foot: string; }
export interface LangContent {
  nav: NavContent; hero: HeroContent; about: AboutContent; skills: SkillsContent;
  exp: ExpContent; projects: ProjectsContent; agents: AgentsContent;
  metrics: MetricsContent; awards: AwardsContent; contact: ContactContent;
}
export type Lang = 'en' | 'vi';
export interface Section { id: string; key: keyof NavContent; }
