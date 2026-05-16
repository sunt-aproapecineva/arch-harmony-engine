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
  const [loading, setLoading] = useState(true);

  const fetchProgress = useCallback(async () => {
    if (!user) {
      setProgress([]);
      setLoading(false);
      return;
    }

    if (isMockMode) {
      setProgress(getMockProgress(user.id));
      setLoading(false);
      return;
    }

    const { data } = await supabase!
      .from('progress')
      .select('*')
      .eq('user_id', user.id);

    setProgress(data || []);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchProgress();
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
    (lessonId: string) => {
      return progress.some((p) => p.lesson_id === lessonId);
    },
    [progress]
  );

  const getModuleProgress = useCallback(
    (moduleId: string) => {
      const mod = MODULES.find((m) => m.id === moduleId);
      if (!mod) return 0;
      const total = mod.lessons.length;
      if (total === 0) return 0;
      const done = mod.lessons.filter((l) => isCompleted(l.id)).length;
      return Math.round((done / total) * 100);
    },
    [isCompleted]
  );

  const getModuleCompletedCount = useCallback(
    (moduleId: string) => {
      const mod = MODULES.find((m) => m.id === moduleId);
      if (!mod) return 0;
      return mod.lessons.filter((l) => isCompleted(l.id)).length;
    },
    [isCompleted]
  );

  const getOverallProgress = useCallback(() => {
    const allLessons = MODULES.flatMap((m) => m.lessons);
    const total = allLessons.length;
    if (total === 0) return 0;
    const done = allLessons.filter((l) => isCompleted(l.id)).length;
    return Math.round((done / total) * 100);
  }, [isCompleted]);

  const isModuleLocked = useCallback(
    (moduleIndex: number): boolean => {
      const mod = MODULES[moduleIndex];
      if (!mod) return true;

      // Check date-based unlock
      if (mod.unlockDate) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const unlock = new Date(mod.unlockDate);
        unlock.setHours(0, 0, 0, 0);
        if (today < unlock) return true;
      }

      // Module 0 is always open if date is OK
      if (moduleIndex === 0) return false;

      // Check progress-based unlock
      const prevModule = MODULES[moduleIndex - 1];
      if (!prevModule) return false;
      return getModuleCompletedCount(prevModule.id) === 0;
    },
    [getModuleCompletedCount]
  );

  const getCompletedLessonsCount = useCallback(() => {
    return progress.length;
  }, [progress]);

  const getTotalLessonsCount = useCallback(() => {
    return MODULES.flatMap((m) => m.lessons).length;
  }, []);

  return {
    progress,
    loading,
    markComplete,
    isCompleted,
    getModuleProgress,
    getOverallProgress,
    isModuleLocked,
    getCompletedLessonsCount,
    getTotalLessonsCount,
    refetch: fetchProgress,
  };
}
