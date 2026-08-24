// @ts-nocheck
import React from 'react';
import { NavLink, Outlet, Navigate, useNavigate } from '@/lib/router-compat';
import {
  LayoutDashboard, Users, UserCog, BookOpen, TrendingUp, ShieldCheck, LogOut, Activity, CalendarRange, ClipboardList,
} from 'lucide-react';
import { useAuthContext } from '../../context/AuthContext';
import { Header } from '../../components/layout/Header';
import { useAdminCourseScope } from '../../hooks/useAdminCourseScope';
import { activeCourses, COURSE_ACCENT } from '../../lib/courses';

export const AdminLayout: React.FC = () => {
  const { isAdmin, logout } = useAuthContext();
  const navigate = useNavigate();
  const { course, courseId, setCourseId, flows, flowId, setFlowId } = useAdminCourseScope();
  const courses = activeCourses();

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  const navItems = [
    { to: '/admin', icon: <LayoutDashboard size={15} />, label: 'Prezentare generală', end: true },
    { to: '/admin/flowa', icon: <Users size={15} />, label: 'Flowa' },
    { to: '/admin/fluxuri', icon: <CalendarRange size={15} />, label: 'Fluxuri' },
    { to: '/admin/grupe', icon: <Users size={15} />, label: 'Grupe' },
    { to: '/admin/users', icon: <UserCog size={15} />, label: 'Utilizatori' },
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

        {/* Cursul privit. Tot cockpitul (scoruri, coadă de atenție, briefing, editor de
            conținut) se raportează la ramura selectată aici — un scor combinat între două
            metodologii n-ar spune nimic supervizorului. */}
        {courses.length > 1 && (
          <div style={{ padding: '12px 12px 0' }}>
            <div style={{ fontSize: 9, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--fg-3)', marginBottom: 6 }}>
              Program
            </div>
            <div style={{ display: 'flex', gap: 4 }}>
              {courses.map(c => {
                const active = c.id === courseId;
                const accent = COURSE_ACCENT[c.accent];
                return (
                  <button
                    key={c.id}
                    onClick={() => setCourseId(c.id)}
                    style={{
                      flex: 1, padding: '5px 8px', borderRadius: 7, cursor: 'pointer',
                      fontSize: 11, fontWeight: active ? 600 : 400,
                      color: active ? accent.fg : 'var(--fg-3)',
                      background: active ? accent.dim : 'transparent',
                      border: `1px solid ${active ? 'var(--border-hi)' : 'var(--border)'}`,
                      transition: 'all 0.15s',
                    }}
                  >
                    {c.shortTitle}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Fluxul privit. „Toate" e alegerea implicită — filtrarea contează la
            panourile de lucru cu flowa, nu la administrarea de conținut. */}
        {flows.length > 0 && (
          <div style={{ padding: '10px 12px 0' }}>
            <div style={{ fontSize: 9, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--fg-3)', marginBottom: 6 }}>
              Flux
            </div>
            <select
              value={flowId || ''}
              onChange={e => setFlowId(e.target.value || null)}
              style={{
                width: '100%', padding: '5px 8px', borderRadius: 7, fontSize: 11.5,
                background: 'var(--bg-3)', color: flowId ? 'var(--fg)' : 'var(--fg-3)',
                border: '1px solid var(--border)', cursor: 'pointer', outline: 'none',
              }}
            >
              <option value="">Toate fluxurile</option>
              {flows.map(c => (
                <option key={c.id} value={c.id}>
                  {c.name} · start {new Date(c.starts_on).toLocaleDateString('ro-RO', { day: 'numeric', month: 'short', year: '2-digit' })}
                </option>
              ))}
            </select>
          </div>
        )}

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
            to="/"
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
              background: 'none', border: 'none', cursor: 'pointer', color: 'var(--error)', fontSize: 12, width: '100%',
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
