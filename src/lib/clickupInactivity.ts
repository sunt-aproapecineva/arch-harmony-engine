export const INACTIVE_TAG = 'inactiv 4+ zile';
export const INACTIVE_DAYS = 4;

/** True when the latest activity is at least INACTIVE_DAYS old (or there is none). */
export function isInactive(lastActivity: string | null | undefined, now: Date = new Date()): boolean {
  if (!lastActivity) return true;
  const t = Date.parse(lastActivity);
  if (Number.isNaN(t)) return true;
  return now.getTime() - t >= INACTIVE_DAYS * 24 * 60 * 60 * 1000;
}

export function latest(values: Array<string | null | undefined>): string | null {
  let best: string | null = null;
  for (const v of values) if (v && (!best || Date.parse(v) > Date.parse(best))) best = v;
  return best;
}
