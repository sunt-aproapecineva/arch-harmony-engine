// Activity rows keep the title that was current when they were logged.
// Display them with today's numbering so old "Exercițiul 1 · …" entries read as 1.1.
import { allCourseModules } from './content';
import { formatExerciseTitle } from './lessonNumbering';

let cache: Map<string, string> | null = null;

function exerciseTitles(): Map<string, string> {
  if (cache) return cache;
  const map = new Map<string, string>();
  allCourseModules().forEach(({ modules }) => {
    modules.forEach(mod => {
      mod.lessons.forEach(l => {
        if (l.type === 'exercise') map.set(l.id, formatExerciseTitle(mod, l));
      });
    });
  });
  cache = map;
  return map;
}

export function displayActivityLabel(ev: { label: string; data?: Record<string, any> | null }): string {
  const lessonId = ev.data?.lessonId;
  const oldTitle = ev.data?.lessonTitle;
  if (!lessonId || !oldTitle) return ev.label;
  const current = exerciseTitles().get(String(lessonId));
  if (!current || current === oldTitle) return ev.label;
  return ev.label.split(`"${oldTitle}"`).join(`"${current}"`);
}
