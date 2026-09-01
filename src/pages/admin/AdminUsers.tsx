// @ts-nocheck
// Utilizatorii platformei — vederea completă a adminului.
//
// Înainte, pagina trăia „în interiorul" unui program: whitelist-ul era interogat cu
// `.eq('course_id', courseId)`, coloana Tarif arăta o singură înscriere, iar chipurile
// de filtrare erau literalmente ['all','student','designer','arhitect'] — treptele
// Business, desenate și peste elevii de la START. Un elev cu treapta „Singur" nu apărea
// sub niciun filtru: apăsai „Student" și primeai „Niciun utilizator corespunde".
//
// Acum adminul vede TOT, iar programul e o coloană și un filtru (AdminScopeBar).
// Un om înscris la două programe are două rânduri de acces, fiecare cu treapta și
// fluxul lui — nu un adevăr care se schimbă după un comutator din bara laterală.
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from '@/lib/router-compat';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, ChevronDown, ChevronUp, Shield, Search, X, RefreshCw, CheckCircle2, Link2, ShieldOff } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { timeAgo } from '../../lib/activity';
import {
  fetchAdminUsers, fetchAllProgress, setUserAdmin,
  AdminUserRow, AdminProgressRow, matchesScope, userQuizDone,
} from '../../lib/adminData';
import { useAdminCourseScope } from '@/hooks/useAdminCourseScope';
import { AdminScopeBar } from '../../components/admin/AdminScopeBar';
import { courseLessonIndex, overallPct, doneByUser } from '@/lib/adminProgress';
import {
  activeCourses, getCourse, courseTiers, getTier, defaultTier, TIER_ACCENT, COURSE_ACCENT,
  parseTariffFilter,
} from '@/lib/courses';
import { fetchFlows, type Flow } from '@/lib/flows';
import type { Tariff } from '../../lib/types';

interface WLEntry { email: string; tariff: Tariff; course_id: string; added_at?: string; }

/** Culoarea insignei de treaptă, citită din definiția PROGRAMULUI, nu ghicită. */
const tierStyle = (courseId: string, tierId: Tariff) => {
  const a = TIER_ACCENT[getTier(courseId, tierId)?.accent || 'neutral'];
  return { color: a.fg, bg: a.bg, border: 'var(--border-hi)' };
};

export const AdminUsers: React.FC = () => {
  const { courseId, flowId, tariffId } = useAdminCourseScope();
  const navigate = useNavigate();
  const courses = activeCourses();

  const [users, setUsers] = useState<AdminUserRow[]>([]);
  const [progress, setProgress] = useState<AdminProgressRow[]>([]);
  const [whitelist, setWhitelist] = useState<WLEntry[]>([]);
  // Fluxurile TUTUROR programelor, o dată: selectorul de flux de pe rând trebuie să
  // ofere fluxurile programului acelei înscrieri, nu ale programului filtrat acum.
  const [allFlows, setAllFlows] = useState<Flow[]>([]);
  const [expandedUser, setExpandedUser] = useState<string | null>(null);
  const [newEmail, setNewEmail] = useState('');
  const [newCourse, setNewCourse] = useState<string>(courses[0]?.id || 'business');
  const [newTariff, setNewTariff] = useState<Tariff>(defaultTier(courses[0]?.id)?.id || 'student');
  const [confirmRemove, setConfirmRemove] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [addSuccess, setAddSuccess] = useState('');
  const [addError, setAddError] = useState('');
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    setLoading(true);
    const [u, p, wl, fl] = await Promise.all([
      fetchAdminUsers(),
      fetchAllProgress(),
      supabase.from('whitelist').select('email,tariff,course_id,added_at').order('added_at', { ascending: false })
        .then(r => (r.error?.code === '42703'
          // Fără coloana `course_id` există o singură listă — cea dinaintea multicursului.
          ? supabase.from('whitelist').select('email,tariff,added_at').order('added_at', { ascending: false })
          : r)),
      fetchFlows(null),
    ]);
    setUsers(u);
    setProgress(p);
    setWhitelist(((wl.data || []) as any[]).map(e => ({ ...e, course_id: e.course_id || 'business' })));
    setAllFlows(fl);
    setLoading(false);
  }, []);

  useEffect(() => { reload(); }, [reload]);

  // Formularul de adăugare urmează filtrul: dacă adminul se uită la START, adaugă
  // implicit la START. Fără filtru, rămâne pe alegerea lui.
  useEffect(() => { if (courseId) setNewCourse(courseId); }, [courseId]);

  // Treapta aparține unui program. La schimbarea programului din formular o resetăm
  // pe prima a programului nou — altfel ai scrie 'student' într-o înscriere la START,
  // unde treapta asta nu există și niciun filtru n-ar mai găsi omul.
  useEffect(() => {
    if (!courseTiers(newCourse).some(t => t.id === newTariff)) {
      setNewTariff(defaultTier(newCourse)?.id || 'student');
    }
  }, [newCourse, newTariff]);

  const doneMap = React.useMemo(() => doneByUser(progress), [progress]);
  // Un index de lecții per program: procentul se calculează în programul lui, nu
  // într-unul ales global. Altfel lecțiile de la START s-ar împărți la totalul Business.
  const indexes = React.useMemo(() => {
    const m: Record<string, ReturnType<typeof courseLessonIndex>> = {};
    courses.forEach(c => { m[c.id] = courseLessonIndex(c.id); });
    return m;
  }, [courses]);

  const pctFor = (userId: string, cid: string) =>
    overallPct(indexes[cid] || courseLessonIndex(cid), doneMap[userId] || new Set());

  const flowsOf = (cid: string) => allFlows.filter(f => f.course_id === cid);
  const flowName = (id: string | null) => allFlows.find(f => f.id === id)?.name || null;

  // ── Lista de acces ──────────────────────────────────────────────────────────

  const handleAddWhitelist = async () => {
    setAddError('');
    const email = newEmail.trim().toLowerCase();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setAddError('Adresa de email nu este validă.');
      return;
    }
    const { error } = await supabase.from('whitelist').insert({ email, tariff: newTariff, course_id: newCourse });
    if (error) {
      if (error.code === '23505') setAddError(`${email} este deja în lista de acces pentru ${getCourse(newCourse)?.shortTitle}.`);
      else setAddError(error.message);
      return;
    }
    setNewEmail(''); setShowAddForm(false);
    setAddSuccess(`✓ ${email} · acces la ${getCourse(newCourse)?.shortTitle}, treapta ${getTier(newCourse, newTariff)?.label}.`);
    setTimeout(() => setAddSuccess(''), 4000);
    reload();
  };

  const handleCopyLink = (email: string) => {
    const link = `${window.location.origin}/register?email=${encodeURIComponent(email)}`;
    navigator.clipboard.writeText(link).then(() => {
      setCopiedLink(email);
      setTimeout(() => setCopiedLink(null), 2500);
    });
  };

  // Cheia unui rând e (email, program): același om poate fi preautorizat la ambele.
  const wlKey = (e: WLEntry) => `${e.course_id}:${e.email}`;

  const handleRemoveWhitelist = async (entry: WLEntry) => {
    const key = wlKey(entry);
    if (confirmRemove !== key) {
      setConfirmRemove(key);
      setTimeout(() => setConfirmRemove(null), 3000);
      return;
    }
    await supabase.from('whitelist').delete().eq('course_id', entry.course_id).eq('email', entry.email);
    setConfirmRemove(null);
    reload();
  };

  const handleChangeWhitelistTariff = async (entry: WLEntry, tariff: Tariff) => {
    const { error } = await supabase.from('whitelist').update({ tariff })
      .eq('email', entry.email.toLowerCase()).eq('course_id', entry.course_id);
    if (error) { alert('Eroare: ' + error.message); return; }
    reload();
  };

  // ── Înscrieri ───────────────────────────────────────────────────────────────

  const handleToggleAdmin = async (user: AdminUserRow) => {
    if (user.email === 'babaradumi@gmail.com' && user.is_admin) return; // ultima ușă
    const { error } = await setUserAdmin(user.id, !user.is_admin);
    if (!error) reload(); else alert(error);
  };

  const handleChangeTariff = async (user: AdminUserRow, cid: string, tariff: Tariff) => {
    const { error } = await supabase.from('enrollments')
      .upsert({ user_id: user.id, course_id: cid, tariff }, { onConflict: 'user_id,course_id' });
    if (error) { alert('Eroare la actualizarea înscrierii: ' + error.message); return; }
    // Whitelist-ul rămâne în sincron pentru o eventuală re-înregistrare, dar doar la
    // programul atins — altfel am schimba treapta și la celelalte.
    await supabase.from('whitelist').update({ tariff })
      .eq('email', user.email.toLowerCase()).eq('course_id', cid);
    reload();
  };

  /** Mută elevul într-un flux: îi schimbă datele de deblocare, calendarul și Telegramul. */
  const handleChangeFlow = async (user: AdminUserRow, cid: string, tariff: Tariff, flow: string) => {
    const { error } = await supabase.from('enrollments')
      .upsert({ user_id: user.id, course_id: cid, tariff, flow_id: flow || null }, { onConflict: 'user_id,course_id' });
    if (error) { alert('Eroare la mutarea în flux: ' + error.message); return; }
    reload();
  };

  const handleGrant = async (user: AdminUserRow, cid: string) => {
    const tariff = defaultTier(cid)?.id || 'student';
    const { error } = await supabase.from('enrollments')
      .upsert({ user_id: user.id, course_id: cid, tariff }, { onConflict: 'user_id,course_id' });
    if (error) { alert('Eroare la înscriere: ' + error.message); return; }
    reload();
  };

  const handleRevoke = async (user: AdminUserRow, cid: string) => {
    const key = `enr:${user.id}:${cid}`;
    if (confirmRemove !== key) {
      setConfirmRemove(key);
      setTimeout(() => setConfirmRemove(null), 3000);
      return;
    }
    const { error } = await supabase.from('enrollments').delete().eq('user_id', user.id).eq('course_id', cid);
    setConfirmRemove(null);
    if (error) { alert('Eroare la retragerea accesului: ' + error.message); return; }
    reload();
  };

  // ── Filtrare ────────────────────────────────────────────────────────────────

  const filteredUsers = users.filter(u => {
    const q = search.trim().toLowerCase();
    const matchSearch = !q || u.full_name?.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
    return matchSearch && matchesScope(u, { courseId, flowId, tariffId });
  });

  // Lista de acces respectă aceleași axe. Fluxul nu se aplică: preautorizarea e
  // dinainte de cont, deci dinainte de flux.
  const wlTier = parseTariffFilter(tariffId);
  const filteredWhitelist = whitelist.filter(e =>
    (!courseId || e.course_id === courseId) &&
    (!wlTier || (e.course_id === wlTier.courseId && e.tariff === wlTier.tierId)) &&
    (!search.trim() || e.email.toLowerCase().includes(search.trim().toLowerCase())));

  const totalAdmins = users.filter(u => u.is_admin).length;
  const scopedCourses = courseId ? courses.filter(c => c.id === courseId) : courses;

  const scopeSummary = (() => {
    const bits: string[] = [];
    bits.push(courseId ? getCourse(courseId)?.title || courseId : 'toate programele');
    if (flowId) bits.push(flowName(flowId) || 'flux necunoscut');
    if (wlTier) bits.push(`treapta ${getTier(wlTier.courseId, wlTier.tierId)?.label || wlTier.tierId}`);
    return `${filteredUsers.length} din ${users.length} utilizatori · ${bits.join(' · ')}`;
  })();

  const GRID = '34px minmax(200px,1fr) minmax(230px,1.3fr) 110px 120px 96px 120px 30px';

  return (
    <div style={{ maxWidth: 1240, margin: '0 auto', padding: '32px 24px' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 className="font-aboreto" style={{ fontSize: 22, color: 'var(--fg)', marginBottom: 4 }}>Utilizatori</h1>
          <p style={{ fontSize: 13, color: 'var(--fg-3)' }}>Toate conturile și lista de acces, din toate programele</p>
        </div>
        <button onClick={reload} className="aa-tap" style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', borderRadius: 8, cursor: 'pointer', fontSize: 12, color: 'var(--fg-2)' }}>
          <RefreshCw size={13} className={loading ? 'animate-spin' : ''} /> Reîncarcă
        </button>
      </div>

      <AdminScopeBar summary={scopeSummary} />

      <AnimatePresence>
        {addSuccess && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
            style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 16px', background: 'var(--ok-dim)', border: '1px solid rgba(74,222,128,0.25)', borderRadius: 10, marginBottom: 16, fontSize: 13, color: 'var(--ok)' }}>
            <CheckCircle2 size={15} /> {addSuccess}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Cifrele urmăresc filtrul: altfel „Total" ar contrazice lista de dedesubt. */}
      <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0,1fr))', gap: 12, marginBottom: 20 }}>
        {[
          { label: 'Utilizatori în filtru', value: filteredUsers.length, color: 'var(--fg)' },
          { label: 'Cu acces', value: filteredUsers.filter(u => u.enrollments.length > 0).length, color: 'var(--accent)' },
          { label: 'Administratori', value: totalAdmins, color: 'var(--info)' },
          { label: 'În lista de acces', value: filteredWhitelist.length, color: 'var(--gold)' },
        ].map(({ label, value, color }) => (
          <div key={label} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 14, padding: '16px 18px' }}>
            <div style={{ fontSize: 26, fontWeight: 700, color, lineHeight: 1, marginBottom: 6 }}>{value}</div>
            <div style={{ fontSize: 10.5, color: 'var(--fg-3)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</div>
          </div>
        ))}
      </div>

      {/* ── Lista de acces ─────────────────────────────────────────────────── */}
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 16, padding: '20px 24px', marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--fg)', marginBottom: 2 }}>Lista de acces ({filteredWhitelist.length})</div>
            <div style={{ fontSize: 12, color: 'var(--fg-3)' }}>Emailuri preautorizate să-și facă cont. Fiecare rând e o pereche email · program.</div>
          </div>
          <button onClick={() => setShowAddForm(f => !f)} className="aa-tap"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 14px', background: showAddForm ? 'rgba(255,255,255,0.05)' : 'var(--accent)', color: showAddForm ? 'var(--fg-3)' : '#0D0907', border: showAddForm ? '1px solid var(--border)' : 'none', borderRadius: 8, cursor: 'pointer', fontSize: 12, fontWeight: 700 }}>
            {showAddForm ? <><X size={13} /> Anulează</> : <><Plus size={13} /> Adaugă</>}
          </button>
        </div>

        <AnimatePresence>
          {showAddForm && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} style={{ overflow: 'hidden' }}>
              <div style={{ borderTop: '1px solid var(--border)', marginTop: 16, paddingTop: 16, display: 'flex', flexDirection: 'column', gap: 14 }}>
                {addError && (
                  <div style={{ padding: '8px 12px', background: 'var(--error-dim)', border: '1px solid rgba(248,113,113,0.2)', borderRadius: 8, fontSize: 12, color: 'var(--error)' }}>{addError}</div>
                )}
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  <input type="email" value={newEmail} onChange={e => { setNewEmail(e.target.value); if (addError) setAddError(''); }}
                    placeholder="email@exemplu.ro" onKeyDown={e => e.key === 'Enter' && handleAddWhitelist()}
                    style={{ flex: '1 1 220px', minHeight: 40, padding: '9px 12px', background: 'var(--bg-3)', border: `1px solid ${addError ? 'rgba(248,113,113,0.5)' : 'var(--border)'}`, borderRadius: 8, color: 'var(--fg)', fontSize: 13 }} />
                  <button onClick={handleAddWhitelist} className="aa-tap"
                    style={{ padding: '9px 18px', background: 'var(--accent)', color: '#0D0907', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 700 }}>
                    <Plus size={14} style={{ display: 'inline', marginRight: 4 }} />Adaugă
                  </button>
                </div>

                {/* Program mai întâi: el decide ce trepte există. */}
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                  <span style={formLabel}>Program</span>
                  {courses.map(c => {
                    const active = newCourse === c.id;
                    const a = COURSE_ACCENT[c.accent];
                    return (
                      <button key={c.id} onClick={() => setNewCourse(c.id)} aria-pressed={active} className="aa-tap"
                        style={{ padding: '6px 13px', borderRadius: 8, fontSize: 12, cursor: 'pointer', fontWeight: active ? 700 : 400, background: active ? a.dim : 'transparent', border: `1px solid ${active ? 'var(--border-hi)' : 'var(--border)'}`, color: active ? a.fg : 'var(--fg-3)' }}>
                        {c.shortTitle}
                      </button>
                    );
                  })}
                </div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                  <span style={formLabel}>Treaptă</span>
                  {courseTiers(newCourse).map(opt => {
                    const tc = tierStyle(newCourse, opt.id);
                    const active = newTariff === opt.id;
                    return (
                      <button key={opt.id} onClick={() => setNewTariff(opt.id)} aria-pressed={active} className="aa-tap"
                        style={{ padding: '6px 13px', borderRadius: 8, fontSize: 12, cursor: 'pointer', fontWeight: active ? 700 : 400, background: active ? tc.bg : 'transparent', border: `1px solid ${active ? tc.border : 'var(--border)'}`, color: active ? tc.color : 'var(--fg-3)' }}>
                        {opt.label}{opt.price ? ` · ${opt.price}` : ''}
                      </button>
                    );
                  })}
                </div>
                {/* Fluxul ales aici bate alegerea automată de la crearea contului:
                    un întârziat de la Flux 1 nu mai aterizează în Flux 2 doar
                    pentru că e cel mai recent pornit. */}
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                  <span style={formLabel}>Flux</span>
                  {[{ id: '', name: 'Automat (cel mai recent)' }, ...flowsOf(newCourse)].map(f => {
                    const active = (newFlow || '') === f.id;
                    return (
                      <button key={f.id || 'auto'} onClick={() => setNewFlow(f.id || null)} aria-pressed={active} className="aa-tap"
                        style={{ padding: '6px 13px', borderRadius: 8, fontSize: 12, cursor: 'pointer', fontWeight: active ? 700 : 400, background: active ? 'var(--accent-dim)' : 'transparent', border: `1px solid ${active ? 'var(--border-hi)' : 'var(--border)'}`, color: active ? 'var(--fg)' : 'var(--fg-3)' }}>
                        {f.name}
                      </button>
                    );
                  })}
                </div>

              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {filteredWhitelist.length === 0 ? (
          <div style={{ marginTop: 14, padding: '18px', textAlign: 'center', fontSize: 12.5, color: 'var(--fg-3)', border: '1px dashed var(--border)', borderRadius: 10 }}>
            {whitelist.length === 0 ? 'Lista de acces e goală.' : 'Niciun email în lista de acces nu corespunde filtrului.'}
          </div>
        ) : (
          <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 4 }}>
            {filteredWhitelist.map(entry => {
              const tc = tierStyle(entry.course_id, entry.tariff);
              const c = getCourse(entry.course_id);
              const ca = c ? COURSE_ACCENT[c.accent] : { fg: 'var(--fg-3)', dim: 'var(--bg-3)' };
              const key = wlKey(entry);
              return (
                <div key={key} className="aa-row-medium" style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', borderRadius: 9, flexWrap: 'wrap' }}>
                  {/* Programul, explicit pe fiecare rând: fără el „Singur" și „Student"
                      ar sta unul lângă altul fără să se știe din ce listă de prețuri vin. */}
                  <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', padding: '3px 9px', borderRadius: 99, background: ca.dim, color: ca.fg, border: '1px solid var(--border-hi)', flexShrink: 0 }}>
                    {c?.shortTitle || entry.course_id}
                  </span>
                  <span style={{ fontSize: 13, color: 'var(--fg)', flex: '1 1 180px', minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{entry.email}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                    <select value={entry.tariff} onChange={e => handleChangeWhitelistTariff(entry, e.target.value as Tariff)}
                      title={`Treapta la ${c?.shortTitle}`} aria-label={`Treapta pentru ${entry.email} la ${c?.shortTitle}`}
                      style={{ fontSize: 10.5, fontWeight: 700, padding: '4px 9px', borderRadius: 99, background: tc.bg, color: tc.color, border: `1px solid ${tc.border}`, cursor: 'pointer', appearance: 'none' }}>
                      {courseTiers(entry.course_id).map(opt => (
                        <option key={opt.id} value={opt.id} style={{ background: '#0D0907', color: 'var(--fg)' }}>{opt.label}</option>
                      ))}
                    </select>
                    <button onClick={() => handleCopyLink(entry.email)} title="Copiază link de înregistrare" className="aa-tap"
                      style={{ padding: '4px 10px', borderRadius: 6, fontSize: 11, cursor: 'pointer', border: 'none', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4, background: copiedLink === entry.email ? 'var(--ok-dim)' : 'rgba(196,240,228,0.08)', color: copiedLink === entry.email ? 'var(--ok)' : 'var(--accent)' }}>
                      <Link2 size={11} />{copiedLink === entry.email ? 'Copiat!' : 'Link'}
                    </button>
                    <button onClick={() => handleRemoveWhitelist(entry)} className="aa-tap"
                      style={{ padding: '4px 10px', borderRadius: 6, fontSize: 11, cursor: 'pointer', border: 'none', fontWeight: 600, background: confirmRemove === key ? 'var(--error)' : 'rgba(248,113,113,0.08)', color: confirmRemove === key ? '#fff' : 'var(--error)' }}>
                      {confirmRemove === key ? 'Confirmă' : 'Elimină'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Căutare ────────────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 12, flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 200, maxWidth: 340 }}>
          <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--fg-3)', pointerEvents: 'none' }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Caută după nume sau email..."
            aria-label="Caută utilizator"
            style={{ paddingLeft: 32, paddingRight: 12, minHeight: 38, background: 'var(--bg-3)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--fg)', fontSize: 13, width: '100%' }} />
        </div>
      </div>

      {/* ── Utilizatori ────────────────────────────────────────────────────── */}
      <div className="aa-scroll-x" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 16 }}>
       <div className="aa-row-wide">
        <div style={{ display: 'grid', gridTemplateColumns: GRID, gap: 12, padding: '10px 20px', borderBottom: '1px solid var(--border)', alignItems: 'center' }}>
          {['', 'Nume & Email', 'Acces (program · treaptă · flux)', 'Ultima activitate', 'Progres', 'Quiz', 'Acțiuni', ''].map((h, i) => (
            <div key={i} style={{ fontSize: 10, fontWeight: 700, color: 'var(--fg-3)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>{h}</div>
          ))}
        </div>

        {filteredUsers.length === 0 ? (
          <div style={{ padding: '48px 24px', textAlign: 'center', color: 'var(--fg-3)', fontSize: 14 }}>
            {users.length === 0 ? (loading ? 'Se încarcă...' : 'Niciun utilizator înregistrat.') : 'Niciun utilizator nu corespunde filtrului.'}
          </div>
        ) : (
          filteredUsers.map(user => {
            const isExpanded = expandedUser === user.id;
            const isMainAdmin = user.email === 'babaradumi@gmail.com';
            // Înscrierile arătate pe rând: cele din filtru, ca rândul să răspundă la
            // întrebarea pusă, nu la toate întrebările deodată.
            const shown = courseId ? user.enrollments.filter(e => e.course_id === courseId) : user.enrollments;

            return (
              <div key={user.id} style={{ borderBottom: '1px solid var(--border)' }}>
                <div style={{ display: 'grid', gridTemplateColumns: GRID, gap: 12, padding: '12px 20px', alignItems: 'center', cursor: 'pointer' }}
                  onClick={() => setExpandedUser(isExpanded ? null : user.id)}
                  onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.background = 'rgba(255,255,255,0.02)'}
                  onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.background = 'transparent'}>
                  <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg, #1A5C38, #0f3d22)', display: 'grid', placeItems: 'center', fontSize: 12, fontWeight: 700, color: '#C4F0E4' }}>
                    {(user.full_name || user.email)?.charAt(0)?.toUpperCase() || 'U'}
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: user.is_admin ? 'var(--info)' : 'var(--fg)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: 6 }}>
                      {user.full_name || user.email}
                      {user.is_admin && <Shield size={11} style={{ color: 'var(--info)', flexShrink: 0 }} />}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--fg-3)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.email}</div>
                  </div>

                  {/* Accesul: o insignă per program, cu treaptă și flux. */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, minWidth: 0 }} onClick={e => e.stopPropagation()}>
                    {shown.length === 0 ? (
                      <span style={{ fontSize: 11, color: 'var(--fg-3)' }}>fără acces</span>
                    ) : shown.map(enr => {
                      const c = getCourse(enr.course_id);
                      const ca = c ? COURSE_ACCENT[c.accent] : { fg: 'var(--fg-3)', dim: 'var(--bg-3)' };
                      const fn = flowName(enr.flow_id);
                      return (
                        <span key={enr.course_id} title={`${c?.title || enr.course_id} · ${getTier(enr.course_id, enr.tariff)?.label || enr.tariff}${fn ? ` · ${fn}` : ' · fără flux'}`}
                          style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 10.5, padding: '3px 8px', borderRadius: 99, background: ca.dim, border: '1px solid var(--border-hi)', color: ca.fg, whiteSpace: 'nowrap' }}>
                          <strong style={{ fontWeight: 700 }}>{c?.shortTitle || enr.course_id}</strong>
                          <span style={{ color: 'var(--fg-2)' }}>{getTier(enr.course_id, enr.tariff)?.label || enr.tariff}</span>
                          <span style={{ color: fn ? 'var(--fg-3)' : 'var(--warn)' }}>{fn || 'fără flux'}</span>
                        </span>
                      );
                    })}
                  </div>

                  <div style={{ fontSize: 11, color: 'var(--fg-3)' }}>{user.last_activity ? timeAgo(user.last_activity) : '—'}</div>

                  {/* Progresul se raportează la programul înscrierii. Cu mai multe
                      înscrieri sunt mai multe bare — un procent unic ar fi o medie
                      între două metodologii, adică un număr fără sens. */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                    {shown.length === 0 ? <span style={{ fontSize: 11, color: 'var(--fg-3)' }}>—</span> : shown.map(enr => {
                      const pct = pctFor(user.id, enr.course_id);
                      return (
                        <div key={enr.course_id} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                          {shown.length > 1 && <span style={{ fontSize: 9, color: 'var(--fg-3)', width: 14 }}>{(getCourse(enr.course_id)?.shortTitle || '?').slice(0, 2)}</span>}
                          <div style={{ flex: 1, height: 4, background: 'rgba(255,255,255,0.06)', borderRadius: 2, overflow: 'hidden' }}>
                            <div style={{ width: `${pct}%`, height: '100%', background: pct === 100 ? 'var(--ok)' : 'var(--accent)', borderRadius: 2 }} />
                          </div>
                          <span style={{ fontSize: 10.5, color: 'var(--fg-3)', minWidth: 26, textAlign: 'right' }}>{pct}%</span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Quizul e per program: unul completat la Business nu spune nimic
                      despre diagnosticul de la START. */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
                    {shown.length === 0 ? <span style={{ fontSize: 11, color: 'var(--fg-3)' }}>—</span> : shown.map(enr => {
                      const done = userQuizDone(user, enr.course_id);
                      return (
                        <span key={enr.course_id} title={`Quiz ${getCourse(enr.course_id)?.shortTitle}: ${done ? 'completat' : 'în așteptare'}`}
                          style={{ fontSize: 9.5, fontWeight: 700, padding: '2px 7px', borderRadius: 99, background: done ? 'var(--ok-dim)' : 'var(--gold-dim)', border: `1px solid ${done ? 'rgba(74,222,128,0.25)' : 'rgba(201,169,110,0.2)'}`, color: done ? 'var(--ok)' : 'var(--gold)', whiteSpace: 'nowrap' }}>
                          {shown.length > 1 ? `${(getCourse(enr.course_id)?.shortTitle || '?').slice(0, 2)} ` : ''}{done ? '✓' : '⏳'}
                        </span>
                      );
                    })}
                  </div>

                  <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                    <button onClick={e => { e.stopPropagation(); navigate(`/admin/student/${user.id}`); }} className="aa-tap"
                      style={{ padding: '5px 10px', background: 'rgba(196,240,228,0.08)', border: '1px solid rgba(196,240,228,0.2)', borderRadius: 7, cursor: 'pointer', fontSize: 11, color: 'var(--accent)', fontWeight: 600, whiteSpace: 'nowrap' }}>
                      Profil →
                    </button>
                    {!isMainAdmin && (
                      <button onClick={e => { e.stopPropagation(); handleToggleAdmin(user); }}
                        title={user.is_admin ? 'Retrage admin' : 'Promovează la admin'} className="aa-tap"
                        style={{ padding: '5px 8px', background: user.is_admin ? 'rgba(248,113,113,0.08)' : 'rgba(167,139,250,0.1)', border: `1px solid ${user.is_admin ? 'rgba(248,113,113,0.2)' : 'rgba(167,139,250,0.25)'}`, borderRadius: 7, cursor: 'pointer', fontSize: 11, color: user.is_admin ? 'var(--error)' : 'var(--info)', display: 'flex', alignItems: 'center' }}>
                        {user.is_admin ? <ShieldOff size={11} /> : <Shield size={11} />}
                      </button>
                    )}
                  </div>
                  <div style={{ color: 'var(--fg-3)' }}>{isExpanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}</div>
                </div>

                {/* ── Panoul de acces: aici se acordă, se schimbă și se retrage ── */}
                <AnimatePresence initial={false}>
                  {isExpanded && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                      style={{ overflow: 'hidden', background: 'rgba(0,0,0,0.12)', borderTop: '1px solid var(--border)' }}>
                      <div style={{ padding: '16px 20px' }}>
                        <div style={{ fontSize: 10.5, fontWeight: 700, color: 'var(--fg-3)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 12 }}>
                          Acces pe programe
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 10 }}>
                          {scopedCourses.map(c => {
                            const enr = user.enrollments.find(e => e.course_id === c.id);
                            const ca = COURSE_ACCENT[c.accent];
                            const cflows = flowsOf(c.id);
                            const revokeKey = `enr:${user.id}:${c.id}`;
                            return (
                              <div key={c.id} style={{ background: 'var(--bg-3)', border: `1px solid ${enr ? 'var(--border-hi)' : 'var(--border)'}`, borderRadius: 12, padding: '13px 15px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginBottom: enr ? 11 : 0 }}>
                                  <span style={{ fontSize: 11.5, fontWeight: 700, color: enr ? ca.fg : 'var(--fg-3)' }}>{c.title}</span>
                                  {enr ? (
                                    <button onClick={() => handleRevoke(user, c.id)} className="aa-tap"
                                      style={{ fontSize: 10, fontWeight: 600, padding: '4px 9px', borderRadius: 7, cursor: 'pointer', background: confirmRemove === revokeKey ? 'var(--error)' : 'transparent', color: confirmRemove === revokeKey ? '#fff' : 'var(--error)', border: '1px solid rgba(248,113,113,0.25)' }}>
                                      {confirmRemove === revokeKey ? 'Confirmă' : 'Retrage'}
                                    </button>
                                  ) : (
                                    <button onClick={() => handleGrant(user, c.id)} className="aa-tap"
                                      style={{ fontSize: 10, fontWeight: 700, padding: '4px 10px', borderRadius: 7, cursor: 'pointer', background: ca.dim, color: ca.fg, border: '1px solid var(--border-hi)' }}>
                                      + Dă acces
                                    </button>
                                  )}
                                </div>

                                {enr && (
                                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                    <label style={fieldRow}>
                                      <span style={fieldLabel}>Treaptă</span>
                                      <select value={enr.tariff} onChange={e => handleChangeTariff(user, c.id, e.target.value as Tariff)}
                                        style={fieldControl}>
                                        {courseTiers(c.id).map(opt => (
                                          <option key={opt.id} value={opt.id} style={{ background: '#0D0907' }}>{opt.label}{opt.price ? ` · ${opt.price}` : ''}</option>
                                        ))}
                                      </select>
                                    </label>
                                    <label style={fieldRow}>
                                      <span style={fieldLabel}>Flux</span>
                                      {cflows.length === 0 ? (
                                        <span style={{ fontSize: 11, color: 'var(--fg-3)' }}>niciun flux definit</span>
                                      ) : (
                                        <select value={enr.flow_id || ''} onChange={e => handleChangeFlow(user, c.id, enr.tariff, e.target.value)}
                                          style={{ ...fieldControl, color: enr.flow_id ? 'var(--fg)' : 'var(--warn)' }}>
                                          <option value="" style={{ background: '#0D0907' }}>fără flux</option>
                                          {cflows.map(f => (
                                            <option key={f.id} value={f.id} style={{ background: '#0D0907' }}>{f.name}</option>
                                          ))}
                                        </select>
                                      )}
                                    </label>
                                    <div style={{ fontSize: 10.5, color: 'var(--fg-3)', paddingTop: 2 }}>
                                      Progres {pctFor(user.id, c.id)}% · quiz {userQuizDone(user, c.id) ? 'completat' : 'în așteptare'}
                                      {enr.access_until ? ` · acces până la ${new Date(enr.access_until).toLocaleDateString('ro-RO')}` : ''}
                                    </div>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })
        )}
       </div>
      </div>
    </div>
  );
};

const formLabel: React.CSSProperties = {
  fontSize: 9.5, fontWeight: 600, letterSpacing: '0.12em',
  textTransform: 'uppercase', color: 'var(--fg-3)', minWidth: 62,
};
const fieldRow: React.CSSProperties = { display: 'flex', alignItems: 'center', gap: 8 };
const fieldLabel: React.CSSProperties = { fontSize: 10.5, color: 'var(--fg-3)', minWidth: 48 };
const fieldControl: React.CSSProperties = {
  flex: 1, minHeight: 32, padding: '5px 8px', borderRadius: 7, fontSize: 11.5,
  background: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--fg)', cursor: 'pointer',
};
