// @ts-nocheck
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Plus, Trash2, ChevronRight, CheckCircle2, RotateCcw } from 'lucide-react';
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
