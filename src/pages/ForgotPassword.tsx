import React, { useState } from 'react';
import { Link } from '@/lib/router-compat';
import { motion } from 'framer-motion';
import { ArrowRight, Mail, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

export const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [focused, setFocused] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const cleanEmail = email.trim().toLowerCase();

    // Verifică dacă emailul e în whitelist înainte să trimită ceva
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
    setSent(true);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)', padding: 32 }}>
      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} style={{ width: '100%', maxWidth: 420 }}>
        <Link to="/login" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--fg-3)', textDecoration: 'none', marginBottom: 24 }}>
          <ArrowLeft size={14} /> Înapoi la login
        </Link>

        {!sent ? (
          <>
            <h2 style={{ fontSize: 24, fontWeight: 700, color: 'var(--fg)', marginBottom: 8 }}>Resetează parola</h2>
            <p style={{ fontSize: 14, color: 'var(--fg-3)', marginBottom: 28, lineHeight: 1.6 }}>
              Introdu adresa de email cu care te-ai înregistrat. Îți trimitem un link prin care îți poți seta o parolă nouă.
            </p>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: 'var(--fg-2)', marginBottom: 6 }}>Email</label>
                <div style={{ position: 'relative' }}>
                  <div style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: focused ? 'var(--accent)' : 'var(--fg-3)', transition: 'color 0.2s', pointerEvents: 'none' }}>
                    <Mail size={15} />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="email@exemplu.ro"
                    autoComplete="email"
                    required
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
                {loading ? 'Se trimite...' : (<>Trimite link de resetare <ArrowRight size={15} /></>)}
              </button>
            </form>
          </>
        ) : (
          <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} style={{ textAlign: 'center', padding: '12px 0' }}>
            <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'rgba(196,240,228,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 18px' }}>
              <CheckCircle2 size={28} color="var(--accent)" />
            </div>
            <h2 style={{ fontSize: 22, fontWeight: 700, color: 'var(--fg)', marginBottom: 10 }}>Verifică-ți emailul</h2>
            <p style={{ fontSize: 14, color: 'var(--fg-3)', lineHeight: 1.7, marginBottom: 20 }}>
              Ți-am trimis un link de resetare la <strong style={{ color: 'var(--fg-2)' }}>{email.trim().toLowerCase()}</strong>.
              Verifică inboxul (și folderul Spam) și dă click pe link pentru a seta o parolă nouă.
            </p>
            <p style={{ fontSize: 12, color: 'var(--fg-3)' }}>
              Linkul expiră în 60 minute. Nu ai primit nimic?{' '}
              <button
                type="button"
                onClick={() => { setSent(false); }}
                style={{ background: 'none', border: 'none', color: 'var(--accent)', cursor: 'pointer', fontSize: 12, fontWeight: 600, padding: 0 }}
              >
                Încearcă din nou
              </button>
            </p>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};
