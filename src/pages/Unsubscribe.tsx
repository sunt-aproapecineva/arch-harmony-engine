import React, { useEffect, useState } from 'react';

type State = 'loading' | 'valid' | 'invalid' | 'confirming' | 'done' | 'error';

export const Unsubscribe: React.FC = () => {
  const [state, setState] = useState<State>('loading');
  const token = new URLSearchParams(window.location.search).get('token') || '';

  useEffect(() => {
    if (!token) { setState('invalid'); return; }
    fetch(`/email/unsubscribe?token=${encodeURIComponent(token)}`)
      .then(r => setState(r.ok ? 'valid' : 'invalid'))
      .catch(() => setState('invalid'));
  }, [token]);

  const confirm = async () => {
    setState('confirming');
    try {
      const r = await fetch('/email/unsubscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      });
      setState(r.ok ? 'done' : 'error');
    } catch {
      setState('error');
    }
  };

  return (
    <div className="aa-viewport-min" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)', padding: 24 }}>
      <div style={{ maxWidth: 440, width: '100%', background: 'var(--bg-2)', border: '1px solid var(--border)', borderRadius: 16, padding: '36px 32px', textAlign: 'center' }}>
        <div className="font-aboreto" style={{ fontSize: 11, letterSpacing: '0.15em', color: 'var(--accent)', marginBottom: 20 }}>ARHITECTURA AFACERII</div>
        {state === 'loading' && <p style={{ color: 'var(--fg-2)', fontSize: 14 }}>Se verifică linkul...</p>}
        {state === 'invalid' && <p style={{ color: 'var(--fg-2)', fontSize: 14 }}>Acest link nu este valid sau a expirat.</p>}
        {(state === 'valid' || state === 'confirming') && (
          <>
            <h1 style={{ fontSize: 20, color: 'var(--fg)', marginBottom: 10 }}>Dezabonare de la emailuri</h1>
            <p style={{ fontSize: 14, color: 'var(--fg-2)', marginBottom: 24, lineHeight: 1.6 }}>
              Nu vei mai primi emailuri de notificare de la noi. Emailurile de autentificare (confirmare cont, resetare parolă) vor continua să funcționeze.
            </p>
            <button
              onClick={confirm}
              disabled={state === 'confirming'}
              style={{ padding: '11px 24px', background: 'var(--accent)', color: '#0D0907', border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: 'pointer', opacity: state === 'confirming' ? 0.7 : 1 }}
            >
              {state === 'confirming' ? 'Se procesează...' : 'Confirm dezabonarea'}
            </button>
          </>
        )}
        {state === 'done' && <p style={{ color: 'var(--fg)', fontSize: 14 }}>Gata — ai fost dezabonat(ă) cu succes.</p>}
        {state === 'error' && <p style={{ color: 'var(--error)', fontSize: 14 }}>A apărut o eroare. Încearcă din nou mai târziu.</p>}
      </div>
    </div>
  );
};
