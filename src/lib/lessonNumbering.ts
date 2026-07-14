// Helper for consistent "X.Y" lesson numbering across the app.
// X = module order (from Etapa label or order_index)
// Y = position of this lesson among trackable items in the module (1-indexed)
import type { Lesson, Module } from './types';

function isTrackable(l: Lesson): boolean {
  return l.type === 'exercise' || !!(l.video_url?.trim() || (l as any).video_url_2?.trim());
}

export function getModuleNumber(mod: Module): number {
  const m = /(\d+)/.exec(mod.etapa || '');
  if (m) return parseInt(m[1], 10);
  return mod.order_index ?? 0;
}

export function formatLessonNumber(mod: Module, lesson: Lesson): string {
  const trackable = mod.lessons.filter(isTrackable);
  const idx = trackable.findIndex(l => l.id === lesson.id);
  const pos = idx >= 0 ? idx + 1 : (lesson.order_index ?? 1);
  return `${getModuleNumber(mod)}.${pos}`;
}
