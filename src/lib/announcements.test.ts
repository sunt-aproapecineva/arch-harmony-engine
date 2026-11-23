import assert from 'node:assert/strict';
import { describe, test } from 'node:test';
import { announcementMatchesFlow } from './announcements';

describe('announcement flow targeting', () => {
  test('a START Edition 2 announcement is not visible in Business Flux 3', () => {
    assert.equal(announcementMatchesFlow('start-f2', 'business-f3'), false);
  });

  test('a flow announcement and a global announcement are visible in their intended scope', () => {
    assert.equal(announcementMatchesFlow('start-f2', 'start-f2'), true);
    assert.equal(announcementMatchesFlow(null, 'business-f3'), true);
    assert.equal(announcementMatchesFlow('business-f3', null), false);
  });
});
