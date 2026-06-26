// @ts-nocheck
import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { MODULES } from '@/lib/data';
import { useAuthContext } from '@/context/AuthContext';

type Ctx = { version: number; ready: boolean };
const LiveCtx = createContext<Ctx>({ version: 0, ready: false });

export const useLiveContent = () => useContext(LiveCtx);

/**
 * Fetches admin edits from the DB (modules + lessons tables) and overlays them
 * onto the static MODULES structure in place. Matching is positional:
 *   - DB module ↔ static module by `order_index`
 *   - DB lesson ↔ static video lesson (type !== 'exercise') by position
 *     within the module (sorted by order_index)
 *
 * Editable overlay fields: title, subtitle, description, etapa, saptamana,
 * video_url, pdf_url, duration_min, is_published.
 *
 * Structural fields (id, type, exercises, unlockDate, deliverable) come from
 * the static file and are not affected by admin edits.
 */
export function LiveContentProvider({ children }: { children: React.ReactNode }) {
  const { user, loading: authLoading } = useAuthContext();
  const [version, setVersion] = useState(0);
  const [ready, setReady] = useState(false);
  const [loadedForUserId, setLoadedForUserId] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!user?.id) {
      setReady(true);
      setLoadedForUserId(null);
      return;
    }
    let cancelled = false;
    setReady(false);
    (async () => {
      try {
        const [{ data: dbMods }, { data: dbLessons }] = await Promise.all([
          supabase
            .from('modules')
            .select('id,order_index,title,subtitle,description,etapa,saptamana')
            .order('order_index'),
          supabase
            .from('lessons')
            .select('id,module_id,order_index,title,description,video_url,pdf_url,duration_min,is_published')
            .order('order_index'),
        ]);
        if (cancelled) return;
        if (!dbMods || dbMods.length === 0) {
          setLoadedForUserId(user.id);
          setReady(true);
          return;
        }

        const dbModByIdx = new Map<number, any>();
        dbMods.forEach((m: any) => dbModByIdx.set(m.order_index, m));
        const dbLessonsByMod: Record<string, any[]> = {};
        (dbLessons || []).forEach((l: any) => {
          (dbLessonsByMod[l.module_id] ||= []).push(l);
        });
        Object.values(dbLessonsByMod).forEach((arr) =>
          arr.sort((a, b) => a.order_index - b.order_index)
        );

        MODULES.forEach((staticMod: any) => {
          const dbMod = dbModByIdx.get(staticMod.order_index);
          if (!dbMod) return;
          if (dbMod.title) staticMod.title = dbMod.title;
          if (dbMod.subtitle) staticMod.subtitle = dbMod.subtitle;
          if (dbMod.description) staticMod.description = dbMod.description;
          if (dbMod.etapa) staticMod.etapa = dbMod.etapa;
          if (dbMod.saptamana) staticMod.saptamana = dbMod.saptamana;

          const dbLessonList = dbLessonsByMod[dbMod.id] || [];
          const videoLessons = staticMod.lessons.filter((l: any) => l.type !== 'exercise');
          videoLessons.forEach((sl: any, idx: number) => {
            const db = dbLessonList[idx];
            if (!db) return;
            if (db.title != null && db.title !== '') sl.title = db.title;
            if (db.description != null) sl.description = db.description;
            if (typeof db.video_url === 'string' && db.video_url.trim() !== '') sl.video_url = db.video_url.trim();
            if (typeof db.pdf_url === 'string' && db.pdf_url.trim() !== '') sl.pdf_url = db.pdf_url.trim();
            if (db.duration_min != null) sl.duration_min = db.duration_min;
            if (db.is_published != null) sl.is_published = db.is_published;
          });
        });

        setVersion((v) => v + 1);
        setLoadedForUserId(user.id);
        setReady(true);
      } catch (e) {
        console.warn('[LiveContent] overlay failed', e);
        setLoadedForUserId(user.id);
        setReady(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [authLoading, user?.id]);

  return (
    <LiveCtx.Provider value={{ version, ready: !authLoading && (!user?.id || (ready && loadedForUserId === user.id)) }}>
      {/* key bump remounts the route tree once overrides land, so any
          component that captured stale MODULES values re-reads them. */}
      <div key={version} style={{ display: 'contents' }}>
        {children}
      </div>
    </LiveCtx.Provider>
  );
}
