import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Lock, CheckCircle2, LogOut } from 'lucide-react';
import { MODULES } from '../../lib/data';
import { useProgress } from '../../hooks/useProgress';
import { useAuthContext } from '../../context/AuthContext';
import { TariffBadge } from '../ui/TariffBadge';
import { TelegramButton } from '../ui/TelegramButton';
import { Tariff } from '../../lib/types';

interface SidebarProps {
  onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onClose }) => {
  const { getModuleProgress, isModuleLocked } = useProgress();
  const { user, logout } = useAuthContext();
  const navigate = useNavigate();
  const initial = (user?.full_name || user?.email || 'U').charAt(0).toUpperCase();
  const tariff = (user?.tariff || 'student') as Tariff;

  return (
    <div style={{
      height: '100%', display: 'flex', flexDirection: 'column',
      background: 'var(--sidebar-bg)',
      borderRight: '1px solid var(--border)',
    }}>
      {/* Logo */}
      <div style={{ padding: '20px 16px 16px', borderBottom: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'linear-gradient(135deg, #1A5C38, #0f3d22)',
            boxShadow: '0 2px 8px rgba(26,92,56,0.4)',
          }}>
            <span className="font-aboreto" style={{ fontSize: 11, color: '#C4F0E4', letterSpacing: 1 }}>AA</span>
          </div>
          <div>
            <div className="font-aboreto" style={{ fontSize: 10, letterSpacing: '0.12em', color: 'var(--fg)', lineHeight: 1.3 }}>ARHITECTURA</div>
            <div className="font-aboreto" style={{ fontSize: 10, letterSpacing: '0.12em', color: 'var(--fg-3)', lineHeight: 1.3 }}>AFACERII</div>
          </div>
        </div>
      </div>

      {/* Module nav */}
      <nav style={{ flex: 1, overflowY: 'auto', padding: '12px 8px' }}>
        <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--fg-3)', padding: '4px 8px 8px' }}>
          Curriculum
        </div>
        {MODULES.map((mod, idx) => {
          const progress = getModuleProgress(mod.id);
          const locked = isModuleLocked(idx);
          const done = progress === 100;
          return (
            <NavLink
              key={mod.id}
              to={`/module/${mod.id}`}
              onClick={onClose}
              style={({ isActive }) => ({
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '7px 10px', borderRadius: 8, marginBottom: 2,
                cursor: locked ? 'not-allowed' : 'pointer',
                opacity: locked ? 0.45 : 1,
                pointerEvents: locked ? 'none' : 'auto',
                background: isActive ? 'var(--accent-dim)' : 'transparent',
                border: isActive ? '1px solid rgba(196,240,228,0.18)' : '1px solid transparent',
                transition: 'all 0.15s',
                textDecoration: 'none',
              })}
            >
              {({ isActive }) => (
                <>
                  <div style={{
                    width: 22, height: 22, borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                    background: done ? 'rgba(74,222,128,0.15)' : isActive ? 'var(--accent-dim)' : 'var(--bg-3)',
                    border: `1px solid ${done ? 'rgba(74,222,128,0.3)' : isActive ? 'rgba(196,240,228,0.25)' : 'var(--border)'}`,
                  }}>
                    {locked ? (
                      <Lock size={10} style={{ color: 'var(--fg-3)' }} />
                    ) : done ? (
                      <CheckCircle2 size={11} style={{ color: '#4ade80' }} />
                    ) : (
                      <span className="font-aboreto" style={{ fontSize: 9, color: isActive ? 'var(--accent)' : 'var(--fg-3)', lineHeight: 1 }}>
                        {idx}
                      </span>
                    )}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12, fontWeight: isActive ? 600 : 400, color: isActive ? 'var(--fg)' : 'var(--fg-2)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {mod.title}
                    </div>
                    {!locked && progress > 0 && (
                      <div style={{ height: 2, background: 'var(--border)', borderRadius: 1, marginTop: 3 }}>
                        <div style={{ height: '100%', width: `${progress}%`, background: done ? '#4ade80' : 'var(--accent)', borderRadius: 1, transition: 'width 0.6s ease' }} />
                      </div>
                    )}
                  </div>
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Telegram */}
      <div style={{ padding: '8px 16px', borderTop: '1px solid var(--border)' }}>
        <TelegramButton compact />
      </div>

      {/* User footer */}
      <div style={{ padding: '10px 8px 12px', borderTop: '1px solid var(--border)' }}>
        <div style={{ padding: '8px 10px', borderRadius: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <div style={{
              width: 28, height: 28, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'linear-gradient(135deg, #1A5C38, #0f3d22)', color: '#C4F0E4', fontSize: 11, fontWeight: 700, flexShrink: 0,
            }}>
              {initial}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--fg)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {user?.full_name || 'Utilizator'}
              </div>
              <div style={{ fontSize: 10, color: 'var(--fg-3)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {user?.email}
              </div>
            </div>
            <button
              onClick={async () => { await logout(); navigate('/login'); }}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--fg-3)', padding: 4, borderRadius: 6, display: 'flex', alignItems: 'center', transition: 'color 0.15s', flexShrink: 0 }}
              onMouseEnter={e => (e.currentTarget.style.color = '#f87171')}
              onMouseLeave={e => (e.currentTarget.style.color = 'var(--fg-3)')}
            >
              <LogOut size={14} />
            </button>
          </div>
          <TariffBadge tariff={tariff} compact />
        </div>
      </div>
    </div>
  );
};
