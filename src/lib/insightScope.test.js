import { describe, expect, test } from 'bun:test';
import { selectInsightEnrollments } from './insightScope';

const rows = [
  { user_id: 'a', course_id: 'business', flow_id: 'business-f2', tariff: 'arhitect' },
  { user_id: 'b', course_id: 'business', flow_id: 'business-f3', tariff: 'student' },
  { user_id: 'c', course_id: 'start', flow_id: 'start-f2', tariff: 'pro' },
  { user_id: 'admin', course_id: 'business', flow_id: 'business-f2', tariff: 'arhitect' },
];

describe('bulk briefing scope', () => {
  test('flow selection includes only students in that exact flow', () => {
    expect(selectInsightEnrollments(rows, new Set(['admin']), { flowId: 'business-f3' }).map(row => row.user_id)).toEqual(['b']);
  });

  test('course, flow and scoped tariff apply to the same enrollment', () => {
    expect(selectInsightEnrollments(rows, new Set(), { courseId: 'start', flowId: 'start-f2', tariffId: 'start:pro' }).map(row => row.user_id)).toEqual(['c']);
    expect(selectInsightEnrollments(rows, new Set(), { courseId: 'start', tariffId: 'business:arhitect' })).toEqual([]);
  });

  test('the visible student filter limits regeneration to the selected rows', () => {
    expect(selectInsightEnrollments(rows, new Set(['admin']), { courseId: 'business', studentIds: ['b', 'missing'] }).map(row => row.user_id)).toEqual(['b']);
  });

  test('an all-course selection keeps one briefing per student and course', () => {
    const duplicated = [...rows, rows[0]];
    expect(selectInsightEnrollments(duplicated, new Set(['admin']), {}).map(row => `${row.user_id}:${row.course_id}`)).toEqual(['a:business', 'b:business', 'c:start']);
  });
});
