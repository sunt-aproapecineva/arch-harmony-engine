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

/** Store (or refresh) the 12h backup. `expiresAt` is preserved across token refreshes. */
export function saveSessionBackup(session: { access_token?: string; refresh_token?: string } | null | undefined) {
  if (typeof window === 'undefined') return;
  if (!session?.access_token || !session?.refresh_token) return;

  const existing = readSessionBackup();
  const expires_at = existing?.expires_at ?? Date.now() + MAX_AGE_MS;
  if (expires_at <= Date.now()) return;

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
/** True when the user opted into the 12h window on this device. */
export function isRememberMode(): boolean {
  if (typeof window === 'undefined') return false;
  try { if (localStorage.getItem(FLAG) === '1') return true; } catch { /* noop */ }
  return readCookie(FLAG) === '1';
}

export function startRememberWindow(session: { access_token?: string; refresh_token?: string } | null | undefined) {
  clearSessionBackup();
  try { localStorage.setItem(FLAG, '1'); } catch { /* noop */ }
  writeCookie(FLAG, '1', MAX_AGE_MS / 1000);
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
