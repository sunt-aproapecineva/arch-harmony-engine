// @ts-nocheck
// Cursul pe care îl privește adminul într-o pagină de cockpit.
//
// Paginile de admin nu stau sub /c/<curs>/, deci nu au CourseContext. Domeniul de
// vizualizare vine din parametrul de căutare `?curs=`, ca să fie partajabil prin link
// și să supraviețuiască unui refresh. Implicit: primul curs activ (Business).
//
// Regula rămâne aceeași ca pentru elev: agregările (progres, scoruri, briefing) se
// raportează la UN curs. Un scor combinat între două metodologii n-ar spune nimic.
import { useCallback } from 'react';
import { useSearchParams } from '@/lib/router-compat';
import { activeCourses, getCourse } from '../lib/courses';

export function useAdminCourseScope() {
  const [params, setParams] = useSearchParams();
  const fallback = activeCourses()[0];
  const requested = params.get('curs');
  const course = getCourse(requested) || fallback;

  const setCourseId = useCallback(
    (nextId: string) => {
      setParams((prev) => {
        const next = new URLSearchParams(prev);
        next.set('curs', nextId);
        return next;
      });
    },
    [setParams],
  );

  return { course, courseId: course?.id || fallback?.id || 'business', setCourseId };
}
