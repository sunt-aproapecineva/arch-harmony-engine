import React, { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Plus, Trash2, ChevronRight, ChevronDown, CheckCircle2, Download, Loader2 } from 'lucide-react';
import { getExerciseTemplate, ExerciseTemplate, QuizQuestionItem } from '../../lib/exerciseData';
import { useAuthContext } from '../../context/AuthContext';
import { pushExerciseResponse, loadExerciseResponseWithMeta, subscribeExerciseSync } from '../../lib/exerciseSync';

interface ExerciseBlockProps {
  exerciseId: string;
}

// Save to localStorage + debounced cloud sync. Cloud sync skipped for the
// anonymous storage key (used briefly before user is hydrated).
function saveExLocal(storageKey: string, value: unknown) {
  try {
    localStorage.setItem(storageKey, JSON.stringify(value));
    localStorage.setItem(`${storageKey}__saved_at`, String(Date.now()));
  } catch {}
  // storageKey format: aa_ex_<userId>_<exerciseId>
  const m = storageKey.match(/^aa_ex_([^_]+)_(.+)$/);
  if (m && m[1] !== 'anon') {
    pushExerciseResponse(m[2], value, m[1]);
  }
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
    saveExLocal(storageKey, next);
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
    saveExLocal(storageKey, newVals);
    setSavedAt(new Date().toLocaleTimeString('ro-RO', { hour: '2-digit', minute: '2-digit' }));
  }, [storageKey]);

  const handleChange = (id: string, val: string) => {
    const next = { ...values, [id]: val };
    setValues(next);
    save(next);
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

  const save = (newRows: TableRow[]) => {
    saveExLocal(storageKey, newRows);
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
    saveExLocal(storageKey, next);
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

const ActivityAuditExercise: React.FC<{ storageKey: string }> = ({ storageKey }) => {
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

  const save = (r: ActivityRow[], c: string) => {
    saveExLocal(storageKey, { rows: r, conclusion: c });
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

const BottleneckMapExercise: React.FC<{ storageKey: string }> = ({ storageKey }) => {
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

  const save = (r: BottleneckRow[], c: string) => {
    saveExLocal(storageKey, { rows: r, conclusion: c });
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

const AbsenceTestExercise: React.FC<{ storageKey: string }> = ({ storageKey }) => {
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

  const save = (r: AbsenceRow[], c: string) => {
    saveExLocal(storageKey, { rows: r, conclusion: c });
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
    saveExLocal(storageKey, { answers: a, commitment: c });
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

// ─── Partnership Diagnostic (Lecția 2) ───────────────────────────────────────
const PTYPES = [
  { num: 1, title: 'Ambii activi, fără CEO clar', desc: 'Amândoi conduc simultan. Angajații nu știu pe cine să asculte. Nimeni nu răspunde de nimic.', color: '#f87171' },
  { num: 2, title: 'CEO activ + partener pasiv / investitor', desc: 'Unul conduce zilnic, celălalt a investit bani sau aduce relații. Probleme când investitorul vrea mai mult control.', color: 'var(--gold)' },
  { num: 3, title: 'CEO activ + partener cu rol operațional', desc: 'Structura există pe hârtie dar partenerul-Director nu se subordonează real CEO-ului.', color: '#a78bfa' },
  { num: 4, title: 'Parteneriat de familie', desc: 'Soț/soție, frați, tată-fiu. Relația personală și business-ul se amestecă. Cel mai frecvent tip în România.', color: '#93c5fd' },
  { num: 5, title: 'Inegal ca implicare în timp', desc: 'Unul muncește 60h/săpt, celălalt 20h. Resentimentul acumulat ani de zile iese violent.', color: 'var(--accent)' },
  { num: 6, title: 'Viziuni divergente', desc: 'Au vrut același lucru la început — cu timpul direcțiile s-au separat. Firma intră în paralizie decizională.', color: '#fca5a5' },
];

const P3Q = [
  'Cine e CEO-ul firmei noastre? Cine are autoritatea finală în operațional?',
  'Care e rolul meu operațional concret în firmă? Ce decizii pot lua singur?',
  'Care e rolul partenerului meu operațional? Ce decizii poate lua el singur?',
  'Ce decizii necesită acordul amândurora ca parteneri? (doar strategice — nu operaționale)',
  'Unde vreau să ajungă firma în 3 ani? (cu cifre concrete)',
  'Cel mai important lucru pe care trebuie să îl clarificăm în parteneriatul nostru:',
];

interface PData {
  selectedTypes: number[];
  hasPartner: boolean | null;
  p1_recognition: string; p1_problem: string; p1_duration: string;
  p2_solution: string; p2_step: string; p2_date: string;
  p3_me: Record<string, string>; p3_partner: Record<string, string>; p3_date: string;
  ind_a: string; ind_b: string; ind_c: string;
}
const P_DEFAULT: PData = {
  selectedTypes: [], hasPartner: null,
  p1_recognition: '', p1_problem: '', p1_duration: '',
  p2_solution: '', p2_step: '', p2_date: '',
  p3_me: {}, p3_partner: {}, p3_date: '',
  ind_a: '', ind_b: '', ind_c: '',
};

const PartnershipDiagnosticExercise: React.FC<{ storageKey: string }> = ({ storageKey }) => {
  const [data, setData] = useState<PData>(() => {
    try { const s = localStorage.getItem(storageKey); if (s) return { ...P_DEFAULT, ...JSON.parse(s) }; } catch {}
    return { ...P_DEFAULT };
  });
  const [savedAt, setSavedAt] = useState<string | null>(null);

  const save = (d: PData) => {
    saveExLocal(storageKey, d);
    setSavedAt(new Date().toLocaleTimeString('ro-RO', { hour: '2-digit', minute: '2-digit' }));
  };
  const upd = (patch: Partial<PData>) => {
    const next = { ...data, ...patch };
    setData(next); save(next);
  };
  const updNested = (field: 'p3_me' | 'p3_partner', key: string, val: string) => {
    const next = { ...data, [field]: { ...data[field], [key]: val } };
    setData(next); save(next);
  };

  const toggleType = (n: number) => {
    const sel = data.selectedTypes.includes(n)
      ? data.selectedTypes.filter(x => x !== n)
      : [...data.selectedTypes, n];
    upd({ selectedTypes: sel });
  };

  const fieldStyle: React.CSSProperties = {
    width: '100%', padding: '10px 12px', fontSize: 13,
    background: 'var(--bg-3)', border: '1px solid var(--border)',
    borderRadius: 10, color: 'var(--fg)', resize: 'vertical', lineHeight: 1.6,
  };
  const labelStyle: React.CSSProperties = {
    display: 'block', fontSize: 12, fontWeight: 600,
    color: 'var(--fg-2)', marginBottom: 6,
  };
  const sectionHeader = (n: number, title: string, subtitle: string) => (
    <div style={{ marginBottom: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
        <div style={{ width: 26, height: 26, borderRadius: 8, background: 'rgba(196,240,228,0.1)', border: '1px solid rgba(196,240,228,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <span className="font-aboreto" style={{ fontSize: 10, color: 'var(--accent)', fontWeight: 700 }}>{n}</span>
        </div>
        <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--fg)' }}>{title}</span>
      </div>
      <p style={{ fontSize: 12, color: 'var(--fg-3)', lineHeight: 1.6, paddingLeft: 36 }}>{subtitle}</p>
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>

      {/* ── INTRO WARNING ── */}
      <div style={{ padding: '14px 18px', background: 'rgba(201,169,110,0.08)', border: '1px solid rgba(201,169,110,0.25)', borderRadius: 12, fontSize: 13, color: 'var(--fg-2)', lineHeight: 1.65 }}>
        <strong style={{ color: 'var(--gold)' }}>Dacă ești singur în afacere</strong> — poți sări acest exercițiu și mergi la lecția următoare.<br/>
        <strong>Dacă ai un partener</strong> — acesta e exercițiul cel mai important din Etapa 0. Nu îl sări.
      </div>

      {/* ── PASUL 1: Tipul de parteneriat ── */}
      <div>
        {sectionHeader(1, 'Tipul tău de parteneriat', 'Bifează tipul în care te recunoști. Poți selecta mai multe dacă se suprapun.')}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 10 }}>
          {PTYPES.map(pt => {
            const active = data.selectedTypes.includes(pt.num);
            return (
              <div key={pt.num} onClick={() => toggleType(pt.num)}
                style={{
                  padding: '14px 16px', borderRadius: 12, cursor: 'pointer', transition: 'all 0.15s',
                  background: active ? `${pt.color}12` : 'var(--bg-3)',
                  border: `1.5px solid ${active ? pt.color : 'var(--border)'}`,
                  transform: active ? 'translateY(-1px)' : 'none',
                  boxShadow: active ? `0 4px 16px ${pt.color}18` : 'none',
                }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                  <div style={{
                    width: 28, height: 28, borderRadius: 8, flexShrink: 0,
                    background: active ? `${pt.color}22` : 'rgba(255,255,255,0.04)',
                    border: `1.5px solid ${active ? pt.color : 'rgba(255,255,255,0.12)'}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 11, fontWeight: 700, color: active ? pt.color : 'var(--fg-3)',
                    transition: 'all 0.15s',
                  }}>
                    {active ? '✓' : pt.num}
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 700, color: active ? pt.color : 'var(--fg-2)', lineHeight: 1.3 }}>{pt.title}</span>
                </div>
                <p style={{ fontSize: 11, color: 'var(--fg-3)', lineHeight: 1.55, paddingLeft: 38 }}>{pt.desc}</p>
              </div>
            );
          })}
        </div>
        {data.selectedTypes.length > 0 && (
          <div style={{ marginTop: 10, padding: '8px 14px', background: 'rgba(196,240,228,0.06)', border: '1px solid rgba(196,240,228,0.15)', borderRadius: 8, fontSize: 12, color: 'var(--accent)' }}>
            Ai selectat: Tipul {data.selectedTypes.sort().join(', Tipul ')}
          </div>
        )}
      </div>

      {/* ── PASUL 2: Diagnosticul situației ── */}
      <div>
        {sectionHeader(2, 'Diagnosticul situației tale', 'Răspunde sincer la cele 3 întrebări. Scrie cum este — nu cum vrei să fie.')}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {[
            { key: 'p1_recognition' as const, label: 'De ce te recunoști în acel tip? Descrie concret situația ta în 3–4 propoziții:', rows: 3 },
            { key: 'p1_problem' as const, label: 'Care e problema principală pe care o simți acum în parteneriatul tău?', rows: 3 },
            { key: 'p1_duration' as const, label: 'Cât timp există această problemă? A fost mereu sau a apărut la un moment dat?', rows: 2 },
          ].map(({ key, label, rows }) => (
            <div key={key}>
              <label style={labelStyle}>{label}</label>
              <textarea value={data[key]} onChange={e => upd({ [key]: e.target.value })}
                rows={rows} style={fieldStyle}
                placeholder="Scrie aici..." />
            </div>
          ))}
        </div>
      </div>

      {/* ── PASUL 3: Primul pas concret ── */}
      <div>
        {sectionHeader(3, 'Primul pas concret', 'Nu e suficient să identifici problema. Trebuie să decizi ce faci cu ea — și când.')}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={labelStyle}>Ce soluție din lecție se potrivește cel mai bine situației tale?</label>
            <textarea value={data.p2_solution} onChange={e => upd({ p2_solution: e.target.value })}
              rows={3} style={fieldStyle}
              placeholder="Ex: Trebuie să avem conversația despre cine e CEO-ul firmei noastre. Am evitat-o 2 ani..." />
          </div>
          <div>
            <label style={labelStyle}>Care e primul pas concret pe care îl poți face în această săptămână?</label>
            <textarea value={data.p2_step} onChange={e => upd({ p2_step: e.target.value })}
              rows={2} style={fieldStyle}
              placeholder="Ex: Stabilesc o întâlnire cu partenerul meu joi seara și pun subiectul pe masă..." />
          </div>
          <div>
            <label style={labelStyle}>Data concretă când vei face acel pas: <span style={{ color: 'var(--fg-3)', fontWeight: 400 }}>(nu "când avem timp")</span></label>
            <input type="text" value={data.p2_date} onChange={e => upd({ p2_date: e.target.value })}
              placeholder="Ex: Joi, 23 Mai 2026, ora 19:00"
              style={{ ...fieldStyle, resize: undefined }} />
          </div>
        </div>
      </div>

      {/* ── PASUL 4: Exercițiu cu partenerul / individual ── */}
      <div>
        {sectionHeader(4, 'Exercițiu cu partenerul tău', 'Cel mai valoros pas din acest exercițiu — completați separat, fără să vă consultați, apoi comparați.')}

        {/* Toggle */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
          {[
            { val: true, label: '👥 Am partener — completăm împreună' },
            { val: false, label: '👤 Sunt singur — exerciții individuale' },
          ].map(({ val, label }) => (
            <button key={String(val)} onClick={() => upd({ hasPartner: val })}
              style={{
                flex: 1, padding: '10px 14px', borderRadius: 10, cursor: 'pointer',
                border: `1.5px solid ${data.hasPartner === val ? 'var(--accent)' : 'var(--border)'}`,
                background: data.hasPartner === val ? 'rgba(196,240,228,0.08)' : 'transparent',
                color: data.hasPartner === val ? 'var(--accent)' : 'var(--fg-3)',
                fontSize: 13, fontWeight: data.hasPartner === val ? 700 : 400, transition: 'all 0.15s',
              }}>
              {label}
            </button>
          ))}
        </div>

        {/* WITH PARTNER */}
        {data.hasPartner === true && (
          <div>
            <div style={{ padding: '12px 16px', background: 'rgba(196,240,228,0.05)', border: '1px solid rgba(196,240,228,0.15)', borderRadius: 10, marginBottom: 20, fontSize: 12, color: 'var(--fg-2)', lineHeight: 1.65 }}>
              <strong style={{ color: 'var(--accent)' }}>Cum funcționează:</strong> Fiecare completează coloana lui <strong>separat, fără să se uite la răspunsurile celuilalt</strong>. Abia după ce amândoi au terminat — comparați. Diferențele sunt exact conversația pe care trebuie să o aveți.
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {P3Q.map((q, i) => (
                <div key={i} style={{ background: 'var(--bg-3)', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden' }}>
                  <div style={{ padding: '10px 14px', borderBottom: '1px solid var(--border)', fontSize: 12, color: 'var(--fg-3)', lineHeight: 1.5 }}>
                    <span style={{ color: 'var(--accent)', fontWeight: 700, marginRight: 8 }}>{i + 1}.</span>{q}
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0 }}>
                    <div style={{ padding: '12px 14px', borderRight: '1px solid var(--border)' }}>
                      <label style={{ ...labelStyle, fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--accent)', marginBottom: 8 }}>Răspunsul meu</label>
                      <textarea value={data.p3_me[`q${i}`] || ''} onChange={e => updNested('p3_me', `q${i}`, e.target.value)}
                        rows={3} placeholder="Scrie răspunsul tău..."
                        style={{ ...fieldStyle, fontSize: 12 }} />
                    </div>
                    <div style={{ padding: '12px 14px' }}>
                      <label style={{ ...labelStyle, fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--gold)', marginBottom: 8 }}>Răspunsul partenerului</label>
                      <textarea value={data.p3_partner[`q${i}`] || ''} onChange={e => updNested('p3_partner', `q${i}`, e.target.value)}
                        rows={3} placeholder="Partenerul scrie aici..."
                        style={{ ...fieldStyle, fontSize: 12 }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 16 }}>
              <label style={labelStyle}>Data concretă pentru conversația asta: <span style={{ color: 'var(--fg-3)', fontWeight: 400 }}>(nu "când avem timp")</span></label>
              <input type="text" value={data.p3_date} onChange={e => upd({ p3_date: e.target.value })}
                placeholder="Ex: Sâmbătă, 24 Mai 2026, dimineața"
                style={{ ...fieldStyle, resize: undefined }} />
            </div>
          </div>
        )}

        {/* INDIVIDUAL */}
        {data.hasPartner === false && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ padding: '12px 16px', background: 'rgba(201,169,110,0.06)', border: '1px solid rgba(201,169,110,0.2)', borderRadius: 10, fontSize: 12, color: 'var(--fg-2)', lineHeight: 1.65 }}>
              Completezi exercițiile A, B, C individual. Sunt la fel de valoroase — te ajută să clarifici ce vrei și cum vrei să funcționeze parteneriatul tău.
            </div>
            {[
              {
                key: 'ind_a' as const,
                badge: 'A',
                title: 'Lista deciziilor cu tensiune',
                desc: 'Scrie toate deciziile din ultima lună care au creat tensiune sau conflict cu partenerul tău. Ce tip de conflict era — operațional sau strategic?',
                placeholder: '1. Decizia de a angaja un nou om — conflict despre cost (operațional)\n2. ...',
                rows: 5,
              },
              {
                key: 'ind_b' as const,
                badge: 'B',
                title: 'Parteneriatul ideal',
                desc: 'Descrie în scris cum ar arăta parteneriatul tău ideal — cine face ce, cine decide ce, cum se rezolvă dezacordurile. Aceasta e ținta ta.',
                placeholder: 'Parteneriatul meu ideal arată așa: Eu sunt CEO și am autoritate finală în operațional. Partenerul meu este Director Comercial și...',
                rows: 5,
              },
              {
                key: 'ind_c' as const,
                badge: 'C',
                title: 'Un singur lucru pe care îl schimbi săptămâna asta',
                desc: 'Identifică un singur lucru concret pe care îl poți schimba această săptămână în modul în care funcționezi cu partenerul tău — fără să ai nevoie de acordul lui.',
                placeholder: 'Săptămâna asta o să... (ceva specific, măsurabil, realizabil fără acordul partenerului)',
                rows: 3,
              },
            ].map(({ key, badge, title, desc, placeholder, rows }) => (
              <div key={key} style={{ background: 'var(--bg-3)', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden' }}>
                <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                  <div style={{ width: 28, height: 28, borderRadius: 8, background: 'var(--gold-dim)', border: '1px solid rgba(201,169,110,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 12, fontWeight: 700, color: 'var(--gold)' }}>{badge}</div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--fg)', marginBottom: 2 }}>{title}</div>
                    <div style={{ fontSize: 11, color: 'var(--fg-3)', lineHeight: 1.55 }}>{desc}</div>
                  </div>
                </div>
                <div style={{ padding: '12px 16px' }}>
                  <textarea value={data[key]} onChange={e => upd({ [key]: e.target.value })}
                    rows={rows} placeholder={placeholder}
                    style={fieldStyle} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {savedAt && <p style={{ fontSize: 11, color: 'var(--fg-3)' }}>Salvat automat la {savedAt}</p>}
    </div>
  );
};

// ─── SĂPTĂMÂNA 2 · Etapa 1 · Fundația ──────────────────────────────────────

// ─── Exercițiu 1: Misiunea Viziunea Valorile ──────────────────────────────
const FoundationManifestExercise: React.FC<{ storageKey: string }> = ({ storageKey }) => {
  const init = () => { try { const s = localStorage.getItem(storageKey); return s ? JSON.parse(s) : {}; } catch { return {}; } };
  const [vals, setVals] = useState<Record<string, string>>(init);
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [openTests, setOpenTests] = useState<Record<string, boolean>>({});

  const save = (v: Record<string, string>) => {
    saveExLocal(storageKey, v);
    setSavedAt(new Date().toLocaleTimeString('ro-RO', { hour: '2-digit', minute: '2-digit' }));
  };
  const upd = (id: string, val: string) => {
    const next = { ...vals, [id]: val };
    setVals(next);
    save(next);
  };
  const toggleTest = (id: string) => setOpenTests(p => ({ ...p, [id]: !p[id] }));

  const fieldStyle: React.CSSProperties = {
    width: '100%', padding: '10px 12px', fontSize: 13, lineHeight: 1.65,
    background: 'var(--bg-3)', border: '1px solid var(--border)',
    borderRadius: 10, color: 'var(--fg)', resize: 'vertical',
    transition: 'border-color 0.15s', boxSizing: 'border-box',
  };
  const finalFieldStyle: React.CSSProperties = {
    ...fieldStyle,
    background: 'rgba(196,240,228,0.04)',
    border: '1px solid rgba(196,240,228,0.25)',
    color: 'var(--accent)',
    fontWeight: 600,
    fontSize: 14,
  };

  const bloc = (num: string, title: string, subtitle: string, color: string) => (
    <div style={{ marginBottom: 8 }}>
      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
        <div style={{ width: 22, height: 22, borderRadius: 7, background: `${color}18`, border: `1.5px solid ${color}50`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 800, color, flexShrink: 0 }}>{num}</div>
        <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--fg)' }}>{title}</span>
      </div>
      <p style={{ fontSize: 12, color: 'var(--fg-3)', lineHeight: 1.65, marginLeft: 30 }}>{subtitle}</p>
    </div>
  );

  const testAccordion = (id: string, items: string[], color: string) => (
    <div style={{ marginTop: 12, borderRadius: 10, border: `1px solid ${color}20`, overflow: 'hidden' }}>
      <button onClick={() => toggleTest(id)} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '9px 14px', background: `${color}08`, border: 'none', cursor: 'pointer', fontSize: 11, color: color, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
        <span>✓ Testul înainte să continui</span>
        <ChevronDown size={13} style={{ transform: openTests[id] ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
      </button>
      {openTests[id] && (
        <div style={{ padding: '10px 14px', display: 'flex', flexDirection: 'column', gap: 6 }}>
          {items.map((item, i) => (
            <div key={i} style={{ fontSize: 12, color: 'var(--fg-2)', lineHeight: 1.5, display: 'flex', gap: 8, alignItems: 'flex-start' }}>
              <span style={{ color, flexShrink: 0, fontWeight: 700 }}>→</span>
              <span>{item}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>

      {/* ── BLOCUL 1: Misiunea ── */}
      <div style={{ padding: '24px', background: 'rgba(196,240,228,0.03)', border: '1px solid rgba(196,240,228,0.12)', borderRadius: 16 }}>
        {bloc('1', 'Misiunea', 'De ce există firma ta. Filtrul după care iei fiecare decizie importantă.', 'var(--accent)')}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginTop: 18 }}>
          {[
            { id: 'm_prob', label: '1. Ce problemă concretă rezolvă firma ta?', ph: 'Ex: Antreprenorii sunt blocați în operațional și nu pot delega' },
            { id: 'm_cine', label: '2. Pentru cine anume o rezolvi?', ph: 'Ex: Antreprenori cu afaceri active și echipe de 5–50 de angajați' },
            { id: 'm_cum', label: '3. Cum o rezolvi diferit față de alții?', ph: 'Ex: Prin sistematizare pas cu pas, cu metode testate în afaceri reale' },
            { id: 'm_sch', label: '4. Ce se schimbă în viața clientului după ce lucrează cu tine?', ph: 'Ex: Afacerea funcționează fără el. El are timp să trăiască, nu doar să muncească.' },
          ].map(f => (
            <div key={f.id}>
              <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--fg-2)', display: 'block', marginBottom: 6 }}>{f.label}</label>
              <textarea value={vals[f.id] || ''} onChange={e => upd(f.id, e.target.value)} placeholder={f.ph} rows={2}
                style={fieldStyle}
                onFocus={e => (e.target.style.borderColor = 'rgba(196,240,228,0.35)')}
                onBlur={e => (e.target.style.borderColor = 'var(--border)')} />
            </div>
          ))}
          <div>
            <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--accent)', display: 'block', marginBottom: 6, letterSpacing: '0.04em', textTransform: 'uppercase' }}>✦ Misiunea mea — formularea finală (o propoziție)</label>
            <textarea value={vals['m_final'] || ''} onChange={e => upd('m_final', e.target.value)}
              placeholder="Ajutăm [cine] să [facă ce] prin [cum], astfel încât [rezultat]."
              rows={2} style={finalFieldStyle}
              onFocus={e => (e.target.style.boxShadow = '0 0 0 2px rgba(196,240,228,0.15)')}
              onBlur={e => (e.target.style.boxShadow = 'none')} />
          </div>
        </div>
        {testAccordion('tm', [
          'O pot spune dintr-o propoziție — nu mai mult',
          'Angajatul meu cel mai nou înțelege instant ce face firma citind-o',
          'Pot lua o decizie dificilă folosind-o ca filtru — și răspunsul e clar',
        ], 'var(--accent)')}
      </div>

      {/* ── BLOCUL 2: Viziunea ── */}
      <div style={{ padding: '24px', background: 'rgba(201,169,110,0.03)', border: '1px solid rgba(201,169,110,0.15)', borderRadius: 16 }}>
        {bloc('2', 'Viziunea', 'Unde ești în 3 ani — cu cifre concrete. Fără cifre, viziunea e un vis.', 'var(--gold)')}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginTop: 18 }}>
          {[
            { id: 'v_desc', label: '1. Cum arată firma ta peste 3 ani? Descrie în cuvinte.', ph: 'Ex: Suntem consultanța de referință pentru antreprenorii din RO și MD care vor să sistematizeze', rows: 3 },
            { id: 'v_ca', label: '2. Cifra de afaceri în 3 ani:', ph: 'Scrie un număr concret — nu "mai mult"', rows: 1 },
            { id: 'v_ang', label: '3. Numărul de angajați în 3 ani:', ph: 'Ex: 12 angajați full-time', rows: 1 },
            { id: 'v_piete', label: '4. În ce piețe ești prezent în 3 ani?', ph: 'Ex: România, Republica Moldova, diaspora din Europa', rows: 2 },
            { id: 'v_poz', label: '5. Ce poziție ocupi pe piață în 3 ani?', ph: 'Ex: Top 3 în industrie, referința pentru segmentul de IMM-uri cu 10–50 angajați', rows: 2 },
          ].map(f => (
            <div key={f.id}>
              <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--fg-2)', display: 'block', marginBottom: 6 }}>{f.label}</label>
              <textarea value={vals[f.id] || ''} onChange={e => upd(f.id, e.target.value)} placeholder={f.ph} rows={f.rows}
                style={fieldStyle}
                onFocus={e => (e.target.style.borderColor = 'rgba(201,169,110,0.35)')}
                onBlur={e => (e.target.style.borderColor = 'var(--border)')} />
            </div>
          ))}
          <div>
            <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--gold)', display: 'block', marginBottom: 6, letterSpacing: '0.04em', textTransform: 'uppercase' }}>✦ Viziunea mea — formularea finală (aspirație + cifre + timp)</label>
            <textarea value={vals['v_final'] || ''} onChange={e => upd('v_final', e.target.value)}
              placeholder="În [an], [Firma] va fi [descriere], cu [CA] cifră de afaceri, [X] angajați, prezentă în [piețe]."
              rows={3} style={{ ...finalFieldStyle, borderColor: 'rgba(201,169,110,0.3)', color: 'var(--gold)' }}
              onFocus={e => (e.target.style.boxShadow = '0 0 0 2px rgba(201,169,110,0.15)')}
              onBlur={e => (e.target.style.boxShadow = 'none')} />
          </div>
        </div>
        {testAccordion('tv', [
          'Are un orizont de timp clar — 3 ani',
          'Are cifre concrete — nu doar cuvinte aspiraționale',
          'E ambițioasă dar ancorată în realitate — echipa poate crede în ea',
          'Știu exact cum arată succesul — pot măsura când am ajuns acolo',
        ], 'var(--gold)')}
      </div>

      {/* ── BLOCUL 3: Valorile ── */}
      <div style={{ padding: '24px', background: 'rgba(167,139,250,0.03)', border: '1px solid rgba(167,139,250,0.15)', borderRadius: 16 }}>
        {bloc('3', 'Valorile', 'Regulile echipei când tu nu ești în cameră. Maxim 5 valori. Fiecare scrisă ca un comportament concret.', '#a78bfa')}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginTop: 18 }}>
          {[
            { id: 'val_apreciez', label: '1. Care sunt comportamentele pe care le apreciezi cel mai mult în echipa ta?', ph: 'Ex: Când cineva spune adevărul chiar dacă e inconfortabil', rows: 3 },
            { id: 'val_intolerat', label: '2. Ce comportamente nu tolerezi niciodată în firmă?', ph: 'Ex: Minciuna față de client, lipsa de responsabilitate pentru greșeli', rows: 3 },
            { id: 'val_descriere', label: '3. Cum îți dorești să te descrie clienții tăi?', ph: 'Ex: Direct, de încredere, care livrează ce promite, fără surprize neplăcute', rows: 3 },
          ].map(f => (
            <div key={f.id}>
              <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--fg-2)', display: 'block', marginBottom: 6 }}>{f.label}</label>
              <textarea value={vals[f.id] || ''} onChange={e => upd(f.id, e.target.value)} placeholder={f.ph} rows={f.rows}
                style={fieldStyle}
                onFocus={e => (e.target.style.borderColor = 'rgba(167,139,250,0.35)')}
                onBlur={e => (e.target.style.borderColor = 'var(--border)')} />
            </div>
          ))}
          <div>
            <label style={{ fontSize: 12, fontWeight: 700, color: '#a78bfa', display: 'block', marginBottom: 10, letterSpacing: '0.04em', textTransform: 'uppercase' }}>✦ Cele 5 valori cu comportamentele asociate</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[1,2,3,4,5].map(n => (
                <div key={n} style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 8, alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 22, height: 22, borderRadius: 6, background: 'rgba(167,139,250,0.15)', border: '1px solid rgba(167,139,250,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 800, color: '#a78bfa', flexShrink: 0 }}>{n}</div>
                    <input value={vals[`val_v${n}`] || ''} onChange={e => upd(`val_v${n}`, e.target.value)}
                      placeholder={`Valoarea ${n}`}
                      style={{ width: '100%', padding: '8px 10px', fontSize: 12, background: 'var(--bg-3)', border: '1px solid var(--border)', borderRadius: 8, color: '#a78bfa', fontWeight: 600, boxSizing: 'border-box' }}
                      onFocus={e => (e.target.style.borderColor = 'rgba(167,139,250,0.4)')}
                      onBlur={e => (e.target.style.borderColor = 'var(--border)')} />
                  </div>
                  <input value={vals[`val_b${n}`] || ''} onChange={e => upd(`val_b${n}`, e.target.value)}
                    placeholder="Ce înseamnă concret ca comportament..."
                    style={{ width: '100%', padding: '8px 10px', fontSize: 12, background: 'var(--bg-3)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--fg)', boxSizing: 'border-box' }}
                    onFocus={e => (e.target.style.borderColor = 'rgba(167,139,250,0.35)')}
                    onBlur={e => (e.target.style.borderColor = 'var(--border)')} />
                </div>
              ))}
            </div>
          </div>
        </div>
        {testAccordion('tval', [
          'Am maxim 5 valori',
          'Fiecare descrie un comportament concret — nu o calitate generală',
          'Pot concedia pe cineva care încalcă fiecare valoare — testul realității',
          'Valorile mele nu pot fi ale oricărei alte firme — sunt specifice mie',
          'Pot angaja pe cineva folosind valorile ca criterii de selecție',
        ], '#a78bfa')}
      </div>

      {savedAt && <p style={{ fontSize: 11, color: 'var(--accent)', textAlign: 'right' }}>Salvat automat ✓ {savedAt}</p>}
    </div>
  );
};

// ─── Exercițiu 2: Checklist de Calitate ──────────────────────────────────────
const QUALITY_CHECKLIST_ITEMS = [
  { id: 'q_m1', group: 'Misiunea', label: 'O pot spune dintr-o propoziție — fără să mă pierd în detalii' },
  { id: 'q_m2', group: 'Misiunea', label: 'Răspunde clar la CE facem, PENTRU CINE și CE SCHIMBĂM în viața lor' },
  { id: 'q_m3', group: 'Misiunea', label: 'Angajatul meu cel mai nou înțelege instant ce face firma citind-o' },
  { id: 'q_m4', group: 'Misiunea', label: 'Pot lua o decizie dificilă folosind misiunea ca filtru — și răspunsul e clar' },
  { id: 'q_v1', group: 'Viziunea', label: 'Are un orizont de timp clar — 3 ani' },
  { id: 'q_v2', group: 'Viziunea', label: 'Are cifre concrete: cifra de afaceri, număr angajați, piețe, poziție pe piață' },
  { id: 'q_v3', group: 'Viziunea', label: 'E ambițioasă dar ancorată în realitate — echipa poate crede în ea' },
  { id: 'q_v4', group: 'Viziunea', label: 'Știu exact cum arată succesul — pot măsura când am ajuns acolo' },
  { id: 'q_val1', group: 'Valorile', label: 'Am maxim 5 valori — nu mai mult' },
  { id: 'q_val2', group: 'Valorile', label: 'Fiecare valoare descrie un comportament concret — nu o calitate generală' },
  { id: 'q_val3', group: 'Valorile', label: 'Pot concedia pe cineva care încalcă fiecare valoare — testul realității' },
  { id: 'q_val4', group: 'Valorile', label: 'Valorile mele nu pot fi ale oricărei alte firme — sunt specifice mie' },
  { id: 'q_val5', group: 'Valorile', label: 'Pot angaja pe cineva folosind valorile ca criterii de selecție' },
  { id: 'q_g1', group: 'General', label: 'Cele 3 elemente sunt consistente între ele — se aliniază și se susțin reciproc' },
  { id: 'q_g2', group: 'General', label: 'Am completat Manifestul Fundației — pagina A4 de la finalul acestui document' },
  { id: 'q_g3', group: 'General', label: 'Sunt pregătit să prezint Manifestul echipei mele' },
];

const GROUP_COLORS: Record<string, string> = {
  'Misiunea': 'var(--accent)',
  'Viziunea': 'var(--gold)',
  'Valorile': '#a78bfa',
  'General': '#93c5fd',
};

const QualityChecklistExercise: React.FC<{ storageKey: string }> = ({ storageKey }) => {
  const [checked, setChecked] = useState<Record<string, boolean>>(() => {
    try { const s = localStorage.getItem(storageKey); return s ? JSON.parse(s) : {}; } catch { return {}; }
  });
  const [savedAt, setSavedAt] = useState<string | null>(null);

  const toggle = (id: string) => {
    const next = { ...checked, [id]: !checked[id] };
    setChecked(next);
    saveExLocal(storageKey, next);
    setSavedAt(new Date().toLocaleTimeString('ro-RO', { hour: '2-digit', minute: '2-digit' }));
  };

  const total = QUALITY_CHECKLIST_ITEMS.length;
  const doneCount = QUALITY_CHECKLIST_ITEMS.filter(i => checked[i.id]).length;
  const pct = Math.round((doneCount / total) * 100);
  const allDone = doneCount === total;

  const groups = Array.from(new Set(QUALITY_CHECKLIST_ITEMS.map(i => i.group)));

  return (
    <div>
      {/* Progress bar */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--fg-3)', marginBottom: 6 }}>
          <span>{doneCount}/{total} bifate</span>
          <span style={{ color: allDone ? '#4ade80' : 'var(--fg-3)', fontWeight: allDone ? 700 : 400 }}>
            {allDone ? '✓ Gata de predat!' : `${pct}%`}
          </span>
        </div>
        <div style={{ height: 6, background: 'rgba(255,255,255,0.06)', borderRadius: 3, overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${pct}%`, background: allDone ? '#4ade80' : 'var(--accent)', borderRadius: 3, transition: 'width 0.4s ease' }} />
        </div>
      </div>

      {allDone && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          style={{ marginBottom: 20, padding: '16px 20px', background: 'rgba(74,222,128,0.08)', border: '1px solid rgba(74,222,128,0.25)', borderRadius: 14, display: 'flex', alignItems: 'center', gap: 12 }}
        >
          <CheckCircle2 size={22} style={{ color: '#4ade80', flexShrink: 0 }} />
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#4ade80' }}>Toate criteriile bifate!</div>
            <div style={{ fontSize: 12, color: 'var(--fg-3)' }}>Manifestul tău e gata de predat. Mergi mai departe la Exercițiul 3.</div>
          </div>
        </motion.div>
      )}

      {groups.map(group => {
        const items = QUALITY_CHECKLIST_ITEMS.filter(i => i.group === group);
        const groupColor = GROUP_COLORS[group] || 'var(--accent)';
        const groupDone = items.filter(i => checked[i.id]).length;
        return (
          <div key={group} style={{ marginBottom: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
              <div style={{ height: 2, width: 16, background: groupColor, borderRadius: 1 }} />
              <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: groupColor }}>{group}</span>
              <span style={{ fontSize: 10, color: 'var(--fg-3)' }}>{groupDone}/{items.length}</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {items.map((item, idx) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.03 }}
                  onClick={() => toggle(item.id)}
                  style={{
                    display: 'flex', alignItems: 'flex-start', gap: 12, padding: '10px 14px',
                    borderRadius: 10, cursor: 'pointer',
                    background: checked[item.id] ? 'rgba(74,222,128,0.07)' : 'var(--bg-3)',
                    border: `1px solid ${checked[item.id] ? 'rgba(74,222,128,0.22)' : 'var(--border)'}`,
                    transition: 'all 0.15s',
                  }}
                >
                  <div style={{
                    width: 20, height: 20, borderRadius: 6, flexShrink: 0, marginTop: 1,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: checked[item.id] ? 'rgba(74,222,128,0.18)' : 'var(--bg-2)',
                    border: `1.5px solid ${checked[item.id] ? '#4ade80' : 'var(--border)'}`,
                    transition: 'all 0.15s',
                  }}>
                    {checked[item.id] && <Check size={11} style={{ color: '#4ade80' }} />}
                  </div>
                  <span style={{ fontSize: 13, color: checked[item.id] ? 'var(--fg-2)' : 'var(--fg)', lineHeight: 1.55 }}>{item.label}</span>
                </motion.div>
              ))}
            </div>
          </div>
        );
      })}

      {savedAt && <p style={{ fontSize: 11, color: 'var(--accent)', textAlign: 'right', marginTop: 8 }}>Salvat ✓ {savedAt}</p>}
    </div>
  );
};

const TeamFeedbackReport: React.FC<{ storageKey: string }> = ({ storageKey }) => {
  const init = () => { try { const s = localStorage.getItem(storageKey); return s ? JSON.parse(s) : { obiectii: [{ ob: '', raspuns: '' }], checklist: {} }; } catch { return { obiectii: [{ ob: '', raspuns: '' }], checklist: {} }; } };
  const [data, setData] = useState<{
    s1_parti: string; s1_bine: string; s1_surprins: string;
    s2_obiectii_text: string;
    s3_neclar: string; s3_schimba: string;
    s4_ritual: string; s4_data: string;
    obiectii: { ob: string; raspuns: string }[];
    checklist: Record<string, boolean>;
  }>(init);
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const save = (d: typeof data) => {
    saveExLocal(storageKey, d);
    setSavedAt(new Date().toLocaleTimeString('ro-RO', { hour: '2-digit', minute: '2-digit' }));
  };
  const upd = (patch: Partial<typeof data>) => {
    const next = { ...data, ...patch };
    setData(next);
    save(next);
  };

  const addObiectie = () => {
    const next = { ...data, obiectii: [...(data.obiectii || []), { ob: '', raspuns: '' }] };
    setData(next); save(next);
  };
  const updObiectie = (idx: number, field: 'ob' | 'raspuns', val: string) => {
    const obiectii = (data.obiectii || []).map((r, i) => i === idx ? { ...r, [field]: val } : r);
    const next = { ...data, obiectii };
    setData(next);
    save(next);
  };
  const removeObiectie = (idx: number) => {
    const obiectii = (data.obiectii || []).filter((_, i) => i !== idx);
    const next = { ...data, obiectii: obiectii.length ? obiectii : [{ ob: '', raspuns: '' }] };
    setData(next); save(next);
  };
  const toggleCheck = (id: string) => {
    const checklist = { ...data.checklist, [id]: !data.checklist?.[id] };
    const next = { ...data, checklist };
    setData(next); save(next);
  };

  const fieldStyle: React.CSSProperties = { width: '100%', padding: '9px 12px', fontSize: 13, lineHeight: 1.65, background: 'var(--bg-3)', border: '1px solid var(--border)', borderRadius: 10, color: 'var(--fg)', resize: 'vertical', boxSizing: 'border-box' as const, transition: 'border-color 0.15s' };

  const PREDARE_ITEMS = [
    { id: 'p1', label: 'Am organizat ședința cu echipa mea' },
    { id: 'p2', label: 'Am prezentat Manifestul element cu element — nu l-am citit' },
    { id: 'p3', label: 'Am creat spațiu pentru dialog real — nu doar Q&A formal' },
    { id: 'p4', label: 'Am notat toate obiecțiile — inclusiv pe cele incomode' },
    { id: 'p5', label: 'Am stabilit un ritual concret pentru săptămâna viitoare' },
    { id: 'p6', label: 'Manifestul e afișat vizibil în biroul meu sau al echipei' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>

      {/* Secțiunea 1 */}
      <div>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--accent)', marginBottom: 14 }}>Secțiunea 1 — Cum a decurs ședința</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {[
            { key: 's1_parti', label: '1. Câți oameni au participat și cum ai organizat ședința:', ph: 'Ex: 4 angajați, ședință de 45 min în sala de conferințe, fără laptopuri', rows: 2 },
            { key: 's1_bine', label: '2. Ce a mers bine — ce a rezonat cu echipa, ce au primit bine:', ph: 'Ex: Valorile i-au surprins pozitiv. Au spus că se recunosc în ele.', rows: 3 },
            { key: 's1_surprins', label: '3. Ce te-a surprins — reacții la care nu te așteptai:', ph: 'Ex: Un angajat a zis că e prima dată când aude de viziunea firmei. M-a lovit asta.', rows: 3 },
          ].map(f => (
            <div key={f.key}>
              <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--fg-2)', display: 'block', marginBottom: 6 }}>{f.label}</label>
              <textarea value={(data as any)[f.key] || ''} onChange={e => upd({ [f.key]: e.target.value } as any)} placeholder={f.ph} rows={f.rows}
                style={fieldStyle}
                onFocus={e => (e.target.style.borderColor = 'rgba(196,240,228,0.35)')}
                onBlur={e => (e.target.style.borderColor = 'var(--border)')} />
            </div>
          ))}
        </div>
      </div>

      {/* Secțiunea 2: Obiecțiile */}
      <div>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: 6 }}>Secțiunea 2 — Obiecțiile principale</div>
        <p style={{ fontSize: 12, color: 'var(--fg-3)', marginBottom: 14 }}>Scrie fiecare obiecție exact cum a fost formulată — nu cum ai vrea să fi fost.</p>
        <div style={{ overflowX: 'auto', marginBottom: 10 }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
            <thead>
              <tr>
                {['Obiecția sau întrebarea', 'Cum ai răspuns'].map(col => (
                  <th key={col} style={{ padding: '8px 10px', textAlign: 'left', fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--fg-3)', borderBottom: '1px solid var(--border)' }}>{col}</th>
                ))}
                <th style={{ width: 32 }} />
              </tr>
            </thead>
            <tbody>
              {(data.obiectii || []).map((row, idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '6px 4px', width: '48%' }}>
                    <textarea value={row.ob} onChange={e => updObiectie(idx, 'ob', e.target.value)} placeholder={`Obiecția ${idx + 1}...`} rows={2}
                      style={{ ...fieldStyle, fontSize: 12, resize: 'none' }}
                      onFocus={e => (e.target.style.borderColor = 'rgba(201,169,110,0.4)')}
                      onBlur={e => (e.target.style.borderColor = 'var(--border)')} />
                  </td>
                  <td style={{ padding: '6px 4px', width: '48%' }}>
                    <textarea value={row.raspuns} onChange={e => updObiectie(idx, 'raspuns', e.target.value)} placeholder="Cum ai răspuns..." rows={2}
                      style={{ ...fieldStyle, fontSize: 12, resize: 'none' }}
                      onFocus={e => (e.target.style.borderColor = 'rgba(196,240,228,0.35)')}
                      onBlur={e => (e.target.style.borderColor = 'var(--border)')} />
                  </td>
                  <td style={{ padding: '6px 4px', textAlign: 'center' }}>
                    <button onClick={() => removeObiectie(idx)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--fg-3)', padding: 4, display: 'flex', transition: 'color 0.15s' }}
                      onMouseEnter={e => (e.currentTarget.style.color = '#f87171')}
                      onMouseLeave={e => (e.currentTarget.style.color = 'var(--fg-3)')}>
                      <Trash2 size={12} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <button onClick={addObiectie} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', background: 'rgba(201,169,110,0.06)', border: '1px dashed rgba(201,169,110,0.25)', borderRadius: 8, cursor: 'pointer', fontSize: 12, color: 'var(--gold)', fontWeight: 600 }}>
          <Plus size={13} /> Adaugă obiecție
        </button>
      </div>

      {/* Secțiunea 3 */}
      <div>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#a78bfa', marginBottom: 14 }}>Secțiunea 3 — Ce rămâne de clarificat</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {[
            { key: 's3_neclar', label: '1. Ce a rămas neclar pentru echipă după ședință:', ph: 'Ex: Nu au înțeles diferența dintre misiune și viziune. Vom relua.', rows: 3 },
            { key: 's3_schimba', label: '2. Ce ai schimba în prezentare data viitoare:', ph: 'Ex: Aș da mai mult timp pentru valorile. Am grăbit acea parte.', rows: 3 },
          ].map(f => (
            <div key={f.key}>
              <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--fg-2)', display: 'block', marginBottom: 6 }}>{f.label}</label>
              <textarea value={(data as any)[f.key] || ''} onChange={e => upd({ [f.key]: e.target.value } as any)} placeholder={f.ph} rows={f.rows}
                style={fieldStyle}
                onFocus={e => (e.target.style.borderColor = 'rgba(167,139,250,0.35)')}
                onBlur={e => (e.target.style.borderColor = 'var(--border)')} />
            </div>
          ))}
        </div>
      </div>

      {/* Secțiunea 4 */}
      <div>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#93c5fd', marginBottom: 14 }}>Secțiunea 4 — Primul ritual concret</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--fg-2)', display: 'block', marginBottom: 6 }}>1. Ce ritual săptămânal introduci de săptămâna viitoare pentru a ține Manifestul viu:</label>
            <textarea value={data.s4_ritual || ''} onChange={e => upd({ s4_ritual: e.target.value })} rows={2}
              placeholder="Ex: Ședința de luni începe cu o valoare. 2 minute."
              style={fieldStyle}
              onFocus={e => (e.target.style.borderColor = 'rgba(147,197,253,0.4)')}
              onBlur={e => (e.target.style.borderColor = 'var(--border)')} />
          </div>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--fg-2)', display: 'block', marginBottom: 6 }}>2. Data concretă când introduci primul ritual:</label>
            <input type="text" value={data.s4_data || ''} onChange={e => upd({ s4_data: e.target.value })}
              placeholder="Ex: Luni, 26 Mai 2026"
              style={{ ...fieldStyle, resize: undefined }} />
          </div>
        </div>
      </div>

      {/* Checklist predare */}
      <div style={{ background: 'rgba(196,240,228,0.04)', border: '1px solid rgba(196,240,228,0.15)', borderRadius: 14, padding: '18px 20px' }}>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--accent)', marginBottom: 12 }}>Checklist de predare — Exercițiul 3</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
          {PREDARE_ITEMS.map((item, idx) => (
            <motion.div key={item.id}
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.04 }}
              onClick={() => toggleCheck(item.id)}
              style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '9px 12px', borderRadius: 9, cursor: 'pointer', background: data.checklist?.[item.id] ? 'rgba(74,222,128,0.07)' : 'var(--bg-3)', border: `1px solid ${data.checklist?.[item.id] ? 'rgba(74,222,128,0.22)' : 'var(--border)'}`, transition: 'all 0.15s' }}
            >
              <div style={{ width: 18, height: 18, borderRadius: 5, flexShrink: 0, marginTop: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', background: data.checklist?.[item.id] ? 'rgba(74,222,128,0.18)' : 'var(--bg-2)', border: `1.5px solid ${data.checklist?.[item.id] ? '#4ade80' : 'var(--border)'}`, transition: 'all 0.15s' }}>
                {data.checklist?.[item.id] && <Check size={10} style={{ color: '#4ade80' }} />}
              </div>
              <span style={{ fontSize: 12, color: data.checklist?.[item.id] ? 'var(--fg-2)' : 'var(--fg)', lineHeight: 1.5 }}>{item.label}</span>
            </motion.div>
          ))}
        </div>
      </div>

      {savedAt && <p style={{ fontSize: 11, color: 'var(--accent)', textAlign: 'right' }}>Salvat automat ✓ {savedAt}</p>}
    </div>
  );
};

// ─── Livrabil: Manifestul Fundației ──────────────────────────────────────────
const ManifestPreview: React.FC<{ storageKey: string }> = ({ storageKey }) => {
  const { user } = useAuthContext();
  const ex1Key = `aa_ex_${user?.id ?? 'anon'}_e-1-s2-1`;

  const getEx1Local = () => { try { const s = localStorage.getItem(ex1Key); return s ? JSON.parse(s) : {}; } catch { return {}; } };
  const [ex1, setEx1] = useState<Record<string, string>>(getEx1Local);
  const [ex1Loading, setEx1Loading] = useState<boolean>(!user?.id ? false : Object.keys(getEx1Local()).length === 0);

  // Hydrate Exercise-1 answers from cloud if local is empty (different device /
  // cleared cache). Without this, the manifest renders the bracket placeholders
  // even though the student filled the form on another browser.
  useEffect(() => {
    if (!user?.id) return;
    let cancelled = false;
    const local = getEx1Local();
    const hasLocal = Object.keys(local).length > 0;
    if (hasLocal) { setEx1Loading(false); return; }
    setEx1Loading(true);
    loadExerciseResponseWithMeta('e-1-s2-1')
      .then((cloud) => {
        if (cancelled) return;
        if (cloud?.response && typeof cloud.response === 'object') {
          const data = cloud.response as Record<string, string>;
          try {
            localStorage.setItem(ex1Key, JSON.stringify(data));
            const ts = cloud.updated_at ? Date.parse(cloud.updated_at) : 0;
            if (ts) localStorage.setItem(`${ex1Key}__saved_at`, String(ts));
          } catch {}
          setEx1(data);
        }
      })
      .finally(() => { if (!cancelled) setEx1Loading(false); });
    return () => { cancelled = true; };
  }, [user?.id, ex1Key]);

  const [firma, setFirma] = useState(() => { try { const s = localStorage.getItem(storageKey); return s ? JSON.parse(s).firma || '' : ''; } catch { return ''; } });
  const [data, setDataVal] = useState(() => { try { const s = localStorage.getItem(storageKey); return s ? JSON.parse(s).data || '' : ''; } catch { return ''; } });
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const printRef = useRef<HTMLDivElement | null>(null);

  const save = (f: string, d: string) => {
    saveExLocal(storageKey, { firma: f, data: d });
    setSavedAt(new Date().toLocaleTimeString('ro-RO', { hour: '2-digit', minute: '2-digit' }));
  };
  const updFirma = (v: string) => { setFirma(v); save(v, data); };
  const updData = (v: string) => { setDataVal(v); save(firma, v); };

  const misiune = ex1['m_final'] || ex1['m_prob'] || '—';
  const viziune = ex1['v_final'] || ex1['v_desc'] || '—';
  const valori = [1,2,3,4,5].map(n => ({ v: ex1[`val_v${n}`], b: ex1[`val_b${n}`] })).filter(x => x.v);

  const handleDownloadPdf = async () => {
    if (!printRef.current) return;
    try {
      setGenerating(true);
      const [{ default: jsPDF }, html2canvasMod] = await Promise.all([
        import('jspdf'),
        import('html2canvas-pro'),
      ]);
      const html2canvas = html2canvasMod.default;

      // Render the hidden A4 sheet to canvas
      const node = printRef.current;
      const canvas = await html2canvas(node, {
        scale: 2,
        backgroundColor: '#FDFAF6',
        useCORS: true,
        logging: false,
      });

      const imgData = canvas.toDataURL('image/jpeg', 0.95);
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      pdf.addImage(imgData, 'JPEG', 0, 0, pageWidth, pageHeight, undefined, 'FAST');
      const filename = `manifestul-fundatiei${firma ? '-' + firma.replace(/[^a-z0-9]+/gi, '-').toLowerCase() : ''}.pdf`;
      pdf.save(filename);
    } catch (e) {
      console.error('PDF generation failed', e);
      alert('Nu am putut genera PDF-ul. Încearcă din nou.');
    } finally {
      setGenerating(false);
    }
  };

  // ─── AA-branded A4 sheet (used both for on-screen preview and PDF capture) ──
  const ManifestSheet: React.FC<{ forPrint?: boolean }> = ({ forPrint = false }) => (
    <div style={{
      width: forPrint ? '794px' : '100%',       // 210mm @ 96dpi for capture
      minHeight: forPrint ? '1123px' : undefined, // 297mm @ 96dpi
      background: '#FDFAF6',
      color: '#1C1410',
      fontFamily: "'Arimo', system-ui, sans-serif",
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      borderRadius: forPrint ? 0 : 14,
      border: forPrint ? 'none' : '1px solid rgba(201,169,110,0.18)',
      boxShadow: forPrint ? 'none' : '0 4px 32px rgba(0,0,0,0.18)',
    }}>
      {/* Top dark header band */}
      <div style={{ background: '#1C1410', padding: '14px 28px', display: 'flex', alignItems: 'center', gap: 14 }}>
        <svg height={32} viewBox="0 0 303 240" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
          <path d="M93.6414 229.092L194.246 4.82955L214.537 5.94268L290.006 239.864L266.115 238.554L231.422 128.981L157.13 124.906L117.532 230.403L93.6414 229.092ZM195.603 21.9735L159.852 117.177L228.907 120.965L197.567 22.0812L195.603 21.9735Z" fill="#C9A96E"/>
          <path d="M208.932 229.092L108.328 4.82955L88.037 5.94268L12.5678 239.864L36.4588 238.554L71.152 128.981L145.443 124.906L185.041 230.403L208.932 229.092ZM106.971 21.9735L142.721 117.177L73.6666 120.965L105.007 22.0812L106.971 21.9735Z" fill="rgba(201,169,110,0.45)"/>
        </svg>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontFamily: "'Aboreto', serif", fontSize: 11, letterSpacing: '0.28em', color: 'rgba(255,255,255,0.85)', textTransform: 'uppercase', marginBottom: 3 }}>Arhitectura Afacerii</div>
          <div style={{ fontFamily: "'Arimo', sans-serif", fontSize: 9, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.1em' }}>Practicum de Sistematizare</div>
        </div>
        <div style={{ fontFamily: "'Arimo', sans-serif", fontSize: 9, color: 'rgba(201,169,110,0.75)', border: '1px solid rgba(201,169,110,0.32)', padding: '4px 11px', borderRadius: 99, letterSpacing: '0.14em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>Document de uz intern</div>
      </div>
      {/* Gold accent line */}
      <div style={{ height: 2, background: 'linear-gradient(90deg, #C9A96E, rgba(201,169,110,0.18) 65%, transparent)' }} />

      {/* Title band */}
      <div style={{ padding: '28px 36px 22px', borderBottom: '1px solid #ddd5c8' }}>
        <div style={{ fontFamily: "'Aboreto', serif", fontSize: 10, letterSpacing: '3px', color: '#a07840', marginBottom: 8, textTransform: 'uppercase' }}>Document de uz intern · Fundație</div>
        <div style={{ fontFamily: "'Aboreto', serif", fontSize: 30, letterSpacing: '0.06em', color: '#1C1410', fontWeight: 400, lineHeight: 1.2 }}>Manifestul Fundației</div>
        <div style={{ fontFamily: "'Arimo', sans-serif", fontSize: 14, color: '#7a6e64', marginTop: 10 }}>Compania — <span style={{ color: '#1C1410', fontWeight: 600, fontStyle: 'normal' }}>{firma || '[ denumirea companiei ]'}</span></div>
      </div>

      {/* Body */}
      <div style={{ padding: '26px 36px 20px', flex: 1 }}>
        {/* Misiune */}
        <div style={{ marginBottom: 22 }}>
          <div style={{ fontFamily: "'Aboreto', serif", fontSize: 11, letterSpacing: '2.5px', textTransform: 'uppercase', color: '#1A5C38', padding: '6px 10px', background: 'rgba(26,92,56,0.06)', borderLeft: '3px solid #1A5C38', marginBottom: 10 }}>MISIUNEA · De ce existăm</div>
          <div style={{ fontSize: 13.5, lineHeight: 1.75, color: '#1C1410', whiteSpace: 'pre-wrap', wordBreak: 'break-word', paddingLeft: 13 }}>{misiune}</div>
        </div>

        {/* Viziune */}
        <div style={{ marginBottom: 22 }}>
          <div style={{ fontFamily: "'Aboreto', serif", fontSize: 11, letterSpacing: '2.5px', textTransform: 'uppercase', color: '#8B1A1A', padding: '6px 10px', background: 'rgba(139,26,26,0.05)', borderLeft: '3px solid #8B1A1A', marginBottom: 10 }}>VIZIUNEA · Unde suntem în 3 ani</div>
          <div style={{ fontSize: 13.5, lineHeight: 1.75, color: '#1C1410', whiteSpace: 'pre-wrap', wordBreak: 'break-word', paddingLeft: 13 }}>{viziune}</div>
        </div>

        {/* Valori */}
        <div>
          <div style={{ fontFamily: "'Aboreto', serif", fontSize: 11, letterSpacing: '2.5px', textTransform: 'uppercase', color: '#a07840', padding: '6px 10px', background: 'rgba(201,169,110,0.10)', borderLeft: '3px solid #C9A96E', marginBottom: 12 }}>VALORILE · Regulile după care funcționăm</div>
          <div style={{ paddingLeft: 13 }}>
            {valori.length > 0 ? valori.map((val, i) => (
              <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', marginBottom: 10 }}>
                <span style={{ fontFamily: "'Aboreto', serif", fontSize: 14, fontWeight: 400, color: '#C9A96E', minWidth: 22 }}>{String(i + 1).padStart(2, '0')}</span>
                <div style={{ flex: 1 }}>
                  <span style={{ fontSize: 13.5, fontWeight: 700, color: '#1C1410' }}>{val.v}</span>
                  {val.b && <span style={{ fontSize: 12.5, color: '#7a6e64', display: 'block', marginTop: 2, fontStyle: 'italic' }}>{val.b}</span>}
                </div>
              </div>
            )) : (
              [1,2,3,4,5].map(n => (
                <div key={n} style={{ display: 'flex', gap: 12, marginBottom: 10 }}>
                  <span style={{ fontFamily: "'Aboreto', serif", fontSize: 14, fontWeight: 400, color: '#ddd5c8', minWidth: 22 }}>{String(n).padStart(2, '0')}</span>
                  <span style={{ fontSize: 12.5, color: '#bbb1a3' }}>[ valoarea {n} ] — [ comportamentul asociat ]</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Signature area */}
      <div style={{ padding: '14px 36px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderTop: '1px dashed #ddd5c8' }}>
        <div style={{ fontSize: 11, color: '#7a6e64' }}>Data: <span style={{ color: '#1C1410', fontWeight: 600 }}>{data || '___________'}</span></div>
        <div style={{ fontSize: 11, color: '#7a6e64' }}>Semnat: <span style={{ display: 'inline-block', borderBottom: '1px solid #1C1410', minWidth: 170, marginLeft: 8 }}>&nbsp;</span></div>
      </div>

      {/* Gold separator + dark footer */}
      <div style={{ height: 1, background: 'linear-gradient(90deg, transparent, #C9A96E 25%, rgba(201,169,110,0.2) 75%, transparent)' }} />
      <div style={{ background: '#1C1410', padding: '10px 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ fontFamily: "'Aboreto', serif", fontSize: 9, letterSpacing: '0.22em', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase' }}>AA · Arhitectura Afacerii</div>
        <div style={{ fontFamily: "'Arimo', sans-serif", fontSize: 8, color: 'rgba(255,255,255,0.28)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Document de uz intern</div>
      </div>
    </div>
  );

  return (
    <div>
      <p style={{ fontSize: 13, color: 'var(--fg-3)', lineHeight: 1.7, marginBottom: 20 }}>
        Manifestul de mai jos se populează automat din răspunsurile tale din Exercițiul 1. Adaugă numele firmei și data, apoi descarcă PDF-ul.
      </p>

      {(!ex1['m_final'] && !ex1['m_prob']) && (
        <div style={{ padding: '14px 18px', background: 'rgba(201,169,110,0.07)', border: '1px solid rgba(201,169,110,0.2)', borderRadius: 12, marginBottom: 20, fontSize: 13, color: 'var(--gold)' }}>
          ⚠ Completează mai întâi Exercițiul 1 (Misiunea Viziunea Valorile) pentru ca Manifestul să se populeze automat.
        </div>
      )}

      {/* Câmpuri suplimentare */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
        <div>
          <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--fg-3)', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 6 }}>Numele firmei</label>
          <input type="text" value={firma} onChange={e => updFirma(e.target.value)} placeholder="Ex: Morar Consulting SRL"
            style={{ width: '100%', padding: '9px 12px', fontSize: 13, background: 'var(--bg-3)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--fg)', boxSizing: 'border-box' as const }}
            onFocus={e => (e.target.style.borderColor = 'rgba(201,169,110,0.45)')}
            onBlur={e => (e.target.style.borderColor = 'var(--border)')} />
        </div>
        <div>
          <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--fg-3)', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 6 }}>Data</label>
          <input type="text" value={data} onChange={e => updData(e.target.value)} placeholder="Ex: 26.05.2026"
            style={{ width: '100%', padding: '9px 12px', fontSize: 13, background: 'var(--bg-3)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--fg)', boxSizing: 'border-box' as const }}
            onFocus={e => (e.target.style.borderColor = 'rgba(201,169,110,0.45)')}
            onBlur={e => (e.target.style.borderColor = 'var(--border)')} />
        </div>
      </div>

      {/* On-screen preview (responsive) */}
      <ManifestSheet />

      {/* Hidden A4-sized sheet used exclusively for PDF capture */}
      <div aria-hidden style={{ position: 'fixed', left: '-10000px', top: 0, pointerEvents: 'none', opacity: 0 }}>
        <div ref={printRef}>
          <ManifestSheet forPrint />
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
        <button onClick={handleDownloadPdf} disabled={generating}
          style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '12px 20px', background: 'var(--accent)', color: '#0D0907', border: 'none', borderRadius: 10, cursor: generating ? 'wait' : 'pointer', fontSize: 13, fontWeight: 700, opacity: generating ? 0.7 : 1, transition: 'filter 0.15s' }}
          onMouseEnter={e => { if (!generating) e.currentTarget.style.filter = 'brightness(1.1)'; }}
          onMouseLeave={e => (e.currentTarget.style.filter = '')}>
          {generating ? <Loader2 size={15} style={{ animation: 'spin 0.8s linear infinite' }} /> : <Download size={15} />}
          {generating ? 'Se generează PDF…' : 'Descarcă Manifestul (PDF)'}
        </button>
      </div>

      <div style={{ marginTop: 16, padding: '12px 16px', background: 'rgba(196,240,228,0.04)', border: '1px solid rgba(196,240,228,0.12)', borderRadius: 10, fontSize: 12, color: 'var(--fg-3)', lineHeight: 1.7 }}>
        <strong style={{ color: 'var(--fg-2)' }}>Ce faci după:</strong>
        <div>→ Tipărește-l și pune-l pe peretele biroului tău — vizibil zilnic</div>
        <div>→ Trimite-l echipei tale — fiecare angajat să aibă o copie</div>
        <div>→ Predă documentul complet în platformă înainte de sesiunea live</div>
      </div>

      {savedAt && <p style={{ fontSize: 11, color: 'var(--accent)', textAlign: 'right', marginTop: 8 }}>Salvat ✓ {savedAt}</p>}
    </div>
  );
};

// ─── Quiz MCQ (multiple-choice with correct answers) ─────────────────────────
const QuizMCQExercise: React.FC<{ template: ExerciseTemplate; storageKey: string }> = ({ template, storageKey }) => {
  const situations = template.situations || [];
  const tiers = template.scoringTiers || [];
  const [answers, setAnswers] = useState<Record<string, number>>(() => {
    try { const s = localStorage.getItem(storageKey); return s ? JSON.parse(s) : {}; } catch { return {}; }
  });
  const [idx, setIdx] = useState(0);
  const [reviewing, setReviewing] = useState(false);

  const total = situations.length;
  const answeredCount = Object.keys(answers).length;
  const allDone = answeredCount === total;

  const choose = (sid: string, optIdx: number) => {
    const next = { ...answers, [sid]: optIdx };
    setAnswers(next);
    saveExLocal(storageKey, next);
    setTimeout(() => {
      if (idx < total - 1) setIdx(i => i + 1);
      else setReviewing(true);
    }, 350);
  };

  const score = situations.reduce((sum, s) => {
    const a = answers[s.id];
    return a !== undefined && s.options[a]?.correct ? sum + 1 : sum;
  }, 0);

  const reset = () => {
    setAnswers({});
    localStorage.removeItem(storageKey);
    setIdx(0);
    setReviewing(false);
  };

  if (reviewing || allDone) {
    const tier = tiers.find(t => score >= t.min && score <= t.max);
    const toneColor = tier?.tone === 'good' ? '#4ade80' : tier?.tone === 'ok' ? '#fbbf24' : '#f87171';
    return (
      <div>
        <p style={{ fontSize: 13, color: 'var(--fg-3)', marginBottom: 16, lineHeight: 1.7 }}>{template.instructions}</p>
        <div style={{ textAlign: 'center', padding: '20px 16px', background: 'var(--bg-3)', borderRadius: 12, marginBottom: 18, border: '1px solid var(--border)' }}>
          <div style={{ fontSize: 48, fontWeight: 700, color: toneColor, lineHeight: 1, marginBottom: 6 }}>{score}<span style={{ fontSize: 22, color: 'var(--fg-3)' }}>/{total}</span></div>
          {tier && <p style={{ fontSize: 13, color: 'var(--fg-2)', margin: 0 }}>{tier.label}</p>}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 16 }}>
          {situations.map((s, i) => {
            const a = answers[s.id];
            const chosen = a !== undefined ? s.options[a] : null;
            const correctIdx = s.options.findIndex(o => o.correct);
            const isOK = chosen?.correct;
            return (
              <div key={s.id} style={{
                padding: 14, borderRadius: 10,
                background: isOK ? 'rgba(74,222,128,0.06)' : 'rgba(248,113,113,0.05)',
                border: `1px solid ${isOK ? 'rgba(74,222,128,0.2)' : 'rgba(248,113,113,0.18)'}`,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <span style={{ fontSize: 10, fontWeight: 700, color: isOK ? '#4ade80' : '#f87171', letterSpacing: '0.08em' }}>
                    {i + 1}. {isOK ? 'CORECT' : 'GREȘIT'}
                  </span>
                </div>
                <p style={{ fontSize: 12, color: 'var(--fg-2)', margin: '0 0 10px', lineHeight: 1.6 }}>{s.text}</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  {s.options.map((opt, oi) => {
                    const isChosen = oi === a;
                    const isCorrect = opt.correct;
                    return (
                      <div key={oi} style={{
                        fontSize: 12, padding: '6px 10px', borderRadius: 6,
                        color: isCorrect ? '#4ade80' : isChosen ? '#f87171' : 'var(--fg-3)',
                        background: isCorrect ? 'rgba(74,222,128,0.08)' : isChosen ? 'rgba(248,113,113,0.06)' : 'transparent',
                        fontWeight: isCorrect || isChosen ? 500 : 400,
                      }}>
                        {isCorrect ? '✓ ' : isChosen ? '✗ ' : '○ '}{opt.label}
                      </div>
                    );
                  })}
                </div>
                {chosen?.explanation && (
                  <div style={{ marginTop: 8, fontSize: 11, color: 'var(--fg-3)', fontStyle: 'italic', lineHeight: 1.6 }}>
                    {chosen.explanation}
                  </div>
                )}
                {!isOK && s.options[correctIdx]?.explanation && (
                  <div style={{ marginTop: 4, fontSize: 11, color: '#4ade80', lineHeight: 1.6 }}>
                    Răspuns corect: {s.options[correctIdx].explanation}
                  </div>
                )}
              </div>
            );
          })}
        </div>
        <button onClick={reset} style={{
          padding: '8px 16px', background: 'var(--accent-dim)', border: '1px solid rgba(196,240,228,0.2)',
          borderRadius: 8, cursor: 'pointer', fontSize: 12, color: 'var(--accent)', fontWeight: 600,
        }}>Reia quiz-ul</button>
      </div>
    );
  }

  const q = situations[idx];
  return (
    <div>
      <p style={{ fontSize: 13, color: 'var(--fg-3)', marginBottom: 16, lineHeight: 1.7 }}>{template.instructions}</p>
      <div style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--fg-3)', marginBottom: 6 }}>
          <span>Situația {idx + 1} din {total}</span>
          <span>{answeredCount} răspunsuri salvate</span>
        </div>
        <div style={{ height: 3, background: 'var(--border)', borderRadius: 2, overflow: 'hidden' }}>
          <motion.div animate={{ width: `${((idx + 1) / total) * 100}%` }} transition={{ duration: 0.4 }}
            style={{ height: '100%', background: 'var(--accent)', borderRadius: 2 }} />
        </div>
      </div>
      <AnimatePresence mode="wait">
        <motion.div key={q.id}
          initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}>
          {q.title && <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--gold)', letterSpacing: '0.08em', marginBottom: 8, textTransform: 'uppercase' }}>{q.title}</div>}
          <p style={{ fontSize: 14, fontWeight: 500, color: 'var(--fg)', marginBottom: 16, lineHeight: 1.6 }}>{q.text}</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {q.options.map((opt, oi) => (
              <motion.button key={oi}
                whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
                onClick={() => choose(q.id, oi)}
                style={{
                  textAlign: 'left', padding: '12px 14px', background: 'var(--bg-3)',
                  border: '1px solid var(--border)', borderRadius: 10, cursor: 'pointer',
                  color: 'var(--fg)', fontSize: 13, lineHeight: 1.5, transition: 'all 0.15s',
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(196,240,228,0.35)'; e.currentTarget.style.background = 'rgba(196,240,228,0.04)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = 'var(--bg-3)'; }}>
                <span style={{ color: 'var(--fg-3)', marginRight: 8, fontSize: 11, fontWeight: 600 }}>{String.fromCharCode(65 + oi)}.</span>
                {opt.label}
              </motion.button>
            ))}
          </div>
        </motion.div>
      </AnimatePresence>
      {idx > 0 && (
        <button onClick={() => setIdx(i => Math.max(0, i - 1))} style={{
          marginTop: 16, padding: '6px 12px', background: 'transparent', border: '1px solid var(--border)',
          borderRadius: 6, cursor: 'pointer', fontSize: 11, color: 'var(--fg-3)',
        }}>← Înapoi</button>
      )}
    </div>
  );
};

// ─── Function-Roles (Ex.1) ────────────────────────────────────────────────────
const FunctionRolesExercise: React.FC<{ template: ExerciseTemplate; storageKey: string }> = ({ template, storageKey }) => {
  type RoleRow = { rol: string; persoana: string; ceFace: string; produs: string };
  type FunctionData = { produs: string; flux: string; rows: RoleRow[] };
  type State = { fnId: string; byFunction: Record<string, FunctionData> };
  const emptyFunctionData = (): FunctionData => ({ produs: '', flux: '', rows: [{ rol: '', persoana: '', ceFace: '', produs: '' }] });
  const initial: State = { fnId: '', byFunction: {} };
  const [state, setState] = useState<State>(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (!saved) return initial;
      const parsed = JSON.parse(saved);
      if (parsed.byFunction) return { ...initial, ...parsed };
      if (parsed.fnId) {
        return {
          fnId: parsed.fnId,
          byFunction: {
            [parsed.fnId]: {
              produs: parsed.produs || '',
              flux: parsed.flux || '',
              rows: Array.isArray(parsed.rows) && parsed.rows.length ? parsed.rows : emptyFunctionData().rows,
            },
          },
        };
      }
      return initial;
    } catch { return initial; }
  });
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [showExample, setShowExample] = useState(false);

  const save = (s: State) => {
    if (timer.current) clearTimeout(timer.current);
    saveExLocal(storageKey, s);
    setSavedAt(new Date().toLocaleTimeString('ro-RO', { hour: '2-digit', minute: '2-digit' }));
  };
  const updateState = (updater: (current: State) => State) => {
    setState(current => {
      const next = updater(current);
      save(next);
      return next;
    });
  };
  const functionData = state.fnId ? (state.byFunction[state.fnId] || emptyFunctionData()) : emptyFunctionData();
  const selectFunction = (fnId: string) => {
    updateState(current => ({
      ...current,
      fnId,
      byFunction: fnId && !current.byFunction[fnId]
        ? { ...current.byFunction, [fnId]: emptyFunctionData() }
        : current.byFunction,
    }));
  };
  const setFunctionData = (patch: Partial<FunctionData>) => {
    if (!state.fnId) return;
    updateState(current => {
      const currentData = current.byFunction[current.fnId] || emptyFunctionData();
      return {
        ...current,
        byFunction: { ...current.byFunction, [current.fnId]: { ...currentData, ...patch } },
      };
    });
  };
  const updateRow = (i: number, k: keyof RoleRow, v: string) => {
    if (!state.fnId) return;
    updateState(current => {
      const currentData = current.byFunction[current.fnId] || emptyFunctionData();
      const rows = currentData.rows.map((r, ri) => ri === i ? { ...r, [k]: v } : r);
      return {
        ...current,
        byFunction: { ...current.byFunction, [current.fnId]: { ...currentData, rows } },
      };
    });
  };
  const addRow = () => {
    if (!state.fnId) return;
    updateState(current => {
      const currentData = current.byFunction[current.fnId] || emptyFunctionData();
      return {
        ...current,
        byFunction: {
          ...current.byFunction,
          [current.fnId]: { ...currentData, rows: [...currentData.rows, { rol: '', persoana: '', ceFace: '', produs: '' }] },
        },
      };
    });
  };
  const removeRow = (i: number) => {
    if (!state.fnId) return;
    updateState(current => {
      const currentData = current.byFunction[current.fnId] || emptyFunctionData();
      const rows = currentData.rows.filter((_, ri) => ri !== i);
      return {
        ...current,
        byFunction: { ...current.byFunction, [current.fnId]: { ...currentData, rows: rows.length ? rows : emptyFunctionData().rows } },
      };
    });
  };

  const selectedFn = template.functionOptions?.find(o => o.value === state.fnId);

  const cellStyle: React.CSSProperties = {
    width: '100%', padding: '6px 8px', fontSize: 12, background: 'var(--bg-3)',
    border: '1px solid var(--border)', borderRadius: 6, color: 'var(--fg)', boxSizing: 'border-box',
  };

  return (
    <div>
      <p style={{ fontSize: 13, color: 'var(--fg-3)', marginBottom: 14, lineHeight: 1.7 }}>{template.instructions}</p>

      {/* Diferența funcție vs rol */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
        <div style={{ padding: 12, background: 'rgba(74,222,128,0.05)', border: '1px solid rgba(74,222,128,0.18)', borderRadius: 10 }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: '#4ade80', letterSpacing: '0.08em', marginBottom: 6 }}>FUNCȚIA</div>
          <ul style={{ margin: 0, paddingLeft: 16, fontSize: 11, color: 'var(--fg-2)', lineHeight: 1.7 }}>
            <li>Există în organigramă</li>
            <li>Nu dispare când pleacă omul</li>
            <li>Una din cele 7</li>
            <li>Are un produs final al funcției</li>
          </ul>
        </div>
        <div style={{ padding: 12, background: 'rgba(201,169,110,0.06)', border: '1px solid rgba(201,169,110,0.2)', borderRadius: 10 }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--gold)', letterSpacing: '0.08em', marginBottom: 6 }}>ROLUL</div>
          <ul style={{ margin: 0, paddingLeft: 16, fontSize: 11, color: 'var(--fg-2)', lineHeight: 1.7 }}>
            <li>Titlul persoanei care lucrează</li>
            <li>Se schimbă când vine un om nou</li>
            <li>Director, Manager, Specialist</li>
            <li>Are un produs al rolului său</li>
          </ul>
        </div>
      </div>

      {/* Exemplu expandable */}
      <button onClick={() => setShowExample(s => !s)} style={{
        width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '10px 14px', background: 'var(--bg-3)', border: '1px solid var(--border)',
        borderRadius: 8, cursor: 'pointer', fontSize: 12, color: 'var(--fg-2)', marginBottom: 14,
      }}>
        <span>📖 Exemplu — Funcția 2: Marketing și Vânzări</span>
        {showExample ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
      </button>
      <AnimatePresence>
        {showExample && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
            style={{ overflow: 'hidden', marginBottom: 14 }}>
            <div style={{ padding: 12, background: 'var(--bg-3)', borderRadius: 8, fontSize: 11, color: 'var(--fg-2)', lineHeight: 1.7 }}>
              <div style={{ marginBottom: 8 }}><strong>Produsul FUNCȚIEI:</strong> Clienți noi plătitori și venituri lunare conform targetului.</div>
              <div><strong>Manager Marketing</strong> · Ana → 200 lead-uri/lună</div>
              <div><strong>Agent Vânzări</strong> · Ion → 15 contracte semnate/lună</div>
              <div><strong>SMM Manager</strong> · Maria → engagement 4%+, 500 followeri/lună</div>
              <div style={{ marginTop: 8, fontStyle: 'italic', color: 'var(--fg-3)' }}>
                Cum se obține: Ana aduce 200 leaduri → Ion închide 15 → Maria menține audiența caldă. Împreună = clienți noi și venituri.
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Selector funcție */}
      <div style={{ marginBottom: 12 }}>
        <label style={{ fontSize: 12, fontWeight: 500, color: 'var(--fg)', display: 'block', marginBottom: 6 }}>
          Funcția aleasă (1–7)
        </label>
        <select value={state.fnId} onChange={e => selectFunction(e.target.value)} style={{
          width: '100%', padding: '10px 12px', fontSize: 13, background: 'var(--bg-3)',
          border: '1px solid var(--border)', borderRadius: 8, color: 'var(--fg)',
        }}>
          <option value="">— Alege o funcție —</option>
          {template.functionOptions?.map(o => (<option key={o.value} value={o.value}>{o.label}</option>))}
        </select>
      </div>

      {selectedFn && (
        <>
          <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 12, fontWeight: 500, color: 'var(--fg)', display: 'block', marginBottom: 6 }}>
              Produsul FUNCȚIEI
            </label>
            <textarea value={functionData.produs} onChange={e => setFunctionData({ produs: e.target.value })} rows={2}
              placeholder={selectedFn.sampleProduct}
              style={{ width: '100%', padding: '10px 12px', fontSize: 13, lineHeight: 1.6,
                background: 'var(--bg-3)', border: '1px solid var(--border)', borderRadius: 8,
                color: 'var(--fg)', resize: 'vertical', boxSizing: 'border-box' }} />
          </div>

          <div style={{ marginBottom: 10 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--fg)', marginBottom: 8 }}>Rolurile care produc bucățica lor</div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                <thead>
                  <tr>
                    {['ROLUL', 'PERSOANA', 'CE FACE', 'PRODUSUL ROLULUI'].map(h => (
                      <th key={h} style={{ padding: '8px 6px', textAlign: 'left', fontSize: 10, fontWeight: 600,
                        letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--fg-3)',
                        borderBottom: '1px solid var(--border)' }}>{h}</th>
                    ))}
                    <th style={{ width: 32 }} />
                  </tr>
                </thead>
                <tbody>
                  {functionData.rows.map((row, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '6px 4px' }}><input type="text" value={row.rol} onChange={e => updateRow(i, 'rol', e.target.value)} placeholder="ex: Agent vânzări" style={cellStyle} /></td>
                      <td style={{ padding: '6px 4px' }}><input type="text" value={row.persoana} onChange={e => updateRow(i, 'persoana', e.target.value)} placeholder="ex: Ion Marin" style={cellStyle} /></td>
                      <td style={{ padding: '6px 4px' }}><input type="text" value={row.ceFace} onChange={e => updateRow(i, 'ceFace', e.target.value)} placeholder="ce face concret" style={cellStyle} /></td>
                      <td style={{ padding: '6px 4px' }}><input type="text" value={row.produs} onChange={e => updateRow(i, 'produs', e.target.value)} placeholder="bucățica măsurabilă" style={cellStyle} /></td>
                      <td style={{ padding: '6px 4px', textAlign: 'center' }}>
                        <button onClick={() => removeRow(i)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--fg-3)', padding: 4 }}>
                          <Trash2 size={12} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <button onClick={addRow} style={{
              marginTop: 8, display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px',
              background: 'var(--accent-dim)', border: '1px solid rgba(196,240,228,0.2)',
              borderRadius: 8, cursor: 'pointer', fontSize: 12, color: 'var(--accent)', fontWeight: 600,
            }}><Plus size={13} /> Adaugă rol</button>
          </div>

          <div style={{ marginBottom: 10 }}>
            <label style={{ fontSize: 12, fontWeight: 500, color: 'var(--fg)', display: 'block', marginBottom: 6 }}>
              Cum se obține produsul funcției (sinteza fluxului)
            </label>
            <textarea value={functionData.flux} onChange={e => setFunctionData({ flux: e.target.value })} rows={2}
              placeholder="Ana face X → Ion face Y → împreună produc Z"
              style={{ width: '100%', padding: '10px 12px', fontSize: 13, lineHeight: 1.6,
                background: 'var(--bg-3)', border: '1px solid var(--border)', borderRadius: 8,
                color: 'var(--fg)', resize: 'vertical', boxSizing: 'border-box' }} />
          </div>

          <div style={{ padding: '10px 14px', background: 'rgba(251,191,36,0.06)', border: '1px solid rgba(251,191,36,0.2)',
            borderRadius: 8, fontSize: 11, color: 'var(--fg-2)', lineHeight: 1.6 }}>
            ⚠ Șoferul, curățătoarea, agentul de pază — toți au un rol și un produs. Întreabă-te: ce se blochează dacă acest om lipsește 2 săptămâni?
          </div>
        </>
      )}

      {savedAt && (<div style={{ marginTop: 12, fontSize: 11, color: 'var(--accent)', textAlign: 'right' }}>Salvat automat ✓ {savedAt}</div>)}
    </div>
  );
};

// ─── Miro Organigramă (Ex.3) ──────────────────────────────────────────────────
const MiroOrgExercise: React.FC<{ template: ExerciseTemplate; storageKey: string }> = ({ template, storageKey }) => {
  type State = { miroUrl: string; rosii: string; primaPozitie: string; schimbare: string };
  const initial: State = { miroUrl: '', rosii: '', primaPozitie: '', schimbare: '' };
  const [state, setState] = useState<State>(() => {
    try { const s = localStorage.getItem(storageKey); return s ? { ...initial, ...JSON.parse(s) } : initial; } catch { return initial; }
  });
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const set = (patch: Partial<State>) => {
    const n = { ...state, ...patch }; setState(n);
    if (timer.current) clearTimeout(timer.current);
    saveExLocal(storageKey, n);
    setSavedAt(new Date().toLocaleTimeString('ro-RO', { hour: '2-digit', minute: '2-digit' }));
  };

  const textStyle: React.CSSProperties = {
    width: '100%', padding: '10px 12px', fontSize: 13, lineHeight: 1.6,
    background: 'var(--bg-3)', border: '1px solid var(--border)', borderRadius: 8,
    color: 'var(--fg)', resize: 'vertical', boxSizing: 'border-box',
  };

  return (
    <div>
      <p style={{ fontSize: 13, color: 'var(--fg-3)', marginBottom: 14, lineHeight: 1.7 }}>{template.instructions}</p>

      {/* CTA Miro */}
      {template.miroTemplateUrl && (
        <a href={template.miroTemplateUrl} target="_blank" rel="noopener noreferrer" style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
          padding: '14px 16px', background: 'linear-gradient(135deg, rgba(255,210,49,0.12), rgba(255,210,49,0.04))',
          border: '1px solid rgba(255,210,49,0.3)', borderRadius: 12, textDecoration: 'none',
          color: 'var(--fg)', marginBottom: 16, transition: 'all 0.15s',
        }} onMouseEnter={e => { e.currentTarget.style.background = 'linear-gradient(135deg, rgba(255,210,49,0.18), rgba(255,210,49,0.08))'; }}
           onMouseLeave={e => { e.currentTarget.style.background = 'linear-gradient(135deg, rgba(255,210,49,0.12), rgba(255,210,49,0.04))'; }}>
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, color: '#FFD231', letterSpacing: '0.1em', marginBottom: 4 }}>TEMPLATE MIRO</div>
            <div style={{ fontSize: 14, fontWeight: 600 }}>Deschide template-ul organigramei</div>
            <div style={{ fontSize: 11, color: 'var(--fg-3)', marginTop: 2 }}>Copiază board-ul în contul tău și începe să desenezi</div>
          </div>
          <ChevronRight size={18} style={{ color: '#FFD231', flexShrink: 0 }} />
        </a>
      )}

      {/* Cod de culori */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--fg)', marginBottom: 8 }}>Codul de culori obligatoriu</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {template.colorLegend?.map((c, i) => (
            <div key={i} style={{
              display: 'grid', gridTemplateColumns: '14px 1fr 2fr', gap: 10, alignItems: 'center',
              padding: '8px 10px', background: 'var(--bg-3)', borderRadius: 8, border: '1px solid var(--border)',
            }}>
              <div style={{ width: 14, height: 14, borderRadius: 4, background: c.color, border: c.name === 'Gri punctat' ? '1.5px dashed var(--fg-3)' : 'none' }} />
              <div>
                <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--fg)' }}>{c.name}</div>
                <div style={{ fontSize: 10, color: 'var(--fg-3)' }}>{c.meaning}</div>
              </div>
              <div style={{ fontSize: 11, color: 'var(--fg-2)' }}>{c.action}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Anatomie bloc */}
      <div style={{ padding: 12, background: 'rgba(196,240,228,0.05)', border: '1px solid rgba(196,240,228,0.15)',
        borderRadius: 8, fontSize: 11, color: 'var(--fg-2)', lineHeight: 1.7, marginBottom: 16 }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--accent)', letterSpacing: '0.08em', marginBottom: 6 }}>ANATOMIE BLOC</div>
        FUNCȚIA: Marketing și Vânzări<br />
        Rolul: Agent Vânzări<br />
        Persoana: Maria Popescu<br />
        Produs final: 10 contracte noi semnate / lună
      </div>

      {/* Input link */}
      <div style={{ marginBottom: 14 }}>
        <label style={{ fontSize: 12, fontWeight: 500, color: 'var(--fg)', display: 'block', marginBottom: 6 }}>
          Link-ul board-ului tău Miro (după ce ai copiat template-ul)
        </label>
        <input type="url" value={state.miroUrl} onChange={e => set({ miroUrl: e.target.value })}
          placeholder="https://miro.com/app/board/..."
          style={{ ...textStyle, padding: '9px 12px' }} />
      </div>

      {/* 3 întrebări reflexie */}
      <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--fg)', marginBottom: 10 }}>După ce ai construit ambele organigrame</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div>
          <label style={{ fontSize: 12, color: 'var(--fg-2)', display: 'block', marginBottom: 6 }}>
            1. Câte blocuri roșii ai? Ce funcții faci tu și nu ar trebui?
          </label>
          <textarea value={state.rosii} onChange={e => set({ rosii: e.target.value })} rows={2}
            placeholder="Nr: ___   Funcțiile: ..." style={textStyle} />
        </div>
        <div>
          <label style={{ fontSize: 12, color: 'var(--fg-2)', display: 'block', marginBottom: 6 }}>
            2. Care e prima poziție goală pe care o angajezi — și de ce?
          </label>
          <textarea value={state.primaPozitie} onChange={e => set({ primaPozitie: e.target.value })} rows={2}
            placeholder="Funcția: ...   De ce prima: ..." style={textStyle} />
        </div>
        <div>
          <label style={{ fontSize: 12, color: 'var(--fg-2)', display: 'block', marginBottom: 6 }}>
            3. Ce s-a schimbat cel mai mult între organigrama actuală și cea vizată?
          </label>
          <textarea value={state.schimbare} onChange={e => set({ schimbare: e.target.value })} rows={2}
            placeholder="..." style={textStyle} />
        </div>
      </div>

      {savedAt && (<div style={{ marginTop: 12, fontSize: 11, color: 'var(--accent)', textAlign: 'right' }}>Salvat automat ✓ {savedAt}</div>)}
    </div>
  );
};

// ─── Decision Matrix (Ex.5) ───────────────────────────────────────────────────
const DecisionMatrixExercise: React.FC<{ template: ExerciseTemplate; storageKey: string }> = ({ template, storageKey }) => {
  type Role = { role: string; alone: string[]; manager: string[]; ceo: string[] };
  const rolesCount = template.dmRolesCount || 2;
  const initialRoles: Role[] = Array.from({ length: rolesCount }, () => ({ role: '', alone: [''], manager: [''], ceo: [''] }));
  type State = { roles: Role[]; reflection: Record<string, string> };
  const initial: State = { roles: initialRoles, reflection: {} };
  const [state, setState] = useState<State>(() => {
    try { const s = localStorage.getItem(storageKey); return s ? { ...initial, ...JSON.parse(s) } : initial; } catch { return initial; }
  });
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [showExample, setShowExample] = useState(false);

  const save = (s: State) => {
    if (timer.current) clearTimeout(timer.current);
    saveExLocal(storageKey, s);
    setSavedAt(new Date().toLocaleTimeString('ro-RO', { hour: '2-digit', minute: '2-digit' }));
  };

  const updateRole = (idx: number, patch: Partial<Role>) => {
    const roles = state.roles.map((r, i) => i === idx ? { ...r, ...patch } : r);
    const n = { ...state, roles }; setState(n); save(n);
  };
  const updateBullet = (idx: number, col: 'alone' | 'manager' | 'ceo', bIdx: number, val: string) => {
    const bullets = state.roles[idx][col].map((b, i) => i === bIdx ? val : b);
    updateRole(idx, { [col]: bullets } as Partial<Role>);
  };
  const addBullet = (idx: number, col: 'alone' | 'manager' | 'ceo') => {
    updateRole(idx, { [col]: [...state.roles[idx][col], ''] } as Partial<Role>);
  };
  const removeBullet = (idx: number, col: 'alone' | 'manager' | 'ceo', bIdx: number) => {
    const next = state.roles[idx][col].filter((_, i) => i !== bIdx);
    updateRole(idx, { [col]: next.length ? next : [''] } as Partial<Role>);
  };
  const addRole = () => {
    const n = { ...state, roles: [...state.roles, { role: '', alone: [''], manager: [''], ceo: [''] }] };
    setState(n); save(n);
  };
  const removeRole = (idx: number) => {
    if (state.roles.length <= 1) return;
    const n = { ...state, roles: state.roles.filter((_, i) => i !== idx) };
    setState(n); save(n);
  };
  const setReflection = (id: string, val: string) => {
    const n = { ...state, reflection: { ...state.reflection, [id]: val } }; setState(n); save(n);
  };

  const colHeaders: { key: 'alone' | 'manager' | 'ceo'; label: string; color: string }[] = [
    { key: 'alone', label: 'Decide SINGUR', color: '#4ade80' },
    { key: 'manager', label: 'Decide MANAGERUL', color: '#fbbf24' },
    { key: 'ceo', label: 'Decide CEO', color: '#f87171' },
  ];

  return (
    <div>
      <p style={{ fontSize: 13, color: 'var(--fg-3)', marginBottom: 14, lineHeight: 1.7 }}>{template.instructions}</p>

      {/* Exemplu expandable */}
      <button onClick={() => setShowExample(s => !s)} style={{
        width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '10px 14px', background: 'var(--bg-3)', border: '1px solid var(--border)',
        borderRadius: 8, cursor: 'pointer', fontSize: 12, color: 'var(--fg-2)', marginBottom: 14,
      }}>
        <span>📖 Exemplu complet — Agent vânzări, Designer, SMM Manager</span>
        {showExample ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
      </button>
      <AnimatePresence>
        {showExample && template.dmExample && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
            style={{ overflow: 'hidden', marginBottom: 14 }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11 }}>
                <thead>
                  <tr>
                    <th style={{ padding: '8px 6px', textAlign: 'left', fontSize: 10, fontWeight: 600, color: 'var(--fg-3)', borderBottom: '1px solid var(--border)' }}>ROLUL</th>
                    {colHeaders.map(c => (
                      <th key={c.key} style={{ padding: '8px 6px', textAlign: 'left', fontSize: 10, fontWeight: 700, color: c.color, borderBottom: '1px solid var(--border)' }}>{c.label}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {template.dmExample.map((r, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '8px 6px', fontWeight: 600, color: 'var(--fg)', verticalAlign: 'top' }}>{r.role}</td>
                      {colHeaders.map(c => (
                        <td key={c.key} style={{ padding: '8px 6px', verticalAlign: 'top', color: 'var(--fg-2)' }}>
                          {r[c.key].map((b, bi) => (<div key={bi} style={{ marginBottom: 2 }}>• {b}</div>))}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Alert */}
      <div style={{ padding: '10px 14px', background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.25)',
        borderRadius: 8, fontSize: 11, color: 'var(--fg-2)', lineHeight: 1.6, marginBottom: 16 }}>
        ⚠ Dacă o decizie nu e scrisă în matrice — angajatul vine la tine. Fiecare decizie în coloana 1 = o întrebare mai puțin pe zi.
      </div>

      {/* Roluri */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 18 }}>
        {state.roles.map((role, idx) => (
          <div key={idx} style={{ padding: 14, background: 'var(--bg-3)', borderRadius: 12, border: '1px solid var(--border)', position: 'relative' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--gold)', letterSpacing: '0.08em' }}>
                ROLUL #{idx + 1}
              </div>
              {state.roles.length > 1 && (
                <button onClick={() => removeRole(idx)} title="Șterge rolul" style={{
                  display: 'inline-flex', alignItems: 'center', gap: 4, background: 'transparent',
                  border: '1px solid var(--border)', color: 'var(--fg-3)', borderRadius: 6,
                  padding: '4px 8px', cursor: 'pointer', fontSize: 10,
                }}><Trash2 size={11} /> șterge rol</button>
              )}
            </div>
            <input type="text" value={role.role} onChange={e => updateRole(idx, { role: e.target.value })}
              placeholder="ex: Agent vânzări, Designer..."
              style={{ width: '100%', padding: '10px 12px', fontSize: 14, fontWeight: 600,
                background: 'var(--bg-2)', border: '1px solid var(--border)', borderRadius: 8,
                color: 'var(--fg)', marginBottom: 14, boxSizing: 'border-box' }} />

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }}>
              {colHeaders.map(c => (
                <div key={c.key}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: c.color, letterSpacing: '0.08em', marginBottom: 6 }}>{c.label}</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    {role[c.key].map((b, bi) => (
                      <div key={bi} style={{ display: 'flex', gap: 4, alignItems: 'flex-start' }}>
                        <span style={{ color: c.color, fontSize: 12, marginTop: 8 }}>•</span>
                        <input type="text" value={b} onChange={e => updateBullet(idx, c.key, bi, e.target.value)}
                          placeholder="decizie..."
                          style={{ flex: 1, padding: '6px 8px', fontSize: 12, background: 'var(--bg-2)',
                            border: '1px solid var(--border)', borderRadius: 6, color: 'var(--fg)', boxSizing: 'border-box' }} />
                        <button onClick={() => removeBullet(idx, c.key, bi)} style={{
                          background: 'none', border: 'none', cursor: 'pointer', color: 'var(--fg-3)', padding: 4, marginTop: 2,
                        }}><Trash2 size={11} /></button>
                      </div>
                    ))}
                    <button onClick={() => addBullet(idx, c.key)} style={{
                      display: 'flex', alignItems: 'center', gap: 4, padding: '4px 8px',
                      background: 'transparent', border: '1px dashed var(--border)', borderRadius: 6,
                      cursor: 'pointer', fontSize: 10, color: 'var(--fg-3)', marginTop: 2,
                    }}><Plus size={10} /> adaugă</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Adaugă rol */}
      <button onClick={addRole} style={{
        width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
        padding: '12px 14px', background: 'var(--gold-dim)', border: '1px dashed var(--gold)',
        borderRadius: 10, cursor: 'pointer', fontSize: 12, fontWeight: 600,
        color: 'var(--gold)', marginBottom: 18,
      }}><Plus size={13} /> Adaugă încă un rol</button>


      {/* Reflecție */}
      <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--fg)', marginBottom: 10 }}>După implementare</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {template.dmReflection?.map(r => (
          <div key={r.id}>
            <label style={{ fontSize: 12, color: 'var(--fg-2)', display: 'block', marginBottom: 6 }}>{r.label}</label>
            <textarea value={state.reflection[r.id] || ''} onChange={e => setReflection(r.id, e.target.value)}
              placeholder={r.placeholder} rows={2}
              style={{ width: '100%', padding: '10px 12px', fontSize: 13, lineHeight: 1.6,
                background: 'var(--bg-3)', border: '1px solid var(--border)', borderRadius: 8,
                color: 'var(--fg)', resize: 'vertical', boxSizing: 'border-box' }} />
          </div>
        ))}
      </div>

      <div style={{ marginTop: 14, padding: '10px 14px', background: 'rgba(248,113,113,0.06)',
        border: '1px solid rgba(248,113,113,0.2)', borderRadius: 8, fontSize: 11, color: 'var(--fg-2)', lineHeight: 1.6 }}>
        ⚠ <strong>Primul care respectă matricea ești tu.</strong> Dacă un angajat vine cu o decizie din coloana 1 — nu îi dai răspunsul. Îi spui: "După matrice, aceasta e decizia ta. Ce ai decis?"
      </div>

      {savedAt && (<div style={{ marginTop: 12, fontSize: 11, color: 'var(--accent)', textAlign: 'right' }}>Salvat automat ✓ {savedAt}</div>)}
    </div>
  );
};

// ─── Main ExerciseBlock ───────────────────────────────────────────────────────
export const ExerciseBlock: React.FC<ExerciseBlockProps> = ({ exerciseId }) => {
  const { user, loading: authLoading } = useAuthContext();
  const template = getExerciseTemplate(exerciseId);
  // Keyed per user so exercises are never shared between accounts
  const storageKey = `aa_ex_${user?.id ?? 'anon'}_${exerciseId}`;

  // Hydrate from cloud before mounting the exercise. This prevents stale empty
  // local state from masking a saved cloud answer, and pushes newer local drafts
  // back to cloud if the user closed the page before the debounce completed.
  const [hydrated, setHydrated] = useState<boolean>(!user?.id);
  const [syncState, setSyncState] = useState<{ status: 'idle' | 'ok' | 'error'; message?: string }>({ status: 'idle' });
  useEffect(() => {
    if (!user?.id) { setHydrated(true); return; }
    let cancelled = false;
    setHydrated(false);
    const existing = (() => { try { return localStorage.getItem(storageKey); } catch { return null; } })();
    const localSavedAt = (() => {
      try { return Number(localStorage.getItem(`${storageKey}__saved_at`) || '0'); } catch { return 0; }
    })();
    loadExerciseResponseWithMeta(exerciseId)
      .then((cloud) => {
        if (cancelled) return;
        if (cloud?.response != null) {
          const cloudSavedAt = cloud.updated_at ? Date.parse(cloud.updated_at) : 0;
          if (!existing || cloudSavedAt >= localSavedAt) {
            try {
              localStorage.setItem(storageKey, JSON.stringify(cloud.response));
              if (cloudSavedAt) localStorage.setItem(`${storageKey}__saved_at`, String(cloudSavedAt));
            } catch {}
          } else {
            try { pushExerciseResponse(exerciseId, JSON.parse(existing), user.id, 0); } catch {}
          }
        } else if (existing) {
          try { pushExerciseResponse(exerciseId, JSON.parse(existing), user.id, 0); } catch {}
        }
        setHydrated(true);
      })
      .catch(() => { if (!cancelled) setHydrated(true); });
    return () => { cancelled = true; };
  }, [user?.id, exerciseId, storageKey]);

  useEffect(() => {
    return subscribeExerciseSync(exerciseId, (result) => {
      setSyncState(result.ok ? { status: 'ok' } : { status: 'error', message: result.error });
    });
  }, [exerciseId]);

  if (!template) {
    return (
      <div style={{ padding: '16px', fontSize: 13, color: 'var(--fg-3)' }}>
        Exercițiul interactiv va fi disponibil în curând.
      </div>
    );
  }

  // Wait for auth to settle before mounting variants — prevents writes to
  // the "anon" storage key that would be orphaned once the session loads.
  if (authLoading || !user?.id || !hydrated) {
    return (
      <div style={{ padding: '28px 16px', fontSize: 13, color: 'var(--fg-3)', textAlign: 'center' }}>
        Se încarcă răspunsurile salvate…
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
      case 'partnership-diagnostic':
        return <PartnershipDiagnosticExercise storageKey={storageKey} />;
      case 'foundation-manifest':
        return <FoundationManifestExercise storageKey={storageKey} />;
      case 'quality-checklist':
        return <QualityChecklistExercise storageKey={storageKey} />;
      case 'team-feedback-report':
        return <TeamFeedbackReport storageKey={storageKey} />;
      case 'manifest-preview':
        return <ManifestPreview storageKey={storageKey} />;
      case 'quiz-mcq':
        return <QuizMCQExercise template={template} storageKey={storageKey} />;
      case 'function-roles':
        return <FunctionRolesExercise template={template} storageKey={storageKey} />;
      case 'miro-org':
        return <MiroOrgExercise template={template} storageKey={storageKey} />;
      case 'decision-matrix':
        return <DecisionMatrixExercise template={template} storageKey={storageKey} />;
      default:
        return <FormFieldsExercise template={template} storageKey={storageKey} />;
    }
  };

  const typeLabels: Record<string, string> = {
    checklist: 'Checklist',
    'form-fields': 'Formular',
    'dynamic-table': 'Tabel interactiv',
    quiz: 'Chestionar',
    'quiz-mcq': 'Quiz cu scor',
    'text-input': 'Formular',
    'rating-grid': 'Evaluare',
    'function-roles': 'Funcție · Rol · Produs',
    'miro-org': 'Organigramă Miro',
    'decision-matrix': 'Matrice decizională',
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
        <span style={{ fontSize: 12, color: syncState.status === 'error' ? '#f87171' : 'var(--fg-3)', display: 'flex', alignItems: 'center', gap: 4 }}>
          <ChevronRight size={11} /> {syncState.status === 'error'
            ? `Salvat local. Sincronizarea cloud va fi reîncercată${syncState.message ? ` (${syncState.message})` : ''}`
            : syncState.status === 'ok'
              ? 'Salvat automat local + cloud ✓'
              : 'Progresul se salvează automat local + cloud'}
        </span>
      </div>
      {renderContent()}
    </div>
  );
};
