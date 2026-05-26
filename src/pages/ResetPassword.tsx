import React, { useEffect, useState } from 'react';
import { useNavigate } from '@/lib/router-compat';
import { motion } from 'framer-motion';
import { ArrowRight, Lock, CheckCircle2, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

type Status = 'checking' | 'ready' | 'invalid' | 'updating' | 'done';

export const ResetPassword: React.FC = () => {
  const [status, setStatus] = useState<Status>('checking');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [focused, setFocused] = useState<string | null>(null);
  const navigate = useNavigate();

  // Supabase pune access_token + type=recovery în URL hash. Detect session readiness.
  useEffect(() => {
    let mounted = true;

    // Verificare imediată — dacă e deja o sesiune (linkul a fost procesat), suntem gata
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!mounted) return;
      const hash = window.location.hash || '';
      const isRecovery = hash.includes('type=recovery') || hash.includes('access_token');
      if (session && isRecovery) {
        setStatus('ready');
      } else if (session) {
        // Sesiune validă dar fără token de recovery — permitem totuși schimbarea parolei
        setStatus('ready');
      } else if (!isRecovery) {
        setStatus('invalid');
      }
    });

    // Ascultă PASSWORD_RECOVERY (eveniment dedicat când linkul de reset e procesat)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!mounted) return;
      if (event === 'PASSWORD_RECOVERY' || (event === 'SIGNED_IN' && session)) {
        setStatus('ready');
      }
    });

    // Fallback: dacă după 4s nu avem nimic, marcăm linkul ca invalid
    const timeout = setTimeout(() => {
      if (mounted) {
        setStatus(prev => (prev === 'checking' ? 'invalid' : prev));
      }
    }, 4000);

    return () => {
      mounted = false;
      subscription.unsubscribe();
      clearTimeout(timeout);
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (password.length < 8) {
      setError('Parola trebuie să aibă minim 8 caractere.');
      return;
    }
    if (password !== confirm) {
      setError('Parolele nu coincid.');
      return;
    }
    setStatus('updating');
    const { error: updateErr } = await supabase.auth.updateUser({ password });
    if (updateErr) {
      setStatus('ready');
      setError(updateErr.message);
      return;
    }
    setStatus('done');
    // Sign-out pentru a forța login curat cu noua parolă
    setTimeout(async () => {
      await supabase.auth.signOut();
      navigate('/login');
    }, 1800);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)', padding: 32 }}>
      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} style={{ width: '100%', maxWidth: 420 }}>

        {status === 'checking' && (
          <div style={{ textAlign: 'center', color: 'var(--fg-3)', fontSize: 14 }}>Verificăm linkul de resetare...</div>
        )}

        {status === 'invalid' && (
          <div style={{ textAlign: 'center', padding: '12px 0' }}>
            <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'rgba(248,113,113,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 18px' }}>
              <AlertCircle size={28} color="#f87171" />
            </div>
            <h2 style={{ fontSize: 22, fontWeight: 700, color: 'var(--fg)', marginBottom: 10 }}>Link invalid sau expirat</h2>
            <p style={{ fontSize: 14, color: 'var(--fg-3)', lineHeight: 1.7, marginBottom: 20 }}>
              Linkul de resetare nu este valid sau a expirat. Cere unul nou de la pagina de login.
            </p>
            <button
              onClick={() => navigate('/forgot-password')}
              style={{
                padding: '10px 20px', background: 'var(--accent)', color: '#0D0907', borderRadius: 10, border: 'none',
                cursor: 'pointer', fontSize: 14, fontWeight: 700,
              }}
            >
              Cere link nou
            </button>
          </div>
        )}

        {status === 'done' && (
          <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} style={{ textAlign: 'center', padding: '12px 0' }}>
            <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'rgba(196,240,228,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 18px' }}>
              <CheckCircle2 size={28} color="var(--accent)" />
            </div>
            <h2 style={{ fontSize: 22, fontWeight: 700, color: 'var(--fg)', marginBottom: 10 }}>Parolă schimbată</h2>
            <p style={{ fontSize: 14, color: 'var(--fg-3)', lineHeight: 1.7 }}>
              Te redirecționăm către pagina de login...
            </p>
          </motion.div>
        )}

        {(status === 'ready' || status === 'updating') && (
          <>
            <h2 style={{ fontSize: 24, fontWeight: 700, color: 'var(--fg)', marginBottom: 8 }}>Setează o parolă nouă</h2>
            <p style={{ fontSize: 14, color: 'var(--fg-3)', marginBottom: 28, lineHeight: 1.6 }}>
              Alege o parolă de minim 8 caractere. După salvare, te vei loga din nou cu noua parolă.
            </p>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {[
                { key: 'pw', label: 'Parolă nouă', val: password, set: setPassword, ac: 'new-password' },
                { key: 'cf', label: 'Confirmă parola', val: confirm, set: setConfirm, ac: 'new-password' },
              ].map(f => (
                <div key={f.key}>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: 'var(--fg-2)', marginBottom: 6 }}>{f.label}</label>
                  <div style={{ position: 'relative' }}>
                    <div style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: focused === f.key ? 'var(--accent)' : 'var(--fg-3)', transition: 'color 0.2s', pointerEvents: 'none' }}>
                      <Lock size={15} />
                    </div>
                    <input
                      type="password"
                      value={f.val}
                      onChange={e => f.set(e.target.value)}
                      placeholder="••••••••"
                      autoComplete={f.ac}
                      required
                      onFocus={() => setFocused(f.key)}
                      onBlur={() => setFocused(null)}
                      style={{
                        width: '100%', paddingLeft: 38, paddingRight: 14, paddingTop: 10, paddingBottom: 10,
                        background: 'var(--bg-3)', border: `1px solid ${focused === f.key ? 'rgba(196,240,228,0.35)' : 'var(--border)'}`,
                        borderRadius: 10, color: 'var(--fg)', fontSize: 14, transition: 'border-color 0.2s, box-shadow 0.2s',
                        boxShadow: focused === f.key ? '0 0 0 3px rgba(196,240,228,0.06)' : 'none',
                      }}
                    />
                  </div>
                </div>
              ))}

              {error && (
                <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} style={{ padding: '10px 14px', background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.2)', borderRadius: 8, fontSize: 13, color: '#f87171' }}>
                  {error}
                </motion.div>
              )}

              <button
                type="submit"
                disabled={status === 'updating'}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  padding: '11px 20px', background: 'var(--accent)', color: '#0D0907', borderRadius: 10, border: 'none',
                  cursor: status === 'updating' ? 'not-allowed' : 'pointer', fontSize: 14, fontWeight: 700, opacity: status === 'updating' ? 0.7 : 1,
                  transition: 'all 0.2s', marginTop: 4,
                }}
              >
                {status === 'updating' ? 'Se salvează...' : (<>Salvează parola <ArrowRight size={15} /></>)}
              </button>
            </form>
          </>
        )}
      </motion.div>
    </div>
  );
};
