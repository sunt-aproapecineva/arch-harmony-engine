// @ts-nocheck
// Cursul curent — dedus din URL, nu ținut ca stare globală.
//
// Cursul face parte din rută (/c/<slug>/...), nu din context-ul aplicației, ca elevul
// să poată ține două cursuri deschise în două taburi fără să se calce, iar linkurile
// trimise pe Telegram să ducă exact unde trebuie.
//
// Providerul de aici doar expune cursul rutei curente și conținutul lui, ca paginile
// să nu-l recalculeze fiecare din parametri.
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { Course, getCourse, getCourseBySlug } from '@/lib/courses';
import { getCourseModules, getCourseLiveEvents } from '@/lib/content';
import { tariffForCourse, flowForCourse } from '@/lib/enrollments';
import { fetchFlowEvents, type Flow, type FlowEvent } from '@/lib/flows';
import { useAuthContext } from './AuthContext';
import type { Module, LiveEvent, Tariff } from '@/lib/types';

interface CourseContextValue {
  course: Course | null;
  courseId: string | null;
  modules: Module[];
  liveEvents: LiveEvent[];
  /** Tariful elevului la ACEST curs (nu cel de pe profil). */
  tariff: Tariff;
  /**
   * Fluxul elevului la acest curs. Ancorează deblocarea modulelor și canalul de
   * comunicare. Null pentru elevii neasignați — atunci se cade pe datele absolute vechi.
   */
  flow: Flow | null;
}

const CourseContext = createContext<CourseContextValue>({
  course: null,
  courseId: null,
  modules: [],
  liveEvents: [],
  tariff: 'student',
  flow: null,
});

export const useCourse = () => useContext(CourseContext);

/**
 * Cursul curent sau, dacă lipsește, o eroare explicită. De folosit în paginile care
 * nu au sens fără curs (dashboard, lecție, modul) — mai bine cade zgomotos în dev
 * decât să arate tăcut conținutul altui curs.
 */
export function useRequiredCourse(): Course {
  const { course } = useCourse();
  if (!course) {
    throw new Error('useRequiredCourse a fost apelat în afara unei rute /c/<curs>/');
  }
  return course;
}

export const CourseProvider: React.FC<{ courseSlug?: string; courseId?: string; children: React.ReactNode }> = ({
  courseSlug,
  courseId,
  children,
}) => {
  const { user } = useAuthContext();
  const [flowEvents, setFlowEvents] = useState<FlowEvent[]>([]);
  const course = useMemo(
    () => (courseId ? getCourse(courseId) : getCourseBySlug(courseSlug)) || null,
    [courseSlug, courseId],
  );

  const flow = useMemo(
    () => (course ? flowForCourse(user?.enrollments, course.id) : null),
    [course, user?.enrollments],
  );

  // Calendarul e al fluxului, nu al cursului: un flux nou n-are ce căuta în opt
  // întâlniri deja trecute ale celui dinainte.
  useEffect(() => {
    let cancelled = false;
    if (!flow?.id) { setFlowEvents([]); return; }
    fetchFlowEvents(flow.id).then(evts => { if (!cancelled) setFlowEvents(evts); });
    return () => { cancelled = true; };
  }, [flow?.id]);

  const value = useMemo<CourseContextValue>(
    () => ({
      course,
      courseId: course?.id || null,
      modules: course ? getCourseModules(course.id) : [],
      // Evenimentele fluxului au prioritate; cele din cod rămân ca plasă pentru
      // elevii fără flux asignat.
      liveEvents: flowEvents.length
        ? (flowEvents as unknown as LiveEvent[])
        : (course ? getCourseLiveEvents(course.id) : []),
      tariff: course ? tariffForCourse(user?.enrollments, course.id) : 'student',
      flow,
    }),
    [course, user?.enrollments, flow, flowEvents],
  );

  return <CourseContext.Provider value={value}>{children}</CourseContext.Provider>;
};
