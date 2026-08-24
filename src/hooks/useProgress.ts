// @ts-nocheck
import { useState, useEffect, useCallback } from 'react';
import { Progress } from '../lib/types';
import { supabase, isMockMode } from '../lib/supabase';
import { useAuthContext } from '../context/AuthContext';
import { useCourse } from '../context/CourseContext';
import { getCourseModules } from '../lib/content';
import { isModuleUnlocked } from '../lib/flows';

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

/**
 * Progresul elevului, întotdeauna raportat la UN curs.
 *
 * Rândurile din `progress` sunt globale (id-urile de lecție sunt unice între cursuri),
 * dar procentele NU au voie să fie: un elev cu Business terminat și Start abia început
 * ar apărea la 50% și ar intra fals în coada de atenție. De aceea fiecare calcul
 * pornește de la modulele cursului curent.
 *
 * @param explicitCourseId cursul de raportat; implicit cel din ruta curentă.
 */
export function useProgress(explicitCourseId?: string) {
  const { user } = useAuthContext();
  const { courseId: contextCourseId, flow } = useCourse();
  const courseId = explicitCourseId || contextCourseId;
  const modules = getCourseModules(courseId);
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

    const [progressRes, exRes] = await Promise.all([
      supabase!.from('progress').select('*').eq('user_id', user.id),
      supabase!.from('exercise_completions').select('exercise_id').eq('user_id', user.id),
    ]);

    // La eroare NU golim starea. `data` e null când interogarea eșuează, iar
    // `|| []` ștergea vizual toate bifele elevului la o simplă pierdere de rețea —
    // arăta ca și cum și-ar fi pierdut tot progresul.
    if (!progressRes.error && progressRes.data) setProgress(progressRes.data);
    else if (progressRes.error) console.warn('[Progress] citire eșuată; păstrez starea', progressRes.error);

    if (!exRes.error && exRes.data) setExerciseDone(exRes.data.map((r: any) => r.exercise_id));
    else if (exRes.error) console.warn('[Progress] exerciții: citire eșuată; păstrez starea', exRes.error);

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

  const unmarkComplete = useCallback(
    async (lessonId: string) => {
      if (!user) return;
      if (isMockMode) {
        const updated = progress.filter((p) => p.lesson_id !== lessonId);
        setProgress(updated);
        saveMockProgress(updated.length ? updated : [{ user_id: user.id, lesson_id: '__none__', completed_at: new Date().toISOString() }]);
        return;
      }
      await supabase!.from('progress').delete().eq('user_id', user.id).eq('lesson_id', lessonId);
      setProgress((prev) => prev.filter((p) => p.lesson_id !== lessonId));
    },
    [user, progress]
  );

  // Exercise completions are their own durable record: the tick survives even
  // if the student later edits the answer text.
  const markExerciseComplete = useCallback(
    async (exerciseId: string) => {
      if (!user || !exerciseId || isMockMode) return;
      if (exerciseDone.includes(exerciseId)) return;
      setExerciseDone((prev) => [...prev, exerciseId]);
      const { error } = await supabase!
        .from('exercise_completions')
        .insert({ user_id: user.id, exercise_id: exerciseId });
      if (error && error.code !== '23505') {
        setExerciseDone((prev) => prev.filter((e) => e !== exerciseId));
      }
    },
    [user, exerciseDone]
  );

  const unmarkExerciseComplete = useCallback(
    async (exerciseId: string) => {
      if (!user || !exerciseId || isMockMode) return;
      setExerciseDone((prev) => prev.filter((e) => e !== exerciseId));
      await supabase!
        .from('exercise_completions')
        .delete()
        .eq('user_id', user.id)
        .eq('exercise_id', exerciseId);
    },
    [user]
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
      const mod = modules.find((m) => m.id === moduleId);
      if (!mod) return 0;
      const trackableLessons = mod.lessons.filter(isTrackableLesson);
      const total = trackableLessons.length;
      if (total === 0) return 0;
      const lessonsDone = trackableLessons.filter((l) => isCompleted(l.id)).length;
      return Math.round((lessonsDone / total) * 100);
    },
    [isCompleted, modules]
  );

  const isModuleFullyDone = useCallback(
    (moduleId: string) => {
      const mod = modules.find((m) => m.id === moduleId);
      if (!mod) return false;
      const trackableLessons = mod.lessons.filter(isTrackableLesson);
      return trackableLessons.length > 0 && trackableLessons.every((l) => isCompleted(l.id));
    },
    [isCompleted, modules]
  );

  /** Procentul într-un curs oarecare — folosit de ecranul de selecție a cursului. */
  const getOverallProgressFor = useCallback(
    (targetCourseId: string) => {
      const trackableLessons = getCourseModules(targetCourseId)
        .flatMap((m) => m.lessons)
        .filter(isTrackableLesson);
      const total = trackableLessons.length;
      // Un curs fără nimic de parcurs e 0%, nu 100%. Fără garda asta, START (lecții
      // nefilmate) apărea „complet" pe ecranul de selecție.
      if (total === 0) return 0;
      const lessonsDone = trackableLessons.filter((l) => isCompleted(l.id)).length;
      return Math.round((lessonsDone / total) * 100);
    },
    [isCompleted]
  );

  const getOverallProgress = useCallback(
    () => (courseId ? getOverallProgressFor(courseId) : 0),
    [courseId, getOverallProgressFor]
  );


  /**
   * Un modul e blocat până la data lui de deschidere, calculată față de data de start
   * a FLUXULUI elevului (`starts_on + unlockWeek * 7`). Pentru elevii fără flux
   * asignat se cade pe data absolută din cod — comportamentul de dinainte de fluxuri.
   *
   * Fără calculul relativ, orice flux nou primea tot practicumul deblocat din prima
   * zi, pentru că datele scrise în cod erau deja trecute.
   */
  const isModuleLocked = useCallback(
    (moduleIndex: number): boolean => {
      const mod = modules[moduleIndex];
      if (!mod) return true;
      return !isModuleUnlocked(mod, flow);
    },
    [modules, flow]
  );

  /**
   * Modulul-poartă nelivrat încă.
   *
   * Metodologia START e explicită: „orice modul ulterior presupune că ai trecut prin
   * validare. Dacă sari peste asta, construiești pe nisip." Un modul marcat `isGate`
   * condiționează tot ce vine după el, până când livrabilul lui e bifat.
   *
   * Nu blochează navigarea — avertizează. Un elev plătitor care e la jumătatea
   * conversațiilor de validare are dreptul să se uite înainte; important e să știe,
   * și să știe și mentorul, că lucrează în afara ordinii.
   */
  const getPendingGate = useCallback(
    (moduleIndex: number) => {
      for (let i = 0; i < moduleIndex && i < modules.length; i++) {
        const gate: any = modules[i];
        if (!gate?.isGate) continue;
        const deliverables = (gate.lessons || []).filter((l: any) => l.type === 'exercise');
        const delivered = deliverables.length > 0 && deliverables.every((l: any) => isCompleted(l.id));
        if (!delivered) return gate;
      }
      return null;
    },
    [modules, isCompleted]
  );

  const getCompletedLessonsCount = useCallback(() => {
    const videoLessonIds = new Set(modules.flatMap((m) => m.lessons).filter(hasVideo).map((l) => l.id));
    return progress.filter((p) => videoLessonIds.has(p.lesson_id)).length;
  }, [progress, modules]);
  const getTotalLessonsCount = useCallback(
    () => modules.flatMap((m) => m.lessons).filter(hasVideo).length,
    [modules]
  );

  return {
    progress,
    loading,
    markComplete,
    unmarkComplete,
    markExerciseComplete,
    unmarkExerciseComplete,
    isCompleted,
    isExerciseDone,
    isModuleFullyDone,
    getModuleProgress,
    getOverallProgress,
    getOverallProgressFor,
    getPendingGate,
    isModuleLocked,
    getCompletedLessonsCount,
    getTotalLessonsCount,
    refetch: fetchProgress,
  };
}
