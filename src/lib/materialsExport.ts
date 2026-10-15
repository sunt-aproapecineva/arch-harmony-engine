// @ts-nocheck
// ─────────────────────────────────────────────────────────────────────────────
// materialsExport.ts — AA-branded HTML/print exports for user materials
// Uses the same visual shell as Documents (openPrintWindow + AA branding)
// ─────────────────────────────────────────────────────────────────────────────
import { allModulesFlat } from './content';
import { EXERCISE_TEMPLATES as EXERCISES } from './exerciseData';
import { formatLessonNumber, formatExerciseTitle, getModuleNumber } from './lessonNumbering';
import { renderMaterialResponse } from './materialsResponse';
import {
  openPrintWindow,
  FONTS,
  BASE_STYLES,
  MONOGRAM_SVG,
  aaHeader,
  aaFooter,
  htmlShell,
} from './documentData';

// ─── Lookups ─────────────────────────────────────────────────────────────────

// Căutare după id, nu agregare: id-urile sunt unice între cursuri, deci e corect
// să căutăm în tot conținutul — un material exportat își găsește lecția indiferent
// de cursul din care vine.
function findLesson(lessonId: string) {
  for (const mod of allModulesFlat()) {
    const l = mod.lessons.find((x: any) => x.id === lessonId);
    if (l) return { mod, lesson: l };
  }
  return null;
}
function findExercise(exId: string) {
  for (const mod of allModulesFlat()) {
    const l = mod.lessons.find((x: any) => x.exercise_id === exId);
    if (l) return { mod, lesson: l, exercise: EXERCISES.find((e: any) => e.id === exId || e.exerciseId === exId) };
  }
  return { mod: null, lesson: null, exercise: EXERCISES.find((e: any) => e.id === exId || e.exerciseId === exId) };
}

// ─── HTML escape ─────────────────────────────────────────────────────────────

function esc(v: any): string {
  if (v == null) return '';
  return String(v)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function nl2br(s: string): string {
  return esc(s).replace(/\n/g, '<br/>');
}

// ─── Label lookup from exercise template ─────────────────────────────────────

const renderValue = renderMaterialResponse;

// ─── Extra styles layered on top of BASE_STYLES ──────────────────────────────

const MATERIALS_STYLES = `
  .mat-title-band {
    background: #1C1410;
    color: white;
    padding: 26px 28px 22px;
  }
  .mat-title-band .mat-tag {
    font-family: 'Aboreto', serif;
    font-size: 10px;
    letter-spacing: 3px;
    color: rgba(201,169,110,0.9);
    text-transform: uppercase;
    margin-bottom: 8px;
  }
  .mat-title-band h1 {
    font-family: 'Aboreto', serif;
    font-size: 20px;
    line-height: 1.35;
    font-weight: normal;
    letter-spacing: 0.5px;
  }
  .mat-title-band .mat-subtitle {
    display: inline-block;
    margin-top: 12px;
    font-size: 10px;
    letter-spacing: 2px;
    text-transform: uppercase;
    padding: 3px 10px;
    border: 1px solid rgba(255,255,255,0.35);
    border-radius: 20px;
    opacity: 0.85;
  }

  .mat-body { padding: 26px 30px 32px; }

  .mat-section {
    margin-bottom: 26px;
    break-inside: avoid;
  }
  .mat-section-header {
    font-family: 'Aboreto', serif;
    font-size: 11px;
    letter-spacing: 2.5px;
    text-transform: uppercase;
    color: #1A5C38;
    background: #eaf3ed;
    padding: 7px 12px;
    margin-bottom: 12px;
    border-radius: 3px;
  }
  .mat-section-header.note { color: #8B1A1A; background: #fbebeb; }
  .mat-section-sub {
    font-size: 11px;
    color: #7a6e64;
    margin-top: -6px;
    margin-bottom: 12px;
    padding-left: 12px;
    font-style: italic;
  }

  .mat-item {
    margin-bottom: 22px;
    padding: 14px 16px;
    border: 1px solid #ddd5c8;
    border-radius: 5px;
    background: #FDFAF6;
    break-inside: avoid;
  }
  .mat-item-title {
    font-family: 'Aboreto', serif;
    font-size: 12px;
    letter-spacing: 1.5px;
    text-transform: uppercase;
    color: #1C1410;
    margin-bottom: 4px;
  }
  .mat-item-meta {
    font-size: 10px;
    color: #7a6e64;
    letter-spacing: 0.5px;
    text-transform: uppercase;
    margin-bottom: 10px;
    padding-bottom: 8px;
    border-bottom: 1px solid #ecdfc9;
  }

  .mat-field {
    margin-bottom: 10px;
  }
  .mat-field-label {
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.5px;
    color: #7a6e64;
    text-transform: uppercase;
    margin-bottom: 3px;
  }
  .mat-field-value {
    font-size: 12.5px;
    color: #1C1410;
    background: #f7f0e4;
    border-left: 2px solid #C9A96E;
    padding: 8px 12px;
    border-radius: 0 3px 3px 0;
    white-space: pre-wrap;
    word-break: break-word;
  }
  .mat-field-value .mat-field {
    margin-bottom: 6px;
  }
  .mat-field-value .mat-field-value {
    background: rgba(255,255,255,0.6);
    border-left-color: #ddd5c8;
  }

  .mat-empty {
    color: #b0a396;
    font-style: italic;
    font-size: 11.5px;
  }

  .mat-list {
    margin: 4px 0 4px 18px;
  }
  .mat-list li { margin-bottom: 3px; }

  .mat-table {
    width: 100%;
    border-collapse: collapse;
    margin: 6px 0;
    font-size: 11.5px;
  }
  .mat-table th, .mat-table td {
    border: 1px solid #ddd5c8;
    padding: 6px 8px;
    text-align: left;
    vertical-align: top;
  }
  .mat-table th {
    background: #eaf3ed;
    font-family: 'Aboreto', serif;
    font-size: 10px;
    letter-spacing: 1.5px;
    text-transform: uppercase;
    color: #1A5C38;
    font-weight: normal;
  }

  .mat-note-body {
    font-size: 13px;
    line-height: 1.65;
    color: #1C1410;
    background: #FDFAF6;
    border: 1px solid #ddd5c8;
    border-left: 3px solid #C9A96E;
    padding: 14px 18px;
    border-radius: 0 4px 4px 0;
    white-space: pre-wrap;
    word-break: break-word;
  }

  /* Reading and print layout; preserve the shared AA document palette. */
  .mat-title-band { background: var(--ink); color: var(--paper); }
  .mat-title-band h1, .mat-item-title { letter-spacing: 0; }
  .mat-title-band .mat-tag { color: var(--gold); }
  .mat-body { line-height: 1.65; }
  .mat-section { break-inside: auto; }
  .mat-item { padding: 18px 0; border: 0; border-bottom: 1px solid var(--line); background: none; break-inside: auto; }
  .mat-item-title { font-family: 'Arimo', Arial, sans-serif; font-size: 17px; font-weight: 700; text-transform: none; color: var(--green); break-after: avoid; }
  .mat-item-meta { color: var(--muted); border-color: var(--line); }
  .mat-field { margin-bottom: 18px; }
  .mat-field-label { font-size: 12px; line-height: 1.5; letter-spacing: 0; text-transform: none; color: var(--ink-light); break-after: avoid; margin-bottom: 6px; }
  .mat-field-value { font-size: 13px; line-height: 1.65; color: var(--ink); background: none; border: 0; border-radius: 0; padding: 0; white-space: normal; overflow-wrap: anywhere; }
  .mat-field-value .mat-field-value { background: none; border: 0; }
  .mat-field-value a { color: var(--green); }
  .mat-empty { color: var(--muted); }
  .mat-list { padding-left: 18px; margin: 0; }
  .mat-list li { padding-left: 3px; margin-bottom: 6px; }
  .mat-table { table-layout: fixed; font-size: 12px; margin: 8px 0 12px; }
  .mat-table th, .mat-table td { padding: 9px 10px; border-color: var(--line); overflow-wrap: anywhere; }
  .mat-table th { font-family: 'Arimo', Arial, sans-serif; font-size: 11px; letter-spacing: 0; text-transform: none; font-weight: 700; color: var(--green); background: var(--paper-dark); }
  .mat-table thead { display: table-header-group; }
  .mat-table tr { break-inside: avoid; }
  .mat-record { border-top: 1px solid var(--line); padding: 12px 0; }
  .mat-record-number { font-weight: 700; color: var(--green); margin-bottom: 8px; }
  .mat-record .mat-field { margin-bottom: 10px; }
  @media print {
    @page { size: A4; margin: 12mm; }
    .page { width: 100%; min-height: 0 !important; height: auto !important; overflow: visible; break-after: auto; }
    .mat-body { padding: 20px 0; }
    .mat-title-band { padding: 20px; }
    .aa-header, .aa-footer { break-inside: avoid; }
  }
`;

// ─── Shell builders ──────────────────────────────────────────────────────────

function titleBand(tag: string, title: string, subtitle?: string): string {
  return `
    <div class="mat-title-band">
      <div class="mat-tag">${esc(tag)}</div>
      <h1>${esc(title)}</h1>
      ${subtitle ? `<div class="mat-subtitle">${esc(subtitle)}</div>` : ''}
    </div>`;
}

function pageWrap(docTag: string, topic: string, inner: string): string {
  // Continuous flowing document (no fixed page height) — lets long responses paginate naturally on print.
  return `
    <div class="page" style="height:auto; min-height: 297mm;">
      ${aaHeader(docTag, topic)}
      ${inner}
      ${aaFooter(docTag, '')}
    </div>`;
}

function buildHtml(pageTitle: string, docTag: string, topic: string, inner: string): string {
  return htmlShell(MATERIALS_STYLES, pageWrap(docTag, topic, inner), pageTitle);
}

// ─── Public: Exercise PDF ────────────────────────────────────────────────────

export function exportExercisePDF(exerciseId: string, response: any) {
  const { mod, lesson, exercise } = findExercise(exerciseId);
  const lessonLabel = lesson && mod ? formatLessonNumber(mod, lesson) : '';
  const title = mod && lesson ? formatExerciseTitle(mod, lesson) : exercise?.title || 'Exercițiu';
  const topic = mod?.etapa || 'Materialele mele';
  const docTag = `EX · ${lessonLabel || 'Materialele mele'}`;

  const meta = [lessonLabel && `Exercițiul ${lessonLabel}`, mod?.etapa]
    .filter(Boolean).join('  •  ');

  const instructions = exercise?.instructions
    ? `<div class="mat-section-sub">${esc(exercise.instructions)}</div>`
    : '';

  const inner = `
    ${titleBand('Exercițiu completat', title, mod?.etapa)}
    <div class="mat-body">
      ${meta ? `<div class="mat-item-meta" style="border:none; padding:0; margin-bottom:14px;">${esc(meta)}</div>` : ''}
      ${instructions}
      <div class="mat-item">
        ${renderValue(response, exercise)}
      </div>
    </div>`;

  openPrintWindow(buildHtml(`${title} · Arhitectura Afacerii`, docTag, topic, inner));
}

// ─── Public: Note PDF ────────────────────────────────────────────────────────

export function exportNotePDF(lessonId: string, content: string) {
  const found = findLesson(lessonId);
  const lessonLabel = found ? formatLessonNumber(found.mod, found.lesson) : '';
  const lessonTitle = found?.lesson?.title || 'Notiță';
  const topic = found?.mod?.etapa || 'Notițele mele';
  const docTag = `NOTĂ · ${lessonLabel || 'Materialele mele'}`;

  const meta = [lessonLabel && `Lecția ${lessonLabel}`, lessonTitle, found?.mod?.etapa]
    .filter(Boolean).join('  •  ');

  const inner = `
    ${titleBand('Notița mea', lessonTitle, found?.mod?.etapa)}
    <div class="mat-body">
      ${meta ? `<div class="mat-item-meta" style="border:none; padding:0; margin-bottom:14px;">${esc(meta)}</div>` : ''}
      <div class="mat-note-body">${nl2br(content || '') || '<span class="mat-empty">— gol —</span>'}</div>
    </div>`;

  openPrintWindow(buildHtml(`Notiță · ${lessonTitle} · Arhitectura Afacerii`, docTag, topic, inner));
}

// ─── Public: All materials PDF ───────────────────────────────────────────────

export function exportAllPDF(items: {
  exercises: { id: string; response: any }[];
  notes: { lesson_id: string; content: string }[];
  title?: string;
}) {
  const parts: string[] = [];

  parts.push(titleBand('Materialele mele', items.title || 'Toate materialele — Arhitectura Afacerii',
    `Generat ${new Date().toLocaleDateString('ro-RO', { day: 'numeric', month: 'long', year: 'numeric' })}`));

  parts.push('<div class="mat-body">');

  if (items.exercises.length) {
    parts.push('<div class="mat-section">');
    parts.push('<div class="mat-section-header">Exerciții completate</div>');
    for (const ex of items.exercises) {
      const { mod, lesson, exercise } = findExercise(ex.id);
      const lessonLabel = lesson && mod ? formatLessonNumber(mod, lesson) : '';
      const title = mod && lesson ? formatExerciseTitle(mod, lesson) : exercise?.title || ex.id;
      const meta = [lessonLabel && `Exercițiul ${lessonLabel}`, mod?.etapa].filter(Boolean).join('  •  ');
      parts.push(`
        <div class="mat-item">
          <div class="mat-item-title">${esc(title)}</div>
          ${meta ? `<div class="mat-item-meta">${esc(meta)}</div>` : ''}
          ${renderValue(ex.response, exercise)}
        </div>`);
    }
    parts.push('</div>');
  }

  if (items.notes.length) {
    parts.push('<div class="mat-section">');
    parts.push('<div class="mat-section-header note">Notițele mele</div>');
    for (const n of items.notes) {
      const found = findLesson(n.lesson_id);
      const lessonLabel = found ? formatLessonNumber(found.mod, found.lesson) : '';
      const title = found?.lesson?.title || n.lesson_id;
      const meta = [lessonLabel && `Lecția ${lessonLabel}`, found?.mod?.etapa].filter(Boolean).join('  •  ');
      parts.push(`
        <div class="mat-item">
          <div class="mat-item-title">${esc(title)}</div>
          ${meta ? `<div class="mat-item-meta">${esc(meta)}</div>` : ''}
          <div class="mat-note-body">${nl2br(n.content || '') || '<span class="mat-empty">— gol —</span>'}</div>
        </div>`);
    }
    parts.push('</div>');
  }

  if (!items.exercises.length && !items.notes.length) {
    parts.push('<div class="mat-item"><span class="mat-empty">Nu ai încă materiale salvate. Completează exerciții sau notițe și revino aici.</span></div>');
  }

  parts.push('</div>');

  openPrintWindow(buildHtml('Materialele mele · Arhitectura Afacerii', 'ALL · Materialele mele', 'Arhitectura Afacerii', parts.join('\n')));
}
