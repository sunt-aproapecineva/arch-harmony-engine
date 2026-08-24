// @ts-nocheck
// Fluxurile (cohortele) unui curs.
//
// Un flux NU e un curs: conținutul e comun, o singură dată. Ce diferă e calendarul
// — ancorat în data de start a fluxului — și canalul de comunicare.
//
// Mecanica centrală: modulul cu `unlockWeek = N` se deschide la `starts_on + N*7 zile`.
// Fluxul 1 pornit pe 18 mai își păstrează exact datele de dinainte de refactor;
// Fluxul 2 pornit în ianuarie primește același ritm, la datele lui.
import { supabase } from '@/integrations/supabase/client';

export interface Cohort {
  id: string;
  course_id: string;
  name: string;
  slug: string;
  /** ISO yyyy-mm-dd. Ancora tuturor deblocărilor. */
  starts_on: string;
  telegram_url: string | null;
  is_active: boolean;
}

export interface CohortEvent {
  id: string;
  cohort_id: string;
  type: 'zoom' | 'workshop';
  title: string;
  description: string;
  date: string;
  time: string;
  duration: string;
  workshopThemes?: string[];
}

const cacheKey = (userId: string) => `aa_cohort_${userId}`;

export function readCachedCohort(userId: string): Cohort | null {
  if (!userId || typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(cacheKey(userId));
    return raw ? (JSON.parse(raw) as Cohort) : null;
  } catch {
    return null;
  }
}

export function cacheCohort(userId: string, cohort: Cohort | null) {
  if (!userId || typeof window === 'undefined') return;
  try {
    if (cohort) localStorage.setItem(cacheKey(userId), JSON.stringify(cohort));
    else localStorage.removeItem(cacheKey(userId));
  } catch { /* noop */ }
}

/** Fluxurile unui curs, cele mai noi primele. Pentru administrare. */
export async function fetchCohorts(courseId: string): Promise<Cohort[]> {
  try {
    const { data, error } = await supabase
      .from('cohorts')
      .select('id,course_id,name,slug,starts_on,telegram_url,is_active')
      .eq('course_id', courseId)
      .order('starts_on', { ascending: false });
    if (error) throw error;
    return (data || []) as Cohort[];
  } catch (error) {
    console.warn('[Cohorts] citire eșuată', error);
    return [];
  }
}

/** Evenimentele live ale unui flux. RLS lasă elevul să vadă doar fluxul lui. */
export async function fetchCohortEvents(cohortId: string): Promise<CohortEvent[]> {
  if (!cohortId) return [];
  try {
    const { data, error } = await supabase
      .from('cohort_events')
      .select('id,cohort_id,type,title,description,event_date,event_time,duration,workshop_themes')
      .eq('cohort_id', cohortId)
      .order('event_date');
    if (error) throw error;
    return (data || []).map((r: any) => ({
      id: r.id,
      cohort_id: r.cohort_id,
      type: r.type === 'workshop' ? 'workshop' : 'zoom',
      title: r.title,
      description: r.description || '',
      date: r.event_date,
      time: r.event_time || '',
      duration: r.duration || '',
      workshopThemes: Array.isArray(r.workshop_themes) ? r.workshop_themes : undefined,
    }));
  } catch (error) {
    console.warn('[Cohorts] evenimente indisponibile', error);
    return [];
  }
}

/**
 * Data la care se deschide un modul pentru un flux anume.
 *
 * Ordinea de decizie contează:
 *  1. flux cu dată de start + unlockWeek pe modul → calcul relativ (cazul normal)
 *  2. fără flux, dar cu unlockDate în cod → data absolută veche (elevi nemigrați)
 *  3. nimic → modulul e deschis
 */
export function moduleUnlockDate(mod: any, cohort: Cohort | null | undefined): Date | null {
  if (cohort?.starts_on && typeof mod?.unlockWeek === 'number') {
    const start = new Date(`${cohort.starts_on}T00:00:00+03:00`);
    if (!Number.isNaN(start.getTime())) {
      start.setDate(start.getDate() + mod.unlockWeek * 7);
      return start;
    }
  }
  if (mod?.unlockDate) {
    const d = new Date(`${mod.unlockDate}T00:00:00+03:00`);
    return Number.isNaN(d.getTime()) ? null : d;
  }
  return null;
}

export function isModuleUnlocked(mod: any, cohort: Cohort | null | undefined, now = new Date()): boolean {
  const unlock = moduleUnlockDate(mod, cohort);
  return !unlock || now >= unlock;
}
