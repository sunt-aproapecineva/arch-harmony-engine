// @ts-nocheck
import React, { useEffect, useState } from 'react';
import { useServerFn } from '@tanstack/react-start';
import { motion } from 'framer-motion';
import { Sparkles, RefreshCw, AlertCircle, TrendingUp, Activity, Brain, Calendar } from 'lucide-react';
import {
  generateStudentInsight,
  getStudentInsightBundle,
} from '@/lib/studentInsights.functions';
import { STATUS_LABEL, STATUS_COLOR, type StudentScores } from '@/lib/studentScoring';

interface Props {
  studentId: string;
  studentName: string;
}

const cardStyle: React.CSSProperties = {
  background: 'var(--bg-card)',
  border: '1px solid var(--border)',
  borderRadius: 16,
  padding: 24,
  marginBottom: 20,
};

function scoreColor(v: number): string {
  if (v >= 75) return '#4ade80';
  if (v >= 50) return 'var(--accent)';
  if (v >= 25) return '#fbbf24';
  return '#f87171';
}

function ScoreBar({ label, value, icon }: { label: string; value: number; icon: React.ReactNode }) {
  const color = scoreColor(value);
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--fg-2)' }}>
          <span style={{ color }}>{icon}</span> {label}
        </span>
        <span style={{ fontSize: 14, fontWeight: 700, color }}>{value}</span>
      </div>
      <div style={{ height: 6, background: 'var(--border)', borderRadius: 3, overflow: 'hidden' }}>
        <div style={{ width: `${value}%`, height: '100%', background: color, transition: 'width 0.6s ease' }} />
      </div>
    </div>
  );
}

// Lightweight markdown rendering (## H2 + paragraphs + bullets)
function MarkdownLite({ text }: { text: string }) {
  const lines = text.split('\n');
  const blocks: React.ReactNode[] = [];
  let buf: string[] = [];
  const flush = (key: string) => {
    if (!buf.length) return;
    const para = buf.join(' ').trim();
    if (para) blocks.push(<p key={key} style={{ fontSize: 13.5, color: 'var(--fg-2)', lineHeight: 1.65, marginBottom: 10 }}>{para}</p>);
    buf = [];
  };
  lines.forEach((raw, i) => {
    const line = raw.trim();
    if (line.startsWith('## ')) {
      flush(`p-${i}`);
      blocks.push(
        <h3 key={`h-${i}`} style={{ fontSize: 13, fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.06em', marginTop: 18, marginBottom: 8 }}>
          {line.replace(/^##\s*/, '')}
        </h3>
      );
    } else if (line.startsWith('- ') || line.startsWith('* ')) {
      flush(`p-${i}`);
      blocks.push(
        <div key={`li-${i}`} style={{ display: 'flex', gap: 8, fontSize: 13, color: 'var(--fg-2)', lineHeight: 1.6, marginBottom: 4 }}>
          <span style={{ color: 'var(--accent)' }}>•</span><span>{line.replace(/^[-*]\s*/, '')}</span>
        </div>
      );
    } else if (line === '') {
      flush(`p-${i}`);
    } else {
      buf.push(line);
    }
  });
  flush('p-end');
  return <>{blocks}</>;
}

export const StudentBriefingPanel: React.FC<Props> = ({ studentId, studentName }) => {
  const [scores, setScores] = useState<StudentScores | null>(null);
  const [stuck, setStuck] = useState<{ id: string; label: string } | null>(null);
  const [summary, setSummary] = useState<string | null>(null);
  const [generatedAt, setGeneratedAt] = useState<string | null>(null);
  const [modelUsed, setModelUsed] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBundle = useServerFn(getStudentInsightBundle);
  const generateFn = useServerFn(generateStudentInsight);

  const load = async () => {
    setLoading(true); setError(null);
    try {
      const res = await fetchBundle({ data: { studentId } });
      setScores(res.scores);
      setStuck(res.stuckModule);
      if (res.cached) {
        setSummary(res.cached.summary || null);
        setGeneratedAt(res.cached.generated_at || null);
        setModelUsed(res.cached.model_used || null);
      } else {
        setSummary(null); setGeneratedAt(null); setModelUsed(null);
      }
    } catch (e: any) {
      setError(e?.message || 'Eroare la încărcare.');
    } finally { setLoading(false); }
  };

  const generate = async (force = false) => {
    setGenerating(true); setError(null);
    try {
      const res = await generateFn({ data: { studentId, force } });
      setSummary(res.summary);
      setGeneratedAt(res.generated_at);
      setModelUsed(res.model_used);
      if (res.scores) setScores(res.scores);
    } catch (e: any) {
      setError(e?.message || 'Nu am putut genera rezumatul.');
    } finally { setGenerating(false); }
  };

  useEffect(() => { load(); }, [studentId]);

  if (loading) {
    return <div style={{ padding: 32, textAlign: 'center', color: 'var(--fg-3)', fontSize: 13 }}>Se încarcă briefingul…</div>;
  }

  return (
    <div>
      {/* Scores card */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} style={cardStyle}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18, flexWrap: 'wrap', gap: 8 }}>
          <div className="font-aboreto" style={{ fontSize: 10, letterSpacing: '0.12em', color: 'var(--fg-3)', textTransform: 'uppercase' }}>
            Indicatori-cheie
          </div>
          {scores && (
            <span style={{
              fontSize: 11, fontWeight: 700, padding: '4px 12px', borderRadius: 99,
              background: 'var(--bg-3)', border: `1px solid ${STATUS_COLOR[scores.status]}55`,
              color: STATUS_COLOR[scores.status],
            }}>
              {STATUS_LABEL[scores.status]}
            </span>
          )}
        </div>
        {scores && (
          <>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 14, marginBottom: 20, flexWrap: 'wrap' }}>
              <div>
                <div style={{ fontSize: 11, color: 'var(--fg-3)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>Scor global</div>
                <div style={{ fontSize: 36, fontWeight: 800, lineHeight: 1, color: scoreColor(scores.overall) }}>{scores.overall}<span style={{ fontSize: 14, color: 'var(--fg-3)', fontWeight: 500 }}>/100</span></div>
              </div>
              <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', fontSize: 12, color: 'var(--fg-3)' }}>
                <div>📚 <strong style={{ color: 'var(--fg)' }}>{scores.lessonsCompleted}/{scores.lessonsTotal}</strong> lecții</div>
                <div>✍️ <strong style={{ color: 'var(--fg)' }}>{scores.exercisesAttempted}/{scores.exercisesTotal}</strong> exerciții</div>
                <div>📝 <strong style={{ color: 'var(--fg)' }}>{scores.notesCount}</strong> notițe</div>
                <div>📅 <strong style={{ color: 'var(--fg)' }}>{scores.activeDays30}</strong> zile active /30</div>
                <div>⏱ Ultima activitate: <strong style={{ color: 'var(--fg)' }}>{scores.daysSinceLastActive === null ? 'niciodată' : `acum ${scores.daysSinceLastActive} zile`}</strong></div>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14 }}>
              <ScoreBar label="Implicare" value={scores.engagement} icon={<Activity size={13} />} />
              <ScoreBar label="Înțelegere" value={scores.understanding} icon={<Brain size={13} />} />
              <ScoreBar label="Consistență" value={scores.consistency} icon={<Calendar size={13} />} />
            </div>
            {stuck && (
              <div style={{ marginTop: 16, padding: '10px 14px', background: 'rgba(251,146,60,0.08)', border: '1px solid rgba(251,146,60,0.25)', borderRadius: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
                <AlertCircle size={14} style={{ color: '#fb923c', flexShrink: 0 }} />
                <span style={{ fontSize: 12, color: '#fdba74' }}>Posibil blocat la: <strong>{stuck.label}</strong></span>
              </div>
            )}
          </>
        )}
      </motion.div>

      {/* AI Summary card */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} style={cardStyle}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, flexWrap: 'wrap', gap: 10 }}>
          <div className="font-aboreto" style={{ fontSize: 10, letterSpacing: '0.12em', color: 'var(--fg-3)', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 6 }}>
            <Sparkles size={12} style={{ color: 'var(--accent)' }} /> Briefing AI — {studentName}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {generatedAt && (
              <span style={{ fontSize: 10, color: 'var(--fg-3)' }}>
                Generat: {new Date(generatedAt).toLocaleString('ro-RO', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                {modelUsed ? ` · ${modelUsed.replace('google/', '')}` : ''}
              </span>
            )}
            <button
              onClick={() => generate(!!summary)}
              disabled={generating}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                fontSize: 12, fontWeight: 700,
                background: summary ? 'var(--bg-3)' : 'var(--accent)',
                color: summary ? 'var(--fg)' : '#0D0907',
                border: summary ? '1px solid var(--border)' : 'none',
                padding: '7px 14px', borderRadius: 8,
                cursor: generating ? 'wait' : 'pointer',
                opacity: generating ? 0.6 : 1,
              }}
            >
              {summary ? <RefreshCw size={12} className={generating ? 'animate-spin' : ''} /> : <Sparkles size={12} />}
              {generating ? 'Se generează...' : (summary ? 'Regenerează' : 'Generează briefing')}
            </button>
          </div>
        </div>

        {error && (
          <div style={{ padding: '10px 12px', background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.25)', borderRadius: 8, fontSize: 12, color: '#fca5a5', marginBottom: 12 }}>
            {error}
          </div>
        )}

        {!summary && !generating ? (
          <div style={{ padding: '20px 0', textAlign: 'center', color: 'var(--fg-3)', fontSize: 13 }}>
            Nu există încă un briefing AI pentru acest elev. Apasă <strong style={{ color: 'var(--fg-2)' }}>Generează briefing</strong> pentru a-l crea pe baza activității lui.
          </div>
        ) : generating && !summary ? (
          <div style={{ padding: '20px 0', textAlign: 'center', color: 'var(--fg-3)', fontSize: 13 }}>
            <TrendingUp size={16} style={{ marginRight: 6, verticalAlign: 'middle' }} /> AI analizează datele elevului...
          </div>
        ) : summary ? (
          <div><MarkdownLite text={summary} /></div>
        ) : null}
      </motion.div>
    </div>
  );
};
