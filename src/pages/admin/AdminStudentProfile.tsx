// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { useServerFn } from '@tanstack/react-start';
import { useParams, useNavigate, Link } from '@/lib/router-compat';
import { motion } from 'framer-motion';
import {
  ArrowLeft, LogIn, CheckCircle, FileText, Award, UserPlus, Pencil,
  AlertTriangle, ChevronDown, ChevronUp, RefreshCw,
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { MockUser, Progress } from '../../lib/types';
import { MODULES } from '../../lib/data';
import { TariffBadge } from '../../components/aa/TariffBadge';
import { ProgressBar } from '../../components/aa/ProgressBar';
import { getActivityForUser, ActivityEvent, timeAgo, ActivityType } from '../../lib/activity';
import { generateProfile, QuizProfile } from '../../lib/quizProfile';
import { EXERCISE_TEMPLATES } from '../../lib/exerciseData';
import { recoverStudentExerciseResponses } from '../../lib/adminRecovery.functions';
import { StudentBriefingPanel } from '@/components/admin/StudentBriefingPanel';
import { SupervisorNotesPanel } from '@/components/admin/SupervisorNotesPanel';

type TabKey = 'briefing' | 'raw' | 'notes';

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

// ── Readable answer renderer ──────────────────────────────────────────────────
function renderReadableAnswer(
  parsed: any,
  template: any
): { node: React.ReactNode; metric?: string; metricColor?: string } {
  // Empty / null
  if (parsed === null || parsed === undefined) {
    return { node: <p style={{ fontSize: 12, color: 'var(--fg-3)', fontStyle: 'italic' }}>Fără răspuns</p> };
  }

  // Plain string / number
  if (typeof parsed === 'string' || typeof parsed === 'number') {
    return {
      node: <p style={{ fontSize: 13, color: 'var(--fg)', whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>{String(parsed)}</p>,
    };
  }

  // Array of objects → dynamic-table rows
  if (Array.isArray(parsed)) {
    const rows = parsed.filter((r: any) => r && typeof r === 'object' && Object.keys(r).length > 0);
    return {
      metric: `${rows.length} ${rows.length === 1 ? 'rând' : 'rânduri'}`,
      metricColor: rows.length > 0 ? '#4ade80' : 'var(--fg-3)',
      node: rows.length === 0 ? (
        <p style={{ fontSize: 12, color: 'var(--fg-3)', fontStyle: 'italic' }}>Niciun rând completat</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {rows.map((row: any, i: number) => (
            <div key={i} style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 6, padding: '8px 10px' }}>
              <div style={{ fontSize: 10, color: 'var(--fg-3)', marginBottom: 4 }}>#{i + 1}</div>
              {Object.entries(row).map(([k, v]) => (
                <div key={k} style={{ display: 'flex', gap: 8, fontSize: 12, marginBottom: 2 }}>
                  <span style={{ color: 'var(--fg-3)', minWidth: 130, flexShrink: 0 }}>{k}:</span>
                  <span style={{ color: 'var(--fg)', whiteSpace: 'pre-wrap' }}>{String(v ?? '—')}</span>
                </div>
              ))}
            </div>
          ))}
        </div>
      ),
    };
  }

  // Object
  if (typeof parsed === 'object') {
    if (Array.isArray(parsed.rows)) {
      const rows = parsed.rows.filter((r: any) => r && typeof r === 'object' && Object.values(r).some(v => String(v ?? '').trim() !== ''));
      const conclusion = typeof parsed.conclusion === 'string' ? parsed.conclusion.trim() : '';
      return {
        metric: `${rows.length} ${rows.length === 1 ? 'rând' : 'rânduri'}${conclusion ? ' • concluzie' : ''}`,
        metricColor: rows.length > 0 || conclusion ? '#4ade80' : 'var(--fg-3)',
        node: (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {rows.map((row: any, i: number) => (
              <div key={i} style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 6, padding: '8px 10px' }}>
                <div style={{ fontSize: 10, color: 'var(--fg-3)', marginBottom: 4 }}>#{i + 1}</div>
                {Object.entries(row).filter(([, v]) => String(v ?? '').trim() !== '').map(([k, v]) => (
                  <div key={k} style={{ display: 'flex', gap: 8, fontSize: 12, marginBottom: 2 }}>
                    <span style={{ color: 'var(--fg-3)', minWidth: 130, flexShrink: 0 }}>{k}:</span>
                    <span style={{ color: 'var(--fg)', whiteSpace: 'pre-wrap' }}>{String(v ?? '—')}</span>
                  </div>
                ))}
              </div>
            ))}
            {conclusion && <div style={{ fontSize: 13, color: 'var(--fg)', whiteSpace: 'pre-wrap', lineHeight: 1.5, background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 6, padding: '8px 10px' }}>{conclusion}</div>}
          </div>
        ),
      };
    }

    const entries = Object.entries(parsed);
    const values = entries.map(([, v]) => v);

    // Checklist: all booleans
    if (values.length > 0 && values.every(v => typeof v === 'boolean')) {
      const checked = values.filter(Boolean).length;
      const total = template?.items?.length || values.length;
      const pct = total > 0 ? Math.round((checked / total) * 100) : 0;
      return {
        metric: `${checked}/${total} bifate (${pct}%)`,
        metricColor: pct === 100 ? '#4ade80' : 'var(--fg-3)',
        node: (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {(template?.items || entries.map(([id]) => ({ id, label: id }))).map((it: any) => {
              const isChecked = !!(parsed as any)[it.id];
              return (
                <div key={it.id} style={{ display: 'flex', gap: 8, fontSize: 12, alignItems: 'flex-start' }}>
                  <span style={{ color: isChecked ? '#4ade80' : 'var(--fg-3)', flexShrink: 0, marginTop: 1 }}>
                    {isChecked ? '✓' : '○'}
                  </span>
                  <span style={{ color: isChecked ? 'var(--fg)' : 'var(--fg-3)', textDecoration: isChecked ? 'none' : 'none' }}>
                    {it.label}
                  </span>
                </div>
              );
            })}
          </div>
        ),
      };
    }

    // Numeric ratings (diagnostic-grid d1..d50)
    if (values.length > 0 && values.every(v => typeof v === 'number')) {
      const nums = values as number[];
      const avg = nums.reduce((a, b) => a + b, 0) / nums.length;
      const distribution: Record<number, number> = {};
      nums.forEach(n => { distribution[n] = (distribution[n] || 0) + 1; });
      const max = Math.max(...nums);
      return {
        metric: `Medie: ${avg.toFixed(2)} • ${nums.length} întrebări`,
        metricColor: avg >= 4 ? '#4ade80' : avg >= 3 ? 'var(--accent)' : avg >= 2 ? '#fb923c' : '#f87171',
        node: (
          <div>
            <div style={{ display: 'flex', gap: 6, marginBottom: 8, flexWrap: 'wrap' }}>
              {[1, 2, 3, 4, 5].map(score => {
                const count = distribution[score] || 0;
                const pctOfMax = max > 0 ? (count / nums.length) * 100 : 0;
                const color = score <= 2 ? '#f87171' : score === 3 ? '#fb923c' : '#4ade80';
                return (
                  <div key={score} style={{ flex: 1, minWidth: 60, background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 6, padding: '6px 8px' }}>
                    <div style={{ fontSize: 10, color: 'var(--fg-3)' }}>Scor {score}</div>
                    <div style={{ fontSize: 16, fontWeight: 700, color }}>{count}</div>
                    <div style={{ height: 3, background: 'var(--border)', borderRadius: 2, marginTop: 4, overflow: 'hidden' }}>
                      <div style={{ width: `${pctOfMax}%`, height: '100%', background: color }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ),
      };
    }

    // Generic object: key/value pairs (form-fields). Use template field labels when available.
    const fieldMap: Record<string, string> = {};
    (template?.fields || []).forEach((f: any) => { if (f.id && f.label) fieldMap[f.id] = f.label; });

    const filled = entries.filter(([, v]) => v !== null && v !== undefined && String(v).trim() !== '');
    return {
      metric: `${filled.length}/${entries.length} câmpuri`,
      metricColor: filled.length === entries.length ? '#4ade80' : 'var(--fg-3)',
      node: (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {entries.map(([k, v]) => {
            const label = fieldMap[k] || k;
            const val = v === null || v === undefined || String(v).trim() === '' ? null : String(v);
            return (
              <div key={k}>
                <div style={{ fontSize: 11, color: 'var(--fg-3)', marginBottom: 3 }}>{label}</div>
                {val ? (
                  <div style={{ fontSize: 13, color: 'var(--fg)', whiteSpace: 'pre-wrap', lineHeight: 1.5, background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 6, padding: '8px 10px' }}>
                    {val}
                  </div>
                ) : (
                  <div style={{ fontSize: 12, color: 'var(--fg-3)', fontStyle: 'italic' }}>—</div>
                )}
              </div>
            );
          })}
        </div>
      ),
    };
  }

  return { node: <pre style={{ fontSize: 11, color: 'var(--fg-2)' }}>{JSON.stringify(parsed, null, 2)}</pre> };
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
  const [notesByLesson, setNotesByLesson] = useState<Record<string, string>>({});
  const [exercisesById, setExercisesById] = useState<Record<string, any>>({});
  const [refreshing, setRefreshing] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null);
  const [recoveringDrafts, setRecoveringDrafts] = useState(false);
  const [recoveryMessage, setRecoveryMessage] = useState<string | null>(null);
  const recoverResponses = useServerFn(recoverStudentExerciseResponses);
  const [tab, setTab] = useState<TabKey>('briefing');

  const handleRecoverLocalDrafts = async () => {
    if (!userId) return;
    setRecoveringDrafts(true);
    setRecoveryMessage(null);
    try {
      const exerciseIds = MODULES.flatMap((m: any) => (m.exercises || []).map((ex: any) => ex.id));
      const responses: { exercise_id: string; response: any }[] = [];
      exerciseIds.forEach((exerciseId: string) => {
        const candidateKeys = [`aa_ex_${userId}_${exerciseId}`, `aa_ex_anon_${exerciseId}`, `aa_ex_${exerciseId}`];
        const matchingKeys: string[] = [];
        for (let i = 0; i < localStorage.length; i += 1) {
          const key = localStorage.key(i);
          if (key && key.startsWith('aa_ex_') && key.endsWith(`_${exerciseId}`)) matchingKeys.push(key);
        }
        const key = [...candidateKeys, ...matchingKeys].find((k) => localStorage.getItem(k));
        if (!key) return;
        try {
          const parsed = JSON.parse(localStorage.getItem(key) || 'null');
          if (parsed !== null) responses.push({ exercise_id: exerciseId, response: parsed });
        } catch {}
      });
      if (responses.length === 0) {
        setRecoveryMessage('Nu am găsit drafturi locale în acest browser pentru acest student. Studentul trebuie să redeschidă exercițiile sau să le completeze din nou.');
        return;
      }
      const result = await recoverResponses({ data: { studentId: userId, responses } });
      setRecoveryMessage(`Am recuperat ${result.saved} răspunsuri locale și le-am salvat în cloud.`);
      await loadAll();
    } catch (err: any) {
      setRecoveryMessage(err?.message || 'Nu am putut recupera drafturile locale.');
    } finally {
      setRecoveringDrafts(false);
    }
  };

  const loadAll = React.useCallback(async () => {
    if (!userId) return;
    setRefreshing(true);
    try {
      const [{ data: profile }, { data: progressRows }, { data: quiz }, { data: notesRows }, { data: exRows }] = await Promise.all([
        supabase.from('profiles').select('id,email,full_name,tariff,avatar_url,created_at').eq('id', userId).maybeSingle(),
        supabase.from('progress').select('user_id,lesson_id,completed_at').eq('user_id', userId),
        supabase.from('quiz_responses').select('answers,completed_at').eq('user_id', userId).maybeSingle(),
        supabase.from('lesson_notes').select('lesson_id,content').eq('user_id', userId),
        supabase.from('exercise_responses').select('exercise_id,response').eq('user_id', userId),
      ]);
      if (profile) {
        setUser({
          id: profile.id,
          email: profile.email,
          full_name: profile.full_name || '',
          tariff: (profile.tariff as any) || 'student',
          avatar_url: profile.avatar_url,
          created_at: profile.created_at,
          role: 'student',
        } as any);
      }
      setProgress((progressRows || []) as any);
      if (quiz?.answers) {
        const answers = quiz.answers as Record<string, string | string[]>;
        setQuizAnswers(answers);
        setQuizProfile(generateProfile(answers));
      } else {
        setQuizAnswers(null);
        setQuizProfile(null);
      }
      const notesMap: Record<string, string> = {};
      (notesRows || []).forEach((n: any) => { notesMap[n.lesson_id] = n.content || ''; });
      setNotesByLesson(notesMap);
      const exMap: Record<string, any> = {};
      (exRows || []).forEach((e: any) => { exMap[e.exercise_id] = e.response; });
      setExercisesById(exMap);
      try {
        const acts = await getActivityForUser(userId);
        setActivity(acts);
      } catch {
        setActivity([]);
      }
      setLastRefreshed(new Date());
    } finally {
      setRefreshing(false);
    }
  }, [userId]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

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
      {/* Back link + Refresh */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
        <Link
          to="/admin/users"
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13,
            color: 'var(--fg-3)', textDecoration: 'none',
            transition: 'color 0.15s',
          }}
          onMouseEnter={e => (e.currentTarget.style.color = 'var(--fg)')}
          onMouseLeave={e => (e.currentTarget.style.color = 'var(--fg-3)')}
        >
          <ArrowLeft size={14} /> Înapoi la utilizatori
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {lastRefreshed && (
            <span style={{ fontSize: 11, color: 'var(--fg-3)' }}>
              Actualizat: {lastRefreshed.toLocaleTimeString('ro-RO', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </span>
          )}
          <button
            onClick={loadAll}
            disabled={refreshing}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              fontSize: 12, fontWeight: 600,
              background: 'var(--bg-card)', border: '1px solid var(--border)',
              color: 'var(--fg)', padding: '6px 12px', borderRadius: 8,
              cursor: refreshing ? 'wait' : 'pointer',
              opacity: refreshing ? 0.6 : 1,
              transition: 'all 0.15s',
            }}
          >
            <RefreshCw size={13} style={{ animation: refreshing ? 'spin 1s linear infinite' : 'none' }} />
            {refreshing ? 'Se actualizează…' : 'Reîmprospătează'}
          </button>
        </div>
      </div>

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
            note: notesByLesson[l.id] || '',
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
        {Object.keys(notesByLesson).length === 0 && (
          <p style={{ fontSize: 13, color: 'var(--fg-3)', textAlign: 'center', padding: '16px 0' }}>Nicio notiță salvată.</p>
        )}
      </motion.div>

      {/* ── Section 6: Exercise Answers ── */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} style={cardStyle}>
        <div style={sectionLabel}>Răspunsuri exerciții</div>

        {(() => {
          const exerciseLessons = MODULES.flatMap(m => m.lessons.filter((l: any) => l.type === 'exercise' && l.exercise_id));
          const totalEx = exerciseLessons.length;
          const completedLessons = exerciseLessons.filter((l: any) => progress.some(p => p.lesson_id === l.id));
          const completedEx = Object.keys(exercisesById).length;
          const missingResponses = completedLessons.filter((l: any) => exercisesById[l.exercise_id] === undefined);
          return (
            <div style={{ marginBottom: 16 }}>
              <p style={{ fontSize: 12, color: 'var(--fg-3)', marginBottom: missingResponses.length ? 10 : 0 }}>
                <strong style={{ color: 'var(--accent)' }}>{completedEx}</strong> răspunsuri salvate din <strong style={{ color: 'var(--fg)' }}>{totalEx}</strong> exerciții · <strong style={{ color: 'var(--fg)' }}>{completedLessons.length}</strong> exerciții marcate finalizate
              </p>
              {missingResponses.length > 0 && (
                <div style={{ background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.22)', borderRadius: 8, padding: '10px 12px' }}>
                  <p style={{ fontSize: 12, color: '#fca5a5', marginBottom: 6, fontWeight: 600 }}>Finalizate, dar fără răspuns salvat în cloud:</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    {missingResponses.map((l: any) => <span key={l.id} style={{ fontSize: 12, color: 'var(--fg-2)' }}>• {l.title}</span>)}
                  </div>
                  <button
                    onClick={handleRecoverLocalDrafts}
                    disabled={recoveringDrafts}
                    style={{ marginTop: 10, padding: '8px 12px', background: 'var(--bg-3)', border: '1px solid rgba(248,113,113,0.28)', borderRadius: 8, color: 'var(--fg)', cursor: recoveringDrafts ? 'not-allowed' : 'pointer', fontSize: 12, fontWeight: 600 }}
                  >
                    {recoveringDrafts ? 'Se recuperează...' : 'Recuperează drafturi locale'}
                  </button>
                  {recoveryMessage && <p style={{ marginTop: 8, fontSize: 12, color: 'var(--fg-3)', lineHeight: 1.5 }}>{recoveryMessage}</p>}
                </div>
              )}
            </div>
          );
        })()}

        {MODULES.map(mod => {
          const exWithAnswers = ((mod as any).exercises || []).map((ex: any) => ({
            ex,
            parsed: exercisesById[ex.id],
          })).filter((x: any) => x.parsed !== undefined);

          if (exWithAnswers.length === 0) return null;

          return (
            <div key={mod.id} style={{ marginBottom: 20 }}>
              <p style={{ fontSize: 11, color: 'var(--fg-3)', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 10 }}>
                {mod.etapa} — {mod.title}
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {exWithAnswers.map(({ ex, parsed }: any) => {
                  const template = EXERCISE_TEMPLATES.find(t => t.exerciseId === ex.id);
                  const typeLabel = template?.type || 'form';
                  const summary = renderReadableAnswer(parsed, template);

                  return (
                    <div key={ex.id} style={{ background: 'var(--bg-3)', border: '1px solid var(--border)', borderRadius: 10, padding: '12px 14px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 10 }}>
                        <span style={{ fontSize: 13, color: 'var(--fg)', fontWeight: 600, flex: 1 }}>{ex.title}</span>
                        <span style={{
                          fontSize: 10, padding: '2px 8px', borderRadius: 99,
                          background: 'var(--accent-dim)', border: '1px solid rgba(196,240,228,0.2)',
                          color: 'var(--accent)',
                        }}>
                          {typeLabel}
                        </span>
                        {summary.metric && (
                          <span style={{ fontSize: 11, color: summary.metricColor || 'var(--fg-3)', fontWeight: 600 }}>
                            {summary.metric}
                          </span>
                        )}
                      </div>
                      {summary.node}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
        {Object.keys(exercisesById).length === 0 && (
          <p style={{ fontSize: 13, color: 'var(--fg-3)', textAlign: 'center', padding: '16px 0' }}>Niciun exercițiu completat.</p>
        )}
      </motion.div>
    </div>
  );
};
