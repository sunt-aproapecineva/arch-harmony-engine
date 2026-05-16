// @ts-nocheck
import { supabase } from '@/integrations/supabase/client';
import type { Tariff } from './types';

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
  quiz_done: boolean;
  last_activity?: string | null;
}

export interface AdminProgressRow {
  user_id: string;
  lesson_id: string;
  completed_at: string;
}

export async function fetchModulesWithLessons(): Promise<AdminModule[]> {
  const [{ data: modules }, { data: lessons }] = await Promise.all([
    supabase.from('modules').select('*').order('order_index'),
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

export async function fetchAdminUsers(): Promise<AdminUserRow[]> {
  const [{ data: profiles }, { data: roles }, { data: quiz }, { data: activity }] = await Promise.all([
    supabase.from('profiles').select('id,email,full_name,tariff,created_at').order('created_at', { ascending: false }),
    supabase.from('user_roles').select('user_id,role'),
    supabase.from('quiz_responses').select('user_id,completed_at'),
    supabase.from('activity_log').select('user_id,created_at').order('created_at', { ascending: false }).limit(2000),
  ]);
  const adminIds = new Set((roles || []).filter((r: any) => r.role === 'admin').map((r: any) => r.user_id));
  const quizUserIds = new Set((quiz || []).map((q: any) => q.user_id));
  const lastActivityBy: Record<string, string> = {};
  (activity || []).forEach((a: any) => {
    if (!lastActivityBy[a.user_id]) lastActivityBy[a.user_id] = a.created_at;
  });
  return (profiles || []).map((p: any) => ({
    id: p.id,
    email: p.email,
    full_name: p.full_name || '',
    tariff: (p.tariff as Tariff) || 'student',
    created_at: p.created_at,
    is_admin: adminIds.has(p.id),
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
