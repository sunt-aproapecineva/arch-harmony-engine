// @ts-nocheck
// Panoul de cohortă — ce vede mentorul înainte de apelul săptămânal de grup.
//
// Cockpitul existent răspunde la „cum stă elevul X". Înaintea unui apel de grup,
// întrebarea e alta: „unde e toată lumea și cu cine trebuie să vorbesc azi".
//
// Nu cere niciun tabel nou. Totul se derivă din ce există deja: profilul calculat la
// quiz (segment, stadiu de validare, semnale de risc), rândurile din `progress` și
// structura cursului din cod.
import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, Users, ArrowRight, Clock, ShieldCheck } from 'lucide-react';
import { useNavigate } from '@/lib/router-compat';
import { supabase } from '@/integrations/supabase/client';
import { useAdminCourseScope } from '../../hooks/useAdminCourseScope';
import { getCourseModules } from '../../lib/content';

interface Row {
  id: string;
  name: string;
  email: string;
  profile: any;
  answers: any;
  quizDone: boolean;
  currentModule: any | null;
  moduleIdx: number;
  gateDelivered: boolean | null;
  deliverablesDone: number;
  lastActivity: string | null;
}

function isTrackable(l: any) {
  return l?.type === 'exercise' || !!(l?.video_url && String(l.video_url).trim());
}

export const AdminCohort: React.FC = () => {
  const { course, courseId } = useAdminCourseScope();
  const navigate = useNavigate();
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'toti' | 'semnale' | 'inainte-de-poarta' | 'fara-quiz'>('toti');

  const modules = useMemo(() => getCourseModules(courseId), [courseId]);
  const gateModule = useMemo(() => modules.find((m: any) => m.isGate) || null, [modules]);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const [profilesRes, rolesRes, quizRes, progressRes, enrollRes, activityRes] = await Promise.all([
        supabase.from('profiles').select('id,email,full_name'),
        supabase.from('user_roles').select('user_id,role'),
        supabase.from('quiz_responses').select('user_id,answers,profile,completed_at,course_id'),
        supabase.from('progress').select('user_id,lesson_id,completed_at').limit(10000),
        supabase.from('enrollments').select('user_id,course_id'),
        supabase.from('activity_log').select('user_id,created_at').order('created_at', { ascending: false }).limit(3000),
      ]);

      const adminIds = new Set((rolesRes.data || []).filter((r: any) => r.role === 'admin').map((r: any) => r.user_id));
      // Fără tabelul de înscrieri (migrație neaplicată) considerăm toți elevii ca fiind
      // în cursul privit — comportamentul de dinainte de multicurs.
      const enrolled = enrollRes.data
        ? new Set(enrollRes.data.filter((e: any) => e.course_id === courseId).map((e: any) => e.user_id))
        : null;

      const quizByUser: Record<string, any> = {};
      (quizRes.data || []).forEach((q: any) => {
        if ((q.course_id || 'business') !== courseId) return;
        quizByUser[q.user_id] = q;
      });

      const doneByUser: Record<string, Set<string>> = {};
      (progressRes.data || []).forEach((p: any) => {
        (doneByUser[p.user_id] ||= new Set()).add(p.lesson_id);
      });

      const lastActivityBy: Record<string, string> = {};
      (activityRes.data || []).forEach((a: any) => {
        if (!lastActivityBy[a.user_id]) lastActivityBy[a.user_id] = a.created_at;
      });

      const gateLessons = gateModule ? (gateModule.lessons || []).filter((l: any) => l.type === 'exercise') : [];
      const allDeliverables = modules.flatMap((m: any) => (m.lessons || []).filter((l: any) => l.type === 'exercise'));

      const built: Row[] = (profilesRes.data || [])
        .filter((p: any) => !adminIds.has(p.id))
        .filter((p: any) => (enrolled ? enrolled.has(p.id) : true))
        .map((p: any) => {
          const done = doneByUser[p.id] || new Set();
          // Modulul curent = primul cu elemente trackabile nefinalizate.
          let moduleIdx = modules.length - 1;
          for (let i = 0; i < modules.length; i++) {
            const items = (modules[i].lessons || []).filter(isTrackable);
            if (items.length === 0) continue;
            if (!items.every((l: any) => done.has(l.id))) { moduleIdx = i; break; }
          }
          return {
            id: p.id,
            name: p.full_name || p.email,
            email: p.email,
            profile: quizByUser[p.id]?.profile || null,
            answers: quizByUser[p.id]?.answers || null,
            quizDone: !!quizByUser[p.id]?.completed_at,
            currentModule: modules[moduleIdx] || null,
            moduleIdx,
            gateDelivered: gateLessons.length
              ? gateLessons.every((l: any) => done.has(l.id))
              : null,
            deliverablesDone: allDeliverables.filter((l: any) => done.has(l.id)).length,
            lastActivity: lastActivityBy[p.id] || null,
          };
        });

      setRows(built);
      setLoading(false);
    })();
  }, [courseId, modules, gateModule]);

  const filtered = rows.filter(r => {
    if (filter === 'semnale') return (r.profile?.riskFlags || []).length > 0;
    if (filter === 'fara-quiz') return !r.quizDone;
    if (filter === 'inainte-de-poarta') return r.gateDelivered === false;
    return true;
  });

  const stats = useMemo(() => ({
    total: rows.length,
    faraQuiz: rows.filter(r => !r.quizDone).length,
    inainteDePoarta: rows.filter(r => r.gateDelivered === false).length,
    cuSemnale: rows.filter(r => (r.profile?.riskFlags || []).length > 0).length,
  }), [rows]);

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '28px 24px 60px' }}>
      <div style={{ marginBottom: 22 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
          <Users size={16} style={{ color: 'var(--gold)' }} />
          <h1 className="font-aboreto" style={{ fontSize: 18, color: 'var(--fg)' }}>Cohorta</h1>
          {course && (
            <span style={{ fontSize: 11, color: 'var(--fg-3)', padding: '2px 8px', borderRadius: 99, border: '1px solid var(--border)' }}>
              {course.shortTitle}
            </span>
          )}
        </div>
        <p style={{ fontSize: 12.5, color: 'var(--fg-3)', lineHeight: 1.6, maxWidth: 620 }}>
          Unde e fiecare înainte de apelul de grup. Semnalele vin din diagnosticul completat la
          intrare, progresul din lecțiile bifate — nimic nu cere raportare suplimentară de la elev.
        </p>
      </div>

      {/* Sumar de pregătire a apelului */}
      <div style={{ display: 'grid', gap: 10, gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', marginBottom: 20 }}>
        {[
          { label: 'În cohortă', value: stats.total, tone: 'var(--fg)' },
          { label: 'Fără diagnostic', value: stats.faraQuiz, tone: stats.faraQuiz ? 'var(--warn)' : 'var(--fg-3)' },
          { label: gateModule ? `Înainte de ${gateModule.etapa}` : 'Fără poartă', value: gateModule ? stats.inainteDePoarta : '—', tone: stats.inainteDePoarta ? 'var(--warn-strong)' : 'var(--fg-3)' },
          { label: 'Cu semnale de atenție', value: stats.cuSemnale, tone: stats.cuSemnale ? 'var(--error)' : 'var(--fg-3)' },
        ].map(s => (
          <div key={s.label} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: '14px 16px' }}>
            <div className="font-aboreto" style={{ fontSize: 22, color: s.tone, lineHeight: 1 }}>{s.value}</div>
            <div style={{ fontSize: 11, color: 'var(--fg-3)', marginTop: 6 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filtre */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 14, flexWrap: 'wrap' }}>
        {[
          ['toti', 'Toți'],
          ['semnale', 'Cu semnale'],
          ['inainte-de-poarta', gateModule ? `Blocați înainte de ${gateModule.etapa}` : 'Înainte de poartă'],
          ['fara-quiz', 'Fără diagnostic'],
        ].map(([key, label]) => (
          <button
            key={key}
            onClick={() => setFilter(key as any)}
            style={{
              padding: '5px 12px', borderRadius: 8, fontSize: 12, cursor: 'pointer',
              background: filter === key ? 'var(--gold-dim)' : 'transparent',
              color: filter === key ? 'var(--gold)' : 'var(--fg-3)',
              border: `1px solid ${filter === key ? 'var(--border-hi)' : 'var(--border)'}`,
              fontWeight: filter === key ? 600 : 400,
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ padding: 40, textAlign: 'center', color: 'var(--fg-3)', fontSize: 13 }}>Se încarcă cohorta…</div>
      ) : filtered.length === 0 ? (
        <div style={{ padding: 40, textAlign: 'center', color: 'var(--fg-3)', fontSize: 13 }}>Nimeni în filtrul ăsta.</div>
      ) : (
        <div style={{ display: 'grid', gap: 10 }}>
          {filtered.map((r, i) => (
            <motion.div
              key={r.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.22, delay: Math.min(i, 12) * 0.02 }}
              style={{
                background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12,
                padding: '14px 16px', display: 'grid',
                gridTemplateColumns: 'minmax(160px,1.4fr) minmax(140px,1fr) minmax(150px,1fr) auto',
                gap: 14, alignItems: 'center',
              }}
            >
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--fg)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {r.name}
                </div>
                <div style={{ fontSize: 11, color: 'var(--fg-3)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {r.profile?.segmentLabel || r.profile?.maturityLabel || (r.quizDone ? 'Profil necalculat' : 'Nu a dat diagnosticul')}
                </div>
              </div>

              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 11, color: 'var(--fg-3)', marginBottom: 3 }}>Unde e</div>
                <div style={{ fontSize: 12.5, color: 'var(--fg-2)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {r.currentModule ? `${r.currentModule.etapa} · ${r.currentModule.title}` : '—'}
                </div>
              </div>

              <div style={{ minWidth: 0, display: 'flex', flexDirection: 'column', gap: 4 }}>
                {r.profile?.validationLabel && (
                  <span style={{ fontSize: 11.5, color: r.gateDelivered ? 'var(--ok)' : 'var(--warn)' }}>
                    {r.profile.validationLabel}
                  </span>
                )}
                <span style={{ fontSize: 11, color: 'var(--fg-3)', display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                  <ShieldCheck size={11} /> {r.deliverablesDone} livrabile
                  {typeof r.profile?.hoursPerWeek === 'number' && (
                    <><span style={{ opacity: 0.4 }}>·</span><Clock size={11} /> {r.profile.hoursPerWeek}h/săpt</>
                  )}
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 10, justifySelf: 'end' }}>
                {(r.profile?.riskFlags || []).length > 0 && (
                  <span
                    title={(r.profile.riskFlags || []).join(' · ')}
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 11, fontWeight: 600,
                      padding: '3px 9px', borderRadius: 99,
                      background: 'var(--error-dim)', color: 'var(--error)', border: '1px solid var(--border)',
                    }}
                  >
                    <AlertTriangle size={11} /> {r.profile.riskFlags.length}
                  </span>
                )}
                <button
                  onClick={() => navigate(`/admin/student/${r.id}?curs=${courseId}`)}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: 5, padding: '5px 11px',
                    borderRadius: 8, cursor: 'pointer', fontSize: 11.5, fontWeight: 600,
                    background: 'transparent', color: 'var(--accent)', border: '1px solid var(--border)',
                  }}
                >
                  Briefing <ArrowRight size={12} />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Briefingul textual, pentru cei cu profil calculat — de citit înainte de apel. */}
      {!loading && filtered.some(r => r.profile?.mentorBriefing) && (
        <div style={{ marginTop: 28 }}>
          <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--fg-3)', marginBottom: 10 }}>
            De citit înainte de apel
          </div>
          <div style={{ display: 'grid', gap: 8 }}>
            {filtered.filter(r => r.profile?.mentorBriefing).map(r => (
              <div key={r.id} style={{ background: 'var(--bg-3)', border: '1px solid var(--border)', borderRadius: 10, padding: '12px 14px' }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--fg)', marginBottom: 5 }}>{r.name}</div>
                <p style={{ fontSize: 12, color: 'var(--fg-2)', lineHeight: 1.65, margin: 0 }}>{r.profile.mentorBriefing}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
