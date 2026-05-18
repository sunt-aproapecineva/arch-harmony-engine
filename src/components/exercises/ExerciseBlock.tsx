// @ts-nocheck
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Plus, Trash2, ChevronRight, CheckCircle2, RotateCcw, AlertCircle } from 'lucide-react';
import { getExerciseTemplate, ExerciseTemplate, QuizQuestionItem } from '../../lib/exerciseData';
import { useAuthContext } from '../../context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useExerciseCompletions } from '../../hooks/useExerciseCompletions';

interface ExerciseBlockProps {
  exerciseId: string;
}

// ─── Checklist ────────────────────────────────────────────────────────────────
const ChecklistExercise: React.FC<{ template: ExerciseTemplate; storageKey: string }> = ({
  template,
  storageKey,
}) => {
  const [checked, setChecked] = useState<Record<string, boolean>>(() => {
    try {
      const s = localStorage.getItem(storageKey);
      return s ? JSON.parse(s) : {};
    } catch {
      return {};
    }
  });
  const [savedAt, setSavedAt] = useState<string | null>(null);

  const toggle = (id: string) => {
    const next = { ...checked, [id]: !checked[id] };
    setChecked(next);
    localStorage.setItem(storageKey, JSON.stringify(next));
    setSavedAt(new Date().toLocaleTimeString('ro-RO', { hour: '2-digit', minute: '2-digit' }));
  };

  const items = template.items || [];
  const doneCount = items.filter(i => checked[i.id]).length;

  return (
    <div>
      <p style={{ fontSize: 13, color: 'var(--fg-3)', marginBottom: 16, lineHeight: 1.7 }}>{template.instructions}</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 12 }}>
        {items.map((item, idx) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.04 }}
            onClick={() => toggle(item.id)}
            style={{
              display: 'flex', alignItems: 'flex-start', gap: 12, padding: '10px 14px',
              borderRadius: 10, cursor: 'pointer',
              background: checked[item.id] ? 'rgba(74,222,128,0.08)' : 'var(--bg-3)',
              border: `1px solid ${checked[item.id] ? 'rgba(74,222,128,0.25)' : 'var(--border)'}`,
              transition: 'all 0.15s',
            }}
          >
            <div style={{
              width: 20, height: 20, borderRadius: 6, flexShrink: 0, marginTop: 1,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: checked[item.id] ? 'rgba(74,222,128,0.2)' : 'var(--bg-2)',
              border: `1.5px solid ${checked[item.id] ? '#4ade80' : 'var(--border)'}`,
              transition: 'all 0.15s',
            }}>
              {checked[item.id] && <Check size={11} style={{ color: '#4ade80' }} />}
            </div>
            <span style={{ fontSize: 13, color: checked[item.id] ? 'var(--fg-2)' : 'var(--fg)', lineHeight: 1.5 }}>
              {item.label}
            </span>
          </motion.div>
        ))}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 11, color: 'var(--fg-3)' }}>
        <span>{doneCount}/{items.length} bifate</span>
        {savedAt && <span style={{ color: 'var(--accent)' }}>Salvat ✓ {savedAt}</span>}
      </div>
    </div>
  );
};

// ─── Form Fields ──────────────────────────────────────────────────────────────
const FormFieldsExercise: React.FC<{ template: ExerciseTemplate; storageKey: string }> = ({
  template,
  storageKey,
}) => {
  const [values, setValues] = useState<Record<string, string>>(() => {
    try {
      const s = localStorage.getItem(storageKey);
      return s ? JSON.parse(s) : {};
    } catch {
      return {};
    }
  });
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const save = useCallback((newVals: Record<string, string>) => {
    localStorage.setItem(storageKey, JSON.stringify(newVals));
    setSavedAt(new Date().toLocaleTimeString('ro-RO', { hour: '2-digit', minute: '2-digit' }));
  }, [storageKey]);

  const handleChange = (id: string, val: string) => {
    const next = { ...values, [id]: val };
    setValues(next);
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => save(next), 1500);
  };

  const fields = template.fields || [];

  return (
    <div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {fields.map(field => {
          if (field.type === 'info') {
            return (
              <div key={field.id} style={{
                padding: '10px 14px', background: 'rgba(196,240,228,0.06)',
                border: '1px solid rgba(196,240,228,0.15)', borderRadius: 8,
                fontSize: 12, color: 'var(--fg-3)', lineHeight: 1.6,
              }}>
                {field.text}
              </div>
            );
          }
          if (field.type === 'textarea') {
            return (
              <div key={field.id}>
                <label style={{ fontSize: 12, fontWeight: 500, color: 'var(--fg)', display: 'block', marginBottom: 6 }}>
                  {field.label}
                </label>
                <textarea
                  value={values[field.id] || ''}
                  onChange={e => handleChange(field.id, e.target.value)}
                  placeholder={field.placeholder}
                  rows={5}
                  style={{
                    width: '100%', padding: '10px 12px', fontSize: 13, lineHeight: 1.6,
                    background: 'var(--bg-3)', border: '1px solid var(--border)',
                    borderRadius: 8, color: 'var(--fg)', resize: 'vertical',
                    transition: 'border-color 0.15s', boxSizing: 'border-box',
                  }}
                  onFocus={e => (e.target.style.borderColor = 'rgba(196,240,228,0.35)')}
                  onBlur={e => (e.target.style.borderColor = 'var(--border)')}
                />
              </div>
            );
          }
          if (field.type === 'input') {
            return (
              <div key={field.id}>
                <label style={{ fontSize: 12, fontWeight: 500, color: 'var(--fg)', display: 'block', marginBottom: 6 }}>
                  {field.label}
                </label>
                <input
                  type="text"
                  value={values[field.id] || ''}
                  onChange={e => handleChange(field.id, e.target.value)}
                  placeholder={field.placeholder}
                  style={{
                    width: '100%', padding: '9px 12px', fontSize: 13,
                    background: 'var(--bg-3)', border: '1px solid var(--border)',
                    borderRadius: 8, color: 'var(--fg)',
                    transition: 'border-color 0.15s', boxSizing: 'border-box',
                  }}
                  onFocus={e => (e.target.style.borderColor = 'rgba(196,240,228,0.35)')}
                  onBlur={e => (e.target.style.borderColor = 'var(--border)')}
                />
              </div>
            );
          }
          return null;
        })}
      </div>
      {savedAt && (
        <div style={{ marginTop: 12, fontSize: 11, color: 'var(--accent)', textAlign: 'right' }}>
          Salvat automat ✓ {savedAt}
        </div>
      )}
    </div>
  );
};

// ─── Dynamic Table ─────────────────────────────────────────────────────────────
type TableRow = Record<string, string>;

const DynamicTableExercise: React.FC<{ template: ExerciseTemplate; storageKey: string }> = ({
  template,
  storageKey,
}) => {
  const tableField = template.fields?.find(f => f.type === 'dynamic-table');
  const addLabel = tableField?.addLabel || 'Adaugă rând';
  const minRows = tableField?.minRows || 1;

  // Normalize columns into {name, options?, width?} list.
  const colSpecs: { name: string; options?: string[]; width?: string }[] = useMemo(() => {
    if (tableField?.columnsSpec && tableField.columnsSpec.length) {
      return tableField.columnsSpec.map(c =>
        typeof c === 'string' ? { name: c } : c,
      );
    }
    return (tableField?.columns || ['Coloana 1', 'Coloana 2', 'Coloana 3']).map(name => ({ name }));
  }, [tableField]);

  const [rows, setRows] = useState<TableRow[]>(() => {
    try {
      const s = localStorage.getItem(storageKey);
      if (s) {
        const parsed = JSON.parse(s);
        if (Array.isArray(parsed) && parsed.length) return parsed;
      }
    } catch {}
    return Array.from({ length: minRows }, () => ({}));
  });
  const [savedAt, setSavedAt] = useState<string | null>(null);

  const save = (newRows: TableRow[]) => {
    localStorage.setItem(storageKey, JSON.stringify(newRows));
    setSavedAt(new Date().toLocaleTimeString('ro-RO', { hour: '2-digit', minute: '2-digit' }));
  };

  const updateCell = (rowIdx: number, col: string, val: string) => {
    const next = rows.map((r, i) => i === rowIdx ? { ...r, [col]: val } : r);
    setRows(next);
    save(next);
  };

  const addRow = () => {
    const next = [...rows, {}];
    setRows(next);
    save(next);
  };

  const removeRow = (idx: number) => {
    const next = rows.filter((_, i) => i !== idx);
    const final = next.length ? next : [{}];
    setRows(final);
    save(final);
  };

  const infoField = template.fields?.find(f => f.type === 'info');

  return (
    <div>
      {infoField && (
        <div style={{
          padding: '10px 14px', background: 'rgba(196,240,228,0.06)',
          border: '1px solid rgba(196,240,228,0.15)', borderRadius: 8,
          fontSize: 12, color: 'var(--fg-3)', lineHeight: 1.6, marginBottom: 14,
        }}>
          {infoField.text}
        </div>
      )}
      <div style={{ overflowX: 'auto', marginBottom: 10 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
          <thead>
            <tr>
              {colSpecs.map(col => (
                <th key={col.name} style={{
                  padding: '8px 10px', textAlign: 'left', fontSize: 10, fontWeight: 600,
                  letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--fg-3)',
                  borderBottom: '1px solid var(--border)',
                  width: col.width,
                }}>
                  {col.name}
                </th>
              ))}
              <th style={{ width: 32 }} />
            </tr>
          </thead>
          <tbody>
            {rows.map((row, rowIdx) => (
              <motion.tr
                key={rowIdx}
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                style={{ borderBottom: '1px solid var(--border)' }}
              >
                {colSpecs.map(col => (
                  <td key={col.name} style={{ padding: '6px 4px' }}>
                    {col.options ? (
                      <select
                        value={row[col.name] || ''}
                        onChange={e => updateCell(rowIdx, col.name, e.target.value)}
                        style={{
                          width: '100%', padding: '6px 8px', fontSize: 12,
                          background: 'var(--bg-3)', border: '1px solid var(--border)',
                          borderRadius: 6, color: row[col.name] ? 'var(--fg)' : 'var(--fg-3)',
                          boxSizing: 'border-box', cursor: 'pointer',
                          appearance: 'none',
                          backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' width='10' height='10' viewBox='0 0 24 24' fill='none' stroke='%23C9A96E' stroke-width='2'%3e%3cpath d='M6 9l6 6 6-6'/%3e%3c/svg%3e")`,
                          backgroundRepeat: 'no-repeat',
                          backgroundPosition: 'right 8px center',
                          paddingRight: 24,
                        }}
                      >
                        <option value="" disabled>—</option>
                        {col.options.map(opt => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type="text"
                        value={row[col.name] || ''}
                        onChange={e => updateCell(rowIdx, col.name, e.target.value)}
                        style={{
                          width: '100%', padding: '6px 8px', fontSize: 12,
                          background: 'var(--bg-3)', border: '1px solid var(--border)',
                          borderRadius: 6, color: 'var(--fg)', boxSizing: 'border-box',
                        }}
                        onFocus={e => (e.target.style.borderColor = 'rgba(196,240,228,0.35)')}
                        onBlur={e => (e.target.style.borderColor = 'var(--border)')}
                      />
                    )}
                  </td>
                ))}
                <td style={{ padding: '6px 4px', textAlign: 'center' }}>
                  <button
                    onClick={() => removeRow(rowIdx)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--fg-3)', padding: 4, display: 'flex', transition: 'color 0.15s' }}
                    onMouseEnter={e => (e.currentTarget.style.color = '#f87171')}
                    onMouseLeave={e => (e.currentTarget.style.color = 'var(--fg-3)')}
                  >
                    <Trash2 size={12} />
                  </button>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <button
          onClick={addRow}
          style={{
            display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px',
            background: 'var(--accent-dim)', border: '1px solid rgba(196,240,228,0.2)',
            borderRadius: 8, cursor: 'pointer', fontSize: 12, color: 'var(--accent)',
            fontWeight: 600, transition: 'background 0.15s',
          }}
          onMouseEnter={e => (e.currentTarget.style.background = 'rgba(196,240,228,0.15)')}
          onMouseLeave={e => (e.currentTarget.style.background = 'var(--accent-dim)')}
        >
          <Plus size={13} /> {addLabel}
        </button>
        {savedAt && <span style={{ fontSize: 11, color: 'var(--accent)' }}>Salvat ✓ {savedAt}</span>}
      </div>
    </div>
  );
};

// ─── Diagnostic (50 întrebări, scor pe dimensiuni) ────────────────────────────
const DiagnosticExercise: React.FC<{ template: ExerciseTemplate; storageKey: string }> = ({
  template,
  storageKey,
}) => {
  const questions: QuizQuestionItem[] = template.questions || [];
  const dimensions = template.dimensions || [];

  const [answers, setAnswers] = useState<Record<string, number>>(() => {
    try {
      const s = localStorage.getItem(storageKey);
      return s ? JSON.parse(s) : {};
    } catch {
      return {};
    }
  });
  const [showResults, setShowResults] = useState(false);

  const setAnswer = (qid: string, val: number) => {
    const next = { ...answers, [qid]: val };
    setAnswers(next);
    localStorage.setItem(storageKey, JSON.stringify(next));
  };

  const answered = Object.keys(answers).length;
  const total = questions.length;
  const pctDone = total ? Math.round((answered / total) * 100) : 0;

  // Group questions by dimension
  const grouped = useMemo(() => {
    const g: Record<string, QuizQuestionItem[]> = {};
    dimensions.forEach(d => (g[d] = []));
    questions.forEach(q => {
      const d = q.dimension || 'General';
      if (!g[d]) g[d] = [];
      g[d].push(q);
    });
    return g;
  }, [questions, dimensions]);

  // Per-dimension score
  const dimensionScores = useMemo(() => {
    return dimensions.map(d => {
      const qs = grouped[d] || [];
      const score = qs.reduce((s, q) => s + (answers[q.id] || 0), 0);
      const max = qs.length * 5;
      const pct = max ? Math.round((score / max) * 100) : 0;
      return { dimension: d, score, max, pct, count: qs.length };
    });
  }, [grouped, dimensions, answers]);

  // Top 3 weakest dimensions = priorities
  const priorities = useMemo(() => {
    return [...dimensionScores]
      .filter(d => d.count > 0)
      .sort((a, b) => a.pct - b.pct)
      .slice(0, 3);
  }, [dimensionScores]);

  const overallPct = useMemo(() => {
    const totalScore = dimensionScores.reduce((s, d) => s + d.score, 0);
    const totalMax = dimensionScores.reduce((s, d) => s + d.max, 0);
    return totalMax ? Math.round((totalScore / totalMax) * 100) : 0;
  }, [dimensionScores]);

  if (showResults) {
    return (
      <div>
        {/* Overall */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          style={{
            textAlign: 'center', padding: '20px 16px', marginBottom: 18,
            background: 'linear-gradient(180deg, var(--accent-dim) 0%, rgba(196,240,228,0.02) 100%)',
            border: '1px solid rgba(196,240,228,0.25)', borderRadius: 14,
          }}
        >
          <div className="font-aboreto" style={{ fontSize: 10, letterSpacing: '0.14em', color: 'var(--fg-3)', textTransform: 'uppercase', marginBottom: 6 }}>
            Scor general
          </div>
          <div style={{ fontSize: 48, fontWeight: 700, color: 'var(--accent)', lineHeight: 1 }}>{overallPct}%</div>
          <p style={{ fontSize: 12, color: 'var(--fg-3)', marginTop: 8, maxWidth: 360, marginLeft: 'auto', marginRight: 'auto' }}>
            {overallPct >= 75 ? 'Ai fundații solide. Concentrează-te pe rafinare.' :
             overallPct >= 50 ? 'Progres bun. Zonele slabe sunt clare — atac-le în ordine.' :
             'Multe zone de construit. Vestea bună: acum ai harta exactă.'}
          </p>
        </motion.div>

        {/* Per-dimension bars */}
        <div className="font-aboreto" style={{ fontSize: 10, letterSpacing: '0.12em', color: 'var(--fg-3)', textTransform: 'uppercase', marginBottom: 10 }}>
          Scor pe dimensiuni
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 22 }}>
          {dimensionScores.map((d, i) => (
            <motion.div
              key={d.dimension}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
                <span style={{ color: 'var(--fg)' }}>{d.dimension}</span>
                <span style={{ color: d.pct >= 70 ? '#4ade80' : d.pct >= 40 ? 'var(--gold)' : '#f87171', fontWeight: 600 }}>
                  {d.score}/{d.max} · {d.pct}%
                </span>
              </div>
              <div style={{ height: 6, background: 'var(--bg-3)', borderRadius: 3, overflow: 'hidden' }}>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${d.pct}%` }}
                  transition={{ duration: 0.7, delay: i * 0.05, ease: 'easeOut' }}
                  style={{
                    height: '100%',
                    background: d.pct >= 70
                      ? 'linear-gradient(90deg, #4ade80, #86efac)'
                      : d.pct >= 40
                      ? 'linear-gradient(90deg, var(--gold), #e0c896)'
                      : 'linear-gradient(90deg, #f87171, #fca5a5)',
                    borderRadius: 3,
                  }}
                />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Top 3 priorities */}
        <div className="font-aboreto" style={{ fontSize: 10, letterSpacing: '0.12em', color: 'var(--gold)', textTransform: 'uppercase', marginBottom: 10 }}>
          Cele 3 priorități ale tale
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 18 }}>
          {priorities.map((p, i) => (
            <motion.div
              key={p.dimension}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + i * 0.08 }}
              style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '10px 14px', background: 'var(--gold-dim)',
                border: '1px solid rgba(201,169,110,0.25)', borderLeft: '3px solid var(--gold)',
                borderRadius: 10,
              }}
            >
              <div className="font-aboreto" style={{
                width: 28, height: 28, borderRadius: '50%',
                background: 'rgba(201,169,110,0.15)', display: 'flex',
                alignItems: 'center', justifyContent: 'center',
                fontSize: 12, fontWeight: 700, color: 'var(--gold)', flexShrink: 0,
              }}>
                {i + 1}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--fg)' }}>{p.dimension}</div>
                <div style={{ fontSize: 11, color: 'var(--fg-3)' }}>Scor actual: {p.pct}% — aici începi.</div>
              </div>
            </motion.div>
          ))}
        </div>

        <button
          onClick={() => setShowResults(false)}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            background: 'none', border: '1px solid var(--border)', cursor: 'pointer',
            fontSize: 12, color: 'var(--fg-3)', padding: '7px 14px', borderRadius: 8,
            transition: 'all 0.15s',
          }}
          onMouseEnter={e => { e.currentTarget.style.color = 'var(--fg)'; e.currentTarget.style.borderColor = 'rgba(196,240,228,0.3)'; }}
          onMouseLeave={e => { e.currentTarget.style.color = 'var(--fg-3)'; e.currentTarget.style.borderColor = 'var(--border)'; }}
        >
          <RotateCcw size={11} /> Revino la întrebări
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* Header progress */}
      <div style={{ marginBottom: 18 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--fg-3)', marginBottom: 6 }}>
          <span>{answered} / {total} răspunsuri</span>
          <span style={{ color: 'var(--accent)' }}>{pctDone}%</span>
        </div>
        <div style={{ height: 3, background: 'var(--border)', borderRadius: 2, overflow: 'hidden' }}>
          <motion.div
            animate={{ width: `${pctDone}%` }}
            transition={{ duration: 0.4 }}
            style={{ height: '100%', background: 'linear-gradient(90deg, var(--accent), var(--gold))', borderRadius: 2 }}
          />
        </div>
      </div>

      {/* Dimensions */}
      {dimensions.map((dim, dimIdx) => {
        const qs = grouped[dim] || [];
        const dimAnswered = qs.filter(q => answers[q.id] !== undefined).length;
        return (
          <div key={dim} style={{ marginBottom: 22 }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12,
              paddingBottom: 8, borderBottom: '1px solid var(--border)',
            }}>
              <span className="font-aboreto" style={{
                fontSize: 10, fontWeight: 700, color: 'var(--gold)',
                background: 'var(--gold-dim)', border: '1px solid rgba(201,169,110,0.25)',
                padding: '3px 8px', borderRadius: 4, letterSpacing: '0.08em',
              }}>
                {String(dimIdx + 1).padStart(2, '0')}
              </span>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--fg)', flex: 1 }}>{dim}</div>
              <div style={{ fontSize: 11, color: dimAnswered === qs.length ? '#4ade80' : 'var(--fg-3)' }}>
                {dimAnswered}/{qs.length}
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {qs.map((q, qIdx) => (
                <div key={q.id} style={{
                  padding: '12px 14px',
                  background: answers[q.id] !== undefined ? 'rgba(196,240,228,0.04)' : 'var(--bg-3)',
                  border: `1px solid ${answers[q.id] !== undefined ? 'rgba(196,240,228,0.18)' : 'var(--border)'}`,
                  borderRadius: 10,
                  transition: 'all 0.2s',
                }}>
                  <div style={{ display: 'flex', gap: 10, marginBottom: 10 }}>
                    <span style={{ fontSize: 11, color: 'var(--fg-3)', flexShrink: 0, paddingTop: 2 }}>
                      {qIdx + 1}.
                    </span>
                    <p style={{ fontSize: 13, color: 'var(--fg)', lineHeight: 1.5, flex: 1 }}>{q.text}</p>
                  </div>
                  <div style={{ display: 'flex', gap: 6 }}>
                    {[1, 2, 3, 4, 5].map(n => (
                      <button
                        key={n}
                        onClick={() => setAnswer(q.id, n)}
                        style={{
                          flex: 1, padding: '8px 0', borderRadius: 8,
                          background: answers[q.id] === n ? 'var(--accent)' : 'transparent',
                          border: `1px solid ${answers[q.id] === n ? 'var(--accent)' : 'var(--border)'}`,
                          color: answers[q.id] === n ? '#0D0907' : 'var(--fg-2)',
                          cursor: 'pointer', fontSize: 13, fontWeight: 600,
                          transition: 'all 0.15s',
                        }}
                      >
                        {n}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 11, color: 'var(--fg-3)', marginBottom: 12 }}>
        <span>1 = Deloc · 5 = Complet</span>
        <span>Răspunsurile se salvează automat</span>
      </div>

      <button
        onClick={() => setShowResults(true)}
        disabled={answered === 0}
        style={{
          width: '100%', padding: '12px 20px', borderRadius: 10,
          background: answered === total ? 'var(--accent)' : 'var(--bg-3)',
          color: answered === total ? '#0D0907' : 'var(--fg-2)',
          border: `1px solid ${answered === total ? 'var(--accent)' : 'var(--border)'}`,
          cursor: answered === 0 ? 'not-allowed' : 'pointer',
          fontSize: 13, fontWeight: 700, opacity: answered === 0 ? 0.5 : 1,
          transition: 'all 0.15s',
        }}
      >
        {answered === total ? 'Vezi rezultatul diagnostic →' : `Vezi rezultatul parțial (${answered}/${total})`}
      </button>
    </div>
  );
};

// ─── Quiz ─────────────────────────────────────────────────────────────────────
const QuizExercise: React.FC<{ template: ExerciseTemplate; storageKey: string }> = ({
  template,
  storageKey,
}) => {
  const questions: QuizQuestionItem[] = template.questions || [];
  const [answers, setAnswers] = useState<Record<string, string | number>>(() => {
    try {
      const s = localStorage.getItem(storageKey);
      return s ? JSON.parse(s) : {};
    } catch {
      return {};
    }
  });
  const [currentIdx, setCurrentIdx] = useState(0);
  const [finished, setFinished] = useState(false);

  const savedCount = Object.keys(answers).length;
  const allAnswered = questions.every(q => answers[q.id] !== undefined);

  const handleAnswer = (questionId: string, val: string | number) => {
    const next = { ...answers, [questionId]: val };
    setAnswers(next);
    localStorage.setItem(storageKey, JSON.stringify(next));
    setTimeout(() => {
      if (currentIdx < questions.length - 1) {
        setCurrentIdx(i => i + 1);
      } else {
        setFinished(true);
      }
    }, 400);
  };

  const q = questions[currentIdx];

  // Compute score
  const score = questions.reduce((sum, q) => {
    const a = answers[q.id];
    if (q.type === 'scale5') return sum + (typeof a === 'number' ? a : 0);
    if (q.type === 'yesno') return sum + (a === 'Da' ? 5 : 0);
    return sum;
  }, 0);
  const maxScore = questions.reduce((sum, q) => sum + (q.type === 'scale5' ? 5 : 5), 0);
  const pct = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;

  if (finished || allAnswered) {
    return (
      <div>
        <div style={{ textAlign: 'center', marginBottom: 20 }}>
          <div style={{ fontSize: 40, fontWeight: 700, color: 'var(--accent)', marginBottom: 8 }}>{pct}%</div>
          <p style={{ fontSize: 13, color: 'var(--fg-3)' }}>
            {pct >= 80 ? 'Excelent! Afacerea ta are fundații solide.' :
             pct >= 50 ? 'Progres bun, dar sunt zone clare de îmbunătățit.' :
             'Zone semnificative de lucru — exact de aceea ești aici.'}
          </p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
          {questions.map((qq, i) => {
            const a = answers[qq.id];
            const isGood = qq.type === 'scale5' ? (typeof a === 'number' && a >= 4) : a === 'Da';
            return (
              <div key={qq.id} style={{
                display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px',
                background: isGood ? 'rgba(74,222,128,0.07)' : 'rgba(248,113,113,0.05)',
                borderRadius: 8, border: `1px solid ${isGood ? 'rgba(74,222,128,0.2)' : 'rgba(248,113,113,0.15)'}`,
              }}>
                <span style={{ fontSize: 11, color: 'var(--fg-3)', flexShrink: 0 }}>{i + 1}.</span>
                <span style={{ fontSize: 12, color: 'var(--fg)', flex: 1 }}>{qq.text}</span>
                <span style={{
                  fontSize: 11, fontWeight: 600, flexShrink: 0,
                  color: isGood ? '#4ade80' : '#f87171',
                }}>
                  {qq.type === 'scale5' ? `${a}/5` : String(a)}
                </span>
              </div>
            );
          })}
        </div>
        <button
          onClick={() => { setCurrentIdx(0); setFinished(false); }}
          style={{
            display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px',
            background: 'var(--accent-dim)', border: '1px solid rgba(196,240,228,0.2)',
            borderRadius: 8, cursor: 'pointer', fontSize: 12, color: 'var(--accent)',
            fontWeight: 600,
          }}
        >
          Reîncepere chestionar
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* Progress */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--fg-3)', marginBottom: 6 }}>
          <span>Întrebarea {currentIdx + 1} din {questions.length}</span>
          <span>{savedCount} răspunsuri salvate</span>
        </div>
        <div style={{ height: 3, background: 'var(--border)', borderRadius: 2, overflow: 'hidden' }}>
          <motion.div
            animate={{ width: `${((currentIdx + 1) / questions.length) * 100}%` }}
            transition={{ duration: 0.4 }}
            style={{ height: '100%', background: 'var(--accent)', borderRadius: 2 }}
          />
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={q.id}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
        >
          <p style={{ fontSize: 14, fontWeight: 500, color: 'var(--fg)', marginBottom: 16, lineHeight: 1.6 }}>
            {q.text}
          </p>

          {q.type === 'yesno' && (
            <div style={{ display: 'flex', gap: 10 }}>
              {['Da', 'Nu'].map(opt => (
                <button
                  key={opt}
                  onClick={() => handleAnswer(q.id, opt)}
                  style={{
                    flex: 1, padding: '12px 20px', borderRadius: 10,
                    background: answers[q.id] === opt ? 'var(--accent)' : 'var(--bg-3)',
                    border: `1px solid ${answers[q.id] === opt ? 'var(--accent)' : 'var(--border)'}`,
                    color: answers[q.id] === opt ? '#0D0907' : 'var(--fg)',
                    cursor: 'pointer', fontSize: 14, fontWeight: 600,
                    transition: 'all 0.15s',
                  }}
                >
                  {opt}
                </button>
              ))}
            </div>
          )}

          {q.type === 'scale5' && (
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {[1, 2, 3, 4, 5].map(n => (
                <button
                  key={n}
                  onClick={() => handleAnswer(q.id, n)}
                  style={{
                    flex: 1, minWidth: 44, padding: '12px 8px', borderRadius: 10,
                    background: answers[q.id] === n ? 'var(--accent)' : 'var(--bg-3)',
                    border: `1px solid ${answers[q.id] === n ? 'var(--accent)' : 'var(--border)'}`,
                    color: answers[q.id] === n ? '#0D0907' : 'var(--fg)',
                    cursor: 'pointer', fontSize: 16, fontWeight: 700,
                    transition: 'all 0.15s',
                  }}
                >
                  {n}
                </button>
              ))}
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 16, fontSize: 11, color: 'var(--fg-3)' }}>
            <span>1 = Deloc / Nu</span>
            <span>5 = Complet / Da</span>
          </div>
        </motion.div>
      </AnimatePresence>

      {currentIdx > 0 && (
        <button
          onClick={() => setCurrentIdx(i => i - 1)}
          style={{
            marginTop: 16, background: 'none', border: 'none', cursor: 'pointer',
            fontSize: 12, color: 'var(--fg-3)', display: 'flex', alignItems: 'center', gap: 4,
          }}
        >
          ← Înapoi
        </button>
      )}
    </div>
  );
};

// ─── Main ExerciseBlock ───────────────────────────────────────────────────────
export const ExerciseBlock: React.FC<ExerciseBlockProps> = ({ exerciseId }) => {
  const { user } = useAuthContext();
  const template = getExerciseTemplate(exerciseId);
  // Keyed per user so exercises are never shared between accounts
  const storageKey = `aa_ex_${user?.id ?? 'anon'}_${exerciseId}`;

  // Sync localStorage <-> DB (exercise_responses). Sub-components keep writing
  // to localStorage; this effect mirrors it to Supabase so admins can see it.
  useEffect(() => {
    if (!user?.id) return;
    let lastSent = localStorage.getItem(storageKey) || '';
    // Initial pull from DB if local is empty
    supabase
      .from('exercise_responses')
      .select('response')
      .eq('user_id', user.id)
      .eq('exercise_id', exerciseId)
      .maybeSingle()
      .then(({ data }) => {
        if (data?.response !== undefined && data?.response !== null) {
          const remote = typeof data.response === 'string' ? data.response : JSON.stringify(data.response);
          const local = localStorage.getItem(storageKey);
          if (!local || local === '') {
            localStorage.setItem(storageKey, remote);
            lastSent = remote;
            window.dispatchEvent(new Event('aa_ex_synced'));
          }
        }
      });
    // Push on change (poll localStorage)
    const interval = setInterval(() => {
      const current = localStorage.getItem(storageKey) || '';
      if (current !== lastSent && current !== '') {
        lastSent = current;
        let parsed: any = current;
        try { parsed = JSON.parse(current); } catch {}
        supabase
          .from('exercise_responses')
          .upsert(
            { user_id: user.id, exercise_id: exerciseId, response: parsed },
            { onConflict: 'user_id,exercise_id' }
          )
          .then(() => {});
      }
    }, 1500);
    return () => clearInterval(interval);
  }, [user?.id, exerciseId, storageKey]);

  if (!template) {
    return (
      <div style={{ padding: '16px', fontSize: 13, color: 'var(--fg-3)' }}>
        Exercițiul interactiv va fi disponibil în curând.
      </div>
    );
  }

  const renderContent = () => {
    switch (template.type) {
      case 'checklist':
        return <ChecklistExercise template={template} storageKey={storageKey} />;
      case 'form-fields':
        return <FormFieldsExercise template={template} storageKey={storageKey} />;
      case 'dynamic-table':
        return <DynamicTableExercise template={template} storageKey={storageKey} />;
      case 'quiz':
        return <QuizExercise template={template} storageKey={storageKey} />;
      case 'diagnostic':
        return <DiagnosticExercise template={template} storageKey={storageKey} />;
      default:
        return <FormFieldsExercise template={template} storageKey={storageKey} />;
    }
  };

  const typeLabels: Record<string, string> = {
    checklist: 'Checklist',
    'form-fields': 'Formular',
    'dynamic-table': 'Tabel interactiv',
    quiz: 'Chestionar',
    diagnostic: 'Diagnostic',
    'text-input': 'Formular',
    'rating-grid': 'Evaluare',
  };

  // ─── Completion control (Marchez ca finalizat) ──────────────────────────────
  const { isExerciseCompleted, markExerciseComplete, unmarkExerciseComplete } = useExerciseCompletions();
  const completed = isExerciseCompleted(exerciseId);

  return (
    <div style={{ padding: '0 0 4px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14, flexWrap: 'wrap' }}>
        <span style={{
          fontSize: 9, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase',
          color: 'var(--gold)', background: 'rgba(201,169,110,0.12)',
          border: '1px solid rgba(201,169,110,0.2)',
          padding: '2px 8px', borderRadius: 4,
        }}>
          {typeLabels[template.type] || 'Interactiv'}
        </span>
        <span style={{ fontSize: 12, color: 'var(--fg-3)', display: 'flex', alignItems: 'center', gap: 4 }}>
          <ChevronRight size={11} /> Progresul se salvează automat
        </span>
        {completed && (
          <span style={{
            marginLeft: 'auto',
            fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase',
            color: '#4ade80', background: 'rgba(74,222,128,0.1)',
            border: '1px solid rgba(74,222,128,0.25)',
            padding: '3px 9px', borderRadius: 4,
            display: 'inline-flex', alignItems: 'center', gap: 5,
          }}>
            <CheckCircle2 size={11} /> Finalizat
          </span>
        )}
      </div>

      {renderContent()}

      {/* Mark complete control */}
      <div style={{
        marginTop: 22, paddingTop: 18,
        borderTop: '1px dashed var(--border)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap',
      }}>
        <div style={{ fontSize: 11, color: 'var(--fg-3)', maxWidth: 320, lineHeight: 1.5 }}>
          {completed
            ? 'Exercițiul e marcat ca finalizat. Contează pentru deblocarea modulului următor.'
            : 'Când ai terminat, marchează exercițiul ca finalizat ca să poți trece la următoarea etapă.'}
        </div>
        {completed ? (
          <button
            onClick={() => unmarkExerciseComplete(exerciseId)}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '8px 14px', background: 'transparent',
              border: '1px solid var(--border)', borderRadius: 8,
              cursor: 'pointer', fontSize: 12, color: 'var(--fg-3)',
              fontWeight: 500, transition: 'all 0.15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.color = 'var(--fg)'; e.currentTarget.style.borderColor = 'rgba(196,240,228,0.3)'; }}
            onMouseLeave={e => { e.currentTarget.style.color = 'var(--fg-3)'; e.currentTarget.style.borderColor = 'var(--border)'; }}
          >
            <RotateCcw size={12} /> Anulează finalizarea
          </button>
        ) : (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => markExerciseComplete(exerciseId)}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '10px 18px',
              background: 'linear-gradient(135deg, var(--accent) 0%, #b8e8d8 100%)',
              color: '#0D0907', border: 'none', borderRadius: 10,
              cursor: 'pointer', fontSize: 12, fontWeight: 700,
              letterSpacing: '0.02em',
              boxShadow: '0 4px 16px -6px rgba(196,240,228,0.4)',
            }}
          >
            <CheckCircle2 size={14} /> Marchez ca finalizat
          </motion.button>
        )}
      </div>
    </div>
  );
};
