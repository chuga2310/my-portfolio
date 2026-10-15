// Shapes from docs/jd-matcher-api-contract.md (v1). Keep in sync with the contract.

export const STAGE_IDS = [
  'accepted', 'route', 'normalize', 'extract', 'retrieve',
  'evaluate', 'score', 'write', 'done',
] as const;
export type StageId = (typeof STAGE_IDS)[number];
export type StageStatus = 'running' | 'done' | 'failed' | 'skipped';
export type Provider = 'self' | 'openai';
export type RouteReason = 'offline' | 'busy' | 'not_configured';

export interface StageEvent {
  stage: StageId;
  status: StageStatus;
  /** What the AI is doing / just did, localized by the server. Plain text. */
  label?: string;
  /** Optional second line (on "done": what it found). Plain text. */
  detail?: string;
  ms?: number;
  provider?: Provider;
  model?: string;
  meta?: Record<string, string | number | boolean>;
}

/** Fine-grained progress line while a stage is running. Plain text, ≤ 120 chars. */
export interface ActivityEvent {
  stage: StageId;
  text: string;
}

export const GROUP_IDS = ['skills', 'experience', 'responsibilities', 'domain', 'extras'] as const;
export type GroupId = (typeof GROUP_IDS)[number];

export interface SectionEvent {
  group: GroupId;
  score: number;
  strong: number;
  partial: number;
  transferable: number;
  gap: number;
}

export type HighlightSection = 'exp' | 'projects' | 'skills' | 'awards';

export interface Highlight {
  id: string;
  label: string;
  section: HighlightSection;
  key: string;
}

export type VerdictLevel = 'strong' | 'partial' | 'transferable' | 'gap';
export type Tier = 'strong' | 'good' | 'partial' | 'stretch';

export interface Verdict {
  reqId: string;
  requirement: string;
  kind: 'must' | 'nice' | 'responsibility';
  group: GroupId;
  level: VerdictLevel;
  note: string;
  evidence: Highlight[];
}

export interface MatchResult {
  jobId: string;
  cached: boolean;
  provider: Provider;
  model: string;
  overall: number;
  tier: Tier;
  sections: Record<GroupId, number>;
  job: { title: string; seniority: string };
  matched: Verdict[];
  gaps: Verdict[];
  highlights: Highlight[];
  summary: string;
}

export type StreamErrorCode = 'LLM_UNAVAILABLE' | 'TIMEOUT' | 'INTERNAL' | 'FALLBACK_LIMITED';

export interface ErrorEvent {
  code: StreamErrorCode;
  retryable: boolean;
  retryAfterSec?: number; // set for FALLBACK_LIMITED
}

export type HttpErrorCode =
  | 'INVALID_INPUT' | 'BOT_CHECK_FAILED' | 'PAYLOAD_TOO_LARGE' | 'RATE_LIMITED'
  | 'DAILY_CAP_REACHED' | 'DEMO_PAUSED' | 'UPSTREAM_UNAVAILABLE';

export interface Quota {
  allowed: boolean;
  retryAfterSec: number;
  dailyLeft: number;
  paused: boolean;
}

export interface AnalyzeRequest {
  text: string;
  lang: 'vi' | 'en';
  source: 'paste' | 'file';
  turnstileToken: string;
}

/** Client-side codes for failures that never reach the API or break mid-stream. */
export type ClientErrorCode = 'NETWORK' | 'INCOMPLETE' | 'NOT_CONFIGURED';

export type PanelErrorCode = Exclude<HttpErrorCode, 'RATE_LIMITED' | 'DEMO_PAUSED'> | StreamErrorCode | ClientErrorCode;

export type ExtractErrorCode = 'unsupported' | 'too_large' | 'no_text' | 'too_short' | 'too_long' | 'read_failed';

/** Client-side limits, checked before calling the API (the gateway accepts 50..15000). */
export const TEXT_MIN = 200;
export const TEXT_MAX = 15000;
/** The gateway rejects request bodies above 64 KB with 413. */
export const BODY_MAX_BYTES = 64 * 1024;
