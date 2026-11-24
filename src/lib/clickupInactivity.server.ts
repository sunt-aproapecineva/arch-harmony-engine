import { INACTIVE_TAG, isInactive, latest } from './clickupInactivity';

const GATEWAY_URL = 'https://connector-gateway.lovable.dev/clickup';
type Credentials = { lovableApiKey: string; connectionKey: string };

export function clickUpCredentials(): Credentials {
  const lovableApiKey = process.env['LOVABLE_API_KEY'];
  const connectionKey = process.env['CLICKUP_CONNECTION_KEY'];
  if (!lovableApiKey || !connectionKey) throw new Error('Conexiunea ClickUp nu este configurată pe server.');
  return { lovableApiKey, connectionKey };
}

async function setTag(taskId: string, add: boolean, c: Credentials) {
  const res = await fetch(`${GATEWAY_URL}/api/v2/task/${taskId}/tag/${encodeURIComponent(INACTIVE_TAG)}`, {
    method: add ? 'POST' : 'DELETE',
    headers: { Authorization: `Bearer ${c.lovableApiKey}`, 'X-Connection-Api-Key': c.connectionKey, 'Content-Type': 'application/json' },
  });
  if (!res.ok && !(res.status === 404 && !add)) throw new Error(`ClickUp ${res.status}: ${(await res.text()).slice(0, 200)}`);
}

async function lastActivityByUser(admin: any, userIds: string[]) {
  const result = new Map<string, string | null>();
  const sources: Array<[string, string]> = [
    ['activity_log', 'created_at'], ['progress', 'completed_at'], ['exercise_responses', 'updated_at'],
    ['lesson_notes', 'updated_at'], ['quiz_responses', 'updated_at'],
  ];
  for (const [table, col] of sources) {
    const { data } = await admin.from(table).select(`user_id, ${col}`).in('user_id', userIds).order(col, { ascending: false }).limit(5000);
    for (const row of data ?? []) result.set(row.user_id, latest([result.get(row.user_id), row[col]]));
  }
  return result;
}

/** Removes the tag for one student immediately (called when they act). */
export async function clearInactiveTag(admin: any, userId: string, c: Credentials) {
  const { data } = await admin.from('clickup_student_sync').select('task_id').eq('user_id', userId);
  for (const row of data ?? []) if (row.task_id) await setTag(row.task_id, false, c).catch(() => {});
}

export async function refreshInactiveTags(admin: any, c: Credentials, now = new Date()) {
  const { data: rows, error } = await admin.from('clickup_student_sync').select('user_id, task_id').not('task_id', 'is', null);
  if (error) throw new Error(error.message);
  const list = (rows ?? []) as Array<{ user_id: string; task_id: string }>;
  const activity = await lastActivityByUser(admin, [...new Set(list.map(r => r.user_id))]);
  let tagged = 0, cleared = 0, failed = 0;
  for (const row of list) {
    const inactive = isInactive(activity.get(row.user_id), now);
    try { await setTag(row.task_id, inactive, c); inactive ? tagged++ : cleared++; } catch { failed++; }
  }
  return { tagged, cleared, failed, total: list.length };
}
