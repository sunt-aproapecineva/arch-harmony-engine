import assert from 'node:assert/strict';
import { describe, test } from 'node:test';
import { isInactive, latest } from './clickupInactivity';

const now = new Date('2026-11-24T07:00:00Z');
describe('inactiv 4+ zile', () => {
  test('tags after exactly 4 days', () => assert.equal(isInactive('2026-11-20T07:00:00Z', now), true));
  test('does not tag at 3 days 23h', () => assert.equal(isInactive('2026-11-20T08:00:00Z', now), false));
  test('tags students with no activity', () => assert.equal(isInactive(null, now), true));
  test('picks newest activity', () => assert.equal(latest(['2026-11-01T00:00:00Z', null, '2026-11-22T00:00:00Z']), '2026-11-22T00:00:00Z'));
});
