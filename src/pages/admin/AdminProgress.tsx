import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Download, ArrowUpDown, Trophy } from 'lucide-react';
import { useNavigate } from '@/lib/router-compat';
import { MockUser, Progress, Tariff } from '../../lib/types';
import { MODULES } from '../../lib/data';

function getStoredUsers(): MockUser[] {
  try { const s = localStorage.getItem('aa_users'); return s ? JSON.parse(s) : []; } catch { return []; }
}
function getStoredProgress(): Progress[] {
  try { const s = localStorage.getItem('aa_progress'); return s ? JSON.parse(s) : []; } catch { return []; }
}

interface CellPopoverProps {
  userName: string;
  moduleName: string;
  lessons: { title: string; completed: boolean; completedAt?: string }[];
  onClose: () => void;
  anchorRef: React.RefObject<HTMLDivElement | null>;
}

const CellPopover: React.FC<CellPopoverProps> = ({ userName, moduleName, lessons, onClose }) => (
  <motion.div
    style={{ position: 'fixed', inset: 0, zIndex: 50 }}
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    onClick={onClose}
  >
    <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)' }} />
    <motion.div
      initial={{ scale: 0.95, y: 16 }}
      animate={{ scale: 1, y: 0 }}
      exit={{ scale: 0.95, y: 16 }}
      style={{
        position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
        background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 16,
        padding: 24, width: '90%', maxWidth: 420, zIndex: 51,
      }}
      onClick={e => e.stopPropagation()}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
        <div>
          <div style={{ fontSize: 11, color: 'var(--fg-3)', marginBottom: 4 }}>{userName}</div>
          <h3 className="font-aboreto" style={{ fontSize: 16, color: 'var(--fg)', letterSpacing: '-0.01em' }}>{moduleName}</h3>
        </div>
        <button onClick={onClose} style={{ padding: 6, background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', borderRadius: 8, cursor: 'pointer', color: 'var(--fg-3)', display: 'flex', alignItems: 'center' }}>
          <X size={14} />
        </button>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {lessons.map((l, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', flexShrink: 0, background: l.completed ? '#4ade80' : 'var(--border)' }} />
            <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: l.completed ? 'var(--fg)' : 'var(--fg-3)' }}>{l.title}</span>
            {l.completed && l.completedAt && (
              <span style={{ fontSize: 11, color: 'var(--fg-3)', flexShrink: 0 }}>
                {new Date(l.completedAt).toLocaleDateString('ro-RO', { month: 'short', day: 'numeric' })}
              </span>
            )}
          </div>
        ))}
      </div>
    </motion.div>
  </motion.div>
);

type SortKey = 'name' | 'progress' | 'lastActive';
type FilterKey = 'all' | Tariff | 'low' | 'mid' | 'high';

export const AdminProgress: React.FC = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState<MockUser[]>([]);
  const [progress, setProgress] = useState<Progress[]>([]);
  const [modal, setModal] = useState<{ userId: string; moduleId: string } | null>(null);
  const [sortKey, setSortKey] = useState<SortKey>('progress');
  const [filterKey, setFilterKey] = useState<FilterKey>('all');
  const popoverRef = useRef<HTMLDivElement | null>(null);

  const totalLessons = MODULES.flatMap(m => m.lessons).length;

  useEffect(() => {
    setUsers(getStoredUsers());
    setProgress(getStoredProgress());
  }, []);

  const getUserModulePct = (userId: string, moduleId: string) => {
    const mod = MODULES.find(m => m.id === moduleId);
    if (!mod || mod.lessons.length === 0) return 0;
    const done = mod.lessons.filter(l => progress.some(p => p.user_id === userId && p.lesson_id === l.id)).length;
    return Math.round((done / mod.lessons.length) * 100);
  };

  const getUserOverallPct = (userId: string) => {
    const done = progress.filter(p => p.user_id === userId).length;
    return totalLessons > 0 ? Math.round((done / totalLessons) * 100) : 0;
  };

  const getLastActive = (userId: string) => {
    const userProg = progress.filter(p => p.user_id === userId);
    if (!userProg.length) return '';
    return userProg.sort((a, b) => new Date(b.completed_at).getTime() - new Date(a.completed_at).getTime())[0].completed_at;
  };

  const avgProgress = users.length > 0 ? Math.round(users.reduce((s, u) => s + getUserOverallPct(u.id), 0) / users.length) : 0;
  const totalCompletions = progress.length;

  const filteredUsers = users.filter(u => {
    if (filterKey === 'all') return true;
    if (filterKey === 'low') return getUserOverallPct(u.id) < 30;
    if (filterKey === 'mid') { const p = getUserOverallPct(u.id); return p >= 30 && p < 80; }
    if (filterKey === 'high') return getUserOverallPct(u.id) >= 80;
    return (u.tariff || 'student') === filterKey;
  });

  const sortedUsers = [...filteredUsers].sort((a, b) => {
    if (sortKey === 'name') return (a.full_name || a.email).localeCompare(b.full_name || b.email);
    if (sortKey === 'lastActive') return (getLastActive(b.id) || '').localeCompare(getLastActive(a.id) || '');
    return getUserOverallPct(b.id) - getUserOverallPct(a.id);
  });

  const cellStyle = (pct: number): { background: string; color: string } => {
    if (pct === 0) return { background: 'rgba(255,255,255,0.04)', color: 'var(--fg-3)' };
    if (pct === 100) return { background: 'rgba(74,222,128,0.15)', color: '#4ade80' };
    return { background: 'rgba(201,169,110,0.15)', color: 'var(--gold)' };
  };

  const getModalData = () => {
    if (!modal) return null;
    const user = users.find(u => u.id === modal.userId);
    const mod = MODULES.find(m => m.id === modal.moduleId);
    if (!user || !mod) return null;
    return {
      userName: user.full_name || user.email,
      moduleName: `${mod.etapa} — ${mod.title}`,
      lessons: mod.lessons.map(l => {
        const done = progress.find(p => p.user_id === modal.userId && p.lesson_id === l.id);
        return { title: l.title, completed: !!done, completedAt: done?.completed_at };
      }),
    };
  };

  // Per-module avg completion
  const moduleAvgs = MODULES.map(mod => {
    if (users.length === 0) return 0;
    return Math.round(users.reduce((s, u) => s + getUserModulePct(u.id, mod.id), 0) / users.length);
  });

  const exportCSV = () => {
    const headers = ['Email', 'Nume', 'Rol', 'Data înregistrării', ...MODULES.map(m => m.title), 'Total lecții completate', '% progres'];
    const rows = users.map(user => {
      const moduleProgress = MODULES.map(m => getUserModulePct(user.id, m.id) + '%');
      const completedCount = progress.filter(p => p.user_id === user.id).length;
      const overallPct = getUserOverallPct(user.id);
      return [user.email, user.full_name, user.role, user.created_at, ...moduleProgress, String(completedCount), overallPct + '%'];
    });
    const csv = [headers, ...rows].map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `progres_studenti_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const modalData = getModalData();

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 28 }}>
        <div>
          <h1 className="font-aboreto" style={{ fontSize: 22, color: 'var(--fg)', letterSpacing: '-0.01em', marginBottom: 4 }}>Progres Studenți</h1>
          <p style={{ fontSize: 13, color: 'var(--fg-3)' }}>Vizualizare globală a progresului per modul</p>
        </div>
        <button
          onClick={exportCSV}
          style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '9px 20px', background: 'var(--gold-dim)', border: '1px solid rgba(201,169,110,0.3)', borderRadius: 10, cursor: 'pointer', fontSize: 13, fontWeight: 700, color: 'var(--gold)', transition: 'background 0.15s' }}
          onMouseEnter={e => (e.currentTarget.style.background = 'rgba(201,169,110,0.2)')}
          onMouseLeave={e => (e.currentTarget.style.background = 'var(--gold-dim)')}
        >
          <Download size={15} /> Export CSV
        </button>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 24 }}>
        {[
          { label: 'Progres mediu', value: `${avgProgress}%`, color: 'var(--accent)' },
          { label: 'Total completări', value: totalCompletions, color: '#4ade80' },
          { label: 'Studenți activi', value: users.filter(u => getUserOverallPct(u.id) > 0).length, color: '#a78bfa' },
        ].map(({ label, value, color }) => (
          <div key={label} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 14, padding: '18px 20px' }}>
            <div style={{ fontSize: 28, fontWeight: 700, color, lineHeight: 1, letterSpacing: '-0.02em', marginBottom: 6 }}>{value}</div>
            <div style={{ fontSize: 11, color: 'var(--fg-3)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Leaderboard */}
      {sortedUsers.length > 0 && (
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 14, padding: '18px 20px', marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11, fontWeight: 700, color: 'var(--fg-3)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 14 }}>
            <Trophy size={13} style={{ color: 'var(--gold)' }} /> Clasament
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[...users].sort((a, b) => getUserOverallPct(b.id) - getUserOverallPct(a.id)).slice(0, 5).map((user, idx) => {
              const pct = getUserOverallPct(user.id);
              return (
                <div key={user.id} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span className="font-aboreto" style={{ width: 20, textAlign: 'center', fontSize: 12, color: idx === 0 ? 'var(--gold)' : 'var(--fg-3)', flexShrink: 0 }}>{idx + 1}</span>
                  <div style={{ width: 26, height: 26, borderRadius: '50%', background: 'linear-gradient(135deg, #1A5C38, #0f3d22)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, color: '#C4F0E4', flexShrink: 0 }}>
                    {user.full_name?.charAt(0)?.toUpperCase() || 'U'}
                  </div>
                  <span style={{ flex: 1, fontSize: 13, color: 'var(--fg)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.full_name || user.email}</span>
                  <div style={{ width: 100, height: 4, background: 'rgba(255,255,255,0.06)', borderRadius: 2, overflow: 'hidden' }}>
                    <div style={{ width: `${pct}%`, height: '100%', background: pct === 100 ? '#4ade80' : 'var(--accent)', borderRadius: 2 }} />
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--fg)', minWidth: 36, textAlign: 'right' }}>{pct}%</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Filters + sort */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 14, flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {([
            { k: 'all', l: 'Toți' }, { k: 'student', l: 'Student' }, { k: 'designer', l: 'Designer' }, { k: 'arhitect', l: 'Arhitect' },
            { k: 'low', l: '< 30%' }, { k: 'mid', l: '30–80%' }, { k: 'high', l: '≥ 80%' },
          ] as { k: FilterKey; l: string }[]).map(({ k, l }) => (
            <button key={k} onClick={() => setFilterKey(k)}
              style={{ padding: '5px 11px', borderRadius: 7, border: `1px solid ${filterKey === k ? 'rgba(196,240,228,0.3)' : 'var(--border)'}`, background: filterKey === k ? 'rgba(196,240,228,0.1)' : 'transparent', color: filterKey === k ? 'var(--accent)' : 'var(--fg-3)', fontSize: 11, cursor: 'pointer', fontWeight: filterKey === k ? 600 : 400, transition: 'all 0.15s' }}>
              {l}
            </button>
          ))}
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 6 }}>
          {([['name', 'Nume'], ['progress', 'Progres'], ['lastActive', 'Ultima activitate']] as [SortKey, string][]).map(([k, l]) => (
            <button key={k} onClick={() => setSortKey(k)}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '5px 10px', borderRadius: 7, border: `1px solid ${sortKey === k ? 'rgba(201,169,110,0.3)' : 'var(--border)'}`, background: sortKey === k ? 'var(--gold-dim)' : 'transparent', color: sortKey === k ? 'var(--gold)' : 'var(--fg-3)', fontSize: 11, cursor: 'pointer', fontWeight: sortKey === k ? 600 : 400 }}>
              <ArrowUpDown size={10} /> {l}
            </button>
          ))}
        </div>
      </div>

      {/* Progress grid table */}
      {users.length === 0 ? (
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 14, padding: '48px 24px', textAlign: 'center', color: 'var(--fg-3)', fontSize: 14 }}>
          Niciun student înregistrat.
        </div>
      ) : (
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 14, overflow: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                <th style={{ textAlign: 'left', padding: '12px 16px', fontSize: 10, fontWeight: 700, color: 'var(--fg-3)', textTransform: 'uppercase', letterSpacing: '0.07em', minWidth: 160, position: 'sticky', left: 0, background: 'var(--bg-card)', zIndex: 2 }}>
                  Student
                </th>
                {MODULES.map(mod => (
                  <th key={mod.id} style={{ padding: '12px 10px', textAlign: 'center', fontSize: 10, fontWeight: 700, color: 'var(--fg-3)', minWidth: 80 }}>
                    <div className="font-aboreto" style={{ fontSize: 13 }}>{mod.order_index}</div>
                    <div style={{ fontWeight: 400, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 70, margin: '0 auto', fontSize: 10 }}>{mod.title}</div>
                  </th>
                ))}
                <th style={{ padding: '12px 16px', textAlign: 'center', fontSize: 10, fontWeight: 700, color: 'var(--fg-3)', textTransform: 'uppercase', letterSpacing: '0.07em', minWidth: 80 }}>Total</th>
              </tr>
            </thead>
            <tbody>
              {sortedUsers.map(user => {
                const overallPct = getUserOverallPct(user.id);
                return (
                  <tr
                    key={user.id}
                    style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', cursor: 'pointer', transition: 'background 0.15s' }}
                    onClick={() => navigate(`/admin/student/${user.id}`)}
                    onMouseEnter={e => (e.currentTarget as HTMLTableRowElement).style.background = 'rgba(255,255,255,0.025)'}
                    onMouseLeave={e => (e.currentTarget as HTMLTableRowElement).style.background = 'transparent'}
                  >
                    <td style={{ padding: '10px 16px', position: 'sticky', left: 0, background: 'var(--bg-card)', zIndex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ width: 26, height: 26, borderRadius: '50%', background: 'linear-gradient(135deg, #1A5C38, #0f3d22)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, color: '#C4F0E4', flexShrink: 0 }}>
                          {user.full_name?.charAt(0)?.toUpperCase() || 'U'}
                        </div>
                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 120, color: 'var(--fg)' }}>
                          {user.full_name || user.email}
                        </span>
                      </div>
                    </td>
                    {MODULES.map(mod => {
                      const pct = getUserModulePct(user.id, mod.id);
                      const cs = cellStyle(pct);
                      return (
                        <td key={mod.id} style={{ padding: '10px', textAlign: 'center' }}
                          onClick={e => { e.stopPropagation(); setModal({ userId: user.id, moduleId: mod.id }); }}
                        >
                          <div
                            style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', minWidth: 44, padding: '3px 8px', borderRadius: 8, fontSize: 11, fontWeight: 600, background: cs.background, color: cs.color, border: `1px solid ${pct === 0 ? 'rgba(255,255,255,0.06)' : pct === 100 ? 'rgba(74,222,128,0.25)' : 'rgba(201,169,110,0.25)'}`, transition: 'all 0.15s', cursor: 'pointer' }}
                          >
                            {pct === 0 ? '—' : `${pct}%`}
                          </div>
                        </td>
                      );
                    })}
                    <td style={{ padding: '10px 16px', textAlign: 'center' }}>
                      <span style={{ fontSize: 13, fontWeight: 700, color: overallPct === 100 ? '#4ade80' : 'var(--fg)' }}>{overallPct}%</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Per-module stats bars */}
      {users.length > 0 && (
        <div style={{ marginTop: 20, background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 14, padding: '18px 20px' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--fg-3)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 14 }}>Rata medie de completare per modul</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {MODULES.map((mod, i) => (
              <div key={mod.id} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span className="font-aboreto" style={{ width: 20, fontSize: 11, color: 'var(--fg-3)', textAlign: 'right', flexShrink: 0 }}>{mod.order_index}</span>
                <span style={{ fontSize: 12, color: 'var(--fg-2)', minWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flexShrink: 0 }}>{mod.title}</span>
                <div style={{ flex: 1, height: 6, background: 'rgba(255,255,255,0.06)', borderRadius: 3, overflow: 'hidden' }}>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${moduleAvgs[i]}%` }}
                    transition={{ duration: 0.8, delay: i * 0.06, ease: 'easeOut' }}
                    style={{ height: '100%', background: moduleAvgs[i] === 100 ? '#4ade80' : moduleAvgs[i] > 50 ? 'var(--accent)' : 'var(--gold)', borderRadius: 3 }}
                  />
                </div>
                <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--fg)', minWidth: 36, textAlign: 'right', flexShrink: 0 }}>{moduleAvgs[i]}%</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Cell popover */}
      <AnimatePresence>
        {modal && modalData && (
          <CellPopover
            userName={modalData.userName}
            moduleName={modalData.moduleName}
            lessons={modalData.lessons}
            onClose={() => setModal(null)}
            anchorRef={popoverRef}
          />
        )}
      </AnimatePresence>
    </div>
  );
};
