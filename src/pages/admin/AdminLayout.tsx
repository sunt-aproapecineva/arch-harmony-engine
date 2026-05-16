// @ts-nocheck
import React from 'react';
import { NavLink, Outlet, Navigate, useNavigate } from '@/lib/router-compat';
import {
  LayoutDashboard, Users, BookOpen, TrendingUp, ShieldCheck, LogOut, Activity,
} from 'lucide-react';
import { useAuthContext } from '../../context/AuthContext';
import { Header } from '../../components/layout/Header';

export const AdminLayout: React.FC = () => {
  const { isAdmin, logout } = useAuthContext();
  const navigate = useNavigate();

  if (!isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  const navItems = [
    { to: '/admin', icon: <LayoutDashboard size={15} />, label: 'Prezentare generală', end: true },
    { to: '/admin/users', icon: <Users size={15} />, label: 'Utilizatori' },
    { to: '/admin/lessons', icon: <BookOpen size={15} />, label: 'Lecții' },
    { to: '/admin/progress', icon: <TrendingUp size={15} />, label: 'Progres' },
    { to: '/admin/activity', icon: <Activity size={15} />, label: 'Activitate' },
  ];

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: 'var(--bg)' }}>
      {/* Admin sidebar */}
      <div style={{ width: 220, flexShrink: 0, height: '100vh', position: 'sticky', top: 0, display: 'flex', flexDirection: 'column', background: 'var(--sidebar-bg)', borderRight: '1px solid var(--border)' }}>
        {/* Brand */}
        <div style={{ padding: '20px 16px 16px', borderBottom: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 32, height: 32, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'var(--gold-dim)', border: '1px solid rgba(201,169,110,0.25)',
            }}>
              <ShieldCheck size={15} style={{ color: 'var(--gold)' }} />
            </div>
            <div>
              <div className="font-aboreto" style={{ fontSize: 10, letterSpacing: '0.12em', color: 'var(--gold)', lineHeight: 1.3 }}>ADMIN</div>
              <div style={{ fontSize: 10, color: 'var(--fg-3)' }}>Panel de control</div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '12px 8px', overflowY: 'auto' }}>
          <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--fg-3)', padding: '4px 8px 8px' }}>
            Secțiuni
          </div>
          {navItems.map(({ to, icon, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              style={({ isActive }) => ({
                display: 'flex', alignItems: 'center', gap: 8, padding: '7px 10px',
                borderRadius: 8, marginBottom: 2, textDecoration: 'none',
                color: isActive ? 'var(--gold)' : 'var(--fg-2)',
                background: isActive ? 'var(--gold-dim)' : 'transparent',
                border: isActive ? '1px solid rgba(201,169,110,0.2)' : '1px solid transparent',
                fontSize: 12, fontWeight: isActive ? 600 : 400,
                transition: 'all 0.15s',
              })}
            >
              {icon}
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        <div style={{ padding: '12px 8px', borderTop: '1px solid var(--border)' }}>
          <NavLink
            to="/dashboard"
            style={({ isActive }) => ({
              display: 'flex', alignItems: 'center', gap: 8, padding: '7px 10px', borderRadius: 8, marginBottom: 4,
              textDecoration: 'none', color: 'var(--fg-3)', fontSize: 12, transition: 'all 0.15s',
              background: 'transparent',
            })}
            onMouseEnter={e => (e.currentTarget.style.color = 'var(--fg)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'var(--fg-3)')}
          >
            <LayoutDashboard size={13} /> Vizualizare student
          </NavLink>
          <button
            onClick={async () => { await logout(); navigate('/login'); }}
            style={{
              display: 'flex', alignItems: 'center', gap: 8, padding: '7px 10px', borderRadius: 8,
              background: 'none', border: 'none', cursor: 'pointer', color: '#f87171', fontSize: 12, width: '100%',
              textAlign: 'left', transition: 'background 0.15s',
            }}
            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(248,113,113,0.1)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'none')}
          >
            <LogOut size={13} /> Deconectare
          </button>
        </div>
      </div>

      {/* Main */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflow: 'hidden' }}>
        <Header />
        <main style={{ flex: 1, overflowY: 'auto', paddingBottom: 40 }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};
