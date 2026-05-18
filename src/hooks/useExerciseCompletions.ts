// @ts-nocheck
import { useCallback, useEffect, useState } from 'react';
import { useAuthContext } from '../context/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface CompletionRow {
  exercise_id: string;
  completed_at: string;
}

export function useExerciseCompletions() {
  const { user } = useAuthContext();
  const [rows, setRows] = useState<CompletionRow[]>([]);
  const [loading, setLoading] = useState(true);

  const refetch = useCallback(async () => {
    if (!user) {
      setRows([]);
      setLoading(false);
      return;
    }
    const { data } = await supabase
      .from('exercise_completions')
      .select('exercise_id, completed_at')
      .eq('user_id', user.id);
    setRows(data || []);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  const isExerciseCompleted = useCallback(
    (exerciseId: string) => rows.some((r) => r.exercise_id === exerciseId),
    [rows],
  );

  const markExerciseComplete = useCallback(
    async (exerciseId: string) => {
      if (!user) return;
      if (rows.some((r) => r.exercise_id === exerciseId)) return;
      const optimistic = { exercise_id: exerciseId, completed_at: new Date().toISOString() };
      setRows((prev) => [...prev, optimistic]);
      await supabase
        .from('exercise_completions')
        .insert({ user_id: user.id, exercise_id: exerciseId });
    },
    [user, rows],
  );

  const unmarkExerciseComplete = useCallback(
    async (exerciseId: string) => {
      if (!user) return;
      setRows((prev) => prev.filter((r) => r.exercise_id !== exerciseId));
      await supabase
        .from('exercise_completions')
        .delete()
        .eq('user_id', user.id)
        .eq('exercise_id', exerciseId);
    },
    [user],
  );

  return { isExerciseCompleted, markExerciseComplete, unmarkExerciseComplete, loading, refetch };
}
