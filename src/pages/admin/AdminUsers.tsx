// @ts-nocheck
import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, RefreshCw, CheckCircle2, Link2, Shield, Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { TariffBadge } from '../../components/aa/TariffBadge';

type Tariff = 'student' | 'designer' | 'arhitect';
interface WLEntry { email: string; tariff: Tariff; added_at?: string; }
interface ProfileRow {
  id: string;
  email: string;
  full_name: string | null;
  tariff: Tariff;
  created_at: string;
  is_admin?: boolean;
  lessons_done?: number;
}

const TARIFF_OPTIONS: { value: Tariff; label: string; price: string }[] = [
  { value: 'student', label: 'Student', price: '589€' },
  { value: 'designer', label: 'Designer', price: '777€' },
  { value: 'arhitect', label: 'Arhitect', price: '1.129€' },
];

const tariffColor = (t: Tariff) => {
  if (t === 'arhitect') return { color: 'var(--gold)', bg: 'var(--gold-dim)', border: 'rgba(201,169,110,0.3)' };
  if (t === 'designer') return { color: 'var(--accent)', bg: 'rgba(196,240,228,0.1)', border: 'rgba(196,240,228,0.3)' };
  return { color: 'var(--fg-2)', bg: 'rgba(255,255,255,0.06)', border: 'rgba(255,255,255,0.15)' };
};

export const AdminUsers: React.FC = () => {
  const [whitelist, setWhitelist] = useState<WLEntry[]>([]);
  const [users, setUsers] = useState<ProfileRow[]>([]);
  const [loading, setLoading] = useState(true);

  const [newEmail, setNewEmail] = useState('');
  const [newTariff, setNewTariff] = useState<Tariff>('student');
  const [showAddForm, setShowAddForm] = useState(false);
  const [addError, setAddError] = useState('');
  const [addSuccess, setAddSuccess] = useState('');
  const [confirmRemove, setConfirmRemove] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    const [wl, prof, roles, prog, totalLessonsRes] = await Promise.all([
      supabase.from('whitelist').select('email,tariff,added_at').order('added_at', { ascending: false }),
      supabase.from('profiles').select('id,email,full_name,tariff,created_at').order('created_at', { ascending: false }),
      supabase.from('user_roles').select('user_id,role'),
      supabase.from('progress').select('user_id,lesson_id'),
      supabase.from('lessons').select('id', { count: 'exact', head: true }),
    ]);
    const adminIds = new Set((roles.data || []).filter((r: any) => r.role === 'admin').map((r: any) => r.user_id));
    const lessonsByUser: Record<string, number> = {};
    (prog.data || []).forEach((p: any) => { lessonsByUser[p.user_id] = (lessonsByUser[p.user_id] || 0) + 1; });
    setWhitelist((wl.data || []) as WLEntry[]);
    setUsers((prof.data || []).map((p: any) => ({
      ...p,
      is_admin: adminIds.has(p.id),
      lessons_done: lessonsByUser[p.id] || 0,
    })));
    setLoading(false);
  }, []);

  useEffect(() => { reload(); }, [reload]);

  const handleAdd = async () => {
    setAddError('');
    const email = newEmail.trim().toLowerCase();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setAddError('Adresa de email nu este validă.');
      return;
    }
    const { error } = await supabase.from('whitelist').insert({ email, tariff: newTariff });
    if (error) {
      if (error.code === '23505') setAddError('Acest email este deja în listă.');
      else setAddError(error.message);
      return;
    }
    setNewEmail('');
    setShowAddForm(false);
    setAddSuccess(`✓ ${email} a fost adăugat.`);
    setTimeout(() => setAddSuccess(''), 4000);
    reload();
  };

  const handleRemove = async (email: string) => {
    if (confirmRemove !== email) {
      setConfirmRemove(email);
      setTimeout(() => setConfirmRemove(null), 3000);
      return;
    }
    await supabase.from('whitelist').delete().eq('email', email);
    setConfirmRemove(null);
    reload();
  };

  const handleCopyLink = (email: string) => {
    const link = `${window.location.origin}/register?email=${encodeURIComponent(email)}`;
    navigator.clipboard.writeText(link).then(() => {
      setCopiedLink(email);
      setTimeout(() => setCopiedLink(null), 2500);
    });
  };

  const totalAdmins = users.filter(u => u.is_admin).length;
  const totalStudents = users.length - totalAdmins;

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 24px' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 28, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 className="font-aboreto" style={{ fontSize: 22, color: 'var(--fg)', marginBottom: 4 }}>Utilizatori</h1>
          <p style={{ fontSize: 13, color: 'var(--fg-3)' }}>Gestionează utilizatorii și lista de acces</p>
        </div>
        <button
          onClick={reload}
          style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', borderRadius: 8, cursor: 'pointer', fontSize: 12, color: 'var(--fg-2)' }}
        >
          <RefreshCw size={13} className={loading ? 'animate-spin' : ''} /> Reîncarcă
        </button>
      </div>

      <AnimatePresence>
        {addSuccess && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
            style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 16px', background: 'rgba(74,222,128,0.1)', border: '1px solid rgba(74,222,128,0.25)', borderRadius: 10, marginBottom: 16, fontSize: 13, color: '#4ade80' }}>
            <CheckCircle2 size={15} /> {addSuccess}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 24 }}>
        {[
          { label: 'Total utilizatori', value: users.length, color: 'var(--fg)' },
          { label: 'Studenți', value: totalStudents, color: 'var(--accent)' },
          { label: 'Administratori', value: totalAdmins, color: '#a78bfa' },
          { label: 'Whitelistați', value: whitelist.length, color: 'var(--gold)' },
        ].map(({ label, value, color }) => (
          <div key={label} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 14, padding: '18px 20px' }}>
            <div style={{ fontSize: 28, fontWeight: 700, color, lineHeight: 1, marginBottom: 6 }}>{value}</div>
            <div style={{ fontSize: 11, color: 'var(--fg-3)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Whitelist */}
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 16, padding: '20px 24px', marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--fg)', marginBottom: 2 }}>Lista de acces ({whitelist.length})</div>
            <div style={{ fontSize: 12, color: 'var(--fg-3)' }}>Adaugă emailuri pentru a permite înregistrarea</div>
          </div>
          <button
            onClick={() => setShowAddForm(f => !f)}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 14px', background: showAddForm ? 'rgba(255,255,255,0.05)' : 'var(--accent)', color: showAddForm ? 'var(--fg-3)' : '#0D0907', border: showAddForm ? '1px solid var(--border)' : 'none', borderRadius: 8, cursor: 'pointer', fontSize: 12, fontWeight: 700 }}
          >
            {showAddForm ? <><X size={13} /> Anulează</> : <><Plus size={13} /> Adaugă</>}
          </button>
        </div>

        <AnimatePresence>
          {showAddForm && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} style={{ overflow: 'hidden' }}>
              <div style={{ borderTop: '1px solid var(--border)', marginTop: 16, paddingTop: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
                {addError && (
                  <div style={{ padding: '8px 12px', background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.2)', borderRadius: 8, fontSize: 12, color: '#f87171' }}>
                    {addError}
                  </div>
                )}
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  <input
                    type="email"
                    value={newEmail}
                    onChange={e => { setNewEmail(e.target.value); if (addError) setAddError(''); }}
                    placeholder="email@exemplu.ro"
                    onKeyDown={e => e.key === 'Enter' && handleAdd()}
                    style={{ flex: '1 1 200px', padding: '9px 12px', background: 'var(--bg-3)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--fg)', fontSize: 13 }}
                  />
                  <button onClick={handleAdd} style={{ padding: '9px 18px', background: 'var(--accent)', color: '#0D0907', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 700 }}>
                    <Plus size={14} style={{ display: 'inline', marginRight: 4 }} />Adaugă
                  </button>
                </div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                  <span style={{ fontSize: 12, color: 'var(--fg-3)' }}>Plan:</span>
                  {TARIFF_OPTIONS.map(opt => {
                    const tc = tariffColor(opt.value);
                    const active = newTariff === opt.value;
                    return (
                      <button key={opt.value} onClick={() => setNewTariff(opt.value)} style={{
                        padding: '5px 12px', borderRadius: 8, fontSize: 12, cursor: 'pointer', fontWeight: active ? 700 : 400,
                        background: active ? tc.bg : 'transparent', border: `1px solid ${active ? tc.border : 'var(--border)'}`,
                        color: active ? tc.color : 'var(--fg-3)',
                      }}>{opt.label} · {opt.price}</button>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {whitelist.length > 0 && (
          <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 4 }}>
            {whitelist.map(entry => (
              <div key={entry.email} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', borderRadius: 8 }}>
                <span style={{ fontSize: 13, color: 'var(--fg)', flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginRight: 8 }}>{entry.email}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                  <TariffBadge tariff={entry.tariff} compact />
                  <button onClick={() => handleCopyLink(entry.email)} title="Copiază link" style={{
                    padding: '3px 10px', borderRadius: 6, fontSize: 11, cursor: 'pointer', border: 'none', fontWeight: 600,
                    background: copiedLink === entry.email ? 'rgba(74,222,128,0.15)' : 'rgba(196,240,228,0.08)',
                    color: copiedLink === entry.email ? '#4ade80' : 'var(--accent)',
                    display: 'flex', alignItems: 'center', gap: 4,
                  }}>
                    <Link2 size={11} />{copiedLink === entry.email ? 'Copiat!' : 'Link'}
                  </button>
                  <button onClick={() => handleRemove(entry.email)} style={{
                    padding: '3px 10px', borderRadius: 6, fontSize: 11, cursor: 'pointer', border: 'none', fontWeight: 600,
                    background: confirmRemove === entry.email ? '#f87171' : 'rgba(248,113,113,0.08)',
                    color: confirmRemove === entry.email ? '#fff' : '#f87171',
                  }}>{confirmRemove === entry.email ? 'Confirmă' : 'Elimină'}</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Users list */}
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 16, overflow: 'hidden' }}>
        <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)', fontSize: 13, fontWeight: 600, color: 'var(--fg)' }}>
          Utilizatori înregistrați ({users.length})
        </div>
        {users.length === 0 ? (
          <div style={{ padding: '48px 24px', textAlign: 'center', color: 'var(--fg-3)', fontSize: 14 }}>
            {loading ? 'Se încarcă...' : 'Niciun utilizator înregistrat încă.'}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {users.map(u => (
              <div key={u.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 20px', borderBottom: '1px solid var(--border)' }}>
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--bg-3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, color: 'var(--fg-2)', fontWeight: 600 }}>
                  {(u.full_name || u.email).slice(0, 1).toUpperCase()}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, color: 'var(--fg)', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 6 }}>
                    {u.full_name || '—'}
                    {u.is_admin && <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, fontSize: 10, color: '#a78bfa', background: 'rgba(167,139,250,0.1)', padding: '2px 6px', borderRadius: 4 }}><Shield size={9} /> Admin</span>}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--fg-3)' }}>{u.email}</div>
                </div>
                <TariffBadge tariff={u.tariff} compact />
                <div style={{ fontSize: 12, color: 'var(--fg-3)', minWidth: 70, textAlign: 'right' }}>
                  {u.lessons_done || 0} lecții
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
