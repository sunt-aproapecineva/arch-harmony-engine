// @ts-nocheck
/**
 * Player YouTube care ține minte minutul la care a rămas elevul.
 *
 * De ce: iframe-ul simplu se reîncarcă de la zero de fiecare dată când
 * componenta se remontează (navigare între pagini, revenirea pe tab, refresh
 * de conținut live). Folosim IFrame API ca să citim poziția curentă, o salvăm
 * în localStorage la fiecare câteva secunde și pornim redarea de acolo.
 */
import React, { useEffect, useRef } from 'react';

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

function readPos(videoId: string): number {
  try {
    const raw = localStorage.getItem(KEY(videoId));
    if (!raw) return 0;
    const v = JSON.parse(raw);
    if (typeof v?.t !== 'number') return 0;
    // Nu relua dacă practic e la început sau dacă filmul a fost terminat.
    if (v.t < 10) return 0;
    if (v.d && v.t > v.d - 20) return 0;
    return Math.floor(v.t);
  } catch {
    return 0;
  }
}

export const YouTubePlayer: React.FC<{ videoId: string; title?: string }> = ({ videoId, title }) => {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const playerRef = useRef<any>(null);

  useEffect(() => {
    let cancelled = false;
    let timer: ReturnType<typeof setInterval> | undefined;

    const save = () => {
      const p = playerRef.current;
      if (!p?.getCurrentTime) return;
      try {
        const t = p.getCurrentTime();
        const d = p.getDuration?.() || 0;
        if (typeof t === 'number' && t > 0) {
          localStorage.setItem(KEY(videoId), JSON.stringify({ t, d, at: Date.now() }));
        }
      } catch { /* storage blocat */ }
    };

    loadYouTubeApi()
      .then((YT) => {
        if (cancelled || !hostRef.current) return;
        // YT înlocuiește nodul primit cu un iframe. Îi dăm un nod creat manual,
        // nu unul gestionat de React, altfel demontarea paginii poate crăpa cu
        // „removeChild" pentru că React nu mai găsește copilul original.
        const mount = document.createElement('div');
        mount.style.width = '100%';
        mount.style.height = '100%';
        hostRef.current.appendChild(mount);
        playerRef.current = new YT.Player(mount, {
          videoId,
          playerVars: {
            rel: 0,
            playsinline: 1,
            start: readPos(videoId),
            origin: window.location.origin,
          },
          events: {
            onStateChange: save,
          },
        });
        timer = setInterval(save, 5000);
      })
      .catch(() => { /* fallback: iframe gol */ });

    const onHide = () => { if (document.visibilityState === 'hidden') save(); };
    document.addEventListener('visibilitychange', onHide);
    window.addEventListener('pagehide', save);

    return () => {
      cancelled = true;
      save();
      if (timer) clearInterval(timer);
      document.removeEventListener('visibilitychange', onHide);
      window.removeEventListener('pagehide', save);
      try { playerRef.current?.destroy?.(); } catch { /* deja distrus */ }
      playerRef.current = null;
    };
  }, [videoId]);

  return (
    <div style={{ position: 'relative', width: '100%', paddingTop: '56.25%' }}>
      <div style={{ position: 'absolute', inset: 0 }}>
        <div ref={hostRef} style={{ width: '100%', height: '100%' }} title={title} />
      </div>
    </div>
  );
};
