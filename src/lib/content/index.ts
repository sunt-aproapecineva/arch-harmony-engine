// Punctul unic de acces la conținutul cursurilor.
//
// Nu există un export global de tip `MODULES`: orice consumator trebuie să spună
// explicit cărui curs îi cere conținutul. Asta împiedică amestecarea accidentală a
// două metodologii în aceleași procente de progres, aceeași căutare sau același export.
import { Module, LiveEvent } from '../types';
import { CourseId, COURSES, getCourse } from '../courses';
import { BUSINESS_MODULES, BUSINESS_LIVE_EVENTS } from './business';
import { START_MODULES, START_LIVE_EVENTS } from './start';

const MODULES_BY_COURSE: Record<CourseId, Module[]> = {
  business: BUSINESS_MODULES,
  start: START_MODULES,
};

const EVENTS_BY_COURSE: Record<CourseId, LiveEvent[]> = {
  business: BUSINESS_LIVE_EVENTS,
  start: START_LIVE_EVENTS,
};

/** Modulele unui curs. Referință vie — LiveContentContext suprapune peste ea in-place. */
export function getCourseModules(courseId: CourseId | string | null | undefined): Module[] {
  const course = getCourse(courseId);
  return course ? MODULES_BY_COURSE[course.id] : [];
}

export function getCourseLiveEvents(courseId: CourseId | string | null | undefined): LiveEvent[] {
  const course = getCourse(courseId);
  return course ? EVENTS_BY_COURSE[course.id] : [];
}

/**
 * Toate modulele, cu cursul de care aparțin. Doar pentru vederile de admin care
 * chiar trebuie să treacă peste cursuri (ex. overlay-ul de conținut din DB).
 * Nu folosi asta pentru progres sau procente — acelea sunt întotdeauna per curs.
 */
export function allCourseModules(): Array<{ courseId: CourseId; modules: Module[] }> {
  return COURSES.map(c => ({ courseId: c.id, modules: MODULES_BY_COURSE[c.id] }));
}
