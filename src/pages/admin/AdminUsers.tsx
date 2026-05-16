import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from '@/lib/router-compat';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, ChevronDown, ChevronUp, Shield, User, Search, X, RefreshCw, CheckCircle2, Link2 } from 'lucide-react';
import { MockUser, Progress, WhitelistEntry, Tariff } from '../../lib/types';
import { MODULES, MOCK_WHITELIST_ENTRIES } from '../../lib/data';
import { TariffBadge } from '../../components/ui/TariffBadge';
import { timeAgo } from '../../lib/activity';

function getStoredUsers(): MockUser[] {
  try { const s = localStorage.getItem('aa_users'); return s ? JSON.parse(s) : []; } catch { return []; }
}
function getStoredProgress(): Progress[] {
  try { const s = localStorage.getItem('aa_progress'); return s ? JSON.parse(s) : []; } catch { return []; }
}
function getWhitelist(): WhitelistEntry[] {
  try {
    const s = localStorage.getItem('aa_whitelist_entries');
    if (s) return JSON.parse(s) as WhitelistEntry[];
  } catch {}
  return [...MOCK_WHITELIST_ENTRIES];
}
function saveWhitelist(entries: WhitelistEntry[]) {
  localStorage.setItem('aa_whitelist_entries', JSON.stringify(entries));
  localStorage.setItem('aa_whitelist', JSON.stringify(entries.map(e => e.email)));
}

const TARIFF_OPTIONS: { value: Tariff; label: string; price: string }[] = [
  { value: 'student', label: 'Student', price: '589€' },
  { value: 'designer', label: 'Designer', price: '777€' },
  { value: 'arhitect', label: 'Arhitect', price: '1.129€' },
];

const getFlagEmoji = (country?: string) => {
  if (!country) return '';
  const flags: Record<string, string> = {
    'Romania': '🇷🇴', 'Moldova': '🇲🇩', 'Germany': '🇩🇪',
    'France': '🇫🇷', 'United Kingdom': '🇬🇧', 'United States': '🇺🇸',
    'Spain': '🇪🇸', 'Italy': '🇮🇹',
  };
  return flags[country] || '🌍';
};

const tariffColor = (t: Tariff) => {
  if (t === 'arhitect') return { color: 'var(--gold)', bg: 'var(--gold-dim)', border: 'rgba(201,169,110,0.3)' };
  if (t === 'designer') return { color: 'var(--accent)', bg: 'rgba(196,240,228,0.1)', border: 'rgba(196,240,228,0.3)' };
  return { color: 'var(--fg-2)', bg: 'rgba(255,255,255,0.06)', border: 'rgba(255,255,255,0.15)' };
};

export const AdminUsers: React.FC = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState<MockUser[]>([]);
  const [progress, setProgress] = useState<Progress[]>([]);
  const [whitelist, setWhitelist] = useState<WhitelistEntry[]>([]);
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

  const totalLessons = MODULES.flatMap(m => m.lessons).length;

  const reload = useCallback(() => {
    setUsers(getStoredUsers());
    setProgress(getStoredProgress());
    setWhitelist(getWhitelist());
  }, []);

  // Initial load
  useEffect(() => { reload(); }, [reload]);

  // Auto-refresh every 8s + on window focus (picks up new registrations)
  useEffect(() => {
    const interval = setInterval(reload, 8000);
    window.addEventListener('focus', reload);
    // Storage events from other tabs
    const onStorage = (e: StorageEvent) => {
      if (e.key === 'aa_users' || e.key === 'aa_whitelist_entries' || e.key === 'aa_progress') reload();
    };
    window.addEventListener('storage', onStorage);
    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', reload);
      window.removeEventListener('storage', onStorage);
    };
  }, [reload]);

  const getUserProgress = (userId: string) => {
    const done = progress.filter(p => p.user_id === userId).length;
    return totalLessons > 0 ? Math.round((done / totalLessons) * 100) : 0;
  };

  const getUserLessonCount = (userId: string) => progress.filter(p => p.user_id === userId).length;

  const handleAddWhitelist = () => {
    setAddError('');
    const email = newEmail.trim().toLowerCase();
    if (!email) { setAddError('Introdu o adresă de email.'); return; }
    // Basic email validation
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setAddError('Adresa de email nu este validă.');
      return;
    }
    if (whitelist.find(e => e.email === email)) {
      setAddError('Acest email este deja în lista de acces.');
      return;
    }
    const updated: WhitelistEntry[] = [...whitelist, { email, tariff: newTariff }];
    saveWhitelist(updated);
    setWhitelist(updated);
    setNewEmail('');
    setNewTariff('student');
    setShowAddForm(false);
    setAddSuccess(`✓ ${email} a fost adăugat cu succes.`);
    setTimeout(() => setAddSuccess(''), 4000);
  };

  const handleCopyLink = (email: string) => {
    const link = `${window.location.origin}/register?email=${encodeURIComponent(email)}`;
    navigator.clipboard.writeText(link).then(() => {
      setCopiedLink(email);
      setTimeout(() => setCopiedLink(null), 2500);
    });
  };

  const handleRemoveWhitelist = (email: string) => {
    if (confirmRemove !== email) {
      setConfirmRemove(email);
      setTimeout(() => setConfirmRemove(null), 3000);
      return;
    }
    const updated = whitelist.filter(e => e.email !== email);
    saveWhitelist(updated);
    setWhitelist(updated);
    setConfirmRemove(null);
  };

  const filteredUsers = users.filter(u => {
    const matchSearch = !search || u.full_name?.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase());
    const matchTariff = tariffFilter === 'all' || (u.tariff || 'student') === tariffFilter;
    return matchSearch && matchTariff;
  });

  const totalStudents = users.filter(u => u.role !== 'admin').length;
  const totalAdmins = users.filter(u => u.role === 'admin').length;

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 28, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 className="font-aboreto" style={{ fontSize: 22, color: 'var(--fg)', letterSpacing: '-0.01em', marginBottom: 4 }}>Utilizatori</h1>
          <p style={{ fontSize: 13, color: 'var(--fg-3)' }}>Gestionează utilizatorii înregistrați și lista de acces</p>
        </div>
        <button
          onClick={reload}
          style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', borderRadius: 8, cursor: 'pointer', fontSize: 12, color: 'var(--fg-2)', transition: 'all 0.15s' }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--border-hi)'; e.currentTarget.style.color = 'var(--fg)'; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--fg-2)'; }}
        >
          <RefreshCw size={13} /> Reîncarcă
        </button>
      </div>

      {/* Success/Error toasts */}
      <AnimatePresence>
        {addSuccess && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
            style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 16px', background: 'rgba(74,222,128,0.1)', border: '1px solid rgba(74,222,128,0.25)', borderRadius: 10, marginBottom: 16, fontSize: 13, color: '#4ade80' }}>
            <CheckCircle2 size={15} /> {addSuccess}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 24 }}>
        {[
          { label: 'Total utilizatori', value: users.length, color: 'var(--fg)' },
          { label: 'Studenți', value: totalStudents, color: 'var(--accent)' },
          { label: 'Administratori', value: totalAdmins, color: '#a78bfa' },
          { label: 'Whitelistați', value: whitelist.length, color: 'var(--gold)' },
        ].map(({ label, value, color }) => (
          <div key={label} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 14, padding: '18px 20px' }}>
            <div style={{ fontSize: 28, fontWeight: 700, color, lineHeight: 1, letterSpacing: '-0.02em', marginBottom: 6 }}>{value}</div>
            <div style={{ fontSize: 11, color: 'var(--fg-3)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Whitelist section */}
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 16, padding: '20px 24px', marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: showAddForm ? 16 : 0 }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--fg)', marginBottom: 2 }}>Lista de acces ({whitelist.length})</div>
            <div style={{ fontSize: 12, color: 'var(--fg-3)' }}>Adaugă emailuri pentru a permite înregistrarea</div>
          </div>
          <button
            onClick={() => setShowAddForm(f => !f)}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 14px', background: showAddForm ? 'rgba(255,255,255,0.05)' : 'var(--accent)', color: showAddForm ? 'var(--fg-3)' : '#0D0907', border: showAddForm ? '1px solid var(--border)' : 'none', borderRadius: 8, cursor: 'pointer', fontSize: 12, fontWeight: 700, transition: 'all 0.15s' }}
          >
            {showAddForm ? <><X size={13} /> Anulează</> : <><Plus size={13} /> Adaugă</>}
          </button>
        </div>

        <AnimatePresence>
          {showAddForm && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              style={{ overflow: 'hidden' }}
            >
              <div style={{ borderTop: '1px solid var(--border)', paddingTop: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
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
                    onKeyDown={e => e.key === 'Enter' && handleAddWhitelist()}
                    style={{ flex: '1 1 200px', padding: '9px 12px', background: 'var(--bg-3)', border: `1px solid ${addError ? 'rgba(248,113,113,0.5)' : 'var(--border)'}`, borderRadius: 8, color: 'var(--fg)', fontSize: 13, transition: 'border-color 0.2s' }}
                  />
                  <button
                    onClick={handleAddWhitelist}
                    style={{ padding: '9px 18px', background: 'var(--accent)', color: '#0D0907', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 700, whiteSpace: 'nowrap' }}
                  >
                    <Plus size={14} style={{ display: 'inline', marginRight: 4 }} />Adaugă
                  </button>
                </div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                  <span style={{ fontSize: 12, color: 'var(--fg-3)' }}>Plan:</span>
                  {TARIFF_OPTIONS.map(opt => {
                    const tc = tariffColor(opt.value);
                    return (
                      <button
                        key={opt.value}
                        onClick={() => setNewTariff(opt.value)}
                        style={{
                          padding: '5px 12px', borderRadius: 8, fontSize: 12, cursor: 'pointer',
                          fontWeight: newTariff === opt.value ? 700 : 400,
                          background: newTariff === opt.value ? tc.bg : 'transparent',
                          border: `1px solid ${newTariff === opt.value ? tc.border : 'var(--border)'}`,
                          color: newTariff === opt.value ? tc.color : 'var(--fg-3)',
                          transition: 'all 0.15s',
                        }}
                      >
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
          <div style={{ marginTop: showAddForm ? 12 : 12, display: 'flex', flexDirection: 'column', gap: 4 }}>
            {whitelist.map(entry => (
              <div key={entry.email} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', borderRadius: 8 }}>
                <span style={{ fontSize: 13, color: 'var(--fg)', flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginRight: 8 }}>{entry.email}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                  <TariffBadge tariff={entry.tariff} compact />
                  <button
                    onClick={() => handleCopyLink(entry.email)}
                    title="Copiază link de înregistrare"
                    style={{
                      padding: '3px 10px', borderRadius: 6, fontSize: 11, cursor: 'pointer', border: 'none', fontWeight: 600, transition: 'all 0.15s', display: 'flex', alignItems: 'center', gap: 4,
                      background: copiedLink === entry.email ? 'rgba(74,222,128,0.15)' : 'rgba(196,240,228,0.08)',
                      color: copiedLink === entry.email ? '#4ade80' : 'var(--accent)',
                    }}
                  >
                    <Link2 size={11} />
                    {copiedLink === entry.email ? 'Copiat!' : 'Link'}
                  </button>
                  <button
                    onClick={() => handleRemoveWhitelist(entry.email)}
                    style={{
                      padding: '3px 10px', borderRadius: 6, fontSize: 11, cursor: 'pointer', border: 'none', fontWeight: 600, transition: 'all 0.15s',
                      background: confirmRemove === entry.email ? '#f87171' : 'rgba(248,113,113,0.08)',
                      color: confirmRemove === entry.email ? '#fff' : '#f87171',
                    }}
                  >
                    {confirmRemove === entry.email ? 'Confirmă' : 'Elimină'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Search + filter bar */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 14, flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 200, maxWidth: 300 }}>
          <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--fg-3)', pointerEvents: 'none' }} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Caută utilizator..."
            style={{ paddingLeft: 32, paddingRight: 12, paddingTop: 8, paddingBottom: 8, background: 'var(--bg-3)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--fg)', fontSize: 13, width: '100%' }}
          />
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          {(['all', 'student', 'designer', 'arhitect'] as const).map(tf => (
            <button
              key={tf}
              onClick={() => setTariffFilter(tf)}
              style={{
                padding: '6px 12px', borderRadius: 8, fontSize: 12, cursor: 'pointer',
                border: `1px solid ${tariffFilter === tf ? 'rgba(196,240,228,0.3)' : 'var(--border)'}`,
                background: tariffFilter === tf ? 'rgba(196,240,228,0.1)' : 'transparent',
                color: tariffFilter === tf ? 'var(--accent)' : 'var(--fg-3)',
                fontWeight: tariffFilter === tf ? 600 : 400,
                transition: 'all 0.15s',
              }}
            >
              {tf === 'all' ? 'Toți' : tf.charAt(0).toUpperCase() + tf.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Users table */}
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 16, overflow: 'hidden' }}>
        {/* Table header */}
        <div style={{ display: 'grid', gridTemplateColumns: '36px 1fr 100px 80px 110px 120px 90px 80px auto', gap: 12, padding: '10px 20px', borderBottom: '1px solid var(--border)', alignItems: 'center' }}>
          {['', 'Nume & Email', 'Tarif', 'Țară', 'Ultima conectare', 'Progres', 'Quiz', 'Acțiuni', ''].map((h, i) => (
            <div key={i} style={{ fontSize: 10, fontWeight: 700, color: 'var(--fg-3)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>{h}</div>
          ))}
        </div>

        {filteredUsers.length === 0 ? (
          <div style={{ padding: '48px 24px', textAlign: 'center', color: 'var(--fg-3)', fontSize: 14 }}>
            {users.length === 0 ? 'Niciun utilizator înregistrat.' : 'Niciun utilizator corespunde filtrului.'}
          </div>
        ) : (
          filteredUsers.map(user => {
            const pct = getUserProgress(user.id);
            const lessonCount = getUserLessonCount(user.id);
            const isExpanded = expandedUser === user.id;
            const userTariff = (user.tariff || 'student') as Tariff;
            const quizDone = !!localStorage.getItem(`aa_quiz_answers_${user.id}`);
            const tc = tariffColor(userTariff);

            return (
              <div key={user.id} style={{ borderBottom: '1px solid var(--border)' }}>
                {/* Main row */}
                <div
                  style={{ display: 'grid', gridTemplateColumns: '36px 1fr 100px 80px 110px 120px 90px 80px auto', gap: 12, padding: '12px 20px', alignItems: 'center', cursor: 'pointer', transition: 'background 0.15s' }}
                  onClick={() => setExpandedUser(isExpanded ? null : user.id)}
                  onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.background = 'rgba(255,255,255,0.02)'}
                  onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.background = 'transparent'}
                >
                  {/* Avatar */}
                  <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg, #1A5C38, #0f3d22)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: '#C4F0E4', flexShrink: 0 }}>
                    {user.full_name?.charAt(0)?.toUpperCase() || 'U'}
                  </div>

                  {/* Name + email */}
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: user.role === 'admin' ? '#a78bfa' : 'var(--fg)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: 6 }}>
                      {user.full_name}
                      {user.role === 'admin' && <Shield size={11} style={{ color: '#a78bfa', flexShrink: 0 }} />}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--fg-3)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.email}</div>
                  </div>

                  {/* Tariff */}
                  <span style={{ fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 99, background: tc.bg, color: tc.color, border: `1px solid ${tc.border}`, whiteSpace: 'nowrap' }}>
                    {userTariff.charAt(0).toUpperCase() + userTariff.slice(1)}
                  </span>

                  {/* Country */}
                  <div style={{ fontSize: 13 }}>
                    {user.country ? <span title={user.country}>{getFlagEmoji(user.country)} <span style={{ fontSize: 11, color: 'var(--fg-3)' }}>{user.country}</span></span> : <span style={{ color: 'var(--fg-3)' }}>—</span>}
                  </div>

                  {/* Last login */}
                  <div style={{ fontSize: 11, color: 'var(--fg-3)' }}>
                    {user.last_login ? timeAgo(user.last_login) : '—'}
                  </div>

                  {/* Progress */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div style={{ flex: 1, height: 4, background: 'rgba(255,255,255,0.06)', borderRadius: 2, overflow: 'hidden' }}>
                      <div style={{ width: `${pct}%`, height: '100%', background: pct === 100 ? '#4ade80' : 'var(--accent)', borderRadius: 2, transition: 'width 0.6s ease' }} />
                    </div>
                    <span style={{ fontSize: 11, color: 'var(--fg-3)', flexShrink: 0, minWidth: 28, textAlign: 'right' }}>{pct}%</span>
                  </div>

                  {/* Quiz status */}
                  <div>
                    {quizDone ? (
                      <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 99, background: 'rgba(74,222,128,0.1)', border: '1px solid rgba(74,222,128,0.25)', color: '#4ade80', whiteSpace: 'nowrap' }}>
                        ✓ Completat
                      </span>
                    ) : (
                      <span style={{ fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 99, background: 'var(--gold-dim)', border: '1px solid rgba(201,169,110,0.2)', color: 'var(--gold)', whiteSpace: 'nowrap' }}>
                        ⏳ În așteptare
                      </span>
                    )}
                  </div>

                  {/* Actions */}
                  <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                    <button
                      onClick={e => { e.stopPropagation(); navigate(`/admin/student/${user.id}`); }}
                      style={{ padding: '4px 10px', background: 'rgba(196,240,228,0.08)', border: '1px solid rgba(196,240,228,0.2)', borderRadius: 7, cursor: 'pointer', fontSize: 11, color: 'var(--accent)', fontWeight: 600, whiteSpace: 'nowrap', transition: 'background 0.15s' }}
                      onMouseEnter={e => (e.currentTarget.style.background = 'rgba(196,240,228,0.15)')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'rgba(196,240,228,0.08)')}
                    >
                      Profil →
                    </button>
                    <button
                      onClick={e => { e.stopPropagation(); handleRemoveWhitelist(user.email); }}
                      style={{ padding: '4px 8px', background: 'rgba(248,113,113,0.06)', border: '1px solid rgba(248,113,113,0.15)', borderRadius: 7, cursor: 'pointer', fontSize: 11, color: '#f87171', transition: 'background 0.15s' }}
                      onMouseEnter={e => (e.currentTarget.style.background = 'rgba(248,113,113,0.12)')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'rgba(248,113,113,0.06)')}
                    >
                      <Trash2 size={11} />
                    </button>
                  </div>

                  {/* Expand toggle */}
                  <div style={{ color: 'var(--fg-3)' }}>
                    {isExpanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                  </div>
                </div>

                {/* Expanded: module progress breakdown */}
                <AnimatePresence initial={false}>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.22 }}
                      style={{ overflow: 'hidden', background: 'rgba(0,0,0,0.12)', borderTop: '1px solid var(--border)' }}
                    >
                      <div style={{ padding: '16px 20px' }}>
                        <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--fg-3)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 12 }}>
                          Progres per modul · {lessonCount}/{totalLessons} lecții totale
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 8 }}>
                          {MODULES.map(mod => {
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

      {/* Suppress unused import warning */}
      {false && <User size={0} />}
    </div>
  );
};
