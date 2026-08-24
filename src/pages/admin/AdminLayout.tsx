// @ts-nocheck
// Cadrul panoului de administrare.
//
// Pe desktop: bară laterală fixă. Pe mobil și tabletă îngustă: sertar peste conținut,
// deschis din butonul de meniu al header-ului. Înainte, bara de 220px rămânea fixă
// și pe telefon — pe un ecran de 390px lăsa 114px pentru tabele care au nevoie de 730,
// deci mentorul nu putea deschide cohorta de pe telefon înainte de apel.
import React, { useState } from 'react';
import { NavLink, Outlet, Navigate, useNavigate } from '@/lib/router-compat';
import { AnimatePresence, motion } from 'framer-motion';
import {
  LayoutDashboard, Users, UserCog, BookOpen, TrendingUp, ShieldCheck, LogOut, Activity,
  CalendarRange, ClipboardList,
} from 'lucide-react';
import { useAuthContext } from '../../context/AuthContext';
import { Header } from '../../components/layout/Header';
import { useIsMobile } from '../../hooks/use-mobile';
import { useAdminCourseScope } from '../../hooks/useAdminCourseScope';
import { activeCourses, COURSE_ACCENT } from '../../lib/courses';

const SIDEBAR_WIDTH = 232;

export const AdminLayout: React.FC = () => {
  const { isAdmin, logout } = useAuthContext();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { course, courseId, setCourseId, flows, flowId, setFlowId } = useAdminCourseScope();
  const courses = activeCourses();

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  const navItems = [
    { to: '/admin', icon: <LayoutDashboard size={15} />, label: 'Prezentare generală', end: true },
    { to: '/admin/cohorta', icon: <ClipboardList size={15} />, label: 'Înainte de apel' },
    { to: '/admin/fluxuri', icon: <CalendarRange size={15} />, label: 'Fluxuri' },
    { to: '/admin/grupe', icon: <Users size={15} />, label: 'Grupe' },
    { to: '/admin/users', icon: <UserCog size={15} />, label: 'Utilizatori' },
    { to: '/admin/lessons', icon: <BookOpen size={15} />, label: 'Lecții' },
    { to: '/admin/progress', icon: <TrendingUp size={15} />, label: 'Progres' },
    { to: '/admin/activity', icon: <Activity size={15} />, label: 'Activitate' },
  ];

  const closeDrawer = () => setDrawerOpen(false);

  const sidebar = (
    <div style={{
      width: SIDEBAR_WIDTH, height: '100%', display: 'flex', flexDirection: 'column',
      background: 'var(--sidebar-bg)', borderRight: '1px solid var(--border)',
    }}>
      {/* Brand */}
      <div style={{ padding: '18px 16px 14px', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8, flexShrink: 0, display: 'grid', placeItems: 'center',
            background: 'var(--gold-dim)', border: '1px solid var(--border-hi)',
          }}>
            <ShieldCheck size={15} style={{ color: 'var(--gold)' }} />
          </div>
          <div style={{ minWidth: 0 }}>
            <div className="font-aboreto" style={{ fontSize: 10, letterSpacing: '0.12em', color: 'var(--gold)', lineHeight: 1.3 }}>ADMIN</div>
            <div style={{ fontSize: 10, color: 'var(--fg-3)' }}>Panel de control</div>
          </div>
        </div>
      </div>

      {/* Domeniul privit: program + flux. Tot cockpitul se raportează la ele. */}
      <div style={{ padding: '12px 12px 0', flexShrink: 0 }}>
        {courses.length > 1 && (
          <>
            <span style={labelStyle}>Program</span>
            <div style={{ display: 'flex', gap: 4, marginBottom: 10 }}>
              {courses.map(c => {
                const active = c.id === courseId;
                const accent = COURSE_ACCENT[c.accent];
                return (
                  <button
                    key={c.id}
                    onClick={() => setCourseId(c.id)}
                    aria-pressed={active}
                    style={{
                      flex: 1, minHeight: 32, padding: '5px 8px', borderRadius: 7, cursor: 'pointer',
                      fontSize: 11.5, fontWeight: active ? 600 : 400,
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
          </>
        )}

        {flows.length > 0 && (
          <>
            <span style={labelStyle}>Flux</span>
            <select
              value={flowId || ''}
              onChange={e => setFlowId(e.target.value || null)}
              aria-label="Fluxul privit"
              style={{
                width: '100%', minHeight: 34, padding: '6px 8px', borderRadius: 7, fontSize: 11.5,
                background: 'var(--bg-3)', color: flowId ? 'var(--fg)' : 'var(--fg-3)',
                border: '1px solid var(--border)', cursor: 'pointer',
              }}
            >
              <option value="">Toate fluxurile</option>
              {flows.map(f => (
                <option key={f.id} value={f.id}>
                  {f.name} · start {new Date(f.starts_on).toLocaleDateString('ro-RO', { day: 'numeric', month: 'short', year: '2-digit' })}
                </option>
              ))}
            </select>
          </>
        )}
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '14px 8px', overflowY: 'auto' }}>
        <div style={{ ...labelStyle, padding: '0 8px 8px' }}>Secțiuni</div>
        {navItems.map(({ to, icon, label, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            onClick={closeDrawer}
            style={({ isActive }) => ({
              display: 'flex', alignItems: 'center', gap: 9, padding: '9px 10px',
              minHeight: 40, borderRadius: 8, marginBottom: 2, textDecoration: 'none',
              color: isActive ? 'var(--gold)' : 'var(--fg-2)',
              background: isActive ? 'var(--gold-dim)' : 'transparent',
              border: `1px solid ${isActive ? 'var(--border-hi)' : 'transparent'}`,
              fontSize: 12.5, fontWeight: isActive ? 600 : 400,
              transition: 'all 0.15s',
            })}
          >
            {icon}
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div style={{ padding: '10px 8px', borderTop: '1px solid var(--border)', flexShrink: 0 }}>
        <NavLink
          to="/"
          onClick={closeDrawer}
          style={{
            display: 'flex', alignItems: 'center', gap: 9, padding: '9px 10px', minHeight: 40,
            borderRadius: 8, marginBottom: 4, textDecoration: 'none', color: 'var(--fg-3)',
            fontSize: 12.5, transition: 'color 0.15s',
          }}
          onMouseEnter={e => (e.currentTarget.style.color = 'var(--fg)')}
          onMouseLeave={e => (e.currentTarget.style.color = 'var(--fg-3)')}
        >
          <LayoutDashboard size={14} /> Vizualizare student
        </NavLink>
        <button
          onClick={async () => { closeDrawer(); await logout(); navigate('/login'); }}
          style={{
            display: 'flex', alignItems: 'center', gap: 9, padding: '9px 10px', minHeight: 40,
            borderRadius: 8, background: 'none', border: 'none', cursor: 'pointer',
            color: 'var(--error)', fontSize: 12.5, width: '100%', textAlign: 'left',
            transition: 'background 0.15s',
          }}
          onMouseEnter={e => (e.currentTarget.style.background = 'var(--error-dim)')}
          onMouseLeave={e => (e.currentTarget.style.background = 'none')}
        >
          <LogOut size={14} /> Deconectare
        </button>
      </div>
    </div>
  );

  return (
    <div className="aa-viewport" style={{ display: 'flex', overflow: 'hidden', background: 'var(--bg)' }}>
      {!isMobile && (
        <div className="aa-viewport" style={{ flexShrink: 0, position: 'sticky', top: 0 }}>
          {sidebar}
        </div>
      )}

      {isMobile && (
        <AnimatePresence>
          {drawerOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={closeDrawer}
                style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 40 }}
              />
              <motion.div
                initial={{ x: -SIDEBAR_WIDTH - 20 }} animate={{ x: 0 }} exit={{ x: -SIDEBAR_WIDTH - 20 }}
                transition={{ type: 'spring', damping: 28, stiffness: 280 }}
                style={{ position: 'fixed', left: 0, top: 0, bottom: 0, zIndex: 50 }}
              >
                {sidebar}
              </motion.div>
            </>
          )}
        </AnimatePresence>
      )}

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflow: 'hidden' }}>
        <Header onMenuToggle={() => setDrawerOpen(v => !v)} sidebarOpen={drawerOpen} />
        <main style={{ flex: 1, overflowY: 'auto', paddingBottom: 40 }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

const labelStyle: React.CSSProperties = {
  display: 'block', fontSize: 9.5, fontWeight: 600, letterSpacing: '0.12em',
  textTransform: 'uppercase', color: 'var(--fg-3)', marginBottom: 6,
};
