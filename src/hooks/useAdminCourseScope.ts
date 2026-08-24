// @ts-nocheck
// Cursul pe care îl privește adminul într-o pagină de cockpit.
//
// Paginile de admin nu stau sub /c/<curs>/, deci nu au CourseContext. Domeniul de
// vizualizare vine din parametrul de căutare `?curs=`, ca să fie partajabil prin link
// și să supraviețuiască unui refresh. Implicit: primul curs activ (Business).
//
// Citirea se face prin `useRouterState`, nu direct din `window.location`: altfel
// componentele care apelează hook-ul (bara laterală, coada de atenție, briefingul) nu
// s-ar re-randa toate la comutarea cursului.
//
// Regula rămâne aceeași ca pentru elev: agregările (progres, scoruri, briefing) se
// raportează la UN curs. Un scor combinat între două metodologii n-ar spune nimic.
import { useCallback } from 'react';
import { useNavigate, useRouterState } from '@tanstack/react-router';
import { activeCourses, getCourse } from '../lib/courses';

export function useAdminCourseScope() {
  const navigate = useNavigate();
  const search = useRouterState({ select: (s) => s.location.searchStr || '' });
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  const fallback = activeCourses()[0];
  const requested = new URLSearchParams(search).get('curs');
  const course = getCourse(requested) || fallback;

  const setCourseId = useCallback(
    (nextId: string) => {
      const next = new URLSearchParams(search);
      next.set('curs', nextId);
      const obj: Record<string, string> = {};
      next.forEach((v, k) => { obj[k] = v; });
      navigate({ to: pathname, search: obj, replace: true });
    },
    [navigate, pathname, search],
  );

  return { course, courseId: course?.id || fallback?.id || 'business', setCourseId };
}
