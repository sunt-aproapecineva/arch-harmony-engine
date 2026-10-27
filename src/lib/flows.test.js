import { describe, expect, test } from 'bun:test';
import { tierGrants } from './courses';
import { isModuleUnlocked, isModuleLockedByFlow, moduleUnlockDate } from './flows';
import { getVisibleLessons } from './lessonVisibility';

const flow = { starts_on: '2026-10-21', open_modules: 2 };
const now = new Date('2026-10-27T07:22:00Z');
const module = { order_index: 9, unlockWeek: 20, manualLock: true, lessons: [{ is_published: false }] };
const forTier = (course, tier) => ({ ...module, selfPacedAccess: tierGrants(course, tier, 'selfPaced') });

describe('START Singur independent module access', () => {
  test('all ten modules bypass manual locks, flow caps and future release dates', () => {
    for (let index = 0; index <= 9; index++) {
      const mod = { ...forTier('start', 'singur'), order_index: index };
      expect(isModuleUnlocked(mod, flow, now)).toBe(true);
      expect(isModuleLockedByFlow(mod, flow)).toBe(false);
      expect(moduleUnlockDate(mod, flow)).toBeNull();
    }
  });
  test('START PRO and Ultra keep release restrictions', () => {
    for (const tier of ['pro', 'ultra']) expect(isModuleUnlocked(forTier('start', tier), flow, now)).toBe(false);
  });
  test('Business keeps release restrictions', () => {
    for (const tier of ['student', 'designer', 'arhitect', 'singur']) {
      expect(isModuleUnlocked(forTier('business', tier), flow, now)).toBe(false);
    }
  });
  test('unlock override leaves lesson publication untouched', () => {
    const mod = forTier('start', 'singur');
    expect(mod.lessons[0]?.is_published).toBe(false);
    expect(getVisibleLessons({ ...mod, lessons: [
      { id: 'st-l-9-1', is_published: false },
      { id: 'st-l-9-ex', type: 'exercise' },
    ] })).toEqual([]);
    expect(module.manualLock).toBe(true);
  });
});