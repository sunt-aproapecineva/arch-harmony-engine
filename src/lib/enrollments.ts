// @ts-nocheck
// Înscrierile elevului la cursuri — „la ce produse are acces".
//
// Tariful stă aici, nu pe profil: un elev poate fi 'arhitect' la Business și
// 'student' la Start. `profiles.tariff` rămâne în bază doar ca plasă de migrație.
//
// Local-first, ca tot restul platformei (invariantul 3): lista se oglindește în
// localStorage, ca ecranul de selecție și gating-ul de rută să nu depindă de o
// citire lentă. O eroare de rețea nu are voie să lase elevul fără cursuri.
import { supabase } from '@/integrations/supabase/client';
import type { Tariff, Enrollment } from './types';
import { CourseId, activeCourses, getCourse } from './courses';

export type { Enrollment };

const cacheKey = (userId: string) => `aa_enrollments_${userId}`;

export function readCachedEnrollments(userId: string): Enrollment[] {
  if (!userId || typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(cacheKey(userId));
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter(e => !!getCourse(e?.course_id)) : [];
  } catch {
    return [];
  }
}

export function cacheEnrollments(userId: string, list: Enrollment[]) {
  if (!userId || typeof window === 'undefined') return;
  try { localStorage.setItem(cacheKey(userId), JSON.stringify(list)); } catch { /* storage plin */ }
}

export function clearCachedEnrollments(userId: string) {
  if (!userId || typeof window === 'undefined') return;
  try { localStorage.removeItem(cacheKey(userId)); } catch { /* noop */ }
}

/**
 * Citește înscrierile din DB. La eșec întoarce cache-ul local în loc de listă goală —
 * altfel o rețea proastă ar arăta „nu ai acces la niciun curs" unui elev plătitor.
 */
export async function fetchEnrollments(userId: string): Promise<Enrollment[]> {
  if (!userId) return [];
  try {
    const { data, error } = await supabase
      .from('enrollments')
      .select('course_id,tariff,granted_at')
      .eq('user_id', userId);
    if (error) throw error;
    const list: Enrollment[] = (data || [])
      .filter((row: any) => !!getCourse(row.course_id))
      .map((row: any) => ({
        course_id: row.course_id,
        tariff: (row.tariff as Tariff) || 'student',
        granted_at: row.granted_at,
      }));
    cacheEnrollments(userId, list);
    return list;
  } catch (error) {
    console.warn('[Enrollments] citire eșuată; folosesc cache-ul local', error);
    return readCachedEnrollments(userId);
  }
}

/** Cursurile la care elevul are acces, în ordinea din registru. Doar cursuri active. */
export function enrolledCourses(enrollments: Enrollment[] | null | undefined) {
  const ids = new Set((enrollments || []).map(e => e.course_id));
  return activeCourses().filter(c => ids.has(c.id));
}

export function isEnrolled(enrollments: Enrollment[] | null | undefined, courseId: string): boolean {
  return (enrollments || []).some(e => e.course_id === courseId);
}

/** Tariful elevului la un curs anume. 'student' dacă nu e înscris. */
export function tariffForCourse(enrollments: Enrollment[] | null | undefined, courseId: string): Tariff {
  return (enrollments || []).find(e => e.course_id === courseId)?.tariff || 'student';
}
