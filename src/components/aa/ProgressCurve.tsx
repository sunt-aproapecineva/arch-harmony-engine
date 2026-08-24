// @ts-nocheck
// Curba de ritm — semnătura vizuală a dashboardului.
//
// Restul tabloului arată TOTALURI („12 lecții din 24"). Niciunul nu răspunde la
// întrebarea care contează într-un practicum de 8 săptămâni: *merg în ritm sau am
// rămas în urmă?* Curba asta o face — parcursul real, peste ritmul așteptat din
// calendarul fluxului.
//
// Linia se desenează singură, iar umplerea urmează peniţa cu ~200ms întârziere.
import React, { useMemo, useId } from 'react';
import { useReducedMotion } from 'framer-motion';

interface ProgressCurveProps {
  /** Modulele cursului, cu unlockWeek. */
  modules: any[];
  /** Rândurile de progres ale elevului: { lesson_id, completed_at }. */
  progress: Array<{ lesson_id: string; completed_at: string }>;
  /**
   * Data de start a programului, ca yyyy-mm-dd. Vine din fluxul elevului; pentru
   * elevii încă neasignați cădem pe prima dată de deblocare scrisă în cod.
   * Fără niciuna dintre ele nu există noțiune de săptămână, deci nu desenăm nimic.
   */
  startsOn: string | null;
}

function isTrackable(l: any): boolean {
  return l?.type === 'exercise' || !!(l?.video_url && String(l.video_url).trim());
}

/** Câte zile au trecut de la start până la o dată. */
function weekIndex(startISO: string, dateISO: string): number {
  const start = new Date(`${startISO}T00:00:00+03:00`).getTime();
  const at = new Date(dateISO).getTime();
  if (!Number.isFinite(start) || !Number.isFinite(at)) return 0;
  return Math.max(0, Math.floor((at - start) / (7 * 86400000)));
}

export const ProgressCurve: React.FC<ProgressCurveProps> = ({ modules, progress, startsOn }) => {
  const reduce = useReducedMotion();
  const uid = useId().replace(/:/g, '');

  const data = useMemo(() => {
    const trackable = modules.flatMap((m: any) => (m.lessons || []).filter(isTrackable));
    const total = trackable.length;
    if (!total || !startsOn) return null;

    // Câte săptămâni are programul: ultima deblocare + o săptămână de lucru.
    const lastWeek = modules.reduce((max: number, m: any) =>
      typeof m.unlockWeek === 'number' ? Math.max(max, m.unlockWeek) : max, 0);
    const weeks = lastWeek + 2;

    // Ritmul AȘTEPTAT: câte lecții sunt deschise cumulat până la fiecare săptămână.
    const expected: number[] = [];
    for (let w = 0; w < weeks; w++) {
      const open = modules
        .filter((m: any) => typeof m.unlockWeek !== 'number' || m.unlockWeek <= w)
        .flatMap((m: any) => (m.lessons || []).filter(isTrackable));
      expected.push(open.length);
    }

    // Ritmul REAL: câte a bifat elevul cumulat, pe săptămâni.
    const ids = new Set(trackable.map((l: any) => l.id));
    const perWeek = new Array(weeks).fill(0);
    for (const row of progress) {
      if (!ids.has(row.lesson_id) || !row.completed_at) continue;
      const w = Math.min(weeks - 1, weekIndex(startsOn, row.completed_at));
      perWeek[w]++;
    }
    const actual: number[] = [];
    let running = 0;
    for (let w = 0; w < weeks; w++) { running += perWeek[w]; actual.push(running); }

    // Săptămâna curentă, ca să știm până unde are sens linia reală.
    const nowWeek = Math.min(weeks - 1, weekIndex(startsOn, new Date().toISOString()));

    return { weeks, total, expected, actual, nowWeek };
  }, [modules, progress, startsOn]);

  if (!data) return null;

  const W = 720;
  const H = 180;
  const padX = 8;
  const padY = 14;
  const stepX = (W - padX * 2) / Math.max(1, data.weeks - 1);
  const y = (v: number) => padY + (H - padY * 2) * (1 - v / Math.max(1, data.total));

  const pointsFor = (series: number[], upto = series.length - 1) =>
    series.slice(0, upto + 1).map((v, i) => [padX + i * stepX, y(v)] as const);

  /** Traseu neted prin puncte (Catmull-Rom convertit în Bézier). */
  const smooth = (pts: ReadonlyArray<readonly [number, number]>) => {
    if (pts.length < 2) return '';
    let d = `M${pts[0][0].toFixed(1)},${pts[0][1].toFixed(1)}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[i - 1] || pts[i];
      const p1 = pts[i];
      const p2 = pts[i + 1];
      const p3 = pts[i + 2] || p2;
      const c1x = p1[0] + (p2[0] - p0[0]) / 6;
      const c1y = p1[1] + (p2[1] - p0[1]) / 6;
      const c2x = p2[0] - (p3[0] - p1[0]) / 6;
      const c2y = p2[1] - (p3[1] - p1[1]) / 6;
      d += ` C${c1x.toFixed(1)},${c1y.toFixed(1)} ${c2x.toFixed(1)},${c2y.toFixed(1)} ${p2[0].toFixed(1)},${p2[1].toFixed(1)}`;
    }
    return d;
  };

  const actualPts = pointsFor(data.actual, data.nowWeek);
  const actualPath = smooth(actualPts);
  const expectedPath = smooth(pointsFor(data.expected));
  const fillPath = actualPath
    ? `${actualPath} L${actualPts[actualPts.length - 1][0].toFixed(1)},${H - padY} L${padX},${H - padY} Z`
    : '';

  const done = data.actual[data.nowWeek] || 0;
  const shouldHave = data.expected[data.nowWeek] || 0;
  const behind = shouldHave - done;

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', marginBottom: 10 }}>
        <div>
          <div style={{ fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--fg-3)' }}>
            Ritmul tău
          </div>
          <div style={{ fontSize: 13, color: 'var(--fg-2)', marginTop: 4 }}>
            {behind <= 0
              ? <>Ești <strong style={{ color: 'var(--ok)' }}>în ritm</strong> — {done} din {shouldHave} lecții deschise până acum.</>
              : <>Ai <strong style={{ color: 'var(--warn)' }}>{behind} {behind === 1 ? 'lecție' : 'lecții'}</strong> de recuperat față de calendar.</>}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 14, fontSize: 11, color: 'var(--fg-3)' }}>
          <Legend color="var(--accent)" label="Parcurs real" />
          <Legend color="var(--fg-3)" label="Ritmul planificat" dashed />
        </div>
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" style={{ width: '100%', height: 168, display: 'block', overflow: 'visible' }} role="img"
        aria-label={`Ritm: ${done} lecții parcurse din ${shouldHave} deschise până în săptămâna ${data.nowWeek}`}>
        <defs>
          <linearGradient id={`fill-${uid}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.28" />
            <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
          </linearGradient>
          <clipPath id={`wipe-${uid}`}>
            <rect x="0" y="0" width={W} height={H}
              style={reduce ? undefined : { transformOrigin: 'left center', animation: `aaWipeX 1.4s cubic-bezier(.37,.01,.2,1) 0.45s both` }} />
          </clipPath>
        </defs>

        {/* Ritmul planificat — reperul față de care se citește curba reală. */}
        <path d={expectedPath} fill="none" stroke="var(--fg-3)" strokeOpacity="0.45" strokeWidth="1.5" strokeDasharray="4 5" />

        <g clipPath={`url(#wipe-${uid})`}>
          <path d={fillPath} fill={`url(#fill-${uid})`} />
        </g>

        {/* Linia reală se desenează singură. */}
        <path
          d={actualPath}
          fill="none"
          stroke="var(--accent)"
          strokeWidth="2.4"
          strokeLinecap="round"
          pathLength={1}
          style={reduce ? undefined : { strokeDasharray: 1, animation: 'aaDrawLine 1.6s cubic-bezier(.37,.01,.2,1) 0.25s both' }}
        />

        {actualPts.length > 0 && (
          <circle cx={actualPts[actualPts.length - 1][0]} cy={actualPts[actualPts.length - 1][1]} r="4"
            fill="var(--accent)" style={reduce ? undefined : { animation: 'aaPopIn .5s cubic-bezier(.16,1,.3,1) 1.7s both' }} />
        )}
      </svg>

      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
        {Array.from({ length: data.weeks }, (_, w) => (
          <span key={w} style={{
            fontSize: 10.5, color: w === data.nowWeek ? 'var(--fg)' : 'var(--fg-3)',
            fontWeight: w === data.nowWeek ? 600 : 400,
          }}>
            S{w}
          </span>
        ))}
      </div>
    </div>
  );
};

const Legend: React.FC<{ color: string; label: string; dashed?: boolean }> = ({ color, label, dashed }) => (
  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
    <span style={{
      width: 14, height: 0, borderTop: `2px ${dashed ? 'dashed' : 'solid'} ${color}`,
      display: 'inline-block',
    }} />
    {label}
  </span>
);
