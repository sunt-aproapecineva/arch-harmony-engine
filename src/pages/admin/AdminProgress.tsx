// @ts-nocheck
import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const AdminProgress: React.FC = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [lessons, setLessons] = useState<any[]>([]);
  const [progress, setProgress] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const [u, l, p] = await Promise.all([
        supabase.from('profiles').select('id,full_name,email').order('created_at'),
        supabase.from('lessons').select('id,title,order_index,module_id').order('order_index'),
        supabase.from('progress').select('user_id,lesson_id'),
      ]);
      setUsers(u.data || []);
      setLessons(l.data || []);
      setProgress(p.data || []);
      setLoading(false);
    })();
  }, []);

  const totalLessons = lessons.length;
  const doneByUser = (uid: string) => progress.filter(p => p.user_id === uid).length;

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 24px' }}>
      <h1 className="font-aboreto" style={{ fontSize: 22, color: 'var(--fg)', marginBottom: 4 }}>Progres</h1>
      <p style={{ fontSize: 13, color: 'var(--fg-3)', marginBottom: 24 }}>Progresul fiecărui utilizator prin curriculum</p>

      {loading ? (
        <div style={{ color: 'var(--fg-3)' }}>Se încarcă...</div>
      ) : users.length === 0 ? (
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 14, padding: 32, textAlign: 'center', color: 'var(--fg-3)' }}>
          Niciun utilizator înregistrat.
        </div>
      ) : (
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 14, overflow: 'hidden' }}>
          {users.map(u => {
            const done = doneByUser(u.id);
            const pct = totalLessons > 0 ? Math.round((done / totalLessons) * 100) : 0;
            return (
              <div key={u.id} style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '14px 20px', borderBottom: '1px solid var(--border)' }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, color: 'var(--fg)', fontWeight: 500 }}>{u.full_name || '—'}</div>
                  <div style={{ fontSize: 11, color: 'var(--fg-3)' }}>{u.email}</div>
                </div>
                <div style={{ width: 200 }}>
                  <div style={{ height: 6, background: 'var(--bg-3)', borderRadius: 3, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${pct}%`, background: 'var(--accent)', transition: 'width 0.3s' }} />
                  </div>
                </div>
                <div style={{ fontSize: 13, color: 'var(--fg-2)', fontWeight: 600, minWidth: 80, textAlign: 'right' }}>
                  {done}/{totalLessons} ({pct}%)
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
