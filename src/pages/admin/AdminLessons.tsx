import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, Plus, Edit2, Trash2, Eye, EyeOff, Check, X, BookOpen, FileText, Video } from 'lucide-react';
import { MODULES } from '../../lib/data';
import { Lesson, Progress } from '../../lib/types';

const LS_KEY = 'aa_lesson_overrides';

function getOverrides(): Record<string, Partial<Lesson>> {
  try { const s = localStorage.getItem(LS_KEY); return s ? JSON.parse(s) : {}; } catch { return {}; }
}
function saveOverrides(overrides: Record<string, Partial<Lesson>>) {
  localStorage.setItem(LS_KEY, JSON.stringify(overrides));
}
function getStoredProgress(): Progress[] {
  try { const s = localStorage.getItem('aa_progress'); return s ? JSON.parse(s) : []; } catch { return []; }
}

const EMPTY_FORM = { title: '', video_url: '', pdf_url: '', duration_min: 10, description: '' };

export const AdminLessons: React.FC = () => {
  const [expandedModule, setExpandedModule] = useState<string | null>(MODULES[0]?.id || null);
  const [overrides, setOverrides] = useState<Record<string, Partial<Lesson>>>(getOverrides);
  const [editingLesson, setEditingLesson] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<typeof EMPTY_FORM>(EMPTY_FORM);
  const [addingTo, setAddingTo] = useState<string | null>(null);
  const [addForm, setAddForm] = useState<typeof EMPTY_FORM>({ ...EMPTY_FORM });
  const progress = getStoredProgress();

  const totalLessons = MODULES.flatMap(m => m.lessons).length;
  const publishedLessons = MODULES.flatMap(m => m.lessons).filter(l => {
    const ov = overrides[l.id];
    return ov?.is_published !== undefined ? ov.is_published : l.is_published;
  }).length;
  const avgCompletions = totalLessons > 0
    ? Math.round(MODULES.flatMap(m => m.lessons).reduce((sum, l) => sum + progress.filter(p => p.lesson_id === l.id).length, 0) / totalLessons)
    : 0;

  const getLessonData = (lesson: Lesson): Lesson => ({ ...lesson, ...overrides[lesson.id] });

  const togglePublish = (lessonId: string, current: boolean) => {
    const updated = { ...overrides, [lessonId]: { ...overrides[lessonId], is_published: !current } };
    setOverrides(updated);
    saveOverrides(updated);
  };

  const startEdit = (lesson: Lesson) => {
    const data = getLessonData(lesson);
    setEditingLesson(lesson.id);
    setEditForm({ title: data.title, video_url: data.video_url, pdf_url: data.pdf_url || '', duration_min: data.duration_min, description: data.description });
  };

  const saveEdit = (lessonId: string) => {
    const updated = { ...overrides, [lessonId]: { ...overrides[lessonId], ...editForm, duration_min: Number(editForm.duration_min) } };
    setOverrides(updated);
    saveOverrides(updated);
    setEditingLesson(null);
  };

  const getLessonCompletions = (lessonId: string) => progress.filter(p => p.lesson_id === lessonId).length;

  return (
    <div style={{ maxWidth: 960, margin: '0 auto', padding: '32px 24px' }}>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h1 className="font-aboreto" style={{ fontSize: 22, color: 'var(--fg)', letterSpacing: '-0.01em', marginBottom: 4 }}>Lecții</h1>
        <p style={{ fontSize: 13, color: 'var(--fg-3)' }}>Gestionează lecțiile din fiecare modul</p>
      </div>

      {/* Stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 28 }}>
        {[
          { label: 'Total lecții', value: totalLessons, color: 'var(--fg)', icon: <BookOpen size={16} /> },
          { label: 'Publicate', value: publishedLessons, color: '#4ade80', icon: <Eye size={16} /> },
          { label: 'Completări medii', value: avgCompletions, color: 'var(--gold)', icon: <Check size={16} /> },
        ].map(({ label, value, color, icon }) => (
          <div key={label} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 14, padding: '18px 20px', display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(255,255,255,0.04)', display: 'flex', alignItems: 'center', justifyContent: 'center', color, flexShrink: 0 }}>{icon}</div>
            <div>
              <div style={{ fontSize: 26, fontWeight: 700, color, lineHeight: 1, letterSpacing: '-0.02em', marginBottom: 4 }}>{value}</div>
              <div style={{ fontSize: 11, color: 'var(--fg-3)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Module accordion */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {MODULES.map((mod, modIdx) => {
          const isExpanded = expandedModule === mod.id;
          const modLessons = mod.lessons.map(l => getLessonData(l));
          const publishedCount = modLessons.filter(l => l.is_published).length;
          const modCompletions = mod.lessons.reduce((sum, l) => sum + getLessonCompletions(l.id), 0);

          return (
            <motion.div
              key={mod.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: modIdx * 0.04 }}
              style={{ background: 'var(--bg-card)', border: `1px solid ${isExpanded ? 'rgba(196,240,228,0.2)' : 'var(--border)'}`, borderRadius: 14, overflow: 'hidden', transition: 'border-color 0.2s' }}
            >
              {/* Module header */}
              <button
                style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 14, padding: '16px 20px', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', transition: 'background 0.15s' }}
                onClick={() => setExpandedModule(isExpanded ? null : mod.id)}
                onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.025)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'none')}
              >
                <div style={{ width: 34, height: 34, borderRadius: 10, background: 'rgba(196,240,228,0.08)', border: '1px solid rgba(196,240,228,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <span className="font-aboreto" style={{ fontSize: 13, color: 'var(--accent)', lineHeight: 1 }}>{mod.order_index}</span>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--fg)', marginBottom: 2 }}>{mod.title}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 11, color: 'var(--fg-3)' }}>
                    <span>{mod.etapa}</span>
                    <span>·</span>
                    <span>{mod.lessons.length} lecții</span>
                    <span>·</span>
                    <span style={{ color: '#4ade80' }}>{publishedCount} publicate</span>
                    <span>·</span>
                    <span style={{ color: 'var(--gold)' }}>{modCompletions} completări</span>
                  </div>
                </div>
                {/* Progress bar for module */}
                <div style={{ width: 80, height: 4, background: 'rgba(255,255,255,0.06)', borderRadius: 2, overflow: 'hidden', flexShrink: 0 }}>
                  <div style={{ width: `${mod.lessons.length > 0 ? (publishedCount / mod.lessons.length) * 100 : 0}%`, height: '100%', background: '#4ade80', borderRadius: 2 }} />
                </div>
                <div style={{ color: 'var(--fg-3)', flexShrink: 0 }}>
                  {isExpanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                </div>
              </button>

              <AnimatePresence initial={false}>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: 'auto' }}
                    exit={{ height: 0 }}
                    transition={{ duration: 0.22 }}
                    style={{ overflow: 'hidden', borderTop: '1px solid var(--border)' }}
                  >
                    {/* Lessons */}
                    {modLessons.map((lesson, lIdx) => {
                      const isEditing = editingLesson === lesson.id;
                      const completions = getLessonCompletions(lesson.id);

                      return (
                        <div
                          key={lesson.id}
                          style={{
                            borderBottom: lIdx < modLessons.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                            borderLeft: lesson.is_published ? '3px solid var(--accent)' : '3px solid transparent',
                            opacity: lesson.is_published ? 1 : 0.6,
                            transition: 'all 0.15s',
                          }}
                        >
                          {isEditing ? (
                            <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
                              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                                <div style={{ gridColumn: '1 / -1' }}>
                                  <label style={{ fontSize: 11, color: 'var(--fg-3)', marginBottom: 4, display: 'block' }}>Titlu</label>
                                  <input value={editForm.title} onChange={e => setEditForm(f => ({ ...f, title: e.target.value }))} style={{ width: '100%', padding: '8px 10px', background: 'var(--bg-3)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--fg)', fontSize: 13, boxSizing: 'border-box' }} />
                                </div>
                                <div>
                                  <label style={{ fontSize: 11, color: 'var(--fg-3)', marginBottom: 4, display: 'block' }}>URL Video</label>
                                  <input value={editForm.video_url} onChange={e => setEditForm(f => ({ ...f, video_url: e.target.value }))} placeholder="https://youtube.com/..." style={{ width: '100%', padding: '8px 10px', background: 'var(--bg-3)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--fg)', fontSize: 13, boxSizing: 'border-box' }} />
                                </div>
                                <div>
                                  <label style={{ fontSize: 11, color: 'var(--fg-3)', marginBottom: 4, display: 'block' }}>URL PDF</label>
                                  <input value={editForm.pdf_url} onChange={e => setEditForm(f => ({ ...f, pdf_url: e.target.value }))} placeholder="https://..." style={{ width: '100%', padding: '8px 10px', background: 'var(--bg-3)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--fg)', fontSize: 13, boxSizing: 'border-box' }} />
                                </div>
                                <div>
                                  <label style={{ fontSize: 11, color: 'var(--fg-3)', marginBottom: 4, display: 'block' }}>Durată (minute)</label>
                                  <input type="number" value={editForm.duration_min} onChange={e => setEditForm(f => ({ ...f, duration_min: Number(e.target.value) }))} style={{ width: '100%', padding: '8px 10px', background: 'var(--bg-3)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--fg)', fontSize: 13, boxSizing: 'border-box' }} />
                                </div>
                                <div>
                                  <label style={{ fontSize: 11, color: 'var(--fg-3)', marginBottom: 4, display: 'block' }}>Descriere</label>
                                  <input value={editForm.description} onChange={e => setEditForm(f => ({ ...f, description: e.target.value }))} style={{ width: '100%', padding: '8px 10px', background: 'var(--bg-3)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--fg)', fontSize: 13, boxSizing: 'border-box' }} />
                                </div>
                              </div>
                              <div style={{ display: 'flex', gap: 8 }}>
                                <button onClick={() => saveEdit(lesson.id)} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '7px 14px', background: 'var(--accent)', color: '#0D0907', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 12, fontWeight: 700 }}>
                                  <Check size={13} /> Salvează
                                </button>
                                <button onClick={() => setEditingLesson(null)} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '7px 14px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', borderRadius: 8, cursor: 'pointer', fontSize: 12, color: 'var(--fg-3)' }}>
                                  <X size={13} /> Anulează
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 20px' }}>
                              {/* Order */}
                              <div style={{ width: 24, height: 24, borderRadius: 6, background: 'rgba(255,255,255,0.04)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, color: 'var(--fg-3)', flexShrink: 0 }}>
                                {lesson.order_index}
                              </div>
                              {/* Info */}
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--fg)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: 2 }}>
                                  {lesson.title}
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11, color: 'var(--fg-3)' }}>
                                  <span>{lesson.duration_min} min</span>
                                  {lesson.video_url && <span style={{ display: 'flex', alignItems: 'center', gap: 3, color: '#60a5fa' }}><Video size={10} /> video</span>}
                                  {lesson.pdf_url && <span style={{ display: 'flex', alignItems: 'center', gap: 3, color: 'var(--accent)' }}><FileText size={10} /> PDF</span>}
                                </div>
                              </div>
                              {/* Completions */}
                              <div style={{ fontSize: 11, color: 'var(--gold)', background: 'var(--gold-dim)', border: '1px solid rgba(201,169,110,0.2)', padding: '2px 8px', borderRadius: 99, flexShrink: 0 }}>
                                {completions} completări
                              </div>
                              {/* Published badge */}
                              <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 99, background: lesson.is_published ? 'rgba(74,222,128,0.1)' : 'rgba(255,255,255,0.04)', color: lesson.is_published ? '#4ade80' : 'var(--fg-3)', border: `1px solid ${lesson.is_published ? 'rgba(74,222,128,0.25)' : 'var(--border)'}`, flexShrink: 0 }}>
                                {lesson.is_published ? 'Publicat' : 'Draft'}
                              </span>
                              {/* Actions */}
                              <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
                                <button onClick={() => togglePublish(lesson.id, lesson.is_published)} title={lesson.is_published ? 'Retrage' : 'Publică'} style={{ width: 28, height: 28, borderRadius: 7, background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--fg-3)', transition: 'background 0.15s' }}
                                  onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.08)')}
                                  onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.04)')}
                                >
                                  {lesson.is_published ? <EyeOff size={13} /> : <Eye size={13} />}
                                </button>
                                <button onClick={() => startEdit(mod.lessons.find(l => l.id === lesson.id) || mod.lessons[0])} title="Editează" style={{ width: 28, height: 28, borderRadius: 7, background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--fg-3)', transition: 'background 0.15s' }}
                                  onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.08)')}
                                  onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.04)')}
                                >
                                  <Edit2 size={13} />
                                </button>
                                <button title="Șterge" style={{ width: 28, height: 28, borderRadius: 7, background: 'rgba(248,113,113,0.06)', border: '1px solid rgba(248,113,113,0.15)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f87171', transition: 'background 0.15s' }}
                                  onMouseEnter={e => (e.currentTarget.style.background = 'rgba(248,113,113,0.12)')}
                                  onMouseLeave={e => (e.currentTarget.style.background = 'rgba(248,113,113,0.06)')}
                                >
                                  <Trash2 size={13} />
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}

                    {/* Add lesson */}
                    <div style={{ borderTop: '1px solid var(--border)', padding: '12px 20px' }}>
                      {addingTo === mod.id ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                          <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--fg)', marginBottom: 4 }}>Lecție nouă</div>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                            <div style={{ gridColumn: '1 / -1' }}>
                              <input value={addForm.title} onChange={e => setAddForm(f => ({ ...f, title: e.target.value }))} placeholder="Titlul lecției" style={{ width: '100%', padding: '8px 10px', background: 'var(--bg-3)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--fg)', fontSize: 13, boxSizing: 'border-box' }} />
                            </div>
                            <input value={addForm.video_url} onChange={e => setAddForm(f => ({ ...f, video_url: e.target.value }))} placeholder="URL Video" style={{ padding: '8px 10px', background: 'var(--bg-3)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--fg)', fontSize: 13 }} />
                            <input value={addForm.pdf_url} onChange={e => setAddForm(f => ({ ...f, pdf_url: e.target.value }))} placeholder="URL PDF" style={{ padding: '8px 10px', background: 'var(--bg-3)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--fg)', fontSize: 13 }} />
                          </div>
                          <div style={{ display: 'flex', gap: 8 }}>
                            <button onClick={() => setAddingTo(null)} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '7px 14px', background: 'var(--accent)', color: '#0D0907', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 12, fontWeight: 700 }}>
                              <Check size={13} /> Salvează
                            </button>
                            <button onClick={() => setAddingTo(null)} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '7px 14px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', borderRadius: 8, cursor: 'pointer', fontSize: 12, color: 'var(--fg-3)' }}>
                              <X size={13} /> Anulează
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => { setAddingTo(mod.id); setAddForm({ ...EMPTY_FORM }); }}
                          style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--fg-3)', background: 'none', border: 'none', cursor: 'pointer', transition: 'color 0.15s', padding: 0 }}
                          onMouseEnter={e => (e.currentTarget.style.color = 'var(--accent)')}
                          onMouseLeave={e => (e.currentTarget.style.color = 'var(--fg-3)')}
                        >
                          <Plus size={14} /> Adaugă lecție
                        </button>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
