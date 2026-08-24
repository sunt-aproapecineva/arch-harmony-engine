import React, { useState } from 'react';
import { Link, useNavigate } from '@/lib/router-compat';
import { motion } from 'framer-motion';
import { ArrowRight, Mail, ArrowLeft, CheckCircle2, KeyRound, Lock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

type Step = 'email' | 'code' | 'password' | 'done';

const inputStyle = (active: boolean): React.CSSProperties => ({
  width: '100%',
  paddingLeft: 38,
  paddingRight: 14,
  paddingTop: 10,
  paddingBottom: 10,
  background: 'var(--bg-3)',
  border: `1px solid ${active ? 'rgba(196,240,228,0.35)' : 'var(--border)'}`,
  borderRadius: 10,
  color: 'var(--fg)',
  fontSize: 14,
  transition: 'border-color 0.2s, box-shadow 0.2s',
  boxShadow: active ? '0 0 0 3px rgba(196,240,228,0.06)' : 'none',
});

const btnStyle = (disabled: boolean): React.CSSProperties => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 8,
  padding: '11px 20px',
  background: 'var(--accent)',
  color: '#0D0907',
  borderRadius: 10,
  border: 'none',
  cursor: disabled ? 'not-allowed' : 'pointer',
  fontSize: 14,
  fontWeight: 700,
  opacity: disabled ? 0.7 : 1,
  transition: 'all 0.2s',
  marginTop: 4,
});

export const ForgotPassword: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState<string | null>(null);

  const cleanEmail = email.trim().toLowerCase();

  const sendCode = async (silent = false) => {
    setError('');
    setLoading(true);

    const { data: allowed, error: rpcErr } = await supabase.rpc('is_email_whitelisted', { _email: cleanEmail });
    if (rpcErr) {
      setLoading(false);
      setError('A apărut o eroare. Încearcă din nou.');
      return;
    }
    if (allowed !== true) {
      setLoading(false);
      setError('Această adresă de email nu are acces la platformă.');
      return;
    }

    const { error: resetErr } = await supabase.auth.resetPasswordForEmail(cleanEmail, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setLoading(false);
    if (resetErr) {
      setError(resetErr.message);
      return;
    }
    if (!silent) setStep('code');
  };

  const verifyCode = async () => {
    setError('');
    const token = code.replace(/\D/g, '');
    if (token.length !== 6) {
      setError('Codul trebuie să aibă 6 cifre.');
      return;
    }
    setLoading(true);
    const { error: otpErr } = await supabase.auth.verifyOtp({
      email: cleanEmail,
      token,
      type: 'recovery',
    });
    setLoading(false);
    if (otpErr) {
      setError('Cod incorect sau expirat. Verifică emailul sau cere un cod nou.');
      return;
    }
    setStep('password');
  };

  const savePassword = async () => {
    setError('');
    if (password.length < 8) {
      setError('Parola trebuie să aibă minim 8 caractere.');
      return;
    }
    if (password !== confirm) {
      setError('Parolele nu coincid.');
      return;
    }
    setLoading(true);
    const { error: updErr } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (updErr) {
      setError(updErr.message);
      return;
    }
    setStep('done');
    setTimeout(async () => {
      await supabase.auth.signOut();
      navigate('/login');
    }, 1800);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    if (step === 'email') void sendCode();
    else if (step === 'code') void verifyCode();
    else if (step === 'password') void savePassword();
  };

  const errorBox = error ? (
    <motion.div
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      style={{ padding: '10px 14px', background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.2)', borderRadius: 8, fontSize: 13, color: 'var(--error)' }}
    >
      {error}
    </motion.div>
  ) : null;

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)', padding: 32 }}>
      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} style={{ width: '100%', maxWidth: 420 }}>
        <Link to="/login" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--fg-3)', textDecoration: 'none', marginBottom: 24 }}>
          <ArrowLeft size={14} /> Înapoi la login
        </Link>

        {step === 'done' ? (
          <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} style={{ textAlign: 'center', padding: '12px 0' }}>
            <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'rgba(196,240,228,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 18px' }}>
              <CheckCircle2 size={28} color="var(--accent)" />
            </div>
            <h2 style={{ fontSize: 22, fontWeight: 700, color: 'var(--fg)', marginBottom: 10 }}>Parolă schimbată</h2>
            <p style={{ fontSize: 14, color: 'var(--fg-3)', lineHeight: 1.7 }}>Te redirecționăm către pagina de login...</p>
          </motion.div>
        ) : (
          <>
            <div style={{ display: 'flex', gap: 6, marginBottom: 18 }}>
              {(['email', 'code', 'password'] as Step[]).map((s, i) => {
                const order = ['email', 'code', 'password'];
                const active = order.indexOf(step) >= i;
                return <div key={s} style={{ flex: 1, height: 3, borderRadius: 2, background: active ? 'var(--accent)' : 'var(--border)', transition: 'background 0.3s' }} />;
              })}
            </div>

            <h2 style={{ fontSize: 24, fontWeight: 700, color: 'var(--fg)', marginBottom: 8 }}>
              {step === 'email' && 'Resetează parola'}
              {step === 'code' && 'Introdu codul primit'}
              {step === 'password' && 'Setează o parolă nouă'}
            </h2>
            <p style={{ fontSize: 14, color: 'var(--fg-3)', marginBottom: 28, lineHeight: 1.6 }}>
              {step === 'email' && 'Introdu adresa de email cu care te-ai înregistrat. Îți trimitem un cod de 6 cifre pe care îl scrii aici, direct pe platformă.'}
              {step === 'code' && <>Am trimis un cod de 6 cifre la <strong style={{ color: 'var(--fg-2)' }}>{cleanEmail}</strong>. Verifică inboxul (și Spam). Codul expiră în 60 de minute.</>}
              {step === 'password' && 'Alege o parolă de minim 8 caractere. După salvare, te loghezi din nou cu noua parolă.'}
            </p>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {step === 'email' && (
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: 'var(--fg-2)', marginBottom: 6 }}>Email</label>
                  <div style={{ position: 'relative' }}>
                    <div style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: focused === 'email' ? 'var(--accent)' : 'var(--fg-3)', pointerEvents: 'none' }}>
                      <Mail size={15} />
                    </div>
                    <input
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="email@exemplu.ro"
                      autoComplete="email"
                      required
                      onFocus={() => setFocused('email')}
                      onBlur={() => setFocused(null)}
                      style={inputStyle(focused === 'email')}
                    />
                  </div>
                </div>
              )}

              {step === 'code' && (
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: 'var(--fg-2)', marginBottom: 6 }}>Cod de verificare</label>
                  <div style={{ position: 'relative' }}>
                    <div style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: focused === 'code' ? 'var(--accent)' : 'var(--fg-3)', pointerEvents: 'none' }}>
                      <KeyRound size={15} />
                    </div>
                    <input
                      type="text"
                      inputMode="numeric"
                      autoComplete="one-time-code"
                      value={code}
                      onChange={e => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      placeholder="123456"
                      required
                      onFocus={() => setFocused('code')}
                      onBlur={() => setFocused(null)}
                      style={{ ...inputStyle(focused === 'code'), letterSpacing: 6, fontSize: 18, fontWeight: 700 }}
                    />
                  </div>
                </div>
              )}

              {step === 'password' &&
                [
                  { key: 'pw', label: 'Parolă nouă', val: password, set: setPassword },
                  { key: 'cf', label: 'Confirmă parola', val: confirm, set: setConfirm },
                ].map(f => (
                  <div key={f.key}>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: 'var(--fg-2)', marginBottom: 6 }}>{f.label}</label>
                    <div style={{ position: 'relative' }}>
                      <div style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: focused === f.key ? 'var(--accent)' : 'var(--fg-3)', pointerEvents: 'none' }}>
                        <Lock size={15} />
                      </div>
                      <input
                        type="password"
                        value={f.val}
                        onChange={e => f.set(e.target.value)}
                        placeholder="••••••••"
                        autoComplete="new-password"
                        required
                        onFocus={() => setFocused(f.key)}
                        onBlur={() => setFocused(null)}
                        style={inputStyle(focused === f.key)}
                      />
                    </div>
                  </div>
                ))}

              {errorBox}

              <button type="submit" disabled={loading} style={btnStyle(loading)}>
                {loading ? 'Se procesează...' : (
                  <>
                    {step === 'email' && 'Trimite codul'}
                    {step === 'code' && 'Verifică codul'}
                    {step === 'password' && 'Salvează parola'}
                    <ArrowRight size={15} />
                  </>
                )}
              </button>
            </form>

            {step === 'code' && (
              <p style={{ fontSize: 12, color: 'var(--fg-3)', marginTop: 16, textAlign: 'center' }}>
                Nu ai primit codul?{' '}
                <button
                  type="button"
                  onClick={() => void sendCode(true)}
                  disabled={loading}
                  style={{ background: 'none', border: 'none', color: 'var(--accent)', cursor: 'pointer', fontSize: 12, fontWeight: 600, padding: 0 }}
                >
                  Trimite din nou
                </button>
                {' · '}
                <button
                  type="button"
                  onClick={() => { setStep('email'); setCode(''); setError(''); }}
                  style={{ background: 'none', border: 'none', color: 'var(--fg-2)', cursor: 'pointer', fontSize: 12, fontWeight: 600, padding: 0 }}
                >
                  Schimbă emailul
                </button>
              </p>
            )}
          </>
        )}
      </motion.div>
    </div>
  );
};
