import { describe, expect, test } from 'bun:test';
import { START_MODULES } from './content/start';
import { START_EXERCISE_TEMPLATES } from './exerciseData.start';
import { getVisibleLessons } from './lessonVisibility';
import { isModuleUnlocked } from './flows';

describe('START module 7 workbook publication', () => {
  test('the two reception lessons are immediately followed by their own workbook exercises', () => {
    const module = START_MODULES.find(m => m.id === 'st-m-7');
    expect(module).toBeDefined();
    expect(module?.title).toBe('Recepția Afacerii + 90 de Zile');
    expect(module?.saptamana).toBe('Săptămâna 8');
    expect(module?.manualLock).toBe(false);
    expect(module?.lessons.map(l => l.id)).toEqual([
      'st-l-7-1', 'st-l-7-ex-1', 'st-l-7-2', 'st-l-7-ex-2',
    ]);
    expect(module?.exercises.map(e => e.id)).toEqual(['st-e-7-1', 'st-e-7-2']);
    expect(module?.lessons.filter(l => l.type === 'video').every(l => l.is_published && l.video_url)).toBe(true);
  });

  test('both workbook forms retain their required tables and review fields', () => {
    const reception = START_EXERCISE_TEMPLATES.find(t => t.exerciseId === 'st-e-7-1');
    const plan = START_EXERCISE_TEMPLATES.find(t => t.exerciseId === 'st-e-7-2');
    expect(reception?.fields?.find(f => f.id === 'receptie')?.columns).toEqual([
      'Zonă', 'Ce afirm despre business', 'Dovada observată + statut', 'Ce mai trebuie verificat',
    ]);
    expect(reception?.fields?.find(f => f.id === 'traseu')?.columns).toHaveLength(4);
    expect(plan?.fields?.find(f => f.id === 'prioritati')?.columns).toHaveLength(4);
    expect(plan?.fields?.find(f => f.id === 'scorecard')?.columns).toHaveLength(5);
    expect(plan?.fields?.filter(f => f.id.startsWith('review_')).map(f => f.id)).toEqual([
      'review_intentie', 'review_realitate', 'review_diferenta', 'review_blocaj', 'review_schimbare', 'review_program',
    ]);
  });

  test('published lessons expose both exercises and the manual flow override opens module 7 now', () => {
    const module = START_MODULES.find(m => m.id === 'st-m-7');
    expect(getVisibleLessons(module).map(l => l.id)).toEqual([
      'st-l-7-1', 'st-l-7-ex-1', 'st-l-7-2', 'st-l-7-ex-2',
    ]);
    const hiddenSecond = { ...module, lessons: module?.lessons.map(l => l.id === 'st-l-7-2' ? { ...l, is_published: false } : l) };
    expect(getVisibleLessons(hiddenSecond).map(l => l.id)).toEqual(['st-l-7-1', 'st-l-7-ex-1']);
    expect(isModuleUnlocked(module, { starts_on: '2026-11-02', open_modules: 8 }, new Date('2026-11-20T07:00:00Z'))).toBe(true);
  });
});
