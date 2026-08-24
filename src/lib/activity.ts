import { supabase } from '@/integrations/supabase/client';

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
  label: string;
  data: Record<string, string>;
  timestamp: string;
}

export async function logActivity(event: Omit<ActivityEvent, 'id' | 'timestamp'>): Promise<void> {
  try {
    await supabase.from('activity_log').insert({
      user_id: event.userId,
      user_email: event.userEmail,
      user_name: event.userName,
      type: event.type,
      label: event.label,
      data: event.data || {},
    });
  } catch (e) {
    // best-effort
  }
}

export async function getActivity(limit = 500): Promise<ActivityEvent[]> {
  const { data } = await supabase
    .from('activity_log')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);
  return (data || []).map((r: any) => ({
    id: r.id,
    userId: r.user_id,
    userEmail: r.user_email || '',
    userName: r.user_name || '',
    type: r.type,
    label: r.label,
    data: r.data || {},
    timestamp: r.created_at,
  }));
}

export async function getActivityForUser(userId: string): Promise<ActivityEvent[]> {
  const { data } = await supabase
    .from('activity_log')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(500);
  return (data || []).map((r: any) => ({
    id: r.id,
    userId: r.user_id,
    userEmail: r.user_email || '',
    userName: r.user_name || '',
    type: r.type,
    label: r.label,
    data: r.data || {},
    timestamp: r.created_at,
  }));
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

/**
 * Log an event at most once per day per key (per browser).
 * Used for high-frequency signals (lesson_view, module_view, note_saved,
 * login) so the activity log stays a useful "last active" signal without
 * flooding the table.
 */
export async function logActivityOnce(
  key: string,
  event: Omit<ActivityEvent, 'id' | 'timestamp'>,
): Promise<void> {
  try {
    if (!event.userId) return;
    const today = new Date().toISOString().slice(0, 10);
    const storageKey = `aa_act_${event.userId}_${key}_${today}`;
    if (localStorage.getItem(storageKey)) return;
    localStorage.setItem(storageKey, '1');
  } catch {
    /* if storage is unavailable, still log */
  }
  await logActivity(event);
}
