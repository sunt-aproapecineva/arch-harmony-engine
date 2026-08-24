// @ts-nocheck
import { supabase } from '@/integrations/supabase/client';
import type { Tariff } from './types';

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

export interface AdminUserRow {
  id: string;
  email: string;
  full_name: string;
  tariff: Tariff;
  created_at: string;
  is_admin: boolean;
  /** Elevul are acces la cursul privit acum de admin. */
  enrolled: boolean;
  /** Fluxul din care face parte la acest curs. Null = neasignat. */
  flow_id: string | null;
  quiz_done: boolean;
  last_activity?: string | null;
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
export async function fetchAdminUsers(courseId: string): Promise<AdminUserRow[]> {
  const [{ data: profiles }, { data: roles }, { data: quiz }, { data: activity }, { data: enrollments }] = await Promise.all([
    supabase.from('profiles').select('id,email,full_name,tariff,created_at').order('created_at', { ascending: false }),
    supabase.from('user_roles').select('user_id,role'),
    withSchemaFallback(
      () => supabase.from('quiz_responses').select('user_id,completed_at').eq('course_id', courseId),
      () => supabase.from('quiz_responses').select('user_id,completed_at'),
    ),
    supabase.from('activity_log').select('user_id,created_at').order('created_at', { ascending: false }).limit(2000),
    withSchemaFallback(
      () => supabase.from('enrollments').select('user_id,tariff,flow_id').eq('course_id', courseId),
      // Fără tabelul de înscrieri, toată lumea e considerată înscrisă la cursul privit,
      // cu tariful de pe profil — exact comportamentul de dinainte de multicurs.
      async () => ({ data: null, error: null }),
    ),
  ]);
  const adminIds = new Set((roles || []).filter((r: any) => r.role === 'admin').map((r: any) => r.user_id));
  const quizUserIds = new Set((quiz || []).map((q: any) => q.user_id));
  const enrolledTariff: Record<string, Tariff> = {};
  const enrolledFlow: Record<string, string | null> = {};
  const enrollmentsKnown = Array.isArray(enrollments);
  (enrollments || []).forEach((e: any) => {
    enrolledTariff[e.user_id] = (e.tariff as Tariff) || 'student';
    enrolledFlow[e.user_id] = e.flow_id ?? null;
  });
  const lastActivityBy: Record<string, string> = {};
  (activity || []).forEach((a: any) => {
    if (!lastActivityBy[a.user_id]) lastActivityBy[a.user_id] = a.created_at;
  });
  return (profiles || []).map((p: any) => ({
    id: p.id,
    email: p.email,
    full_name: p.full_name || '',
    tariff: enrolledTariff[p.id] || (p.tariff as Tariff) || 'student',
    created_at: p.created_at,
    is_admin: adminIds.has(p.id),
    enrolled: enrollmentsKnown ? p.id in enrolledTariff : true,
    flow_id: enrolledFlow[p.id] ?? null,
    quiz_done: quizUserIds.has(p.id),
    last_activity: lastActivityBy[p.id] || null,
  }));
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
