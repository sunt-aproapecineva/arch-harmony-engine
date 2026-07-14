// @ts-nocheck
import { useCallback, useEffect, useRef, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

/**
 * Cloud + local autosaved lesson note.
 * - Hydrates from localStorage instantly, then from cloud (cloud wins if newer).
 * - Debounced autosave to Supabase (1.2s after last edit).
 * - Returns { note, setNote, status } where status is 'idle' | 'saving' | 'saved' | 'error'.
 */
export function useLessonNote(userId: string | null | undefined, lessonId: string) {
  const localKey = `aa_note_${userId ?? 'anon'}_${lessonId}`;
  const [note, setNoteState] = useState<string>(() => {
    try { return typeof window !== 'undefined' ? (localStorage.getItem(localKey) || '') : ''; }
    catch { return ''; }
  });
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const cloudLoadedRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Hydrate from cloud once per user+lesson.
  useEffect(() => {
    cloudLoadedRef.current = false;
    if (!userId) return;
    let cancelled = false;
    (async () => {
      try {
        const { data } = await supabase
          .from('lesson_notes')
          .select('content, updated_at')
          .eq('user_id', userId)
          .eq('lesson_id', lessonId)
          .maybeSingle();
        if (cancelled) return;
        if (data?.content != null) {
          // Cloud wins if we haven't started typing locally beyond it.
          setNoteState(prev => {
            if (!prev || prev.length === 0) return data.content;
            if (data.content.length >= prev.length) return data.content;
            return prev;
          });
          try { localStorage.setItem(localKey, data.content); } catch {}
        }
        cloudLoadedRef.current = true;
      } catch {
        cloudLoadedRef.current = true;
      }
    })();
    return () => { cancelled = true; };
  }, [userId, lessonId, localKey]);

  const setNote = useCallback((next: string) => {
    setNoteState(next);
    try { localStorage.setItem(localKey, next); } catch {}
    if (!userId) return;
    setStatus('saving');
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(async () => {
      try {
        const { error } = await supabase.from('lesson_notes').upsert(
          { user_id: userId, lesson_id: lessonId, content: next, updated_at: new Date().toISOString() },
          { onConflict: 'user_id,lesson_id' }
        );
        setStatus(error ? 'error' : 'saved');
      } catch {
        setStatus('error');
      }
    }, 1200);
  }, [userId, lessonId, localKey]);

  useEffect(() => () => { if (timerRef.current) clearTimeout(timerRef.current); }, []);

  return { note, setNote, status };
}
