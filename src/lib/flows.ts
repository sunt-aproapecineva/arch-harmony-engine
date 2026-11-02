// FLUXUL — unitatea de LIVRARE a unui training.
//
// Decide ce vede elevul și când: data de start (ancorează orarul deblocărilor),
// canalul de Telegram, calendarul de întâlniri, anunțurile primite, fereastra de acces.
// Un elev aparține unui singur flux per training — altfel n-am putea răspunde la
// întrebarea „ce orar are omul ăsta".
//
// Nu confunda cu GRUPA (src/lib/groups.ts): grupa e o listă de oameni, un instrument
// de administrare care nu are nici orar, nici canal, nici acces prin ea însăși.
//
// Un flux NU e o copie a cursului. Conținutul rămâne unul singur.
//
// Regula de livrare, valabilă pentru TOATE fluxurile: modulul cu `unlockWeek = N` se
// deschide singur în LUNI, la 09:00 ora Republicii Moldova, la N săptămâni de la data
// de start a fluxului. Nu există programare per flux — o ediție nouă moștenește ritmul
// direct din ziua ei de start, fără niciun pas separat de administrare.
// `open_modules` rămâne doar o limită manuală, pusă de admin când vrea să iasă din
// orar, iar pachetul „Singur" (`selfPacedAccess`) vede toate modulele de la început,
// pentru că n-are sesiuni live care să-i stabilească ritmul.

import { supabase } from '@/integrations/supabase/client';

export interface Flow {
  id: string;
  course_id: string;
  name: string;
  slug: string;
  /** ISO yyyy-mm-dd. Ancora orarului: modulul cu unlockWeek = N se deschide la starts_on + N*7. */
  starts_on: string;
  /** Sfârșitul accesului pentru tot fluxul. Null = nelimitat. */
  ends_on: string | null;
  /** Alternativa automată la ends_on: durata accesului în săptămâni de la start. */
  access_weeks: number | null;
  /**
   * Câte module sunt deschise în fluxul ăsta, numărate în ordinea `unlockWeek`
   * (0, 1, 2...). Null = toate. Blocaj per flux, nu per curs: Fluxul 2 Business
   * poate avea 2 module deschise în timp ce Fluxul 1 le are pe toate.
   */
  open_modules: number | null;
  telegram_url: string | null;
  is_active: boolean;
}

export interface FlowEvent {
  id: string;
  flow_id: string;
  type: 'zoom' | 'workshop';
  title: string;
  description: string;
  date: string;
  time: string;
  duration: string;
  workshopThemes?: string[];
}

const cacheKey = (userId: string) => `aa_flow_${userId}`;

export function readCachedFlow(userId: string): Flow | null {
  if (!userId || typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(cacheKey(userId));
    return raw ? (JSON.parse(raw) as Flow) : null;
  } catch {
    return null;
  }
}

export function cacheFlow(userId: string, flow: Flow | null) {
  if (!userId || typeof window === 'undefined') return;
  try {
    if (flow) localStorage.setItem(cacheKey(userId), JSON.stringify(flow));
    else localStorage.removeItem(cacheKey(userId));
  } catch { /* noop */ }
}

/**
 * Fluxurile, cele mai noi primele. Pentru administrare.
 *
 * `courseId` null înseamnă TOATE programele — vederea implicită a adminului, care
 * nu lucrează „în interiorul" unui program, ci filtrează peste ele.
 */
export async function fetchFlows(courseId?: string | null): Promise<Flow[]> {
  try {
    let q = supabase
      .from('flows')
      .select('id,course_id,name,slug,starts_on,ends_on,access_weeks,open_modules,telegram_url,is_active');
    if (courseId) q = q.eq('course_id', courseId);
    const { data, error } = await q.order('starts_on', { ascending: false });
    if (error) throw error;
    return (data || []) as Flow[];
  } catch (error) {
    console.warn('[Flows] citire eșuată', error);
    return [];
  }
}

/** Evenimentele live ale unui flux. RLS lasă elevul să vadă doar fluxul lui. */
export async function fetchFlowEvents(flowId: string): Promise<FlowEvent[]> {
  if (!flowId) return [];
  try {
    const { data, error } = await supabase
      .from('flow_events')
      .select('id,flow_id,type,title,description,event_date,event_time,duration,workshop_themes')
      .eq('flow_id', flowId)
      .order('event_date');
    if (error) throw error;
    return (data || []).map((r: any) => ({
      id: r.id,
      flow_id: r.flow_id,
      type: r.type === 'workshop' ? 'workshop' : 'zoom',
      title: r.title,
      description: r.description || '',
      date: r.event_date,
      time: r.event_time || '',
      duration: r.duration || '',
      workshopThemes: Array.isArray(r.workshop_themes) ? r.workshop_themes : undefined,
    }));
  } catch (error) {
    console.warn('[Flows] evenimente indisponibile', error);
    return [];
  }
}

/**
 * Modulul e blocat de limita fluxului? `open_modules = N` deschide primele N
 * module (poziția `order_index` 0..N-1) și le închide pe restul, indiferent de
 * dată. Poziția, nu săptămâna: unele etape durează 2 săptămâni.
 */
export function isModuleLockedByFlow(mod: any, flow: Flow | null | undefined): boolean {
  if (mod?.selfPacedAccess) return false;
  if (typeof flow?.open_modules !== 'number') return false;
  const pos = typeof mod?.order_index === 'number' ? mod.order_index : mod?.unlockWeek;
  if (typeof pos !== 'number') return false;
  return pos >= flow.open_modules;
}

/** Ora la care se deschd modulele în ziua de deblocare (fusul Moldovei). */
export const UNLOCK_HOUR = 9;
const UNLOCK_TZ = 'Europe/Chisinau';

function isoParts(iso: string): { y: number; m: number; d: number } | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!m) return null;
  return { y: Number(m[1]), m: Number(m[2]), d: Number(m[3]) };
}

/** Cât diferă ceasul din `timeZone` de UTC la o anumită clipă (minute, cu zeci de secunde). */
function tzOffsetMs(instant: Date, timeZone: string): number {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    hour12: false,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).formatToParts(instant);
  const at = (type: Intl.DateTimeFormatPartTypes) =>
    Number(parts.find(p => p.type === type)?.value ?? 0);
  const asUTC = Date.UTC(at('year'), at('month') - 1, at('day'), at('hour') % 24, at('minute'), at('second'));
  return asUTC - instant.getTime();
}

/**
 * Clipa `hour`:00 din ziua calendaristică dată, în fusul `timeZone`, ca instantă UTC.
 * Fusul se recalculează după prima aproximare, ca să nu greșească exact în ziua în
 * care se schimbă ora de vară/iarnă.
 */
function zonedInstant(y: number, mo: number, d: number, hour: number, timeZone: string): Date {
  const guess = Date.UTC(y, mo - 1, d, hour);
  const first = guess - tzOffsetMs(new Date(guess), timeZone);
  return new Date(guess - tzOffsetMs(new Date(first), timeZone));
}

/**
 * Data la care se deschide un modul pentru un flux anume.
 *
 * Ordinea de decizie contează:
 *  1. blocaj manual sau limită manuală de module → nicio dată, UI-ul nu promite una
 *  2. flux cu dată de start + unlockWeek pe modul → LUNI, 09:00 ora Moldovei, la
 *     unlockWeek săptămâni de la start. E cazul normal și merge la orice flux,
 *     inclusiv la unei ediții care nu au fost configurate special.
 *  3. fără flux, dar cu unlockDate în cod → ziua absolută, tot la 09:00
 *  4. nimic → modulul e deschis
 */
export function moduleUnlockDate(mod: any, flow: Flow | null | undefined): Date | null {
  if (mod?.selfPacedAccess) return null;
  // Blocaj manual sau limită manuală de module: nu există dată de deschidere,
  // deci UI-ul nu promite una.
  if (mod?.manualLock) return null;
  if (isModuleLockedByFlow(mod, flow)) return null;
  if (typeof flow?.open_modules === 'number') return null;
  if (flow?.starts_on && typeof mod?.unlockWeek === 'number') {
    const start = isoParts(flow.starts_on);
    if (start) {
      const day = new Date(Date.UTC(start.y, start.m - 1, start.d + mod.unlockWeek * 7));
      return zonedInstant(day.getUTCFullYear(), day.getUTCMonth() + 1, day.getUTCDate(), UNLOCK_HOUR, UNLOCK_TZ);
    }
  }
  if (mod?.unlockDate) {
    const d = isoParts(mod.unlockDate);
    if (d) return zonedInstant(d.y, d.m, d.d, UNLOCK_HOUR, UNLOCK_TZ);
  }
  return null;
}


export function isModuleUnlocked(mod: any, flow: Flow | null | undefined, now = new Date()): boolean {
  if (mod?.selfPacedAccess) return true;
  if (mod?.manualLock) return false;
  if (isModuleLockedByFlow(mod, flow)) return false;
  const unlock = moduleUnlockDate(mod, flow);
  return !unlock || now >= unlock;
}


/** Data la care se încheie accesul într-un flux: explicită sau calculată din durată. */
export function flowAccessUntil(flow: Flow | null | undefined): Date | null {
  if (!flow) return null;
  if (flow.ends_on) {
    const d = new Date(`${flow.ends_on}T23:59:59+03:00`);
    return Number.isNaN(d.getTime()) ? null : d;
  }
  if (typeof flow.access_weeks === 'number' && flow.starts_on) {
    const d = new Date(`${flow.starts_on}T23:59:59+03:00`);
    if (Number.isNaN(d.getTime())) return null;
    d.setDate(d.getDate() + flow.access_weeks * 7);
    return d;
  }
  return null;
}
