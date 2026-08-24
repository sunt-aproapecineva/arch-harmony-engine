// @ts-nocheck
// Domeniul privit de admin: program + flux + treaptă de preț.
//
// ÎNAINTE era un MOD: bara laterală avea un comutator Business/Start și tot panoul
// intra „în interiorul" unui program. Greșit pentru rolul de admin — el vede tot și
// poate tot. Un mod global însemna că lista de acces, adăugarea unui elev și lista de
// utilizatori arătau doar jumătate din realitate, iar filtrele rămâneau ale unui
// singur program (chipurile Student/Designer/Arhitect peste elevi cu treapta „Singur").
//
// ACUM e un FILTRU: implicit `null` = toate programele. Fiecare pagină își pune bara
// de filtrare (AdminScopeBar), iar cele care chiar au nevoie de un singur program —
// matricea de progres, editorul de lecții — cer explicit o alegere.
//
// Starea stă în query string (`?curs=`, `?flux=`, `?tarif=`), ca să fie partajabilă
// prin link și să supraviețuiască unui refresh. Citirea se face prin `useRouterState`,
// nu din `window.location`, altfel componentele nu s-ar re-randa la schimbarea filtrului.
import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useRouterState } from '@tanstack/react-router';
import { getCourse, activeCourses } from '../lib/courses';
import { fetchFlows, type Flow } from '../lib/flows';

export function useAdminCourseScope() {
  const navigate = useNavigate();
  const search = useRouterState({ select: (s) => s.location.searchStr || '' });
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  const params = new URLSearchParams(search);

  // null = toate programele. Un `?curs=` invalid cade tot pe „toate", nu pe Business:
  // o valoare stricată nu trebuie să ascundă în tăcere jumătate din elevi.
  const requested = params.get('curs');
  const course = getCourse(requested) || null;
  const courseId = course?.id || null;

  // Fluxurile din domeniu. Fără program ales, sunt fluxurile TUTUROR programelor —
  // adminul trebuie să poată filtra „Flux 2 Business" fără să intre întâi în Business.
  const [flows, setFlows] = useState<Flow[]>([]);
  useEffect(() => {
    let cancelled = false;
    fetchFlows(courseId).then(list => { if (!cancelled) setFlows(list); });
    return () => { cancelled = true; };
  }, [courseId]);

  const requestedFlow = params.get('flux');
  const flow = flows.find(c => c.id === requestedFlow) || null;

  const tariffId = params.get('tarif') || null;

  const setParams = useCallback(
    (patch: Record<string, string | null>) => {
      const next = new URLSearchParams(search);
      for (const [k, v] of Object.entries(patch)) {
        if (v) next.set(k, v);
        else next.delete(k);
      }
      const obj: Record<string, string> = {};
      next.forEach((v, k) => { obj[k] = v; });
      navigate({ to: pathname, search: obj, replace: true });
    },
    [navigate, pathname, search],
  );

  // Schimbarea programului resetează fluxul ȘI treapta: ambele aparțin unui program.
  // Fără reset ai rămâne cu „?curs=start&tarif=arhitect", adică o listă goală
  // pe care ai citi-o drept „niciun elev", nu drept „filtru imposibil".
  const setCourseId = useCallback(
    (nextId: string | null) => setParams({ curs: nextId, flux: null, tarif: null }),
    [setParams],
  );
  const setFlowId = useCallback((nextId: string | null) => setParams({ flux: nextId }), [setParams]);
  const setTariffId = useCallback((nextId: string | null) => setParams({ tarif: nextId }), [setParams]);

  // Un flux ales rămas fără acoperire (i s-a schimbat programul, a fost șters) ar
  // filtra totul la zero fără explicație. Îl curățăm de îndată ce lista e cunoscută.
  useEffect(() => {
    if (requestedFlow && flows.length && !flows.some(f => f.id === requestedFlow)) {
      setParams({ flux: null });
    }
  }, [requestedFlow, flows, setParams]);

  return {
    course, courseId, setCourseId,
    flows, flow, flowId: flow?.id || null, setFlowId,
    tariffId, setTariffId,
    /** Programele peste care se uită pagina acum: unul ales, sau toate. */
    coursesInScope: courseId ? [getCourse(courseId)].filter(Boolean) : activeCourses(),
  };
}
