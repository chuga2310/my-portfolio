import type { JdPhase } from '../../lib/types';
import {
  STAGE_IDS,
  type ActivityEvent, type ExtractErrorCode, type GroupId, type MatchResult, type PanelErrorCode,
  type Provider, type Quota, type SectionEvent, type StageEvent, type StageId, type StageStatus,
} from '../../lib/jd/types';

// idle → extracting → streaming → done | error | cooldown.
// `resting` replaces the input when the demo is switched off or today's cap is reached.

const ACTIVITY_KEEP = 3;

export interface StageState {
  status: StageStatus | 'pending';
  /** Server-written, localized label of what this stage is doing / did. */
  label?: string;
  detail?: string;
  /** Latest activity lines while running (newest last). */
  activity: string[];
  /** Total activity lines received, so each line keeps a stable key. */
  activitySeq: number;
  ms?: number;
  provider?: Provider;
  model?: string;
  meta?: StageEvent['meta'];
}
export type Stages = Record<StageId, StageState>;

export interface PanelError {
  code: PanelErrorCode;
  refunded: boolean;
  /** Epoch ms before which a retry is pointless (FALLBACK_LIMITED). */
  retryAt: number | null;
}
export interface PanelInput { text: string; source: 'paste' | 'file'; }
export type RestReason = 'paused' | 'daily';

export interface PanelState {
  phase: JdPhase;
  fileName: string | null;
  inputError: ExtractErrorCode | null;
  input: PanelInput | null;
  stages: Stages;
  lastStage: { stage: StageId; status: StageStatus } | null;
  sections: Partial<Record<GroupId, SectionEvent>>;
  result: MatchResult | null;
  error: PanelError | null;
  cooldownUntil: number | null;
  /** The last 429 was a short "server busy" retry, not a per-visitor limit. */
  cooldownBusy: boolean;
  rest: RestReason | null;
  dailyLeft: number | null;
}

export type PanelAction =
  | { type: 'extract'; fileName: string }
  | { type: 'extractFail'; code: ExtractErrorCode }
  | { type: 'start'; input: PanelInput }
  | { type: 'stage'; ev: StageEvent }
  | { type: 'activity'; ev: ActivityEvent }
  | { type: 'section'; ev: SectionEvent }
  | { type: 'result'; result: MatchResult }
  | { type: 'fail'; error: PanelError }
  | { type: 'rateLimited'; until: number; busy: boolean }
  | { type: 'rest'; reason: RestReason }
  | { type: 'quota'; quota: Quota; until: number | null }
  | { type: 'reset'; now: number };

function freshStages(): Stages {
  return Object.fromEntries(STAGE_IDS.map((id): [StageId, StageState] => [id, { status: 'pending', activity: [], activitySeq: 0 }])) as Stages;
}

export function initPanel(cooldownUntil: number): PanelState {
  return {
    phase: cooldownUntil ? 'cooldown' : 'idle',
    fileName: null,
    inputError: null,
    input: null,
    stages: freshStages(),
    lastStage: null,
    sections: {},
    result: null,
    error: null,
    cooldownUntil: cooldownUntil || null,
    cooldownBusy: false,
    rest: null,
    dailyLeft: null,
  };
}

/** Phases where no run is on screen, so a quota update may switch between them. */
const IDLE_PHASES: JdPhase[] = ['idle', 'cooldown', 'resting'];

function mergeStage(prev: StageState, ev: StageEvent): StageState {
  const { status, ms, provider, model, meta, label, detail } = ev;
  return {
    ...prev,
    status,
    ms: ms ?? prev.ms,
    provider: provider ?? prev.provider,
    model: model ?? prev.model,
    meta: meta ?? prev.meta,
    // A later event without text keeps what the server said before.
    label: label ?? prev.label,
    detail: detail ?? prev.detail,
  };
}

export function panelReducer(s: PanelState, a: PanelAction): PanelState {
  switch (a.type) {
    case 'extract':
      return { ...s, phase: 'extracting', fileName: a.fileName, inputError: null };
    case 'extractFail':
      return { ...s, phase: 'idle', inputError: a.code };
    case 'start':
      return {
        ...s, phase: 'streaming', input: a.input, inputError: null, error: null, result: null,
        stages: freshStages(), lastStage: null, sections: {},
      };
    case 'stage': {
      if (s.phase !== 'streaming') return s;
      const { stage, status } = a.ev;
      return {
        ...s,
        stages: { ...s.stages, [stage]: mergeStage(s.stages[stage], a.ev) },
        lastStage: { stage, status },
      };
    }
    case 'activity': {
      if (s.phase !== 'streaming') return s;
      const st = s.stages[a.ev.stage];
      const activity = [...st.activity, a.ev.text].slice(-ACTIVITY_KEEP);
      return { ...s, stages: { ...s.stages, [a.ev.stage]: { ...st, activity, activitySeq: st.activitySeq + 1 } } };
    }
    case 'section':
      if (s.phase !== 'streaming') return s;
      return { ...s, sections: { ...s.sections, [a.ev.group]: a.ev } };
    case 'result':
      return { ...s, phase: 'done', result: a.result };
    case 'fail': {
      // Whatever was still in flight failed; whatever had not started never will.
      const stages = Object.fromEntries(STAGE_IDS.map((id) => {
        const st = s.stages[id];
        if (st.status === 'running') return [id, { ...st, status: 'failed' }];
        if (st.status === 'pending') return [id, { ...st, status: 'skipped' }];
        return [id, st];
      })) as Stages;
      return { ...s, phase: 'error', error: a.error, stages };
    }
    case 'rateLimited':
      return { ...s, phase: 'cooldown', cooldownUntil: a.until, cooldownBusy: a.busy, error: null };
    case 'rest':
      return { ...s, phase: 'resting', rest: a.reason, error: null };
    case 'quota': {
      const rest: RestReason | null = a.quota.paused ? 'paused' : a.quota.dailyLeft <= 0 ? 'daily' : null;
      const next: JdPhase = rest ? 'resting' : a.until !== null ? 'cooldown' : 'idle';
      const phase = IDLE_PHASES.includes(s.phase) ? next : s.phase;
      return { ...s, phase, rest, cooldownUntil: a.until, cooldownBusy: false, dailyLeft: a.quota.dailyLeft };
    }
    case 'reset': {
      const cooling = s.cooldownUntil !== null && s.cooldownUntil > a.now;
      return {
        ...s, phase: s.rest ? 'resting' : cooling ? 'cooldown' : 'idle', fileName: null, inputError: null,
        error: null, result: null, stages: freshStages(), lastStage: null, sections: {},
      };
    }
  }
}
