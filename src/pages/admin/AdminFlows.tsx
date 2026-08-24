// @ts-nocheck
// Administrarea fluxurilor unui curs.
//
// Un flux e definit de trei lucruri: data de start (ancorează toate deblocările),
// canalul de comunicare, și calendarul propriu de întâlniri. Conținutul rămâne comun
// — nu se duplică nimic la deschiderea unui flux nou.
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { CalendarRange, Plus, Trash2, Save, Users, ExternalLink } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAdminCourseScope } from '../../hooks/useAdminCourseScope';
import { getCourseModules } from '../../lib/content';
import { moduleUnlockDate, flowAccessUntil } from '../../lib/flows';

/** Explicație în cuvinte a ferestrei de acces, ca adminul să nu ghicească din două câmpuri. */
function accessUntilLabel(flow: any): string {
  const until = flowAccessUntil(flow);
  if (!until) return 'Acces nelimitat. Completează o dată sau o durată ca să se închidă singur.';
  const d = until.toLocaleDateString('ro-RO', { day: 'numeric', month: 'long', year: 'numeric' });
  const past = until < new Date();
  const src = flow?.ends_on ? 'dată fixată manual' : `${flow.access_weeks} săptămâni de la start`;
  return past ? `Accesul s-a încheiat pe ${d} (${src}).` : `Accesul se încheie pe ${d} (${src}).`;
}

const slugify = (v: string) =>
  v.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

export const AdminFlows: React.FC = () => {
  const { course, courseId } = useAdminCourseScope();
  const [flows, setFlows] = useState<any[]>([]);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [events, setEvents] = useState<Record<string, any[]>>({});
  const [expanded, setExpanded] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const modules = useMemo(() => getCourseModules(courseId), [courseId]);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    const [cRes, eRes, evRes] = await Promise.all([
      supabase.from('flows').select('*').eq('course_id', courseId).order('starts_on', { ascending: false }),
      supabase.from('enrollments').select('flow_id').eq('course_id', courseId),
      supabase.from('flow_events').select('*').order('event_date'),
    ]);
    if (cRes.error) {
      setError(
        cRes.error.code === '42P01'
          ? 'Tabelul `flows` nu există încă — migrația fluxurilor nu e aplicată.'
          : cRes.error.message,
      );
      setLoading(false);
      return;
    }
    setFlows(cRes.data || []);
    const c: Record<string, number> = {};
    (eRes.data || []).forEach((r: any) => { if (r.flow_id) c[r.flow_id] = (c[r.flow_id] || 0) + 1; });
    setCounts(c);
    const ev: Record<string, any[]> = {};
    (evRes.data || []).forEach((r: any) => { (ev[r.flow_id] ||= []).push(r); });
    setEvents(ev);
    setLoading(false);
  }, [courseId]);

  useEffect(() => { load(); }, [load]);

  const addFlow = async () => {
    const n = flows.length + 1;
    const name = `Fluxul ${n}`;
    const { error: err } = await supabase.from('flows').insert({
      id: `${courseId}-f${n}`,
      course_id: courseId,
      name,
      slug: slugify(name),
      starts_on: new Date().toISOString().slice(0, 10),
    });
    if (err) { alert(err.message); return; }
    load();
  };

  const saveFlow = async (c: any) => {
    const { error: err } = await supabase.from('flows')
      .update({
        name: c.name, starts_on: c.starts_on, telegram_url: c.telegram_url,
        is_active: c.is_active, ends_on: c.ends_on || null,
        access_weeks: c.access_weeks === '' || c.access_weeks == null ? null : Number(c.access_weeks),
      })
      .eq('id', c.id);
    if (err) { alert(err.message); return; }
    load();
  };

  const deleteFlow = async (id: string) => {
    if ((counts[id] || 0) > 0) {
      alert('Fluxul are elevi înscriși. Mută-i întâi în alt flux.');
      return;
    }
    if (!confirm('Ștergi fluxul? Evenimentele lui se șterg odată cu el.')) return;
    await supabase.from('flows').delete().eq('id', id);
    load();
  };

  const addEvent = async (flowId: string) => {
    const { error: err } = await supabase.from('flow_events').insert({
      flow_id: flowId,
      type: 'zoom',
      title: 'Zoom de grup',
      event_date: new Date().toISOString().slice(0, 10),
      event_time: '19:00',
      duration: '90 min',
    });
    if (err) { alert(err.message); return; }
    load();
  };

  const saveEvent = async (e: any) => {
    const { error: err } = await supabase.from('flow_events')
      .update({ type: e.type, title: e.title, description: e.description, event_date: e.event_date, event_time: e.event_time, duration: e.duration })
      .eq('id', e.id);
    if (err) alert(err.message);
    else load();
  };

  const deleteEvent = async (id: string) => {
    await supabase.from('flow_events').delete().eq('id', id);
    load();
  };

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', padding: '28px 24px 60px' }}>
      <div style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
          <CalendarRange size={16} style={{ color: 'var(--gold)' }} />
          <h1 className="font-aboreto" style={{ fontSize: 18, color: 'var(--fg)' }}>Fluxuri</h1>
          {course && <span style={{ fontSize: 11, color: 'var(--fg-3)', padding: '2px 8px', borderRadius: 99, border: '1px solid var(--border)' }}>{course.shortTitle}</span>}
        </div>
        <p style={{ fontSize: 12.5, color: 'var(--fg-3)', lineHeight: 1.6, maxWidth: 660 }}>
          Data de start ancorează toate deblocările: modulul din săptămâna 3 se deschide la start + 21 de zile,
          pentru fiecare flux la data lui. Conținutul rămâne comun — deschiderea unui flux nou nu duplică nimic.
        </p>
      </div>

      {error && (
        <div style={{ padding: '12px 14px', borderRadius: 10, background: 'var(--error-dim)', border: '1px solid var(--border)', color: 'var(--error)', fontSize: 12.5, marginBottom: 16 }}>
          {error}
        </div>
      )}

      <button
        onClick={addFlow}
        disabled={!!error}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 8,
          background: 'var(--gold-dim)', color: 'var(--gold)', border: '1px solid var(--border-hi)',
          cursor: error ? 'not-allowed' : 'pointer', fontSize: 12.5, fontWeight: 600, marginBottom: 18,
          opacity: error ? 0.5 : 1,
        }}
      >
        <Plus size={14} /> Flux nou
      </button>

      {loading ? (
        <div style={{ padding: 30, color: 'var(--fg-3)', fontSize: 13 }}>Se încarcă…</div>
      ) : (
        <div style={{ display: 'grid', gap: 12 }}>
          {flows.map(c => {
            const isOpen = expanded === c.id;
            const evts = events[c.id] || [];
            return (
              <div key={c.id} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 14, padding: 16 }}>
                <div className="aa-stack-sm" style={{ display: 'grid', gridTemplateColumns: 'minmax(120px,1fr) 130px minmax(160px,1.2fr) auto auto', gap: 10, alignItems: 'end' }}>
                  <Field label="Nume" value={c.name} onChange={v => setFlows(p => p.map(x => x.id === c.id ? { ...x, name: v } : x))} />
                  <Field label="Start" type="date" value={c.starts_on} onChange={v => setFlows(p => p.map(x => x.id === c.id ? { ...x, starts_on: v } : x))} />
                  <Field label="Grup Telegram" value={c.telegram_url || ''} placeholder="https://t.me/…" onChange={v => setFlows(p => p.map(x => x.id === c.id ? { ...x, telegram_url: v } : x))} />
                  <button onClick={() => saveFlow(c)} title="Salvează" style={iconBtn('var(--accent)')}><Save size={14} /></button>
                  <button onClick={() => deleteFlow(c.id)} title="Șterge fluxul" style={iconBtn('var(--error)')}><Trash2 size={14} /></button>
                </div>

                {/* Fereastra de acces. Data explicită bate durata: dacă e completată,
                    `access_weeks` devine doar o notă informativă. */}
                <div className="aa-stack-sm" style={{ display: 'grid', gridTemplateColumns: '150px 150px 1fr', gap: 10, alignItems: 'end', marginTop: 10 }}>
                  <Field label="Acces până la (manual)" type="date" value={c.ends_on || ''} onChange={v => setFlows(p => p.map(x => x.id === c.id ? { ...x, ends_on: v || null } : x))} />
                  <Field label="…sau durată (săptămâni)" type="number" value={c.access_weeks ?? ''} onChange={v => setFlows(p => p.map(x => x.id === c.id ? { ...x, access_weeks: v === '' ? null : Number(v) } : x))} />
                  <p style={{ fontSize: 11, color: 'var(--fg-3)', lineHeight: 1.5, margin: 0 }}>
                    {accessUntilLabel(c)}
                  </p>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginTop: 12, flexWrap: 'wrap' }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 11.5, color: 'var(--fg-3)' }}>
                    <Users size={12} /> {counts[c.id] || 0} elevi
                  </span>
                  {c.telegram_url && (
                    <a href={c.telegram_url} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11.5, color: 'var(--accent)', textDecoration: 'none' }}>
                      canal <ExternalLink size={11} />
                    </a>
                  )}
                  <button onClick={() => setExpanded(isOpen ? null : c.id)} style={{ background: 'none', border: 'none', color: 'var(--fg-2)', cursor: 'pointer', fontSize: 11.5, textDecoration: 'underline' }}>
                    {isOpen ? 'Ascunde calendarul' : `Calendar (${evts.length} evenimente)`}
                  </button>
                </div>

                {/* Previzualizarea deblocărilor — dovada că data de start face ce trebuie */}
                <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid var(--border)' }}>
                  <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--fg-3)', marginBottom: 8 }}>
                    Când se deschid modulele
                  </div>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {modules.map((m: any) => {
                      const at = moduleUnlockDate(m, c);
                      const past = at && at <= new Date();
                      return (
                        <span key={m.id} title={m.title} style={{
                          fontSize: 10.5, padding: '3px 8px', borderRadius: 99,
                          background: past ? 'var(--ok-dim)' : 'var(--bg-3)',
                          color: past ? 'var(--ok)' : 'var(--fg-3)',
                          border: '1px solid var(--border)',
                        }}>
                          {m.etapa}: {at ? at.toLocaleDateString('ro-RO', { day: 'numeric', month: 'short' }) : 'deschis'}
                        </span>
                      );
                    })}
                  </div>
                </div>

                {isOpen && (
                  <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid var(--border)' }}>
                    <button onClick={() => addEvent(c.id)} style={{ ...iconBtn('var(--accent)'), width: 'auto', padding: '5px 11px', gap: 5, fontSize: 11.5, fontWeight: 600 }}>
                      <Plus size={12} /> Eveniment
                    </button>
                    <div style={{ display: 'grid', gap: 8, marginTop: 10 }}>
                      {evts.map(e => (
                        <div key={e.id} className="aa-stack-sm" style={{ display: 'grid', gridTemplateColumns: '100px minmax(140px,1.6fr) 120px 90px 90px auto auto', gap: 8, alignItems: 'end' }}>
                          <SelectField label="Tip" value={e.type} options={[['zoom', 'Zoom'], ['workshop', 'Workshop']]} onChange={v => setEvents(p => ({ ...p, [c.id]: p[c.id].map(x => x.id === e.id ? { ...x, type: v } : x) }))} />
                          <Field label="Titlu" value={e.title} onChange={v => setEvents(p => ({ ...p, [c.id]: p[c.id].map(x => x.id === e.id ? { ...x, title: v } : x) }))} />
                          <Field label="Data" type="date" value={e.event_date} onChange={v => setEvents(p => ({ ...p, [c.id]: p[c.id].map(x => x.id === e.id ? { ...x, event_date: v } : x) }))} />
                          <Field label="Ora" value={e.event_time || ''} onChange={v => setEvents(p => ({ ...p, [c.id]: p[c.id].map(x => x.id === e.id ? { ...x, event_time: v } : x) }))} />
                          <Field label="Durată" value={e.duration || ''} onChange={v => setEvents(p => ({ ...p, [c.id]: p[c.id].map(x => x.id === e.id ? { ...x, duration: v } : x) }))} />
                          <button onClick={() => saveEvent(e)} title="Salvează" style={iconBtn('var(--accent)')}><Save size={13} /></button>
                          <button onClick={() => deleteEvent(e.id)} title="Șterge" style={iconBtn('var(--error)')}><Trash2 size={13} /></button>
                        </div>
                      ))}
                      {evts.length === 0 && (
                        <p style={{ fontSize: 12, color: 'var(--fg-3)', margin: '6px 0 0' }}>
                          Fluxul nu are încă întâlniri programate. Fără ele, calendarul elevului rămâne gol.
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
          {flows.length === 0 && !error && (
            <p style={{ fontSize: 13, color: 'var(--fg-3)' }}>Cursul n-are încă niciun flux.</p>
          )}
        </div>
      )}
    </div>
  );
};

const iconBtn = (color: string): React.CSSProperties => ({
  height: 30, minWidth: 30, display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
  background: 'transparent', border: '1px solid var(--border)', borderRadius: 8, color, cursor: 'pointer',
});

const Field: React.FC<{ label: string; value: string; onChange: (v: string) => void; type?: string; placeholder?: string }> =
  ({ label, value, onChange, type = 'text', placeholder }) => (
    <label style={{ display: 'block', minWidth: 0 }}>
      <span style={{ display: 'block', fontSize: 10, color: 'var(--fg-3)', marginBottom: 4 }}>{label}</span>
      <input
        type={type} value={value} placeholder={placeholder}
        onChange={e => onChange(e.target.value)}
        style={{ width: '100%', padding: '6px 9px', borderRadius: 7, background: 'var(--bg-3)', border: '1px solid var(--border)', color: 'var(--fg)', fontSize: 12, outline: 'none' }}
      />
    </label>
  );

const SelectField: React.FC<{ label: string; value: string; options: [string, string][]; onChange: (v: string) => void }> =
  ({ label, value, options, onChange }) => (
    <label style={{ display: 'block', minWidth: 0 }}>
      <span style={{ display: 'block', fontSize: 10, color: 'var(--fg-3)', marginBottom: 4 }}>{label}</span>
      <select
        value={value} onChange={e => onChange(e.target.value)}
        style={{ width: '100%', padding: '6px 9px', borderRadius: 7, background: 'var(--bg-3)', border: '1px solid var(--border)', color: 'var(--fg)', fontSize: 12, outline: 'none', cursor: 'pointer' }}
      >
        {options.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
      </select>
    </label>
  );
