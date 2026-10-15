import type { JdPhase } from '../../lib/types';
import {
  STAGE_IDS,
  type ExtractErrorCode, type GroupId, type MatchResult, type PanelErrorCode, type Provider,
  type Quota, type SectionEvent, type StageEvent, type StageId, type StageStatus,
} from '../../lib/jd/types';

// idle → extracting → streaming → done | error | cooldown; `paused` when the demo is switched off.

export interface StageState {
  status: StageStatus | 'pending';
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
export interface PanelInput { text: string; source: 'paste' | 'file'; truncated: boolean; }

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
  dailyCapped: boolean;
  dailyLeft: number | null;
  paused: boolean;
}

export type PanelAction =
  | { type: 'extract'; fileName: string }
  | { type: 'extractFail'; code: ExtractErrorCode }
  | { type: 'start'; input: PanelInput }
  | { type: 'stage'; ev: StageEvent }
  | { type: 'section'; ev: SectionEvent }
  | { type: 'result'; result: MatchResult }
  | { type: 'fail'; error: PanelError }
  | { type: 'rateLimited'; until: number }
  | { type: 'paused' }
  | { type: 'quota'; quota: Quota; until: number | null }
  | { type: 'reset'; now: number };

function freshStages(): Stages {
  return Object.fromEntries(STAGE_IDS.map((id) => [id, { status: 'pending' }])) as Stages;
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
    dailyCapped: false,
    dailyLeft: null,
    paused: false,
  };
}

/** Phases where the input (dropzone / paste) is shown. */
const INPUT_PHASES: JdPhase[] = ['idle', 'cooldown', 'paused'];

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
      const { stage, ...rest } = a.ev;
      return {
        ...s,
        stages: { ...s.stages, [stage]: { ...s.stages[stage], ...rest } },
        lastStage: { stage, status: a.ev.status },
      };
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
      return { ...s, phase: 'cooldown', cooldownUntil: a.until, error: null };
    case 'paused':
      return { ...s, phase: 'paused', paused: true, error: null };
    case 'quota': {
      const { paused } = a.quota;
      const dailyCapped = a.quota.dailyLeft <= 0 && !a.quota.allowed;
      const limited = a.until !== null || dailyCapped;
      const next: JdPhase = paused ? 'paused' : limited ? 'cooldown' : 'idle';
      const phase = INPUT_PHASES.includes(s.phase) ? next : s.phase;
      return { ...s, phase, paused, cooldownUntil: a.until, dailyCapped, dailyLeft: a.quota.dailyLeft };
    }
    case 'reset': {
      const limited = s.dailyCapped || (s.cooldownUntil !== null && s.cooldownUntil > a.now);
      return {
        ...s, phase: s.paused ? 'paused' : limited ? 'cooldown' : 'idle', fileName: null, inputError: null,
        error: null, result: null, stages: freshStages(), lastStage: null, sections: {},
      };
    }
  }
}
