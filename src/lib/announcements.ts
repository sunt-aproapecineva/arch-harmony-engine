// @ts-nocheck
import { supabase } from '@/integrations/supabase/client';

export interface Announcement {
  id: string;
  message: string;
  type: 'info' | 'success' | 'warning';
  expires_at: string | null;
  created_at: string;
  /** Fluxul țintit. Null = anunț pentru toată lumea. */
  flow_id?: string | null;
}

/**
 * Server-side announcements. Admins publish once, every student sees it.
 * (Previously this lived in localStorage, so only the admin's own browser
 * ever displayed the banner.)
 */
export async function getActiveAnnouncement(): Promise<Announcement | null> {
  try {
    const nowIso = new Date().toISOString();
    // Filtrarea pe flux e făcută de RLS, nu aici: un elev vede doar anunțurile
    // fluxului lui plus cele globale. Luăm cel mai recent dintre ele.
    const { data, error } = await supabase
      .from('announcements')
      .select('id, message, type, expires_at, created_at, flow_id')
      .or(`expires_at.is.null,expires_at.gt.${nowIso}`)
      .order('created_at', { ascending: false })
      .limit(1);
    if (error && error.code === '42703') {
      const legacy = await supabase
        .from('announcements')
        .select('id, message, type, expires_at, created_at')
        .or(`expires_at.is.null,expires_at.gt.${nowIso}`)
        .order('created_at', { ascending: false })
        .limit(1);
      return (legacy.data && legacy.data[0]) || null;
    }
    return (data && data[0]) || null;
  } catch {
    return null;
  }
}

export async function publishAnnouncement(
  message: string,
  type: 'info' | 'success' | 'warning',
  createdBy: string | null,
  days = 7,
  flowId: string | null = null,
): Promise<Announcement | null> {
  // Un singur anunț activ PER ȚINTĂ. Publicarea către Fluxul 2 nu are voie să
  // șteargă anunțul Fluxului 1 — ele nu se văd unul pe altul.
  await clearAnnouncements(flowId);
  const expires_at = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();
  const { data, error } = await supabase
    .from('announcements')
    .insert({ message, type, expires_at, created_by: createdBy, flow_id: flowId })
    .select('id, message, type, expires_at, created_at, flow_id')
    .single();
  if (error && error.code === '42703') {
    const legacy = await supabase
      .from('announcements')
      .insert({ message, type, expires_at, created_by: createdBy })
      .select('id, message, type, expires_at, created_at')
      .single();
    return legacy.data || null;
  }
  return data || null;
}

/**
 * Șterge anunțurile unei ținte. `flowId` null curăță doar anunțurile globale —
 * publicarea către Fluxul 2 nu are voie să șteargă anunțul Fluxului 1.
 * `'*'` curăță tot, pentru butonul de ștergere din admin.
 */
export async function clearAnnouncements(flowId: string | null | '*' = '*'): Promise<void> {
  try {
    let q = supabase.from('announcements').delete();
    if (flowId === '*') q = q.neq('id', '00000000-0000-0000-0000-000000000000');
    else if (flowId) q = q.eq('flow_id', flowId);
    else q = q.is('flow_id', null);
    const { error } = await q;
    // Coloana nu există încă (migrație neaplicată) → cădem pe comportamentul vechi.
    if (error?.code === '42703') {
      await supabase.from('announcements').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    }
  } catch {
    /* best-effort */
  }
}
