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
 * Coduri Postgres pentru „tabelul/coloana nu există". Le tratăm separat pentru că
 * înseamnă un singur lucru: codul multicurs a ajuns în producție înaintea migrației.
 */
const MISSING_SCHEMA_CODES = new Set(['42P01', '42703', 'PGRST200']);

/**
 * Citește înscrierile din DB. La eșec întoarce cache-ul local în loc de listă goală —
 * altfel o rețea proastă ar arăta „nu ai acces la niciun curs" unui elev plătitor.
 *
 * Dacă tabelul `enrollments` lipsește cu totul (migrație neaplicată), degradăm controlat
 * la primul curs activ, în loc să blocăm toată școala afară. Nu e o breșă: RLS-ul din DB
 * protejează datele oricum — fallback-ul deschide doar navigarea, nu conținutul altcuiva.
 */
export async function fetchEnrollments(userId: string, fallbackTariff: Tariff = 'student'): Promise<Enrollment[]> {
  if (!userId) return [];
  try {
    // Fluxul vine odată cu înscrierea: ancorează deblocarea modulelor și canalul de
    // Telegram. Dacă tabelul `flows` nu există încă, reîncercăm fără îmbinare —
    // platforma rămâne funcțională, doar fără fluxuri.
    let data: any[] | null = null;
    const withFlow = await supabase
      .from('enrollments')
      .select('course_id,tariff,granted_at,flow_id,access_until,source_group_id,flows(id,course_id,name,slug,starts_on,ends_on,access_weeks,telegram_url,is_active)')
      .eq('user_id', userId);
    if (withFlow.error) {
      if (!MISSING_SCHEMA_CODES.has(withFlow.error.code)) throw withFlow.error;
      const plain = await supabase
        .from('enrollments')
        .select('course_id,tariff,granted_at')
        .eq('user_id', userId);
      if (plain.error) throw plain.error;
      data = plain.data;
    } else {
      data = withFlow.data;
    }

    const list: Enrollment[] = (data || [])
      .filter((row: any) => !!getCourse(row.course_id))
      .map((row: any) => ({
        course_id: row.course_id,
        tariff: (row.tariff as Tariff) || 'student',
        granted_at: row.granted_at,
        flow_id: row.flow_id ?? null,
        access_until: row.access_until ?? null,
        source_group_id: row.source_group_id ?? null,
        flow: row.flows || null,
      }));
    cacheEnrollments(userId, list);
    return list;
  } catch (error: any) {
    const cached = readCachedEnrollments(userId);
    if (cached.length > 0) {
      console.warn('[Enrollments] citire eșuată; folosesc cache-ul local', error);
      return cached;
    }
    if (MISSING_SCHEMA_CODES.has(error?.code)) {
      const fallback = activeCourses()[0];
      console.warn(
        '[Enrollments] tabelul `enrollments` lipsește — migrația multicurs nu e aplicată. ' +
        'Degradez la cursul implicit.', error,
      );
      // Tariful vine din profil, nu hardcodat: altfel un elev cu tarif Arhitect
      // pierdea biblioteca exact în fereastra dintre deploy și migrație.
      return fallback ? [{ course_id: fallback.id, tariff: fallbackTariff }] : [];
    }
    console.warn('[Enrollments] citire eșuată și fără cache local', error);
    return [];
  }
}

/** Cursurile la care elevul are acces ACUM. Cele expirate nu intră. */
export function enrolledCourses(enrollments: Enrollment[] | null | undefined) {
  const ids = new Set((enrollments || []).filter(e => !isAccessExpired(e)).map(e => e.course_id));
  return activeCourses().filter(c => ids.has(c.id));
}

/** Cursurile la care accesul a expirat. Le arătăm explicit, nu le ascundem tăcut. */
export function expiredCourses(enrollments: Enrollment[] | null | undefined) {
  const ids = new Set((enrollments || []).filter(e => isAccessExpired(e)).map(e => e.course_id));
  return activeCourses().filter(c => ids.has(c.id));
}

/**
 * Accesul a expirat? Fereastra vine de pe înscriere (`access_until`), completată la
 * alocarea în flux dar editabilă individual — cineva poate primi prelungire fără să
 * i se mute grupa. Comparăm pe zi întreagă: ultima zi de acces e inclusivă.
 */
export function isAccessExpired(enrollment: Enrollment | null | undefined, now = new Date()): boolean {
  if (!enrollment?.access_until) return false;
  const until = new Date(`${enrollment.access_until}T23:59:59+03:00`);
  if (Number.isNaN(until.getTime())) return false;
  return now > until;
}

/** Înscris ȘI neexpirat. Asta e întrebarea reală „are acces acum?". */
export function isEnrolled(enrollments: Enrollment[] | null | undefined, courseId: string): boolean {
  const e = (enrollments || []).find(x => x.course_id === courseId);
  return !!e && !isAccessExpired(e);
}

/** Înscrierea la un curs, indiferent dacă a expirat. Pentru mesaje de tip „ți-a expirat". */
export function enrollmentForCourse(enrollments: Enrollment[] | null | undefined, courseId: string) {
  return (enrollments || []).find(e => e.course_id === courseId) || null;
}

/** Tariful elevului la un curs anume. 'student' dacă nu e înscris. */
export function tariffForCourse(enrollments: Enrollment[] | null | undefined, courseId: string): Tariff {
  return (enrollments || []).find(e => e.course_id === courseId)?.tariff || 'student';
}

/** Fluxul elevului la un curs anume. Null dacă nu e asignat niciunui flux. */
export function flowForCourse(enrollments: Enrollment[] | null | undefined, courseId: string) {
  return (enrollments || []).find(e => e.course_id === courseId)?.flow || null;
}
