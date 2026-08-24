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
import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useRouterState } from '@tanstack/react-router';
import { activeCourses, getCourse } from '../lib/courses';
import { fetchFlows, type Flow } from '../lib/flows';

export function useAdminCourseScope() {
  const navigate = useNavigate();
  const search = useRouterState({ select: (s) => s.location.searchStr || '' });
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  const fallback = activeCourses()[0];
  const params = new URLSearchParams(search);
  const requested = params.get('curs');
  const course = getCourse(requested) || fallback;
  const courseId = course?.id || fallback?.id || 'business';

  // Fluxul privit. Gol = toate fluxurile cursului, ceea ce e alegerea corectă
  // pentru vederile de administrare; panourile de lucru cu flowa filtrează.
  const [flows, setFlows] = useState<Flow[]>([]);
  useEffect(() => {
    let cancelled = false;
    fetchFlows(courseId).then(list => { if (!cancelled) setFlows(list); });
    return () => { cancelled = true; };
  }, [courseId]);

  const requestedFlow = params.get('flux');
  const flow = flows.find(c => c.id === requestedFlow) || null;

  const setParam = useCallback(
    (key: string, value: string | null) => {
      const next = new URLSearchParams(search);
      if (value) next.set(key, value);
      else next.delete(key);
      const obj: Record<string, string> = {};
      next.forEach((v, k) => { obj[k] = v; });
      navigate({ to: pathname, search: obj, replace: true });
    },
    [navigate, pathname, search],
  );

  // Schimbarea cursului resetează fluxul: fluxurile aparțin unui singur curs.
  const setCourseId = useCallback((nextId: string) => {
    const next = new URLSearchParams(search);
    next.set('curs', nextId);
    next.delete('flux');
    const obj: Record<string, string> = {};
    next.forEach((v, k) => { obj[k] = v; });
    navigate({ to: pathname, search: obj, replace: true });
  }, [navigate, pathname, search]);

  const setFlowId = useCallback((nextId: string | null) => setParam('flux', nextId), [setParam]);

  return { course, courseId, setCourseId, flows, flow, flowId: flow?.id || null, setFlowId };
}
