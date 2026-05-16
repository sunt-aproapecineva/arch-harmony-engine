// @ts-nocheck
import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { UserPlus, CheckCircle } from 'lucide-react';

function timeAgo(iso: string) {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 60) return 'acum';
  if (diff < 3600) return `acum ${Math.floor(diff / 60)} min`;
  if (diff < 86400) return `acum ${Math.floor(diff / 3600)} ore`;
  return `acum ${Math.floor(diff / 86400)} zile`;
}

export const AdminActivity: React.FC = () => {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const [users, prog] = await Promise.all([
        supabase.from('profiles').select('id,email,full_name,created_at').order('created_at', { ascending: false }).limit(50),
        supabase.from('progress').select('user_id,lesson_id,completed_at').order('completed_at', { ascending: false }).limit(50),
      ]);
      const profById: Record<string, any> = {};
      (users.data || []).forEach(u => { profById[u.id] = u; });
      const reg = (users.data || []).map(u => ({
        type: 'register', at: u.created_at, user: u,
        label: `${u.full_name || u.email} s-a înregistrat`,
      }));
      const completes = (prog.data || []).map(p => ({
        type: 'lesson', at: p.completed_at, user: profById[p.user_id],
        label: `${profById[p.user_id]?.full_name || 'Utilizator'} a finalizat o lecție`,
      }));
      const all = [...reg, ...completes].sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime()).slice(0, 60);
      setEvents(all);
      setLoading(false);
    })();
  }, []);

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '32px 24px' }}>
      <h1 className="font-aboreto" style={{ fontSize: 22, color: 'var(--fg)', marginBottom: 4 }}>Activitate</h1>
      <p style={{ fontSize: 13, color: 'var(--fg-3)', marginBottom: 24 }}>Înregistrări și progres recent</p>

      {loading ? (
        <div style={{ color: 'var(--fg-3)' }}>Se încarcă...</div>
      ) : events.length === 0 ? (
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 14, padding: 32, textAlign: 'center', color: 'var(--fg-3)' }}>
          Nicio activitate înregistrată.
        </div>
      ) : (
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 14, overflow: 'hidden' }}>
          {events.map((e, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 18px', borderBottom: '1px solid var(--border)' }}>
              <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--bg-3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {e.type === 'register' ? <UserPlus size={13} style={{ color: 'var(--accent)' }} /> : <CheckCircle size={13} style={{ color: '#a78bfa' }} />}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, color: 'var(--fg)' }}>{e.label}</div>
                {e.user?.email && <div style={{ fontSize: 11, color: 'var(--fg-3)' }}>{e.user.email}</div>}
              </div>
              <div style={{ fontSize: 11, color: 'var(--fg-3)' }}>{timeAgo(e.at)}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
