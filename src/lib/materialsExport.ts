// @ts-nocheck
import jsPDF from 'jspdf';
import { MODULES } from './data';
import { EXERCISE_TEMPLATES as EXERCISES } from './exerciseData';
import { formatLessonNumber, getModuleNumber } from './lessonNumbering';

const BRAND = 'Arhitectura Afacerii';

function findLesson(lessonId: string) {
  for (const mod of MODULES) {
    const l = mod.lessons.find((x: any) => x.id === lessonId);
    if (l) return { mod, lesson: l };
  }
  return null;
}
function findExercise(exId: string) {
  for (const mod of MODULES) {
    const l = mod.lessons.find((x: any) => x.exercise_id === exId);
    if (l) return { mod, lesson: l, exercise: EXERCISES.find((e: any) => e.id === exId) };
  }
  return { mod: null, lesson: null, exercise: EXERCISES.find((e: any) => e.id === exId) };
}

function stringifyResponse(response: any): string {
  if (response == null) return '(gol)';
  if (typeof response === 'string') return response;
  if (Array.isArray(response)) {
    return response.map((r, i) => `${i + 1}. ${typeof r === 'object' ? JSON.stringify(r, null, 2) : String(r)}`).join('\n');
  }
  if (typeof response === 'object') {
    return Object.entries(response)
      .map(([k, v]) => `— ${k}:\n${typeof v === 'object' ? JSON.stringify(v, null, 2) : String(v)}`)
      .join('\n\n');
  }
  return String(response);
}

function newDoc(title: string) {
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const w = doc.internal.pageSize.getWidth();
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(150);
  doc.text(BRAND.toUpperCase(), 40, 32);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(20);
  doc.text(title, 40, 62, { maxWidth: w - 80 });
  doc.setDrawColor(200); doc.line(40, 76, w - 40, 76);
  return doc;
}

function writeBody(doc: jsPDF, text: string, startY = 96) {
  const w = doc.internal.pageSize.getWidth();
  const h = doc.internal.pageSize.getHeight();
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  doc.setTextColor(30);
  const lines = doc.splitTextToSize(text || '(gol)', w - 80);
  let y = startY;
  for (const ln of lines) {
    if (y > h - 50) { doc.addPage(); y = 60; }
    doc.text(ln, 40, y);
    y += 16;
  }
  return y;
}

export function exportExercisePDF(exerciseId: string, response: any) {
  const { mod, lesson, exercise } = findExercise(exerciseId);
  const label = lesson && mod ? `${formatLessonNumber(mod, lesson)} · ${lesson.title}` : (exercise?.title || 'Exercițiu');
  const doc = newDoc(label);
  doc.setFontSize(10); doc.setTextColor(120);
  doc.text(mod ? mod.etapa : '', 40, 90);
  writeBody(doc, stringifyResponse(response), 118);
  doc.save(`${(label).replace(/[^\w.-]+/g, '_')}.pdf`);
}

export function exportNotePDF(lessonId: string, content: string) {
  const found = findLesson(lessonId);
  const label = found ? `Notițe · ${formatLessonNumber(found.mod, found.lesson)} ${found.lesson.title}` : 'Notițe';
  const doc = newDoc(label);
  writeBody(doc, content || '(gol)');
  doc.save(`${label.replace(/[^\w.-]+/g, '_')}.pdf`);
}

export function exportAllPDF(items: {
  exercises: { id: string; response: any }[];
  notes: { lesson_id: string; content: string }[];
}) {
  const doc = newDoc('Toate materialele mele');
  const w = doc.internal.pageSize.getWidth();
  const h = doc.internal.pageSize.getHeight();
  let y = 100;

  const section = (t: string) => {
    if (y > h - 80) { doc.addPage(); y = 60; }
    doc.setFont('helvetica', 'bold'); doc.setFontSize(13); doc.setTextColor(20);
    doc.text(t, 40, y); y += 8;
    doc.setDrawColor(220); doc.line(40, y, w - 40, y); y += 18;
  };
  const body = (t: string) => { y = writeBody(doc, t, y) + 10; };
  const sub = (t: string) => {
    if (y > h - 60) { doc.addPage(); y = 60; }
    doc.setFont('helvetica', 'bold'); doc.setFontSize(11); doc.setTextColor(60);
    doc.text(t, 40, y); y += 16;
  };

  if (items.exercises.length) {
    section('Exerciții completate');
    for (const ex of items.exercises) {
      const { mod, lesson } = findExercise(ex.id);
      sub(lesson && mod ? `${formatLessonNumber(mod, lesson)} · ${lesson.title}` : ex.id);
      body(stringifyResponse(ex.response));
    }
  }
  if (items.notes.length) {
    if (items.exercises.length) { doc.addPage(); y = 60; }
    section('Notițele mele');
    for (const n of items.notes) {
      const found = findLesson(n.lesson_id);
      sub(found ? `${formatLessonNumber(found.mod, found.lesson)} · ${found.lesson.title}` : n.lesson_id);
      body(n.content || '(gol)');
    }
  }
  doc.save('Materialele-mele.pdf');
}
