import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft, LogIn, CheckCircle, FileText, Award, UserPlus, Pencil,
  AlertTriangle, ChevronDown, ChevronUp,
} from 'lucide-react';
import { MockUser, Progress } from '../../lib/types';
import { MODULES } from '../../lib/data';
import { TariffBadge } from '../../components/ui/TariffBadge';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { getActivityForUser, ActivityEvent, timeAgo, ActivityType } from '../../lib/activity';
import { getQuizAnswersForUser, generateProfile, QuizProfile } from '../../lib/quizProfile';
import { EXERCISE_TEMPLATES } from '../../lib/exerciseData';

// ── helpers ──────────────────────────────────────────────────────────────────
function getStoredUsers(): MockUser[] {
  try { return JSON.parse(localStorage.getItem('aa_users') || '[]'); } catch { return []; }
}
function getStoredProgress(): Progress[] {
  try { return JSON.parse(localStorage.getItem('aa_progress') || '[]'); } catch { return []; }
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('ro-RO', { year: 'numeric', month: 'long', day: 'numeric' });
}

function lastLoginLabel(iso?: string): string {
  if (!iso) return 'Niciodată';
  const diff = Date.now() - new Date(iso).getTime();
  const d = Math.floor(diff / 86400000);
  if (d === 0) return `Astăzi la ${new Date(iso).toLocaleTimeString('ro-RO', { hour: '2-digit', minute: '2-digit' })}`;
  if (d === 1) return 'Ieri';
  return `Acum ${d} zile`;
}

// ── Maturity colours ─────────────────────────────────────────────────────────
const MATURITY_COLOR: Record<QuizProfile['maturityLevel'], string> = {
  startup: '#93c5fd',
  manual: '#fca5a5',
  illusion: '#fdba74',
  systemic: '#86efac',
};

// ── Quiz question data (mirrors OnboardingQuiz) ───────────────────────────────
const QUIZ_QUESTIONS: { id: string; block: string; question: string }[] = [
  { id: 'q1', block: 'Contextul Afacerii', question: 'În ce domeniu activezi?' },
  { id: 'q2', block: 'Contextul Afacerii', question: 'De câți ani conduci această afacere?' },
  { id: 'q3', block: 'Contextul Afacerii', question: 'Afacerea ta are asociați sau parteneri?' },
  { id: 'q4', block: 'Scala Financiară', question: 'Cifra de afaceri lunară aproximativă?' },
  { id: 'q5', block: 'Scala Financiară', question: 'Cheltuielile lunare totale ale firmei?' },
  { id: 'q6', block: 'Scala Financiară', question: 'Știi câți bani rămân net în firmă în fiecare lună?' },
  { id: 'q7', block: 'Structura și Oamenii', question: 'Câți angajați sau colaboratori activi?' },
  { id: 'q8', block: 'Structura și Oamenii', question: 'Câți angajați vin la tine zilnic cu întrebări?' },
  { id: 'q9', block: 'Structura și Oamenii', question: 'Ai o organigramă clară cu roluri scrise?' },
  { id: 'q10', block: 'Timp și Operațional', question: 'Câte ore pe zi lucrezi ÎN afacere?' },
  { id: 'q11', block: 'Timp și Operațional', question: 'Ai reușit să pleci în vacanță în ultimele 12 luni?' },
  { id: 'q12', block: 'Timp și Operațional', question: 'Există procese scrise pe care angajații le urmează?' },
  { id: 'q13', block: 'Blocajul și Obiectivul', question: 'Cel mai mare blocaj al afacerii tale?' },
  { id: 'q14', block: 'Blocajul și Obiectivul', question: 'Ce vrei să obții din acest practicum?' },
  { id: 'q15', block: 'Blocajul și Obiectivul', question: 'Cât de urgent este să rezolvi această problemă? (1-10)' },
];

// ── Activity icon helper ──────────────────────────────────────────────────────
function ActivityIcon({ type }: { type: ActivityType }) {
  const size = 15;
  switch (type) {
    case 'login': return <LogIn size={size} style={{ color: '#86efac' }} />;
    case 'lesson_complete': return <CheckCircle size={size} style={{ color: 'var(--accent)' }} />;
    case 'note_saved': return <FileText size={size} style={{ color: '#93c5fd' }} />;
    case 'quiz_complete': return <Award size={size} style={{ color: '#fbbf24' }} />;
    case 'platform_register': return <UserPlus size={size} style={{ color: 'var(--fg-3)' }} />;
    case 'exercise_complete': return <Pencil size={size} style={{ color: '#fb923c' }} />;
    default: return <div style={{ width: size, height: size, borderRadius: '50%', background: 'var(--border)' }} />;
  }
}

// ── Main component ────────────────────────────────────────────────────────────
export const AdminStudentProfile: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();

  const [user, setUser] = useState<MockUser | null>(null);
  const [progress, setProgress] = useState<Progress[]>([]);
  const [activity, setActivity] = useState<ActivityEvent[]>([]);
  const [quizProfile, setQuizProfile] = useState<QuizProfile | null>(null);
  const [quizAnswers, setQuizAnswers] = useState<Record<string, string | string[]> | null>(null);
  const [showQuizDetails, setShowQuizDetails] = useState(false);
  const [showAllActivity, setShowAllActivity] = useState(false);
  const [expandedNotes, setExpandedNotes] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (!userId) return;
    const users = getStoredUsers();
    const found = users.find(u => u.id === userId) || null;
    setUser(found);

    const allProgress = getStoredProgress();
    setProgress(allProgress.filter(p => p.user_id === userId));

    const acts = getActivityForUser(userId);
    setActivity(acts);

    const answers = getQuizAnswersForUser(userId);
    if (answers) {
      setQuizAnswers(answers);
      setQuizProfile(generateProfile(answers));
    }
  }, [userId]);

  if (!user) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300 }}>
        <p style={{ color: 'var(--fg-3)' }}>Utilizatorul nu a fost găsit.</p>
      </div>
    );
  }

  const allLessons = MODULES.flatMap(m => m.lessons);
  const totalLessons = allLessons.length;
  const completedCount = progress.length;
  const overallPct = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

  const cardStyle: React.CSSProperties = {
    background: 'var(--bg-card)',
    border: '1px solid var(--border)',
    borderRadius: 16,
    padding: 24,
    marginBottom: 20,
  };

  const sectionLabel: React.CSSProperties = {
    fontFamily: 'inherit',
    fontSize: 10,
    letterSpacing: '0.12em',
    textTransform: 'uppercase',
    color: 'var(--fg-3)',
    marginBottom: 16,
  };

  // Activity events
  const visibleActivity = showAllActivity ? activity : activity.slice(0, 50);

  // Today's logins
  const todayStr = new Date().toDateString();
  const loggedInToday = activity.some(e =>
    e.type === 'login' && new Date(e.timestamp).toDateString() === todayStr
  );

  return (
    <div style={{ maxWidth: 880, margin: '0 auto', padding: '32px 24px' }}>
      {/* Back link */}
      <Link
        to="/admin/users"
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13,
          color: 'var(--fg-3)', textDecoration: 'none', marginBottom: 24,
          transition: 'color 0.15s',
        }}
        onMouseEnter={e => (e.currentTarget.style.color = 'var(--fg)')}
        onMouseLeave={e => (e.currentTarget.style.color = 'var(--fg-3)')}
      >
        <ArrowLeft size={14} /> Înapoi la utilizatori
      </Link>

      {/* ── Section 1: Header ── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          ...cardStyle,
          background: 'linear-gradient(135deg, rgba(196,240,228,0.06) 0%, rgba(201,169,110,0.04) 100%)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 20, flexWrap: 'wrap' }}>
          {/* Avatar */}
          <div style={{
            width: 64, height: 64, borderRadius: '50%', flexShrink: 0,
            background: 'linear-gradient(135deg, #4ade80 0%, #22c55e 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 24, fontWeight: 700, color: '#0D0907',
          }}>
            {user.full_name?.charAt(0)?.toUpperCase() || 'U'}
          </div>

          {/* Info */}
          <div style={{ flex: 1, minWidth: 200 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 6 }}>
              <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--fg)', margin: 0 }}>
                {user.full_name}
              </h1>
              <TariffBadge tariff={user.tariff} compact />
              {loggedInToday && (
                <span style={{ fontSize: 10, background: 'rgba(74,222,128,0.15)', border: '1px solid rgba(74,222,128,0.3)', color: '#4ade80', padding: '2px 8px', borderRadius: 99, fontWeight: 600 }}>
                  Activ azi
                </span>
              )}
            </div>
            <p style={{ fontSize: 13, color: 'var(--fg-3)', marginBottom: 10 }}>{user.email}</p>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, fontSize: 12, color: 'var(--fg-3)' }}>
              {user.country && (
                <span>
                  {user.city ? `${user.city}, ` : ''}{user.country}
                </span>
              )}
              <span>Ultima conectare: <strong style={{ color: 'var(--fg)' }}>{lastLoginLabel(user.last_login)}</strong></span>
              <span>Înregistrat: <strong style={{ color: 'var(--fg)' }}>{formatDate(user.created_at)}</strong></span>
              <span>Progres: <strong style={{ color: 'var(--accent)' }}>{overallPct}%</strong> ({completedCount}/{totalLessons} lecții)</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ── Section 2: Quiz Profile ── */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} style={cardStyle}>
        <div style={sectionLabel}>Profil Quiz</div>
        {!quizProfile ? (
          <p style={{ fontSize: 13, color: 'var(--fg-3)', textAlign: 'center', padding: '16px 0' }}>
            Quiz-ul de onboarding nu a fost completat.
          </p>
        ) : (
          <>
            {/* Maturity badge */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
              <span style={{
                fontSize: 12, fontWeight: 700, padding: '4px 14px', borderRadius: 99,
                background: `${MATURITY_COLOR[quizProfile.maturityLevel]}22`,
                border: `1px solid ${MATURITY_COLOR[quizProfile.maturityLevel]}55`,
                color: MATURITY_COLOR[quizProfile.maturityLevel],
              }}>
                {quizProfile.maturityLabel}
              </span>
              <span style={{ fontSize: 12, color: 'var(--fg-3)' }}>
                Urgență: <strong style={{ color: quizProfile.urgencyScore >= 8 ? '#f87171' : quizProfile.urgencyScore >= 5 ? '#fb923c' : '#86efac' }}>
                  {quizProfile.urgencyScore}/10
                </strong>
              </span>
            </div>

            {/* Urgency bar */}
            <div style={{ marginBottom: 16 }}>
              <div style={{ height: 6, background: 'var(--border)', borderRadius: 3, overflow: 'hidden' }}>
                <div style={{
                  height: '100%',
                  width: `${quizProfile.urgencyScore * 10}%`,
                  background: quizProfile.urgencyScore >= 8 ? '#f87171' : quizProfile.urgencyScore >= 5 ? '#fb923c' : '#86efac',
                  borderRadius: 3,
                  transition: 'width 0.8s ease',
                }} />
              </div>
            </div>

            {/* Profile summary */}
            <p style={{ fontSize: 13, color: 'var(--fg-2)', lineHeight: 1.7, marginBottom: 16 }}>
              {quizProfile.profileSummary}
            </p>

            {/* Risk flags */}
            {quizProfile.riskFlags.length > 0 && (
              <div style={{ marginBottom: 16 }}>
                <p style={{ fontSize: 11, color: 'var(--fg-3)', marginBottom: 8, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Riscuri identificate</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {quizProfile.riskFlags.map(flag => (
                    <span key={flag} style={{
                      display: 'inline-flex', alignItems: 'center', gap: 5,
                      fontSize: 11, padding: '4px 10px', borderRadius: 99,
                      background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.3)',
                      color: '#f87171',
                    }}>
                      <AlertTriangle size={10} /> {flag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Priority modules */}
            <div style={{ marginBottom: 16 }}>
              <p style={{ fontSize: 11, color: 'var(--fg-3)', marginBottom: 8, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Module prioritare</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {quizProfile.priorityModules.map(m => (
                  <span key={m} style={{
                    fontSize: 11, padding: '3px 10px', borderRadius: 99,
                    background: 'var(--accent-dim)', border: '1px solid rgba(196,240,228,0.2)',
                    color: 'var(--accent)',
                  }}>
                    {m.replace('mod-', 'Modul ')}
                  </span>
                ))}
              </div>
            </div>

            {/* Recommended path */}
            <p style={{ fontSize: 12, color: 'var(--fg-3)', marginBottom: 16 }}>
              Traseul recomandat: <strong style={{ color: 'var(--fg)' }}>{quizProfile.recommendedPath}</strong>
            </p>

            {/* Quiz details accordion */}
            <button
              onClick={() => setShowQuizDetails(v => !v)}
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                background: 'none', border: '1px solid var(--border)', borderRadius: 8,
                padding: '8px 14px', cursor: 'pointer', color: 'var(--fg-3)',
                fontSize: 12, transition: 'border-color 0.15s',
              }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--border-hi)')}
              onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border)')}
            >
              {showQuizDetails ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
              {showQuizDetails ? 'Ascunde răspunsurile quiz' : 'Vezi toate răspunsurile quiz'}
            </button>

            {showQuizDetails && quizAnswers && (
              <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
                {(() => {
                  const blocks: Record<string, typeof QUIZ_QUESTIONS> = {};
                  QUIZ_QUESTIONS.forEach(q => {
                    if (!blocks[q.block]) blocks[q.block] = [];
                    blocks[q.block].push(q);
                  });
                  return Object.entries(blocks).map(([block, qs]) => (
                    <div key={block}>
                      <p style={{ fontSize: 10, color: 'var(--fg-3)', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 8 }}>
                        {block}
                      </p>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                        {qs.map(q => {
                          const ans = quizAnswers[q.id];
                          const displayAns = Array.isArray(ans) ? ans.join(', ') : String(ans || '—');
                          return (
                            <div key={q.id} style={{ background: 'var(--bg-3)', borderRadius: 8, padding: '10px 14px' }}>
                              <p style={{ fontSize: 11, color: 'var(--fg-3)', marginBottom: 4 }}>{q.question}</p>
                              <p style={{ fontSize: 13, color: 'var(--fg)', fontWeight: 500 }}>{displayAns}</p>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ));
                })()}
              </div>
            )}
          </>
        )}
      </motion.div>

      {/* ── Section 3: Progress per module ── */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} style={cardStyle}>
        <div style={sectionLabel}>Progres per modul</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {MODULES.map(mod => {
            const done = mod.lessons.filter(l => progress.some(p => p.lesson_id === l.id)).length;
            const total = mod.lessons.length;
            const pct = total > 0 ? Math.round((done / total) * 100) : 0;
            const status = pct === 100 ? 'Finalizat' : pct > 0 ? 'În progres' : 'Neînceput';
            const statusColor = pct === 100 ? '#4ade80' : pct > 0 ? 'var(--accent)' : 'var(--fg-3)';
            return (
              <div key={mod.id}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <button
                    onClick={() => navigate(`/module/${mod.id}`)}
                    style={{
                      background: 'none', border: 'none', cursor: 'pointer',
                      fontSize: 13, color: 'var(--fg)', fontWeight: 500, padding: 0,
                      textAlign: 'left', transition: 'color 0.15s',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.color = 'var(--accent)')}
                    onMouseLeave={e => (e.currentTarget.style.color = 'var(--fg)')}
                  >
                    {mod.etapa} — {mod.title}
                  </button>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
                    <span style={{ fontSize: 11, color: 'var(--fg-3)' }}>{done}/{total} lecții</span>
                    <span style={{ fontSize: 11, color: statusColor, fontWeight: 600 }}>{status}</span>
                    <span style={{ fontSize: 12, color: pct === 100 ? '#4ade80' : 'var(--accent)', fontWeight: 700, minWidth: 36, textAlign: 'right' }}>{pct}%</span>
                  </div>
                </div>
                <ProgressBar value={pct} height={4} />
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* ── Section 4: Activity Timeline ── */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} style={cardStyle}>
        <div style={sectionLabel}>Activitate ({activity.length} evenimente)</div>
        {activity.length === 0 ? (
          <p style={{ fontSize: 13, color: 'var(--fg-3)', textAlign: 'center', padding: '16px 0' }}>Nicio activitate înregistrată.</p>
        ) : (
          <>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
              {visibleActivity.map((ev, idx) => (
                <div key={ev.id} style={{
                  display: 'flex', alignItems: 'flex-start', gap: 12,
                  padding: '10px 0',
                  borderBottom: idx < visibleActivity.length - 1 ? '1px solid var(--border)' : 'none',
                }}>
                  {/* Icon + line */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
                    <div style={{
                      width: 30, height: 30, borderRadius: '50%',
                      background: 'var(--bg-3)', border: '1px solid var(--border)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <ActivityIcon type={ev.type} />
                    </div>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 13, color: 'var(--fg)', lineHeight: 1.4, marginBottom: 3 }}>{ev.label}</p>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                      <span style={{ fontSize: 11, color: 'var(--fg-3)' }}>{timeAgo(ev.timestamp)}</span>
                      {ev.country && (
                        <span style={{ fontSize: 11, color: 'var(--fg-3)' }}>{ev.city ? `${ev.city}, ` : ''}{ev.country}</span>
                      )}
                      {Object.entries(ev.data || {}).slice(0, 2).map(([k, v]) => v ? (
                        <span key={k} style={{
                          fontSize: 10, padding: '1px 7px', borderRadius: 99,
                          background: 'var(--bg-3)', border: '1px solid var(--border)',
                          color: 'var(--fg-3)',
                        }}>
                          {k}: {v}
                        </span>
                      ) : null)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {activity.length > 50 && !showAllActivity && (
              <button
                onClick={() => setShowAllActivity(true)}
                style={{
                  marginTop: 12, width: '100%', padding: '9px', background: 'var(--bg-3)',
                  border: '1px solid var(--border)', borderRadius: 8, cursor: 'pointer',
                  fontSize: 12, color: 'var(--fg-3)', transition: 'border-color 0.15s',
                }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--border-hi)')}
                onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border)')}
              >
                Arată mai mult ({activity.length - 50} rămase)
              </button>
            )}
          </>
        )}
      </motion.div>

      {/* ── Section 5: Notes per lesson ── */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} style={cardStyle}>
        <div style={sectionLabel}>Notițe</div>
        {MODULES.map(mod => {
          const notesInModule = mod.lessons.map(l => ({
            lesson: l,
            note: localStorage.getItem(`aa_note_${userId}_${l.id}`) || '',
          })).filter(x => x.note.trim().length > 0);

          if (notesInModule.length === 0) return null;

          return (
            <div key={mod.id} style={{ marginBottom: 20 }}>
              <p style={{ fontSize: 11, color: 'var(--fg-3)', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 10 }}>
                {mod.etapa} — {mod.title}
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {notesInModule.map(({ lesson: l, note }) => {
                  const expanded = expandedNotes[l.id];
                  const preview = note.length > 200 ? note.slice(0, 200) + '...' : note;
                  return (
                    <div key={l.id} style={{ background: 'var(--bg-3)', border: '1px solid var(--border)', borderRadius: 10, padding: '12px 14px' }}>
                      <p style={{ fontSize: 11, color: 'var(--fg-3)', marginBottom: 6 }}>
                        {l.order_index}. {l.title}
                      </p>
                      <p style={{ fontSize: 13, color: 'var(--fg)', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                        {expanded ? note : preview}
                      </p>
                      {note.length > 200 && (
                        <button
                          onClick={() => setExpandedNotes(prev => ({ ...prev, [l.id]: !prev[l.id] }))}
                          style={{ marginTop: 6, background: 'none', border: 'none', cursor: 'pointer', fontSize: 11, color: 'var(--accent)', padding: 0 }}
                        >
                          {expanded ? 'Arată mai puțin' : 'Arată tot'}
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
        {MODULES.every(mod => mod.lessons.every(l => !localStorage.getItem(`aa_note_${userId}_${l.id}`)?.trim())) && (
          <p style={{ fontSize: 13, color: 'var(--fg-3)', textAlign: 'center', padding: '16px 0' }}>Nicio notiță salvată.</p>
        )}
      </motion.div>

      {/* ── Section 6: Exercise Answers ── */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} style={cardStyle}>
        <div style={sectionLabel}>Răspunsuri exerciții</div>
        {MODULES.map(mod => {
          const exWithAnswers = mod.exercises.map(ex => {
            const raw = localStorage.getItem(`aa_ex_${userId}_${ex.id}`);
            return { ex, raw };
          }).filter(x => x.raw);

          if (exWithAnswers.length === 0) return null;

          return (
            <div key={mod.id} style={{ marginBottom: 20 }}>
              <p style={{ fontSize: 11, color: 'var(--fg-3)', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 10 }}>
                {mod.etapa} — {mod.title}
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {exWithAnswers.map(({ ex, raw }) => {
                  const template = EXERCISE_TEMPLATES.find(t => t.exerciseId === ex.id);
                  const typeLabel = template?.type || 'unknown';
                  let parsed: unknown = null;
                  try { parsed = JSON.parse(raw!); } catch {}

                  // Calculate completion for checklist types
                  let completionPct: number | null = null;
                  if (typeLabel === 'checklist' && Array.isArray(parsed)) {
                    const checked = (parsed as boolean[]).filter(Boolean).length;
                    completionPct = template?.items ? Math.round((checked / template.items.length) * 100) : null;
                  }

                  return (
                    <div key={ex.id} style={{ background: 'var(--bg-3)', border: '1px solid var(--border)', borderRadius: 10, padding: '12px 14px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                        <span style={{ fontSize: 13, color: 'var(--fg)', fontWeight: 500, flex: 1 }}>{ex.title}</span>
                        <span style={{
                          fontSize: 10, padding: '2px 8px', borderRadius: 99,
                          background: 'var(--accent-dim)', border: '1px solid rgba(196,240,228,0.2)',
                          color: 'var(--accent)',
                        }}>
                          {typeLabel}
                        </span>
                        {completionPct !== null && (
                          <span style={{ fontSize: 11, color: completionPct === 100 ? '#4ade80' : 'var(--fg-3)' }}>
                            {completionPct}% completat
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
        {MODULES.every(mod => mod.exercises.every(ex => !localStorage.getItem(`aa_ex_${userId}_${ex.id}`))) && (
          <p style={{ fontSize: 13, color: 'var(--fg-3)', textAlign: 'center', padding: '16px 0' }}>Niciun exercițiu completat.</p>
        )}
      </motion.div>
    </div>
  );
};
