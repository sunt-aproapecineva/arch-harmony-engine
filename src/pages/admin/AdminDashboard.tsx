// @ts-nocheck
import React, { useEffect, useState } from 'react';
import { Link } from '@/lib/router-compat';
import { motion } from 'framer-motion';
import { Users, BookOpen, Award, TrendingUp, ArrowRight, Shield } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

export const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState({
    users: 0, admins: 0, whitelisted: 0, lessons: 0, modules: 0, completions: 0,
  });
  const [recent, setRecent] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const [u, r, w, l, m, p, recentUsers] = await Promise.all([
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
        supabase.from('user_roles').select('user_id', { count: 'exact', head: true }).eq('role', 'admin'),
        supabase.from('whitelist').select('email', { count: 'exact', head: true }),
        supabase.from('lessons').select('id', { count: 'exact', head: true }),
        supabase.from('modules').select('id', { count: 'exact', head: true }),
        supabase.from('progress').select('id', { count: 'exact', head: true }),
        supabase.from('profiles').select('id,email,full_name,created_at,tariff').order('created_at', { ascending: false }).limit(8),
      ]);
      setStats({
        users: u.count || 0,
        admins: r.count || 0,
        whitelisted: w.count || 0,
        lessons: l.count || 0,
        modules: m.count || 0,
        completions: p.count || 0,
      });
      setRecent(recentUsers.data || []);
      setLoading(false);
    })();
  }, []);

  const cards = [
    { icon: <Users size={16} />, label: 'Utilizatori', value: stats.users, sub: `${stats.admins} admin`, to: '/admin/users', color: 'var(--accent)' },
    { icon: <Shield size={16} />, label: 'Lista de acces', value: stats.whitelisted, sub: 'whitelistați', to: '/admin/users', color: 'var(--gold)' },
    { icon: <BookOpen size={16} />, label: 'Lecții', value: stats.lessons, sub: `${stats.modules} module`, to: '/admin/lessons', color: '#93c5fd' },
    { icon: <Award size={16} />, label: 'Lecții completate', value: stats.completions, sub: 'total', to: '/admin/progress', color: '#a78bfa' },
  ];

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 24px' }}>
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-aboreto" style={{ fontSize: 24, color: 'var(--fg)', marginBottom: 4 }}>Panel Admin</h1>
        <p style={{ fontSize: 13, color: 'var(--fg-3)', marginBottom: 28 }}>Prezentare generală a platformei</p>
      </motion.div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: 14, marginBottom: 28 }}>
        {cards.map((c, i) => (
          <motion.div
            key={c.label}
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
          >
            <Link to={c.to} style={{ display: 'block', textDecoration: 'none' }}>
              <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 14, padding: '18px 20px', transition: 'border-color 0.15s' }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--border-hi)')}
                onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border)')}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                  <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(255,255,255,0.04)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: c.color }}>{c.icon}</div>
                  <ArrowRight size={14} style={{ color: 'var(--fg-3)' }} />
                </div>
                <div style={{ fontSize: 30, fontWeight: 700, color: 'var(--fg)', lineHeight: 1, marginBottom: 4 }}>{loading ? '—' : c.value}</div>
                <div style={{ fontSize: 12, color: 'var(--fg-2)', fontWeight: 500 }}>{c.label}</div>
                <div style={{ fontSize: 11, color: 'var(--fg-3)', marginTop: 2 }}>{c.sub}</div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>

      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 16, overflow: 'hidden' }}>
        <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--fg)' }}>Înregistrări recente</div>
          <Link to="/admin/users" style={{ fontSize: 12, color: 'var(--accent)' }}>Vezi toți →</Link>
        </div>
        {recent.length === 0 ? (
          <div style={{ padding: '32px 20px', textAlign: 'center', color: 'var(--fg-3)', fontSize: 13 }}>
            {loading ? 'Se încarcă...' : 'Niciun utilizator înregistrat încă.'}
          </div>
        ) : recent.map(u => (
          <div key={u.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 20px', borderTop: '1px solid var(--border)' }}>
            <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--bg-3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, color: 'var(--fg-2)' }}>
              {(u.full_name || u.email).slice(0, 1).toUpperCase()}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, color: 'var(--fg)' }}>{u.full_name || '—'}</div>
              <div style={{ fontSize: 11, color: 'var(--fg-3)' }}>{u.email}</div>
            </div>
            <div style={{ fontSize: 11, color: 'var(--fg-3)' }}>{new Date(u.created_at).toLocaleDateString('ro-RO')}</div>
          </div>
        ))}
      </div>
    </div>
  );
};
