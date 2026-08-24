// @ts-nocheck
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
// Mecanica centrală: modulul cu `unlockWeek = N` se deschide la `starts_on + N*7 zile`.
// Fluxul 1 pornit pe 18 mai își păstrează exact datele de dinainte de refactor;
// Fluxul 2 pornit în ianuarie primește același ritm, la datele lui.
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

/** Fluxurile unui curs, cele mai noi primele. Pentru administrare. */
export async function fetchFlows(courseId: string): Promise<Flow[]> {
  try {
    const { data, error } = await supabase
      .from('flows')
      .select('id,course_id,name,slug,starts_on,ends_on,access_weeks,telegram_url,is_active')
      .eq('course_id', courseId)
      .order('starts_on', { ascending: false });
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
 * Data la care se deschide un modul pentru un flux anume.
 *
 * Ordinea de decizie contează:
 *  1. flux cu dată de start + unlockWeek pe modul → calcul relativ (cazul normal)
 *  2. fără flux, dar cu unlockDate în cod → data absolută veche (elevi nemigrați)
 *  3. nimic → modulul e deschis
 */
export function moduleUnlockDate(mod: any, flow: Flow | null | undefined): Date | null {
  if (flow?.starts_on && typeof mod?.unlockWeek === 'number') {
    const start = new Date(`${flow.starts_on}T00:00:00+03:00`);
    if (!Number.isNaN(start.getTime())) {
      start.setDate(start.getDate() + mod.unlockWeek * 7);
      return start;
    }
  }
  if (mod?.unlockDate) {
    const d = new Date(`${mod.unlockDate}T00:00:00+03:00`);
    return Number.isNaN(d.getTime()) ? null : d;
  }
  return null;
}

export function isModuleUnlocked(mod: any, flow: Flow | null | undefined, now = new Date()): boolean {
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
