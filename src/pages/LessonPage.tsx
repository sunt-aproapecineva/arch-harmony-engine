// @ts-nocheck
import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate, Link } from '@/lib/router-compat';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft, ChevronRight, CheckCircle2, FileText, Play, ExternalLink, ChevronDown,
  Lock, ClipboardList, ArrowRight,
} from 'lucide-react';
import { MODULES, getModuleTimeline } from '../lib/data';
import { Lesson, Module } from '../lib/types';
import { useProgress } from '../hooks/useProgress';
import { Confetti } from '../components/aa/Confetti';
import { useAuthContext } from '../context/AuthContext';
import { logActivity } from '../lib/activity';
import { supabase } from '@/integrations/supabase/client';

function getYouTubeId(url: string): string | null {
  if (!url) return null;
  const patterns = [
    /youtu\.be\/([^?&]+)/,
    /youtube\.com\/watch\?v=([^&]+)/,
    /youtube\.com\/embed\/([^?&]+)/,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

export const LessonPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { markComplete, isCompleted, isModuleLocked, isExerciseDone } = useProgress();
  const { user } = useAuthContext();
  const [completing, setCompleting] = useState(false);
  const [justCompleted, setJustCompleted] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const completeButtonRef = useRef<HTMLDivElement>(null);

  // Notes — stored in DB (lesson_notes); admins can read all
  const NOTES_KEY = `aa_note_${user?.id ?? 'anon'}_${id}`;
  const [note, setNote] = useState(() => localStorage.getItem(NOTES_KEY) || '');
  const [saved, setSaved] = useState(false);
  const [notesOpen, setNotesOpen] = useState(false);

  // Load existing note from DB on mount
  useEffect(() => {
    if (!user?.id || !id) return;
    supabase
      .from('lesson_notes')
      .select('content')
      .eq('user_id', user.id)
      .eq('lesson_id', id)
      .maybeSingle()
      .then(({ data }) => {
        if (data?.content) {
          setNote(data.content);
          try { localStorage.setItem(NOTES_KEY, data.content); } catch {}
        }
      });
  }, [user?.id, id]);

  const saveNote = async () => {
    try { localStorage.setItem(NOTES_KEY, note); } catch {}
    if (user?.id && id) {
      await supabase
        .from('lesson_notes')
        .upsert({ user_id: user.id, lesson_id: id, content: note }, { onConflict: 'user_id,lesson_id' });
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    if (user && lesson) {
      logActivity({
        userId: user.id,
        userEmail: user.email,
        userName: user.full_name,
        type: 'note_saved',
        label: `${user.full_name} a salvat o notiță la "${lesson.title}"`,
        data: { lessonId: lesson.id, noteLength: String(note.length) },
      });
    }
  };

  let lesson: Lesson | null = null;
  let module: Module | null = null;
  let lessonIndex = -1;

  for (const mod of MODULES) {
    const idx = mod.lessons.findIndex(l => l.id === id);
    if (idx !== -1) {
      lesson = mod.lessons[idx];
      module = mod;
      lessonIndex = idx;
      break;
    }
  }

  if (!lesson || !module) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 240 }}>
        <p style={{ color: 'var(--fg-3)' }}>Lecția nu a fost găsită.</p>
      </div>
    );
  }

  // ── QUIZ LOCK ──
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
            Trebuie să completezi formularul de onboarding înainte de a accesa lecțiile.
          </p>
          <button onClick={() => navigate('/quiz')} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '11px 24px', background: 'var(--accent)', color: '#0D0907', border: 'none', borderRadius: 10, cursor: 'pointer', fontSize: 14, fontWeight: 700 }}>
            Completează acum <ArrowRight size={15} />
          </button>
        </motion.div>
      </div>
    );
  }

  // ── MODULE DATE/PROGRESS LOCK ──
  const moduleIdx = MODULES.findIndex(m => m.id === module!.id);
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

  const done = isCompleted(lesson.id);
  const moduleIndex = MODULES.findIndex(m => m.id === module!.id);
  const nextModule = moduleIndex < MODULES.length - 1 ? MODULES[moduleIndex + 1] : null;
  const nextModuleLesson = nextModule?.lessons[0] || null;
  const youtubeId = getYouTubeId(lesson.video_url);

  // Unified module timeline — lessons & exercises counted together.
  const timeline = getModuleTimeline(module);
  const myTimelineIdx = timeline.findIndex(e => e.kind === 'lesson' && (e.item as any).id === lesson.id);
  const myEntry = timeline[myTimelineIdx];
  const unifiedNo = myEntry?.lessonNo ?? lesson.order_index;
  const totalSteps = timeline.length;

  // prev/next derived from unified timeline (lesson <-> exercise flow)
  const prevEntry = myTimelineIdx > 0 ? timeline[myTimelineIdx - 1] : null;
  const nextEntry = myTimelineIdx >= 0 && myTimelineIdx < timeline.length - 1 ? timeline[myTimelineIdx + 1] : null;
  const linkForEntry = (e: any) =>
    e.kind === 'lesson' ? `/lesson/${(e.item as any).id}` : `/exercise/${(e.item as any).id}`;

  // Combined progress (lessons + exercises)
  const completedCount =
    module.lessons.filter(l => isCompleted(l.id)).length +
    module.exercises.filter(e => isExerciseDone(e.id)).length;
  const totalCount = totalSteps;
  const progressPct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const handleMarkComplete = async () => {
    if (done || completing) return;
    setCompleting(true);
    await markComplete(lesson!.id);
    setJustCompleted(true);
    setCompleting(false);
    setShowConfetti(true);
    if (user && lesson) {
      logActivity({
        userId: user.id,
        userEmail: user.email,
        userName: user.full_name,
        type: 'lesson_complete',
        label: `${user.full_name} a finalizat lecția "${lesson.title}"`,
        data: { lessonId: lesson.id, lessonTitle: lesson.title, moduleId: lesson.module_id },
      });
    }
  };

  return (
    <div style={{ maxWidth: 820, margin: '0 auto', padding: '32px 24px' }}>
      {/* Breadcrumb */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--fg-3)', marginBottom: 12, flexWrap: 'wrap' }}>
        <Link to="/dashboard"
          style={{ color: 'var(--fg-3)', transition: 'color 0.15s' }}
          onMouseEnter={e => (e.currentTarget.style.color = 'var(--fg)')}
          onMouseLeave={e => (e.currentTarget.style.color = 'var(--fg-3)')}
        >
          Dashboard
        </Link>
        <ChevronRight size={12} />
        <Link
          to={`/module/${module.id}`}
          style={{ color: 'var(--fg-3)', transition: 'color 0.15s' }}
          onMouseEnter={e => (e.currentTarget.style.color = 'var(--fg)')}
          onMouseLeave={e => (e.currentTarget.style.color = 'var(--fg-3)')}
        >
          {module.title}
        </Link>
        <ChevronRight size={12} />
        <span style={{ color: 'var(--fg)' }}>Lecția {unifiedNo}</span>
      </div>

      {/* Module progress bar — Feature 3 */}
      <motion.div
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        style={{ marginBottom: 24 }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--fg-3)', marginBottom: 6 }}>
          <span>Lecția {unifiedNo} din {totalCount} · Modul: {module.title}</span>
          <span style={{ color: progressPct === 100 ? '#4ade80' : 'var(--accent)' }}>{progressPct}%</span>
        </div>
        <div style={{ height: 3, background: 'var(--border)', borderRadius: 2, overflow: 'hidden' }}>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progressPct}%` }}
            transition={{ duration: 0.8, ease: 'easeOut', delay: 0.2 }}
            style={{
              height: '100%',
              background: progressPct === 100 ? '#4ade80' : 'var(--accent)',
              borderRadius: 2,
            }}
          />
        </div>
      </motion.div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }} className="lg:flex-row lg:gap-6">
        {/* Main content */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {/* Video container */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              borderRadius: 16, overflow: 'hidden', marginBottom: 24,
              boxShadow: 'var(--shadow)',
            }}
          >
            {youtubeId ? (
              <div style={{ position: 'relative', width: '100%', paddingTop: '56.25%' }}>
                <iframe
                  style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', border: 'none' }}
                  src={`https://www.youtube.com/embed/${youtubeId}?rel=0`}
                  title={lesson.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            ) : (
              <div style={{ position: 'relative', paddingTop: '56.25%' }}>
                <div style={{
                  position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
                  alignItems: 'center', justifyContent: 'center', gap: 16,
                  background: 'linear-gradient(135deg, var(--bg-2) 0%, var(--bg-3) 100%)',
                  padding: 32, textAlign: 'center',
                }}>
                  <div style={{
                    width: 64, height: 64, borderRadius: 18, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: 'var(--accent-dim)', border: '1px solid rgba(196,240,228,0.2)',
                  }}>
                    <Play size={24} style={{ color: 'var(--accent)', marginLeft: 4 }} />
                  </div>
                  <div>
                    <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--accent)', marginBottom: 8 }}>
                      Video în curs de adăugare
                    </p>
                    <p style={{ fontSize: 13, color: 'var(--fg-3)', lineHeight: 1.6, maxWidth: 380 }}>
                      {lesson.description}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </motion.div>

          {/* Lesson info */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            style={{ marginBottom: 20 }}
          >
            {/* Badges row */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 14, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 11, color: 'var(--fg-3)', background: 'var(--bg-3)', border: '1px solid var(--border)', padding: '3px 10px', borderRadius: 99 }}>
                Lecția {unifiedNo} · Video
              </span>
              <span style={{ fontSize: 11, color: 'var(--accent)', background: 'var(--accent-dim)', border: '1px solid rgba(196,240,228,0.2)', padding: '3px 10px', borderRadius: 99 }}>
                {lesson.duration_min} min
              </span>
              {(done || justCompleted) && (
                <span style={{ fontSize: 11, color: '#4ade80', background: 'rgba(74,222,128,0.12)', border: '1px solid rgba(74,222,128,0.25)', padding: '3px 10px', borderRadius: 99, fontWeight: 600 }}>
                  Finalizat
                </span>
              )}
            </div>
            <h1 className="font-aboreto" style={{ fontSize: 'clamp(1.4rem,3vw,2rem)', color: 'var(--fg)', lineHeight: 1.15, marginBottom: 12 }}>
              {lesson.title}
            </h1>
            <p style={{ fontSize: 14, color: 'var(--fg-3)', lineHeight: 1.7 }}>{lesson.description}</p>
          </motion.div>

          {/* PDF button */}
          {lesson.pdf_url && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }} style={{ marginBottom: 20 }}>
              <a
                href={lesson.pdf_url}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 8, padding: '9px 16px', borderRadius: 10,
                  background: 'var(--accent-dim)', border: '1px solid rgba(196,240,228,0.2)',
                  color: 'var(--accent)', fontSize: 12, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase',
                  transition: 'background 0.15s',
                }}
                onMouseEnter={e => (e.currentTarget.style.background = 'rgba(196,240,228,0.18)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'var(--accent-dim)')}
              >
                <FileText size={14} /> Descarcă materialul PDF <ExternalLink size={12} />
              </a>
            </motion.div>
          )}

          {/* Mark complete button — Feature 4 (confetti) */}
          <motion.div
            ref={completeButtonRef}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            style={{ marginBottom: 24, position: 'relative' }}
          >
            {showConfetti && (
              <Confetti onDone={() => setShowConfetti(false)} />
            )}
            <AnimatePresence mode="wait">
              {done || justCompleted ? (
                <motion.div
                  key="done"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  style={{ display: 'flex', alignItems: 'center', gap: 10 }}
                >
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: '12px 20px', background: 'rgba(74,222,128,0.1)', border: '1px solid rgba(74,222,128,0.25)',
                    borderRadius: 12, color: '#4ade80', fontSize: 14, fontWeight: 600,
                  }}>
                    <CheckCircle2 size={18} /> Lecție finalizată
                  </div>
                </motion.div>
              ) : (
                <motion.div key="btn" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <button
                    disabled={completing}
                    onClick={handleMarkComplete}
                    style={{
                      width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                      padding: '14px 24px', background: 'var(--accent)', color: '#0D0907',
                      border: 'none', borderRadius: 12, cursor: completing ? 'not-allowed' : 'pointer',
                      fontSize: 14, fontWeight: 700, opacity: completing ? 0.7 : 1,
                      transition: 'filter 0.15s',
                    }}
                    onMouseEnter={e => { if (!completing) (e.currentTarget.style.filter = 'brightness(1.07)'); }}
                    onMouseLeave={e => { (e.currentTarget.style.filter = ''); }}
                  >
                    {completing ? (
                      <span style={{ width: 16, height: 16, border: '2px solid #0D0907', borderTopColor: 'transparent', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.7s linear infinite' }} />
                    ) : (
                      <CheckCircle2 size={18} />
                    )}
                    {completing ? 'Se salvează...' : 'Marchează ca Finalizat'}
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Notes section — Feature 7 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            style={{
              background: 'var(--bg-card)', border: '1px solid var(--border)',
              borderRadius: 12, marginBottom: 24, overflow: 'hidden',
            }}
          >
            <button
              onClick={() => setNotesOpen(v => !v)}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: 10, justifyContent: 'space-between',
                padding: '13px 16px', background: 'none', border: 'none', cursor: 'pointer',
                transition: 'background 0.15s',
              }}
              onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-3)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'none')}
            >
              <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--fg)', display: 'flex', alignItems: 'center', gap: 8 }}>
                <span>📝</span> Notițele mele
                {note && <span style={{ fontSize: 10, color: 'var(--accent)', background: 'var(--accent-dim)', padding: '1px 6px', borderRadius: 4, fontWeight: 600 }}>Salvat</span>}
              </span>
              <ChevronDown
                size={15}
                style={{ color: 'var(--fg-3)', transform: notesOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}
              />
            </button>

            <AnimatePresence initial={false}>
              {notesOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  style={{ overflow: 'hidden' }}
                >
                  <div style={{ padding: '0 16px 16px', borderTop: '1px solid var(--border)' }}>
                    <textarea
                      value={note}
                      onChange={e => setNote(e.target.value)}
                      rows={4}
                      placeholder="Notițele tale pentru această lecție..."
                      style={{
                        width: '100%', marginTop: 12, padding: '10px 12px',
                        fontSize: 13, lineHeight: 1.6, resize: 'vertical',
                        background: 'var(--bg-3)', border: '1px solid var(--border)',
                        borderRadius: 8, color: 'var(--fg)', boxSizing: 'border-box',
                        transition: 'border-color 0.15s',
                      }}
                      onFocus={e => (e.target.style.borderColor = 'rgba(196,240,228,0.35)')}
                      onBlur={e => (e.target.style.borderColor = 'var(--border)')}
                    />
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 10 }}>
                      {saved ? (
                        <span style={{ fontSize: 11, color: '#4ade80', display: 'flex', alignItems: 'center', gap: 4 }}>
                          <CheckCircle2 size={12} /> Notița salvată
                        </span>
                      ) : (
                        <span style={{ fontSize: 11, color: 'var(--fg-3)' }}>
                          {note ? `${note.length} caractere` : 'Necompletat'}
                        </span>
                      )}
                      <button
                        onClick={saveNote}
                        style={{
                          padding: '7px 16px', background: 'var(--accent-dim)',
                          border: '1px solid rgba(196,240,228,0.2)', borderRadius: 8,
                          cursor: 'pointer', fontSize: 12, fontWeight: 600, color: 'var(--accent)',
                          transition: 'background 0.15s',
                        }}
                        onMouseEnter={e => (e.currentTarget.style.background = 'rgba(196,240,228,0.15)')}
                        onMouseLeave={e => (e.currentTarget.style.background = 'var(--accent-dim)')}
                      >
                        Salvează notița
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Navigation */}
          <div style={{ display: 'flex', alignItems: 'stretch', justifyContent: 'space-between', gap: 12, paddingTop: 20, borderTop: '1px solid var(--border)' }}>
            <div style={{ flex: 1 }}>
              {prevEntry ? (
                <button
                  onClick={() => navigate(linkForEntry(prevEntry))}
                  style={{
                    width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                    padding: '12px 14px', background: 'var(--bg-card)', border: '1px solid var(--border)',
                    borderRadius: 10, cursor: 'pointer', transition: 'border-color 0.15s',
                    textAlign: 'left',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--border-hi)')}
                  onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border)')}
                >
                  <ChevronLeft size={16} style={{ color: 'var(--fg-3)', flexShrink: 0 }} />
                  <span>
                    <div style={{ fontSize: 10, color: 'var(--fg-3)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 2 }}>Anterior · Lecția {prevEntry.lessonNo}</div>
                    <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--fg)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 200 }}>{(prevEntry.item as any).title}</div>
                  </span>
                </button>
              ) : (
                <button
                  onClick={() => navigate(`/module/${module.id}`)}
                  style={{
                    width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                    padding: '12px 14px', background: 'var(--bg-card)', border: '1px solid var(--border)',
                    borderRadius: 10, cursor: 'pointer', transition: 'border-color 0.15s',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--border-hi)')}
                  onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border)')}
                >
                  <ChevronLeft size={16} style={{ color: 'var(--fg-3)' }} />
                  <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--fg-2)' }}>Înapoi la modul</span>
                </button>
              )}
            </div>

            <div style={{ flex: 1 }}>
              {nextEntry ? (
                <button
                  onClick={() => navigate(linkForEntry(nextEntry))}
                  style={{
                    width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 10,
                    padding: '12px 14px', background: 'var(--bg-card)', border: '1px solid var(--border)',
                    borderRadius: 10, cursor: 'pointer', transition: 'border-color 0.15s',
                    textAlign: 'right',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--border-hi)')}
                  onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border)')}
                >
                  <span>
                    <div style={{ fontSize: 10, color: 'var(--fg-3)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 2 }}>Următor · Lecția {nextEntry.lessonNo}</div>
                    <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--fg)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 200 }}>{(nextEntry.item as any).title}</div>
                  </span>
                  <ChevronRight size={16} style={{ color: 'var(--fg-3)', flexShrink: 0 }} />
                </button>
              ) : nextModuleLesson ? (
                <button
                  onClick={() => navigate(`/lesson/${nextModuleLesson.id}`)}
                  style={{
                    width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 10,
                    padding: '12px 14px', background: 'var(--accent-dim)', border: '1px solid rgba(196,240,228,0.2)',
                    borderRadius: 10, cursor: 'pointer', transition: 'background 0.15s',
                    textAlign: 'right',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'rgba(196,240,228,0.18)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'var(--accent-dim)')}
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

        {/* Sidebar: module lesson list */}
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
                if (entry.kind === 'lesson') {
                  const isActive = item.id === lesson.id;
                  const isDone = isCompleted(item.id);
                  return (
                    <button
                      key={item.id}
                      onClick={() => navigate(`/lesson/${item.id}`)}
                      style={{
                        width: '100%', display: 'flex', alignItems: 'center', gap: 8,
                        padding: '7px 10px', borderRadius: 8, cursor: 'pointer', textAlign: 'left',
                        background: isActive ? 'var(--accent-dim)' : 'transparent',
                        border: isActive ? '1px solid rgba(196,240,228,0.2)' : '1px solid transparent',
                        transition: 'background 0.15s',
                      }}
                      onMouseEnter={e => { if (!isActive) (e.currentTarget as HTMLButtonElement).style.background = 'var(--bg-3)'; }}
                      onMouseLeave={e => { if (!isActive) (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; }}
                    >
                      <div style={{ flexShrink: 0 }}>
                        {isDone
                          ? <CheckCircle2 size={13} style={{ color: '#4ade80' }} />
                          : <div style={{ width: 13, height: 13, borderRadius: '50%', border: `1.5px solid ${isActive ? 'var(--accent)' : 'var(--border)'}` }} />
                        }
                      </div>
                      <span style={{ fontSize: 11, color: isActive ? 'var(--fg)' : 'var(--fg-3)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {entry.lessonNo}. {item.title}
                      </span>
                    </button>
                  );
                }
                // exercise
                const isDone = isExerciseDone(item.id);
                return (
                  <button
                    key={item.id}
                    onClick={() => navigate(`/exercise/${item.id}`)}
                    title="Exercițiu practic"
                    style={{
                      width: '100%', display: 'flex', alignItems: 'center', gap: 8,
                      padding: '7px 10px', borderRadius: 8, cursor: 'pointer', textAlign: 'left',
                      background: 'transparent',
                      border: '1px solid transparent',
                      transition: 'background 0.15s',
                    }}
                    onMouseEnter={e => ((e.currentTarget as HTMLButtonElement).style.background = 'var(--bg-3)')}
                    onMouseLeave={e => ((e.currentTarget as HTMLButtonElement).style.background = 'transparent')}
                  >
                    <div style={{ flexShrink: 0 }}>
                      {isDone
                        ? <CheckCircle2 size={13} style={{ color: '#4ade80' }} />
                        : <div style={{ width: 13, height: 13, borderRadius: '50%', border: `1.5px solid var(--gold)`, background: 'var(--gold-dim)' }} />
                      }
                    </div>
                    <span style={{ fontSize: 11, color: 'var(--fg-3)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
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
