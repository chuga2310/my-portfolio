import { useCallback, useEffect, useReducer, useRef, useState } from 'react';
import type { Lang, LangContent } from '../../lib/types';
import { AnalyzeError, analyzeStream } from '../../lib/jd/analyzeStream';
import { clampText, ExtractError, extractText, normalizeText } from '../../lib/jd/extractText';
import { fmt } from '../../lib/jd/format';
import { clearCooldown, fetchQuota, formatCountdown, readNextAllowedAt, saveCooldown } from '../../lib/jd/quota';
import { getTurnstileToken, preloadTurnstile } from '../../lib/jd/turnstile';
import { STAGE_IDS, TEXT_MAX, type PanelErrorCode } from '../../lib/jd/types';
import { useCountdown } from '../../hooks/useCountdown';
import { initPanel, panelReducer, type PanelInput } from './panelState';
import { JdDropzone, type InputTab } from './JdDropzone';
import { PipelineTimeline, ProviderBadge } from './PipelineTimeline';
import { SectionBars } from './SectionBars';
import { MatchResult } from './MatchResult';

const COOLDOWN_FALLBACK_SEC = 15 * 60;
const NO_RETRY: PanelErrorCode[] = ['INVALID_INPUT', 'PAYLOAD_TOO_LARGE', 'DAILY_CAP_REACHED', 'NOT_CONFIGURED'];
const STREAM_ERRORS: PanelErrorCode[] = ['LLM_UNAVAILABLE', 'TIMEOUT', 'INTERNAL', 'FALLBACK_LIMITED'];

interface Props { t: LangContent; lang: Lang; }

function jumpTo(id: string, e: React.MouseEvent) {
  e.preventDefault();
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
}

export function JdMatchPanel({ t: content, lang }: Props) {
  const t = content.jd;
  const [state, dispatch] = useReducer(panelReducer, 0, () => initPanel(readNextAllowedAt()));
  const [tab, setTab] = useState<InputTab>('file');
  const [pasteText, setPasteText] = useState('');
  const abortRef = useRef<AbortController | null>(null);
  const turnstileRef = useRef<HTMLDivElement>(null);
  const preloaded = useRef(false);
  const secondsLeft = useCountdown(state.cooldownUntil);
  const retryLeft = useCountdown(state.error?.retryAt ?? null);

  // A finished countdown means the visitor may analyze again; no effect needed to leave cooldown.
  const phase = state.phase === 'cooldown' && !state.dailyCapped && secondsLeft === 0 ? 'idle' : state.phase;

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
      if (err instanceof AnalyzeError && err.code === 'RATE_LIMITED') {
        dispatch({ type: 'rateLimited', until: saveCooldown(err.retryAfterSec || COOLDOWN_FALLBACK_SEC) });
        return;
      }
      if (err instanceof AnalyzeError && err.code === 'DEMO_PAUSED') {
        dispatch({ type: 'paused' });
        return;
      }
      const code: PanelErrorCode = err instanceof AnalyzeError ? err.code as PanelErrorCode : 'NETWORK';
      dispatch({ type: 'fail', error: { code, refunded: false, retryAt: null } });
      if (code === 'DAILY_CAP_REACHED') refreshQuota();
      return;
    }
    if (finished) refreshQuota();
  }, [lang, refreshQuota]);

  const onFile = useCallback(async (file: File) => {
    markUsed();
    dispatch({ type: 'extract', fileName: file.name });
    try {
      const { text, truncated } = await extractText(file);
      void run({ text, source: 'file', truncated });
    } catch (err) {
      dispatch({ type: 'extractFail', code: err instanceof ExtractError ? err.code : 'read_failed' });
    }
  }, [markUsed, run]);

  const onSubmitText = useCallback(() => {
    markUsed();
    const { text, truncated } = clampText(normalizeText(pasteText));
    void run({ text, source: 'paste', truncated });
  }, [markUsed, pasteText, run]);

  const reset = useCallback(() => dispatch({ type: 'reset', now: Date.now() }), []);

  const { stages, error, result, input } = state;
  const canRetry = !!input && !!error && !NO_RETRY.includes(error.code)
    && (!STREAM_ERRORS.includes(error.code) || error.refunded);
  const totalMs = stages.done.ms ?? STAGE_IDS.reduce((sum, id) => sum + (id === 'done' ? 0 : stages[id].ms ?? 0), 0);
  const streamStarted = STAGE_IDS.some((id) => stages[id].status !== 'pending' && stages[id].status !== 'skipped');

  let live = '';
  if (phase === 'done' && result) {
    live = fmt(t.live.result, { score: `~${result.overall}%`, tier: t.tiers[result.tier] });
  } else if (phase === 'streaming' && state.lastStage) {
    live = fmt(t.live.stage, { stage: t.stages[state.lastStage.stage], status: t.status[state.lastStage.status] });
  }

  return (
    <div
      className={`jd-panel glass is-${phase}`}
      onPointerEnter={markUsed}
      onFocusCapture={markUsed}
      onDragEnter={markUsed}
      aria-labelledby="jd-title"
      role="region"
    >
      <div className="jd-head">
        <span className="jd-kicker"><span className="jd-dot" aria-hidden="true" />{t.kicker}</span>
        <span className={`jd-phase is-${phase}`}>{t.phase[phase]}</span>
      </div>

      <div className="jd-body">
        <h2 className="jd-title" id="jd-title">{t.title}</h2>
        {(phase === 'idle' || phase === 'extracting' || phase === 'cooldown') && <p className="jd-sub">{t.sub}</p>}

        {phase === 'paused' && (
          <div className="jd-paused" role="status">
            <span className="jd-paused-title">{t.paused.title}</span>
            <p className="jd-muted">{t.paused.body}</p>
            <div className="jd-actions">
              <a href="#exp" className="btn primary jd-btn" onClick={(e) => jumpTo('exp', e)}>
                {t.paused.cv} <span className="arrow">→</span>
              </a>
              <a href="#contact" className="btn ghost jd-btn" onClick={(e) => jumpTo('contact', e)}>{t.paused.contact}</a>
            </div>
          </div>
        )}

        {(phase === 'idle' || phase === 'extracting' || phase === 'cooldown') && (
          <>
            {state.inputError && (
              <div className="jd-alert" role="alert">
                <span>{t.errors[state.inputError]}</span>
                {state.inputError === 'no_text' && tab !== 'paste' && (
                  <button type="button" className="jd-link" onClick={() => setTab('paste')}>{t.drop.pasteInstead} →</button>
                )}
              </div>
            )}
            <div className="jd-input-wrap">
              <JdDropzone
                t={t}
                tab={tab}
                onTab={setTab}
                pasteText={pasteText}
                onPasteText={setPasteText}
                onFile={onFile}
                onSubmitText={onSubmitText}
                disabled={phase === 'cooldown'}
                readingFile={phase === 'extracting' ? state.fileName : null}
                locale={lang}
              />
              {phase === 'cooldown' && (
                <div className="jd-cooldown" role="status">
                  {state.dailyCapped ? (
                    <span className="jd-cooldown-msg">{t.cooldown.daily}</span>
                  ) : (
                    <>
                      <span className="jd-cooldown-time" role="timer" aria-live="off">{formatCountdown(secondsLeft)}</span>
                      <span className="jd-cooldown-msg">{fmt(t.cooldown.next, { time: formatCountdown(secondsLeft) })}</span>
                      <span className="jd-muted">{t.cooldown.title}</span>
                    </>
                  )}
                </div>
              )}
            </div>
          </>
        )}

        {(phase === 'streaming' || phase === 'error') && (
          <>
            {phase === 'error' && error && (
              <>
                <div className="jd-alert is-error" role="alert">
                  <span>{t.errors[error.code]}</span>
                  {error.refunded && !error.retryAt && <span className="jd-muted">{t.refunded}</span>}
                </div>
                <div className="jd-actions">
                  {canRetry && input && (
                    <button
                      type="button"
                      className="btn primary jd-btn"
                      disabled={retryLeft > 0}
                      onClick={() => void run(input)}
                    >
                      {retryLeft > 0 ? fmt(t.retryIn, { time: formatCountdown(retryLeft) }) : t.retry}
                    </button>
                  )}
                  <button type="button" className="btn ghost jd-btn" onClick={reset}>{t.back}</button>
                </div>
              </>
            )}
            {phase === 'streaming' && input?.truncated && (
              <p className="jd-muted">{fmt(t.truncated, { max: TEXT_MAX.toLocaleString(lang) })}</p>
            )}
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

        {phase === 'done' && result && (
          <>
            <MatchResult t={t} result={result} />
            <details className="jd-details">
              <summary>
                {t.pipeline} · {fmt(t.pipelineTotal, { s: (totalMs / 1000).toFixed(1) })}
              </summary>
              <ProviderBadge stages={stages} t={t} />
              <PipelineTimeline t={t} stages={stages} />
            </details>
            <div className="jd-actions">
              <button type="button" className="btn ghost jd-btn" onClick={reset}>{t.again}</button>
              {state.cooldownUntil && secondsLeft > 0 && (
                <span className="jd-muted" role="timer" aria-live="off">
                  {fmt(t.cooldown.next, { time: formatCountdown(secondsLeft) })}
                </span>
              )}
            </div>
          </>
        )}
      </div>

      <div className="jd-foot">
        <span>🔒 {t.privacy}</span>
        {state.dailyLeft !== null && state.dailyLeft > 0 && (
          <span>{fmt(t.cooldown.left, { n: state.dailyLeft })}</span>
        )}
      </div>
      <div ref={turnstileRef} className="jd-turnstile" />
      <div className="sr-only" aria-live="polite" aria-atomic="true">{live}</div>
    </div>
  );
}
