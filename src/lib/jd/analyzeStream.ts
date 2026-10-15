import { API_BASE } from './config';
import {
  BODY_MAX_BYTES, GROUP_IDS, STAGE_IDS,
  type ActivityEvent, type AnalyzeRequest, type ClientErrorCode, type ErrorEvent, type HttpErrorCode,
  type MatchResult, type SectionEvent, type StageEvent,
} from './types';

// EventSource cannot POST, so the stream is read from fetch() and parsed here.

export type AnalyzeEvent =
  | { type: 'stage'; data: StageEvent }
  | { type: 'section'; data: SectionEvent }
  | { type: 'activity'; data: ActivityEvent }
  | { type: 'result'; data: MatchResult }
  | { type: 'error'; data: ErrorEvent };

export class AnalyzeError extends Error {
  readonly code: HttpErrorCode | ClientErrorCode;
  readonly status: number;
  readonly retryAfterSec: number;
  constructor(code: HttpErrorCode | ClientErrorCode, status = 0, retryAfterSec = 0) {
    super(code);
    this.name = 'AnalyzeError';
    this.code = code;
    this.status = status;
    this.retryAfterSec = retryAfterSec;
  }
}

const CODE_BY_STATUS: Record<number, HttpErrorCode> = {
  400: 'INVALID_INPUT',
  403: 'BOT_CHECK_FAILED',
  413: 'PAYLOAD_TOO_LARGE',
  429: 'RATE_LIMITED',
  503: 'DAILY_CAP_REACHED', // or DEMO_PAUSED, told apart by the body
  502: 'UPSTREAM_UNAVAILABLE',
};
const HTTP_CODES = new Set<string>([...Object.values(CODE_BY_STATUS), 'DEMO_PAUSED']);

async function toHttpError(res: Response): Promise<AnalyzeError> {
  let body: { error?: unknown; retryAfterSec?: unknown } = {};
  try { body = await res.json(); } catch { /* non-JSON error body */ }
  const code = typeof body.error === 'string' && HTTP_CODES.has(body.error)
    ? (body.error as HttpErrorCode)
    : (CODE_BY_STATUS[res.status] ?? 'UPSTREAM_UNAVAILABLE');
  const retryAfterSec = Math.max(0, Math.ceil(Number(body.retryAfterSec) || 0));
  return new AnalyzeError(code, res.status, retryAfterSec);
}

interface SseMessage { event: string; data: string; }

/** Minimal text/event-stream parser (WHATWG SSE): event/data fields, `:` comments, blank-line dispatch. */
export async function* readSse(body: ReadableStream<Uint8Array>): AsyncGenerator<SseMessage> {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  let buf = '';
  let event = '';
  let data: string[] = [];
  let finished = false;

  function* drain(): Generator<SseMessage> {
    let nl: number;
    while ((nl = buf.indexOf('\n')) >= 0) {
      let line = buf.slice(0, nl);
      buf = buf.slice(nl + 1);
      if (line.endsWith('\r')) line = line.slice(0, -1);
      if (line === '') {
        if (data.length) yield { event: event || 'message', data: data.join('\n') };
        event = '';
        data = [];
        continue;
      }
      if (line.startsWith(':')) continue; // keep-alive ping
      const colon = line.indexOf(':');
      const field = colon < 0 ? line : line.slice(0, colon);
      let value = colon < 0 ? '' : line.slice(colon + 1);
      if (value.startsWith(' ')) value = value.slice(1);
      if (field === 'event') event = value;
      else if (field === 'data') data.push(value);
    }
  }

  try {
    for (;;) {
      const { value, done } = await reader.read();
      if (done) break;
      buf += decoder.decode(value, { stream: true });
      yield* drain();
    }
    buf += decoder.decode() + '\n\n';
    yield* drain();
    finished = true;
  } finally {
    if (!finished) void reader.cancel().catch(() => {});
    reader.releaseLock();
  }
}

const isStage = (v: unknown) => (STAGE_IDS as readonly unknown[]).includes(v);

/** Server text is rendered as plain text; this only bounds it so a bad payload cannot wreck the layout. */
function plain(v: unknown, max: number): string | undefined {
  if (typeof v !== 'string') return undefined;
  const s = v.replace(/\s+/g, ' ').trim();
  return s ? s.slice(0, max) : undefined;
}

/** Unknown event types and malformed payloads are ignored. */
function parse(msg: SseMessage): AnalyzeEvent | null {
  let data: unknown;
  try { data = JSON.parse(msg.data); } catch { return null; }
  if (!data || typeof data !== 'object') return null;
  const d = data as Record<string, unknown>;
  switch (msg.event) {
    case 'stage': {
      if (!isStage(d.stage)) return null;
      const ev = { ...d, label: plain(d.label, 160), detail: plain(d.detail, 200) } as unknown as StageEvent;
      return { type: 'stage', data: ev };
    }
    case 'activity': {
      const text = plain(d.text, 160);
      return isStage(d.stage) && text ? { type: 'activity', data: { stage: d.stage as ActivityEvent['stage'], text } } : null;
    }
    case 'section':
      return (GROUP_IDS as readonly unknown[]).includes(d.group) ? { type: 'section', data: d as unknown as SectionEvent } : null;
    case 'result':
      return typeof d.overall === 'number' ? { type: 'result', data: d as unknown as MatchResult } : null;
    case 'error':
      return typeof d.code === 'string' ? { type: 'error', data: d as unknown as ErrorEvent } : null;
    default:
      return null;
  }
}

/**
 * POST /analyze and stream events to `onEvent`. Resolves after a `result` or `error` event.
 * Throws AnalyzeError for HTTP errors, network failures and streams that end early.
 */
export async function analyzeStream(
  req: AnalyzeRequest,
  onEvent: (e: AnalyzeEvent) => void,
  signal: AbortSignal,
): Promise<void> {
  if (!API_BASE) throw new AnalyzeError('NOT_CONFIGURED');
  const body = JSON.stringify(req);
  if (new TextEncoder().encode(body).length > BODY_MAX_BYTES) throw new AnalyzeError('PAYLOAD_TOO_LARGE');

  let res: Response;
  try {
    res = await fetch(`${API_BASE}/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'text/event-stream' },
      body,
      credentials: 'omit',
      cache: 'no-store',
      signal,
    });
  } catch (err) {
    if (signal.aborted) throw err;
    throw new AnalyzeError('NETWORK');
  }

  if (!res.ok) throw await toHttpError(res);
  if (!res.body || !(res.headers.get('Content-Type') ?? '').includes('text/event-stream')) {
    throw new AnalyzeError('UPSTREAM_UNAVAILABLE', res.status);
  }

  try {
    for await (const msg of readSse(res.body)) {
      const ev = parse(msg);
      if (!ev) continue;
      onEvent(ev);
      if (ev.type === 'result' || ev.type === 'error') return;
    }
  } catch (err) {
    if (signal.aborted) throw err;
    // The stream had started, so the connection dropped before a result arrived.
    throw new AnalyzeError('INCOMPLETE');
  }
  throw new AnalyzeError('INCOMPLETE');
}
