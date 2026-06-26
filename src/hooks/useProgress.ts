// @ts-nocheck
import { useState, useEffect, useCallback } from 'react';
import { Progress } from '../lib/types';
import { supabase, isMockMode } from '../lib/supabase';
import { useAuthContext } from '../context/AuthContext';
import { MODULES } from '../lib/data';

const STORAGE_PROGRESS_KEY = 'aa_progress';

function hasVideo(lesson: any): boolean {
  return lesson?.type !== 'exercise' && !!(
    (typeof lesson?.video_url === 'string' && lesson.video_url.trim()) ||
    (typeof lesson?.video_url_2 === 'string' && lesson.video_url_2.trim())
  );
}

function isTrackableLesson(lesson: any): boolean {
  // Count only real video lessons + interactive exercise pages that exist in
  // the timeline. Empty placeholder lessons and legacy standalone exercises do
  // not affect student progress, otherwise modules can never reach 100%.
  return lesson?.type === 'exercise' || hasVideo(lesson);
}

function getMockProgress(userId: string): Progress[] {
  try {
    const stored = localStorage.getItem(STORAGE_PROGRESS_KEY);
    if (!stored) return [];
    const all: Progress[] = JSON.parse(stored);
    return all.filter((p) => p.user_id === userId);
  } catch {
    return [];
  }
}

function saveMockProgress(progress: Progress[]) {
  try {
    const stored = localStorage.getItem(STORAGE_PROGRESS_KEY);
    const all: Progress[] = stored ? JSON.parse(stored) : [];
    if (progress.length === 0) return;
    const userId = progress[0].user_id;
    const others = all.filter((p) => p.user_id !== userId);
    localStorage.setItem(
      STORAGE_PROGRESS_KEY,
      JSON.stringify([...others, ...progress])
    );
  } catch {}
}

export function useProgress() {
  const { user } = useAuthContext();
  const [progress, setProgress] = useState<Progress[]>([]);
  const [exerciseDone, setExerciseDone] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProgress = useCallback(async () => {
    if (!user) {
      setProgress([]);
      setExerciseDone([]);
      setLoading(false);
      return;
    }

    if (isMockMode) {
      setProgress(getMockProgress(user.id));
      setLoading(false);
      return;
    }

    const [{ data: progressData }, { data: exData }] = await Promise.all([
      supabase!.from('progress').select('*').eq('user_id', user.id),
      supabase!.from('exercise_completions').select('exercise_id').eq('user_id', user.id),
    ]);

    setProgress(progressData || []);
    setExerciseDone((exData || []).map((r: any) => r.exercise_id));
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchProgress();
  }, [fetchProgress]);

  // Re-poll exercise completions when user marks/unmarks
  useEffect(() => {
    const handler = () => fetchProgress();
    window.addEventListener('aa_ex_completion_changed', handler);
    return () => window.removeEventListener('aa_ex_completion_changed', handler);
  }, [fetchProgress]);

  const markComplete = useCallback(
    async (lessonId: string) => {
      if (!user) throw new Error('Trebuie să fii autentificat pentru a finaliza lecția.');

      const already = progress.find(
        (p) => p.lesson_id === lessonId && p.user_id === user.id
      );
      if (already) return;

      const newEntry: Progress = {
        user_id: user.id,
        lesson_id: lessonId,
        completed_at: new Date().toISOString(),
      };

      if (isMockMode) {
        const updated = [...progress, newEntry];
        setProgress(updated);
        saveMockProgress(updated);
        return;
      }

      // Persist FIRST — confirm cloud save before updating UI state.
      // Verify session is hydrated so the bearer token is attached.
      const { data: sessionData } = await supabase!.auth.getSession();
      if (!sessionData.session) {
        throw new Error('Sesiunea nu este activă. Reîmprospătează pagina și încearcă din nou.');
      }

      const { error } = await supabase!
        .from('progress')
        .insert(newEntry)
        .select()
        .single();

      // Ignore unique-violation (already saved from another tab)
      if (error && error.code !== '23505') {
        throw new Error(error.message || 'Nu am putut salva finalizarea. Încearcă din nou.');
      }

      setProgress((prev) =>
        prev.some((p) => p.lesson_id === lessonId && p.user_id === user.id)
          ? prev
          : [...prev, newEntry]
      );
    },
    [user, progress]
  );

  const isCompleted = useCallback(
    (lessonId: string) => progress.some((p) => p.lesson_id === lessonId),
    [progress]
  );

  const isExerciseDone = useCallback(
    (exerciseId: string) => exerciseDone.includes(exerciseId),
    [exerciseDone]
  );

  // Progress is based only on visible, completable timeline items:
  // video lessons that actually have a video URL + exercise lesson pages.
  const getModuleProgress = useCallback(
    (moduleId: string) => {
      const mod = MODULES.find((m) => m.id === moduleId);
      if (!mod) return 0;
      const trackableLessons = mod.lessons.filter(isTrackableLesson);
      const total = trackableLessons.length;
      if (total === 0) return 0;
      const lessonsDone = trackableLessons.filter((l) => isCompleted(l.id)).length;
      return Math.round((lessonsDone / total) * 100);
    },
    [isCompleted]
  );

  const isModuleFullyDone = useCallback(
    (moduleId: string) => {
      const mod = MODULES.find((m) => m.id === moduleId);
      if (!mod) return false;
      const trackableLessons = mod.lessons.filter(isTrackableLesson);
      return trackableLessons.length > 0 && trackableLessons.every((l) => isCompleted(l.id));
    },
    [isCompleted]
  );

  const getOverallProgress = useCallback(() => {
    const trackableLessons = MODULES.flatMap((m) => m.lessons).filter(isTrackableLesson);
    const total = trackableLessons.length;
    if (total === 0) return 0;
    const lessonsDone = trackableLessons.filter((l) => isCompleted(l.id)).length;
    return Math.round((lessonsDone / total) * 100);
  }, [isCompleted]);


  // A module is locked only until its scheduled unlock date begins
  // (start of day in Bucharest for the configured date).
  const isModuleLocked = useCallback(
    (moduleIndex: number): boolean => {
      const mod = MODULES[moduleIndex];
      if (!mod) return true;

      if (mod.unlockDate) {
        // Unlock la începutul zilei în București.
        const unlock = new Date(mod.unlockDate + 'T00:00:00+03:00');
        if (new Date() < unlock) return true;
      }

      return false;
    },
    []
  );

  const getCompletedLessonsCount = useCallback(() => {
    const videoLessonIds = new Set(MODULES.flatMap((m) => m.lessons).filter(hasVideo).map((l) => l.id));
    return progress.filter((p) => videoLessonIds.has(p.lesson_id)).length;
  }, [progress]);
  const getTotalLessonsCount = useCallback(
    () => MODULES.flatMap((m) => m.lessons).filter(hasVideo).length,
    []
  );

  return {
    progress,
    loading,
    markComplete,
    isCompleted,
    isExerciseDone,
    isModuleFullyDone,
    getModuleProgress,
    getOverallProgress,
    isModuleLocked,
    getCompletedLessonsCount,
    getTotalLessonsCount,
    refetch: fetchProgress,
  };
}
