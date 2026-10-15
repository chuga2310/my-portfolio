// The only two values the frontend knows about the backend. Both are public.
// VITE_API_BASE is the public Gateway; never point it at anything behind it.

const DEV_API_BASE = 'http://localhost:8787'; // scripts/mock-jd-api.mjs

export const API_BASE: string = (
  import.meta.env.VITE_API_BASE || (import.meta.env.DEV ? DEV_API_BASE : '')
).replace(/\/+$/, '');

export const TURNSTILE_SITEKEY: string = import.meta.env.VITE_TURNSTILE_SITEKEY || '';

/** In dev with no sitekey the bot check is skipped (the mock accepts an empty token). */
export const TURNSTILE_ENABLED = TURNSTILE_SITEKEY !== '' || !import.meta.env.DEV;
