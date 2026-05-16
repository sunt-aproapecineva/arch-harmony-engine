export type ActivityType =
  | 'login' | 'logout'
  | 'lesson_complete' | 'lesson_view'
  | 'exercise_complete' | 'note_saved'
  | 'quiz_complete' | 'module_view'
  | 'platform_register';

export interface ActivityEvent {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  type: ActivityType;
  label: string;          // human-readable description
  data: Record<string, string>;
  timestamp: string;      // ISO
  country?: string;
  city?: string;
  ip?: string;
}

const KEY = 'aa_activity';
const MAX = 2000;

export function logActivity(event: Omit<ActivityEvent, 'id' | 'timestamp'>): void {
  const events = getActivity();
  const newEvent: ActivityEvent = {
    ...event,
    id: `ev-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    timestamp: new Date().toISOString(),
  };
  events.unshift(newEvent);
  if (events.length > MAX) events.splice(MAX);
  try { localStorage.setItem(KEY, JSON.stringify(events)); } catch {}
}

export function getActivity(): ActivityEvent[] {
  try {
    const s = localStorage.getItem(KEY);
    return s ? JSON.parse(s) : [];
  } catch { return []; }
}

export function getActivityForUser(userId: string): ActivityEvent[] {
  return getActivity().filter(e => e.userId === userId);
}

export function clearActivity(): void {
  localStorage.removeItem(KEY);
}

export function timeAgo(isoStr: string): string {
  const diff = Date.now() - new Date(isoStr).getTime();
  const min = Math.floor(diff / 60000);
  const h = Math.floor(diff / 3600000);
  const d = Math.floor(diff / 86400000);
  if (min < 1) return 'acum';
  if (min < 60) return `acum ${min} min`;
  if (h < 24) return `acum ${h}h`;
  if (d === 1) return 'ieri';
  if (d < 7) return `acum ${d} zile`;
  return new Date(isoStr).toLocaleDateString('ro-RO', { day: 'numeric', month: 'short' });
}
