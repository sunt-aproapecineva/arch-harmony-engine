// @ts-nocheck
import React, { useEffect, useState } from 'react';
import { useServerFn } from '@tanstack/react-start';
import { Trash2, Send } from 'lucide-react';
import {
  listSupervisorNotes,
  addSupervisorNote,
  deleteSupervisorNote,
} from '@/lib/studentInsights.functions';

interface Props { studentId: string; }

const cardStyle: React.CSSProperties = {
  background: 'var(--bg-card)',
  border: '1px solid var(--border)',
  borderRadius: 16,
  padding: 24,
};

export const SupervisorNotesPanel: React.FC<Props> = ({ studentId }) => {
  const [notes, setNotes] = useState<any[]>([]);
  const [draft, setDraft] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmDel, setConfirmDel] = useState<string | null>(null);

  const listFn = useServerFn(listSupervisorNotes);
  const addFn = useServerFn(addSupervisorNote);
  const delFn = useServerFn(deleteSupervisorNote);

  const reload = async () => {
    setLoading(true);
    try {
      const rows = await listFn({ data: { studentId } });
      setNotes(rows || []);
    } catch (e: any) { setError(e?.message || 'Eroare.'); }
    finally { setLoading(false); }
  };

  useEffect(() => { reload(); }, [studentId]);

  const handleAdd = async () => {
    const text = draft.trim();
    if (!text) return;
    setSaving(true); setError(null);
    try {
      const row = await addFn({ data: { studentId, note: text } });
      setNotes(prev => [row, ...prev]);
      setDraft('');
    } catch (e: any) { setError(e?.message || 'Nu am putut salva notița.'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (confirmDel !== id) {
      setConfirmDel(id);
      setTimeout(() => setConfirmDel(c => (c === id ? null : c)), 3000);
      return;
    }
    try {
      await delFn({ data: { noteId: id } });
      setNotes(prev => prev.filter(n => n.id !== id));
      setConfirmDel(null);
    } catch (e: any) { setError(e?.message || 'Nu am putut șterge notița.'); }
  };

  return (
    <div style={cardStyle}>
      <div className="font-aboreto" style={{ fontSize: 10, letterSpacing: '0.12em', color: 'var(--fg-3)', textTransform: 'uppercase', marginBottom: 14 }}>
        Note private supervizor ({notes.length})
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
        <textarea
          value={draft}
          onChange={e => setDraft(e.target.value)}
          placeholder="Notează observațiile tale despre acest elev după apel, sesiune, etc..."
          rows={3}
          style={{ width: '100%', padding: '10px 12px', fontSize: 13, background: 'var(--bg-3)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--fg)', resize: 'vertical', boxSizing: 'border-box', fontFamily: 'inherit', lineHeight: 1.5 }}
        />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
          <span style={{ fontSize: 11, color: 'var(--fg-3)' }}>Vizibil doar pentru administratori.</span>
          <button
            onClick={handleAdd}
            disabled={saving || draft.trim().length === 0}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              fontSize: 12, fontWeight: 700,
              background: 'var(--accent)', color: '#0D0907',
              border: 'none', padding: '8px 16px', borderRadius: 8,
              cursor: (saving || !draft.trim()) ? 'not-allowed' : 'pointer',
              opacity: (saving || !draft.trim()) ? 0.5 : 1,
            }}
          >
            <Send size={12} /> {saving ? 'Se salvează...' : 'Salvează notița'}
          </button>
        </div>
      </div>

      {error && (
        <div style={{ padding: '10px 12px', background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.25)', borderRadius: 8, fontSize: 12, color: '#fca5a5', marginBottom: 12 }}>
          {error}
        </div>
      )}

      {loading ? (
        <p style={{ fontSize: 13, color: 'var(--fg-3)', textAlign: 'center' }}>Se încarcă...</p>
      ) : notes.length === 0 ? (
        <p style={{ fontSize: 13, color: 'var(--fg-3)', textAlign: 'center', padding: '12px 0' }}>Încă nu există notițe pentru acest elev.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {notes.map(n => (
            <div key={n.id} style={{ background: 'var(--bg-3)', border: '1px solid var(--border)', borderRadius: 10, padding: '12px 14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6, gap: 8 }}>
                <span style={{ fontSize: 11, color: 'var(--fg-3)' }}>
                  {n.author_name || 'Supervizor'} · {new Date(n.created_at).toLocaleString('ro-RO', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </span>
                <button
                  onClick={() => handleDelete(n.id)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: confirmDel === n.id ? '#f87171' : 'var(--fg-3)', display: 'flex', alignItems: 'center', gap: 4, fontSize: 11 }}
                  title="Șterge notița"
                >
                  <Trash2 size={12} /> {confirmDel === n.id ? 'Confirmă' : ''}
                </button>
              </div>
              <p style={{ fontSize: 13.5, color: 'var(--fg)', lineHeight: 1.55, whiteSpace: 'pre-wrap', margin: 0 }}>{n.note}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
