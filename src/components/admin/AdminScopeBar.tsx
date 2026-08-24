// @ts-nocheck
// Bara de filtrare a panoului de admin: program · flux · treaptă.
//
// Un singur loc pentru cele trei axe pe care se împarte realitatea platformei, ca
// să arate și să se comporte identic în lista de utilizatori, în progres, în lecții
// și în activitate. Înainte fiecare pagină își inventa filtrele — de aici și chipurile
// „Student / Designer / Arhitect" desenate peste elevi cu treapta „Singur".
//
// Programul e o coloană, nu un mod: implicit „Toate". Paginile care chiar nu pot
// agrega două metodologii (matricea de progres, editorul de lecții) trec `requireCourse`
// și primesc un domeniu obligatoriu — cu o alegere implicită, nu cu o listă goală.
import React, { useEffect } from 'react';
import { activeCourses, COURSE_ACCENT, tiersInScope, tariffFilterValue } from '../../lib/courses';
import { useAdminCourseScope } from '../../hooks/useAdminCourseScope';

interface Props {
  /** Pagina nu poate afișa două programe deodată (matrice de module, editor). */
  requireCourse?: boolean;
  /** Ascunde axa treptei acolo unde nu spune nimic (ex. editorul de lecții). */
  showTariff?: boolean;
  /** Ascunde axa fluxului. */
  showFlow?: boolean;
  /** Text scurt sub bară: ce înseamnă filtrul curent, în cuvinte. */
  summary?: React.ReactNode;
}

export const AdminScopeBar: React.FC<Props> = ({
  requireCourse = false, showTariff = true, showFlow = true, summary,
}) => {
  const {
    courseId, setCourseId, flows, flowId, setFlowId, tariffId, setTariffId,
  } = useAdminCourseScope();
  const courses = activeCourses();
  const tiers = tiersInScope(courseId);

  // Pe paginile care cer un program, „Toate" n-are sens: alegem primul, o dată.
  useEffect(() => {
    if (requireCourse && !courseId && courses.length) setCourseId(courses[0].id);
  }, [requireCourse, courseId, courses, setCourseId]);

  const chip = (active: boolean, accent?: { fg: string; dim: string }) => ({
    minHeight: 34, padding: '6px 13px', borderRadius: 8, cursor: 'pointer',
    fontSize: 12, fontWeight: active ? 600 : 400, whiteSpace: 'nowrap',
    color: active ? (accent?.fg || 'var(--accent)') : 'var(--fg-3)',
    background: active ? (accent?.dim || 'var(--accent-dim)') : 'transparent',
    border: `1px solid ${active ? 'var(--border-hi)' : 'var(--border)'}`,
    transition: 'all 0.15s',
  });

  const select = {
    minHeight: 34, padding: '6px 10px', borderRadius: 8, fontSize: 12,
    background: 'var(--bg-3)', border: '1px solid var(--border)',
    color: 'var(--fg)', cursor: 'pointer', maxWidth: 260,
  };

  return (
    <div style={{
      background: 'var(--bg-card)', border: '1px solid var(--border)',
      borderRadius: 14, padding: '12px 14px', marginBottom: 20,
    }}>
      <div className="aa-scroll-x" style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 14 }}>
        {/* Program */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
          <span style={axisLabel}>Program</span>
          <div style={{ display: 'flex', gap: 5 }}>
            {!requireCourse && (
              <button onClick={() => setCourseId(null)} aria-pressed={!courseId} style={chip(!courseId)}>
                Toate
              </button>
            )}
            {courses.map(c => (
              <button
                key={c.id}
                onClick={() => setCourseId(c.id)}
                aria-pressed={courseId === c.id}
                style={chip(courseId === c.id, COURSE_ACCENT[c.accent])}
              >
                {c.shortTitle}
              </button>
            ))}
          </div>
        </div>

        {/* Flux — al programului ales, sau al tuturor. */}
        {showFlow && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
            <span style={axisLabel}>Flux</span>
            {flows.length === 0 ? (
              <span style={{ fontSize: 11.5, color: 'var(--fg-3)' }}>niciunul definit</span>
            ) : (
              <select value={flowId || ''} onChange={e => setFlowId(e.target.value || null)}
                aria-label="Filtrează după flux" style={select}>
                <option value="">Toate fluxurile</option>
                {flows.map(f => (
                  <option key={f.id} value={f.id}>
                    {/* Fără program ales, numele fluxului singur e ambiguu. */}
                    {courseId ? f.name : `${f.name} · ${shortOf(f.course_id)}`}
                  </option>
                ))}
              </select>
            )}
          </div>
        )}

        {/* Treaptă — reuniunea treptelor din domeniu, grupate pe program. */}
        {showTariff && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
            <span style={axisLabel}>Treaptă</span>
            <select value={tariffId || ''} onChange={e => setTariffId(e.target.value || null)}
              aria-label="Filtrează după treaptă de preț" style={select}>
              <option value="">Toate treptele</option>
              {courseId
                ? tiers.map(t => (
                    <option key={t.id} value={tariffFilterValue(courseId, t.id)}>
                      {t.label}{t.price ? ` · ${t.price}` : ''}
                    </option>
                  ))
                : courses.map(c => (
                    <optgroup key={c.id} label={c.shortTitle}>
                      {c.tiers.map(t => (
                        <option key={`${c.id}:${t.id}`} value={tariffFilterValue(c.id, t.id)}>
                          {t.label}{t.price ? ` · ${t.price}` : ''}
                        </option>
                      ))}
                    </optgroup>
                  ))}
            </select>
          </div>
        )}
      </div>

      {summary && (
        <div style={{ marginTop: 10, paddingTop: 10, borderTop: '1px solid var(--border)', fontSize: 11.5, color: 'var(--fg-3)' }}>
          {summary}
        </div>
      )}
    </div>
  );
};

function shortOf(courseId: string) {
  return activeCourses().find(c => c.id === courseId)?.shortTitle || courseId;
}

const axisLabel: React.CSSProperties = {
  fontSize: 9.5, fontWeight: 600, letterSpacing: '0.12em',
  textTransform: 'uppercase', color: 'var(--fg-3)', whiteSpace: 'nowrap',
};
