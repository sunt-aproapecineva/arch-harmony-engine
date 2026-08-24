// @ts-nocheck
// GRUPA — unitatea de ADMINISTRARE.
//
// O listă de oameni cu nume. Nu are orar, nu are canal de comunicare și nu dă acces
// prin ea însăși. Există ca să poți face operațiuni în masă: aduni treizeci de oameni
// o dată, aloci grupa unui flux, și toți primesc acces cu orarul acelui flux.
//
// Un om poate fi în mai multe grupe. O grupă poate fi alocată mai multor fluxuri
// (inclusiv din traininguri diferite).
//
// Nu confunda cu FLUXUL (src/lib/flows.ts): acela e unitatea de livrare — el decide
// ce vede elevul și când. Grupa doar mută oameni.
//
// Alocarea scrie înscrieri reale, cu `source_group_id` care reține proveniența.
// Retragerea grupei șterge doar ce a adus ea; accesele date manual rămân neatinse.
import { supabase } from '@/integrations/supabase/client';
import { defaultTier } from './courses';

export interface Group {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
  memberCount?: number;
  assignments?: GroupAssignment[];
}

export interface GroupMember {
  user_id: string;
  full_name: string;
  email: string;
  added_at: string;
}

export interface GroupAssignment {
  id: string;
  group_id: string;
  flow_id: string;
  tariff: string;
  assigned_at: string;
}

export async function fetchGroups(): Promise<Group[]> {
  try {
    const [gRes, mRes, aRes] = await Promise.all([
      supabase.from('groups').select('id,name,description,created_at').order('created_at', { ascending: false }),
      supabase.from('group_members').select('group_id'),
      supabase.from('group_flow_assignments').select('id,group_id,flow_id,tariff,assigned_at'),
    ]);
    if (gRes.error) throw gRes.error;
    const counts: Record<string, number> = {};
    (mRes.data || []).forEach((r: any) => { counts[r.group_id] = (counts[r.group_id] || 0) + 1; });
    const byGroup: Record<string, GroupAssignment[]> = {};
    (aRes.data || []).forEach((r: any) => { (byGroup[r.group_id] ||= []).push(r); });
    return (gRes.data || []).map((g: any) => ({
      ...g,
      memberCount: counts[g.id] || 0,
      assignments: byGroup[g.id] || [],
    }));
  } catch (error) {
    console.warn('[Groups] citire eșuată', error);
    return [];
  }
}

export async function fetchGroupMembers(groupId: string): Promise<GroupMember[]> {
  if (!groupId) return [];
  const { data, error } = await supabase
    .from('group_members')
    .select('user_id,added_at,profiles(full_name,email)')
    .eq('group_id', groupId)
    .order('added_at');
  if (error) {
    console.warn('[Groups] membri indisponibili', error);
    return [];
  }
  return (data || []).map((r: any) => ({
    user_id: r.user_id,
    full_name: r.profiles?.full_name || '',
    email: r.profiles?.email || '',
    added_at: r.added_at,
  }));
}

export async function createGroup(name: string, description: string, createdBy: string | null) {
  return supabase.from('groups').insert({ name, description: description || null, created_by: createdBy }).select().single();
}

export async function renameGroup(groupId: string, name: string, description: string) {
  return supabase.from('groups').update({ name, description: description || null }).eq('id', groupId);
}

export async function deleteGroup(groupId: string) {
  return supabase.from('groups').delete().eq('id', groupId);
}

/** Adaugă oameni în grupă. Nu le dă acces — asta face abia alocarea la un flux. */
export async function addMembers(groupId: string, userIds: string[], addedBy: string | null) {
  if (!userIds.length) return { error: null };
  const rows = userIds.map(user_id => ({ group_id: groupId, user_id, added_by: addedBy }));
  return supabase.from('group_members').upsert(rows, { onConflict: 'group_id,user_id' });
}

export async function removeMember(groupId: string, userId: string) {
  return supabase.from('group_members').delete().eq('group_id', groupId).eq('user_id', userId);
}

/**
 * Alocă grupa unui flux: fiecare membru primește înscrierea la cursul fluxului, cu
 * orarul și fereastra lui de acces. Idempotentă — re-rularea prinde doar membrii noi.
 */
export async function assignGroupToFlow(groupId: string, flowId: string, tariff?: string) {
  // Treapta aparține PROGRAMULUI fluxului. Implicitul era 'student' — o treaptă
  // Business scrisă și în înscrierile de la START, unde nici nu există: elevul
  // apărea apoi sub un tarif inexistent și nu trecea de niciun filtru.
  if (!tariff) {
    const { data } = await supabase.from('flows').select('course_id').eq('id', flowId).maybeSingle();
    tariff = defaultTier(data?.course_id)?.id || 'student';
  }
  const up = await supabase
    .from('group_flow_assignments')
    .upsert({ group_id: groupId, flow_id: flowId, tariff }, { onConflict: 'group_id,flow_id' });
  if (up.error) return { count: 0, error: up.error };
  const { data, error } = await supabase.rpc('apply_group_to_flow', { _group_id: groupId, _flow_id: flowId });
  return { count: typeof data === 'number' ? data : 0, error };
}

/** Retrage grupa dintr-un flux. Accesele date manual rămân neatinse. */
export async function revokeGroupFromFlow(groupId: string, flowId: string) {
  const { data, error } = await supabase.rpc('revoke_group_from_flow', { _group_id: groupId, _flow_id: flowId });
  return { count: typeof data === 'number' ? data : 0, error };
}
