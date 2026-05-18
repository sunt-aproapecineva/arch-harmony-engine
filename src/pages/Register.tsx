import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from '@/lib/router-compat';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Mail, Lock, User, CheckCircle2, Loader2, HelpCircle } from 'lucide-react';
import { useAuthContext } from '../context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
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

export const Register: React.FC = () => {
  const [step, setStep] = useState<1 | 2>(1);
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [checkingEmail, setCheckingEmail] = useState(false);
  const [loading, setLoading] = useState(false);
  const { register } = useAuthContext();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Pre-fill email from invite link and auto-advance if whitelisted
  useEffect(() => {
    const emailParam = searchParams.get('email');
    if (emailParam) {
      const normalized = emailParam.trim().toLowerCase();
      setEmail(normalized);
      supabase.rpc('is_email_whitelisted', { _email: normalized }).then(({ data }) => {
        if (data === true) setStep(2);
      });
    }
  }, []);

  // Step 1: actually verify against whitelist before proceeding (via secure RPC)
  const handleCheckEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email.trim()) return;
    setCheckingEmail(true);
    const target = email.trim().toLowerCase();
    const { data, error: rpcErr } = await supabase.rpc('is_email_whitelisted', { _email: target });
    setCheckingEmail(false);
    if (rpcErr || data !== true) {
      setError('Acest email nu are acces la platformă. Verifică adresa sau contactează administratorul.');
      return;
    }
    setStep(2);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!fullName.trim()) {
      setError('Numele complet este obligatoriu.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Parolele nu coincid.');
      return;
    }
    if (password.length < 6) {
      setError('Parola trebuie să aibă cel puțin 6 caractere.');
      return;
    }
    setLoading(true);
    const { error: err } = await register(email.trim(), password, fullName.trim());
    setLoading(false);
    if (err) {
      // If email not in whitelist, go back to step 1
      if (err.includes('lista de acces')) {
        setStep(1);
      }
      setError(err);
    } else {
      navigate('/dashboard');
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: 'var(--bg)' }}>
      {/* Left panel */}
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
              Alătură-te<br />unui practicum<br /><span style={{ color: 'var(--accent)' }}>cu rezultate reale.</span>
            </h1>
            <p style={{ fontSize: 14, color: 'var(--fg-3)', lineHeight: 1.7, maxWidth: 300 }}>
              Accesul este permis doar pe bază de invitație. Dacă ai primit link-ul, ești în locul potrivit.
            </p>
          </motion.div>
        </div>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {['Sistem dovedit în 7 afaceri reale', 'Livrabile concrete la fiecare etapă', 'Suport direct de la Victor Morar'].map(item => (
              <div key={item} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <CheckCircle2 size={14} style={{ color: 'var(--accent)', flexShrink: 0 }} />
                <span style={{ fontSize: 13, color: 'var(--fg-3)' }}>{item}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Right panel — form */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 32 }}>
        <div style={{ width: '100%', maxWidth: 380 }}>
          {/* Mobile logo */}
          <div className="md:hidden" style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 32 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: 'linear-gradient(135deg, #1A5C38, #0f3d22)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span className="font-aboreto" style={{ fontSize: 10, color: '#C4F0E4' }}>AA</span>
            </div>
            <span className="font-aboreto" style={{ fontSize: 11, letterSpacing: '0.1em', color: 'var(--fg)' }}>ARHITECTURA AFACERII</span>
          </div>

          {/* Step indicators */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 24 }}>
            {[1, 2].map(s => (
              <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{
                  width: 24, height: 24, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 11, fontWeight: 700,
                  background: s <= step ? 'var(--accent)' : 'var(--bg-3)',
                  color: s <= step ? '#0D0907' : 'var(--fg-3)',
                  border: `1px solid ${s <= step ? 'transparent' : 'var(--border)'}`,
                  transition: 'all 0.3s',
                }}>
                  {s < step ? <CheckCircle2 size={12} /> : s}
                </div>
                {s < 2 && <div style={{ width: 24, height: 1, background: step > 1 ? 'var(--accent)' : 'var(--border)', transition: 'background 0.3s' }} />}
              </div>
            ))}
            <span style={{ fontSize: 11, color: 'var(--fg-3)', marginLeft: 4 }}>
              {step === 1 ? 'Verificare acces' : 'Creare cont'}
            </span>
          </div>

          <AnimatePresence mode="wait">
            {step === 1 ? (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25 }}
              >
                <h2 style={{ fontSize: 22, fontWeight: 700, color: 'var(--fg)', marginBottom: 6 }}>Verifică accesul</h2>
                <p style={{ fontSize: 14, color: 'var(--fg-3)', marginBottom: 28 }}>Introdu email-ul tău pentru a verifica dacă ai acces la platformă.</p>

                <form onSubmit={handleCheckEmail} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <InputField label="Email" icon={<Mail size={15} />} type="email" value={email} onChange={setEmail} placeholder="email@exemplu.ro" autoComplete="email" />

                  {error && (
                    <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} style={{ padding: '10px 14px', background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.2)', borderRadius: 8, fontSize: 13, color: '#f87171' }}>
                      {error}
                    </motion.div>
                  )}

                  <button
                    type="submit"
                    disabled={checkingEmail || !email}
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                      padding: '11px 20px', background: 'var(--accent)', color: '#0D0907', borderRadius: 10, border: 'none',
                      cursor: checkingEmail || !email ? 'not-allowed' : 'pointer', fontSize: 14, fontWeight: 700,
                      opacity: checkingEmail || !email ? 0.7 : 1, transition: 'all 0.2s', marginTop: 4,
                    }}
                  >
                    {checkingEmail ? (
                      <><Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} /> Verificare...</>
                    ) : (
                      <>Verifică accesul <ArrowRight size={15} /></>
                    )}
                  </button>
                </form>
              </motion.div>
            ) : (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25 }}
              >
                <h2 style={{ fontSize: 22, fontWeight: 700, color: 'var(--fg)', marginBottom: 6 }}>Creează contul</h2>
                <p style={{ fontSize: 14, color: 'var(--fg-3)', marginBottom: 28 }}>
                  Email:{' '}
                  <span style={{ color: 'var(--accent)', fontWeight: 500 }}>{email}</span>
                  <button
                    onClick={() => { setStep(1); setError(''); }}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--fg-3)', fontSize: 12, marginLeft: 6, padding: 0 }}
                  >
                    (schimbă)
                  </button>
                </p>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <InputField label="Nume complet" icon={<User size={15} />} type="text" value={fullName} onChange={setFullName} placeholder="Ion Popescu" autoComplete="name" />
                  <InputField label="Parolă" icon={<Lock size={15} />} type="password" value={password} onChange={setPassword} placeholder="Minim 6 caractere" autoComplete="new-password" />
                  <InputField label="Confirmă parola" icon={<Lock size={15} />} type="password" value={confirmPassword} onChange={setConfirmPassword} placeholder="••••••••" autoComplete="new-password" />

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
                      cursor: loading ? 'not-allowed' : 'pointer', fontSize: 14, fontWeight: 700,
                      opacity: loading ? 0.7 : 1, transition: 'all 0.2s', marginTop: 4,
                    }}
                  >
                    {loading ? (
                      <><Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} /> Se creează contul...</>
                    ) : (
                      <>Creează cont <ArrowRight size={15} /></>
                    )}
                  </button>
                </form>
              </motion.div>
            )}
          </AnimatePresence>

          <p style={{ textAlign: 'center', fontSize: 13, color: 'var(--fg-3)', marginTop: 20 }}>
            Ai deja cont?{' '}
            <Link to="/login" style={{ color: 'var(--accent)', fontWeight: 600 }}>Conectează-te</Link>
          </p>

          <p style={{ textAlign: 'center', fontSize: 11, color: 'var(--fg-3)', marginTop: 12, lineHeight: 1.6 }}>
            Accesul este permis doar cu email pre-aprobat.<br />
            Contactează administratorul pentru acces.
          </p>
        </div>
      </div>
    </div>
  );
};
