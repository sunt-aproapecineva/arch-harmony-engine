import React, { useState, useRef, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Sun, Moon, Menu, PanelLeftClose, PanelLeftOpen, ChevronDown, LogOut, ShieldCheck, Search } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useAuthContext } from '../../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { SearchModal } from '../ui/SearchModal';
import { TariffBadge } from '../ui/TariffBadge';
import { Tariff } from '../../lib/types';

interface HeaderProps { onMenuToggle?: () => void; sidebarOpen?: boolean; }

export const Header: React.FC<HeaderProps> = ({ onMenuToggle, sidebarOpen }) => {
  const { theme, toggleTheme } = useTheme();
  const { user, logout, isAdmin } = useAuthContext();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const initial = (user?.full_name || user?.email || 'U').charAt(0).toUpperCase();
  const tariff = (user?.tariff || 'student') as Tariff;

  useEffect(() => {
    const fn = (e: MouseEvent) => { if (!ref.current?.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('mousedown', fn);
    return () => document.removeEventListener('mousedown', fn);
  }, []);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(v => !v);
      }
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, []);

  const navStyle = (isActive: boolean, isGold = false): React.CSSProperties => ({
    padding: '5px 12px', borderRadius: 7, fontSize: 13, fontWeight: 500, cursor: 'pointer',
    color: isActive ? (isGold ? 'var(--gold)' : 'var(--accent)') : 'var(--fg-2)',
    background: isActive ? (isGold ? 'var(--gold-dim)' : 'var(--accent-dim)') : 'transparent',
    border: isActive ? `1px solid ${isGold ? 'rgba(201,169,110,0.2)' : 'rgba(196,240,228,0.15)'}` : '1px solid transparent',
    transition: 'all 0.15s', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6,
  });

  return (
    <>
    <header style={{
      height: 52, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 20px', background: 'var(--header-bg)', backdropFilter: 'blur(20px)',
      borderBottom: '1px solid var(--border)', position: 'sticky', top: 0, zIndex: 30, flexShrink: 0,
    }}>
      {/* Sidebar toggle — always visible */}
      <button
        onClick={onMenuToggle}
        style={{
          background: 'none', border: '1px solid var(--border)', borderRadius: 7,
          cursor: 'pointer', color: 'var(--fg-2)', display: 'flex', alignItems: 'center',
          padding: '5px 7px', marginRight: 8, transition: 'all 0.15s',
        }}
        onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--border-hi)'; e.currentTarget.style.color = 'var(--fg)'; }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--fg-2)'; }}
        title={sidebarOpen ? 'Ascunde meniu' : 'Arată meniu'}
      >
        {sidebarOpen ? <PanelLeftClose size={16} /> : <PanelLeftOpen size={16} />}
      </button>

      {/* Nav links */}
      <nav style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        <NavLink to="/dashboard" style={({ isActive }) => navStyle(isActive)}>Dashboard</NavLink>
        <NavLink to="/module/mod-0" style={({ isActive }) => navStyle(isActive)}>Programă</NavLink>
        {isAdmin && (
          <NavLink to="/admin" style={({ isActive }) => navStyle(isActive, true)}>
            <ShieldCheck size={13} />Admin
          </NavLink>
        )}
      </nav>

      {/* Right side */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        {/* Search button */}
        <button
          onClick={() => setSearchOpen(true)}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            background: 'none', border: '1px solid var(--border)', cursor: 'pointer',
            color: 'var(--fg-3)', padding: '5px 10px', borderRadius: 7,
            fontSize: 11, transition: 'all 0.15s',
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--border-hi)'; e.currentTarget.style.color = 'var(--fg)'; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--fg-3)'; }}
          title="Caută (⌘K)"
        >
          <Search size={13} />
          <kbd style={{ fontSize: 9, fontFamily: 'monospace', opacity: 0.6 }}>⌘K</kbd>
        </button>

        <button
          onClick={toggleTheme}
          style={{ background: 'none', border: '1px solid var(--border)', cursor: 'pointer', color: 'var(--fg-2)', padding: '5px 8px', borderRadius: 7, display: 'flex', alignItems: 'center', transition: 'all 0.15s' }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--border-hi)'; e.currentTarget.style.color = 'var(--fg)'; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--fg-2)'; }}
        >
          {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
        </button>

        {/* Avatar dropdown */}
        <div style={{ position: 'relative' }} ref={ref}>
          <button
            onClick={() => setOpen(v => !v)}
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4px 8px 4px 4px', borderRadius: 8, border: '1px solid var(--border)', background: 'none', cursor: 'pointer', transition: 'all 0.15s' }}
            onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border-hi)'}
            onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border)'}
          >
            <div style={{ width: 26, height: 26, borderRadius: '50%', background: 'linear-gradient(135deg, #1A5C38, #0f3d22)', color: '#C4F0E4', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700 }}>
              {initial}
            </div>
            <span style={{ fontSize: 13, color: 'var(--fg)', maxWidth: 100, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {user?.full_name?.split(' ')[0] || 'User'}
            </span>
            <ChevronDown size={13} style={{ color: 'var(--fg-3)', transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
          </button>

          <AnimatePresence>
            {open && (
              <motion.div
                initial={{ opacity: 0, y: -6, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -6, scale: 0.96 }}
                transition={{ duration: 0.12 }}
                style={{ position: 'absolute', right: 0, top: '100%', marginTop: 6, width: 220, borderRadius: 12, overflow: 'hidden', background: 'var(--bg-3)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-lg)', zIndex: 50 }}
              >
                <div style={{ padding: '12px 14px 10px', borderBottom: '1px solid var(--border)' }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--fg)' }}>{user?.full_name || 'User'}</div>
                  <div style={{ fontSize: 11, color: 'var(--fg-3)', marginTop: 2, marginBottom: 8 }}>{user?.email}</div>
                  <TariffBadge tariff={tariff} compact />
                </div>
                <div style={{ padding: 6 }}>
                  {isAdmin && (
                    <Link
                      to="/admin"
                      onClick={() => setOpen(false)}
                      style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 10px', borderRadius: 7, fontSize: 13, color: 'var(--gold)', cursor: 'pointer', transition: 'background 0.15s', background: 'transparent' }}
                      onMouseEnter={e => (e.currentTarget as HTMLAnchorElement).style.background = 'var(--gold-dim)'}
                      onMouseLeave={e => (e.currentTarget as HTMLAnchorElement).style.background = 'transparent'}
                    >
                      <ShieldCheck size={14} /> Panou Admin
                    </Link>
                  )}
                  <button
                    onClick={async () => { setOpen(false); await logout(); navigate('/login'); }}
                    style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 10px', borderRadius: 7, width: '100%', background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, color: '#f87171', transition: 'background 0.15s', textAlign: 'left' }}
                    onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.background = 'rgba(248,113,113,0.1)'}
                    onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.background = 'transparent'}
                  >
                    <LogOut size={14} /> Deconectare
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>

    <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />
  </>
  );
};
