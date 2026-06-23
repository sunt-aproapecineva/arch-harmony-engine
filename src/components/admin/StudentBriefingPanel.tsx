// @ts-nocheck
import React, { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
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

function getTextContent(node: React.ReactNode): string {
  if (typeof node === 'string' || typeof node === 'number') return String(node);
  if (Array.isArray(node)) return node.map(getTextContent).join('');
  if (React.isValidElement(node) && node.props.children) return getTextContent(node.props.children);
  return '';
}

const mdComponents = {
  h2: ({ children }: { children?: React.ReactNode }) => (
    <h3 style={{ fontSize: 13, fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.06em', marginTop: 18, marginBottom: 8 }}>
      {children}
    </h3>
  ),
  h3: ({ children }: { children?: React.ReactNode }) => (
    <h4 style={{ fontSize: 12, fontWeight: 700, color: 'var(--fg-2)', marginTop: 14, marginBottom: 6 }}>{children}</h4>
  ),
  p: ({ children }: { children?: React.ReactNode }) => (
    <p style={{ fontSize: 13.5, color: 'var(--fg-2)', lineHeight: 1.65, marginBottom: 10 }}>{children}</p>
  ),
  ul: ({ children }: { children?: React.ReactNode }) => (
    <ul style={{ paddingLeft: 18, marginBottom: 10 }}>{children}</ul>
  ),
  li: ({ children }: { children?: React.ReactNode }) => (
    <li style={{ fontSize: 13.5, color: 'var(--fg-2)', lineHeight: 1.6, marginBottom: 4 }}>{children}</li>
  ),
  strong: ({ children }: { children?: React.ReactNode }) => (
    <strong style={{ color: 'var(--fg)', fontWeight: 700 }}>{children}</strong>
  ),
  em: ({ children }: { children?: React.ReactNode }) => (
    <em style={{ color: 'var(--fg-2)' }}>{children}</em>
  ),
};

interface QuestionPair { q: string; ctx: string; }
interface Category { letter: string; title: string; pairs: QuestionPair[]; }

function splitTopLevelSections(text: string): { title: string; body: string }[] {
  const raw = text.replace(/^\s+|\s+$/g, '');
  if (!raw) return [];
  const blocks = raw.split(/\n(?=## )/).filter(Boolean);
  return blocks.map((block) => {
    const lines = block.split('\n');
    const first = lines[0].replace(/^##\s*/, '').trim();
    const body = lines.slice(1).join('\n').trim();
    return { title: first, body };
  });
}

function splitCategories(text: string): Category[] {
  const raw = text.replace(/^\s+|\s+$/g, '');
  if (!raw) return [];
  const blocks = raw.split(/\n(?=### )/).filter(Boolean);
  return blocks.map((block) => {
    const lines = block.split('\n');
    const header = lines[0].replace(/^###\s*/, '').trim();
    const letterMatch = header.match(/^([A-F])\.\s*(.*)$/);
    const letter = letterMatch?.[1] || '';
    const title = letterMatch?.[2] || header;
    const bodyLines = lines.slice(1).map((l) => l.trim()).filter((l) => l !== '');
    const pairs: QuestionPair[] = [];
    let current: QuestionPair | null = null;
    for (const line of bodyLines) {
      const qMatch = line.match(/^\*\*Întrebare:\*\*\s*(.+)$/);
      const cMatch = line.match(/^_(Context elev):_\s*(.+)$/);
      if (qMatch) {
        if (current) pairs.push(current);
        current = { q: qMatch[1].trim(), ctx: '' };
      } else if (cMatch && current) {
        current.ctx = cMatch[2].trim();
      }
    }
    if (current) pairs.push(current);
    return { letter, title, pairs };
  });
}

function NormalSection({ title, body }: { title: string; body: string }) {
  return (
    <div style={{ marginBottom: 4 }}>
      <h3 style={{ fontSize: 13, fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8, marginTop: 0 }}>
        {title}
      </h3>
      <ReactMarkdown components={mdComponents}>{body}</ReactMarkdown>
    </div>
  );
}

function QuestionsSection({ body }: { body: string }) {
  const categories = splitCategories(body);
  if (categories.length === 0) {
    return <ReactMarkdown components={mdComponents}>{body}</ReactMarkdown>;
  }
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {categories.map((cat, idx) => (
        <div
          key={idx}
          style={{
            background: 'var(--bg)',
            border: '1px solid var(--border)',
            borderRadius: 12,
            padding: '14px 16px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 26,
                height: 26,
                borderRadius: 7,
                background: 'var(--accent)',
                color: '#0D0907',
                fontSize: 12,
                fontWeight: 800,
              }}
            >
              {cat.letter}
            </span>
            <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--fg)' }}>{cat.title}</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {cat.pairs.map((pair, i) => (
              <div
                key={i}
                style={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border)',
                  borderRadius: 10,
                  padding: '12px 14px',
                }}
              >
                <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--accent)', fontWeight: 700, marginBottom: 6 }}>
                  Întrebare
                </div>
                <div style={{ fontSize: 14, color: 'var(--fg)', lineHeight: 1.55, marginBottom: pair.ctx ? 10 : 0 }}>
                  {pair.q}
                </div>
                {pair.ctx && (
                  <div style={{ borderLeft: '3px solid var(--accent)', paddingLeft: 10 }}>
                    <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--fg-3)', fontWeight: 700, marginBottom: 4 }}>
                      Context elev
                    </div>
                    <div style={{ fontSize: 13, color: 'var(--fg-2)', lineHeight: 1.55, fontStyle: 'italic' }}>
                      {pair.ctx}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export function BriefingMarkdown({ text }: { text: string }) {
  const sections = splitTopLevelSections(text);
  if (sections.length === 0) return <ReactMarkdown components={mdComponents}>{text}</ReactMarkdown>;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {sections.map((section, idx) => {
        const isQuestions = /^6[.\s]/.test(section.title) || section.title.toLowerCase().includes('întrebări');
        return (
          <div
            key={idx}
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              borderRadius: 14,
              padding: '18px 20px',
            }}
          >
            {isQuestions ? (
              <>
                <h3 style={{ fontSize: 13, fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 14, marginTop: 0 }}>
                  {section.title}
                </h3>
                <QuestionsSection body={section.body} />
              </>
            ) : (
              <NormalSection title={section.title} body={section.body} />
            )}
          </div>
        );
      })}
    </div>
  );
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
          <div><BriefingMarkdown text={summary} /></div>

        ) : null}
      </motion.div>
    </div>
  );
};
