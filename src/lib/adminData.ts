// @ts-nocheck
import { supabase } from '@/integrations/supabase/client';
import type { Tariff } from './types';
import { parseTariffFilter } from './courses';

/**
 * Rulează o interogare filtrată pe curs; dacă schema multicurs nu e încă aplicată
 * (coloana sau tabelul lipsesc), cade pe varianta veche în loc să întoarcă listă goală.
 * Plasa asta dispare de la sine după rularea migrației.
 */
const SCHEMA_MISSING = new Set(['42703', '42P01']);
async function withSchemaFallback<T>(scoped: () => any, legacy: () => any) {
  const res = await scoped();
  if (!res.error || !SCHEMA_MISSING.has(res.error.code)) return res;
  console.warn('[Admin] schema multicurs neaplicată — folosesc interogarea veche', res.error.code);
  return await legacy();
}

export interface AdminLesson {
  id: string;
  module_id: string;
  title: string;
  description: string | null;
  video_url: string | null;
  pdf_url: string | null;
  duration_min: number | null;
  order_index: number;
  is_published: boolean;
}

export interface AdminModule {
  id: string;
  title: string;
  subtitle: string | null;
  description: string | null;
  order_index: number;
  etapa: string | null;
  saptamana: string | null;
  lessons: AdminLesson[];
}

/** O înscriere, așa cum o vede adminul în liste. */
export interface AdminEnrollment {
  course_id: string;
  tariff: Tariff;
  flow_id: string | null;
  access_until: string | null;
}

/**
 * Un utilizator, cu TOATE înscrierile lui.
 *
 * Înainte rândul purta un singur `tariff` și un singur `flow_id`, ale programului în
 * care intrase adminul. Un om înscris și la Business, și la START avea deci două
 * adevăruri diferite în funcție de comutatorul din bara laterală — și niciunul complet.
 * Filtrarea se face acum peste lista de înscrieri, prin helperii de mai jos.
 */
export interface AdminUserRow {
  id: string;
  email: string;
  full_name: string;
  created_at: string;
  is_admin: boolean;
  last_activity?: string | null;
  /** Toate înscrierile, la toate programele. Goală = fără acces nicăieri. */
  enrollments: AdminEnrollment[];
  /** Programele la care a completat quizul de onboarding. */
  quizCourses: string[];
  /**
   * Tariful de pe profil. Rămâne doar ca plasă pentru conturile de dinainte de
   * multicurs, când înscrierile nu existau. Nu-l folosi pentru afișare.
   */
  legacyTariff: Tariff;
}

/** Înscrierea unui elev la un program. Null dacă n-are. */
export function userEnrollment(u: AdminUserRow, courseId: string | null | undefined): AdminEnrollment | null {
  if (!courseId) return u.enrollments[0] || null;
  return u.enrollments.find(e => e.course_id === courseId) || null;
}

export function userEnrolled(u: AdminUserRow, courseId: string | null | undefined): boolean {
  if (!courseId) return u.enrollments.length > 0;
  return u.enrollments.some(e => e.course_id === courseId);
}

export function userTariff(u: AdminUserRow, courseId: string | null | undefined): Tariff | null {
  return userEnrollment(u, courseId)?.tariff ?? null;
}

export function userFlowId(u: AdminUserRow, courseId: string | null | undefined): string | null {
  return userEnrollment(u, courseId)?.flow_id ?? null;
}

export function userQuizDone(u: AdminUserRow, courseId: string | null | undefined): boolean {
  if (!courseId) return u.quizCourses.length > 0;
  return u.quizCourses.includes(courseId);
}

/**
 * Rândul trece de filtrele program / flux / treaptă?
 *
 * Cele trei se aplică pe ACEEAȘI înscriere, nu independent: altfel un om înscris la
 * Business-Flux 1 cu treapta Arhitect ar trece de „START + Arhitect" pentru că are, pe
 * undeva, și un START, și un Arhitect. Adminii au nevoie de răspunsul corect, nu de
 * unul generos.
 */
export function matchesScope(
  u: AdminUserRow,
  scope: { courseId?: string | null; flowId?: string | null; tariffId?: string | null },
): boolean {
  const { courseId, flowId, tariffId } = scope;
  if (!courseId && !flowId && !tariffId) return true;
  // Treapta vine ca „program:treaptă", deci filtrează și programul chiar când
  // adminul se uită la toate.
  const tier = parseTariffFilter(tariffId);
  const candidates = courseId ? u.enrollments.filter(e => e.course_id === courseId) : u.enrollments;
  if (!candidates.length) return false;
  return candidates.some(e =>
    (!flowId || e.flow_id === flowId) &&
    (!tier || (e.course_id === tier.courseId && e.tariff === tier.tierId)),
  );
}

export interface AdminProgressRow {
  user_id: string;
  lesson_id: string;
  completed_at: string;
}

/** Modulele unui curs, cu lecțiile lor. Editorul de conținut lucrează pe o ramură odată. */
export async function fetchModulesWithLessons(courseId: string): Promise<AdminModule[]> {
  const [{ data: modules }, { data: lessons }] = await Promise.all([
    withSchemaFallback(
      () => supabase.from('modules').select('*').eq('course_id', courseId).order('order_index'),
      () => supabase.from('modules').select('*').order('order_index'),
    ),
    supabase.from('lessons').select('*').order('order_index'),
  ]);
  const mods = (modules || []) as any[];
  const lessonsByMod: Record<string, AdminLesson[]> = {};
  (lessons || []).forEach((l: any) => {
    if (!lessonsByMod[l.module_id]) lessonsByMod[l.module_id] = [];
    lessonsByMod[l.module_id].push(l);
  });
  return mods.map(m => ({ ...m, lessons: lessonsByMod[m.id] || [] }));
}

/**
 * Utilizatorii, cu starea lor la un curs anume: tariful de pe înscriere și quizul acelui
 * curs. Tariful de pe profil rămâne doar ca fallback pentru conturile nemigrate.
 */
/**
 * Toți utilizatorii, cu toate înscrierile și quizurile lor.
 *
 * Fără parametru de curs: adminul vede tot, iar decupajul se face în pagină, cu
 * `matchesScope`. Interogările nu mai sunt filtrate pe server pe `course_id` — sunt
 * câteva sute de rânduri, iar filtrarea pe client face posibile coloane de tipul
 * „la ce programe are acces omul ăsta", imposibile cu o interogare îngustată.
 */
export async function fetchAdminUsers(): Promise<AdminUserRow[]> {
  const [{ data: profiles }, { data: roles }, quizRes, { data: activity }, enrollRes] = await Promise.all([
    supabase.from('profiles').select('id,email,full_name,tariff,created_at').order('created_at', { ascending: false }),
    supabase.from('user_roles').select('user_id,role'),
    withSchemaFallback(
      () => supabase.from('quiz_responses').select('user_id,course_id,completed_at'),
      () => supabase.from('quiz_responses').select('user_id,completed_at'),
    ),
    supabase.from('activity_log').select('user_id,created_at').order('created_at', { ascending: false }).limit(2000),
    withSchemaFallback(
      () => supabase.from('enrollments').select('user_id,course_id,tariff,flow_id,access_until'),
      // Fără coloanele noi, măcar înscrierile de bază.
      () => supabase.from('enrollments').select('user_id,course_id,tariff'),
    ),
  ]);

  const adminIds = new Set((roles || []).filter((r: any) => r.role === 'admin').map((r: any) => r.user_id));

  // Quiz per program. Fără coloana `course_id` (migrație neaplicată) tot ce există
  // este quizul vechi, adică al programului Business.
  const quizByUser: Record<string, Set<string>> = {};
  (quizRes?.data || []).forEach((q: any) => {
    (quizByUser[q.user_id] ||= new Set()).add(q.course_id || 'business');
  });

  const enrollByUser: Record<string, AdminEnrollment[]> = {};
  const enrollmentsKnown = Array.isArray(enrollRes?.data);
  (enrollRes?.data || []).forEach((e: any) => {
    (enrollByUser[e.user_id] ||= []).push({
      course_id: e.course_id || 'business',
      tariff: (e.tariff as Tariff) || 'student',
      flow_id: e.flow_id ?? null,
      access_until: e.access_until ?? null,
    });
  });

  const lastActivityBy: Record<string, string> = {};
  (activity || []).forEach((a: any) => {
    if (!lastActivityBy[a.user_id]) lastActivityBy[a.user_id] = a.created_at;
  });

  return (profiles || []).map((p: any) => {
    const legacyTariff = (p.tariff as Tariff) || 'student';
    // Plasa de dinainte de multicurs: fără tabelul de înscrieri, toată lumea era la
    // Business, cu tariful de pe profil. Sintetizăm exact asta, ca panoul să rămână
    // utilizabil până la aplicarea migrației — și nimic mai mult.
    const enrollments = enrollmentsKnown
      ? (enrollByUser[p.id] || [])
      : [{ course_id: 'business', tariff: legacyTariff, flow_id: null, access_until: null }];
    return {
      id: p.id,
      email: p.email,
      full_name: p.full_name || '',
      created_at: p.created_at,
      is_admin: adminIds.has(p.id),
      last_activity: lastActivityBy[p.id] || null,
      enrollments,
      quizCourses: Array.from(quizByUser[p.id] || []),
      legacyTariff,
    };
  });
}

export async function fetchAllProgress(): Promise<AdminProgressRow[]> {
  const { data } = await supabase.from('progress').select('user_id,lesson_id,completed_at').limit(10000);
  return (data || []) as AdminProgressRow[];
}

export async function setUserAdmin(userId: string, makeAdmin: boolean): Promise<{ error: string | null }> {
  if (makeAdmin) {
    const { error } = await supabase.from('user_roles').insert({ user_id: userId, role: 'admin' });
    if (error && !error.message.includes('duplicate')) return { error: error.message };
  } else {
    const { error } = await supabase.from('user_roles').delete().eq('user_id', userId).eq('role', 'admin');
    if (error) return { error: error.message };
  }
  return { error: null };
}
