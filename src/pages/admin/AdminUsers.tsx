// @ts-nocheck
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from '@/lib/router-compat';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, ChevronDown, ChevronUp, Shield, Search, X, RefreshCw, CheckCircle2, Link2, ShieldOff } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { TariffBadge } from '../../components/aa/TariffBadge';
import { timeAgo } from '../../lib/activity';
import { fetchModulesWithLessons, fetchAdminUsers, fetchAllProgress, setUserAdmin, AdminModule, AdminUserRow, AdminProgressRow } from '../../lib/adminData';
import type { Tariff } from '../../lib/types';

interface WLEntry { email: string; tariff: Tariff; added_at?: string; }

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
  const navigate = useNavigate();
  const [users, setUsers] = useState<AdminUserRow[]>([]);
  const [progress, setProgress] = useState<AdminProgressRow[]>([]);
  const [modules, setModules] = useState<AdminModule[]>([]);
  const [whitelist, setWhitelist] = useState<WLEntry[]>([]);
  const [expandedUser, setExpandedUser] = useState<string | null>(null);
  const [newEmail, setNewEmail] = useState('');
  const [newTariff, setNewTariff] = useState<Tariff>('student');
  const [confirmRemove, setConfirmRemove] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [tariffFilter, setTariffFilter] = useState<'all' | Tariff>('all');
  const [showAddForm, setShowAddForm] = useState(false);
  const [addSuccess, setAddSuccess] = useState('');
  const [addError, setAddError] = useState('');
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    setLoading(true);
    const [u, p, m, wl] = await Promise.all([
      fetchAdminUsers(),
      fetchAllProgress(),
      fetchModulesWithLessons(),
      supabase.from('whitelist').select('email,tariff,added_at').order('added_at', { ascending: false }),
    ]);
    setUsers(u);
    setProgress(p);
    setModules(m);
    setWhitelist((wl.data || []) as WLEntry[]);
    setLoading(false);
  }, []);

  useEffect(() => { reload(); }, [reload]);

  const totalLessons = modules.flatMap(m => m.lessons).length;
  const getUserProgress = (userId: string) => {
    const done = progress.filter(p => p.user_id === userId).length;
    return totalLessons > 0 ? Math.round((done / totalLessons) * 100) : 0;
  };
  const getUserLessonCount = (userId: string) => progress.filter(p => p.user_id === userId).length;

  const handleAddWhitelist = async () => {
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
    setNewEmail(''); setNewTariff('student'); setShowAddForm(false);
    setAddSuccess(`✓ ${email} a fost adăugat cu succes.`);
    setTimeout(() => setAddSuccess(''), 4000);
    reload();
  };

  const handleCopyLink = (email: string) => {
    const link = `${window.location.origin}/register?email=${encodeURIComponent(email)}`;
    navigator.clipboard.writeText(link).then(() => {
      setCopiedLink(email);
      setTimeout(() => setCopiedLink(null), 2500);
    });
  };

  const handleRemoveWhitelist = async (email: string) => {
    if (confirmRemove !== email) {
      setConfirmRemove(email);
      setTimeout(() => setConfirmRemove(null), 3000);
      return;
    }
    await supabase.from('whitelist').delete().eq('email', email);
    setConfirmRemove(null);
    reload();
  };

  const handleToggleAdmin = async (user: AdminUserRow) => {
    if (user.email === 'babaradumi@gmail.com' && user.is_admin) return; // safeguard
    const { error } = await setUserAdmin(user.id, !user.is_admin);
    if (!error) reload();
    else alert(error);
  };

  const filteredUsers = users.filter(u => {
    const matchSearch = !search || u.full_name?.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase());
    const matchTariff = tariffFilter === 'all' || u.tariff === tariffFilter;
    return matchSearch && matchTariff;
  });

  const totalAdmins = users.filter(u => u.is_admin).length;
  const totalStudents = users.length - totalAdmins;

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 24px' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 28, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 className="font-aboreto" style={{ fontSize: 22, color: 'var(--fg)', marginBottom: 4 }}>Utilizatori</h1>
          <p style={{ fontSize: 13, color: 'var(--fg-3)' }}>Gestionează utilizatorii înregistrați și lista de acces</p>
        </div>
        <button onClick={reload} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', borderRadius: 8, cursor: 'pointer', fontSize: 12, color: 'var(--fg-2)' }}>
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
          <button onClick={() => setShowAddForm(f => !f)}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 14px', background: showAddForm ? 'rgba(255,255,255,0.05)' : 'var(--accent)', color: showAddForm ? 'var(--fg-3)' : '#0D0907', border: showAddForm ? '1px solid var(--border)' : 'none', borderRadius: 8, cursor: 'pointer', fontSize: 12, fontWeight: 700 }}>
            {showAddForm ? <><X size={13} /> Anulează</> : <><Plus size={13} /> Adaugă</>}
          </button>
        </div>

        <AnimatePresence>
          {showAddForm && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} style={{ overflow: 'hidden' }}>
              <div style={{ borderTop: '1px solid var(--border)', marginTop: 16, paddingTop: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
                {addError && (
                  <div style={{ padding: '8px 12px', background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.2)', borderRadius: 8, fontSize: 12, color: '#f87171' }}>{addError}</div>
                )}
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  <input type="email" value={newEmail} onChange={e => { setNewEmail(e.target.value); if (addError) setAddError(''); }}
                    placeholder="email@exemplu.ro" onKeyDown={e => e.key === 'Enter' && handleAddWhitelist()}
                    style={{ flex: '1 1 200px', padding: '9px 12px', background: 'var(--bg-3)', border: `1px solid ${addError ? 'rgba(248,113,113,0.5)' : 'var(--border)'}`, borderRadius: 8, color: 'var(--fg)', fontSize: 13 }} />
                  <button onClick={handleAddWhitelist} style={{ padding: '9px 18px', background: 'var(--accent)', color: '#0D0907', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 700 }}>
                    <Plus size={14} style={{ display: 'inline', marginRight: 4 }} />Adaugă
                  </button>
                </div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                  <span style={{ fontSize: 12, color: 'var(--fg-3)' }}>Plan:</span>
                  {TARIFF_OPTIONS.map(opt => {
                    const tc = tariffColor(opt.value);
                    const active = newTariff === opt.value;
                    return (
                      <button key={opt.value} onClick={() => setNewTariff(opt.value)}
                        style={{ padding: '5px 12px', borderRadius: 8, fontSize: 12, cursor: 'pointer', fontWeight: active ? 700 : 400, background: active ? tc.bg : 'transparent', border: `1px solid ${active ? tc.border : 'var(--border)'}`, color: active ? tc.color : 'var(--fg-3)' }}>
                        {opt.label} · {opt.price}
                      </button>
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
                  <button onClick={() => handleCopyLink(entry.email)} title="Copiază link de înregistrare"
                    style={{ padding: '3px 10px', borderRadius: 6, fontSize: 11, cursor: 'pointer', border: 'none', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4, background: copiedLink === entry.email ? 'rgba(74,222,128,0.15)' : 'rgba(196,240,228,0.08)', color: copiedLink === entry.email ? '#4ade80' : 'var(--accent)' }}>
                    <Link2 size={11} />{copiedLink === entry.email ? 'Copiat!' : 'Link'}
                  </button>
                  <button onClick={() => handleRemoveWhitelist(entry.email)}
                    style={{ padding: '3px 10px', borderRadius: 6, fontSize: 11, cursor: 'pointer', border: 'none', fontWeight: 600, background: confirmRemove === entry.email ? '#f87171' : 'rgba(248,113,113,0.08)', color: confirmRemove === entry.email ? '#fff' : '#f87171' }}>
                    {confirmRemove === entry.email ? 'Confirmă' : 'Elimină'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Search + filter */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 14, flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 200, maxWidth: 300 }}>
          <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--fg-3)', pointerEvents: 'none' }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Caută utilizator..."
            style={{ paddingLeft: 32, paddingRight: 12, paddingTop: 8, paddingBottom: 8, background: 'var(--bg-3)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--fg)', fontSize: 13, width: '100%' }} />
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          {(['all', 'student', 'designer', 'arhitect'] as const).map(tf => (
            <button key={tf} onClick={() => setTariffFilter(tf)}
              style={{ padding: '6px 12px', borderRadius: 8, fontSize: 12, cursor: 'pointer', border: `1px solid ${tariffFilter === tf ? 'rgba(196,240,228,0.3)' : 'var(--border)'}`, background: tariffFilter === tf ? 'rgba(196,240,228,0.1)' : 'transparent', color: tariffFilter === tf ? 'var(--accent)' : 'var(--fg-3)', fontWeight: tariffFilter === tf ? 600 : 400 }}>
              {tf === 'all' ? 'Toți' : tf.charAt(0).toUpperCase() + tf.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Users list */}
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 16, overflow: 'hidden' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '36px 1fr 100px 130px 110px 90px 130px 32px', gap: 12, padding: '10px 20px', borderBottom: '1px solid var(--border)', alignItems: 'center' }}>
          {['', 'Nume & Email', 'Tarif', 'Ultima activitate', 'Progres', 'Quiz', 'Acțiuni', ''].map((h, i) => (
            <div key={i} style={{ fontSize: 10, fontWeight: 700, color: 'var(--fg-3)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>{h}</div>
          ))}
        </div>

        {filteredUsers.length === 0 ? (
          <div style={{ padding: '48px 24px', textAlign: 'center', color: 'var(--fg-3)', fontSize: 14 }}>
            {users.length === 0 ? (loading ? 'Se încarcă...' : 'Niciun utilizator înregistrat.') : 'Niciun utilizator corespunde filtrului.'}
          </div>
        ) : (
          filteredUsers.map(user => {
            const pct = getUserProgress(user.id);
            const lessonCount = getUserLessonCount(user.id);
            const isExpanded = expandedUser === user.id;
            const tc = tariffColor(user.tariff);
            const isMainAdmin = user.email === 'babaradumi@gmail.com';

            return (
              <div key={user.id} style={{ borderBottom: '1px solid var(--border)' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '36px 1fr 100px 130px 110px 90px 130px 32px', gap: 12, padding: '12px 20px', alignItems: 'center', cursor: 'pointer' }}
                  onClick={() => setExpandedUser(isExpanded ? null : user.id)}
                  onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.background = 'rgba(255,255,255,0.02)'}
                  onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.background = 'transparent'}>
                  <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg, #1A5C38, #0f3d22)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: '#C4F0E4' }}>
                    {user.full_name?.charAt(0)?.toUpperCase() || 'U'}
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: user.is_admin ? '#a78bfa' : 'var(--fg)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: 6 }}>
                      {user.full_name || user.email}
                      {user.is_admin && <Shield size={11} style={{ color: '#a78bfa', flexShrink: 0 }} />}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--fg-3)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.email}</div>
                  </div>
                  <span style={{ fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 99, background: tc.bg, color: tc.color, border: `1px solid ${tc.border}`, whiteSpace: 'nowrap', justifySelf: 'start' }}>
                    {user.tariff.charAt(0).toUpperCase() + user.tariff.slice(1)}
                  </span>
                  <div style={{ fontSize: 11, color: 'var(--fg-3)' }}>{user.last_activity ? timeAgo(user.last_activity) : '—'}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div style={{ flex: 1, height: 4, background: 'rgba(255,255,255,0.06)', borderRadius: 2, overflow: 'hidden' }}>
                      <div style={{ width: `${pct}%`, height: '100%', background: pct === 100 ? '#4ade80' : 'var(--accent)', borderRadius: 2 }} />
                    </div>
                    <span style={{ fontSize: 11, color: 'var(--fg-3)', flexShrink: 0, minWidth: 28, textAlign: 'right' }}>{pct}%</span>
                  </div>
                  <div>
                    {user.quiz_done ? (
                      <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 99, background: 'rgba(74,222,128,0.1)', border: '1px solid rgba(74,222,128,0.25)', color: '#4ade80' }}>✓ Completat</span>
                    ) : (
                      <span style={{ fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 99, background: 'var(--gold-dim)', border: '1px solid rgba(201,169,110,0.2)', color: 'var(--gold)' }}>⏳ În așteptare</span>
                    )}
                  </div>
                  <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                    <button onClick={e => { e.stopPropagation(); navigate(`/admin/student/${user.id}`); }}
                      style={{ padding: '4px 10px', background: 'rgba(196,240,228,0.08)', border: '1px solid rgba(196,240,228,0.2)', borderRadius: 7, cursor: 'pointer', fontSize: 11, color: 'var(--accent)', fontWeight: 600, whiteSpace: 'nowrap' }}>
                      Profil →
                    </button>
                    {!isMainAdmin && (
                      <button onClick={e => { e.stopPropagation(); handleToggleAdmin(user); }}
                        title={user.is_admin ? 'Retrage admin' : 'Promovează la admin'}
                        style={{ padding: '4px 8px', background: user.is_admin ? 'rgba(248,113,113,0.08)' : 'rgba(167,139,250,0.1)', border: `1px solid ${user.is_admin ? 'rgba(248,113,113,0.2)' : 'rgba(167,139,250,0.25)'}`, borderRadius: 7, cursor: 'pointer', fontSize: 11, color: user.is_admin ? '#f87171' : '#a78bfa', display: 'flex', alignItems: 'center' }}>
                        {user.is_admin ? <ShieldOff size={11} /> : <Shield size={11} />}
                      </button>
                    )}
                  </div>
                  <div style={{ color: 'var(--fg-3)' }}>
                    {isExpanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                  </div>
                </div>

                <AnimatePresence initial={false}>
                  {isExpanded && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                      style={{ overflow: 'hidden', background: 'rgba(0,0,0,0.12)', borderTop: '1px solid var(--border)' }}>
                      <div style={{ padding: '16px 20px' }}>
                        <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--fg-3)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 12 }}>
                          Progres per modul · {lessonCount}/{totalLessons} lecții totale
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 8 }}>
                          {modules.map(mod => {
                            const done = mod.lessons.filter(l => progress.some(p => p.user_id === user.id && p.lesson_id === l.id)).length;
                            const total = mod.lessons.length;
                            const modPct = total > 0 ? Math.round((done / total) * 100) : 0;
                            return (
                              <div key={mod.id} style={{ background: 'var(--bg-3)', border: '1px solid var(--border)', borderRadius: 10, padding: '12px 14px' }}>
                                <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>{mod.etapa}</div>
                                <div style={{ fontSize: 12, color: 'var(--fg)', fontWeight: 500, marginBottom: 8, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{mod.title}</div>
                                <div style={{ height: 3, background: 'rgba(255,255,255,0.06)', borderRadius: 2, overflow: 'hidden', marginBottom: 4 }}>
                                  <div style={{ width: `${modPct}%`, height: '100%', background: modPct === 100 ? '#4ade80' : 'var(--accent)', borderRadius: 2 }} />
                                </div>
                                <div style={{ fontSize: 11, color: 'var(--fg-3)' }}>{done}/{total} lecții · {modPct}%</div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
