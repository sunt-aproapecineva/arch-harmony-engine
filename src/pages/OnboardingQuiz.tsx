import React, { useState, useCallback } from 'react';
import { useNavigate } from '@/lib/router-compat';
import { useCourse } from '../context/CourseContext';
import { courseDashboardPath } from '../lib/navigation';
import { markOnboardingDoneLocally, queuePendingQuiz, clearPendingQuiz } from '../lib/access';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Check } from 'lucide-react';
import { useAuthContext } from '../context/AuthContext';
import { logActivity } from '../lib/activity';
import { getQuizDefinition } from '../lib/quiz';
import type { QuizQuestion } from '../lib/quiz';
import { supabase } from '@/integrations/supabase/client';

// ─── Question Data ─────────────────────────────────────────────────────────────

const BLOCK_COLORS: Record<number, string> = {
  1: 'rgba(196,240,228,0.18)',
  2: 'rgba(201,169,110,0.18)',
  3: 'rgba(139,92,246,0.18)',
  4: 'rgba(59,130,246,0.18)',
  5: 'rgba(239,68,68,0.18)',
};
const BLOCK_TEXT_COLORS: Record<number, string> = {
  1: '#C4F0E4',
  2: '#C9A96E',
  3: 'var(--info)',
  4: '#93c5fd',
  5: '#fca5a5',
};

// ─── Answer type ──────────────────────────────────────────────────────────────
type AnswerValue = string | string[] | number;

// ─── Result Screen ────────────────────────────────────────────────────────────
const ResultScreen: React.FC<{ answers: Record<string, AnswerValue> }> = ({ answers }) => {
  const { course, courseId } = useCourse();
  const navigate = useNavigate();
  // Sumarul e definit de curs — Business rezumă o firmă existentă, START rezumă
  // un punct de plecare. Aceleași id-uri hardcodate n-ar avea sens în ambele.
  const quizDef = getQuizDefinition(courseId);
  const summary = (quizDef?.summaryFields || []).map(f => {
    const raw = answers[f.questionId];
    const value = Array.isArray(raw) ? raw.join(', ') : String(raw ?? '').trim();
    return [f.label, value || '—'] as [string, string];
  });

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
      style={{ maxWidth: 620, width: '100%', margin: '0 auto', padding: '40px 24px', textAlign: 'center' }}
    >
      <div style={{ marginBottom: 32 }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>✓</div>
        <h1 className="font-aboreto" style={{ fontSize: 'clamp(1.6rem,4vw,2.4rem)', color: '#fff', marginBottom: 12, letterSpacing: '-0.02em' }}>
          Profilul tău a fost salvat.
        </h1>
        <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.55)', lineHeight: 1.7 }}>
          Am înregistrat răspunsurile tale. Practicumul va fi personalizat pe baza profilului tău.
        </p>
      </div>

      <div style={{
        background: 'rgba(255,255,255,0.05)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: 16, padding: 24, marginBottom: 32, textAlign: 'left',
      }}>
        <div className="font-aboreto" style={{ fontSize: 9, letterSpacing: '0.12em', color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', marginBottom: 16 }}>
          Sumarul profilului tău
        </div>
        {summary.map(([label, value]) => (
          <div key={label} style={{ display: 'flex', gap: 12, marginBottom: 10, fontSize: 13, lineHeight: 1.5 }}>
            <span style={{ color: 'rgba(255,255,255,0.4)', minWidth: 120, flexShrink: 0 }}>{label}</span>
            <span style={{ color: '#fff', fontWeight: 500 }}>{value}</span>
          </div>
        ))}
      </div>

      <button
        onClick={() => navigate(courseDashboardPath(course))}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 10,
          padding: '14px 32px', background: '#C4F0E4', color: '#0D0907',
          border: 'none', borderRadius: 12, cursor: 'pointer',
          fontSize: 15, fontWeight: 700, letterSpacing: '-0.01em',
          transition: 'filter 0.15s',
        }}
        onMouseEnter={e => (e.currentTarget.style.filter = 'brightness(1.05)')}
        onMouseLeave={e => (e.currentTarget.style.filter = '')}
      >
        Intră în platformă <ChevronRight size={18} />
      </button>
    </motion.div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────
type QuizScreen = 'welcome' | 'intro' | 'questions' | 'result';

export const OnboardingQuiz: React.FC = () => {
  const { user } = useAuthContext();
  const { course, courseId } = useCourse();

  const getInitialScreen = (): QuizScreen => {
    if (!user) return 'intro';
    let welcomeShown = false;
    try { welcomeShown = typeof window !== 'undefined' && !!localStorage.getItem(`aa_welcome_shown_${user.id}`); } catch {}
    return welcomeShown ? 'intro' : 'welcome';
  };

  const [screen, setScreen] = useState<QuizScreen>(getInitialScreen);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, AnswerValue>>({});
  const [otherValues, setOtherValues] = useState<Record<string, string>>({});
  const [direction, setDirection] = useState(1);
  const [done, setDone] = useState(false);

  const firstName = user?.full_name?.split(' ')[0] || 'Antreprenor';

  const goToIntro = () => {
    try { if (user) localStorage.setItem(`aa_welcome_shown_${user.id}`, '1'); } catch {}
    setScreen('intro');
  };

  // Diagnosticul e al cursului, nu al platformei: START are alte întrebări,
  // alte blocuri și alt calcul de profil decât Business.
  const quizDef = getQuizDefinition(courseId);
  const questions = quizDef?.questions || [];
  const q = questions[currentIdx];
  const total = questions.length;
  const pct = ((currentIdx + 1) / total) * 100;

  const currentAnswer = answers[q?.id];
  const canContinue = (() => {
    if (!q) return false;
    if (q.type === 'slider') return currentAnswer !== undefined;
    if (q.type === 'text') return String(currentAnswer || '').trim().length >= 10;
    if (q.type === 'multi') {
      const sel = Array.isArray(currentAnswer) ? currentAnswer.length : 0;
      const min = q.minSelect ?? 1;
      return sel >= min;
    }
    return !!currentAnswer;
  })();

  const handleRadioOrSelect = useCallback((id: string, value: string) => {
    setAnswers(prev => ({ ...prev, [id]: value }));
  }, []);

  const handleMultiToggle = useCallback((id: string, value: string, maxSelect: number) => {
    setAnswers(prev => {
      const current = (prev[id] as string[]) || [];
      const idx = current.indexOf(value);
      if (idx === -1) {
        if (current.length >= maxSelect) return prev;
        return { ...prev, [id]: [...current, value] };
      } else {
        return { ...prev, [id]: current.filter(v => v !== value) };
      }
    });
  }, []);

  const handleSlider = useCallback((id: string, value: number) => {
    setAnswers(prev => ({ ...prev, [id]: value }));
  }, []);

  const goNext = async () => {
    if (!canContinue) return;
    if (currentIdx === total - 1) {
      const finalAnswers = { ...answers };
      Object.keys(otherValues).forEach(id => {
        if (otherValues[id]) finalAnswers[id] = otherValues[id];
      });
      if (user && courseId) {
        // Flagul local e per curs: quizul de Business nu deschide practicumul de Start.
        markOnboardingDoneLocally(user.id, courseId);
        try {
          localStorage.setItem(`aa_quiz_answers_${user.id}_${courseId}`, JSON.stringify(finalAnswers));
        } catch {}
        // Scrierea în cloud NU e „best-effort" tăcut: supabase întoarce {error}, nu
        // aruncă, deci vechiul try/catch nu prindea nimic. Dacă eșuează, punem
        // trimiterea în coadă — altfel elevul trece de poartă local, mentorul nu vede
        // niciun diagnostic, iar pe alt dispozitiv elevul e pus să-l dea din nou.
        try {
          const profile = quizDef ? quizDef.generateProfile(finalAnswers as any) : {};
          const payload = {
            user_id: user.id,
            course_id: courseId,
            answers: finalAnswers,
            profile: profile as any,
            completed_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };
          const { error: quizErr } = await supabase
            .from('quiz_responses')
            .upsert(payload, { onConflict: 'user_id,course_id' });
          if (quizErr) {
            console.warn('[Quiz] scrierea în cloud a eșuat; pun în coadă', quizErr);
            queuePendingQuiz(user.id, courseId, payload);
          } else {
            clearPendingQuiz(user.id, courseId);
          }
        } catch (e) {
          console.warn('[Quiz] scrierea în cloud a eșuat; pun în coadă', e);
          queuePendingQuiz(user.id, courseId, {
            user_id: user.id, course_id: courseId, answers: finalAnswers,
            completed_at: new Date().toISOString(), updated_at: new Date().toISOString(),
          });
        }
        logActivity({
          userId: user.id,
          userEmail: user.email,
          userName: user.full_name,
          type: 'quiz_complete',
          label: `${user.full_name} a finalizat diagnosticul${course ? ` · ${course.shortTitle}` : ''}`,
          data: {
            courseId,
            urgency: String(finalAnswers.q15 || ''),
            domain: String(finalAnswers.q1 || ''),
          },
        });
      }
      setDone(true);
    } else {
      setDirection(1);
      setCurrentIdx(i => i + 1);
    }
  };

  const goBack = () => {
    if (currentIdx === 0) return;
    setDirection(-1);
    setCurrentIdx(i => i - 1);
  };

  // Key for AnimatePresence — changes on every screen transition
  const animKey = done ? 'result' : screen;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={animKey}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.18 }}
        style={{ minHeight: '100dvh' }}
      >
        {/* ── WELCOME SCREEN (first time only) ── */}
        {screen === 'welcome' && (
          <div style={{ minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)', overflow: 'hidden', position: 'relative' }}>
            <div style={{ position: 'absolute', width: 500, height: 500, borderRadius: '50%', background: 'rgba(196,240,228,0.05)', filter: 'blur(80px)', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', pointerEvents: 'none' }} />
            <motion.div
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
              style={{ textAlign: 'center', maxWidth: 520, padding: '0 24px', position: 'relative', zIndex: 1 }}
            >
              <motion.div
                initial={{ opacity: 0, y: -16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 40 }}
              >
                <div style={{ width: 42, height: 42, borderRadius: 12, background: 'linear-gradient(135deg, #1A5C38, #0f3d22)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 24px rgba(26,92,56,0.4)' }}>
                  <span className="font-aboreto" style={{ fontSize: 14, color: '#C4F0E4' }}>AA</span>
                </div>
              </motion.div>
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                <p style={{ fontSize: 13, fontWeight: 500, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--accent)', marginBottom: 16 }}>
                  Bun venit în platformă
                </p>
                <h1 className="font-aboreto" style={{ fontSize: 'clamp(2rem, 6vw, 3.6rem)', color: '#fff', lineHeight: 1.05, letterSpacing: '-0.025em', marginBottom: 12 }}>
                  Bun venit, {firstName}.
                </h1>
                <h2 className="font-aboreto" style={{ fontSize: 'clamp(1.2rem, 3vw, 1.8rem)', color: 'var(--accent)', lineHeight: 1.1, letterSpacing: '-0.01em', marginBottom: 28 }}>
                  la Arhitectura Afacerii!
                </h2>
                <p style={{ fontSize: 15, color: 'var(--fg-3)', lineHeight: 1.7, maxWidth: 400, margin: '0 auto 40px' }}>
                  Suntem bucuroși să te avem alături. Urmează câțiva pași simpli pentru a-ți personaliza experiența de studiu.
                </p>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 }}
                style={{ display: 'flex', justifyContent: 'center', gap: 32, marginBottom: 44 }}
              >
                {[['6', 'Etape'], ['8', 'Săptămâni'], ['100%', 'Livrable reale']].map(([v, l]) => (
                  <div key={l} style={{ textAlign: 'center' }}>
                    <div className="font-aboreto" style={{ fontSize: 26, color: 'var(--accent)', lineHeight: 1 }}>{v}</div>
                    <div style={{ fontSize: 11, color: 'var(--fg-3)', marginTop: 4 }}>{l}</div>
                  </div>
                ))}
              </motion.div>
              <motion.button
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.45 }}
                onClick={goToIntro}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 10, padding: '14px 32px', background: 'var(--accent)', color: '#0D0907', border: 'none', borderRadius: 14, cursor: 'pointer', fontSize: 15, fontWeight: 700, boxShadow: '0 8px 28px rgba(196,240,228,0.22)', transition: 'filter 0.15s, transform 0.15s' }}
                onMouseEnter={e => { e.currentTarget.style.filter = 'brightness(1.07)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                onMouseLeave={e => { e.currentTarget.style.filter = ''; e.currentTarget.style.transform = ''; }}
              >
                Continuă <ChevronRight size={18} />
              </motion.button>
            </motion.div>
          </div>
        )}

        {/* ── QUIZ INTRO SCREEN ── */}
        {screen === 'intro' && (
          <div style={{ minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)', overflow: 'hidden', position: 'relative' }}>
            <div style={{ position: 'absolute', width: 400, height: 400, borderRadius: '50%', background: 'rgba(196,240,228,0.04)', filter: 'blur(60px)', top: '30%', right: '10%', pointerEvents: 'none' }} />
            <div style={{ position: 'absolute', width: 300, height: 300, borderRadius: '50%', background: 'rgba(201,169,110,0.04)', filter: 'blur(60px)', bottom: '20%', left: '5%', pointerEvents: 'none' }} />
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              style={{ textAlign: 'center', maxWidth: 560, padding: '0 24px', position: 'relative', zIndex: 1 }}
            >
              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--gold)', background: 'var(--gold-dim)', border: '1px solid rgba(201,169,110,0.25)', padding: '4px 14px', borderRadius: 99, marginBottom: 28 }}>
                  ✦ Profilul tău de studiu
                </span>
              </motion.div>
              <motion.h1
                className="font-aboreto"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.18 }}
                style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', color: '#fff', lineHeight: 1.05, letterSpacing: '-0.02em', marginBottom: 20 }}
              >
                {quizDef?.introTitle || 'Quiz de Onboarding'}
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.26 }}
                style={{ fontSize: 16, color: 'var(--fg-2)', lineHeight: 1.65, maxWidth: 440, margin: '0 auto 36px' }}
              >
                {quizDef?.introSubtitle || 'Răspunde la câteva întrebări pentru a-ți personaliza parcursul de studiu.'}
              </motion.p>
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.34 }}
                style={{ display: 'flex', justifyContent: 'center', gap: 12, marginBottom: 44, flexWrap: 'wrap' }}
              >
                {[[String(total), 'Întrebări'], [`${Math.max(4, Math.round(total / 3))} min`, 'Durată'], ['1×', 'O singură dată']].map(([v, l]) => (
                  <div key={l} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)', borderRadius: 12, padding: '12px 20px', minWidth: 90, textAlign: 'center' }}>
                    <div className="font-aboreto" style={{ fontSize: 20, color: 'var(--accent)', lineHeight: 1, marginBottom: 4 }}>{v}</div>
                    <div style={{ fontSize: 11, color: 'var(--fg-3)' }}>{l}</div>
                  </div>
                ))}
              </motion.div>
              <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.42 }}
                onClick={() => setScreen('questions')}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 10, padding: '14px 36px', background: 'var(--accent)', color: '#0D0907', border: 'none', borderRadius: 14, cursor: 'pointer', fontSize: 15, fontWeight: 700, boxShadow: '0 8px 28px rgba(196,240,228,0.22)', transition: 'filter 0.15s, transform 0.15s' }}
                onMouseEnter={e => { e.currentTarget.style.filter = 'brightness(1.07)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                onMouseLeave={e => { e.currentTarget.style.filter = ''; e.currentTarget.style.transform = ''; }}
              >
                Începe acum <ChevronRight size={18} />
              </motion.button>
              <p style={{ marginTop: 16, fontSize: 12, color: 'var(--fg-3)' }}>
                Răspunsurile tale sunt confidențiale și sunt folosite exclusiv pentru personalizarea parcursului tău.
              </p>
            </motion.div>
          </div>
        )}

        {/* ── RESULT SCREEN ── */}
        {done && (
          <div style={{ minHeight: '100dvh', background: '#0D0907', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
            <ResultScreen answers={answers} />
          </div>
        )}

        {/* ── QUESTIONS SCREEN ── */}
        {screen === 'questions' && !done && (
          <div style={{ minHeight: '100dvh', background: '#0D0907', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px 16px' }}>
            {/* Progress bar */}
            <div style={{ position: 'fixed', top: 0, left: 0, right: 0, height: 3, background: 'rgba(255,255,255,0.08)', zIndex: 10 }}>
              <motion.div
                animate={{ width: `${pct}%` }}
                transition={{ duration: 0.4 }}
                style={{ height: '100%', background: '#C4F0E4', borderRadius: 99 }}
              />
            </div>

            <div style={{ maxWidth: 620, width: '100%', paddingTop: 24 }}>
              <div style={{ textAlign: 'center', marginBottom: 24, fontSize: 12, color: 'rgba(255,255,255,0.35)' }}>
                {currentIdx + 1} / {total}
              </div>

              <AnimatePresence mode="wait" custom={direction}>
                <motion.div
                  key={q.id}
                  custom={direction}
                  initial={{ opacity: 0, x: direction * 60 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: direction * -60 }}
                  transition={{ duration: 0.25 }}
                >
                  {/* Block tag */}
                  <div style={{
                    display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 20,
                    padding: '4px 12px', borderRadius: 99,
                    background: BLOCK_COLORS[q.blockNum],
                    color: BLOCK_TEXT_COLORS[q.blockNum],
                    fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase',
                  }}>
                    <span>Blocul {q.blockNum}</span>
                    <span style={{ opacity: 0.6 }}>·</span>
                    <span>{q.block}</span>
                  </div>

                  {/* Card */}
                  <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 20, padding: '32px 28px' }}>
                    <h2 style={{ fontSize: 'clamp(1.1rem,2.5vw,1.45rem)', color: '#fff', fontWeight: 600, lineHeight: 1.4, marginBottom: 24 }}>
                      {q.question}
                    </h2>

                    {/* Radio / Select */}
                    {(q.type === 'radio' || q.type === 'select') && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {q.options?.map(opt => {
                          const isSelected = currentAnswer === opt;
                          return (
                            <button
                              key={opt}
                              onClick={() => handleRadioOrSelect(q.id, opt)}
                              style={{
                                width: '100%', padding: '13px 16px', borderRadius: 12,
                                background: isSelected ? 'rgba(196,240,228,0.12)' : 'rgba(255,255,255,0.04)',
                                border: `1.5px solid ${isSelected ? '#C4F0E4' : 'rgba(255,255,255,0.1)'}`,
                                color: isSelected ? '#C4F0E4' : 'rgba(255,255,255,0.75)',
                                cursor: 'pointer', fontSize: 14, textAlign: 'left',
                                display: 'flex', alignItems: 'center', gap: 12,
                                fontWeight: isSelected ? 600 : 400,
                                transition: 'all 0.15s',
                              }}
                            >
                              <div style={{
                                width: 18, height: 18, borderRadius: '50%', flexShrink: 0,
                                border: `1.5px solid ${isSelected ? '#C4F0E4' : 'rgba(255,255,255,0.2)'}`,
                                background: isSelected ? '#C4F0E4' : 'transparent',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                transition: 'all 0.15s',
                              }}>
                                {isSelected && <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#0D0907' }} />}
                              </div>
                              {opt}
                            </button>
                          );
                        })}
                        {q.allowOther && (
                          <div style={{ marginTop: 4 }}>
                            <input
                              type="text"
                              placeholder="Altul: specifică..."
                              value={otherValues[q.id] || ''}
                              onChange={e => {
                                setOtherValues(prev => ({ ...prev, [q.id]: e.target.value }));
                                if (e.target.value) handleRadioOrSelect(q.id, e.target.value);
                              }}
                              style={{
                                width: '100%', padding: '11px 14px', fontSize: 13,
                                background: 'rgba(255,255,255,0.05)', border: '1.5px solid rgba(255,255,255,0.12)',
                                borderRadius: 10, color: '#fff', boxSizing: 'border-box',
                              }}
                              onFocus={e => (e.target.style.borderColor = 'rgba(196,240,228,0.5)')}
                              onBlur={e => (e.target.style.borderColor = 'rgba(255,255,255,0.12)')}
                            />
                          </div>
                        )}
                      </div>
                    )}

                    {/* Multi select */}
                    {q.type === 'multi' && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', marginBottom: 4 }}>
                          {q.minSelect
                            ? `Selectează minim ${q.minSelect}${q.maxSelect ? `, maxim ${q.maxSelect}` : ''} opțiuni`
                            : `Selectează maxim ${q.maxSelect || 5} opțiuni`}
                          {Array.isArray(currentAnswer) && (currentAnswer as string[]).length > 0 && (
                            <span style={{ marginLeft: 8, color: 'rgba(196,240,228,0.6)' }}>
                              ({(currentAnswer as string[]).length} selectate)
                            </span>
                          )}
                        </p>
                        {q.options?.map(opt => {
                          const selected = Array.isArray(currentAnswer) && (currentAnswer as string[]).includes(opt);
                          const disabled = !selected && Array.isArray(currentAnswer) && (currentAnswer as string[]).length >= (q.maxSelect || 2);
                          return (
                            <button
                              key={opt}
                              onClick={() => !disabled && handleMultiToggle(q.id, opt, q.maxSelect || 2)}
                              style={{
                                width: '100%', padding: '12px 16px', borderRadius: 12,
                                background: selected ? 'rgba(196,240,228,0.12)' : 'rgba(255,255,255,0.04)',
                                border: `1.5px solid ${selected ? '#C4F0E4' : 'rgba(255,255,255,0.1)'}`,
                                color: disabled && !selected ? 'rgba(255,255,255,0.3)' : selected ? '#C4F0E4' : 'rgba(255,255,255,0.75)',
                                cursor: disabled ? 'not-allowed' : 'pointer', fontSize: 13, textAlign: 'left',
                                display: 'flex', alignItems: 'center', gap: 12,
                                fontWeight: selected ? 600 : 400,
                                transition: 'all 0.15s', opacity: disabled ? 0.5 : 1,
                              }}
                            >
                              <div style={{
                                width: 18, height: 18, borderRadius: 5, flexShrink: 0,
                                border: `1.5px solid ${selected ? '#C4F0E4' : 'rgba(255,255,255,0.2)'}`,
                                background: selected ? '#C4F0E4' : 'transparent',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                transition: 'all 0.15s',
                              }}>
                                {selected && <Check size={11} color="#0D0907" />}
                              </div>
                              {opt}
                            </button>
                          );
                        })}
                        {q.allowOther && (
                          <input
                            type="text"
                            placeholder="Alt blocaj: specifică..."
                            value={otherValues[q.id] || ''}
                            onChange={e => {
                              setOtherValues(prev => ({ ...prev, [q.id]: e.target.value }));
                              if (e.target.value) {
                                const cur = (answers[q.id] as string[]) || [];
                                const filtered = cur.filter(v => !v.startsWith('Alt:'));
                                setAnswers(prev => ({ ...prev, [q.id]: [...filtered.slice(0, (q.maxSelect || 2) - 1), `Alt: ${e.target.value}`] }));
                              }
                            }}
                            style={{
                              width: '100%', padding: '11px 14px', fontSize: 13, marginTop: 4,
                              background: 'rgba(255,255,255,0.05)', border: '1.5px solid rgba(255,255,255,0.12)',
                              borderRadius: 10, color: '#fff', boxSizing: 'border-box',
                            }}
                            onFocus={e => (e.target.style.borderColor = 'rgba(196,240,228,0.5)')}
                            onBlur={e => (e.target.style.borderColor = 'rgba(255,255,255,0.12)')}
                          />
                        )}
                      </div>
                    )}

                    {/* Slider */}
                    {/* Răspuns liber. Nu se scorează — e materialul cu care mentorul
                        intră în primul apel fără să mai sape prin platformă. */}
                    {q.type === 'text' && (
                      <div>
                        <textarea
                          value={String(currentAnswer || '')}
                          onChange={e => handleRadioOrSelect(q.id, e.target.value)}
                          rows={5}
                          placeholder="Scrie cu cuvintele tale. Nu căuta formularea perfectă."
                          style={{
                            width: '100%', padding: '14px 16px', borderRadius: 12, resize: 'vertical',
                            background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.12)',
                            color: '#fff', fontSize: 14, lineHeight: 1.6, fontFamily: 'inherit', outline: 'none',
                          }}
                        />
                        <div style={{ marginTop: 8, fontSize: 11, color: 'rgba(255,255,255,0.35)' }}>
                          {String(currentAnswer || '').trim().length < 10
                            ? 'Scrie măcar o propoziție întreagă.'
                            : `${String(currentAnswer).trim().length} caractere`}
                        </div>
                      </div>
                    )}

                    {q.type === 'slider' && q.min !== undefined && q.max !== undefined && (
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>
                          <span>{q.labels?.[q.min]}</span>
                          <span style={{ textAlign: 'right', maxWidth: '50%' }}>{q.labels?.[q.max]}</span>
                        </div>
                        <div style={{ position: 'relative', padding: '12px 0' }}>
                          <input
                            type="range"
                            min={q.min}
                            max={q.max}
                            value={typeof currentAnswer === 'number' ? currentAnswer : 5}
                            onChange={e => handleSlider(q.id, Number(e.target.value))}
                            style={{ width: '100%', appearance: 'none', background: 'transparent', cursor: 'pointer' }}
                          />
                          <style>{`
                            input[type=range]::-webkit-slider-runnable-track {
                              height: 4px; background: rgba(255,255,255,0.15); border-radius: 2px;
                            }
                            input[type=range]::-webkit-slider-thumb {
                              -webkit-appearance: none; width: 22px; height: 22px; border-radius: 50%;
                              background: #C4F0E4; margin-top: -9px; cursor: pointer;
                              box-shadow: 0 2px 8px rgba(196,240,228,0.3);
                            }
                            input[type=range]::-moz-range-track {
                              height: 4px; background: rgba(255,255,255,0.15); border-radius: 2px;
                            }
                            input[type=range]::-moz-range-thumb {
                              width: 22px; height: 22px; border-radius: 50%;
                              background: #C4F0E4; border: none; cursor: pointer;
                            }
                          `}</style>
                        </div>
                        <div style={{ textAlign: 'center', marginTop: 8 }}>
                          <span style={{ fontSize: 48, fontWeight: 700, color: '#C4F0E4', lineHeight: 1 }}>
                            {typeof currentAnswer === 'number' ? currentAnswer : 5}
                          </span>
                          <span style={{ fontSize: 18, color: 'rgba(255,255,255,0.4)' }}>/10</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 8 }}>
                          {Array.from({ length: q.max - q.min + 1 }, (_, i) => i + (q.min || 1)).map(n => (
                            <span key={n} style={{ fontSize: 10, color: 'rgba(255,255,255,0.25)', width: 22, textAlign: 'center' }}>{n}</span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              </AnimatePresence>

              {/* Navigation */}
              <div style={{ display: 'flex', gap: 12, marginTop: 24, justifyContent: 'space-between' }}>
                <button
                  onClick={goBack}
                  disabled={currentIdx === 0}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 6, padding: '12px 20px',
                    background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)',
                    borderRadius: 10, cursor: currentIdx === 0 ? 'not-allowed' : 'pointer',
                    color: currentIdx === 0 ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.7)',
                    fontSize: 13, fontWeight: 500, transition: 'all 0.15s',
                  }}
                >
                  <ChevronLeft size={15} /> Înapoi
                </button>
                <button
                  onClick={goNext}
                  disabled={!canContinue}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 6, padding: '12px 28px',
                    background: canContinue ? '#C4F0E4' : 'rgba(255,255,255,0.06)',
                    border: 'none', borderRadius: 10,
                    cursor: canContinue ? 'pointer' : 'not-allowed',
                    color: canContinue ? '#0D0907' : 'rgba(255,255,255,0.25)',
                    fontSize: 14, fontWeight: 700, transition: 'all 0.15s',
                  }}
                >
                  {currentIdx === total - 1 ? 'Finalizează' : 'Continuă'}
                  <ChevronRight size={15} />
                </button>
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
};
