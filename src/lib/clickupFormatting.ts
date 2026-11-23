import { allCourseModules, getCourseModules } from './content';
import { getExerciseTemplate, type ExerciseTemplate, type FormField } from './exerciseData';
import { formatExerciseTitle } from './lessonNumbering';
import type { Exercise, Module } from './types';

export type ExerciseResponseMap = Record<string, unknown>;

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function structuredValue(value: unknown): unknown {
  if (typeof value !== 'string') return value;
  const trimmed = value.trim();
  if (!((trimmed.startsWith('{') && trimmed.endsWith('}')) || (trimmed.startsWith('[') && trimmed.endsWith(']')))) return value;
  try {
    const parsed: unknown = JSON.parse(trimmed);
    return parsed !== null && typeof parsed === 'object' ? parsed : value;
  } catch {
    return value;
  }
}

export function hasMeaningfulResponse(value: unknown): boolean {
  const decoded = structuredValue(value);
  if (decoded == null || decoded === false) return false;
  if (typeof decoded === 'string') return decoded.trim().length > 0;
  if (typeof decoded === 'number') return true;
  if (Array.isArray(decoded)) return decoded.some(hasMeaningfulResponse);
  if (isRecord(decoded)) return Object.values(decoded).some(hasMeaningfulResponse);
  return Boolean(decoded);
}

function fieldsOf(template?: ExerciseTemplate): FormField[] {
  return [
    ...(template?.fields ?? []),
    ...(template?.items ?? []).map(item => ({ ...item, type: 'textarea' as const })),
    ...(template?.questions ?? []).map(item => ({ id: item.id, label: item.text, type: 'textarea' as const })),
    ...(template?.situations ?? []).map(item => ({ id: item.id, label: item.title || item.text, type: 'textarea' as const })),
    ...(template?.dmReflection ?? []).map(item => ({ ...item, type: 'textarea' as const })),
  ];
}

function fieldFor(template: ExerciseTemplate | undefined, key: string): FormField | undefined {
  return fieldsOf(template).find(field => field.id === key);
}

function labelFor(template: ExerciseTemplate | undefined, key: string): string {
  const field = fieldFor(template, key);
  return field?.label || field?.text || key.replace(/[_-]+/g, ' ').replace(/^./, char => char.toUpperCase());
}

function inlineText(value: unknown): string {
  if (value == null || value === '') return '—';
  if (typeof value === 'boolean') return value ? 'Da' : 'Nu';
  if (typeof value === 'number') return String(value);
  if (typeof value === 'string') return value.trim() || '—';
  return JSON.stringify(value);
}

/** Markdown lizibil în ClickUp; răspunsul salvat nu este modificat. */
export function renderResponseMarkdown(raw: unknown, template?: ExerciseTemplate, key?: string): string {
  const value = structuredValue(raw);
  if (!hasMeaningfulResponse(value)) return '_Niciun răspuns salvat._';
  if (typeof value === 'string') return value.trim();
  if (typeof value === 'number' || typeof value === 'boolean') return inlineText(value);
  if (Array.isArray(value)) {
    if (value.every(isRecord)) {
      return value.filter(hasMeaningfulResponse).map((row, index) => {
        const columns = [...(key ? fieldFor(template, key)?.columns ?? [] : []), ...Object.keys(row).filter(k => !(key ? fieldFor(template, key)?.columns ?? [] : []).includes(k))];
        return `**Rândul ${index + 1}**\n${columns.map(column => `- **${labelFor(template, column)}:** ${renderResponseMarkdown(row[column], template, column).replace(/\n/g, ' ')}`).join('\n')}`;
      }).join('\n\n');
    }
    return value.filter(hasMeaningfulResponse).map(item => `- ${renderResponseMarkdown(item, template).replace(/\n/g, ' ')}`).join('\n');
  }
  if (isRecord(value)) {
    const entries = Object.entries(value).filter(([, answer]) => hasMeaningfulResponse(answer));
    const order = fieldsOf(template).map(field => field.id);
    entries.sort(([a], [b]) => {
      const ai = order.indexOf(a), bi = order.indexOf(b);
      return (ai < 0 ? order.length : ai) - (bi < 0 ? order.length : bi);
    });
    return entries.map(([entryKey, answer]) => {
      const rendered = renderResponseMarkdown(answer, template, entryKey);
      return `**${labelFor(template, entryKey)}**\n${rendered}`;
    }).join('\n\n');
  }
  return inlineText(value);
}

export function exercisesForModule(mod: Module): Exercise[] {
  const seen = new Set<string>();
  const result: Exercise[] = [];
  const push = (exercise: Exercise) => {
    if (!exercise.id || seen.has(exercise.id)) return;
    seen.add(exercise.id);
    result.push(exercise);
  };
  (mod.exercises ?? []).forEach(push);
  (mod.lessons ?? []).filter(lesson => lesson.type === 'exercise').forEach(lesson => push({
    id: lesson.exercise_id || lesson.id,
    module_id: mod.id,
    title: lesson.title,
    description: lesson.description,
    order_index: lesson.order_index,
  }));
  return result.sort((a, b) => a.order_index - b.order_index);
}

export function courseIdForExercise(exerciseId: string): string | undefined {
  return allCourseModules().find(({ modules }) => modules.some(mod => exercisesForModule(mod).some(exercise => exercise.id === exerciseId)))?.courseId;
}

export function moduleIdForExercise(courseId: string, exerciseId: string): string | undefined {
  return getCourseModules(courseId).find(mod => exercisesForModule(mod).some(exercise => exercise.id === exerciseId))?.id;
}

export function buildModuleMarkdown(mod: Module, responses: ExerciseResponseMap): string {
  const exercises = exercisesForModule(mod);
  const answered = exercises.filter(exercise => hasMeaningfulResponse(responses[exercise.id])).length;
  const lines = [
    `## ${mod.etapa} · ${mod.title}`,
    '',
    `**Progres exerciții:** ${answered}/${exercises.length}`,
    '',
  ];
  for (const exercise of exercises) {
    lines.push(`### ${formatExerciseTitle(mod, exercise)}`);
    lines.push('');
    lines.push(renderResponseMarkdown(responses[exercise.id], getExerciseTemplate(exercise.id)));
    lines.push('');
  }
  if (!exercises.length) lines.push('_Acest modul nu are exerciții configurate._');
  lines.push(`_Sincronizat din platformă la ${new Date().toLocaleString('ro-RO', { timeZone: 'Europe/Chisinau' })}._`);
  return lines.join('\n');
}

export function clickUpModuleStatus(mod: Module, responses: ExerciseResponseMap): 'de facut' | 'in progres' | 'facut' {
  const exercises = exercisesForModule(mod);
  const answered = exercises.filter(exercise => hasMeaningfulResponse(responses[exercise.id])).length;
  if (exercises.length > 0 && answered === exercises.length) return 'facut';
  return answered > 0 ? 'in progres' : 'de facut';
}

export function normalizeClickUpStudentName(name: string): string {
  return name.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ').trim().split(' ').filter(Boolean).sort().join(' ');
}

const CONTEXT_START = '<!-- AA_PLATFORM_CONTEXT_START -->';
const CONTEXT_END = '<!-- AA_PLATFORM_CONTEXT_END -->';

/** Păstrează notițele mentorului și înlocuiește doar blocul deținut de platformă. */
export function mergeClickUpStudentDescription(existing: string | null | undefined, context: string): string {
  const marked = `${CONTEXT_START}\n${context.trim()}\n${CONTEXT_END}`;
  const source = existing?.trim() || '';
  if (!source) return marked;

  const markerPattern = /<!-- AA_PLATFORM_CONTEXT_START -->[\s\S]*?<!-- AA_PLATFORM_CONTEXT_END -->/;
  if (markerPattern.test(source)) return source.replace(markerPattern, marked);

  // Descrierile create înainte de marcaje pot fi înlocuite fără să pierdem
  // notițele manuale adăugate înainte sau după ele.
  const legacy = context.trim();
  const withoutLegacy = source === legacy
    ? ''
    : source.endsWith(legacy)
      ? source.slice(0, -legacy.length).trim()
      : source;
  return withoutLegacy ? `${withoutLegacy}\n\n---\n\n${marked}` : marked;
}

export function buildBriefingComment(summary: string, generatedAt?: string | null): string {
  const stamp = generatedAt
    ? new Date(generatedAt).toLocaleString('ro-RO', { timeZone: 'Europe/Chisinau' })
    : new Date().toLocaleString('ro-RO', { timeZone: 'Europe/Chisinau' });
  return `## Briefing AI · Arhitectura Afacerii\n\n_Generat: ${stamp}. Actualizat automat din platformă._\n\n${summary.trim()}`;
}
