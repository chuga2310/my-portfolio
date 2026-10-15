import { TURNSTILE_ENABLED, TURNSTILE_SITEKEY } from './config';

// Cloudflare Turnstile (Managed mode), rendered on demand. The script is injected the first time
// the panel is used, so visitors who never touch it never load it. Tokens are single-use: every
// analysis resets the widget and executes it again for a fresh token. Nothing retries on its own.

interface TurnstileApi {
  render(el: HTMLElement, opts: Record<string, unknown>): string;
  execute(id: string): void;
  reset(id: string): void;
  remove(id: string): void;
}

declare global {
  interface Window { turnstile?: TurnstileApi }
}

const SCRIPT_SRC = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
const ACTION = 'analyze_jd';
const TOKEN_TIMEOUT_MS = 120_000; // a Managed challenge may need the visitor to click

let scriptPromise: Promise<TurnstileApi> | null = null;
let widget: { id: string; host: HTMLElement; lang: string } | null = null;
let settle: ((token: string | null) => void) | null = null;

function loadScript(): Promise<TurnstileApi> {
  if (window.turnstile) return Promise.resolve(window.turnstile);
  if (!scriptPromise) {
    scriptPromise = new Promise<TurnstileApi>((resolve, reject) => {
      const s = document.createElement('script');
      s.src = SCRIPT_SRC;
      s.async = true;
      s.onload = () => (window.turnstile ? resolve(window.turnstile) : reject(new Error('turnstile')));
      s.onerror = () => {
        scriptPromise = null;
        s.remove();
        reject(new Error('turnstile'));
      };
      document.head.appendChild(s);
    });
  }
  return scriptPromise;
}

export function preloadTurnstile(): void {
  if (TURNSTILE_ENABLED) loadScript().catch(() => { /* retried on submit */ });
}

/** Resolves with a fresh single-use token ('' when the check is disabled in dev). */
export async function getTurnstileToken(host: HTMLElement, lang: 'vi' | 'en'): Promise<string> {
  if (!TURNSTILE_ENABLED) return '';
  const ts = await loadScript();

  return new Promise<string>((resolve, reject) => {
    const timer = window.setTimeout(() => settle?.(null), TOKEN_TIMEOUT_MS);
    settle = (token) => {
      window.clearTimeout(timer);
      settle = null;
      if (token) resolve(token);
      else reject(new Error('turnstile'));
    };

    if (widget && (widget.host !== host || widget.lang !== lang)) {
      ts.remove(widget.id);
      widget = null;
    }
    if (!widget) {
      const id = ts.render(host, {
        sitekey: TURNSTILE_SITEKEY,
        execution: 'execute',
        action: ACTION,
        appearance: 'interaction-only', // invisible unless Managed mode asks for a click
        language: lang,
        retry: 'never',
        'refresh-expired': 'manual',
        'refresh-timeout': 'manual',
        callback: (token: string) => settle?.(token),
        'error-callback': () => { settle?.(null); return true; },
        'timeout-callback': () => settle?.(null),
      });
      widget = { id, host, lang };
    } else {
      ts.reset(widget.id);
    }
    ts.execute(widget.id);
  });
}
