// Single source of truth for exercise IDs used by student responses.
// The DB `exercises` table uses generated UUIDs, while `exercise_responses`
// stores the code-level IDs (e-0-1, ex-8-1-…). Scoring must use these.
import { MODULES } from './data';

export interface StaticExerciseRef {
  id: string;
  title: string;
  moduleOrder: number;
}

export function staticExercisesByModuleOrder(): Record<number, StaticExerciseRef[]> {
  const out: Record<number, StaticExerciseRef[]> = {};
  for (const m of MODULES as any[]) {
    const order = m.order_index ?? 0;
    const list: StaticExerciseRef[] = [];
    const seen = new Set<string>();
    const push = (id?: string, title?: string) => {
      if (!id || seen.has(id)) return;
      seen.add(id);
      list.push({ id, title: title || id, moduleOrder: order });
    };
    (m.exercises || []).forEach((e: any) => push(e.id, e.title));
    (m.lessons || []).forEach((l: any) => { if (l.type === 'exercise') push(l.exercise_id || l.id, l.title); });
    out[order] = list;
  }
  return out;
}

export function allStaticExercises(): StaticExerciseRef[] {
  return Object.values(staticExercisesByModuleOrder()).flat();
}
