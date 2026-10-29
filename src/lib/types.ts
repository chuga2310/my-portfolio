import type { LogoId } from './logos';
import type {
  ExtractErrorCode, GroupId, PanelErrorCode, RouteReason, StageId, StageStatus, Tier, VerdictLevel,
} from './jd/types';

export interface NavContent {
  hero: string; about: string; skills: string; tools: string; exp: string;
  projects: string; agents: string; metrics: string; awards: string; contact: string;
}
/** Hero orbit tiles: a few projects, the rest tools and platforms I build with. */
export type OrbitId =
  | 'logically' | 'coke' | 'rag' | 'sprint' | 'lumi'
  | 'claude' | 'openai' | 'gemini' | 'n8n'
  | 'typescript' | 'javascript' | 'java' | 'rust'
  | 'react' | 'nextjs' | 'springboot' | 'threejs' | 'electron'
  | 'nodejs' | 'postgres' | 'gcp' | 'vercel';
export interface HeroContent {
  kicker: string; name: string; roles: string[]; tagline: string;
  cta_primary: string; cta_secondary: string; meta: string[];
  /** Captions of the tiles orbiting the hero. */
  orbit: Record<OrbitId, string>;
}
/** What I am doing at a given time of day, on the About card's dial. */
export type DayActivity = 'morning' | 'deep' | 'lunch' | 'ship' | 'play' | 'game' | 'sleep';
export interface AboutContent {
  label: string; title: string; body: string;
  stats: Array<{ k: string; v: string }>;
  mapLabel: string; mapCity: string; mapCoord: string; mapNote: string;
  day: { label: string; now: string; scene: string; kid: string; hint: string; acts: Record<DayActivity, string> };
}
/** `tips[i]` is the tooltip for `chips[i]`: where the skill shows up in my work. */
export interface SkillCard { tag: string; title: string; body: string; chips: string[]; tips: string[]; }
export interface SkillsContent { label: string; title: string; center: string; hint: string; areas: string; cards: SkillCard[]; }
/** `from`/`to` are 'YYYY-MM' (to = null while ongoing); `tools` feed the per-job chips and the toolbox years. */
export interface ExpItem {
  y: string; org: string; role: string; loc: string; body: string;
  from: string; to: string | null; tools: LogoId[];
}
export interface ExpContent { label: string; title: string; rail: string; stack: string; items: ExpItem[]; }
export interface StoryStep { key: string; title: string; body: string; }
export interface FeaturedProject {
  tag: string; name: string; url: string; urlLabel: string;
  sub: string; bullets: string[]; stack: string[];
  shot: string; visit: string; prompt: string;
  /** Research → Cite → Write scroll story. */
  story: StoryStep[];
}
export interface ProjectLink { label: string; href: string; }
export interface GridProject { name: string; role: string; body: string; chips: string[]; link?: ProjectLink; note?: string; }
export interface ProjectsContent {
  label: string; title: string; featured: FeaturedProject; grid: GridProject[];
  replay: string; storyLabel: string; storyNote: string;
}
/** The orchestrator plus one desk per AIDLC agent (see ~/.claude/agents). */
export type AgentId = 'orch' | 'memory' | 'ba' | 'figma' | 'dev' | 'review' | 'qa' | 'ship';
export interface AgentNode { id: AgentId; label: string; sub: string; }
export type OfficeScenario = 'ship' | 'review' | 'bug' | 'parallel';
/** What an agent says while it works; shown over its head and in the status line. */
export type OfficeLine =
  | 'sent' | 'plan' | 'planTeams' | 'recall' | 'ba' | 'figma' | 'dev' | 'reviewOk' | 'reviewFail' | 'fix' | 'devFix'
  | 'rereview' | 'qaOk' | 'qaFail' | 'retest' | 'ship' | 'record' | 'done';
export interface AgentsContent {
  label: string; title: string; sub: string; office: string; nodes: AgentNode[]; note: string;
  /** The request typed to the orchestrator: one task, or three run side by side. */
  you: string; to: string; prompts: { single: string; parallel: string };
  scenarioLabel: string; scenarios: Record<OfficeScenario, string>;
  /** Rows of the orchestrator's plan board; the two workrooms, and the sign on an empty one. */
  board: string[]; rooms: string[]; roomIdle: string; lines: Record<OfficeLine, string>;
  /** One git worktree — and one whole agent team — per task in the parallel scenario. */
  worktrees: string[];
  shipped: { one: string; many: string; sub: string; subMany: string };
}
/** One shelf of the toolbox; tool names come from lib/logos. */
export interface ToolGroup { id: string; title: string; body: string; tools: LogoId[]; }
export interface ToolsContent {
  label: string; title: string; sub: string; count: string;
  languages: { title: string; tools: LogoId[] }; groups: ToolGroup[];
}
export interface MetricItem { v: string; k: string; sub: string; }
export interface MetricsContent { label: string; title: string; items: MetricItem[]; }
export interface AwardItem { y: string; t: string; s: string; }
export interface EduInfo { school: string; degree: string; years: string; gpa: string; }
export interface AwardsContent { label: string; title: string; awards: AwardItem[]; edu: EduInfo; }
export interface ContactLink { k: string; v: string; href: string | null; }
export interface ContactContent {
  label: string; title: string; sub: string; email: string; phone: string; links: ContactLink[]; cta: string; foot: string;
  composeLabel: string; composePlaceholder: string; composeSubject: string;
}
export type JdPhase = 'idle' | 'extracting' | 'streaming' | 'done' | 'error' | 'cooldown' | 'resting';
/** Strings may contain `{name}` placeholders, filled by `fmt()` in lib/jd/format.ts. */
export interface JdContent {
  kicker: string; title: string; sub: string;
  phase: Record<JdPhase, string>;
  tabs: { label: string; file: string; paste: string };
  drop: { title: string; hint: string; browse: string; reading: string; pasteInstead: string };
  paste: { label: string; placeholder: string; count: string; min: string };
  analyze: string; again: string; retry: string; back: string; verifying: string;
  pipeline: string; pipelineTotal: string; extracted: string;
  stages: Record<StageId, string>;
  status: Record<StageStatus | 'pending', string>;
  provider: { self: string; fallback: string; reasons: Record<RouteReason, string> };
  groups: Record<GroupId, string>;
  /** Shown instead of a score for a group the JD does not mention. */
  groupNotMentioned: string;
  levels: Record<VerdictLevel, string>;
  tiers: Record<Tier, string>;
  result: {
    score: string; matched: string; gaps: string; evidence: string; highlight: string;
    highlightHint: string; noGaps: string; cached: string; showAll: string; showLess: string;
  };
  cooldown: { title: string; busy: string; next: string; left: string };
  rest: { title: string; paused: string; daily: string; cv: string; contact: string };
  retryIn: string; fallbackWait: string;
  errors: Record<PanelErrorCode | ExtractErrorCode, string>;
  refunded: string;
  privacy: string;
  live: { stage: string; result: string };
  /** Label of the visitor's own message once a JD is sent. */
  you: string;
}
export interface UiContent {
  skip: string; sections: string; language: string; menuOpen: string; menuClose: string;
  jumpTo: string; backToTop: string; credit: string;
  theme: string; themes: { system: string; light: string; dark: string };
}
export interface LangContent {
  ui: UiContent;
  nav: NavContent; hero: HeroContent; about: AboutContent; skills: SkillsContent; tools: ToolsContent;
  exp: ExpContent; projects: ProjectsContent; agents: AgentsContent;
  metrics: MetricsContent; awards: AwardsContent; contact: ContactContent;
  jd: JdContent;
}
export type Lang = 'en' | 'vi';
export interface Section { id: string; key: keyof NavContent; }
