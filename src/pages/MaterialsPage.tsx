// @ts-nocheck
import React, { useEffect, useMemo, useState } from 'react';
import { Link } from '@/lib/router-compat';
import { motion } from 'framer-motion';
import { FileText, StickyNote, Download, ChevronRight, FolderOpen, BookOpen } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuthContext } from '@/context/AuthContext';
import { MODULES } from '@/lib/data';

import { PLATFORM_DOCUMENTS as DOCUMENTS } from '@/lib/documentData';
import { formatLessonNumber, getModuleNumber } from '@/lib/lessonNumbering';
import { exportExercisePDF, exportNotePDF, exportAllPDF } from '@/lib/materialsExport';

type Tab = 'exercitii' | 'notite' | 'documente';

interface ExRow { exercise_id: string; response: any; updated_at: string | null; }
interface NoteRow { lesson_id: string; content: string; updated_at: string | null; }

function findLessonByExerciseId(exId: string) {
  for (const mod of MODULES) {
    const l = mod.lessons.find((x: any) => x.exercise_id === exId);
    if (l) return { mod, lesson: l };
  }
  return null;
}
function findLesson(lessonId: string) {
  for (const mod of MODULES) {
    const l = mod.lessons.find((x: any) => x.id === lessonId);
    if (l) return { mod, lesson: l };
  }
  return null;
}

function TabButton({ active, onClick, icon: Icon, label, count }: any) {
  return (
    <button onClick={onClick}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 8, padding: '9px 14px',
        borderRadius: 10, fontSize: 13, fontWeight: 600,
        background: active ? 'var(--accent-dim)' : 'transparent',
        color: active ? 'var(--accent)' : 'var(--fg-2)',
        border: `1px solid ${active ? 'rgba(196,240,228,0.28)' : 'var(--border)'}`,
        cursor: 'pointer', transition: 'all 0.15s',
      }}>
      <Icon size={14} /> {label}
      {count != null && (
        <span style={{ fontSize: 10, padding: '2px 7px', borderRadius: 99, background: 'var(--bg-3)', color: 'var(--fg-3)', fontWeight: 700 }}>
          {count}
        </span>
      )}
    </button>
  );
}

export const MaterialsPage: React.FC = () => {
  const { user } = useAuthContext();
  const [tab, setTab] = useState<Tab>('exercitii');
  const [exercises, setExercises] = useState<ExRow[]>([]);
  const [notes, setNotes] = useState<NoteRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) return;
    (async () => {
      setLoading(true);
      const [{ data: ex }, { data: no }] = await Promise.all([
        supabase.from('exercise_responses')
          .select('exercise_id, response, updated_at')
          .eq('user_id', user.id)
          .order('updated_at', { ascending: false }),
        supabase.from('lesson_notes')
          .select('lesson_id, content, updated_at')
          .eq('user_id', user.id)
          .order('updated_at', { ascending: false }),
      ]);
      setExercises((ex || []).filter((r: any) => r.response != null));
      setNotes((no || []).filter((r: any) => (r.content || '').trim().length > 0));
      setLoading(false);
    })();
  }, [user?.id]);

  // Group by module
  const exByModule = useMemo(() => {
    const map = new Map<string, { mod: any; items: ExRow[] }>();
    for (const r of exercises) {
      const found = findLessonByExerciseId(r.exercise_id);
      if (!found) continue;
      const key = found.mod.id;
      if (!map.has(key)) map.set(key, { mod: found.mod, items: [] });
      map.get(key)!.items.push(r);
    }
    return [...map.values()].sort((a, b) => a.mod.order_index - b.mod.order_index);
  }, [exercises]);

  const notesByModule = useMemo(() => {
    const map = new Map<string, { mod: any; items: NoteRow[] }>();
    for (const r of notes) {
      const found = findLesson(r.lesson_id);
      if (!found) continue;
      const key = found.mod.id;
      if (!map.has(key)) map.set(key, { mod: found.mod, items: [] });
      map.get(key)!.items.push(r);
    }
    return [...map.values()].sort((a, b) => a.mod.order_index - b.mod.order_index);
  }, [notes]);

  const handleExportAll = () => {
    exportAllPDF({
      exercises: exercises.map(e => ({ id: e.exercise_id, response: e.response })),
      notes: notes.map(n => ({ lesson_id: n.lesson_id, content: n.content })),
    });
  };

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 24px 60px' }}>
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <div className="font-aboreto" style={{ fontSize: 10, letterSpacing: '0.14em', color: 'var(--fg-3)', textTransform: 'uppercase', marginBottom: 8 }}>
          Arhiva ta personală
        </div>
        <h1 className="font-aboreto" style={{ fontSize: 30, color: 'var(--fg)', marginBottom: 8 }}>
          Materialele mele
        </h1>
        <p style={{ fontSize: 14, color: 'var(--fg-3)', maxWidth: 640, lineHeight: 1.6 }}>
          Tot ce ai completat pe platformă — răspunsurile la exerciții, notițele tale, documentele. Le poți deschide oricând sau descărca în PDF.
        </p>
      </motion.div>

      {/* Tabs + export all */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 24, flexWrap: 'wrap' }}>
        <TabButton active={tab === 'exercitii'} onClick={() => setTab('exercitii')} icon={FileText} label="Exerciții" count={exercises.length} />
        <TabButton active={tab === 'notite'} onClick={() => setTab('notite')} icon={StickyNote} label="Notițe" count={notes.length} />
        <TabButton active={tab === 'documente'} onClick={() => setTab('documente')} icon={FolderOpen} label="Documente" count={DOCUMENTS.length} />
        <div style={{ marginLeft: 'auto' }}>
          {(exercises.length + notes.length) > 0 && (
            <button onClick={handleExportAll}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                padding: '9px 14px', borderRadius: 10, fontSize: 12, fontWeight: 700,
                background: 'var(--accent)', color: '#0D0907', border: 'none', cursor: 'pointer',
              }}>
              <Download size={13} /> Descarcă tot (PDF)
            </button>
          )}
        </div>
      </div>

      {loading && (
        <div style={{ marginTop: 40, textAlign: 'center', color: 'var(--fg-3)', fontSize: 13 }}>Se încarcă…</div>
      )}

      {/* Exerciții */}
      {!loading && tab === 'exercitii' && (
        <div style={{ marginTop: 24, display: 'flex', flexDirection: 'column', gap: 20 }}>
          {exByModule.length === 0 && (
            <EmptyState icon={FileText}
              title="Niciun exercițiu completat încă"
              text="Deschide o lecție cu exercițiu și răspunsurile tale vor apărea aici, gata de descărcat." />
          )}
          {exByModule.map(({ mod, items }) => (
            <ModuleBlock key={mod.id} mod={mod}>
              {items.map(r => {
                const found = findLessonByExerciseId(r.exercise_id)!;
                return (
                  <MaterialRow key={r.exercise_id}
                    num={formatLessonNumber(found.mod, found.lesson)}
                    title={found.lesson.title}
                    subtitle={r.updated_at ? `Actualizat ${new Date(r.updated_at).toLocaleDateString('ro-RO')}` : ''}
                    href={`/lesson/${found.lesson.id}`}
                    onDownload={() => exportExercisePDF(r.exercise_id, r.response)}
                  />
                );
              })}
            </ModuleBlock>
          ))}
        </div>
      )}

      {/* Notițe */}
      {!loading && tab === 'notite' && (
        <div style={{ marginTop: 24, display: 'flex', flexDirection: 'column', gap: 20 }}>
          {notesByModule.length === 0 && (
            <EmptyState icon={StickyNote}
              title="Nicio notiță salvată"
              text="Scrie notițe direct în pagina unei lecții — se salvează automat, în cloud, pe orice dispozitiv." />
          )}
          {notesByModule.map(({ mod, items }) => (
            <ModuleBlock key={mod.id} mod={mod}>
              {items.map(r => {
                const found = findLesson(r.lesson_id)!;
                const preview = (r.content || '').slice(0, 100);
                return (
                  <MaterialRow key={r.lesson_id}
                    num={formatLessonNumber(found.mod, found.lesson)}
                    title={found.lesson.title}
                    subtitle={preview + (r.content.length > 100 ? '…' : '')}
                    href={`/lesson/${found.lesson.id}`}
                    onDownload={() => exportNotePDF(r.lesson_id, r.content)}
                  />
                );
              })}
            </ModuleBlock>
          ))}
        </div>
      )}

      {/* Documente */}
      {!loading && tab === 'documente' && (
        <div style={{ marginTop: 24 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 14 }}>
            {DOCUMENTS.map((d: any) => (
              <Link key={d.id} to={`/documents/${d.id}/fill`}
                style={{
                  display: 'block', padding: 16, borderRadius: 12,
                  background: 'var(--bg-card)', border: '1px solid var(--border)',
                  textDecoration: 'none', transition: 'all 0.15s',
                }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(201,169,110,0.4)')}
                onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border)')}>
                <div className="font-aboreto" style={{ fontSize: 9, letterSpacing: '0.14em', color: '#C9A96E', marginBottom: 8 }}>
                  {d.docNumber || d.id.toUpperCase()}
                </div>
                <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--fg)', marginBottom: 4 }}>{d.title}</div>
                <div style={{ fontSize: 12, color: 'var(--fg-3)', lineHeight: 1.5 }}>{d.description || d.subtitle}</div>
              </Link>
            ))}
          </div>
          <p style={{ marginTop: 16, fontSize: 12, color: 'var(--fg-3)' }}>
            Documentele completate se salvează automat și pot fi printate din pagina fiecărui document.
          </p>
        </div>
      )}
    </div>
  );
};

const ModuleBlock: React.FC<{ mod: any; children: React.ReactNode }> = ({ mod, children }) => (
  <div>
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
      <div style={{
        width: 30, height: 30, borderRadius: 8, background: 'var(--accent-dim)',
        border: '1px solid rgba(196,240,228,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <span className="font-aboreto" style={{ fontSize: 11, color: 'var(--accent)' }}>{getModuleNumber(mod)}</span>
      </div>
      <div>
        <div className="font-aboreto" style={{ fontSize: 9, letterSpacing: '0.14em', color: 'var(--fg-3)', textTransform: 'uppercase' }}>{mod.etapa}</div>
        <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--fg)' }}>{mod.title}</div>
      </div>
    </div>
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>{children}</div>
  </div>
);

const MaterialRow: React.FC<{ num: string; title: string; subtitle?: string; href: string; onDownload: () => void }>
  = ({ num, title, subtitle, href, onDownload }) => (
  <div style={{
    display: 'flex', alignItems: 'center', gap: 12,
    padding: '12px 14px', borderRadius: 10,
    background: 'var(--bg-card)', border: '1px solid var(--border)',
  }}>
    <span className="font-aboreto" style={{
      fontSize: 11, color: 'var(--gold, #C9A96E)',
      minWidth: 34, textAlign: 'center',
      background: 'rgba(201,169,110,0.1)', padding: '4px 6px', borderRadius: 6,
    }}>{num}</span>
    <div style={{ flex: 1, minWidth: 0 }}>
      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--fg)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{title}</div>
      {subtitle && <div style={{ fontSize: 11, color: 'var(--fg-3)', marginTop: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{subtitle}</div>}
    </div>
    <Link to={href}
      style={{ padding: '6px 10px', fontSize: 11, color: 'var(--fg-2)', textDecoration: 'none', border: '1px solid var(--border)', borderRadius: 8, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
      Deschide <ChevronRight size={11} />
    </Link>
    <button onClick={onDownload}
      style={{ padding: '6px 10px', fontSize: 11, fontWeight: 700, color: '#0D0907', background: 'var(--accent)', border: 'none', borderRadius: 8, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
      <Download size={11} /> PDF
    </button>
  </div>
);

const EmptyState: React.FC<{ icon: any; title: string; text: string }> = ({ icon: Icon, title, text }) => (
  <div style={{
    padding: '40px 24px', textAlign: 'center',
    background: 'var(--bg-card)', border: '1px dashed var(--border)', borderRadius: 14,
  }}>
    <div style={{ width: 44, height: 44, borderRadius: 12, background: 'var(--bg-3)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
      <Icon size={20} style={{ color: 'var(--fg-3)' }} />
    </div>
    <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--fg)', marginBottom: 4 }}>{title}</div>
    <div style={{ fontSize: 12, color: 'var(--fg-3)', maxWidth: 380, margin: '0 auto', lineHeight: 1.55 }}>{text}</div>
  </div>
);
