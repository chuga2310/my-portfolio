import { API_BASE } from './config';
import type { Quota } from './types';

// The server is the source of truth for rate limits; localStorage only remembers the
// cooldown so a reload shows the countdown straight away.

const STORAGE_KEY = 'jdMatcher.nextAllowedAt';

export async function fetchQuota(signal?: AbortSignal): Promise<Quota> {
  if (!API_BASE) throw new Error('NOT_CONFIGURED');
  const res = await fetch(`${API_BASE}/quota`, { credentials: 'omit', cache: 'no-store', signal });
  if (!res.ok) throw new Error(`quota ${res.status}`);
  const q = (await res.json()) as Partial<Quota>;
  return {
    allowed: q.allowed !== false,
    retryAfterSec: Math.max(0, Math.ceil(Number(q.retryAfterSec) || 0)),
    dailyLeft: typeof q.dailyLeft === 'number' ? q.dailyLeft : 1,
    paused: q.paused === true,
  };
}

/** Epoch ms of the next allowed analysis, or 0 when not cooling down. */
export function readNextAllowedAt(): number {
  try {
    const at = Number(localStorage.getItem(STORAGE_KEY));
    return at > Date.now() ? at : 0;
  } catch {
    return 0;
  }
}

export function saveCooldown(retryAfterSec: number): number {
  const at = Date.now() + retryAfterSec * 1000;
  try { localStorage.setItem(STORAGE_KEY, String(at)); } catch { /* storage blocked */ }
  return at;
}

export function clearCooldown(): void {
  try { localStorage.removeItem(STORAGE_KEY); } catch { /* storage blocked */ }
}

export function formatCountdown(sec: number): string {
  const s = Math.max(0, Math.ceil(sec));
  const mmss = `${String(Math.floor((s % 3600) / 60)).padStart(s >= 3600 ? 2 : 1, '0')}:${String(s % 60).padStart(2, '0')}`;
  return s >= 3600 ? `${Math.floor(s / 3600)}:${mmss}` : mmss;
}
