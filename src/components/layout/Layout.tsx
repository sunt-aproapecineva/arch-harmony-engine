import React, { useState, useEffect } from 'react';
import { Outlet, NavLink } from '@/lib/router-compat';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { AnimatePresence, motion } from 'framer-motion';
import { NotificationBanner } from '../aa/NotificationBanner';
import { LayoutDashboard, BookOpen, TrendingUp, ShieldCheck } from 'lucide-react';
import { useAuthContext } from '../../context/AuthContext';

const SIDEBAR_KEY = 'aa_sidebar_open';

export const Layout: React.FC = () => {
  const { isAdmin } = useAuthContext();
  const isMobile = () => window.innerWidth < 768;

  // Desktop: persisted open/closed. Mobile: always starts closed.
  const [desktopOpen, setDesktopOpen] = useState(() => {
    if (typeof window !== 'undefined' && !isMobile()) {
      return localStorage.getItem(SIDEBAR_KEY) !== 'false';
    }
    return true;
  });
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobile, setMobile] = useState(isMobile);

  useEffect(() => {
    const handler = () => setMobile(isMobile());
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);

  const toggleSidebar = () => {
    if (mobile) {
      setMobileOpen(v => !v);
    } else {
      setDesktopOpen(v => {
        const next = !v;
        localStorage.setItem(SIDEBAR_KEY, String(next));
        return next;
      });
    }
  };

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: 'var(--bg)' }}>

      {/* Desktop sidebar — collapsible */}
      {!mobile && (
        <motion.div
          animate={{ width: desktopOpen ? 240 : 0 }}
          transition={{ duration: 0.22, ease: 'easeInOut' }}
          style={{ flexShrink: 0, height: '100vh', overflow: 'hidden', position: 'sticky', top: 0 }}
        >
          <div style={{ width: 240, height: '100%' }}>
            <Sidebar />
          </div>
        </motion.div>
      )}

      {/* Mobile sidebar overlay */}
      {mobile && (
        <AnimatePresence>
          {mobileOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 40 }}
                onClick={() => setMobileOpen(false)}
              />
              <motion.div
                initial={{ x: -260 }} animate={{ x: 0 }} exit={{ x: -260 }}
                transition={{ type: 'spring', damping: 28, stiffness: 280 }}
                style={{ position: 'fixed', left: 0, top: 0, bottom: 0, width: 260, zIndex: 50 }}
              >
                <Sidebar onClose={() => setMobileOpen(false)} />
              </motion.div>
            </>
          )}
        </AnimatePresence>
      )}

      {/* Main area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>
        <NotificationBanner />
        <Header onMenuToggle={toggleSidebar} sidebarOpen={mobile ? mobileOpen : desktopOpen} />
        <main style={{ flex: 1, overflowY: 'auto', paddingBottom: mobile ? 72 : 40 }}>
          <Outlet />
        </main>

        {/* Mobile bottom tab bar */}
        {mobile && (
          <nav style={{
            position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 30,
            display: 'flex', alignItems: 'center',
            background: 'var(--sidebar-bg)', borderTop: '1px solid var(--border)',
            paddingBottom: 'env(safe-area-inset-bottom)',
          }}>
            {[
              { to: '/dashboard', icon: <LayoutDashboard size={20} />, label: 'Acasă' },
              { to: '/module/mod-0', icon: <BookOpen size={20} />, label: 'Lecții' },
              { to: '/dashboard', icon: <TrendingUp size={20} />, label: 'Progres' },
              ...(isAdmin ? [{ to: '/admin', icon: <ShieldCheck size={20} />, label: 'Admin' }] : []),
            ].map(({ to, icon, label }) => (
              <NavLink
                key={`${to}-${label}`}
                to={to}
                style={({ isActive }) => ({
                  flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
                  gap: 3, padding: '10px 0', fontSize: 10, fontWeight: 500,
                  color: isActive ? 'var(--accent)' : 'var(--fg-3)',
                  textDecoration: 'none', transition: 'color 0.15s',
                })}
              >
                {icon}
                <span>{label}</span>
              </NavLink>
            ))}
          </nav>
        )}
      </div>
    </div>
  );
};
