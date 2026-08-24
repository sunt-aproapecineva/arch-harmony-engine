// @ts-nocheck
import { supabase } from '@/integrations/supabase/client';

export interface Announcement {
  id: string;
  message: string;
  type: 'info' | 'success' | 'warning';
  expires_at: string | null;
  created_at: string;
}

/**
 * Server-side announcements. Admins publish once, every student sees it.
 * (Previously this lived in localStorage, so only the admin's own browser
 * ever displayed the banner.)
 */
export async function getActiveAnnouncement(): Promise<Announcement | null> {
  try {
    const nowIso = new Date().toISOString();
    const { data } = await supabase
      .from('announcements')
      .select('id, message, type, expires_at, created_at')
      .or(`expires_at.is.null,expires_at.gt.${nowIso}`)
      .order('created_at', { ascending: false })
      .limit(1);
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
): Promise<Announcement | null> {
  // Only one active announcement at a time — clear the previous ones.
  await clearAnnouncements();
  const expires_at = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();
  const { data } = await supabase
    .from('announcements')
    .insert({ message, type, expires_at, created_by: createdBy })
    .select('id, message, type, expires_at, created_at')
    .single();
  return data || null;
}

export async function clearAnnouncements(): Promise<void> {
  try {
    await supabase.from('announcements').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  } catch {
    /* best-effort */
  }
}
