import React, { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Plus, Trash2, ChevronRight } from 'lucide-react';
import { getExerciseTemplate, ExerciseTemplate, QuizQuestionItem } from '../../lib/exerciseData';
import { useAuthContext } from '../../context/AuthContext';
import { pushExerciseResponse, loadExerciseResponse } from '../../lib/exerciseSync';

interface ExerciseBlockProps {
  exerciseId: string;
}

// ─── Checklist ────────────────────────────────────────────────────────────────
const ChecklistExercise: React.FC<{ template: ExerciseTemplate; storageKey: string; exerciseId: string }> = ({
  template,
  storageKey,
  exerciseId,
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

  useEffect(() => {
    loadExerciseResponse(exerciseId).then(cloud => {
      if (cloud && typeof cloud === 'object') {
        setChecked(cloud as Record<string, boolean>);
        localStorage.setItem(storageKey, JSON.stringify(cloud));
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [exerciseId]);

  const toggle = (id: string) => {
    const next = { ...checked, [id]: !checked[id] };
    setChecked(next);
    localStorage.setItem(storageKey, JSON.stringify(next));
    pushExerciseResponse(exerciseId, next);
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
const FormFieldsExercise: React.FC<{ template: ExerciseTemplate; storageKey: string; exerciseId: string }> = ({
  template,
  storageKey,
  exerciseId,
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

  useEffect(() => {
    loadExerciseResponse(exerciseId).then(cloud => {
      if (cloud && typeof cloud === 'object') {
        setValues(cloud as Record<string, string>);
        localStorage.setItem(storageKey, JSON.stringify(cloud));
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [exerciseId]);

  const save = useCallback((newVals: Record<string, string>) => {
    localStorage.setItem(storageKey, JSON.stringify(newVals));
    pushExerciseResponse(exerciseId, newVals);
    setSavedAt(new Date().toLocaleTimeString('ro-RO', { hour: '2-digit', minute: '2-digit' }));
  }, [storageKey, exerciseId]);

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

const DynamicTableExercise: React.FC<{ template: ExerciseTemplate; storageKey: string; exerciseId: string }> = ({
  template,
  storageKey,
  exerciseId,
}) => {
  const tableField = template.fields?.find(f => f.type === 'dynamic-table');
  const columns = tableField?.columns || ['Coloana 1', 'Coloana 2', 'Coloana 3'];
  const addLabel = tableField?.addLabel || 'Adaugă rând';

  const [rows, setRows] = useState<TableRow[]>(() => {
    try {
      const s = localStorage.getItem(storageKey);
      if (s) {
        const parsed = JSON.parse(s);
        return Array.isArray(parsed) ? parsed : [{}];
      }
    } catch {}
    return [{}];
  });
  const [savedAt, setSavedAt] = useState<string | null>(null);

  useEffect(() => {
    loadExerciseResponse(exerciseId).then(cloud => {
      if (Array.isArray(cloud)) {
        setRows(cloud as TableRow[]);
        localStorage.setItem(storageKey, JSON.stringify(cloud));
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [exerciseId]);

  const save = (newRows: TableRow[]) => {
    localStorage.setItem(storageKey, JSON.stringify(newRows));
    pushExerciseResponse(exerciseId, newRows);
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
    setRows(next.length ? next : [{}]);
    save(next.length ? next : [{}]);
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
              {columns.map(col => (
                <th key={col} style={{
                  padding: '8px 10px', textAlign: 'left', fontSize: 10, fontWeight: 600,
                  letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--fg-3)',
                  borderBottom: '1px solid var(--border)',
                }}>
                  {col}
                </th>
              ))}
              <th style={{ width: 32 }} />
            </tr>
          </thead>
          <tbody>
            {rows.map((row, rowIdx) => (
              <tr key={rowIdx} style={{ borderBottom: '1px solid var(--border)' }}>
                {columns.map(col => (
                  <td key={col} style={{ padding: '6px 4px' }}>
                    <input
                      type="text"
                      value={row[col] || ''}
                      onChange={e => updateCell(rowIdx, col, e.target.value)}
                      style={{
                        width: '100%', padding: '6px 8px', fontSize: 12,
                        background: 'var(--bg-3)', border: '1px solid var(--border)',
                        borderRadius: 6, color: 'var(--fg)', boxSizing: 'border-box',
                      }}
                      onFocus={e => (e.target.style.borderColor = 'rgba(196,240,228,0.35)')}
                      onBlur={e => (e.target.style.borderColor = 'var(--border)')}
                    />
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
              </tr>
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

// ─── Quiz ─────────────────────────────────────────────────────────────────────
const QuizExercise: React.FC<{ template: ExerciseTemplate; storageKey: string; exerciseId: string }> = ({
  template,
  storageKey,
  exerciseId,
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

  useEffect(() => {
    loadExerciseResponse(exerciseId).then(cloud => {
      if (cloud && typeof cloud === 'object' && !Array.isArray(cloud)) {
        setAnswers(cloud as Record<string, string | number>);
        localStorage.setItem(storageKey, JSON.stringify(cloud));
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [exerciseId]);

  const savedCount = Object.keys(answers).length;
  const allAnswered = questions.every(q => answers[q.id] !== undefined);

  const handleAnswer = (questionId: string, val: string | number) => {
    const next = { ...answers, [questionId]: val };
    setAnswers(next);
    localStorage.setItem(storageKey, JSON.stringify(next));
    pushExerciseResponse(exerciseId, next);
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

// ─── Activity Audit (Exercițiul 1) ────────────────────────────────────────────
interface ActivityRow { id: string; activity: string; percentage: string; role: 'S' | 'D' | 'P' | '' }

const ActivityAuditExercise: React.FC<{ storageKey: string; exerciseId: string }> = ({ storageKey, exerciseId }) => {
  const defaultRows = (): ActivityRow[] =>
    Array.from({ length: 8 }, (_, i) => ({ id: `r${i}`, activity: '', percentage: '', role: '' }));

  const [rows, setRows] = useState<ActivityRow[]>(() => {
    try { const s = localStorage.getItem(storageKey); if (s) return JSON.parse(s).rows || defaultRows(); } catch {}
    return defaultRows();
  });
  const [conclusion, setConclusion] = useState(() => {
    try { const s = localStorage.getItem(storageKey); return s ? JSON.parse(s).conclusion || '' : ''; } catch { return ''; }
  });
  const [savedAt, setSavedAt] = useState<string | null>(null);

  useEffect(() => {
    loadExerciseResponse(exerciseId).then(cloud => {
      if (cloud && typeof cloud === 'object' && !Array.isArray(cloud)) {
        const c: any = cloud;
        if (Array.isArray(c.rows)) setRows(c.rows);
        if (typeof c.conclusion === 'string') setConclusion(c.conclusion);
        localStorage.setItem(storageKey, JSON.stringify(cloud));
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [exerciseId]);

  const save = (r: ActivityRow[], c: string) => {
    const payload = { rows: r, conclusion: c };
    localStorage.setItem(storageKey, JSON.stringify(payload));
    pushExerciseResponse(exerciseId, payload);
    setSavedAt(new Date().toLocaleTimeString('ro-RO', { hour: '2-digit', minute: '2-digit' }));
  };
  const updateRow = (id: string, field: keyof ActivityRow, value: string) => {
    const next = rows.map(r => r.id === id ? { ...r, [field]: value } : r);
    setRows(next); save(next, conclusion);
  };
  const addRow = () => {
    const next = [...rows, { id: Date.now().toString(), activity: '', percentage: '', role: '' as const }];
    setRows(next); save(next, conclusion);
  };
  const removeRow = (id: string) => {
    const next = rows.filter(r => r.id !== id);
    setRows(next); save(next, conclusion);
  };

  const sTotal = rows.filter(r => r.role === 'S').reduce((a, r) => a + (parseFloat(r.percentage) || 0), 0);
  const dTotal = rows.filter(r => r.role === 'D').reduce((a, r) => a + (parseFloat(r.percentage) || 0), 0);
  const pTotal = rows.filter(r => r.role === 'P').reduce((a, r) => a + (parseFloat(r.percentage) || 0), 0);
  const grandTotal = rows.reduce((a, r) => a + (parseFloat(r.percentage) || 0), 0);
  const roleColors = { S: 'var(--accent)', D: 'var(--gold)', P: '#a78bfa' };

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 20 }}>
        {(['S', 'D', 'P'] as const).map(r => (
          <div key={r} style={{ padding: '10px 8px', background: 'var(--bg-3)', border: `1px solid ${roleColors[r]}25`, borderRadius: 10, textAlign: 'center' }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: roleColors[r], textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 2 }}>
              {r === 'S' ? 'Specialist' : r === 'D' ? 'Director' : 'Proprietar'}
            </div>
            <div style={{ fontSize: 11, color: 'var(--fg-3)', lineHeight: 1.5 }}>
              {r === 'S' ? 'Execuți — putea face un angajat' : r === 'D' ? 'Coordonezi — rezolvi operațional' : 'Strategie — viziune, decizii mari'}
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 72px 120px 32px', gap: 8, marginBottom: 6, padding: '0 2px' }}>
        {['Activitatea', '% Timp', 'Rol  S / D / P', ''].map((h, i) => (
          <div key={i} style={{ fontSize: 10, fontWeight: 700, color: 'var(--fg-3)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>{h}</div>
        ))}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 12 }}>
        {rows.map((row, idx) => (
          <div key={row.id} style={{ display: 'grid', gridTemplateColumns: '1fr 72px 120px 32px', gap: 8, alignItems: 'center' }}>
            <input value={row.activity} onChange={e => updateRow(row.id, 'activity', e.target.value)}
              placeholder={`Activitate ${idx + 1}...`}
              style={{ padding: '7px 10px', fontSize: 12, background: 'var(--bg-3)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--fg)', width: '100%' }} />
            <input type="number" min={0} max={100} value={row.percentage} onChange={e => updateRow(row.id, 'percentage', e.target.value)}
              placeholder="%"
              style={{ padding: '7px 8px', fontSize: 12, background: 'var(--bg-3)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--fg)', textAlign: 'center', width: '100%' }} />
            <div style={{ display: 'flex', gap: 3 }}>
              {(['S', 'D', 'P'] as const).map(role => {
                const active = row.role === role;
                return (
                  <button key={role} onClick={() => updateRow(row.id, 'role', role)} style={{
                    flex: 1, padding: '6px 0', borderRadius: 6, fontSize: 11, fontWeight: 700, cursor: 'pointer', border: 'none', transition: 'all 0.12s',
                    background: active ? `${roleColors[role]}22` : 'rgba(255,255,255,0.04)',
                    color: active ? roleColors[role] : 'var(--fg-3)',
                    outline: active ? `1.5px solid ${roleColors[role]}70` : '1.5px solid transparent',
                    transform: active ? 'scale(1.05)' : 'scale(1)',
                  }}>{role}</button>
                );
              })}
            </div>
            <button onClick={() => removeRow(row.id)} style={{ width: 28, height: 28, borderRadius: 6, background: 'rgba(248,113,113,0.08)', border: 'none', cursor: 'pointer', color: '#f87171', fontSize: 15, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
          </div>
        ))}
      </div>

      <button onClick={addRow} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', background: 'rgba(196,240,228,0.06)', border: '1px dashed rgba(196,240,228,0.2)', borderRadius: 8, cursor: 'pointer', fontSize: 12, color: 'var(--accent)', marginBottom: 20 }}>
        + Adaugă activitate
      </button>

      <div style={{ background: 'var(--bg-3)', border: '1px solid var(--border)', borderRadius: 12, padding: '16px 18px', marginBottom: 20 }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--fg-3)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 12 }}>Totaluri</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 10 }}>
          {([['Specialist (S)', sTotal, 'S'], ['Director (D)', dTotal, 'D'], ['Proprietar (P)', pTotal, 'P']] as const).map(([label, val, r]) => (
            <div key={label} style={{ textAlign: 'center', padding: '12px 8px', background: 'var(--bg)', borderRadius: 10, border: `1px solid ${roleColors[r]}25` }}>
              <div style={{ fontSize: 26, fontWeight: 700, color: roleColors[r], lineHeight: 1 }}>{Math.round(val as number)}%</div>
              <div style={{ fontSize: 10, color: 'var(--fg-3)', marginTop: 4 }}>{label}</div>
            </div>
          ))}
        </div>
        <div style={{ fontSize: 12, fontWeight: 600, textAlign: 'center', color: grandTotal > 101 ? '#f87171' : grandTotal >= 98 ? '#4ade80' : 'var(--gold)' }}>
          Total: {Math.round(grandTotal)}%
          {grandTotal > 101 ? ' — depășești 100%' : grandTotal < 98 && grandTotal > 0 ? ' — mai ai de completat' : grandTotal >= 98 ? ' ✓ Corect' : ''}
        </div>
      </div>

      <div style={{ marginBottom: 4 }}>
        <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--fg-2)', marginBottom: 6 }}>Concluzia mea</label>
        <textarea value={conclusion} onChange={e => { setConclusion(e.target.value); save(rows, e.target.value); }}
          placeholder="Din 100% din timp — ___% e muncă de Specialist. ___% Director. ___% Proprietar. Ce observ: ..."
          rows={3} style={{ width: '100%', padding: '10px 12px', fontSize: 13, background: 'var(--bg-3)', border: '1px solid var(--border)', borderRadius: 10, color: 'var(--fg)', resize: 'vertical', lineHeight: 1.6 }} />
      </div>
      {savedAt && <p style={{ fontSize: 11, color: 'var(--fg-3)', marginTop: 6 }}>Salvat la {savedAt}</p>}
    </div>
  );
};

// ─── Bottleneck Map (Exercițiul 2) ────────────────────────────────────────────
interface BottleneckRow { id: string; situation: string; wasNecessary: 'da' | 'nu' | ''; reason: string; time: string }

const BottleneckMapExercise: React.FC<{ storageKey: string; exerciseId: string }> = ({ storageKey, exerciseId }) => {
  const defaultRows = (): BottleneckRow[] =>
    Array.from({ length: 5 }, (_, i) => ({ id: `r${i}`, situation: '', wasNecessary: '', reason: '', time: '' }));

  const [rows, setRows] = useState<BottleneckRow[]>(() => {
    try { const s = localStorage.getItem(storageKey); if (s) return JSON.parse(s).rows || defaultRows(); } catch {}
    return defaultRows();
  });
  const [conclusion, setConclusion] = useState(() => {
    try { const s = localStorage.getItem(storageKey); return s ? JSON.parse(s).conclusion || '' : ''; } catch { return ''; }
  });
  const [savedAt, setSavedAt] = useState<string | null>(null);

  useEffect(() => {
    loadExerciseResponse(exerciseId).then(cloud => {
      if (cloud && typeof cloud === 'object' && !Array.isArray(cloud)) {
        const c: any = cloud;
        if (Array.isArray(c.rows)) setRows(c.rows);
        if (typeof c.conclusion === 'string') setConclusion(c.conclusion);
        localStorage.setItem(storageKey, JSON.stringify(cloud));
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [exerciseId]);

  const save = (r: BottleneckRow[], c: string) => {
    const payload = { rows: r, conclusion: c };
    localStorage.setItem(storageKey, JSON.stringify(payload));
    pushExerciseResponse(exerciseId, payload);
    setSavedAt(new Date().toLocaleTimeString('ro-RO', { hour: '2-digit', minute: '2-digit' }));
  };
  const updateRow = (id: string, field: keyof BottleneckRow, value: string) => {
    const next = rows.map(r => r.id === id ? { ...r, [field]: value } : r);
    setRows(next); save(next, conclusion);
  };
  const addRow = () => {
    const next = [...rows, { id: Date.now().toString(), situation: '', wasNecessary: '' as const, reason: '', time: '' }];
    setRows(next); save(next, conclusion);
  };
  const removeRow = (id: string) => {
    const next = rows.filter(r => r.id !== id);
    setRows(next); save(next, conclusion);
  };

  const notNeeded = rows.filter(r => r.wasNecessary === 'nu');
  const wastedTime = notNeeded.reduce((a, r) => a + (parseInt(r.time) || 0), 0);
  const filledRows = rows.filter(r => r.situation.trim() || r.wasNecessary);

  return (
    <div>
      <div style={{ background: 'rgba(248,113,113,0.06)', border: '1px solid rgba(248,113,113,0.15)', borderRadius: 12, padding: '12px 16px', marginBottom: 20, fontSize: 13, color: 'var(--fg-2)', lineHeight: 1.6 }}>
        💡 O sticlă cu gât îngust — oricât de mult lichid ai înăuntru, iese doar cât permite gâtul. La fel afacerea ta: crește doar cât îți permiți tu să gestionezi.
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 90px 1fr 72px 32px', gap: 8, marginBottom: 6, padding: '0 2px' }}>
        {['Decizia / Situația', 'Chiar tu?', 'Motivul (dacă Nu)', 'Timp (min)', ''].map((h, i) => (
          <div key={i} style={{ fontSize: 10, fontWeight: 700, color: 'var(--fg-3)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>{h}</div>
        ))}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 7, marginBottom: 12 }}>
        {rows.map((row, idx) => (
          <div key={row.id} style={{ display: 'grid', gridTemplateColumns: '1fr 90px 1fr 72px 32px', gap: 8, alignItems: 'center' }}>
            <input value={row.situation} onChange={e => updateRow(row.id, 'situation', e.target.value)}
              placeholder={`Situația ${idx + 1}...`}
              style={{ padding: '7px 10px', fontSize: 12, background: 'var(--bg-3)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--fg)', width: '100%' }} />
            <div style={{ display: 'flex', gap: 3 }}>
              {(['da', 'nu'] as const).map(val => {
                const active = row.wasNecessary === val;
                const c = val === 'da' ? '#4ade80' : '#f87171';
                return (
                  <button key={val} onClick={() => updateRow(row.id, 'wasNecessary', val)} style={{
                    flex: 1, padding: '6px 0', borderRadius: 6, fontSize: 11, fontWeight: 700, cursor: 'pointer', border: 'none', transition: 'all 0.12s',
                    background: active ? `${c}20` : 'rgba(255,255,255,0.04)',
                    color: active ? c : 'var(--fg-3)',
                    outline: active ? `1.5px solid ${c}50` : '1.5px solid transparent',
                  }}>{val === 'da' ? 'Da' : 'Nu'}</button>
                );
              })}
            </div>
            <input value={row.reason} onChange={e => updateRow(row.id, 'reason', e.target.value)}
              placeholder="Lipsă procedură, lipsă responsabil..."
              disabled={row.wasNecessary !== 'nu'}
              style={{ padding: '7px 10px', fontSize: 12, background: row.wasNecessary !== 'nu' ? 'rgba(255,255,255,0.02)' : 'var(--bg-3)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--fg)', width: '100%', opacity: row.wasNecessary !== 'nu' ? 0.35 : 1 }} />
            <input type="number" min={0} value={row.time} onChange={e => updateRow(row.id, 'time', e.target.value)}
              placeholder="min"
              style={{ padding: '7px 8px', fontSize: 12, background: 'var(--bg-3)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--fg)', textAlign: 'center', width: '100%' }} />
            <button onClick={() => removeRow(row.id)} style={{ width: 28, height: 28, borderRadius: 6, background: 'rgba(248,113,113,0.08)', border: 'none', cursor: 'pointer', color: '#f87171', fontSize: 15, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
          </div>
        ))}
      </div>

      <button onClick={addRow} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', background: 'rgba(196,240,228,0.06)', border: '1px dashed rgba(196,240,228,0.2)', borderRadius: 8, cursor: 'pointer', fontSize: 12, color: 'var(--accent)', marginBottom: 20 }}>
        + Adaugă situație
      </button>

      {filledRows.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 20 }}>
          {[
            { label: 'Situații nu necesare', value: notNeeded.length, color: '#f87171' },
            { label: 'Minute pierdute', value: wastedTime, color: 'var(--gold)' },
            { label: '% Nu trebuiau la tine', value: filledRows.length > 0 ? Math.round((notNeeded.length / filledRows.length) * 100) : 0, color: 'var(--accent)', suffix: '%' },
          ].map(({ label, value, color, suffix }) => (
            <div key={label} style={{ textAlign: 'center', padding: '12px 8px', background: 'var(--bg-3)', borderRadius: 10, border: `1px solid ${color}25` }}>
              <div style={{ fontSize: 24, fontWeight: 700, color, lineHeight: 1 }}>{value}{suffix || ''}</div>
              <div style={{ fontSize: 10, color: 'var(--fg-3)', marginTop: 4 }}>{label}</div>
            </div>
          ))}
        </div>
      )}

      <div style={{ marginBottom: 4 }}>
        <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--fg-2)', marginBottom: 6 }}>Concluzia mea</label>
        <textarea value={conclusion} onChange={e => { setConclusion(e.target.value); save(rows, e.target.value); }}
          placeholder="Principalele mele gâturi de sticlă sunt: ___ Pierd aproximativ ___ minute/săptămână în decizii care nu trebuiau să fie la mine."
          rows={3} style={{ width: '100%', padding: '10px 12px', fontSize: 13, background: 'var(--bg-3)', border: '1px solid var(--border)', borderRadius: 10, color: 'var(--fg)', resize: 'vertical', lineHeight: 1.6 }} />
      </div>
      {savedAt && <p style={{ fontSize: 11, color: 'var(--fg-3)', marginTop: 6 }}>Salvat la {savedAt}</p>}
    </div>
  );
};

// ─── Absence Test (Exercițiul 3) ──────────────────────────────────────────────
interface AbsenceRow { id: string; scenario: string; gravity: 'Mare' | 'Medie' | 'Mică' | ''; causedBy: string }

const AbsenceTestExercise: React.FC<{ storageKey: string; exerciseId: string }> = ({ storageKey, exerciseId }) => {
  const defaultRows = (): AbsenceRow[] =>
    Array.from({ length: 5 }, (_, i) => ({ id: `r${i}`, scenario: '', gravity: '', causedBy: '' }));

  const [rows, setRows] = useState<AbsenceRow[]>(() => {
    try { const s = localStorage.getItem(storageKey); if (s) return JSON.parse(s).rows || defaultRows(); } catch {}
    return defaultRows();
  });
  const [conclusion, setConclusion] = useState(() => {
    try { const s = localStorage.getItem(storageKey); return s ? JSON.parse(s).conclusion || '' : ''; } catch { return ''; }
  });
  const [savedAt, setSavedAt] = useState<string | null>(null);

  useEffect(() => {
    loadExerciseResponse(exerciseId).then(cloud => {
      if (cloud && typeof cloud === 'object' && !Array.isArray(cloud)) {
        const c: any = cloud;
        if (Array.isArray(c.rows)) setRows(c.rows);
        if (typeof c.conclusion === 'string') setConclusion(c.conclusion);
        localStorage.setItem(storageKey, JSON.stringify(cloud));
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [exerciseId]);

  const save = (r: AbsenceRow[], c: string) => {
    const payload = { rows: r, conclusion: c };
    localStorage.setItem(storageKey, JSON.stringify(payload));
    pushExerciseResponse(exerciseId, payload);
    setSavedAt(new Date().toLocaleTimeString('ro-RO', { hour: '2-digit', minute: '2-digit' }));
  };
  const updateRow = (id: string, field: keyof AbsenceRow, value: string) => {
    const next = rows.map(r => r.id === id ? { ...r, [field]: value } : r);
    setRows(next); save(next, conclusion);
  };
  const addRow = () => {
    const next = [...rows, { id: Date.now().toString(), scenario: '', gravity: '' as const, causedBy: '' }];
    setRows(next); save(next, conclusion);
  };
  const removeRow = (id: string) => {
    const next = rows.filter(r => r.id !== id);
    setRows(next); save(next, conclusion);
  };

  const gravColors: Record<string, string> = { Mare: '#f87171', Medie: 'var(--gold)', Mică: '#4ade80' };
  const count = (g: string) => rows.filter(r => r.gravity === g).length;

  return (
    <div>
      <div style={{ background: 'rgba(196,240,228,0.05)', border: '1px solid rgba(196,240,228,0.15)', borderRadius: 12, padding: '14px 18px', marginBottom: 20, fontSize: 14, color: 'var(--fg-2)', lineHeight: 1.6, fontStyle: 'italic', textAlign: 'center' }}>
        "Dacă aș pleca mâine 2 zile și nu aș răspunde la niciun mesaj — ce s-ar întâmpla?"
      </div>
      <p style={{ fontSize: 13, color: 'var(--fg-3)', marginBottom: 16, lineHeight: 1.7 }}>
        Scrie TOATE scenariile care îți vin în cap. Nu le filtra. Nu le analiza. Scrie-le pe toate — oricât de mici sau catastrofice par.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 12 }}>
        {rows.map((row, idx) => (
          <div key={row.id} style={{ display: 'grid', gridTemplateColumns: '1fr 130px 1fr 32px', gap: 8, alignItems: 'start' }}>
            <textarea value={row.scenario} onChange={e => updateRow(row.id, 'scenario', e.target.value)}
              placeholder={`Scenariul ${idx + 1}...`} rows={2}
              style={{ padding: '7px 10px', fontSize: 12, background: 'var(--bg-3)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--fg)', resize: 'none', lineHeight: 1.5, width: '100%' }} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              {(['Mare', 'Medie', 'Mică'] as const).map(g => {
                const active = row.gravity === g;
                return (
                  <button key={g} onClick={() => updateRow(row.id, 'gravity', g)} style={{
                    padding: '5px 8px', borderRadius: 6, fontSize: 11, fontWeight: 700, cursor: 'pointer', border: 'none', transition: 'all 0.12s',
                    background: active ? `${gravColors[g]}20` : 'rgba(255,255,255,0.04)',
                    color: active ? gravColors[g] : 'var(--fg-3)',
                    outline: active ? `1.5px solid ${gravColors[g]}50` : '1.5px solid transparent',
                  }}>{g}</button>
                );
              })}
            </div>
            <textarea value={row.causedBy} onChange={e => updateRow(row.id, 'causedBy', e.target.value)}
              placeholder="Cauzat de: lipsă procedură, lipsă responsabil..." rows={2}
              style={{ padding: '7px 10px', fontSize: 12, background: 'var(--bg-3)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--fg)', resize: 'none', lineHeight: 1.5, width: '100%' }} />
            <button onClick={() => removeRow(row.id)} style={{ width: 28, height: 28, borderRadius: 6, background: 'rgba(248,113,113,0.08)', border: 'none', cursor: 'pointer', color: '#f87171', fontSize: 15, display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: 4 }}>×</button>
          </div>
        ))}
      </div>

      <button onClick={addRow} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', background: 'rgba(196,240,228,0.06)', border: '1px dashed rgba(196,240,228,0.2)', borderRadius: 8, cursor: 'pointer', fontSize: 12, color: 'var(--accent)', marginBottom: 20 }}>
        + Adaugă scenariu
      </button>

      {rows.some(r => r.gravity) && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 20 }}>
          {(['Mare', 'Medie', 'Mică'] as const).map(g => (
            <div key={g} style={{ textAlign: 'center', padding: '12px 8px', background: 'var(--bg-3)', borderRadius: 10, border: `1px solid ${gravColors[g]}25` }}>
              <div style={{ fontSize: 24, fontWeight: 700, color: gravColors[g], lineHeight: 1 }}>{count(g)}</div>
              <div style={{ fontSize: 10, color: 'var(--fg-3)', marginTop: 4 }}>Gravitate {g}</div>
            </div>
          ))}
        </div>
      )}

      <div style={{ marginBottom: 4 }}>
        <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--fg-2)', marginBottom: 6 }}>Concluzia mea</label>
        <textarea value={conclusion} onChange={e => { setConclusion(e.target.value); save(rows, e.target.value); }}
          placeholder="Cele mai mari 3 temeri ale mele sunt cauzate de: ___ Dacă aș construi sistemul — ___ din ___ scenarii ar dispărea."
          rows={3} style={{ width: '100%', padding: '10px 12px', fontSize: 13, background: 'var(--bg-3)', border: '1px solid var(--border)', borderRadius: 10, color: 'var(--fg)', resize: 'vertical', lineHeight: 1.6 }} />
      </div>
      {savedAt && <p style={{ fontSize: 11, color: 'var(--fg-3)', marginTop: 6 }}>Salvat la {savedAt}</p>}
    </div>
  );
};

// ─── Diagnostic Grid (Exercițiul 4 · 50 întrebări) ────────────────────────────
const DIAG_DIMENSIONS = [
  { id: 'dim1', name: 'Claritate & Rol', color: 'var(--accent)', questions: [
    { id: 'd1', text: 'Știu exact ce fac EU și ce NU mai fac eu în afacerea mea' },
    { id: 'd2', text: 'Am scris în mod explicit funcțiile mele ca proprietar — nu doar le știu în cap' },
    { id: 'd3', text: 'Compania are o misiune clară pe care o știu toți angajații' },
    { id: 'd4', text: 'Am o viziune pe 3 ani cu cifre concrete — nu o declarație vagă' },
    { id: 'd5', text: 'Valorile companiei sunt scrise și se reflectă în deciziile zilnice' },
    { id: 'd6', text: 'Angajații înțeleg de ce există firma și unde merge' },
    { id: 'd7', text: 'Știu clar care sunt deciziile pe care nu le voi delega niciodată' },
    { id: 'd8', text: 'Rolul meu în companie s-a schimbat față de acum 2 ani — în bine' },
  ]},
  { id: 'dim2', name: 'Structură & Oameni', color: 'var(--gold)', questions: [
    { id: 'd9',  text: 'Am o organigramă clară pe care o știu toți angajații' },
    { id: 'd10', text: 'Fiecare om din echipă știe cui raportează și cine raportează lui' },
    { id: 'd11', text: 'Fiecare poziție are o fișă de rol scrisă cu responsabilități clare' },
    { id: 'd12', text: 'Știu care e produsul final al fiecărui rol din compania mea' },
    { id: 'd13', text: 'Angajații pot lua decizii în aria lor fără să vină la mine' },
    { id: 'd14', text: 'Când angajez pe cineva nou știu exact ce caut și cum îl evaluez' },
    { id: 'd15', text: 'Nu am oameni care fac același lucru fără să știe unul de altul' },
    { id: 'd16', text: 'Știu care sunt cei 3 oameni cheie fără de care afacerea s-ar opri' },
    { id: 'd17', text: 'Organigrama mea actuală reflectă realitatea, nu ce ar trebui să fie' },
    { id: 'd18', text: 'Am deja gândit organigrama companiei pentru următorii 2-3 ani' },
  ]},
  { id: 'dim3', name: 'Procese', color: '#a78bfa', questions: [
    { id: 'd19', text: 'Procesele principale ale afacerii mele sunt scrise pas cu pas' },
    { id: 'd20', text: 'Un angajat nou poate executa un proces citind documentul, fără să mă întrebe' },
    { id: 'd21', text: 'Știu care sunt cele 5-7 procese fără de care afacerea nu funcționează' },
    { id: 'd22', text: 'Procesele sunt actualizate când ceva se schimbă în realitate' },
    { id: 'd23', text: 'Angajații urmează procesele scrise, nu fiecare pe varianta lui' },
    { id: 'd24', text: 'Am instrucțiuni clare pentru situațiile de excepție și urgență' },
    { id: 'd25', text: 'Știu exact câți pași trec obligatoriu prin mine în procesele principale' },
    { id: 'd26', text: 'Când pleacă un angajat cheie, procesul lui rămâne — nu pleacă cu el' },
    { id: 'd27', text: 'Am o matrice clară: ce poate decide angajatul singur și ce escaladează' },
    { id: 'd28', text: 'Procesele mele produc același rezultat indiferent cine le execută' },
  ]},
  { id: 'dim4', name: 'Control & KPI', color: '#93c5fd', questions: [
    { id: 'd29', text: 'Știu în orice moment cum merge afacerea fără să sun pe nimeni' },
    { id: 'd30', text: 'Am 3-5 indicatori clari pentru fiecare rol important din companie' },
    { id: 'd31', text: 'Primesc rapoarte regulate de la echipă — nu cer eu informația' },
    { id: 'd32', text: 'Tabloul meu de bord are maxim 10 cifre și îl citesc în 5 minute' },
    { id: 'd33', text: 'Indicatorii mei sunt cifre reale — nu sentimente sau impresii' },
    { id: 'd34', text: 'Ritmul de raportare e fix — nu "când are timp" sau "când cer eu"' },
    { id: 'd35', text: 'Știu imediat când ceva deviază de la plan fără să fiu prezent fizic' },
    { id: 'd36', text: 'Am putut lipsi cel puțin 3 zile fără să sune nimeni cu probleme urgente' },
  ]},
  { id: 'dim5', name: 'Delegare', color: '#fca5a5', questions: [
    { id: 'd37', text: 'Am delegat responsabilitate reală — nu doar sarcini punctuale' },
    { id: 'd38', text: 'Oamenii mei au autoritate de decizie în zona lor, nu doar execuție' },
    { id: 'd39', text: 'Când deleghez ceva nu îl preiau înapoi după prima greșeală' },
    { id: 'd40', text: 'Am un acord clar cu fiecare responsabil: ce rezultat, până când, cum raportează' },
    { id: 'd41', text: 'Știu diferența dintre o greșeală acceptabilă și o linie roșie în delegare' },
    { id: 'd42', text: 'Am un plan de retragere treptată pentru fiecare zonă delegată' },
    { id: 'd43', text: 'Numărul de decizii care trec prin mine a scăzut față de acum 6 luni' },
    { id: 'd44', text: 'Pot fi invizibil o săptămână și lucrurile merg fără intervenția mea' },
  ]},
  { id: 'dim6', name: 'Management & Scalare', color: '#6ee7b7', questions: [
    { id: 'd45', text: 'Am un nivel de management între mine și angajații de execuție' },
    { id: 'd46', text: 'Managerii mei conduc echipele lor fără să vină la mine pentru fiecare problemă' },
    { id: 'd47', text: 'Revizuiesc procesele și sistemele cel puțin o dată pe trimestru' },
    { id: 'd48', text: 'Rolul meu s-a mutat pe strategie și viziune, nu pe operațional zilnic' },
    { id: 'd49', text: 'Afacerea mea ar putea funcționa 2 săptămâni fără mine complet' },
    { id: 'd50', text: 'Am un plan clar de scalare pentru următoarele 12 luni' },
  ]},
];

const SCORE_COLORS: Record<number, string> = { 1: '#f87171', 2: '#fb923c', 3: 'var(--gold)', 4: '#86efac', 5: '#4ade80' };

const DiagnosticGridExercise: React.FC<{ storageKey: string }> = ({ storageKey }) => {
  const [answers, setAnswers] = useState<Record<string, number>>(() => {
    try { const s = localStorage.getItem(storageKey); return s ? JSON.parse(s).answers || {} : {}; } catch { return {}; }
  });
  const [commitment, setCommitment] = useState(() => {
    try { const s = localStorage.getItem(storageKey); return s ? JSON.parse(s).commitment || '' : ''; } catch { return ''; }
  });
  const [savedAt, setSavedAt] = useState<string | null>(null);

  const save = (a: Record<string, number>, c: string) => {
    localStorage.setItem(storageKey, JSON.stringify({ answers: a, commitment: c }));
    setSavedAt(new Date().toLocaleTimeString('ro-RO', { hour: '2-digit', minute: '2-digit' }));
  };
  const setAnswer = (qId: string, val: number) => {
    const next = { ...answers, [qId]: val };
    setAnswers(next); save(next, commitment);
  };

  const totalQuestions = DIAG_DIMENSIONS.reduce((a, d) => a + d.questions.length, 0);
  const totalAnswered = DIAG_DIMENSIONS.flatMap(d => d.questions).filter(q => answers[q.id] !== undefined).length;

  const dimScores = DIAG_DIMENSIONS.map(dim => {
    const answered = dim.questions.filter(q => answers[q.id] !== undefined);
    const avg = answered.length > 0 ? answered.reduce((a, q) => a + answers[q.id], 0) / answered.length : 0;
    return { ...dim, avg, answeredCount: answered.length };
  });

  const sorted = [...dimScores].sort((a, b) => a.avg - b.avg);

  let globalIdx = 0;

  return (
    <div>
      {/* Progress */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
        <div style={{ flex: 1, height: 6, background: 'rgba(255,255,255,0.06)', borderRadius: 3, overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${(totalAnswered / totalQuestions) * 100}%`, background: 'var(--accent)', borderRadius: 3, transition: 'width 0.4s ease' }} />
        </div>
        <span style={{ fontSize: 12, color: 'var(--fg-3)', flexShrink: 0 }}>{totalAnswered}/{totalQuestions}</span>
      </div>

      {/* Scale legend */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 24, flexWrap: 'wrap' }}>
        {([1, 2, 3, 4, 5] as const).map(n => {
          const labels: Record<number, string> = { 1: 'Nu există', 2: 'Există slab', 3: 'Există, nu funcț.', 4: 'Funcț. bine', 5: 'Funcț. excelent' };
          return (
            <div key={n} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <div style={{ width: 20, height: 20, borderRadius: 6, background: `${SCORE_COLORS[n]}25`, border: `1.5px solid ${SCORE_COLORS[n]}60`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: SCORE_COLORS[n] }}>{n}</div>
              <span style={{ fontSize: 10, color: 'var(--fg-3)' }}>{labels[n]}</span>
            </div>
          );
        })}
      </div>

      {/* Questions by dimension */}
      {DIAG_DIMENSIONS.map((dim, dimIdx) => {
        const ds = dimScores[dimIdx];
        return (
          <div key={dim.id} style={{ marginBottom: 32 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14, padding: '12px 16px', background: `${dim.color}0e`, border: `1px solid ${dim.color}28`, borderRadius: 12 }}>
              <div>
                <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: dim.color, marginBottom: 2 }}>Dimensiunea {dimIdx + 1} · {dim.questions.length} întrebări</div>
                <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--fg)' }}>{dim.name}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 26, fontWeight: 700, color: ds.avg > 0 ? SCORE_COLORS[Math.round(ds.avg) as 1|2|3|4|5] : 'var(--fg-3)', lineHeight: 1 }}>
                  {ds.avg > 0 ? ds.avg.toFixed(1) : '—'}
                </div>
                <div style={{ fontSize: 9, color: 'var(--fg-3)' }}>{ds.answeredCount}/{dim.questions.length} răsp.</div>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {dim.questions.map(q => {
                globalIdx++;
                const gi = globalIdx;
                const val = answers[q.id];
                return (
                  <div key={q.id} style={{ display: 'flex', gap: 10, alignItems: 'center', padding: '10px 14px', background: val ? `${SCORE_COLORS[val]}06` : 'rgba(255,255,255,0.02)', border: `1px solid ${val ? SCORE_COLORS[val] + '30' : 'var(--border)'}`, borderRadius: 10, transition: 'all 0.15s' }}>
                    <span style={{ fontSize: 10, color: 'var(--fg-3)', minWidth: 20, flexShrink: 0, fontWeight: 600, textAlign: 'right' }}>{gi}</span>
                    <span style={{ flex: 1, fontSize: 13, color: val ? 'var(--fg)' : 'var(--fg-2)', lineHeight: 1.5 }}>{q.text}</span>
                    <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
                      {([1, 2, 3, 4, 5] as const).map(n => {
                        const active = val === n;
                        return (
                          <button key={n} onClick={() => setAnswer(q.id, n)} style={{
                            width: 34, height: 34, borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 700, transition: 'all 0.12s',
                            background: active ? `${SCORE_COLORS[n]}28` : 'rgba(255,255,255,0.04)',
                            color: active ? SCORE_COLORS[n] : 'var(--fg-3)',
                            outline: active ? `2px solid ${SCORE_COLORS[n]}70` : '2px solid transparent',
                            transform: active ? 'scale(1.1)' : 'scale(1)',
                          }}>{n}</button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}

      {/* Score summary */}
      {totalAnswered >= 10 && (
        <div style={{ background: 'var(--bg-3)', border: '1px solid var(--border)', borderRadius: 16, padding: '20px 22px', marginBottom: 24 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--fg)', marginBottom: 16 }}>Scorul tău pe dimensiuni</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {dimScores.map(ds => (
              <div key={ds.id}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontSize: 12, color: 'var(--fg-2)' }}>{ds.name}</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: ds.avg > 0 ? SCORE_COLORS[Math.round(ds.avg) as 1|2|3|4|5] : 'var(--fg-3)' }}>
                    {ds.avg > 0 ? `${ds.avg.toFixed(1)} / 5` : '—'}
                  </span>
                </div>
                <div style={{ height: 6, background: 'rgba(255,255,255,0.06)', borderRadius: 3, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${(ds.avg / 5) * 100}%`, background: ds.color, borderRadius: 3, transition: 'width 0.6s ease' }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Top 3 priorities */}
      {totalAnswered >= 25 && (
        <div style={{ background: 'var(--bg-3)', border: '1px solid rgba(248,113,113,0.2)', borderRadius: 14, padding: '18px 20px', marginBottom: 24 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--fg)', marginBottom: 4 }}>Cele 3 priorități ale tale</div>
          <p style={{ fontSize: 11, color: 'var(--fg-3)', marginBottom: 14 }}>Dimensiunile cu scorul cel mai mic = unde construiești primul</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {sorted.slice(0, 3).map((ds, i) => (
              <div key={ds.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', background: 'var(--bg)', borderRadius: 10, border: '1px solid var(--border)' }}>
                <div style={{ width: 26, height: 26, borderRadius: 8, background: 'rgba(248,113,113,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 12, fontWeight: 700, color: '#f87171' }}>{i + 1}</div>
                <span style={{ flex: 1, fontSize: 13, color: 'var(--fg)', fontWeight: 500 }}>{ds.name}</span>
                <span style={{ fontSize: 14, fontWeight: 700, color: ds.avg > 0 ? SCORE_COLORS[Math.round(ds.avg) as 1|2|3|4|5] : 'var(--fg-3)' }}>
                  {ds.avg > 0 ? `${ds.avg.toFixed(1)}/5` : '—'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Commitment */}
      <div style={{ background: 'rgba(196,240,228,0.04)', border: '1px solid rgba(196,240,228,0.15)', borderRadius: 14, padding: '18px 20px' }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--accent)', marginBottom: 10 }}>Angajamentul meu</div>
        <textarea value={commitment} onChange={e => { setCommitment(e.target.value); save(answers, e.target.value); }}
          placeholder="În aceste 8 săptămâni vreau să schimb: ___"
          rows={3} style={{ width: '100%', padding: '10px 12px', fontSize: 13, background: 'var(--bg-3)', border: '1px solid var(--border)', borderRadius: 10, color: 'var(--fg)', resize: 'vertical', lineHeight: 1.6 }} />
      </div>
      {savedAt && <p style={{ fontSize: 11, color: 'var(--fg-3)', marginTop: 8 }}>Salvat la {savedAt}</p>}
    </div>
  );
};

// ─── Main ExerciseBlock ───────────────────────────────────────────────────────
export const ExerciseBlock: React.FC<ExerciseBlockProps> = ({ exerciseId }) => {
  const { user } = useAuthContext();
  const template = getExerciseTemplate(exerciseId);
  // Keyed per user so exercises are never shared between accounts
  const storageKey = `aa_ex_${user?.id ?? 'anon'}_${exerciseId}`;

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
      case 'activity-audit':
        return <ActivityAuditExercise storageKey={storageKey} />;
      case 'bottleneck-map':
        return <BottleneckMapExercise storageKey={storageKey} />;
      case 'absence-test':
        return <AbsenceTestExercise storageKey={storageKey} />;
      case 'diagnostic-grid':
        return <DiagnosticGridExercise storageKey={storageKey} />;
      default:
        return <FormFieldsExercise template={template} storageKey={storageKey} />;
    }
  };

  const typeLabels: Record<string, string> = {
    checklist: 'Checklist',
    'form-fields': 'Formular',
    'dynamic-table': 'Tabel interactiv',
    quiz: 'Chestionar',
    'text-input': 'Formular',
    'rating-grid': 'Evaluare',
  };

  return (
    <div style={{ padding: '0 0 4px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
        <span style={{
          fontSize: 9, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase',
          color: 'var(--gold)', background: 'rgba(201,169,110,0.12)',
          border: '1px solid rgba(201,169,110,0.2)',
          padding: '2px 8px', borderRadius: 4,
        }}>
          {typeLabels[template.type] || 'Interactiv'}
        </span>
        <span style={{ fontSize: 12, color: 'var(--fg-3)', display: 'flex', alignItems: 'center', gap: 4 }}>
          <ChevronRight size={11} /> Progresul se salvează automat local
        </span>
      </div>
      {renderContent()}
    </div>
  );
};
