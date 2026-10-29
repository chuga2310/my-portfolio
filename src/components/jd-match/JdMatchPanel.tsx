import { useCallback, useEffect, useReducer, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import type { Lang, LangContent } from '../../lib/types';
import { AnalyzeError, analyzeStream } from '../../lib/jd/analyzeStream';
import { checkLength, countChars, ExtractError, extractText, normalizeText } from '../../lib/jd/extractText';
import { fmt } from '../../lib/jd/format';
import { clearCooldown, fetchQuota, formatCountdown, readNextAllowedAt, saveCooldown } from '../../lib/jd/quota';
import { getTurnstileToken, preloadTurnstile } from '../../lib/jd/turnstile';
import { STAGE_IDS, type PanelErrorCode } from '../../lib/jd/types';
import { EASE_OUT } from '../../lib/motion';
import { useCountdown } from '../../hooks/useCountdown';
import { initPanel, panelReducer, type PanelInput } from './panelState';
import { JdComposer } from './JdComposer';
import { PipelineTimeline, ProviderBadge } from './PipelineTimeline';
import { SectionBars } from './SectionBars';
import { MatchResult } from './MatchResult';
import { Alert, ArrowRight, ChevronDown, FileText, Lock, Moon, Spark } from '../ui/icons';

const COOLDOWN_FALLBACK_SEC = 15 * 60;
/** A 429 this short is the gateway saying "busy, retry soon", not a per-visitor limit. */
const BUSY_MAX_SEC = 60;
const NO_RETRY: PanelErrorCode[] = ['INVALID_INPUT', 'PAYLOAD_TOO_LARGE', 'NOT_CONFIGURED'];
const STREAM_ERRORS: PanelErrorCode[] = ['LLM_UNAVAILABLE', 'TIMEOUT', 'INTERNAL', 'FALLBACK_LIMITED'];
/** Characters of the visitor's JD shown in their message bubble. */
const BUBBLE_CHARS = 220;

interface Props { t: LangContent; lang: Lang; }

function jumpTo(id: string, e: React.MouseEvent) {
  e.preventDefault();
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
}

export function JdMatchPanel({ t: content, lang }: Props) {
  const t = content.jd;
  const [state, dispatch] = useReducer(panelReducer, 0, () => initPanel(readNextAllowedAt()));
  const [pasteText, setPasteText] = useState('');
  const abortRef = useRef<AbortController | null>(null);
  const turnstileRef = useRef<HTMLDivElement>(null);
  const composerRef = useRef<HTMLTextAreaElement>(null);
  const preloaded = useRef(false);
  const secondsLeft = useCountdown(state.cooldownUntil);
  const retryLeft = useCountdown(state.error?.retryAt ?? null);

  // A finished countdown means the visitor may analyze again; no effect needed to leave cooldown.
  const phase = state.phase === 'cooldown' && secondsLeft === 0 ? 'idle' : state.phase;

  const refreshQuota = useCallback((signal?: AbortSignal) => {
    fetchQuota(signal)
      .then((quota) => {
        let until: number | null = null;
        if (!quota.allowed && quota.retryAfterSec > 0) until = saveCooldown(quota.retryAfterSec);
        else if (quota.allowed) clearCooldown();
        else until = readNextAllowedAt() || null;
        dispatch({ type: 'quota', quota, until });
      })
      .catch(() => { /* quota is advisory; /analyze enforces it */ });
  }, []);

  useEffect(() => {
    const ac = new AbortController();
    refreshQuota(ac.signal);
    return () => {
      ac.abort();
      abortRef.current?.abort();
    };
  }, [refreshQuota]);

  const markUsed = useCallback(() => {
    if (preloaded.current) return;
    preloaded.current = true;
    preloadTurnstile();
  }, []);

  const run = useCallback(async (input: PanelInput) => {
    abortRef.current?.abort();
    const ac = new AbortController();
    abortRef.current = ac;
    dispatch({ type: 'start', input });

    let token: string;
    try {
      token = await getTurnstileToken(turnstileRef.current!, lang);
    } catch {
      if (!ac.signal.aborted) dispatch({ type: 'fail', error: { code: 'BOT_CHECK_FAILED', refunded: false, retryAt: null } });
      return;
    }

    let finished = false;
    try {
      await analyzeStream(
        { text: input.text, lang, source: input.source, turnstileToken: token },
        (ev) => {
          if (ev.type === 'stage') dispatch({ type: 'stage', ev: ev.data });
          else if (ev.type === 'activity') dispatch({ type: 'activity', ev: ev.data });
          else if (ev.type === 'section') dispatch({ type: 'section', ev: ev.data });
          else if (ev.type === 'result') {
            finished = true;
            dispatch({ type: 'result', result: ev.data });
          } else {
            const wait = Number(ev.data.retryAfterSec) || 0;
            const retryAt = wait > 0 ? Date.now() + wait * 1000 : null;
            dispatch({ type: 'fail', error: { code: ev.data.code, refunded: ev.data.retryable, retryAt } });
          }
        },
        ac.signal,
      );
    } catch (err) {
      if (ac.signal.aborted) return;
      // No automatic retries: every path below waits for the visitor to act.
      if (err instanceof AnalyzeError && err.code === 'RATE_LIMITED') {
        const sec = err.retryAfterSec || COOLDOWN_FALLBACK_SEC;
        const busy = sec <= BUSY_MAX_SEC;
        dispatch({ type: 'rateLimited', until: busy ? Date.now() + sec * 1000 : saveCooldown(sec), busy });
        return;
      }
      if (err instanceof AnalyzeError && (err.code === 'DEMO_PAUSED' || err.code === 'DAILY_CAP_REACHED')) {
        dispatch({ type: 'rest', reason: err.code === 'DEMO_PAUSED' ? 'paused' : 'daily' });
        return;
      }
      const code: PanelErrorCode = err instanceof AnalyzeError ? err.code as PanelErrorCode : 'NETWORK';
      dispatch({ type: 'fail', error: { code, refunded: false, retryAt: null } });
      return;
    }
    if (finished) refreshQuota();
  }, [lang, refreshQuota]);

  const onFile = useCallback(async (file: File) => {
    markUsed();
    dispatch({ type: 'extract', fileName: file.name });
    try {
      const text = await extractText(file);
      void run({ text, source: 'file' });
    } catch (err) {
      dispatch({ type: 'extractFail', code: err instanceof ExtractError ? err.code : 'read_failed' });
    }
  }, [markUsed, run]);

  const onSubmitText = useCallback(() => {
    markUsed();
    const text = normalizeText(pasteText);
    const problem = checkLength(text);
    if (problem) dispatch({ type: 'extractFail', code: problem });
    else void run({ text, source: 'paste' });
  }, [markUsed, pasteText, run]);

  const reset = useCallback(() => dispatch({ type: 'reset', now: Date.now() }), []);

  const { stages, error, result, input } = state;
  const canRetry = !!input && !!error && !NO_RETRY.includes(error.code)
    && (!STREAM_ERRORS.includes(error.code) || error.refunded);
  const totalMs = stages.done.ms ?? STAGE_IDS.reduce((sum, id) => sum + (id === 'done' ? 0 : stages[id].ms ?? 0), 0);
  const streamStarted = STAGE_IDS.some((id) => stages[id].status !== 'pending' && stages[id].status !== 'skipped');

  // Announce what the server says each stage is doing; activity lines are deliberately not announced.
  let live = '';
  if (phase === 'done' && result) {
    live = fmt(t.live.result, { score: `~${result.overall}%`, tier: t.tiers[result.tier] });
  } else if (phase === 'streaming' && state.lastStage) {
    const { stage, status } = state.lastStage;
    const { label, detail } = stages[stage];
    live = label
      ? (status === 'running' || !detail ? label : `${label}: ${detail}`)
      : fmt(t.live.stage, { stage: t.stages[stage], status: t.status[status] });
  }
  const verifying = phase === 'streaming' && !state.lastStage;
  const fallbackWait = error?.code === 'FALLBACK_LIMITED' && retryLeft > 0;
  const view = phase === 'resting' ? 'resting'
    : phase === 'streaming' || phase === 'error' ? 'run'
      : phase === 'done' ? 'done' : 'input';
  const busyPhase = phase === 'streaming' || phase === 'extracting';

  return (
    <div
      className={`jd is-${phase}`}
      onPointerEnter={markUsed}
      onFocusCapture={markUsed}
      onDragEnter={markUsed}
      aria-labelledby="jd-title"
      role="region"
    >
      <div className="jd-card">
        <div className="jd-head">
          <span className="jd-brand">
            <Spark size={18} className="jd-spark" />
            <span className="jd-kicker">{t.kicker}</span>
            <span className="jd-slash" aria-hidden="true">/</span>
            <h2 className="jd-title serif" id="jd-title">{t.title}</h2>
          </span>
          <span className={`jd-phase is-${phase}`}>
            {busyPhase && <span className="jd-spinner is-xs" aria-hidden="true" />}
            {t.phase[phase]}
          </span>
        </div>

        <AnimatePresence mode="popLayout" initial={false}>
          <motion.div
            key={view} className={`jd-view is-${view}`}
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4, transition: { duration: 0.15 } }}
            transition={{ duration: 0.22, ease: EASE_OUT }}
          >
            {view === 'input' && (
              <>
                <p className="jd-sub">{t.sub}</p>
                {state.inputError && (
                  <div className="jd-alert" role="alert">
                    <Alert size={18} />
                    <span className="jd-alert-body">
                      <span>{t.errors[state.inputError]}</span>
                      {state.inputError === 'no_text' && (
                        <button type="button" className="jd-link" onClick={() => composerRef.current?.focus()}>
                          {t.drop.pasteInstead} →
                        </button>
                      )}
                    </span>
                  </div>
                )}
                <div className="jd-compose-wrap">
                  <JdComposer
                    t={t}
                    text={pasteText}
                    onText={setPasteText}
                    onFile={onFile}
                    onSubmit={onSubmitText}
                    disabled={phase === 'cooldown'}
                    readingFile={phase === 'extracting' ? state.fileName : null}
                    locale={lang}
                    textareaRef={composerRef}
                  />
                  {phase === 'cooldown' && (
                    <div className="jd-cooldown" role="status">
                      <span className="jd-cooldown-time mono" role="timer" aria-live="off">{formatCountdown(secondsLeft)}</span>
                      <span className="jd-cooldown-msg">{fmt(t.cooldown.next, { time: formatCountdown(secondsLeft) })}</span>
                      <span className="jd-muted">{state.cooldownBusy ? t.cooldown.busy : t.cooldown.title}</span>
                    </div>
                  )}
                </div>
              </>
            )}

            {view === 'resting' && (
              <div className="jd-paused" role="status">
                <span className="jd-paused-icon" aria-hidden="true"><Moon size={20} /></span>
                <div>
                  <span className="jd-paused-title serif">{t.rest.title}</span>
                  <p className="jd-muted">{state.rest === 'daily' ? t.rest.daily : t.rest.paused}</p>
                  <div className="jd-actions">
                    <a href="#exp" className="btn btn-dark btn-sm" onClick={(e) => jumpTo('exp', e)}>
                      {t.rest.cv} <ArrowRight size={15} />
                    </a>
                    <a href="#contact" className="btn btn-ghost btn-sm" onClick={(e) => jumpTo('contact', e)}>{t.rest.contact}</a>
                  </div>
                </div>
              </div>
            )}

            {view === 'run' && (
              <>
                {input && <UserBubble label={t.you} text={input.text} fileName={input.source === 'file' ? state.fileName : null} locale={lang} />}
                {phase === 'error' && error && (
                  <>
                    <div className="jd-alert is-error" role="alert">
                      <Alert size={18} />
                      <span className="jd-alert-body">
                        <strong>{fallbackWait ? fmt(t.fallbackWait, { time: formatCountdown(retryLeft) }) : t.errors[error.code]}</strong>
                        {error.refunded && !error.retryAt && <span className="jd-muted">{t.refunded}</span>}
                      </span>
                    </div>
                    <div className="jd-actions">
                      {canRetry && input && (
                        <button type="button" className="btn btn-dark btn-sm" disabled={retryLeft > 0} onClick={() => void run(input)}>
                          {retryLeft > 0 ? fmt(t.retryIn, { time: formatCountdown(retryLeft) }) : t.retry}
                        </button>
                      )}
                      <button type="button" className="btn btn-ghost btn-sm" onClick={reset}>{t.back}</button>
                    </div>
                  </>
                )}
                {verifying && <p className="jd-verifying"><span className="jd-spinner" aria-hidden="true" />{t.verifying}</p>}
                {streamStarted || phase === 'streaming' ? (
                  <div className="jd-run">
                    <ProviderBadge stages={stages} t={t} />
                    <PipelineTimeline t={t} stages={stages} />
                    {(phase === 'streaming' || Object.keys(state.sections).length > 0) && (
                      <SectionBars t={t} sections={state.sections} />
                    )}
                  </div>
                ) : null}
              </>
            )}

            {view === 'done' && result && (
              <>
                <MatchResult t={t} result={result} />
                <details className="jd-details">
                  <summary>
                    {t.pipeline} · {fmt(t.pipelineTotal, { s: (totalMs / 1000).toFixed(1) })}
                    <ChevronDown size={16} />
                  </summary>
                  <ProviderBadge stages={stages} t={t} />
                  <PipelineTimeline t={t} stages={stages} />
                </details>
                <div className="jd-actions">
                  <button type="button" className="btn btn-ghost btn-sm" onClick={reset}>{t.again}</button>
                  {state.cooldownUntil && secondsLeft > 0 && (
                    <span className="jd-muted mono" role="timer" aria-live="off">
                      {fmt(t.cooldown.next, { time: formatCountdown(secondsLeft) })}
                    </span>
                  )}
                </div>
              </>
            )}
          </motion.div>
        </AnimatePresence>

        <div ref={turnstileRef} className="jd-turnstile" />
      </div>
      <div className="jd-foot">
        <span><Lock size={13} />{t.privacy}</span>
        {state.dailyLeft !== null && state.dailyLeft > 0 && (
          <span>{fmt(t.cooldown.left, { n: state.dailyLeft })}</span>
        )}
      </div>
      <div className="sr-only" aria-live="polite" aria-atomic="true">{live}</div>
    </div>
  );
}

/** The visitor's JD, shown back as their message once it is sent. */
function UserBubble({ label, text, fileName, locale }: { label: string; text: string; fileName: string | null; locale: string }) {
  const clipped = text.length > BUBBLE_CHARS ? `${text.slice(0, BUBBLE_CHARS).trimEnd()}…` : text;
  return (
    <div className="jd-bubble">
      <span className="jd-bubble-label">
        {fileName ? <><FileText size={14} />{fileName}</> : label}
        <span className="mono"> · {countChars(text).toLocaleString(locale)}</span>
      </span>
      <p>{clipped}</p>
    </div>
  );
}
