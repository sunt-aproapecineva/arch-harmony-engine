// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { getActivity, timeAgo, ActivityEvent, ActivityType } from '../../lib/activity';
import { Search, RefreshCw, LogIn, CheckCircle2, FileText, Award, UserPlus, BookOpen } from 'lucide-react';

const TYPE_CONFIG: Record<ActivityType, { icon: React.ReactNode; color: string; bg: string; label: string }> = {
  login: { icon: <LogIn size={13} />, color: '#4ade80', bg: 'rgba(74,222,128,0.1)', label: 'Login' },
  logout: { icon: <LogIn size={13} />, color: 'var(--fg-3)', bg: 'rgba(255,255,255,0.05)', label: 'Logout' },
  lesson_complete: { icon: <CheckCircle2 size={13} />, color: 'var(--accent)', bg: 'rgba(196,240,228,0.1)', label: 'Lecție' },
  lesson_view: { icon: <BookOpen size={13} />, color: 'var(--fg-3)', bg: 'rgba(255,255,255,0.05)', label: 'Vizualizare' },
  exercise_complete: { icon: <BookOpen size={13} />, color: '#fb923c', bg: 'rgba(251,146,60,0.1)', label: 'Exercițiu' },
  note_saved: { icon: <FileText size={13} />, color: '#60a5fa', bg: 'rgba(96,165,250,0.1)', label: 'Notiță' },
  quiz_complete: { icon: <Award size={13} />, color: 'var(--gold)', bg: 'var(--gold-dim)', label: 'Quiz' },
  module_view: { icon: <BookOpen size={13} />, color: 'var(--fg-3)', bg: 'rgba(255,255,255,0.04)', label: 'Modul' },
  platform_register: { icon: <UserPlus size={13} />, color: '#a78bfa', bg: 'rgba(167,139,250,0.1)', label: 'Înregistrare' },
};

const FILTERS: { value: string; label: string }[] = [
  { value: 'all', label: 'Toate' },
  { value: 'login', label: 'Login-uri' },
  { value: 'lesson_complete', label: 'Lecții' },
  { value: 'note_saved', label: 'Notițe' },
  { value: 'quiz_complete', label: 'Quiz' },
  { value: 'platform_register', label: 'Înregistrări' },
];

export const AdminActivity: React.FC = () => {
  const [events, setEvents] = useState<ActivityEvent[]>([]);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [dateFilter, setDateFilter] = useState<'today' | 'week' | 'all'>('all');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const PAGE_SIZE = 40;

  const load = async () => {
    setLoading(true);
    const data = await getActivity(1000);
    setEvents(data);
    setLoading(false);
  };

  useEffect(() => { load(); const t = setInterval(load, 30000); return () => clearInterval(t); }, []);

  const filtered = events.filter(ev => {
    if (filter !== 'all' && ev.type !== filter) return false;
    if (search && !ev.userName.toLowerCase().includes(search.toLowerCase()) && !ev.userEmail.toLowerCase().includes(search.toLowerCase())) return false;
    if (dateFilter === 'today') {
      const today = new Date(); today.setHours(0, 0, 0, 0);
      if (new Date(ev.timestamp) < today) return false;
    } else if (dateFilter === 'week') {
      const week = new Date(Date.now() - 7 * 86400000);
      if (new Date(ev.timestamp) < week) return false;
    }
    return true;
  });

  const today = new Date(); today.setHours(0, 0, 0, 0);
  const eventsToday = events.filter(e => new Date(e.timestamp) >= today);
  const uniqueUsersToday = new Set(eventsToday.map(e => e.userId)).size;
  const lessonsToday = eventsToday.filter(e => e.type === 'lesson_complete').length;
  const loginsToday = eventsToday.filter(e => e.type === 'login').length;

  const paged = filtered.slice(0, page * PAGE_SIZE);

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 className="font-aboreto" style={{ fontSize: 22, color: 'var(--fg)', letterSpacing: '-0.01em', marginBottom: 4 }}>Activitate</h1>
          <p style={{ fontSize: 13, color: 'var(--fg-3)' }}>{events.length} evenimente înregistrate</p>
        </div>
        <button onClick={load} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', borderRadius: 8, cursor: 'pointer', fontSize: 12, color: 'var(--fg-2)' }}>
          <RefreshCw size={13} className={loading ? 'animate-spin' : ''} /> Actualizează
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 24 }}>
        {[
          { label: 'Evenimente azi', value: eventsToday.length, color: 'var(--accent)' },
          { label: 'Utilizatori unici azi', value: uniqueUsersToday, color: '#a78bfa' },
          { label: 'Lecții completate azi', value: lessonsToday, color: '#4ade80' },
          { label: 'Login-uri azi', value: loginsToday, color: 'var(--gold)' },
        ].map(({ label, value, color }) => (
          <div key={label} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 14, padding: '18px 20px' }}>
            <div style={{ fontSize: 28, fontWeight: 700, color, lineHeight: 1, letterSpacing: '-0.02em', marginBottom: 6 }}>{value}</div>
            <div style={{ fontSize: 11, color: 'var(--fg-3)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 200, maxWidth: 280 }}>
          <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--fg-3)', pointerEvents: 'none' }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Caută utilizator..."
            style={{ paddingLeft: 32, paddingRight: 12, paddingTop: 8, paddingBottom: 8, background: 'var(--bg-3)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--fg)', fontSize: 13, width: '100%' }} />
        </div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {FILTERS.map(f => (
            <button key={f.value} onClick={() => { setFilter(f.value); setPage(1); }}
              style={{ padding: '6px 12px', borderRadius: 8, border: `1px solid ${filter === f.value ? 'rgba(196,240,228,0.3)' : 'var(--border)'}`, background: filter === f.value ? 'rgba(196,240,228,0.1)' : 'transparent', color: filter === f.value ? 'var(--accent)' : 'var(--fg-3)', fontSize: 12, cursor: 'pointer', fontWeight: filter === f.value ? 600 : 400 }}>
              {f.label}
            </button>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 4 }}>
          {(['today', 'week', 'all'] as const).map(df => (
            <button key={df} onClick={() => setDateFilter(df)}
              style={{ padding: '6px 10px', borderRadius: 7, border: `1px solid ${dateFilter === df ? 'rgba(201,169,110,0.3)' : 'var(--border)'}`, background: dateFilter === df ? 'var(--gold-dim)' : 'transparent', color: dateFilter === df ? 'var(--gold)' : 'var(--fg-3)', fontSize: 11, cursor: 'pointer', fontWeight: dateFilter === df ? 600 : 400 }}>
              {df === 'today' ? 'Azi' : df === 'week' ? '7 zile' : 'Tot'}
            </button>
          ))}
        </div>
      </div>

      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 16, overflow: 'hidden' }}>
        {paged.length === 0 ? (
          <div style={{ padding: '48px 24px', textAlign: 'center', color: 'var(--fg-3)', fontSize: 14 }}>Nicio activitate găsită.</div>
        ) : (
          <>
            {paged.map((ev, i) => {
              const cfg = TYPE_CONFIG[ev.type] || TYPE_CONFIG.login;
              return (
                <motion.div key={ev.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: Math.min(i * 0.02, 0.3) }}
                  style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 20px', borderBottom: i < paged.length - 1 ? '1px solid var(--border)' : 'none' }}>
                  <div style={{ width: 30, height: 30, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', background: cfg.bg, color: cfg.color, flexShrink: 0 }}>{cfg.icon}</div>
                  <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'linear-gradient(135deg, #1A5C38, #0f3d22)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, color: '#C4F0E4', flexShrink: 0 }}>
                    {(ev.userName || ev.userEmail).charAt(0).toUpperCase()}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, color: 'var(--fg)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ev.label}</div>
                    <div style={{ fontSize: 11, color: 'var(--fg-3)', marginTop: 2 }}>
                      {ev.userEmail}
                      {ev.data?.lessonTitle && <span style={{ marginLeft: 8, color: 'var(--accent)' }}>· {ev.data.lessonTitle}</span>}
                    </div>
                  </div>
                  <span style={{ fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 99, background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.color}30`, flexShrink: 0 }}>{cfg.label}</span>
                  <div style={{ fontSize: 11, color: 'var(--fg-3)', flexShrink: 0, minWidth: 70, textAlign: 'right' }}>{timeAgo(ev.timestamp)}</div>
                </motion.div>
              );
            })}
            {filtered.length > paged.length && (
              <div style={{ padding: 16, textAlign: 'center' }}>
                <button onClick={() => setPage(p => p + 1)} style={{ padding: '8px 20px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', borderRadius: 8, cursor: 'pointer', fontSize: 13, color: 'var(--fg-2)' }}>
                  Arată mai mult ({filtered.length - paged.length} rămase)
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
