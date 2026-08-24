// @ts-nocheck
import { supabase } from '@/integrations/supabase/client';

/**
 * Cloud sync for completed documents ("Documentele mele").
 * Local-first, exactly like exercise responses:
 *  - localStorage is the instant layer (`aa_my_docs_<userId>`)
 *  - `document_responses` (document_id = '__my_docs__') is the durable layer
 *  - on load, the newer of the two wins (timestamp reconciliation)
 */
const BUNDLE_ID = '__my_docs__';

export const docsStorageKey = (userId?: string | null) => `aa_my_docs_${userId ?? 'anon'}`;
const stampKey = (userId?: string | null) => `aa_my_docs_ts_${userId ?? 'anon'}`;

export function readLocalDocs(userId?: string | null): any[] {
  try {
    return JSON.parse(localStorage.getItem(docsStorageKey(userId)) || '[]');
  } catch {
    return [];
  }
}

export function writeLocalDocs(userId: string | null | undefined, docs: any[]) {
  try {
    localStorage.setItem(docsStorageKey(userId), JSON.stringify(docs));
    localStorage.setItem(stampKey(userId), new Date().toISOString());
  } catch {
    /* ignore quota errors */
  }
}

function localStamp(userId?: string | null): number {
  try {
    const raw = localStorage.getItem(stampKey(userId));
    return raw ? new Date(raw).getTime() : 0;
  } catch {
    return 0;
  }
}

/** Push the local list to the cloud (best-effort, debounced by the caller). */
export async function pushDocsToCloud(userId: string | null | undefined, docs: any[]) {
  if (!userId) return;
  try {
    await supabase.from('document_responses').upsert(
      {
        user_id: userId,
        document_id: BUNDLE_ID,
        response: { docs },
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id,document_id' },
    );
  } catch {
    /* best-effort */
  }
}

/**
 * Hydrate from the cloud. Returns the list that should be shown, or null when
 * the local copy is already the freshest one.
 */
export async function hydrateDocsFromCloud(userId: string | null | undefined): Promise<any[] | null> {
  if (!userId) return null;
  try {
    const { data } = await supabase
      .from('document_responses')
      .select('response, updated_at')
      .eq('user_id', userId)
      .eq('document_id', BUNDLE_ID)
      .maybeSingle();

    const local = readLocalDocs(userId);
    if (!data) {
      // First run on the cloud side — seed it from whatever exists locally.
      if (local.length) await pushDocsToCloud(userId, local);
      return null;
    }

    const cloudDocs: any[] = data.response?.docs || [];
    const cloudTs = data.updated_at ? new Date(data.updated_at).getTime() : 0;
    if (cloudTs >= localStamp(userId) && cloudDocs.length >= 0 && cloudTs > 0) {
      // Cloud is newer (or the only source) → adopt it locally.
      if (JSON.stringify(cloudDocs) !== JSON.stringify(local)) {
        try {
          localStorage.setItem(docsStorageKey(userId), JSON.stringify(cloudDocs));
        } catch {}
        return cloudDocs;
      }
      return null;
    }
    // Local is newer → push it up.
    await pushDocsToCloud(userId, local);
    return null;
  } catch {
    return null;
  }
}

/** Save a document entry (create or edit) local-first, then to the cloud. */
export async function saveDocEntry(userId: string | null | undefined, entry: any, editId?: string | null) {
  const existing = readLocalDocs(userId);
  const idx = editId ? existing.findIndex((item: any) => item.id === editId) : -1;
  if (idx > -1) existing[idx] = entry;
  else existing.unshift(entry);
  writeLocalDocs(userId, existing);
  await pushDocsToCloud(userId, existing);
  return existing;
}
