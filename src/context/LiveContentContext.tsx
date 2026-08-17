// @ts-nocheck
import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { MODULES } from '@/lib/data';
import { useAuthContext } from '@/context/AuthContext';
import { CONTENT_SNAPSHOT } from '@/lib/contentSnapshot';

type Ctx = { version: number; ready: boolean; refresh: () => void };
const LiveCtx = createContext<Ctx>({ version: 0, ready: false, refresh: () => {} });

export const useLiveContent = () => useContext(LiveCtx);

const CACHE_KEY = 'aa_content_overlay_v1';

/**
 * Fetches admin edits from the DB (modules + lessons tables) and overlays them
 * onto the static MODULES structure in place. Matching is positional:
 *   - DB module ↔ static module by `order_index`
 *   - DB lesson ↔ static video lesson (type !== 'exercise') by position
 *     within the module (sorted by order_index)
 *
 * Resilience: the fetched payload is cached in localStorage and applied
 * immediately at boot, so a failed / empty / slow network response can never
 * make already-published lessons "disappear". Failures retry with backoff and
 * the overlay is refreshed when the tab regains focus or the network returns.
 */
function overlayContent(dbMods: any[], dbLessons: any[]) {
    if (!dbMods || dbMods.length === 0) return false;

    const dbModByIdx = new Map<number, any>();
    dbMods.forEach((m: any) => dbModByIdx.set(m.order_index, m));
    const dbLessonsByMod: Record<string, any[]> = {};
    (dbLessons || []).forEach((l: any) => {
      (dbLessonsByMod[l.module_id] ||= []).push(l);
    });
    Object.values(dbLessonsByMod).forEach((arr) =>
      arr.sort((a: any, b: any) => a.order_index - b.order_index)
    );

    MODULES.forEach((staticMod: any) => {
      const dbMod = dbModByIdx.get(staticMod.order_index);
      if (!dbMod) return;
      if (dbMod.title) staticMod.title = dbMod.title;
      if (dbMod.subtitle) staticMod.subtitle = dbMod.subtitle;
      if (dbMod.description) staticMod.description = dbMod.description;
      if (dbMod.etapa) staticMod.etapa = dbMod.etapa;
      if (dbMod.saptamana) staticMod.saptamana = dbMod.saptamana;

      const dbLessonList = dbLessonList0(dbLessonsByMod[dbMod.id]);
      const videoLessons = staticMod.lessons.filter((l: any) => l.type !== 'exercise');

      // Match DB rows to static lessons by normalized title first (stable even
      // if rows are added/reordered), then fall back to positional matching for
      // whatever is left. Positional-only matching used to shift video URLs onto
      // the wrong lessons whenever the counts drifted.
      const norm = (s: any) =>
        String(s || '')
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .replace(/[^a-z0-9]+/g, ' ')
          .trim();
      const used = new Set<number>();
      const pairs: Array<[any, any]> = [];
      videoLessons.forEach((sl: any) => {
        const i = dbLessonList.findIndex(
          (d: any, di: number) => !used.has(di) && norm(d.title) === norm(sl.title)
        );
        if (i >= 0) {
          used.add(i);
          pairs.push([sl, dbLessonList[i]]);
        }
      });
      videoLessons.forEach((sl: any, idx: number) => {
        if (pairs.some(([s]) => s === sl)) return;
        if (used.has(idx)) return;
        if (dbLessonList[idx]) {
          used.add(idx);
          pairs.push([sl, dbLessonList[idx]]);
        }
      });

      pairs.forEach(([sl, db]) => {
        if (db.title != null && db.title !== '') sl.title = db.title;
        if (db.description != null) sl.description = db.description;
        if (typeof db.video_url === 'string' && db.video_url.trim() !== '') sl.video_url = db.video_url.trim();
        if (typeof db.pdf_url === 'string' && db.pdf_url.trim() !== '') sl.pdf_url = db.pdf_url.trim();
        if (db.duration_min != null) sl.duration_min = db.duration_min;
        // Never let a DB row hide a lesson that already has a playable video.
        if (db.is_published != null) sl.is_published = db.is_published || !!sl.video_url;
      });

    });
    return true;
}

// Base layer: apply the bundled snapshot of published content immediately at
// module load, so lessons are always present even offline, before auth, or if
// the database call fails.
try {
  overlayContent(CONTENT_SNAPSHOT.mods as any[], CONTENT_SNAPSHOT.lessons as any[]);
} catch {
  /* never block the app on the snapshot */
}

export function LiveContentProvider({ children }: { children: React.ReactNode }) {
  const { user, loading: authLoading } = useAuthContext();
  const [version, setVersion] = useState(0);
  const [ready, setReady] = useState(false);
  const [loadedForUserId, setLoadedForUserId] = useState<string | null>(null);
  const appliedRef = useRef(false);
  const lastPayloadRef = useRef<string | null>(null);
  const lastFetchRef = useRef(0);
  const [reloadTick, setReloadTick] = useState(0);

  const applyOverlay = React.useCallback(overlayContent, []);

  // 1) Apply cached overlay synchronously-ish at boot (before any network call).
  useEffect(() => {
    if (appliedRef.current) return;
    try {
      const raw = typeof window !== 'undefined' ? window.localStorage.getItem(CACHE_KEY) : null;
      if (raw) {
        const cached = JSON.parse(raw);
        if (applyOverlay(cached.mods, cached.lessons)) {
          appliedRef.current = true;
          lastPayloadRef.current = JSON.stringify({ mods: cached.mods, lessons: cached.lessons });
          setVersion((v) => v + 1);
        }
      }
    } catch {
      /* ignore corrupted cache */
    }
  }, [applyOverlay]);

  // 2) Fetch fresh content, with retries. Never clears what we already have.
  useEffect(() => {
    if (authLoading) return;
    if (!user?.id) {
      setReady(true);
      setLoadedForUserId(null);
      return;
    }

    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | undefined;
    if (!appliedRef.current) setReady(false);

    const attempt = async (tryIndex: number) => {
      try {
        const [modsRes, lessonsRes] = await Promise.all([
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

        const dbMods = modsRes.data;
        const dbLessons = lessonsRes.data;
        const failed = !!modsRes.error || !!lessonsRes.error || !dbMods || dbMods.length === 0;

        if (failed) {
          if (tryIndex < 4) {
            timer = setTimeout(() => attempt(tryIndex + 1), Math.min(800 * 2 ** tryIndex, 8000));
            // Do not block the UI forever: cached content (if any) is already applied.
            if (appliedRef.current) {
              setLoadedForUserId(user.id);
              setReady(true);
            }
            return;
          }
          // Out of retries — fall back to whatever is already applied (cache/static).
          setLoadedForUserId(user.id);
          setReady(true);
          return;
        }

        applyOverlay(dbMods, dbLessons);
        appliedRef.current = true;
        lastFetchRef.current = Date.now();
        const payload = JSON.stringify({ mods: dbMods, lessons: dbLessons });
        const changed = lastPayloadRef.current !== payload;
        lastPayloadRef.current = payload;
        try {
          window.localStorage.setItem(CACHE_KEY, payload);
        } catch {
          /* storage full / blocked */
        }
        // Only remount the tree when the content actually changed, so a
        // background re-sync never disturbs what the student is doing.
        if (changed) setVersion((v) => v + 1);
        setLoadedForUserId(user.id);
        setReady(true);
      } catch (e) {
        if (cancelled) return;
        console.warn('[LiveContent] overlay failed', e);
        if (tryIndex < 4) {
          timer = setTimeout(() => attempt(tryIndex + 1), Math.min(800 * 2 ** tryIndex, 8000));
          if (appliedRef.current) {
            setLoadedForUserId(user.id);
            setReady(true);
          }
          return;
        }
        setLoadedForUserId(user.id);
        setReady(true);
      }
    };

    attempt(0);

    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
    };
  }, [authLoading, user?.id, applyOverlay, reloadTick]);

  const refresh = React.useCallback(() => {
    setReloadTick((t) => t + 1);
  }, []);

  // 3) Re-sync when the tab comes back or the network returns (mobile Safari).
  useEffect(() => {
    if (!user?.id) return;
    const maybeRefresh = () => {
      if (Date.now() - lastFetchRef.current > 5 * 60 * 1000) refresh();
    };
    const onWake = () => {
      if (document.visibilityState === 'visible') maybeRefresh();
    };
    document.addEventListener('visibilitychange', onWake);
    window.addEventListener('online', refresh);
    return () => {
      document.removeEventListener('visibilitychange', onWake);
      window.removeEventListener('online', refresh);
    };
  }, [user?.id, refresh]);

  return (
    <LiveCtx.Provider
      value={{
        version,
        ready: !authLoading && (!user?.id || ready || appliedRef.current),
        refresh,
      }}
    >
      {/* key bump remounts the route tree once overrides land, so any
          component that captured stale MODULES values re-reads them. */}
      <div key={version} style={{ display: 'contents' }}>
        {children}
      </div>
    </LiveCtx.Provider>
  );
}
