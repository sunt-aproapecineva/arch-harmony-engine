// Persistent "keep me logged in for 12h" backup of the Supabase session.
//
// Mobile Safari (and some in-app browsers) aggressively evict the Supabase
// localStorage entry when the browser is closed, which logs students out.
// We keep an independent copy of the refresh/access token in BOTH a cookie
// (survives storage eviction) and localStorage, valid for exactly 12 hours,
// and restore it on boot when Supabase itself has no session.

const KEY = 'aa_session_backup';
const FLAG = 'aa_remember_mode';
export const REMEMBER_HOURS = 12;
const MAX_AGE_MS = REMEMBER_HOURS * 60 * 60 * 1000;

interface Backup {
  access_token: string;
  refresh_token: string;
  /** epoch ms when this backup must stop working */
  expires_at: number;
}

function writeCookie(name: string, value: string, maxAgeSec: number) {
  if (typeof document === 'undefined') return;
  const secure = typeof location !== 'undefined' && location.protocol === 'https:' ? '; Secure' : '';
  document.cookie = `${name}=${encodeURIComponent(value)}; Path=/; Max-Age=${maxAgeSec}; SameSite=Lax${secure}`;
}

function readCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.split('; ').find(c => c.startsWith(`${name}=`));
  return match ? decodeURIComponent(match.slice(name.length + 1)) : null;
}

function deleteCookie(name: string) {
  if (typeof document === 'undefined') return;
  document.cookie = `${name}=; Path=/; Max-Age=0; SameSite=Lax`;
}

/**
 * Absolute deadline (epoch ms) of the current 12h window, or null when the
 * user did not opt in. The deadline is stored in the flag itself so it can
 * never be silently renewed by a later token refresh.
 */
export function getRememberDeadline(): number | null {
  if (typeof window === 'undefined') return null;
  let raw: string | null = null;
  try { raw = localStorage.getItem(FLAG); } catch { raw = null; }
  if (!raw) raw = readCookie(FLAG);
  if (!raw) return null;
  const ts = Number(raw);
  if (!Number.isFinite(ts) || ts <= 0) return null;
  return ts;
}

/** True when the user opted into the 12h window on this device (even if expired). */
export function isRememberMode(): boolean {
  return getRememberDeadline() !== null;
}

/** True when the opted-in 12h window has elapsed — the user must be signed out. */
export function isRememberExpired(): boolean {
  const deadline = getRememberDeadline();
  return deadline !== null && deadline <= Date.now();
}

/** Store (or refresh) the 12h backup. The window start time is never extended. */
export function saveSessionBackup(session: { access_token?: string; refresh_token?: string } | null | undefined) {
  if (typeof window === 'undefined') return;
  if (!session?.access_token || !session?.refresh_token) return;

  const expires_at = getRememberDeadline();
  if (!expires_at) return;
  if (expires_at <= Date.now()) { clearSessionBackup(); return; }

  const payload: Backup = {
    access_token: session.access_token,
    refresh_token: session.refresh_token,
    expires_at,
  };
  const raw = JSON.stringify(payload);
  const maxAgeSec = Math.max(1, Math.floor((expires_at - Date.now()) / 1000));
  try { localStorage.setItem(KEY, raw); } catch { /* storage full / disabled */ }
  try { writeCookie(KEY, raw, maxAgeSec); } catch { /* cookie too large */ }
}

/** Start a fresh 12h window (called right after a successful login with "ține-mă minte"). */
export function startRememberWindow(session: { access_token?: string; refresh_token?: string } | null | undefined) {
  clearSessionBackup();
  const deadline = Date.now() + MAX_AGE_MS;
  try { localStorage.setItem(FLAG, String(deadline)); } catch { /* noop */ }
  writeCookie(FLAG, String(deadline), MAX_AGE_MS / 1000);
  saveSessionBackup(session);
}


export function readSessionBackup(): Backup | null {
  if (typeof window === 'undefined') return null;
  let raw: string | null = null;
  try { raw = localStorage.getItem(KEY); } catch { raw = null; }
  if (!raw) raw = readCookie(KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Backup;
    if (!parsed?.access_token || !parsed?.refresh_token) return null;
    if (!parsed.expires_at || parsed.expires_at <= Date.now()) {
      clearSessionBackup();
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function clearSessionBackup() {
  if (typeof window === 'undefined') return;
  try { localStorage.removeItem(KEY); localStorage.removeItem(FLAG); } catch { /* noop */ }
  deleteCookie(KEY);
  deleteCookie(FLAG);
}
