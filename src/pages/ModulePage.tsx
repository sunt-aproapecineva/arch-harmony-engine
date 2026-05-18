import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Play, Lock, Clock, FileText, ChevronDown, CheckCircle2, Award, ChevronRight, Star, Pencil,
} from 'lucide-react';
import { MODULES } from '../lib/data';
import { useProgress } from '../hooks/useProgress';
import { QuizRequiredModal } from '../components/ui/QuizRequiredModal';
import { useAuthContext } from '../context/AuthContext';

export const ModulePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthContext();
  const { getModuleProgress, isModuleLocked, isCompleted } = useProgress();
  const quizDone = user
    ? !!localStorage.getItem(`aa_quiz_done_${user.id}`)
    : false;
  const [quizModalOpen, setQuizModalOpen] = useState(false);

  const module = MODULES.find(m => m.id === id);
  const moduleIndex = MODULES.findIndex(m => m.id === id);

  if (!module) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 240 }}>
        <p style={{ color: 'var(--fg-3)' }}>Modulul nu a fost găsit.</p>
      </div>
    );
  }

  const locked = isModuleLocked(moduleIndex);
  const progress = getModuleProgress(module.id);
  const done = progress === 100;

  const statusColor = done ? '#4ade80' : 'var(--accent)';

  // All lessons (video + exercise) + deliverable
  const timelineItems = [
    ...module.lessons.map((lesson, idx) => ({ type: 'lesson' as const, item: lesson, idx })),
    { type: 'deliverable' as const, item: null as null, idx: 0 },
  ];

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '32px 24px' }}>
      {/* Breadcrumb */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--fg-3)', marginBottom: 24 }}>
        <Link to="/dashboard" style={{ color: 'var(--fg-3)', transition: 'color 0.15s' }}
          onMouseEnter={e => (e.currentTarget.style.color = 'var(--fg)')}
          onMouseLeave={e => (e.currentTarget.style.color = 'var(--fg-3)')}
        >
          Dashboard
        </Link>
        <ChevronRight size={12} />
        <span style={{ color: 'var(--fg)' }}>{module.title}</span>
      </div>

      {/* Module header */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        style={{
          background: 'var(--bg-card)', border: `1px solid ${done ? 'rgba(74,222,128,0.3)' : 'var(--border)'}`,
          borderRadius: 16, padding: 24, marginBottom: 32,
        }}
      >
        {/* Badges */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 14, flexWrap: 'wrap' }}>
          <span style={{
            fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase',
            color: statusColor, background: `${statusColor}18`, border: `1px solid ${statusColor}30`,
            padding: '3px 10px', borderRadius: 99,
          }}>
            {module.etapa}
          </span>
          <span style={{
            fontSize: 11, color: 'var(--fg-3)', background: 'var(--bg-3)', border: '1px solid var(--border)',
            padding: '3px 10px', borderRadius: 99,
          }}>
            {module.saptamana}
          </span>
          {locked && (
            <span style={{
              fontSize: 11, color: 'var(--gold)', background: 'var(--gold-dim)', border: '1px solid rgba(201,169,110,0.2)',
              padding: '3px 10px', borderRadius: 99,
            }}>
              Blocat
            </span>
          )}
        </div>

        <h1 className="font-aboreto" style={{ fontSize: 'clamp(1.6rem,3.5vw,2.4rem)', color: 'var(--fg)', lineHeight: 1.1, marginBottom: 6 }}>
          {module.title}
        </h1>
        <p style={{ fontSize: 14, fontWeight: 500, color: 'var(--gold)', marginBottom: 10 }}>{module.subtitle}</p>
        <p style={{ fontSize: 14, color: 'var(--fg-3)', lineHeight: 1.7, marginBottom: 20 }}>{module.description}</p>

        {/* Progress bar */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--fg-3)', marginBottom: 6 }}>
            <span>{done ? 'Modul finalizat' : `${progress}% completat`}</span>
            <span>{module.lessons.filter(l => isCompleted(l.id)).length}/{module.lessons.length} lecții + exerciții</span>
          </div>
          <div style={{ height: 4, background: 'var(--border)', borderRadius: 2, overflow: 'hidden' }}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              style={{ height: '100%', background: done ? '#4ade80' : 'var(--accent)', borderRadius: 2 }}
            />
          </div>
        </div>

        {/* CTA */}
        {!locked && module.lessons.length > 0 && (
          <div style={{ marginTop: 20 }}>
            <button
              onClick={() => navigate(`/lesson/${module.lessons[0].id}`)}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                padding: '10px 22px', background: 'var(--accent)', color: '#0D0907',
                border: 'none', borderRadius: 10, cursor: 'pointer', fontSize: 13, fontWeight: 700,
                transition: 'filter 0.15s',
              }}
              onMouseEnter={e => (e.currentTarget.style.filter = 'brightness(1.07)')}
              onMouseLeave={e => (e.currentTarget.style.filter = '')}
            >
              <Play size={14} />
              {isCompleted(module.lessons[0].id) ? 'Revedea prima lecție' : 'Începe prima lecție'}
            </button>
          </div>
        )}
      </motion.div>

      {/* Vertical Timeline — Feature 5 */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        style={{ marginBottom: 24 }}
      >
        <div className="font-aboreto" style={{ fontSize: 10, letterSpacing: '0.12em', color: 'var(--fg-3)', textTransform: 'uppercase', marginBottom: 20 }}>
          Conținut modul
        </div>

        <div style={{ position: 'relative' }}>
          {/* Vertical line */}
          <div style={{
            position: 'absolute', left: 16, top: 8, bottom: 8,
            width: 2, background: 'var(--border)', borderRadius: 1,
          }} />

          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {timelineItems.map((entry, itemIdx) => {
              const delay = itemIdx * 0.06 + 0.1;

              if (entry.type === 'deliverable') {
                return (
                  <motion.div
                    key="deliverable"
                    initial={{ opacity: 0, x: -16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay }}
                    style={{ display: 'flex', alignItems: 'flex-start', gap: 16, paddingBottom: 0 }}
                  >
                    {/* Star node */}
                    <div style={{ position: 'relative', flexShrink: 0, zIndex: 1 }}>
                      <div style={{
                        width: 32, height: 32, borderRadius: '50%',
                        background: 'var(--gold-dim)', border: '2px solid var(--gold)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: '0 0 12px rgba(201,169,110,0.3)',
                      }}>
                        <Star size={14} style={{ color: 'var(--gold)' }} />
                      </div>
                    </div>
                    {/* Deliverable card */}
                    <div style={{
                      flex: 1, marginBottom: 4, padding: '14px 18px',
                      background: 'var(--bg-card)',
                      border: '1px solid rgba(201,169,110,0.25)',
                      borderLeft: '3px solid var(--gold)',
                      borderRadius: 12,
                    }}>
                      <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: 6 }}>
                        Livrabilul etapei
                      </div>
                      <p style={{ fontSize: 13, color: 'var(--fg)', lineHeight: 1.6 }}>{module.deliverable}</p>
                    </div>
                  </motion.div>
                );
              }

              if (entry.type === 'lesson') {
                const lesson = entry.item;
                const isExLesson = lesson.type === 'exercise';
                const lessonDone = isCompleted(lesson.id);
                const isCurrentLesson = !lessonDone && module.lessons.slice(0, entry.idx).every(l => isCompleted(l.id));
                const accentCol = isExLesson ? 'var(--gold)' : 'var(--accent)';
                const nodeColor = lessonDone ? '#4ade80' : isCurrentLesson ? accentCol : 'var(--border)';
                const nodeBg = lessonDone ? 'rgba(74,222,128,0.15)' : isCurrentLesson ? (isExLesson ? 'var(--gold-dim)' : 'var(--accent-dim)') : 'var(--bg-3)';
                const borderColor = lessonDone ? 'rgba(74,222,128,0.2)' : isCurrentLesson ? (isExLesson ? 'rgba(201,169,110,0.25)' : 'rgba(196,240,228,0.2)') : 'var(--border)';

                return (
                  <motion.div key={lesson.id} initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay }}
                    style={{ display: 'flex', alignItems: 'flex-start', gap: 16, paddingBottom: 16 }}>
                    {/* Node */}
                    <div style={{ position: 'relative', flexShrink: 0, zIndex: 1 }}>
                      <div style={{ width: 32, height: 32, borderRadius: isExLesson ? 8 : '50%', background: nodeBg, border: `2px solid ${nodeColor}`, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s', boxShadow: isCurrentLesson ? `0 0 10px ${isExLesson ? 'rgba(201,169,110,0.25)' : 'rgba(196,240,228,0.2)'}` : 'none' }}>
                        {locked
                          ? <Lock size={12} style={{ color: 'var(--fg-3)' }} />
                          : lessonDone
                          ? <CheckCircle2 size={14} style={{ color: '#4ade80' }} />
                          : isExLesson
                          ? <Pencil size={12} style={{ color: isCurrentLesson ? 'var(--gold)' : 'var(--fg-3)' }} />
                          : <Play size={12} style={{ color: isCurrentLesson ? 'var(--accent)' : 'var(--fg-3)', marginLeft: 2 }} />}
                      </div>
                    </div>

                    {/* Card */}
                    <div onClick={() => {
                        if (locked) return;
                        if (!quizDone) { setQuizModalOpen(true); return; }
                        navigate(`/lesson/${lesson.id}`);
                      }}
                      style={{ flex: 1, marginBottom: 0, padding: '11px 16px', background: 'var(--bg-card)', border: `1px solid ${borderColor}`, borderRadius: 12, cursor: locked ? 'not-allowed' : 'pointer', opacity: locked ? 0.5 : 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, transition: 'border-color 0.15s, background 0.15s' }}
                      onMouseEnter={e => { if (!locked) { (e.currentTarget as HTMLDivElement).style.borderColor = isExLesson ? 'rgba(201,169,110,0.35)' : 'rgba(196,240,228,0.3)'; (e.currentTarget as HTMLDivElement).style.background = 'var(--bg-3)'; }}}
                      onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.borderColor = borderColor; (e.currentTarget as HTMLDivElement).style.background = 'var(--bg-card)'; }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                          <span style={{ fontSize: 10, color: isExLesson ? 'var(--gold)' : 'var(--fg-3)', fontWeight: isExLesson ? 700 : 400 }}>
                            {isExLesson ? `✦ Exercițiu practic` : `Lecția ${lesson.order_index}`}
                          </span>
                        </div>
                        <div style={{ fontSize: 13, fontWeight: 500, color: lessonDone ? 'var(--fg-2)' : 'var(--fg)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {lesson.title}
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: 'var(--fg-3)' }}>
                          <Clock size={11} />{lesson.duration_min}min
                        </div>
                        {isExLesson && (
                          <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--gold)', background: 'var(--gold-dim)', border: '1px solid rgba(201,169,110,0.2)', padding: '2px 6px', borderRadius: 4 }}>
                            Interactiv
                          </div>
                        )}
                        {lesson.pdf_url && !isExLesson && (
                          <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--accent)', background: 'var(--accent-dim)', border: '1px solid rgba(196,240,228,0.2)', padding: '2px 6px', borderRadius: 4 }}>PDF</div>
                        )}
                        {lessonDone
                          ? <CheckCircle2 size={15} style={{ color: '#4ade80' }} />
                          : locked ? <Lock size={13} style={{ color: 'var(--fg-3)' }} />
                          : isExLesson
                          ? <Pencil size={13} style={{ color: isCurrentLesson ? 'var(--gold)' : 'var(--border)' }} />
                          : <Play size={13} style={{ color: isCurrentLesson ? 'var(--accent)' : 'var(--border)' }} />}
                      </div>
                    </div>
                  </motion.div>
                );
              }

              return null;
            })}
          </div>
        </div>
      </motion.div>

      <QuizRequiredModal open={quizModalOpen} onClose={() => setQuizModalOpen(false)} />
    </div>
  );
};
