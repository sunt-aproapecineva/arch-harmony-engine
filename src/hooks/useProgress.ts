// @ts-nocheck
import { useState, useEffect, useCallback } from 'react';
import { Progress } from '../lib/types';
import { supabase, isMockMode } from '../lib/supabase';
import { useAuthContext } from '../context/AuthContext';
import { MODULES } from '../lib/data';

const STORAGE_PROGRESS_KEY = 'aa_progress';

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
      if (!user) return;

      const already = progress.find(
        (p) => p.lesson_id === lessonId && p.user_id === user.id
      );
      if (already) return;

      const newEntry: Progress = {
        user_id: user.id,
        lesson_id: lessonId,
        completed_at: new Date().toISOString(),
      };

      const updated = [...progress, newEntry];
      setProgress(updated);

      if (isMockMode) {
        saveMockProgress(updated);
      } else {
        await supabase!.from('progress').insert(newEntry);
      }
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

  // Progress now combines lessons + exercises (both count toward module completion).
  const getModuleProgress = useCallback(
    (moduleId: string) => {
      const mod = MODULES.find((m) => m.id === moduleId);
      if (!mod) return 0;
      const total = mod.lessons.length + mod.exercises.length;
      if (total === 0) return 0;
      const lessonsDone = mod.lessons.filter((l) => isCompleted(l.id)).length;
      const exDone = mod.exercises.filter((e) => isExerciseDone(e.id)).length;
      return Math.round(((lessonsDone + exDone) / total) * 100);
    },
    [isCompleted, isExerciseDone]
  );

  const isModuleFullyDone = useCallback(
    (moduleId: string) => {
      const mod = MODULES.find((m) => m.id === moduleId);
      if (!mod) return false;
      const lessonsOk = mod.lessons.every((l) => isCompleted(l.id));
      const exOk = mod.exercises.every((e) => isExerciseDone(e.id));
      return lessonsOk && exOk;
    },
    [isCompleted, isExerciseDone]
  );

  const getOverallProgress = useCallback(() => {
    const totalLessons = MODULES.flatMap((m) => m.lessons).length;
    const totalEx = MODULES.flatMap((m) => m.exercises).length;
    const total = totalLessons + totalEx;
    if (total === 0) return 0;
    const lessonsDone = MODULES.flatMap((m) => m.lessons).filter((l) => isCompleted(l.id)).length;
    const exDone = MODULES.flatMap((m) => m.exercises).filter((e) => isExerciseDone(e.id)).length;
    return Math.round(((lessonsDone + exDone) / total) * 100);
  }, [isCompleted, isExerciseDone]);

  // A module is locked if:
  //  (a) its unlock date is in the future, OR
  //  (b) it's not the first module AND the previous module isn't FULLY done
  //      (all lessons watched + all exercises marked finalized).
  const isModuleLocked = useCallback(
    (moduleIndex: number): boolean => {
      const mod = MODULES[moduleIndex];
      if (!mod) return true;

      if (mod.unlockDate) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const unlock = new Date(mod.unlockDate);
        unlock.setHours(0, 0, 0, 0);
        if (today < unlock) return true;
      }

      if (moduleIndex === 0) return false;

      const prevModule = MODULES[moduleIndex - 1];
      if (!prevModule) return false;
      return !isModuleFullyDone(prevModule.id);
    },
    [isModuleFullyDone]
  );

  const getCompletedLessonsCount = useCallback(() => progress.length, [progress]);
  const getTotalLessonsCount = useCallback(
    () => MODULES.flatMap((m) => m.lessons).length,
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
