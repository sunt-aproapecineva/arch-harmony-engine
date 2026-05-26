import React, { useState } from 'react';
import { Link, useNavigate } from '@/lib/router-compat';
import { motion } from 'framer-motion';
import { ArrowRight, Mail, Lock, HelpCircle } from 'lucide-react';
import { useAuthContext } from '../context/AuthContext';
import { OnboardingGuideModal } from '@/components/aa/OnboardingGuideModal';

interface InputFieldProps {
  label: string;
  icon: React.ReactNode;
  type: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  autoComplete?: string;
}

const InputField: React.FC<InputFieldProps> = ({ label, icon, type, value, onChange, placeholder, autoComplete }) => {
  const [focused, setFocused] = useState(false);
  return (
    <div>
      <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: 'var(--fg-2)', marginBottom: 6 }}>{label}</label>
      <div style={{ position: 'relative' }}>
        <div style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: focused ? 'var(--accent)' : 'var(--fg-3)', transition: 'color 0.2s', pointerEvents: 'none', zIndex: 1 }}>
          {icon}
        </div>
        <input
          type={type}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          autoComplete={autoComplete}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          required
          style={{
            width: '100%', paddingLeft: 38, paddingRight: 14, paddingTop: 10, paddingBottom: 10,
            background: 'var(--bg-3)', border: `1px solid ${focused ? 'rgba(196,240,228,0.35)' : 'var(--border)'}`,
            borderRadius: 10, color: 'var(--fg)', fontSize: 14, transition: 'border-color 0.2s, box-shadow 0.2s',
            boxShadow: focused ? '0 0 0 3px rgba(196,240,228,0.06)' : 'none',
          }}
        />
      </div>
    </div>
  );
};

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuthContext();
  const navigate = useNavigate();
  const [guideOpen, setGuideOpen] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const { error: err } = await login(email.trim(), password, rememberMe);
    setLoading(false);
    if (err) setError(err);
    else navigate('/dashboard');
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: 'var(--bg)' }}>
      {/* Left panel — brand */}
      <div
        className="hidden md:flex"
        style={{
          width: '42%', background: 'var(--sidebar-bg)', borderRight: '1px solid var(--border)',
          flexDirection: 'column', justifyContent: 'space-between', padding: '48px 40px',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 48 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg, #1A5C38, #0f3d22)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 16px rgba(26,92,56,0.35)' }}>
              <span className="font-aboreto" style={{ fontSize: 12, color: '#C4F0E4' }}>AA</span>
            </div>
            <span className="font-aboreto" style={{ fontSize: 13, letterSpacing: '0.1em', color: 'var(--fg)' }}>ARHITECTURA AFACERII</span>
          </div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <h1 className="font-aboreto" style={{ fontSize: 'clamp(2rem,3.5vw,3.2rem)', color: 'var(--fg)', lineHeight: 1.05, letterSpacing: '-0.02em', marginBottom: 16 }}>
              Construiește afacerea<br />care <span style={{ color: 'var(--accent)' }}>funcționează</span><br />fără tine.
            </h1>
            <p style={{ fontSize: 14, color: 'var(--fg-3)', lineHeight: 1.7, maxWidth: 300 }}>
              Practicum de sistematizare · 8 săptămâni · 6 etape · Victor Morar
            </p>
          </motion.div>
        </div>
        {/* Decorative stats */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} style={{ display: 'flex', gap: 24 }}>
          {[['6', 'Etape'], ['8', 'Săptămâni'], ['100%', 'Livrable reale']].map(([val, lbl]) => (
            <div key={lbl}>
              <div className="font-aboreto" style={{ fontSize: 22, color: 'var(--accent)', lineHeight: 1 }}>{val}</div>
              <div style={{ fontSize: 11, color: 'var(--fg-3)', marginTop: 3 }}>{lbl}</div>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Right panel — form */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 32 }}>
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} style={{ width: '100%', maxWidth: 380 }}>
          {/* Mobile logo */}
          <div className="md:hidden" style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 32 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: 'linear-gradient(135deg, #1A5C38, #0f3d22)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span className="font-aboreto" style={{ fontSize: 10, color: '#C4F0E4' }}>AA</span>
            </div>
            <span className="font-aboreto" style={{ fontSize: 11, letterSpacing: '0.1em', color: 'var(--fg)' }}>ARHITECTURA AFACERII</span>
          </div>

          <h2 style={{ fontSize: 22, fontWeight: 700, color: 'var(--fg)', marginBottom: 6 }}>Intră în cont</h2>
          <p style={{ fontSize: 14, color: 'var(--fg-3)', marginBottom: 16 }}>Acces restricționat — doar pentru participanți.</p>

          <button
            type="button"
            onClick={() => setGuideOpen(true)}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '8px 14px', marginBottom: 22,
              background: 'rgba(196,240,228,0.06)',
              border: '1px solid rgba(196,240,228,0.18)',
              color: 'var(--accent)', borderRadius: 9,
              fontSize: 12.5, fontWeight: 600, cursor: 'pointer',
              transition: 'background 0.15s, border-color 0.15s',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(196,240,228,0.1)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(196,240,228,0.06)'; }}
          >
            <HelpCircle size={14} /> Cum funcționează platforma? Vezi ghidul
          </button>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <InputField label="Email" icon={<Mail size={15} />} type="email" value={email} onChange={setEmail} placeholder="email@exemplu.ro" autoComplete="email" />
            <InputField label="Parolă" icon={<Lock size={15} />} type="password" value={password} onChange={setPassword} placeholder="••••••••" autoComplete="current-password" />

            {/* Remember me + Forgot password */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', userSelect: 'none' }}>
                <div
                  onClick={() => setRememberMe(v => !v)}
                  style={{
                    width: 18, height: 18, borderRadius: 5, flexShrink: 0,
                    border: `1.5px solid ${rememberMe ? 'var(--accent)' : 'var(--border-hi)'}`,
                    background: rememberMe ? 'var(--accent)' : 'transparent',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'all 0.15s',
                  }}
                >
                  {rememberMe && <svg width="10" height="8" viewBox="0 0 10 8" fill="none"><path d="M1 4L3.5 6.5L9 1" stroke="#0D0907" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                </div>
                <span style={{ fontSize: 13, color: 'var(--fg-2)' }}>Ține-mă minte <span style={{ color: 'var(--fg-3)', fontSize: 12 }}>(12h)</span></span>
              </label>
              <Link to="/forgot-password" style={{ fontSize: 12.5, color: 'var(--accent)', textDecoration: 'none', fontWeight: 600 }}>
                Ai uitat parola?
              </Link>
            </div>


            {error && (
              <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} style={{ padding: '10px 14px', background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.2)', borderRadius: 8, fontSize: 13, color: '#f87171' }}>
                {error}
              </motion.div>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                padding: '11px 20px', background: 'var(--accent)', color: '#0D0907', borderRadius: 10, border: 'none',
                cursor: loading ? 'not-allowed' : 'pointer', fontSize: 14, fontWeight: 700, opacity: loading ? 0.7 : 1,
                transition: 'all 0.2s', marginTop: 4,
              }}
            >
              {loading ? 'Se încarcă...' : (<>Intră în cont <ArrowRight size={15} /></>)}
            </button>
          </form>

          <div style={{ marginTop: 24, padding: '14px 16px', background: 'rgba(196,240,228,0.06)', border: '1px solid rgba(196,240,228,0.12)', borderRadius: 10 }}>
            <p style={{ fontSize: 13, color: 'var(--fg-2)', marginBottom: 6, fontWeight: 500 }}>
              Ai primit invitație la platformă?
            </p>
            <p style={{ fontSize: 12, color: 'var(--fg-3)', marginBottom: 10, lineHeight: 1.6 }}>
              Invitația îți permite să <strong style={{ color: 'var(--fg-2)' }}>creezi un cont</strong>, nu să te loghezi direct. Trebuie să te înregistrezi mai întâi.
            </p>
            <Link
              to="/register"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                padding: '7px 14px', background: 'var(--accent)', color: '#0D0907',
                borderRadius: 8, fontSize: 13, fontWeight: 700, textDecoration: 'none',
                transition: 'filter 0.15s',
              }}
            >
              Creează cont cu email-ul invitat <ArrowRight size={13} />
            </Link>
          </div>
        </motion.div>
      </div>
      <OnboardingGuideModal open={guideOpen} onClose={() => setGuideOpen(false)} />
    </div>
  );
};
