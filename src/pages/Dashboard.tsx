import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight, BookOpen, CheckCircle2, Layers, Video,
  Wrench, Lock, Clock, Zap, TrendingUp, Send, ClipboardList
} from 'lucide-react';
import { QuizRequiredModal } from '../components/ui/QuizRequiredModal';
import { useAuthContext } from '../context/AuthContext';
import { useProgress } from '../hooks/useProgress';
import { MODULES, LIVE_EVENTS } from '../lib/data';
import { ModuleCard } from '../components/ui/ModuleCard';
import { ProgressRing } from '../components/ui/ProgressRing';
import { useCounter } from '../hooks/useCounter';
import { Calendar } from '../components/ui/Calendar';
import { TelegramButton } from '../components/ui/TelegramButton';
import { TariffBadge } from '../components/ui/TariffBadge';
import { Tariff } from '../lib/types';

/* ── helpers ─────────────────────────────────────── */
function formatDateShort(iso: string) {
  return new Date(iso + 'T12:00:00').toLocaleDateString('ro-RO', {
    weekday: 'short', month: 'short', day: 'numeric',
  });
}

function getCountdown(dateStr: string, time: string): string {
  const target = new Date(`${dateStr}T${time}:00`);
  const now = new Date();
  const diff = target.getTime() - now.getTime();
  if (diff <= 0) return 'A început';
  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  if (days > 0) return `${days}z ${hours}h`;
  if (hours > 0) return `${hours}h`;
  return 'Astăzi';
}

/* ── stat card ─────────────────────────────────────── */
const StatCard: React.FC<{
  icon: React.ReactNode; value: string; label: string;
  delay: number; accent?: boolean; sub?: string;
}> = ({ icon, value, label, delay, accent, sub }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.45, delay, ease: [0.22, 1, 0.36, 1] }}
    className="liquid-glass"
    style={{ borderRadius: 18, padding: '22px 22px 20px', display: 'flex', flexDirection: 'column', gap: 12 }}
  >
    <div style={{
      width: 36, height: 36, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: accent ? 'rgba(196,240,228,0.12)' : 'rgba(255,255,255,0.05)',
      color: accent ? 'var(--accent)' : 'var(--fg-3)',
    }}>
      {icon}
    </div>
    <div>
      <div style={{ fontSize: 32, fontWeight: 700, color: 'var(--fg)', lineHeight: 1, letterSpacing: '-0.03em', fontVariantNumeric: 'tabular-nums' }}>
        {value}
      </div>
      {sub && (
        <div style={{ fontSize: 11, color: accent ? 'var(--accent)' : '#4ade80', marginTop: 3, fontWeight: 600 }}>
          {sub}
        </div>
      )}
    </div>
    <div style={{ fontSize: 11, color: 'var(--fg-3)', textTransform: 'uppercase', letterSpacing: '0.07em', fontWeight: 500 }}>
      {label}
    </div>
  </motion.div>
);

/* ── main component ─────────────────────────────────── */
export const Dashboard: React.FC = () => {
  const { user } = useAuthContext();
  const { getModuleProgress, getOverallProgress, isModuleLocked, getCompletedLessonsCount, getTotalLessonsCount } = useProgress();
  const navigate = useNavigate();

  const quizDone = user
    ? !!localStorage.getItem(`aa_quiz_done_${user.id}`)
    : false;
  const [quizModalOpen, setQuizModalOpen] = useState(false);

  const overallPct = getOverallProgress();
  const completedLessons = getCompletedLessonsCount();
  const totalLessons = getTotalLessonsCount();
  const completedModules = MODULES.filter(m => getModuleProgress(m.id) === 100).length;

  const animatedLessons = useCounter(completedLessons, 1000, 150);
  const animatedPct = useCounter(overallPct, 1100, 200);
  const animatedModules = useCounter(completedModules, 900, 250);

  const currentModule = MODULES.find((m, i) => !isModuleLocked(i) && getModuleProgress(m.id) < 100) || MODULES[0];
  const currentLesson = currentModule.lessons[0];
  const currentProgress = getModuleProgress(currentModule.id);

  const firstName = user?.full_name?.split(' ')[0] || 'Antreprenor';
  const tariff = (user?.tariff || 'student') as Tariff;

  const today = useMemo(() => { const d = new Date(); d.setHours(0, 0, 0, 0); return d; }, []);
  const upcomingEvents = useMemo(() =>
    LIVE_EVENTS.filter(ev => new Date(ev.date) >= today)
      .sort((a, b) => a.date.localeCompare(b.date)), [today]);
  const nextEvent = upcomingEvents[0];

  const moduleUnlocks = MODULES
    .filter(m => m.unlockDate)
    .map(m => ({ date: m.unlockDate!, title: m.title, moduleId: m.id }));

  const fade = (delay: number) => ({
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
  });

  return (
    <div style={{ minHeight: '100%', background: 'var(--bg)', position: 'relative', overflowX: 'hidden' }}>
      {/* ── Background glow spheres ── */}
      <div className="dash-glow" style={{ width: 600, height: 600, top: -200, left: -100, background: 'rgba(196,240,228,0.04)' }} />
      <div className="dash-glow" style={{ width: 400, height: 400, top: 300, right: -100, background: 'rgba(201,169,110,0.03)' }} />

      <div style={{ maxWidth: 1080, margin: '0 auto', padding: '40px 24px 60px', position: 'relative', zIndex: 1 }}>

        {/* ── HEADER ── */}
        <motion.div {...fade(0)} style={{ marginBottom: 40 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 6 }}>
            <h1 className="font-aboreto" style={{ fontSize: 'clamp(1.9rem, 4vw, 2.9rem)', color: 'var(--fg)', letterSpacing: '-0.025em', lineHeight: 1.05 }}>
              Bun venit, {firstName}.
            </h1>
            <TariffBadge tariff={tariff} />
          </div>
          <p style={{ fontSize: 14, color: 'var(--fg-3)', lineHeight: 1.5 }}>
            <span style={{ color: 'var(--accent)', fontWeight: 500 }}>{currentModule.etapa}</span>
            &nbsp;·&nbsp;{currentModule.title}&nbsp;·&nbsp;{currentModule.saptamana}
          </p>
        </motion.div>

        {/* ── QUIZ LOCK BANNER ── */}
        {!quizDone && (
          <motion.div
            initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
            style={{ background: 'linear-gradient(135deg, rgba(201,169,110,0.12), rgba(201,169,110,0.06))', border: '1px solid rgba(201,169,110,0.25)', borderRadius: 16, padding: '16px 20px', marginBottom: 24, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <ClipboardList size={18} style={{ color: 'var(--gold)', flexShrink: 0 }} />
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--fg)', marginBottom: 2 }}>Formularul de acces nu este completat</div>
                <div style={{ fontSize: 12, color: 'var(--fg-3)' }}>Completează formularul de onboarding pentru a debloca toate modulele.</div>
              </div>
            </div>
            <button onClick={() => navigate('/quiz')} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 16px', background: 'var(--gold)', color: '#0D0907', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 12, fontWeight: 700, whiteSpace: 'nowrap' }}>
              Completează acum <ArrowRight size={13} />
            </button>
          </motion.div>
        )}

        {/* ── HERO ROW: current module card + next event ── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 16, marginBottom: 16 }} className="hero-grid">

          {/* Current module hero card */}
          <motion.div
            {...fade(0.06)}
            className="liquid-glass-accent"
            style={{ borderRadius: 24, padding: '32px 32px', overflow: 'hidden', position: 'relative', minHeight: 240 }}
          >
            {/* Ghost number */}
            <div className="font-aboreto" style={{
              position: 'absolute', right: -10, bottom: -20,
              fontSize: 'clamp(100px, 14vw, 160px)', lineHeight: 1, color: 'rgba(196,240,228,0.055)',
              fontWeight: 800, userSelect: 'none', pointerEvents: 'none', letterSpacing: '-0.04em',
            }}>
              {currentModule.order_index}
            </div>

            <div style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'flex-start', gap: 28, flexWrap: 'wrap' }}>
              {/* Progress ring */}
              <div style={{ flexShrink: 0 }}>
                <ProgressRing value={currentProgress} size={110} strokeWidth={9} />
              </div>

              {/* Info */}
              <div style={{ flex: 1, minWidth: 200 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                  <span style={{
                    fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase',
                    color: 'var(--accent)', background: 'rgba(196,240,228,0.1)',
                    border: '1px solid rgba(196,240,228,0.2)', padding: '3px 10px', borderRadius: 99,
                  }}>
                    {currentModule.etapa} · Activ
                  </span>
                  <span style={{ fontSize: 11, color: 'var(--fg-3)' }}>{currentModule.saptamana}</span>
                </div>

                <h2 className="font-aboreto" style={{ fontSize: 'clamp(1.5rem, 3vw, 2.1rem)', color: '#fff', letterSpacing: '-0.02em', marginBottom: 6, lineHeight: 1.1 }}>
                  {currentModule.title}
                </h2>
                <p style={{ fontSize: 13, color: 'var(--fg-3)', lineHeight: 1.6, marginBottom: 20, maxWidth: 420 }}>
                  {currentModule.description}
                </p>

                {/* Next lesson */}
                {currentLesson && (
                  <div style={{ marginBottom: 20, padding: '10px 14px', background: 'rgba(255,255,255,0.04)', borderRadius: 12, border: '1px solid rgba(255,255,255,0.07)', display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 28, height: 28, borderRadius: 8, background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Zap size={13} style={{ color: '#0D0907' }} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 11, color: 'var(--fg-3)', marginBottom: 1 }}>Lecție curentă</div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--fg)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {currentLesson.title}
                      </div>
                    </div>
                    <span style={{ fontSize: 11, color: 'var(--fg-3)', flexShrink: 0 }}>{currentLesson.duration_min} min</span>
                  </div>
                )}

                <button
                  onClick={() => currentLesson && navigate(`/lesson/${currentLesson.id}`)}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: 8,
                    padding: '11px 22px', background: 'var(--accent)', color: '#0D0907',
                    border: 'none', borderRadius: 12, cursor: 'pointer', fontSize: 13, fontWeight: 700,
                    transition: 'filter 0.15s, transform 0.15s', boxShadow: '0 4px 20px rgba(196,240,228,0.25)',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.filter = 'brightness(1.08)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                  onMouseLeave={e => { e.currentTarget.style.filter = ''; e.currentTarget.style.transform = ''; }}
                >
                  Continuă lecția <ArrowRight size={14} />
                </button>
              </div>
            </div>
          </motion.div>

          {/* Next event card */}
          <motion.div {...fade(0.1)} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {nextEvent ? (
              <div
                className="liquid-glass"
                style={{ borderRadius: 22, padding: '24px 22px', flex: 1, display: 'flex', flexDirection: 'column', gap: 16 }}
              >
                {/* Event type badge */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{
                    display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 10, fontWeight: 700,
                    letterSpacing: '0.09em', textTransform: 'uppercase', padding: '3px 10px', borderRadius: 99,
                    color: nextEvent.type === 'zoom' ? '#4ade80' : 'var(--gold)',
                    background: nextEvent.type === 'zoom' ? 'rgba(74,222,128,0.1)' : 'rgba(201,169,110,0.1)',
                    border: `1px solid ${nextEvent.type === 'zoom' ? 'rgba(74,222,128,0.25)' : 'rgba(201,169,110,0.25)'}`,
                  }}>
                    {nextEvent.type === 'zoom' ? <><Video size={9} /> Zoom Live</> : <><Wrench size={9} /> Workshop</>}
                  </span>
                  {/* Countdown badge */}
                  <span style={{
                    fontSize: 12, fontWeight: 700, color: 'var(--fg)',
                    background: 'rgba(255,255,255,0.08)', padding: '3px 10px', borderRadius: 99,
                    border: '1px solid rgba(255,255,255,0.1)',
                  }}>
                    {getCountdown(nextEvent.date, nextEvent.time)}
                  </span>
                </div>

                <div>
                  <div className="font-aboreto" style={{ fontSize: 16, color: '#fff', letterSpacing: '-0.01em', marginBottom: 6, lineHeight: 1.2 }}>
                    {nextEvent.title}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--fg-3)', lineHeight: 1.6 }}>
                    {nextEvent.description}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 12px', background: 'rgba(255,255,255,0.03)', borderRadius: 10, border: '1px solid rgba(255,255,255,0.07)' }}>
                  <Clock size={13} style={{ color: 'var(--fg-3)', flexShrink: 0 }} />
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--fg)' }}>
                      {formatDateShort(nextEvent.date)} · {nextEvent.time}
                    </div>
                    <div style={{ fontSize: 10, color: 'var(--fg-3)' }}>{nextEvent.duration}</div>
                  </div>
                </div>

                {/* All upcoming events mini list */}
                {upcomingEvents.length > 1 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <div style={{ fontSize: 10, color: 'var(--fg-3)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 2 }}>
                      Urmează
                    </div>
                    {upcomingEvents.slice(1, 3).map(ev => (
                      <div key={ev.id} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ width: 6, height: 6, borderRadius: '50%', flexShrink: 0, background: ev.type === 'zoom' ? '#4ade80' : 'var(--gold)' }} />
                        <div style={{ fontSize: 11, color: 'var(--fg-2)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
                          {ev.title}
                        </div>
                        <div style={{ fontSize: 10, color: 'var(--fg-3)', flexShrink: 0 }}>
                          {formatDateShort(ev.date)}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="liquid-glass" style={{ borderRadius: 22, padding: 24, flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <p style={{ fontSize: 13, color: 'var(--fg-3)', textAlign: 'center' }}>Nu sunt evenimente programate.</p>
              </div>
            )}

            {/* Telegram button card */}
            <div className="liquid-glass" style={{ borderRadius: 18, padding: '16px 18px', display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 34, height: 34, borderRadius: 10, background: 'rgba(42,171,238,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Send size={14} style={{ color: '#2AABEE' }} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--fg)', marginBottom: 2 }}>Grup Telegram</div>
                <div style={{ fontSize: 11, color: 'var(--fg-3)' }}>Comunitatea programului</div>
              </div>
              <TelegramButton compact />
            </div>
          </motion.div>
        </div>

        {/* ── STATS ROW ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 24 }} className="stats-grid">
          <StatCard icon={<BookOpen size={16} />} value={`${animatedLessons}/${totalLessons}`} label="Lecții finalizate" delay={0.13} accent sub={completedLessons > 0 ? `+${completedLessons} completate` : undefined} />
          <StatCard icon={<Layers size={16} />} value={`${animatedModules}/${MODULES.length}`} label="Module finalizate" delay={0.17} sub={completedModules > 0 ? 'Progres bun!' : 'Începe primul'} />
          <StatCard icon={<TrendingUp size={16} />} value={`${animatedPct}%`} label="Progres global" delay={0.21} accent sub={overallPct >= 50 ? '🔥 Peste jumătate!' : undefined} />
          <StatCard icon={<CheckCircle2 size={16} />} value={currentModule.lessons.length + '/' + currentModule.lessons.length} label={`Lecții în ${currentModule.etapa}`} delay={0.25} sub="Modul curent" />
        </div>

        {/* ── MODULE PROGRESS LIST ── */}
        <motion.div {...fade(0.28)} style={{ marginBottom: 24 }}>
          <div className="liquid-glass" style={{ borderRadius: 22, overflow: 'hidden' }}>
            <div style={{ padding: '20px 24px 16px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h3 className="font-aboreto" style={{ fontSize: 12, letterSpacing: '0.1em', color: 'var(--fg-3)', textTransform: 'uppercase' }}>
                Progres per modul
              </h3>
              <span style={{ fontSize: 11, color: 'var(--fg-3)' }}>{overallPct}% total</span>
            </div>
            <div style={{ padding: '8px 0' }}>
              {MODULES.map((mod, idx) => {
                const pct = getModuleProgress(mod.id);
                const locked = isModuleLocked(idx);
                const done = pct === 100;
                const active = mod.id === currentModule.id;
                return (
                  <div
                    key={mod.id}
                    onClick={() => !locked && navigate(`/module/${mod.id}`)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 14, padding: '10px 24px',
                      cursor: locked ? 'not-allowed' : 'pointer', opacity: locked ? 0.45 : 1,
                      transition: 'background 0.15s',
                      background: active ? 'rgba(196,240,228,0.04)' : 'transparent',
                    }}
                    onMouseEnter={e => { if (!locked) e.currentTarget.style.background = 'rgba(255,255,255,0.025)'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = active ? 'rgba(196,240,228,0.04)' : 'transparent'; }}
                  >
                    {/* Step circle */}
                    <div style={{
                      width: 28, height: 28, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                      background: done ? 'rgba(74,222,128,0.12)' : active ? 'rgba(196,240,228,0.1)' : 'rgba(255,255,255,0.04)',
                      border: `1px solid ${done ? 'rgba(74,222,128,0.3)' : active ? 'rgba(196,240,228,0.25)' : 'rgba(255,255,255,0.07)'}`,
                    }}>
                      {locked ? <Lock size={11} style={{ color: 'var(--fg-3)' }} />
                        : done ? <CheckCircle2 size={13} style={{ color: '#4ade80' }} />
                        : <span className="font-aboreto" style={{ fontSize: 10, color: active ? 'var(--accent)' : 'var(--fg-3)', lineHeight: 1 }}>{idx}</span>}
                    </div>
                    {/* Label */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                        <span style={{ fontSize: 13, fontWeight: active ? 600 : 400, color: active ? 'var(--fg)' : done ? 'var(--fg-2)' : 'var(--fg-3)' }}>
                          {mod.title}
                        </span>
                        {active && (
                          <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.1em', color: 'var(--accent)', background: 'rgba(196,240,228,0.12)', border: '1px solid rgba(196,240,228,0.2)', padding: '1px 7px', borderRadius: 99, textTransform: 'uppercase' }}>
                            Activ
                          </span>
                        )}
                      </div>
                      {/* Progress bar */}
                      {!locked && (
                        <div style={{ height: 3, background: 'rgba(255,255,255,0.06)', borderRadius: 2, overflow: 'hidden' }}>
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${pct}%` }}
                            transition={{ duration: 0.9, delay: 0.3 + idx * 0.05, ease: 'easeOut' }}
                            style={{ height: '100%', borderRadius: 2, background: done ? '#4ade80' : active ? 'var(--accent)' : 'rgba(255,255,255,0.2)' }}
                          />
                        </div>
                      )}
                    </div>
                    {/* Percentage */}
                    <div style={{ fontSize: 12, fontWeight: 600, color: done ? '#4ade80' : active ? 'var(--accent)' : 'var(--fg-3)', flexShrink: 0, minWidth: 36, textAlign: 'right' }}>
                      {locked ? '—' : `${pct}%`}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </motion.div>

        {/* ── CALENDAR ── */}
        <motion.div {...fade(0.32)} style={{ marginBottom: 32 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <h3 className="font-aboreto" style={{ fontSize: 11, letterSpacing: '0.1em', color: 'var(--fg-3)', textTransform: 'uppercase' }}>
              Calendar program
            </h3>
          </div>
          <Calendar events={LIVE_EVENTS} moduleUnlocks={moduleUnlocks} />
        </motion.div>

        {/* ── MODULE GRID ── */}
        <motion.div {...fade(0.36)}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <h3 className="font-aboreto" style={{ fontSize: 11, letterSpacing: '0.1em', color: 'var(--fg-3)', textTransform: 'uppercase' }}>
              Toate modulele
            </h3>
            <span style={{ fontSize: 12, color: 'var(--fg-3)' }}>{completedModules}/{MODULES.length} finalizate</span>
          </div>
          <div className="module-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 14 }}>
            {MODULES.map((mod, idx) => (
              <div key={mod.id} onClick={!quizDone ? (e) => { e.preventDefault(); e.stopPropagation(); setQuizModalOpen(true); } : undefined}>
                <ModuleCard
                  module={mod}
                  progress={getModuleProgress(mod.id)}
                  locked={isModuleLocked(idx)}
                  active={mod.id === currentModule.id}
                  index={idx}
                />
              </div>
            ))}
          </div>
        </motion.div>

      </div>

      {/* ── RESPONSIVE STYLES ── */}
      <style>{`
        @media (max-width: 900px) {
          .hero-grid { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 640px) {
          .stats-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .module-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>

      <QuizRequiredModal open={quizModalOpen} onClose={() => setQuizModalOpen(false)} />
    </div>
  );
};
