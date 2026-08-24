// Construirea căilor din interiorul unui curs.
//
// Toate rutele de studiu trăiesc sub /c/<slug>/. Le construim într-un singur loc ca
// să nu apară șiruri lipite manual prin componente — altfel un curs nou înseamnă
// vânătoare de '/dashboard' prin tot codul.
import { Course, CourseId, getCourse, courseIdFromContentId, activeCourses } from './courses';
import { enrolledCourses } from './enrollments';
import type { User } from './types';

function slugOf(course: Course | CourseId | string | null | undefined): string | null {
  if (!course) return null;
  if (typeof course === 'string') return getCourse(course)?.slug || null;
  return course.slug;
}

export function coursePath(course: Course | CourseId | string | null | undefined, sub = ''): string {
  const slug = slugOf(course);
  if (!slug) return '/cursuri';
  const tail = sub ? (sub.startsWith('/') ? sub : `/${sub}`) : '';
  return `/c/${slug}${tail}`;
}

export const courseDashboardPath = (c: any) => coursePath(c, 'dashboard');
export const courseModulePath = (c: any, moduleId: string) => coursePath(c, `module/${moduleId}`);
export const courseLessonPath = (c: any, lessonId: string) => coursePath(c, `lesson/${lessonId}`);
export const courseDocumentsPath = (c: any) => coursePath(c, 'documents');
export const courseDocumentFillPath = (c: any, docId: string) => coursePath(c, `documents/${docId}/fill`);
export const courseLibraryPath = (c: any) => coursePath(c, 'library');
export const courseLibraryArticlePath = (c: any, slug: string) => coursePath(c, `library/${slug}`);
export const courseMaterialsPath = (c: any) => coursePath(c, 'materials');
export const courseQuizPath = (c: any) => coursePath(c, 'quiz');

/** Ruta unde trebuie să ajungă un link vechi de tip /lesson/<id>, dedusă din prefixul id-ului. */
export function legacyContentPath(kind: 'lesson' | 'module', contentId: string): string {
  const courseId = courseIdFromContentId(contentId);
  if (!courseId) return '/cursuri';
  return coursePath(courseId, `${kind}/${contentId}`);
}

/**
 * Unde aterizează elevul după login.
 * Un singur curs → direct în el; mai multe → ecranul de selecție; niciunul → tot
 * ecranul de selecție, care explică situația în loc să arate o pagină goală.
 *
 * Adminul e tratat ca având acces la toate cursurile active — la fel ca poarta de curs
 * și ca ecranul de selecție. Altfel ar fi trimis direct într-un singur curs și n-ar
 * mai ajunge niciodată la ecranul general fără să scrie URL-ul de mână.
 */
export function resolveLandingPath(user: User | null | undefined): string {
  if (!user) return '/login';
  const courses = user.role === 'admin' ? activeCourses() : enrolledCourses(user.enrollments);
  if (courses.length === 1) return courseDashboardPath(courses[0]);
  return '/cursuri';
}
