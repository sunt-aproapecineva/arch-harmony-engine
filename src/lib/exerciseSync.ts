import { supabase } from '@/integrations/supabase/client';

// Debounce per (user, exerciseId) so rapid edits coalesce into one upsert.
const timers = new Map<string, ReturnType<typeof setTimeout>>();

type SyncResult = { ok: boolean; error?: string };
type SyncListener = (result: SyncResult & { exerciseId: string }) => void;
const listeners = new Map<string, Set<SyncListener>>();

export type CloudExerciseResponse = {
  response: unknown;
  updated_at: string | null;
};

export function subscribeExerciseSync(exerciseId: string, listener: SyncListener) {
  const set = listeners.get(exerciseId) || new Set<SyncListener>();
  set.add(listener);
  listeners.set(exerciseId, set);
  return () => {
    const current = listeners.get(exerciseId);
    if (!current) return;
    current.delete(listener);
    if (current.size === 0) listeners.delete(exerciseId);
  };
}

function notifyExerciseSync(exerciseId: string, result: SyncResult) {
  listeners.get(exerciseId)?.forEach((listener) => listener({ ...result, exerciseId }));
}

/**
 * Debounced upsert of an exercise response to Supabase.
 * Storage in localStorage stays separate (handled by each variant).
 */
export function pushExerciseResponse(exerciseId: string, response: unknown, intendedUserId?: string, delay = 1000) {
  const key = `${intendedUserId || 'session'}:${exerciseId}`;
  const existing = timers.get(key);
  if (existing) clearTimeout(existing);

  timers.set(
    key,
    setTimeout(async () => {
      timers.delete(key);
      try {
        const { data: sess } = await supabase.auth.getSession();
        const userId = sess.session?.user?.id;
        if (!userId) {
          console.warn('[exerciseSync] no session — response not saved to cloud');
          notifyExerciseSync(exerciseId, { ok: false, error: 'Sesiune inactivă' });
          return;
        }
        if (intendedUserId && userId !== intendedUserId) {
          console.warn('[exerciseSync] session changed — skipped stale response save');
          notifyExerciseSync(exerciseId, { ok: false, error: 'Sesiunea s-a schimbat' });
          return;
        }
        const { error } = await supabase
          .from('exercise_responses')
          .upsert(
            {
              user_id: userId,
              exercise_id: exerciseId,
              response: response as any,
              updated_at: new Date().toISOString(),
            },
            { onConflict: 'user_id,exercise_id' }
          );
        if (error) {
          console.error('[exerciseSync] upsert failed', error);
          notifyExerciseSync(exerciseId, { ok: false, error: error.message });
          return;
        }
        notifyExerciseSync(exerciseId, { ok: true });
      } catch (e) {
        console.error('[exerciseSync] push failed', e);
        notifyExerciseSync(exerciseId, { ok: false, error: 'Eroare la sincronizare' });
      }
    }, delay)
  );
}

export function getStoredExerciseResponse(storageKey: string): unknown | null {
  try {
    const raw = localStorage.getItem(storageKey);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

/** Force-flush any pending debounce immediately (best-effort). */
export async function flushExerciseResponse(exerciseId: string, response: unknown) {
  const { data: sess } = await supabase.auth.getSession();
  const userId = sess.session?.user?.id;
  if (!userId) throw new Error('Sesiunea nu este activă. Reîmprospătează pagina și încearcă din nou.');

  const timerKey = `${userId}:${exerciseId}`;
  const t = timers.get(timerKey);
  if (t) clearTimeout(t);
  timers.delete(timerKey);

  const { error } = await supabase.from('exercise_responses').upsert(
    {
      user_id: userId,
      exercise_id: exerciseId,
      response: response as any,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'user_id,exercise_id' }
  );
  if (error) throw new Error(error.message || 'Nu am putut salva răspunsul exercițiului.');
  notifyExerciseSync(exerciseId, { ok: true });
}

/** Load saved response from Supabase (returns null if none or not signed in). */
export async function loadExerciseResponse(exerciseId: string): Promise<unknown | null> {
  const row = await loadExerciseResponseWithMeta(exerciseId);
  return row?.response ?? null;
}

/** Load saved response with timestamp so local/cloud drafts can be reconciled safely. */
export async function loadExerciseResponseWithMeta(exerciseId: string): Promise<CloudExerciseResponse | null> {
  try {
    const { data: sess } = await supabase.auth.getSession();
    const userId = sess.session?.user?.id;
    if (!userId) return null;
    const { data, error } = await supabase
      .from('exercise_responses')
      .select('response, updated_at')
      .eq('user_id', userId)
      .eq('exercise_id', exerciseId)
      .maybeSingle();
    if (error) {
      console.error('[exerciseSync] load failed', error);
      return null;
    }
    return data ? { response: data.response, updated_at: data.updated_at ?? null } : null;
  } catch (e) {
    console.error('[exerciseSync] load failed', e);
    return null;
  }
}
