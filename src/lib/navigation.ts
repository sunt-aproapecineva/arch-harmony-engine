// Construirea căilor din interiorul unui curs.
//
// Toate rutele de studiu trăiesc sub /c/<slug>/. Le construim într-un singur loc ca
// să nu apară șiruri lipite manual prin componente — altfel un curs nou înseamnă
// vânătoare de '/dashboard' prin tot codul.
import { Course, CourseId, getCourse, courseIdFromContentId } from './courses';
import { enrolledCourses } from './enrollments';
import { hasCompletedOnboarding } from './access';
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
 * Unde aterizează elevul după login sau imediat după ce și-a creat contul.
 *
 * Ordinea deciziei — de sus în jos:
 *   1. fără cont            → /login
 *   2. admin                → /cursuri (vede toate programele, nu e elevul niciunuia)
 *   3. un singur program, fără diagnostic → quizul ACELUI program
 *   4. un singur program, cu diagnostic   → direct în el
 *   5. zero sau mai multe   → /cursuri
 *
 * Pasul 3 e miezul: elevul ajunge pe platformă doar pentru că adminul l-a înscris,
 * iar înscrierea spune deja LA CE program. Deci în clipa în care își face contul,
 * platforma știe care diagnostic i se cuvine și îl duce acolo — nu are ce alege și
 * n-are rost să treacă printr-un dashboard pe care oricum nu-l poate folosi până nu
 * completează quizul. Înainte ateriza pe dashboard, unde un banner îl anunța că are
 * de dat un diagnostic, iar modulele îi deschideau un modal la fiecare click.
 *
 * Adminul NU e trimis în quiz: el nu e elevul programului, iar un diagnostic dat de
 * el ar polua datele mentorului.
 */
export function resolveLandingPath(user: User | null | undefined): string {
  if (!user) return '/login';
  if (user.role === 'admin') return '/cursuri';

  const courses = enrolledCourses(user.enrollments);
  if (courses.length !== 1) return '/cursuri';

  const only = courses[0];
  if (only.hasQuiz && !hasCompletedOnboarding(user, only.id)) return courseQuizPath(only);
  return courseDashboardPath(only);
}
