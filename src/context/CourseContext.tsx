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
import { fetchFlowEvents, fetchFlows, type Flow, type FlowEvent } from '@/lib/flows';
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
  /**
   * Fluxurile pe care adminul le poate inspecta la acest curs. Gol pentru elevi:
   * ei au exact un flux, cel din înscriere.
   */
  adminFlows: Flow[];
  /** Adminul privește dashboardul ca fluxul ăsta. Null = fluxul propriu / implicit. */
  previewFlowId: string | null;
  setPreviewFlowId: (id: string | null) => void;
}

const CourseContext = createContext<CourseContextValue>({
  course: null,
  courseId: null,
  modules: [],
  liveEvents: [],
  tariff: 'student',
  flow: null,
  adminFlows: [],
  previewFlowId: null,
  setPreviewFlowId: () => {},
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
  const [adminFlows, setAdminFlows] = useState<Flow[]>([]);
  const [previewFlowId, setPreviewFlowIdState] = useState<string | null>(null);
  const course = useMemo(
    () => (courseId ? getCourse(courseId) : getCourseBySlug(courseSlug)) || null,
    [courseSlug, courseId],
  );
  const isAdmin = user?.role === 'admin';

  const ownFlow = useMemo(
    () => (course ? flowForCourse(user?.enrollments, course.id) : null),
    [course, user?.enrollments],
  );

  // Adminul nu e înscris la toate programele, deci n-are flux propriu peste tot —
  // fără lista asta, dashboardul altui program îi apărea gol (fără calendar, fără
  // Telegram). Elevii nu o încarcă: pentru ei fluxul e cel din înscriere, punct.
  useEffect(() => {
    let cancelled = false;
    if (!isAdmin || !course) { setAdminFlows([]); return; }
    fetchFlows(course.id).then(list => { if (!cancelled) setAdminFlows(list); });
    return () => { cancelled = true; };
  }, [isAdmin, course?.id]);

  // Alegerea adminului se ține pe program, ca trecerea între Business și START
  // să nu-l arunce înapoi pe fluxul altui program.
  const prefKey = course ? `aa_admin_flow_${course.id}` : '';
  useEffect(() => {
    if (!isAdmin || !prefKey || typeof window === 'undefined') { setPreviewFlowIdState(null); return; }
    try { setPreviewFlowIdState(localStorage.getItem(prefKey)); } catch { setPreviewFlowIdState(null); }
  }, [isAdmin, prefKey]);

  const setPreviewFlowId = (id: string | null) => {
    setPreviewFlowIdState(id);
    if (!prefKey || typeof window === 'undefined') return;
    try {
      if (id) localStorage.setItem(prefKey, id);
      else localStorage.removeItem(prefKey);
    } catch { /* noop */ }
  };

  // Ordinea: fluxul ales explicit de admin → fluxul propriu → pentru admin, cel
  // mai recent flux activ al programului, ca să aibă mereu ce inspecta.
  const flow = useMemo(() => {
    if (isAdmin && previewFlowId) {
      const picked = adminFlows.find(f => f.id === previewFlowId);
      if (picked) return picked;
    }
    if (ownFlow) return ownFlow;
    if (isAdmin) return adminFlows.find(f => f.is_active) || adminFlows[0] || null;
    return null;
  }, [isAdmin, previewFlowId, adminFlows, ownFlow]);

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
      adminFlows: isAdmin ? adminFlows : [],
      previewFlowId: isAdmin ? previewFlowId : null,
      setPreviewFlowId,
    }),
    [course, user?.enrollments, flow, flowEvents, isAdmin, adminFlows, previewFlowId],
  );


  return <CourseContext.Provider value={value}>{children}</CourseContext.Provider>;
};
