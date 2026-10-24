import React from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Plus, FileText, Download, Trash2, X, ExternalLink } from 'lucide-react';

interface Material {
  id: string;
  course_id: string;
  title: string;
  description: string | null;
  topic: string | null;
  file_path: string | null;
  file_name: string | null;
  external_url: string | null;
  created_at: string;
}

const box: React.CSSProperties = {
  background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 18,
  padding: 20, display: 'flex', flexDirection: 'column', gap: 10,
};
const input: React.CSSProperties = {
  width: '100%', padding: '10px 12px', borderRadius: 10, border: '1px solid var(--border)',
  background: 'var(--bg-2, var(--bg))', color: 'var(--fg)', font: 'inherit', fontSize: 13.5,
};
const btn: React.CSSProperties = {
  display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 16px', borderRadius: 10,
  border: '1px solid var(--gold)', background: 'transparent', color: 'var(--gold)',
  font: 'inherit', fontSize: 13, fontWeight: 600, cursor: 'pointer',
};

export const LibraryUploads: React.FC<{ courseId: string; isAdmin: boolean; readOnly?: boolean; onCountChange?: (count: number) => void }> = ({ courseId, isAdmin, readOnly = false, onCountChange }) => {
  const [items, setItems] = React.useState<Material[]>([]);
  const [open, setOpen] = React.useState(false);
  const [busy, setBusy] = React.useState(false);
  const [err, setErr] = React.useState('');
  const [loading, setLoading] = React.useState(true);
  const [form, setForm] = React.useState({ title: '', description: '', topic: '', url: '' });
  const [file, setFile] = React.useState<File | null>(null);

  const load = React.useCallback(async () => {
    setLoading(true);
    setItems([]);
    onCountChange?.(0);
    const { data, error } = await supabase.from('library_materials').select('*')
      .eq('course_id', courseId).order('created_at', { ascending: false });
    setItems((data as Material[]) || []);
    onCountChange?.(data?.length ?? 0);
    setErr(error ? 'Les documents n’ont pas pu être chargés.' : '');
    setLoading(false);
  }, [courseId, onCountChange]);
  React.useEffect(() => { load(); }, [load]);

  const save = async () => {
    setErr('');
    if (!form.title.trim()) return setErr('Scrie un titlu.');
    if (!file && !form.url.trim()) return setErr('Atașează un fișier sau pune un link.');
    setBusy(true);
    try {
      let file_path: string | null = null;
      if (file) {
        const safe = file.name.normalize('NFD').replace(/[^\w.\-]+/g, '_');
        file_path = `${courseId}/${Date.now()}-${safe}`;
        const up = await supabase.storage.from('library-files').upload(file_path, file);
        if (up.error) throw up.error;
      }
      const { data: u } = await supabase.auth.getUser();
      const { error } = await supabase.from('library_materials').insert({
        course_id: courseId, title: form.title.trim(),
        description: form.description.trim() || null, topic: form.topic.trim() || null,
        file_path, file_name: file?.name ?? null,
        external_url: form.url.trim() || null, created_by: u.user?.id ?? null,
      });
      if (error) throw error;
      setForm({ title: '', description: '', topic: '', url: '' }); setFile(null); setOpen(false);
      load();
    } catch (e: any) {
      setErr('Nu s-a putut salva: ' + (e?.message || 'eroare'));
    } finally { setBusy(false); }
  };

  const openItem = async (m: Material) => {
    if (m.file_path) {
      const { data, error } = await supabase.storage.from('library-files').createSignedUrl(m.file_path, 600, { download: m.file_name || true });
      if (error) setErr('Nu s-a putut descărca documentul. Încearcă din nou.');
      if (data?.signedUrl) window.open(data.signedUrl, '_blank', 'noopener');
    } else if (m.external_url) window.open(m.external_url, '_blank', 'noopener');
  };

  const remove = async (m: Material) => {
    if (!confirm(`Ștergi „${m.title}"?`)) return;
    if (m.file_path) await supabase.storage.from('library-files').remove([m.file_path]);
    await supabase.from('library_materials').delete().eq('id', m.id);
    load();
  };

  if (!isAdmin && !readOnly && !loading && !err && items.length === 0) return null;

  return (
    <section style={{ marginBottom: 36 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
        <h2 className="font-aboreto" style={{ fontSize: 18, color: 'var(--fg)', margin: 0 }}>Documente & șabloane</h2>
        {isAdmin && !readOnly && !open && (
          <button style={btn} onClick={() => setOpen(true)}><Plus size={15} /> Adaugă document</button>
        )}
      </div>

      {isAdmin && !readOnly && open && (
        <div style={{ ...box, marginBottom: 16, borderColor: 'var(--gold)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <strong style={{ color: 'var(--fg)' }}>Document nou</strong>
            <button onClick={() => setOpen(false)} style={{ background: 'none', border: 0, color: 'var(--fg-3)', cursor: 'pointer' }}><X size={16} /></button>
          </div>
          <input style={input} placeholder="Titlu *" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
          <textarea style={{ ...input, minHeight: 70 }} placeholder="Descriere scurtă" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
          <input style={input} placeholder="Temă (ex: Vânzări, Șabloane)" value={form.topic} onChange={e => setForm({ ...form, topic: e.target.value })} />
          <label style={{ fontSize: 12.5, color: 'var(--fg-2)' }}>Fișier (PDF, Word, Excel… max 50 MB)</label>
          <input type="file" onChange={e => setFile(e.target.files?.[0] ?? null)} style={{ color: 'var(--fg-2)', fontSize: 13 }} />
          <input style={input} placeholder="sau link extern (Google Docs, Notion…)" value={form.url} onChange={e => setForm({ ...form, url: e.target.value })} />
          {err && <div style={{ color: 'var(--red, var(--destructive))', fontSize: 12.5 }}>{err}</div>}
          <div><button style={btn} disabled={busy} onClick={save}>{busy ? 'Se încarcă…' : 'Publică pentru studenți'}</button></div>
        </div>
      )}

      {!open && err && <p role="alert" className="text-destructive text-sm">{err}</p>}
      {loading ? <p className="text-muted-foreground text-sm">Se încarcă documentele…</p> : items.length === 0 ? (
        <p style={{ fontSize: 13, color: 'var(--fg-3)' }}>Încă nu ai adăugat documente pentru acest program.</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
          {items.map(m => (
            <div key={m.id} style={box}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--gold)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>
                <FileText size={13} /> {m.topic || 'Document'}
              </div>
              <h3 style={{ margin: 0, fontSize: 16, color: 'var(--fg)' }}>{m.title}</h3>
              {m.description && <p style={{ margin: 0, fontSize: 12.5, color: 'var(--fg-2)', lineHeight: 1.6, flex: 1 }}>{m.description}</p>}
              <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
                <button style={btn} onClick={() => openItem(m)}>
                  {m.file_path ? <><Download size={14} /> Descarcă</> : <><ExternalLink size={14} /> Deschide</>}
                </button>
                {isAdmin && !readOnly && (
                  <button style={{ ...btn, borderColor: 'var(--border)', color: 'var(--fg-3)' }} onClick={() => remove(m)} aria-label="Șterge"><Trash2 size={14} /></button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};
