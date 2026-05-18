// @ts-nocheck
import React, { useEffect, useMemo } from 'react';
import { useParams, useNavigate, Link } from '@/lib/router-compat';
import { motion } from 'framer-motion';
import {
  ChevronLeft, ChevronRight, CheckCircle2, Lock, ClipboardList, ArrowRight,
  Sparkles, Target, Lightbulb,
} from 'lucide-react';
import { MODULES, getModuleTimeline } from '../lib/data';
import { useProgress } from '../hooks/useProgress';
import { ExerciseBlock } from '../components/exercises/ExerciseBlock';
import { useAuthContext } from '../context/AuthContext';
import { getExerciseTemplate } from '../lib/exerciseData';

export const ExercisePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthContext();
  const { isCompleted, isExerciseDone, isModuleLocked } = useProgress();

  // Locate exercise + parent module
  const found = useMemo(() => {
    for (const mod of MODULES) {
      const ex = mod.exercises.find(e => e.id === id);
      if (ex) return { ex, module: mod };
    }
    return null;
  }, [id]);

  // Always-call hooks (avoid conditional hook order before early returns)
  useEffect(() => { window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior }); }, [id]);

  if (!found) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 240 }}>
        <p style={{ color: 'var(--fg-3)' }}>Exercițiul nu a fost găsit.</p>
      </div>
    );
  }

  const { ex, module } = found;

  // Quiz gate
  const quizDone = user ? !!localStorage.getItem(`aa_quiz_done_${user.id}`) : false;
  if (!quizDone) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 400, padding: 24 }}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ maxWidth: 420, textAlign: 'center' }}>
          <div style={{ width: 64, height: 64, borderRadius: 18, background: 'rgba(196,240,228,0.1)', border: '1px solid rgba(196,240,228,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
            <ClipboardList size={28} style={{ color: 'var(--accent)' }} />
          </div>
          <h2 className="font-aboreto" style={{ fontSize: 20, color: 'var(--fg)', marginBottom: 10 }}>Completează formularul de acces</h2>
          <p style={{ fontSize: 14, color: 'var(--fg-3)', lineHeight: 1.65, marginBottom: 24 }}>
            Trebuie să completezi formularul de onboarding înainte de a accesa exercițiile.
          </p>
          <button onClick={() => navigate('/quiz')} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '11px 24px', background: 'var(--accent)', color: '#0D0907', border: 'none', borderRadius: 10, cursor: 'pointer', fontSize: 14, fontWeight: 700 }}>
            Completează acum <ArrowRight size={15} />
          </button>
        </motion.div>
      </div>
    );
  }

  // Module lock
  const moduleIdx = MODULES.findIndex(m => m.id === module.id);
  if (isModuleLocked(moduleIdx)) {
    const unlockDate = module.unlockDate
      ? new Date(module.unlockDate + 'T12:00:00').toLocaleDateString('ro-RO', { weekday: 'long', day: 'numeric', month: 'long' })
      : null;
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 400, padding: 24 }}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ maxWidth: 420, textAlign: 'center' }}>
          <div style={{ width: 64, height: 64, borderRadius: 18, background: 'var(--gold-dim)', border: '1px solid rgba(201,169,110,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
            <Lock size={26} style={{ color: 'var(--gold)' }} />
          </div>
          <h2 className="font-aboreto" style={{ fontSize: 20, color: 'var(--fg)', marginBottom: 10 }}>Modul blocat</h2>
          <p style={{ fontSize: 14, color: 'var(--fg-3)', lineHeight: 1.65, marginBottom: 24 }}>
            {unlockDate
              ? <>Modulul <strong style={{ color: 'var(--fg-2)' }}>{module.title}</strong> se deblochează <strong style={{ color: 'var(--gold)' }}>{unlockDate}</strong>.</>
              : <>Finalizează modulul anterior pentru a debloca <strong style={{ color: 'var(--fg-2)' }}>{module.title}</strong>.</>
            }
          </p>
          <button onClick={() => navigate('/dashboard')} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 20px', background: 'rgba(255,255,255,0.06)', border: '1px solid var(--border)', color: 'var(--fg-2)', borderRadius: 10, cursor: 'pointer', fontSize: 13 }}>
            <ChevronLeft size={14} /> Înapoi la dashboard
          </button>
        </motion.div>
      </div>
    );
  }

  const done = isExerciseDone(ex.id);
  const template = getExerciseTemplate(ex.id);

  // Unified timeline + prev/next
  const timeline = getModuleTimeline(module);
  const myIdx = timeline.findIndex(e => e.kind === 'exercise' && (e.item as any).id === ex.id);
  const myEntry = timeline[myIdx];
  const unifiedNo = myEntry?.lessonNo ?? ex.order_index;
  const totalSteps = timeline.length;
  const completedCount =
    module.lessons.filter(l => isCompleted(l.id)).length +
    module.exercises.filter(e2 => isExerciseDone(e2.id)).length;
  const progressPct = totalSteps > 0 ? Math.round((completedCount / totalSteps) * 100) : 0;

  const prev = myIdx > 0 ? timeline[myIdx - 1] : null;
  const next = myIdx >= 0 && myIdx < timeline.length - 1 ? timeline[myIdx + 1] : null;
  const linkFor = (entry: any) =>
    entry.kind === 'lesson'
      ? `/lesson/${(entry.item as any).id}`
      : `/exercise/${(entry.item as any).id}`;

  const moduleIndex = MODULES.findIndex(m => m.id === module.id);
  const nextModule = moduleIndex < MODULES.length - 1 ? MODULES[moduleIndex + 1] : null;
  const nextModuleLesson = nextModule?.lessons[0] || null;

  const typeMeta: Record<string, { label: string; icon: any }> = {
    checklist: { label: 'Checklist interactiv', icon: CheckCircle2 },
    'form-fields': { label: 'Formular de reflecție', icon: Lightbulb },
    'dynamic-table': { label: 'Tabel dinamic', icon: Target },
    quiz: { label: 'Chestionar', icon: ClipboardList },
    diagnostic: { label: 'Diagnostic personal', icon: Sparkles },
  };
  const meta = template ? (typeMeta[template.type] || { label: 'Exercițiu interactiv', icon: Sparkles }) : { label: 'Exercițiu', icon: Sparkles };
  const MetaIcon = meta.icon;

  return (
    <div style={{ maxWidth: 820, margin: '0 auto', padding: '32px 24px' }}>
      {/* Breadcrumb */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--fg-3)', marginBottom: 12, flexWrap: 'wrap' }}>
        <Link to="/dashboard" style={{ color: 'var(--fg-3)' }}>Dashboard</Link>
        <ChevronRight size={12} />
        <Link to={`/module/${module.id}`} style={{ color: 'var(--fg-3)' }}>{module.title}</Link>
        <ChevronRight size={12} />
        <span style={{ color: 'var(--fg)' }}>Lecția {unifiedNo}</span>
      </div>

      {/* Module progress */}
      <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--fg-3)', marginBottom: 6 }}>
          <span>Lecția {unifiedNo} din {totalSteps} · Modul: {module.title}</span>
          <span style={{ color: progressPct === 100 ? '#4ade80' : 'var(--accent)' }}>{progressPct}%</span>
        </div>
        <div style={{ height: 3, background: 'var(--border)', borderRadius: 2, overflow: 'hidden' }}>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progressPct}%` }}
            transition={{ duration: 0.8, ease: 'easeOut', delay: 0.2 }}
            style={{ height: '100%', background: progressPct === 100 ? '#4ade80' : 'var(--accent)', borderRadius: 2 }}
          />
        </div>
      </motion.div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }} className="lg:flex-row lg:gap-6">
        <div style={{ flex: 1, minWidth: 0 }}>
          {/* Hero card with animated gold gradient */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            style={{
              position: 'relative',
              overflow: 'hidden',
              borderRadius: 16,
              marginBottom: 24,
              padding: 24,
              background: 'var(--bg-card)',
              border: `1px solid ${done ? 'rgba(74,222,128,0.3)' : 'rgba(201,169,110,0.25)'}`,
              boxShadow: 'var(--shadow)',
            }}
          >
            {/* Decorative gradient blob */}
            <motion.div
              aria-hidden
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8 }}
              style={{
                position: 'absolute',
                top: -80, right: -80, width: 240, height: 240,
                borderRadius: '50%',
                background: done
                  ? 'radial-gradient(closest-side, rgba(74,222,128,0.18), transparent 70%)'
                  : 'radial-gradient(closest-side, rgba(201,169,110,0.22), transparent 70%)',
                pointerEvents: 'none',
              }}
            />
            <motion.div
              aria-hidden
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 40, ease: 'linear', repeat: Infinity }}
              style={{
                position: 'absolute',
                bottom: -120, left: -120, width: 280, height: 280,
                borderRadius: '50%',
                background: 'conic-gradient(from 0deg, rgba(196,240,228,0.06), transparent 40%, rgba(201,169,110,0.06), transparent 80%)',
                pointerEvents: 'none',
              }}
            />

            <div style={{ position: 'relative' }}>
              <div style={{ display: 'flex', gap: 8, marginBottom: 14, flexWrap: 'wrap' }}>
                <span style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase',
                  color: done ? '#4ade80' : 'var(--gold)',
                  background: done ? 'rgba(74,222,128,0.12)' : 'var(--gold-dim)',
                  border: `1px solid ${done ? 'rgba(74,222,128,0.3)' : 'rgba(201,169,110,0.25)'}`,
                  padding: '4px 10px', borderRadius: 99,
                }}>
                  <MetaIcon size={12} /> Lecția {unifiedNo} · Exercițiu practic
                </span>
                <span style={{ fontSize: 11, color: 'var(--fg-3)', background: 'var(--bg-3)', border: '1px solid var(--border)', padding: '4px 10px', borderRadius: 99 }}>
                  {meta.label}
                </span>
                {done && (
                  <span style={{ fontSize: 11, color: '#4ade80', background: 'rgba(74,222,128,0.12)', border: '1px solid rgba(74,222,128,0.25)', padding: '4px 10px', borderRadius: 99, fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                    <CheckCircle2 size={12} /> Finalizat
                  </span>
                )}
              </div>

              <h1 className="font-aboreto" style={{ fontSize: 'clamp(1.5rem,3.2vw,2.1rem)', color: 'var(--fg)', lineHeight: 1.15, marginBottom: 12 }}>
                {ex.title}
              </h1>
              <p style={{ fontSize: 14, color: 'var(--fg-2)', lineHeight: 1.75 }}>{ex.description}</p>

              {template?.instructions && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  style={{
                    marginTop: 18,
                    display: 'flex', alignItems: 'flex-start', gap: 10,
                    padding: '12px 14px',
                    background: 'rgba(196,240,228,0.05)',
                    border: '1px solid rgba(196,240,228,0.15)',
                    borderRadius: 10,
                  }}
                >
                  <Lightbulb size={15} style={{ color: 'var(--accent)', flexShrink: 0, marginTop: 2 }} />
                  <p style={{ fontSize: 12.5, color: 'var(--fg-2)', lineHeight: 1.65, margin: 0 }}>
                    {template.instructions}
                  </p>
                </motion.div>
              )}
            </div>
          </motion.div>

          {/* Exercise body */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              borderRadius: 14,
              padding: 20,
              marginBottom: 24,
            }}
          >
            <ExerciseBlock exerciseId={ex.id} />
          </motion.div>

          {/* Navigation */}
          <div style={{ display: 'flex', alignItems: 'stretch', justifyContent: 'space-between', gap: 12, paddingTop: 20, borderTop: '1px solid var(--border)' }}>
            <div style={{ flex: 1 }}>
              {prev ? (
                <button
                  onClick={() => navigate(linkFor(prev))}
                  style={{
                    width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                    padding: '12px 14px', background: 'var(--bg-card)', border: '1px solid var(--border)',
                    borderRadius: 10, cursor: 'pointer', textAlign: 'left',
                  }}
                >
                  <ChevronLeft size={16} style={{ color: 'var(--fg-3)', flexShrink: 0 }} />
                  <span>
                    <div style={{ fontSize: 10, color: 'var(--fg-3)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 2 }}>Anterior · Lecția {prev.lessonNo}</div>
                    <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--fg)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 200 }}>{(prev.item as any).title}</div>
                  </span>
                </button>
              ) : (
                <button
                  onClick={() => navigate(`/module/${module.id}`)}
                  style={{
                    width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                    padding: '12px 14px', background: 'var(--bg-card)', border: '1px solid var(--border)',
                    borderRadius: 10, cursor: 'pointer',
                  }}
                >
                  <ChevronLeft size={16} style={{ color: 'var(--fg-3)' }} />
                  <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--fg-2)' }}>Înapoi la modul</span>
                </button>
              )}
            </div>

            <div style={{ flex: 1 }}>
              {next ? (
                <button
                  onClick={() => navigate(linkFor(next))}
                  style={{
                    width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 10,
                    padding: '12px 14px', background: 'var(--bg-card)', border: '1px solid var(--border)',
                    borderRadius: 10, cursor: 'pointer', textAlign: 'right',
                  }}
                >
                  <span>
                    <div style={{ fontSize: 10, color: 'var(--fg-3)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 2 }}>Următor · Lecția {next.lessonNo}</div>
                    <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--fg)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 200 }}>{(next.item as any).title}</div>
                  </span>
                  <ChevronRight size={16} style={{ color: 'var(--fg-3)', flexShrink: 0 }} />
                </button>
              ) : nextModuleLesson ? (
                <button
                  onClick={() => navigate(`/lesson/${nextModuleLesson.id}`)}
                  style={{
                    width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 10,
                    padding: '12px 14px', background: 'var(--accent-dim)', border: '1px solid rgba(196,240,228,0.2)',
                    borderRadius: 10, cursor: 'pointer', textAlign: 'right',
                  }}
                >
                  <span>
                    <div style={{ fontSize: 10, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 2 }}>Modul următor</div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--fg)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 200 }}>{nextModule?.title}</div>
                  </span>
                  <ChevronRight size={16} style={{ color: 'var(--accent)', flexShrink: 0 }} />
                </button>
              ) : null}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="hidden lg:block" style={{ width: 220, flexShrink: 0 }}>
          <div style={{
            background: 'var(--bg-card)', border: '1px solid var(--border)',
            borderRadius: 14, padding: 16, position: 'sticky', top: 72,
          }}>
            <div className="font-aboreto" style={{ fontSize: 9, letterSpacing: '0.12em', color: 'var(--fg-3)', textTransform: 'uppercase', marginBottom: 12 }}>
              {module.etapa} · {module.title}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {timeline.map(entry => {
                const item: any = entry.item;
                const isExercise = entry.kind === 'exercise';
                const isActive = isExercise && item.id === ex.id;
                const isDone = isExercise ? isExerciseDone(item.id) : isCompleted(item.id);
                const to = isExercise ? `/exercise/${item.id}` : `/lesson/${item.id}`;
                return (
                  <button
                    key={item.id}
                    onClick={() => navigate(to)}
                    title={isExercise ? 'Exercițiu practic' : 'Lecție video'}
                    style={{
                      width: '100%', display: 'flex', alignItems: 'center', gap: 8,
                      padding: '7px 10px', borderRadius: 8, cursor: 'pointer', textAlign: 'left',
                      background: isActive ? 'var(--gold-dim)' : 'transparent',
                      border: isActive ? '1px solid rgba(201,169,110,0.3)' : '1px solid transparent',
                      transition: 'background 0.15s',
                    }}
                    onMouseEnter={e => { if (!isActive) (e.currentTarget as HTMLButtonElement).style.background = 'var(--bg-3)'; }}
                    onMouseLeave={e => { if (!isActive) (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; }}
                  >
                    <div style={{ flexShrink: 0 }}>
                      {isDone
                        ? <CheckCircle2 size={13} style={{ color: '#4ade80' }} />
                        : isExercise
                        ? <div style={{ width: 13, height: 13, borderRadius: '50%', border: `1.5px solid var(--gold)`, background: 'var(--gold-dim)' }} />
                        : <div style={{ width: 13, height: 13, borderRadius: '50%', border: `1.5px solid ${isActive ? 'var(--accent)' : 'var(--border)'}` }} />
                      }
                    </div>
                    <span style={{ fontSize: 11, color: isActive ? 'var(--fg)' : 'var(--fg-3)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {entry.lessonNo}. {item.title}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
