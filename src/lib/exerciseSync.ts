import { supabase } from '@/integrations/supabase/client';

// Debounce per (user, exerciseId) so rapid edits coalesce into one upsert.
const timers = new Map<string, ReturnType<typeof setTimeout>>();

/**
 * Debounced upsert of an exercise response to Supabase.
 * Storage in localStorage stays separate (handled by each variant).
 */
export function pushExerciseResponse(exerciseId: string, response: unknown, delay = 1000) {
  const key = exerciseId;
  const existing = timers.get(key);
  if (existing) clearTimeout(existing);

  timers.set(
    key,
    setTimeout(async () => {
      try {
        const { data: sess } = await supabase.auth.getSession();
        const userId = sess.session?.user?.id;
        if (!userId) {
          console.warn('[exerciseSync] no session — response not saved to cloud');
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
        if (error) console.error('[exerciseSync] upsert failed', error);
      } catch (e) {
        console.error('[exerciseSync] push failed', e);
      }
    }, delay)
  );
}

/** Force-flush any pending debounce immediately (best-effort). */
export async function flushExerciseResponse(exerciseId: string, response: unknown) {
  const t = timers.get(exerciseId);
  if (t) clearTimeout(t);
  timers.delete(exerciseId);
  try {
    const { data: sess } = await supabase.auth.getSession();
    const userId = sess.session?.user?.id;
    if (!userId) return;
    await supabase.from('exercise_responses').upsert(
      {
        user_id: userId,
        exercise_id: exerciseId,
        response: response as any,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id,exercise_id' }
    );
  } catch (e) {
    console.error('[exerciseSync] flush failed', e);
  }
}

/** Load saved response from Supabase (returns null if none or not signed in). */
export async function loadExerciseResponse(exerciseId: string): Promise<unknown | null> {
  try {
    const { data: sess } = await supabase.auth.getSession();
    const userId = sess.session?.user?.id;
    if (!userId) return null;
    const { data, error } = await supabase
      .from('exercise_responses')
      .select('response')
      .eq('user_id', userId)
      .eq('exercise_id', exerciseId)
      .maybeSingle();
    if (error) {
      console.error('[exerciseSync] load failed', error);
      return null;
    }
    return data?.response ?? null;
  } catch (e) {
    console.error('[exerciseSync] load failed', e);
    return null;
  }
}
