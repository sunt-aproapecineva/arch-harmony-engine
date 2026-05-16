// @ts-nocheck
import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { BookOpen, Clock } from 'lucide-react';

export const AdminLessons: React.FC = () => {
  const [modules, setModules] = useState<any[]>([]);
  const [lessons, setLessons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const [m, l] = await Promise.all([
        supabase.from('modules').select('*').order('order_index'),
        supabase.from('lessons').select('*').order('order_index'),
      ]);
      setModules(m.data || []);
      setLessons(l.data || []);
      setLoading(false);
    })();
  }, []);

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 24px' }}>
      <h1 className="font-aboreto" style={{ fontSize: 22, color: 'var(--fg)', marginBottom: 4 }}>Lecții & Module</h1>
      <p style={{ fontSize: 13, color: 'var(--fg-3)', marginBottom: 24 }}>Curriculum-ul platformei ({modules.length} module · {lessons.length} lecții)</p>

      {loading ? (
        <div style={{ color: 'var(--fg-3)' }}>Se încarcă...</div>
      ) : modules.map(mod => {
        const modLessons = lessons.filter(l => l.module_id === mod.id);
        return (
          <div key={mod.id} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 14, marginBottom: 16, overflow: 'hidden' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <span style={{ fontSize: 11, color: 'var(--gold)', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' }}>{mod.etapa || `Modul ${mod.order_index}`}</span>
                {mod.saptamana && <span style={{ fontSize: 11, color: 'var(--fg-3)' }}>· {mod.saptamana}</span>}
              </div>
              <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--fg)' }}>{mod.title}</div>
              {mod.subtitle && <div style={{ fontSize: 12, color: 'var(--fg-3)', marginTop: 2 }}>{mod.subtitle}</div>}
            </div>
            {modLessons.length === 0 ? (
              <div style={{ padding: '14px 20px', fontSize: 12, color: 'var(--fg-3)' }}>Niciun lecție în acest modul</div>
            ) : modLessons.map(l => (
              <div key={l.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 20px', borderTop: '1px solid var(--border)' }}>
                <BookOpen size={13} style={{ color: 'var(--fg-3)' }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, color: 'var(--fg)' }}>{l.order_index}. {l.title}</div>
                  {l.description && <div style={{ fontSize: 11, color: 'var(--fg-3)' }}>{l.description}</div>}
                </div>
                {l.duration_min && (
                  <div style={{ fontSize: 11, color: 'var(--fg-3)', display: 'flex', alignItems: 'center', gap: 3 }}>
                    <Clock size={10} /> {l.duration_min} min
                  </div>
                )}
                <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 4, background: l.is_published ? 'rgba(74,222,128,0.1)' : 'rgba(255,255,255,0.05)', color: l.is_published ? '#4ade80' : 'var(--fg-3)' }}>
                  {l.is_published ? 'Publicat' : 'Draft'}
                </span>
              </div>
            ))}
          </div>
        );
      })}

      <p style={{ fontSize: 12, color: 'var(--fg-3)', marginTop: 16, textAlign: 'center' }}>
        Editarea inline a lecțiilor & drag-and-drop pot fi adăugate ulterior. Curriculum-ul este definit în migrațiile bazei de date.
      </p>
    </div>
  );
};
