// @ts-nocheck
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from '@/lib/router-compat';
import { motion } from 'framer-motion';
import {
  Users, BookOpen, Award, Activity, Bell, Check, Trash2,
  LogIn, CheckCircle, FileText, UserPlus, Pencil,
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { TariffBadge } from '../../components/aa/TariffBadge';
import { ProgressBar } from '../../components/aa/ProgressBar';
import { getActivity, ActivityEvent, timeAgo, ActivityType } from '../../lib/activity';
import { fetchAdminUsers, fetchAllProgress, AdminUserRow, AdminProgressRow } from '../../lib/adminData';

function ActivityIcon({ type }: { type: ActivityType }) {
  const size = 13;
  switch (type) {
    case 'login': return <LogIn size={size} style={{ color: '#86efac' }} />;
    case 'lesson_complete': return <CheckCircle size={size} style={{ color: 'var(--accent)' }} />;
    case 'note_saved': return <FileText size={size} style={{ color: '#93c5fd' }} />;
    case 'quiz_complete': return <Award size={size} style={{ color: '#fbbf24' }} />;
    case 'platform_register': return <UserPlus size={size} style={{ color: 'var(--fg-3)' }} />;
    case 'exercise_complete': return <Pencil size={size} style={{ color: '#fb923c' }} />;
    default: return <div style={{ width: size, height: size, borderRadius: '50%', background: 'var(--border)' }} />;
  }
}

export const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState<AdminUserRow[]>([]);
  const [progress, setProgress] = useState<AdminProgressRow[]>([]);
  const [activity, setActivity] = useState<ActivityEvent[]>([]);
  const [totalLessons, setTotalLessons] = useState(0);
  const [quizCount, setQuizCount] = useState(0);
  const [whitelistCount, setWhitelistCount] = useState(0);

  const [notifMessage, setNotifMessage] = useState('');
  const [notifType, setNotifType] = useState<'info' | 'success' | 'warning'>('info');
  const [notifPublished, setNotifPublished] = useState(false);
  const [currentNotif, setCurrentNotif] = useState<{ message: string; type: string } | null>(() => {
    try { const raw = localStorage.getItem('aa_notification'); return raw ? JSON.parse(raw) : null; } catch { return null; }
  });

  const [newEmail, setNewEmail] = useState('');
  const [addedEmail, setAddedEmail] = useState(false);

  const loadData = useCallback(async () => {
    const [u, p, a, lessonsRes, wlRes] = await Promise.all([
      fetchAdminUsers(),
      fetchAllProgress(),
      getActivity(200),
      supabase.from('lessons').select('id', { count: 'exact', head: true }),
      supabase.from('whitelist').select('email', { count: 'exact', head: true }),
    ]);
    setUsers(u);
    setProgress(p);
    setActivity(a);
    setTotalLessons(lessonsRes.count || 0);
    setQuizCount(u.filter(x => x.quiz_done).length);
    setWhitelistCount(wlRes.count || 0);
  }, []);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, [loadData]);

  const todayStr = new Date().toDateString();
  const activeToday = new Set(
    activity.filter(e => new Date(e.timestamp).toDateString() === todayStr).map(e => e.userId)
  ).size;
  const totalCompletions = progress.length;
  const quizPct = users.length > 0 ? Math.round((quizCount / users.length) * 100) : 0;

  const stats = [
    { icon: <Users size={18} />, label: 'Studenți înregistrați', value: String(users.length), accent: 'var(--accent)' },
    { icon: <BookOpen size={18} />, label: 'Lecții completate total', value: String(totalCompletions), accent: 'var(--gold)' },
    { icon: <Award size={18} />, label: 'Quiz-uri finalizate', value: `${quizCount} (${quizPct}%)`, accent: '#fbbf24' },
    { icon: <Activity size={18} />, label: 'Activi azi', value: String(activeToday), accent: '#86efac' },
  ];

  const recentActivity = activity.slice(0, 30);

  const getUserPct = (userId: string) => {
    const done = progress.filter(p => p.user_id === userId).length;
    return totalLessons > 0 ? Math.round((done / totalLessons) * 100) : 0;
  };

  const lastActive = (userId: string) => {
    const last = activity.find(e => e.userId === userId);
    return last ? timeAgo(last.timestamp) : '—';
  };

  const handlePublishNotif = () => {
    if (!notifMessage.trim()) return;
    const data = { message: notifMessage.trim(), type: notifType, exp: Date.now() + 7 * 24 * 60 * 60 * 1000 };
    localStorage.setItem('aa_notification', JSON.stringify(data));
    setCurrentNotif(data);
    setNotifPublished(true);
    setTimeout(() => setNotifPublished(false), 2000);
  };

  const handleDeleteNotif = () => {
    localStorage.removeItem('aa_notification');
    sessionStorage.removeItem('aa_notification_dismissed');
    setCurrentNotif(null);
    setNotifMessage('');
  };

  const handleAddWhitelist = async () => {
    const email = newEmail.trim().toLowerCase();
    if (!email) return;
    const { error } = await supabase.from('whitelist').insert({ email, tariff: 'student' });
    if (error) return;
    setNewEmail('');
    setAddedEmail(true);
    setTimeout(() => setAddedEmail(false), 2000);
    loadData();
  };

  const cardStyle: React.CSSProperties = {
    background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 14, padding: 20,
  };

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 24px' }}>
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 28 }}>
        <h1 className="font-aboreto" style={{ fontSize: 28, color: 'var(--fg)', marginBottom: 4 }}>Prezentare Generală</h1>
        <p style={{ fontSize: 13, color: 'var(--fg-3)' }}>Statusul platformei în timp real · actualizare automată la 30s</p>
      </motion.div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4" style={{ marginBottom: 28 }}>
        {stats.map((stat, i) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} style={cardStyle}>
            <div style={{ color: stat.accent, marginBottom: 12 }}>{stat.icon}</div>
            <div style={{ fontSize: 26, fontWeight: 700, color: 'var(--fg)', lineHeight: 1, marginBottom: 6 }}>{stat.value}</div>
            <div style={{ fontSize: 11, color: 'var(--fg-3)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{stat.label}</div>
          </motion.div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', marginBottom: 20 }}>
        {/* Students list */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          style={{ ...cardStyle, flex: '1 1 280px', minWidth: 280, maxWidth: 380 }}>
          <div className="font-aboreto" style={{ fontSize: 10, letterSpacing: '0.12em', color: 'var(--fg-3)', textTransform: 'uppercase', marginBottom: 16 }}>
            Studenți ({users.length})
          </div>
          {users.length === 0 ? (
            <p style={{ fontSize: 13, color: 'var(--fg-3)', textAlign: 'center', padding: '20px 0' }}>Niciun student.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2, maxHeight: 480, overflowY: 'auto' }}>
              {users.map(u => {
                const pct = getUserPct(u.id);
                return (
                  <div key={u.id}
                    onClick={() => navigate(`/admin/student/${u.id}`)}
                    style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 8px', borderRadius: 10, cursor: 'pointer' }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-3)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                  >
                    <div style={{ width: 34, height: 34, borderRadius: '50%', flexShrink: 0, background: 'linear-gradient(135deg, #4ade80 0%, #22c55e 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: '#0D0907' }}>
                      {u.full_name?.charAt(0)?.toUpperCase() || 'U'}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 3 }}>
                        <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--fg)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 140 }}>
                          {u.full_name || u.email}
                        </p>
                        <TariffBadge tariff={u.tariff} compact />
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                        <ProgressBar value={pct} height={3} className="flex-1" />
                        <span style={{ fontSize: 10, color: 'var(--fg-3)', flexShrink: 0, minWidth: 28 }}>{pct}%</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 2 }}>
                        <span style={{ fontSize: 10, color: 'var(--fg-3)' }}>{lastActive(u.id)}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </motion.div>

        {/* Activity feed */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
          style={{ ...cardStyle, flex: '2 1 360px', minWidth: 300 }}>
          <div className="font-aboreto" style={{ fontSize: 10, letterSpacing: '0.12em', color: 'var(--fg-3)', textTransform: 'uppercase', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#4ade80', display: 'inline-block', boxShadow: '0 0 6px #4ade80' }} />
            Feed activitate live
          </div>
          {recentActivity.length === 0 ? (
            <p style={{ fontSize: 13, color: 'var(--fg-3)', textAlign: 'center', padding: '24px 0' }}>Nicio activitate înregistrată.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 0, maxHeight: 480, overflowY: 'auto' }}>
              {recentActivity.map((ev, idx) => (
                <div key={ev.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '9px 0', borderBottom: idx < recentActivity.length - 1 ? '1px solid var(--border)' : 'none' }}>
                  <div style={{ width: 26, height: 26, borderRadius: '50%', flexShrink: 0, background: 'var(--bg-3)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: 1 }}>
                    <ActivityIcon type={ev.type} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 12, color: 'var(--fg)', lineHeight: 1.4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {ev.label}
                    </p>
                    <div style={{ display: 'flex', gap: 8, marginTop: 2, alignItems: 'center' }}>
                      <span style={{ fontSize: 10, color: 'var(--fg-3)' }}>{timeAgo(ev.timestamp)}</span>
                      <span style={{ fontSize: 10, color: 'var(--fg-3)' }}>{ev.userEmail}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>

      {/* Quick whitelist */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.28 }} style={{ ...cardStyle, marginBottom: 20 }}>
        <div className="font-aboreto" style={{ fontSize: 10, letterSpacing: '0.12em', color: 'var(--fg-3)', textTransform: 'uppercase', marginBottom: 12 }}>
          Acces rapid — adaugă email în whitelist ({whitelistCount} total)
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <input type="email" value={newEmail} onChange={e => setNewEmail(e.target.value)} placeholder="email@exemplu.ro"
            onKeyDown={e => e.key === 'Enter' && handleAddWhitelist()}
            style={{ flex: 1, padding: '8px 12px', fontSize: 13, background: 'var(--bg-3)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--fg)' }} />
          <button onClick={handleAddWhitelist}
            style={{ padding: '8px 16px', background: addedEmail ? 'rgba(74,222,128,0.15)' : 'var(--accent)', color: addedEmail ? '#4ade80' : '#0D0907', border: addedEmail ? '1px solid rgba(74,222,128,0.3)' : 'none', borderRadius: 8, cursor: 'pointer', fontSize: 12, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 }}>
            {addedEmail ? <><Check size={13} /> Adăugat</> : '+ Adaugă'}
          </button>
        </div>
      </motion.div>

      {/* Notification */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} style={cardStyle}>
        <div className="font-aboreto" style={{ fontSize: 10, letterSpacing: '0.12em', color: 'var(--fg-3)', textTransform: 'uppercase', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
          <Bell size={13} style={{ color: 'var(--gold)' }} /> Trimite notificare
        </div>
        {currentNotif && (
          <div style={{ padding: '10px 14px', background: 'rgba(201,169,110,0.1)', border: '1px solid rgba(201,169,110,0.25)', borderRadius: 8, marginBottom: 16, fontSize: 12, color: 'var(--gold)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
            <span>Notificare activă: "{currentNotif.message}"</span>
            <button onClick={handleDeleteNotif} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#f87171', padding: 2, display: 'flex' }}>
              <Trash2 size={13} />
            </button>
          </div>
        )}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <textarea value={notifMessage} onChange={e => setNotifMessage(e.target.value)} placeholder="Mesajul notificării..." rows={2}
            style={{ width: '100%', padding: '9px 12px', fontSize: 13, background: 'var(--bg-3)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--fg)', resize: 'vertical', boxSizing: 'border-box' }} />
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
            <span style={{ fontSize: 12, color: 'var(--fg-3)' }}>Tip:</span>
            {(['info', 'success', 'warning'] as const).map(t => (
              <button key={t} onClick={() => setNotifType(t)}
                style={{ padding: '5px 12px', borderRadius: 7, fontSize: 12, cursor: 'pointer', background: notifType === t ? 'var(--gold-dim)' : 'transparent', border: `1px solid ${notifType === t ? 'var(--gold)' : 'var(--border)'}`, color: notifType === t ? 'var(--gold)' : 'var(--fg-3)', fontWeight: notifType === t ? 600 : 400 }}>
                {t === 'info' ? 'Info' : t === 'success' ? 'Succes' : 'Atenție'}
              </button>
            ))}
            <button onClick={handlePublishNotif}
              style={{ marginLeft: 'auto', padding: '7px 16px', background: notifPublished ? 'rgba(74,222,128,0.15)' : 'var(--gold)', color: notifPublished ? '#4ade80' : '#0D0907', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 12, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}>
              {notifPublished ? <><Check size={13} /> Publicat</> : 'Publică'}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
