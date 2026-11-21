import { describe, expect, test } from 'bun:test';
import { buildBriefingComment, buildModuleMarkdown, clickUpModuleStatus, courseIdForExercise, hasMeaningfulResponse, moduleIdForExercise, renderResponseMarkdown } from './clickupFormatting';
import { getCourseModules } from './content';
import { getExerciseTemplate } from './exerciseData';

describe('ClickUp student content formatting', () => {
  test('exercise ids resolve to their own course and module', () => {
    expect(courseIdForExercise('st-e-7-1')).toBe('start');
    expect(courseIdForExercise('e-0-1')).toBe('business');
    expect(moduleIdForExercise('start', 'st-e-7-1')).toBe('st-m-7');
  });

  test('empty worksheet rows do not count as completed answers', () => {
    expect(hasMeaningfulResponse({ rows: [{}, { a: '' }] })).toBe(false);
    expect(hasMeaningfulResponse({ rows: [{}, { a: 'Client real' }] })).toBe(true);
  });

  test('module markdown contains every exercise and readable field labels', () => {
    const mod = getCourseModules('start').find(item => item.id === 'st-m-7');
    expect(mod).toBeDefined();
    const template = getExerciseTemplate('st-e-7-1');
    const response = { receptie: [{ 'Zonă': 'Ofertă', 'Dovada observată + statut': 'Interviu verificat' }] };
    const rendered = renderResponseMarkdown(response, template);
    expect(rendered).toContain('Rândul 1');
    expect(rendered).toContain('Ofertă');
    expect(rendered).not.toContain('{');
    const markdown = buildModuleMarkdown(mod, { 'st-e-7-1': response });
    expect(markdown).toContain('Exercițiul 7.1');
    expect(markdown).toContain('Exercițiul 7.2');
    expect(clickUpModuleStatus(mod, { 'st-e-7-1': response })).toBe('in progres');
  });

  test('briefing comment keeps the saved summary without generating new content', () => {
    const comment = buildBriefingComment('## 1. Cine e elevul\nText real', '2026-11-21T10:00:00.000Z');
    expect(comment).toContain('Briefing AI');
    expect(comment).toContain('Text real');
    expect(comment).toContain('Actualizat automat');
  });
});
