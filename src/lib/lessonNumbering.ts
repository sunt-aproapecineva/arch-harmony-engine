// Stable X.Y numbering: videos and exercises never share a running counter.
// Publication and completion status must not renumber existing content.
import type { Lesson, Module } from './types';

export function getModuleNumber(mod: Module): number {
  const m = /(\d+)/.exec(mod.etapa || '');
  if (m) return parseInt(m[1], 10);
  return mod.order_index ?? 0;
}

export function formatLessonNumber(mod: Module, lesson: Lesson): string {
  if (lesson.type === 'exercise') return formatExerciseNumber(mod, lesson);
  const videos = mod.lessons.filter(l => l.type !== 'exercise');
  const idx = videos.findIndex(l => l.id === lesson.id);
  // START includes an introductory 0.0 video; Business starts at 0.1.
  const start = videos[0]?.order_index === 0 ? 0 : 1;
  const pos = idx >= 0 ? idx + start : (lesson.order_index ?? start);
  return `${getModuleNumber(mod)}.${pos}`;
}

export function formatExerciseNumber(mod: Module, lesson: Lesson): string {
  // Workbook numbers are explicit, including START 0.0 and 0.2 (no 0.1 exercise).
  const explicit = /(?:Exercițiul|Exercițiu)\s+(\d+\.\d+)\b/i.exec(lesson.title);
  if (explicit) return explicit[1];
  const exercises = mod.lessons.filter(l => l.type === 'exercise');
  const idx = exercises.findIndex(l => l.id === lesson.id);
  return `${getModuleNumber(mod)}.${idx >= 0 ? idx + 1 : (lesson.order_index ?? 1)}`;
}
