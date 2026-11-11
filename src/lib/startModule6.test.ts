import { describe, expect, test } from 'bun:test';
import { START_MODULES } from './content/start';
import { START_EXERCISE_TEMPLATES } from './exerciseData.start';
import { getVisibleLessons } from './lessonVisibility';

describe('START module 6 workbook publication', () => {
  test('each of the three lessons is immediately followed by its own exercise', () => {
    const module = START_MODULES.find(m => m.id === 'st-m-6');
    expect(module).toBeDefined();
    expect(module?.lessons.map(l => l.id)).toEqual([
      'st-l-6-1', 'st-l-6-ex-1', 'st-l-6-2', 'st-l-6-ex-2', 'st-l-6-3', 'st-l-6-ex-3',
    ]);
    expect(module?.exercises.map(e => e.id)).toEqual(['st-e-6-1', 'st-e-6-2', 'st-e-6-3']);
    for (let i = 1; i <= 3; i++) {
      expect(START_EXERCISE_TEMPLATES.find(t => t.exerciseId === `st-e-6-${i}`)?.fields?.length).toBeGreaterThan(10);
    }
  });
  test('all three published lessons expose their exercises while an unpublished video hides only its pair', () => {
    const module = START_MODULES.find(m => m.id === 'st-m-6');
    expect(getVisibleLessons(module).map(l => l.id)).toEqual([
      'st-l-6-1', 'st-l-6-ex-1', 'st-l-6-2', 'st-l-6-ex-2', 'st-l-6-3', 'st-l-6-ex-3',
    ]);
    const hiddenSecond = { ...module, lessons: module?.lessons.map(l => l.id === 'st-l-6-2' ? { ...l, is_published: false } : l) };
    expect(getVisibleLessons(hiddenSecond).map(l => l.id)).toEqual([
      'st-l-6-1', 'st-l-6-ex-1', 'st-l-6-3', 'st-l-6-ex-3',
    ]);
  });
});