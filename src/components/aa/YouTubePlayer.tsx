// @ts-nocheck
/**
 * Player YouTube care continuă de unde a rămas elevul — ca pe YouTube.
 *
 * Poziția se salvează local (instant, supraviețuiește reîncărcării tabului de
 * către browser) și în cloud (`video_positions`, ca să continue și pe alt
 * dispozitiv). La pornire se ia poziția cea mai recentă dintre cele două și se
 * face seekTo la onReady (parametrul `start` e ignorat uneori pe mobil).
 */
import React, { useEffect, useRef, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

const KEY = (videoId: string) => `aa_video_pos_${videoId}`;

let apiPromise: Promise<any> | null = null;
function loadYouTubeApi(): Promise<any> {
  if (typeof window === 'undefined') return Promise.reject(new Error('no window'));
  if ((window as any).YT?.Player) return Promise.resolve((window as any).YT);
  if (apiPromise) return apiPromise;
  apiPromise = new Promise((resolve) => {
    const prev = (window as any).onYouTubeIframeAPIReady;
    (window as any).onYouTubeIframeAPIReady = () => {
      if (typeof prev === 'function') try { prev(); } catch { /* ignoră */ }
      resolve((window as any).YT);
    };
    if (!document.querySelector('script[data-yt-api]')) {
      const s = document.createElement('script');
      s.src = 'https://www.youtube.com/iframe_api';
      s.async = true;
      s.setAttribute('data-yt-api', '1');
      document.head.appendChild(s);
    }
  });
  return apiPromise;
}

type Pos = { t: number; d: number; at: number };

function readLocal(videoId: string): Pos | null {
  try {
    const v = JSON.parse(localStorage.getItem(KEY(videoId)) || 'null');
    return typeof v?.t === 'number' ? { t: v.t, d: v.d || 0, at: v.at || 0 } : null;
  } catch { return null; }
}

function resumeAt(p: Pos | null): number {
  if (!p) return 0;
  if (p.t < 5) return 0;
  if (p.d && p.t > p.d - 15) return 0; // terminat → de la început
  return Math.floor(p.t);
}

async function readCloud(videoId: string): Promise<Pos | null> {
  try {
    const { data: s } = await supabase.auth.getSession();
    const uid = s.session?.user?.id;
    if (!uid) return null;
    const { data } = await supabase.from('video_positions').select('position,duration,updated_at')
      .eq('user_id', uid).eq('video_id', videoId).maybeSingle();
    if (!data) return null;
    return { t: data.position, d: data.duration, at: new Date(data.updated_at).getTime() };
  } catch { return null; }
}

let lastCloud: Record<string, number> = {};
async function writeCloud(videoId: string, p: Pos, force = false) {
  const now = Date.now();
  if (!force && now - (lastCloud[videoId] || 0) < 15000) return;
  lastCloud[videoId] = now;
  try {
    const { data: s } = await supabase.auth.getSession();
    const uid = s.session?.user?.id;
    if (!uid) return;
    await supabase.from('video_positions').upsert({
      user_id: uid, video_id: videoId, position: p.t, duration: p.d, updated_at: new Date(p.at).toISOString(),
    });
  } catch { /* offline — rămâne local */ }
}

const fmt = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;

export const YouTubePlayer: React.FC<{ videoId: string; title?: string }> = ({ videoId, title }) => {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const playerRef = useRef<any>(null);
  const [resumed, setResumed] = useState<number>(0);

  useEffect(() => {
    let cancelled = false;
    let timer: ReturnType<typeof setInterval> | undefined;
    let ready = false;

    const save = (force = false) => {
      const p = playerRef.current;
      if (!ready || !p?.getCurrentTime) return;
      try {
        const t = p.getCurrentTime();
        const d = p.getDuration?.() || 0;
        if (typeof t === 'number' && t > 0) {
          const pos = { t, d, at: Date.now() };
          localStorage.setItem(KEY(videoId), JSON.stringify(pos));
          writeCloud(videoId, pos, force);
        }
      } catch { /* storage blocat */ }
    };

    Promise.all([loadYouTubeApi(), readCloud(videoId)])
      .then(([YT, cloud]) => {
        if (cancelled || !hostRef.current) return;
        const local = readLocal(videoId);
        const best = !local ? cloud : !cloud ? local : (cloud.at > local.at ? cloud : local);
        const start = resumeAt(best);
        const mount = document.createElement('div');
        mount.style.width = '100%';
        mount.style.height = '100%';
        hostRef.current.appendChild(mount);
        playerRef.current = new YT.Player(mount, {
          videoId,
          width: '100%',
          height: '100%',
          playerVars: { rel: 0, playsinline: 1, start, origin: window.location.origin },
          events: {
            onReady: (e: any) => {
              ready = true;
              if (start > 0) {
                try { e.target.cueVideoById({ videoId, startSeconds: start }); } catch { /* ignoră */ }
                setResumed(start);
              }
            },
            onStateChange: (e: any) => {
              // 1 = redare, 2 = pauză, 0 = terminat
              if (e.data === 2 || e.data === 0) save(true);
              if (e.data === 1) setResumed(0);
            },
          },
        });
        timer = setInterval(() => save(false), 5000);
      })
      .catch(() => { /* fallback */ });

    const onHide = () => { if (document.visibilityState === 'hidden') save(true); };
    const onPageHide = () => save(true);
    document.addEventListener('visibilitychange', onHide);
    window.addEventListener('pagehide', onPageHide);

    return () => {
      cancelled = true;
      save(true);
      if (timer) clearInterval(timer);
      document.removeEventListener('visibilitychange', onHide);
      window.removeEventListener('pagehide', onPageHide);
      try { playerRef.current?.destroy?.(); } catch { /* deja distrus */ }
      playerRef.current = null;
      try { if (hostRef.current) hostRef.current.innerHTML = ''; } catch { /* ignoră */ }
    };
  }, [videoId]);

  return (
    <div>
      <div style={{ position: 'relative', width: '100%', paddingTop: '56.25%' }}>
        <div style={{ position: 'absolute', inset: 0 }}>
          <div ref={hostRef} style={{ width: '100%', height: '100%' }} title={title} />
        </div>
      </div>
      {resumed > 0 && (
        <div style={{ fontSize: 12, color: 'var(--fg-3)', padding: '6px 2px 0' }}>
          Continui de la {fmt(resumed)} — apasă Play.
        </div>
      )}
    </div>
  );
};
