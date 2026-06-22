// @ts-nocheck
import React, { useEffect, useState } from 'react';
import { useServerFn } from '@tanstack/react-start';
import { useNavigate } from '@/lib/router-compat';
import { AlertCircle, ChevronRight, RefreshCw } from 'lucide-react';
import { getAttentionQueue } from '@/lib/studentInsights.functions';
import { STATUS_COLOR, STATUS_LABEL } from '@/lib/studentScoring';

const cardStyle: React.CSSProperties = {
  background: 'var(--bg-card)',
  border: '1px solid var(--border)',
  borderRadius: 14,
  padding: 20,
};

export const AttentionQueueCard: React.FC = () => {
  const navigate = useNavigate();
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const fn = useServerFn(getAttentionQueue);

  const load = async () => {
    setLoading(true); setError(null);
    try {
      const r = await fn({ data: {} });
      setRows(r || []);
    } catch (e: any) { setError(e?.message || 'Eroare.'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  return (
    <div style={cardStyle}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
        <div className="font-aboreto" style={{ fontSize: 10, letterSpacing: '0.12em', color: 'var(--fg-3)', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 6 }}>
          <AlertCircle size={12} style={{ color: '#fb923c' }} /> Necesită atenție
        </div>
        <button onClick={load} disabled={loading}
          style={{ background: 'none', border: 'none', cursor: loading ? 'wait' : 'pointer', color: 'var(--fg-3)', display: 'flex', alignItems: 'center', gap: 4, fontSize: 11 }}>
          <RefreshCw size={11} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      {error && (
        <div style={{ padding: '8px 10px', background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.25)', borderRadius: 8, fontSize: 11, color: '#fca5a5' }}>
          {error}
        </div>
      )}

      {loading && rows.length === 0 ? (
        <p style={{ fontSize: 12, color: 'var(--fg-3)', textAlign: 'center', padding: '12px 0' }}>Se calculează...</p>
      ) : rows.length === 0 ? (
        <p style={{ fontSize: 12, color: 'var(--fg-3)', textAlign: 'center', padding: '12px 0' }}>Toți elevii sunt pe drum 🎉</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {rows.map(r => (
            <div
              key={r.id}
              onClick={() => navigate(`/admin/student/${r.id}`)}
              style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 8px', borderRadius: 10, cursor: 'pointer' }}
              onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-3)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
            >
              <div style={{ width: 30, height: 30, borderRadius: '50%', flexShrink: 0, background: 'linear-gradient(135deg, #4ade80 0%, #22c55e 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: '#0D0907' }}>
                {(r.full_name || r.email).charAt(0).toUpperCase()}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                  <span style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--fg)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 180 }}>
                    {r.full_name || r.email}
                  </span>
                  <span style={{ fontSize: 9, fontWeight: 700, padding: '1px 7px', borderRadius: 99, background: 'var(--bg-3)', border: `1px solid ${STATUS_COLOR[r.scores.status]}55`, color: STATUS_COLOR[r.scores.status] }}>
                    {STATUS_LABEL[r.scores.status]}
                  </span>
                </div>
                <p style={{ fontSize: 11, color: 'var(--fg-3)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {r.reason} · scor {r.scores.overall}/100
                </p>
              </div>
              <ChevronRight size={14} style={{ color: 'var(--fg-3)', flexShrink: 0 }} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
