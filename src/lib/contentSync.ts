// @ts-nocheck
// Publicarea structurii din cod în baza de date.
//
// De ce e nevoie: conținutul trăiește în DOUĂ straturi (vezi §4 din PLATFORM_LOGIC).
// Structura de bază e în cod (`src/lib/content/*`), iar editările adminului stau în
// tabelele `modules` / `lessons` și se suprapun peste ea.
//
// Problema: tabelele au fost populate o singură dată, la lansarea cursului Business.
// Un program nou (START) există doar în cod, deci editorul de lecții îi arăta o listă
// goală și adminul n-avea ce edita. Funcția asta îi dă rândurile lipsă.
//
// Reguli:
//  - NU șterge nimic. Doar adaugă ce lipsește.
//  - Modulele se potrivesc după (course_id, order_index) — aceeași regulă ca overlay-ul.
//  - Lecțiile se potrivesc după titlu normalizat în interiorul modulului.
//  - Doar lecțiile video ajung în DB. Exercițiile sunt cod, nu conținut editabil.
//  - Rulabilă de oricâte ori: a doua oară nu mai are ce face.
import { supabase } from '@/integrations/supabase/client';
import { getCourseModules } from './content';

const norm = (v: any) =>
  String(v || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, ' ').trim();

const isVideoLesson = (l: any) => l?.type !== 'exercise';

export interface SyncPlan {
  modulesMissing: number;
  lessonsMissing: number;
  modulesTotal: number;
  lessonsTotal: number;
  /** Schema multicurs lipsește — nu putem lega rândurile de un program. */
  schemaMissing: boolean;
}

/** Ce ar face publicarea, fără să scrie nimic. */
export async function planCourseStructure(courseId: string): Promise<SyncPlan> {
  const codeModules = getCourseModules(courseId);
  const codeLessons = codeModules.flatMap((m: any) => (m.lessons || []).filter(isVideoLesson));

  const modsRes = await supabase.from('modules').select('id,order_index,title,course_id').eq('course_id', courseId);
  if (modsRes.error) {
    const schemaMissing = modsRes.error.code === '42703' || modsRes.error.code === '42P01';
    return { modulesMissing: 0, lessonsMissing: 0, modulesTotal: codeModules.length, lessonsTotal: codeLessons.length, schemaMissing };
  }

  const dbMods = modsRes.data || [];
  const byIdx = new Map<number, any>(dbMods.map((m: any) => [m.order_index, m]));
  const modulesMissing = codeModules.filter((m: any) => !byIdx.has(m.order_index)).length;

  const dbIds = dbMods.map((m: any) => m.id);
  const lessRes = dbIds.length
    ? await supabase.from('lessons').select('id,module_id,title').in('module_id', dbIds)
    : { data: [], error: null };
  const dbLessonsByMod: Record<string, Set<string>> = {};
  (lessRes.data || []).forEach((l: any) => {
    (dbLessonsByMod[l.module_id] ||= new Set()).add(norm(l.title));
  });

  let lessonsMissing = 0;
  for (const m of codeModules as any[]) {
    const dbMod = byIdx.get(m.order_index);
    const have = dbMod ? dbLessonsByMod[dbMod.id] || new Set() : new Set();
    lessonsMissing += (m.lessons || []).filter(isVideoLesson).filter((l: any) => !have.has(norm(l.title))).length;
  }

  return {
    modulesMissing,
    lessonsMissing,
    modulesTotal: codeModules.length,
    lessonsTotal: codeLessons.length,
    schemaMissing: false,
  };
}

/** Scrie în DB modulele și lecțiile care lipsesc. Întoarce câte a creat. */
export async function publishCourseStructure(courseId: string): Promise<{ modules: number; lessons: number; error: string | null }> {
  const codeModules = getCourseModules(courseId);
  let createdModules = 0;
  let createdLessons = 0;

  const modsRes = await supabase.from('modules').select('id,order_index').eq('course_id', courseId);
  if (modsRes.error) {
    return {
      modules: 0, lessons: 0,
      error: modsRes.error.code === '42703'
        ? 'Migrația multicurs nu e aplicată: tabelul `modules` n-are încă o coloană de program.'
        : modsRes.error.message,
    };
  }

  const byIdx = new Map<number, string>((modsRes.data || []).map((m: any) => [m.order_index, m.id]));

  for (const m of codeModules as any[]) {
    let moduleId = byIdx.get(m.order_index);

    if (!moduleId) {
      const ins = await supabase.from('modules').insert({
        course_id: courseId,
        title: m.title,
        subtitle: m.subtitle,
        description: m.description,
        order_index: m.order_index,
        etapa: m.etapa,
        saptamana: m.saptamana,
      }).select('id').single();
      if (ins.error) return { modules: createdModules, lessons: createdLessons, error: ins.error.message };
      moduleId = ins.data.id;
      byIdx.set(m.order_index, moduleId);
      createdModules++;
    }

    const existing = await supabase.from('lessons').select('title').eq('module_id', moduleId);
    const have = new Set((existing.data || []).map((l: any) => norm(l.title)));

    const toInsert = (m.lessons || [])
      .filter(isVideoLesson)
      .filter((l: any) => !have.has(norm(l.title)))
      .map((l: any) => ({
        module_id: moduleId,
        title: l.title,
        description: l.description || null,
        video_url: l.video_url || null,
        pdf_url: l.pdf_url || null,
        duration_min: l.duration_min ?? null,
        order_index: l.order_index,
        is_published: !!l.is_published,
      }));

    if (toInsert.length) {
      const ins = await supabase.from('lessons').insert(toInsert);
      if (ins.error) return { modules: createdModules, lessons: createdLessons, error: ins.error.message };
      createdLessons += toInsert.length;
    }
  }

  return { modules: createdModules, lessons: createdLessons, error: null };
}
