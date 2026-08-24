// Calculul progresului în paginile de admin.
//
// De ce există fișierul ăsta: paginile de admin citeau modulele din TABELUL `modules`,
// ale cărui rânduri au id-uri UUID, și le comparau cu `progress.lesson_id`, care conține
// id-urile din COD ('l-1-1', 'st-e-2-1'). Nu se potriveau niciodată, deci fiecare celulă
// din matricea de progres arăta 0%. Iar procentul general număra rândurile de progres
// ale elevului din TOATE cursurile împărțite la lecțiile unui singur curs — putea trece
// de 100%.
//
// Regula, aceeași ca invariantul 8: se numără din cod, niciodată din tabel.
import { getCourseModules } from './content';

export interface CourseLessonIndex {
  /** Modulele cursului, cu doar lecțiile care contează la progres. */
  modules: Array<{ id: string; title: string; etapa: string; order_index: number; lessonIds: string[] }>;
  /** Toate id-urile trackabile ale cursului, pentru filtrarea rândurilor de progres. */
  all: Set<string>;
  total: number;
}

function isTrackable(l: any): boolean {
  return l?.type === 'exercise' || !!(l?.video_url && String(l.video_url).trim());
}

export function courseLessonIndex(courseId: string): CourseLessonIndex {
  const mods = getCourseModules(courseId).map((m: any) => ({
    id: m.id,
    title: m.title,
    etapa: m.etapa,
    order_index: m.order_index,
    lessonIds: (m.lessons || []).filter(isTrackable).map((l: any) => l.id),
  }));
  const all = new Set<string>(mods.flatMap(m => m.lessonIds));
  return { modules: mods, all, total: all.size };
}

/** Procentul unui elev într-un modul, calculat pe id-urile din cod. */
export function modulePct(index: CourseLessonIndex, moduleId: string, doneIds: Set<string>): number {
  const mod = index.modules.find(m => m.id === moduleId);
  if (!mod || mod.lessonIds.length === 0) return 0;
  const done = mod.lessonIds.filter(id => doneIds.has(id)).length;
  return Math.round((done / mod.lessonIds.length) * 100);
}

/** Procentul general al elevului ÎN ACEST CURS. Rândurile din alte cursuri nu intră. */
export function overallPct(index: CourseLessonIndex, doneIds: Set<string>): number {
  if (index.total === 0) return 0;
  let done = 0;
  index.all.forEach(id => { if (doneIds.has(id)) done++; });
  return Math.round((done / index.total) * 100);
}

/** Câte lecții ale ACESTUI curs a terminat elevul. */
export function doneCount(index: CourseLessonIndex, doneIds: Set<string>): number {
  let n = 0;
  index.all.forEach(id => { if (doneIds.has(id)) n++; });
  return n;
}

/** Id-urile de lecție bifate de fiecare elev, dintr-o listă plată de rânduri `progress`. */
export function doneByUser(rows: Array<{ user_id: string; lesson_id: string }>): Record<string, Set<string>> {
  const out: Record<string, Set<string>> = {};
  for (const r of rows) (out[r.user_id] ||= new Set()).add(r.lesson_id);
  return out;
}
