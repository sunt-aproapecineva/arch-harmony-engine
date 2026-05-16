// @ts-nocheck
import React, { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import {
  DndContext, closestCenter, KeyboardSensor, PointerSensor,
  useSensor, useSensors, DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove, SortableContext, sortableKeyboardCoordinates,
  useSortable, verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  BookOpen, Clock, Plus, Trash2, GripVertical, Pencil, X, Check, ChevronDown, ChevronRight, Eye, EyeOff,
} from 'lucide-react';

type Module = {
  id: string; title: string; subtitle: string | null; description: string | null;
  order_index: number; etapa: string | null; saptamana: string | null;
};
type Lesson = {
  id: string; module_id: string | null; title: string; description: string | null;
  video_url: string | null; pdf_url: string | null; duration_min: number | null;
  order_index: number; is_published: boolean;
};

// ─── Sortable Lesson Row ───────────────────────────────
const SortableLesson: React.FC<{
  lesson: Lesson;
  onSave: (l: Partial<Lesson> & { id: string }) => void;
  onDelete: (id: string) => void;
  onTogglePublish: (l: Lesson) => void;
}> = ({ lesson, onSave, onDelete, onTogglePublish }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: lesson.id });
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 };
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState(lesson);

  useEffect(() => setForm(lesson), [lesson]);

  if (editing) {
    return (
      <div ref={setNodeRef} style={{ ...style, padding: '12px 16px', borderTop: '1px solid var(--border)', background: 'var(--bg-2)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 100px', gap: 8, marginBottom: 8 }}>
          <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })}
            placeholder="Titlu lecție" style={inp} />
          <input type="number" value={form.duration_min || ''} onChange={e => setForm({ ...form, duration_min: e.target.value ? parseInt(e.target.value) : null })}
            placeholder="Min" style={inp} />
        </div>
        <textarea value={form.description || ''} onChange={e => setForm({ ...form, description: e.target.value })}
          placeholder="Descriere" rows={2} style={{ ...inp, width: '100%', marginBottom: 8, resize: 'vertical' }} />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 8 }}>
          <input value={form.video_url || ''} onChange={e => setForm({ ...form, video_url: e.target.value })}
            placeholder="URL video (YouTube/Vimeo)" style={inp} />
          <input value={form.pdf_url || ''} onChange={e => setForm({ ...form, pdf_url: e.target.value })}
            placeholder="URL PDF" style={inp} />
        </div>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <button onClick={() => { setEditing(false); setForm(lesson); }} style={btnGhost}><X size={13} /> Anulează</button>
          <button onClick={() => { onSave(form); setEditing(false); }} style={btnPrimary}><Check size={13} /> Salvează</button>
        </div>
      </div>
    );
  }

  return (
    <div ref={setNodeRef} style={{ ...style, display: 'flex', alignItems: 'center', gap: 10, padding: '10px 16px', borderTop: '1px solid var(--border)' }}>
      <button {...attributes} {...listeners} style={{ ...iconBtn, cursor: 'grab' }} title="Trage pentru a reordona">
        <GripVertical size={14} />
      </button>
      <BookOpen size={13} style={{ color: 'var(--fg-3)' }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, color: 'var(--fg)' }}>{lesson.order_index}. {lesson.title}</div>
        {lesson.description && <div style={{ fontSize: 11, color: 'var(--fg-3)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{lesson.description}</div>}
      </div>
      {lesson.duration_min ? (
        <div style={{ fontSize: 11, color: 'var(--fg-3)', display: 'flex', alignItems: 'center', gap: 3 }}>
          <Clock size={10} /> {lesson.duration_min}m
        </div>
      ) : null}
      <button onClick={() => onTogglePublish(lesson)} style={iconBtn} title={lesson.is_published ? 'Despublică' : 'Publică'}>
        {lesson.is_published ? <Eye size={13} style={{ color: '#4ade80' }} /> : <EyeOff size={13} style={{ color: 'var(--fg-3)' }} />}
      </button>
      <button onClick={() => setEditing(true)} style={iconBtn} title="Editează"><Pencil size={13} /></button>
      <button onClick={() => { if (confirm(`Șterge "${lesson.title}"?`)) onDelete(lesson.id); }} style={iconBtn} title="Șterge">
        <Trash2 size={13} style={{ color: '#f87171' }} />
      </button>
    </div>
  );
};

// ─── Sortable Module Card ───────────────────────────────
const SortableModule: React.FC<{
  mod: Module;
  lessons: Lesson[];
  expanded: boolean;
  onToggle: () => void;
  onSaveModule: (m: Partial<Module> & { id: string }) => void;
  onDeleteModule: (id: string) => void;
  onAddLesson: () => void;
  onLessonReorder: (lessons: Lesson[]) => void;
  onLessonSave: (l: Partial<Lesson> & { id: string }) => void;
  onLessonDelete: (id: string) => void;
  onLessonTogglePublish: (l: Lesson) => void;
}> = ({ mod, lessons, expanded, onToggle, onSaveModule, onDeleteModule, onAddLesson, onLessonReorder, onLessonSave, onLessonDelete, onLessonTogglePublish }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: mod.id });
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 };
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState(mod);
  useEffect(() => setForm(mod), [mod]);

  const sensors = useSensors(useSensor(PointerSensor), useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }));
  const handleLessonDragEnd = (e: DragEndEvent) => {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const oldI = lessons.findIndex(l => l.id === active.id);
    const newI = lessons.findIndex(l => l.id === over.id);
    onLessonReorder(arrayMove(lessons, oldI, newI));
  };

  return (
    <div ref={setNodeRef} style={{ ...style, background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 14, marginBottom: 16, overflow: 'hidden' }}>
      <div style={{ padding: '14px 16px', display: 'flex', alignItems: 'flex-start', gap: 10 }}>
        <button {...attributes} {...listeners} style={{ ...iconBtn, cursor: 'grab', marginTop: 2 }} title="Trage pentru a reordona modulul">
          <GripVertical size={15} />
        </button>
        <button onClick={onToggle} style={{ ...iconBtn, marginTop: 2 }}>
          {expanded ? <ChevronDown size={15} /> : <ChevronRight size={15} />}
        </button>
        <div style={{ flex: 1, minWidth: 0 }}>
          {editing ? (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 8 }}>
                <input value={form.etapa || ''} onChange={e => setForm({ ...form, etapa: e.target.value })} placeholder="Etapa" style={inp} />
                <input value={form.saptamana || ''} onChange={e => setForm({ ...form, saptamana: e.target.value })} placeholder="Săptămâna" style={inp} />
              </div>
              <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Titlu modul" style={{ ...inp, width: '100%', marginBottom: 8 }} />
              <input value={form.subtitle || ''} onChange={e => setForm({ ...form, subtitle: e.target.value })} placeholder="Subtitlu" style={{ ...inp, width: '100%', marginBottom: 8 }} />
              <textarea value={form.description || ''} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Descriere" rows={2} style={{ ...inp, width: '100%', marginBottom: 8, resize: 'vertical' }} />
              <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                <button onClick={() => { setEditing(false); setForm(mod); }} style={btnGhost}><X size={13} /> Anulează</button>
                <button onClick={() => { onSaveModule(form); setEditing(false); }} style={btnPrimary}><Check size={13} /> Salvează</button>
              </div>
            </>
          ) : (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <span style={{ fontSize: 11, color: 'var(--gold)', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' }}>{mod.etapa || `Modul ${mod.order_index}`}</span>
                {mod.saptamana && <span style={{ fontSize: 11, color: 'var(--fg-3)' }}>· {mod.saptamana}</span>}
                <span style={{ fontSize: 11, color: 'var(--fg-3)', marginLeft: 'auto' }}>{lessons.length} lecții</span>
              </div>
              <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--fg)' }}>{mod.title}</div>
              {mod.subtitle && <div style={{ fontSize: 12, color: 'var(--fg-3)', marginTop: 2 }}>{mod.subtitle}</div>}
            </>
          )}
        </div>
        {!editing && (
          <div style={{ display: 'flex', gap: 4 }}>
            <button onClick={() => setEditing(true)} style={iconBtn} title="Editează modul"><Pencil size={13} /></button>
            <button onClick={() => { if (confirm(`Șterge modulul "${mod.title}" și toate lecțiile?`)) onDeleteModule(mod.id); }} style={iconBtn} title="Șterge modul">
              <Trash2 size={13} style={{ color: '#f87171' }} />
            </button>
          </div>
        )}
      </div>

      {expanded && (
        <>
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleLessonDragEnd}>
            <SortableContext items={lessons.map(l => l.id)} strategy={verticalListSortingStrategy}>
              {lessons.length === 0 ? (
                <div style={{ padding: '14px 20px', fontSize: 12, color: 'var(--fg-3)', borderTop: '1px solid var(--border)' }}>Niciun lecție în acest modul</div>
              ) : lessons.map(l => (
                <SortableLesson key={l.id} lesson={l} onSave={onLessonSave} onDelete={onLessonDelete} onTogglePublish={onLessonTogglePublish} />
              ))}
            </SortableContext>
          </DndContext>
          <div style={{ padding: '10px 16px', borderTop: '1px solid var(--border)' }}>
            <button onClick={onAddLesson} style={{ ...btnGhost, width: '100%', justifyContent: 'center' }}>
              <Plus size={13} /> Adaugă lecție
            </button>
          </div>
        </>
      )}
    </div>
  );
};

// ─── Main Page ───────────────────────────────
export const AdminLessons: React.FC = () => {
  const [modules, setModules] = useState<Module[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const load = useCallback(async () => {
    const [m, l] = await Promise.all([
      supabase.from('modules').select('*').order('order_index'),
      supabase.from('lessons').select('*').order('order_index'),
    ]);
    setModules((m.data as Module[]) || []);
    setLessons((l.data as Lesson[]) || []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const sensors = useSensors(useSensor(PointerSensor), useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }));

  const handleModuleDragEnd = async (e: DragEndEvent) => {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const oldI = modules.findIndex(m => m.id === active.id);
    const newI = modules.findIndex(m => m.id === over.id);
    const reordered = arrayMove(modules, oldI, newI).map((m, i) => ({ ...m, order_index: i + 1 }));
    setModules(reordered);
    await Promise.all(reordered.map(m => supabase.from('modules').update({ order_index: m.order_index }).eq('id', m.id)));
  };

  const handleLessonReorder = async (moduleId: string, reordered: Lesson[]) => {
    const updated = reordered.map((l, i) => ({ ...l, order_index: i + 1 }));
    setLessons(prev => [...prev.filter(l => l.module_id !== moduleId), ...updated]);
    await Promise.all(updated.map(l => supabase.from('lessons').update({ order_index: l.order_index }).eq('id', l.id)));
  };

  const addModule = async () => {
    const nextIdx = modules.length + 1;
    const { data, error } = await supabase.from('modules').insert({
      title: `Modul nou ${nextIdx}`,
      order_index: nextIdx,
      etapa: `Modulul ${nextIdx}`,
    }).select().single();
    if (error) { alert(error.message); return; }
    setModules(prev => [...prev, data as Module]);
    setExpanded(prev => new Set([...prev, data.id]));
  };

  const saveModule = async (m: Partial<Module> & { id: string }) => {
    const { error } = await supabase.from('modules').update({
      title: m.title, subtitle: m.subtitle, description: m.description,
      etapa: m.etapa, saptamana: m.saptamana,
    }).eq('id', m.id);
    if (error) { alert(error.message); return; }
    setModules(prev => prev.map(x => x.id === m.id ? { ...x, ...m } as Module : x));
  };

  const deleteModule = async (id: string) => {
    await supabase.from('lessons').delete().eq('module_id', id);
    await supabase.from('modules').delete().eq('id', id);
    setModules(prev => prev.filter(m => m.id !== id));
    setLessons(prev => prev.filter(l => l.module_id !== id));
  };

  const addLesson = async (moduleId: string) => {
    const modLessons = lessons.filter(l => l.module_id === moduleId);
    const nextIdx = modLessons.length + 1;
    const { data, error } = await supabase.from('lessons').insert({
      module_id: moduleId, title: 'Lecție nouă', order_index: nextIdx, is_published: false,
    }).select().single();
    if (error) { alert(error.message); return; }
    setLessons(prev => [...prev, data as Lesson]);
  };

  const saveLesson = async (l: Partial<Lesson> & { id: string }) => {
    const { error } = await supabase.from('lessons').update({
      title: l.title, description: l.description, video_url: l.video_url,
      pdf_url: l.pdf_url, duration_min: l.duration_min,
    }).eq('id', l.id);
    if (error) { alert(error.message); return; }
    setLessons(prev => prev.map(x => x.id === l.id ? { ...x, ...l } as Lesson : x));
  };

  const deleteLesson = async (id: string) => {
    await supabase.from('lessons').delete().eq('id', id);
    setLessons(prev => prev.filter(l => l.id !== id));
  };

  const togglePublish = async (l: Lesson) => {
    const next = !l.is_published;
    await supabase.from('lessons').update({ is_published: next }).eq('id', l.id);
    setLessons(prev => prev.map(x => x.id === l.id ? { ...x, is_published: next } : x));
  };

  const toggleExpand = (id: string) => {
    setExpanded(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 24px' }}>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 24, gap: 16, flexWrap: 'wrap' }}>
        <div>
          <h1 className="font-aboreto" style={{ fontSize: 22, color: 'var(--fg)', marginBottom: 4 }}>Lecții & Module</h1>
          <p style={{ fontSize: 13, color: 'var(--fg-3)' }}>{modules.length} module · {lessons.length} lecții · trage de ⋮⋮ pentru a reordona</p>
        </div>
        <button onClick={addModule} style={btnPrimary}><Plus size={14} /> Adaugă modul</button>
      </div>

      {loading ? (
        <div style={{ color: 'var(--fg-3)' }}>Se încarcă...</div>
      ) : modules.length === 0 ? (
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 14, padding: 40, textAlign: 'center', color: 'var(--fg-3)' }}>
          Niciun modul. Apasă „Adaugă modul" pentru a începe.
        </div>
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleModuleDragEnd}>
          <SortableContext items={modules.map(m => m.id)} strategy={verticalListSortingStrategy}>
            {modules.map(mod => {
              const modLessons = lessons.filter(l => l.module_id === mod.id).sort((a, b) => a.order_index - b.order_index);
              return (
                <SortableModule
                  key={mod.id}
                  mod={mod}
                  lessons={modLessons}
                  expanded={expanded.has(mod.id)}
                  onToggle={() => toggleExpand(mod.id)}
                  onSaveModule={saveModule}
                  onDeleteModule={deleteModule}
                  onAddLesson={() => addLesson(mod.id)}
                  onLessonReorder={(ls) => handleLessonReorder(mod.id, ls)}
                  onLessonSave={saveLesson}
                  onLessonDelete={deleteLesson}
                  onLessonTogglePublish={togglePublish}
                />
              );
            })}
          </SortableContext>
        </DndContext>
      )}
    </div>
  );
};

// ─── Styles ──────────────────────────────────
const inp: React.CSSProperties = {
  padding: '8px 10px', fontSize: 13, background: 'var(--bg)', border: '1px solid var(--border)',
  borderRadius: 6, color: 'var(--fg)', outline: 'none', boxSizing: 'border-box',
};
const btnPrimary: React.CSSProperties = {
  display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 14px',
  background: 'var(--gold)', color: '#0D0907', border: 'none', borderRadius: 8,
  fontSize: 12, fontWeight: 700, cursor: 'pointer',
};
const btnGhost: React.CSSProperties = {
  display: 'inline-flex', alignItems: 'center', gap: 6, padding: '7px 12px',
  background: 'transparent', color: 'var(--fg)', border: '1px solid var(--border)',
  borderRadius: 8, fontSize: 12, cursor: 'pointer',
};
const iconBtn: React.CSSProperties = {
  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
  width: 28, height: 28, background: 'transparent', color: 'var(--fg-3)',
  border: 'none', borderRadius: 6, cursor: 'pointer',
};

export default AdminLessons;
