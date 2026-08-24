// @ts-nocheck
// GRUPE — unitatea de administrare.
//
// O grupă e o listă de oameni. Nu are orar, nu are canal, nu dă acces prin ea însăși.
// Accesul apare abia când aloci grupa unui FLUX: atunci fiecare membru primește
// înscrierea la trainingul fluxului, cu orarul și fereastra lui de acces.
//
// Aceeași grupă poate fi alocată mai multor fluxuri, inclusiv din traininguri diferite.
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Users, Plus, Trash2, Save, UserPlus, X, Link2, Unlink, Search } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuthContext } from '../../context/AuthContext';
import {
  fetchGroups, fetchGroupMembers, createGroup, renameGroup, deleteGroup,
  addMembers, removeMember, assignGroupToFlow, revokeGroupFromFlow,
} from '../../lib/groups';
import { COURSES } from '../../lib/courses';

export const AdminGroups: React.FC = () => {
  const { user } = useAuthContext();
  const [groups, setGroups] = useState<any[]>([]);
  const [flows, setFlows] = useState<any[]>([]);
  const [people, setPeople] = useState<any[]>([]);
  const [members, setMembers] = useState<Record<string, any[]>>({});
  const [openGroup, setOpenGroup] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [picked, setPicked] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    const [g, f, p] = await Promise.all([
      fetchGroups(),
      supabase.from('flows').select('id,course_id,name,starts_on,ends_on,access_weeks').order('starts_on', { ascending: false }),
      supabase.from('profiles').select('id,full_name,email').order('full_name'),
    ]);
    if (f.error && f.error.code === '42P01') {
      setError('Tabelele de fluxuri și grupe nu există încă — migrația nu e aplicată.');
      setLoading(false);
      return;
    }
    setGroups(g);
    setFlows(f.data || []);
    setPeople(p.data || []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const openMembers = async (groupId: string) => {
    if (openGroup === groupId) { setOpenGroup(null); return; }
    setOpenGroup(groupId);
    setPicked(new Set());
    setSearch('');
    setMembers(prev => ({ ...prev, [groupId]: prev[groupId] || [] }));
    const list = await fetchGroupMembers(groupId);
    setMembers(prev => ({ ...prev, [groupId]: list }));
  };

  const handleCreate = async () => {
    const { error: err } = await createGroup(`Grupă nouă ${groups.length + 1}`, '', user?.id ?? null);
    if (err) { alert(err.message); return; }
    load();
  };

  const handleAdd = async (groupId: string) => {
    if (!picked.size) return;
    setBusy(true);
    const { error: err } = await addMembers(groupId, [...picked], user?.id ?? null);
    if (err) { alert(err.message); setBusy(false); return; }
    // Grupa deja alocată unui flux: membrii noi primesc acces imediat, altfel ar
    // rămâne în grupă fără să vadă nimic.
    const grp = groups.find(x => x.id === groupId);
    for (const a of grp?.assignments || []) {
      await assignGroupToFlow(groupId, a.flow_id, a.tariff);
    }
    setPicked(new Set());
    setBusy(false);
    await load();
    const list = await fetchGroupMembers(groupId);
    setMembers(prev => ({ ...prev, [groupId]: list }));
  };

  const handleRemove = async (groupId: string, userId: string) => {
    await removeMember(groupId, userId);
    const list = await fetchGroupMembers(groupId);
    setMembers(prev => ({ ...prev, [groupId]: list }));
    load();
  };

  const handleAssign = async (groupId: string, flowId: string) => {
    if (!flowId) return;
    setBusy(true);
    const { count, error: err } = await assignGroupToFlow(groupId, flowId);
    setBusy(false);
    if (err) { alert(err.message); return; }
    alert(`Grupa a fost alocată. ${count} înscrieri actualizate.`);
    load();
  };

  const handleRevoke = async (groupId: string, flowId: string) => {
    if (!confirm('Retragi grupa din flux? Se șterg doar accesele venite din grupă, nu și cele date manual.')) return;
    setBusy(true);
    const { count, error: err } = await revokeGroupFromFlow(groupId, flowId);
    setBusy(false);
    if (err) { alert(err.message); return; }
    alert(`${count} accese retrase.`);
    load();
  };

  const flowLabel = (id: string) => {
    const f = flows.find(x => x.id === id);
    if (!f) return id;
    const course = COURSES.find(c => c.id === f.course_id);
    return `${course?.shortTitle || f.course_id} · ${f.name}`;
  };

  return (
    <div style={{ maxWidth: 1050, margin: '0 auto', padding: '28px 24px 60px' }}>
      <div style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
          <Users size={16} style={{ color: 'var(--gold)' }} />
          <h1 className="font-aboreto" style={{ fontSize: 18, color: 'var(--fg)' }}>Grupe</h1>
        </div>
        <p style={{ fontSize: 12.5, color: 'var(--fg-3)', lineHeight: 1.6, maxWidth: 680 }}>
          O grupă e o listă de oameni — nu are orar și nu dă acces prin ea însăși. Accesul apare
          când aloci grupa unui <strong style={{ color: 'var(--fg-2)' }}>flux</strong>: atunci fiecare
          membru primește înscrierea la trainingul fluxului, cu orarul și fereastra lui de acces.
          Aceeași grupă poate merge la mai multe fluxuri.
        </p>
      </div>

      {error && (
        <div style={{ padding: '12px 14px', borderRadius: 10, background: 'var(--error-dim)', border: '1px solid var(--border)', color: 'var(--error)', fontSize: 12.5, marginBottom: 16 }}>
          {error}
        </div>
      )}

      <button onClick={handleCreate} disabled={!!error} style={primaryBtn(!!error)}>
        <Plus size={14} /> Grupă nouă
      </button>

      {loading ? (
        <div style={{ padding: 30, color: 'var(--fg-3)', fontSize: 13 }}>Se încarcă…</div>
      ) : (
        <div style={{ display: 'grid', gap: 12, marginTop: 18 }}>
          {groups.map(g => {
            const isOpen = openGroup === g.id;
            const list = members[g.id] || [];
            const memberIds = new Set(list.map((m: any) => m.user_id));
            const candidates = people
              .filter(p => !memberIds.has(p.id))
              .filter(p => {
                const q = search.trim().toLowerCase();
                if (!q) return true;
                return (p.full_name || '').toLowerCase().includes(q) || (p.email || '').toLowerCase().includes(q);
              })
              .slice(0, 40);

            return (
              <div key={g.id} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 14, padding: 16 }}>
                <div className="aa-stack-sm" style={{ display: 'grid', gridTemplateColumns: 'minmax(160px,1fr) minmax(180px,1.4fr) auto auto', gap: 10, alignItems: 'end' }}>
                  <Field label="Nume grupă" value={g.name} onChange={v => setGroups(p => p.map(x => x.id === g.id ? { ...x, name: v } : x))} />
                  <Field label="Descriere" value={g.description || ''} placeholder="ex. cei care au achitat în ianuarie" onChange={v => setGroups(p => p.map(x => x.id === g.id ? { ...x, description: v } : x))} />
                  <button title="Salvează" onClick={async () => { await renameGroup(g.id, g.name, g.description || ''); load(); }} style={iconBtn('var(--accent)')}><Save size={14} /></button>
                  <button title="Șterge grupa" onClick={async () => {
                    if (!confirm('Ștergi grupa? Accesele deja acordate rămân — retrage-le întâi din fluxuri dacă vrei să dispară.')) return;
                    await deleteGroup(g.id); load();
                  }} style={iconBtn('var(--error)')}><Trash2 size={14} /></button>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 12, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 11.5, color: 'var(--fg-3)', display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                    <Users size={12} /> {g.memberCount} membri
                  </span>
                  <button onClick={() => openMembers(g.id)} style={linkBtn}>
                    {isOpen ? 'Ascunde membrii' : 'Vezi și adaugă membri'}
                  </button>
                </div>

                {/* Alocări la fluxuri */}
                <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid var(--border)' }}>
                  <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--fg-3)', marginBottom: 8 }}>
                    Alocată la fluxuri
                  </div>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                    {(g.assignments || []).map((a: any) => (
                      <span key={a.id} style={{
                        display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 11.5,
                        padding: '4px 10px', borderRadius: 99,
                        background: 'var(--accent-dim)', color: 'var(--accent)', border: '1px solid var(--border)',
                      }}>
                        <Link2 size={11} /> {flowLabel(a.flow_id)}
                        <button onClick={() => handleRevoke(g.id, a.flow_id)} title="Retrage din flux"
                          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--error)', padding: 0, display: 'inline-flex' }}>
                          <Unlink size={11} />
                        </button>
                      </span>
                    ))}
                    <select
                      defaultValue=""
                      disabled={busy}
                      onChange={e => { handleAssign(g.id, e.target.value); e.currentTarget.value = ''; }}
                      style={{ padding: '5px 9px', borderRadius: 8, fontSize: 11.5, background: 'var(--bg-3)', color: 'var(--fg-2)', border: '1px solid var(--border)', cursor: 'pointer' }}
                    >
                      <option value="">+ alocă la flux…</option>
                      {flows
                        .filter(f => !(g.assignments || []).some((a: any) => a.flow_id === f.id))
                        .map(f => <option key={f.id} value={f.id}>{flowLabel(f.id)}</option>)}
                    </select>
                  </div>
                  {(g.assignments || []).length === 0 && (
                    <p style={{ fontSize: 11.5, color: 'var(--fg-3)', margin: '8px 0 0' }}>
                      Grupa n-are acces nicăieri încă. Alocă-o unui flux ca membrii să intre în training.
                    </p>
                  )}
                </div>

                {isOpen && (
                  <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid var(--border)', display: 'grid', gap: 14, gridTemplateColumns: 'repeat(auto-fit, minmax(280px,1fr))' }}>
                    <div>
                      <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--fg-3)', marginBottom: 8 }}>
                        Membri ({list.length})
                      </div>
                      <div style={{ display: 'grid', gap: 4, maxHeight: 260, overflowY: 'auto' }}>
                        {list.map((m: any) => (
                          <div key={m.user_id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, padding: '5px 9px', borderRadius: 7, background: 'var(--bg-3)' }}>
                            <span style={{ fontSize: 12, color: 'var(--fg-2)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {m.full_name || m.email}
                            </span>
                            <button onClick={() => handleRemove(g.id, m.user_id)} title="Scoate din grupă"
                              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--fg-3)', padding: 0, display: 'inline-flex' }}>
                              <X size={13} />
                            </button>
                          </div>
                        ))}
                        {list.length === 0 && <p style={{ fontSize: 12, color: 'var(--fg-3)', margin: 0 }}>Grupa e goală.</p>}
                      </div>
                    </div>

                    <div>
                      <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--fg-3)', marginBottom: 8 }}>
                        Adaugă oameni
                      </div>
                      <div style={{ position: 'relative', marginBottom: 8 }}>
                        <Search size={12} style={{ position: 'absolute', left: 9, top: 9, color: 'var(--fg-3)' }} />
                        <input
                          value={search} onChange={e => setSearch(e.target.value)} placeholder="caută după nume sau email"
                          style={{ width: '100%', padding: '6px 9px 6px 26px', borderRadius: 7, background: 'var(--bg-3)', border: '1px solid var(--border)', color: 'var(--fg)', fontSize: 12 }}
                        />
                      </div>
                      <div style={{ display: 'grid', gap: 3, maxHeight: 200, overflowY: 'auto', marginBottom: 8 }}>
                        {candidates.map(p => {
                          const on = picked.has(p.id);
                          return (
                            <button key={p.id} onClick={() => setPicked(prev => {
                              const n = new Set(prev);
                              n.has(p.id) ? n.delete(p.id) : n.add(p.id);
                              return n;
                            })}
                              style={{
                                display: 'flex', alignItems: 'center', gap: 8, padding: '5px 9px', borderRadius: 7,
                                background: on ? 'var(--accent-dim)' : 'transparent', textAlign: 'left',
                                border: `1px solid ${on ? 'var(--border-hi)' : 'var(--border)'}`,
                                color: on ? 'var(--accent)' : 'var(--fg-2)', cursor: 'pointer', fontSize: 12,
                              }}>
                              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {p.full_name || p.email}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                      <button onClick={() => handleAdd(g.id)} disabled={!picked.size || busy} style={primaryBtn(!picked.size || busy)}>
                        <UserPlus size={13} /> Adaugă {picked.size || ''} în grupă
                      </button>
                      {(g.assignments || []).length > 0 && picked.size > 0 && (
                        <p style={{ fontSize: 11, color: 'var(--fg-3)', margin: '8px 0 0', lineHeight: 1.5 }}>
                          Grupa e deja alocată la {(g.assignments || []).length} flux(uri) — oamenii adăugați
                          primesc acces imediat.
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
          {groups.length === 0 && !error && <p style={{ fontSize: 13, color: 'var(--fg-3)' }}>Nicio grupă încă.</p>}
        </div>
      )}
    </div>
  );
};

const primaryBtn = (disabled: boolean): React.CSSProperties => ({
  display: 'inline-flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 8,
  background: 'var(--gold-dim)', color: 'var(--gold)', border: '1px solid var(--border-hi)',
  cursor: disabled ? 'not-allowed' : 'pointer', fontSize: 12.5, fontWeight: 600, opacity: disabled ? 0.5 : 1,
});

const iconBtn = (color: string): React.CSSProperties => ({
  height: 30, minWidth: 30, display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
  background: 'transparent', border: '1px solid var(--border)', borderRadius: 8, color, cursor: 'pointer',
});

const linkBtn: React.CSSProperties = {
  background: 'none', border: 'none', color: 'var(--fg-2)', cursor: 'pointer',
  fontSize: 11.5, textDecoration: 'underline', padding: 0,
};

const Field: React.FC<{ label: string; value: string; onChange: (v: string) => void; placeholder?: string }> =
  ({ label, value, onChange, placeholder }) => (
    <label style={{ display: 'block', minWidth: 0 }}>
      <span style={{ display: 'block', fontSize: 10, color: 'var(--fg-3)', marginBottom: 4 }}>{label}</span>
      <input
        value={value} placeholder={placeholder} onChange={e => onChange(e.target.value)}
        style={{ width: '100%', padding: '6px 9px', borderRadius: 7, background: 'var(--bg-3)', border: '1px solid var(--border)', color: 'var(--fg)', fontSize: 12 }}
      />
    </label>
  );
