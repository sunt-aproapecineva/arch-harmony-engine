// @ts-nocheck
// Ecranul general: „la ce am acces". Prima pagină după login pentru elevii cu mai
// multe programe. Elevul cu un singur program nu ajunge aici — e trimis direct în el
// (vezi resolveLandingPath), ca să nu plătească un click în plus la fiecare intrare.
//
// Compoziția e calmă intenționat: e un moment de alegere, nu un tablou de bord.
// Fundalul, tipografia și cardurile refolosesc tokenii și clasele din src/styles.css.
import React, { useMemo } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowRight, Sun, Moon, LogOut, Lock, CheckCircle2, CalendarDays } from 'lucide-react';
import { useNavigate } from '@/lib/router-compat';
import { useAuthContext } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useProgress } from '../hooks/useProgress';
import { enrolledCourses, expiredCourses, enrollmentForCourse } from '../lib/enrollments';
import { activeCourses, COURSE_ACCENT } from '../lib/courses';
import { getCourseModules } from '../lib/content';
import { courseDashboardPath } from '../lib/navigation';
import { hasCompletedOnboarding } from '../lib/access';

/** Lecție care contează la progres: are video sau e pagină de exercițiu. */
function isTrackable(l: any): boolean {
  return l?.type === 'exercise' || !!(l?.video_url && String(l.video_url).trim());
}

/** Prenumele, dacă e unul folosibil. Un singur caracter nu e un nume — mai bine tăcem. */
function usableFirstName(fullName?: string): string | null {
  const first = (fullName || '').trim().split(/\s+/)[0] || '';
  return first.length >= 2 ? first : null;
}

export const CoursesHub: React.FC = () => {
  const { user, logout, isAdmin } = useAuthContext();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const { getOverallProgressFor, isCompleted, loading } = useProgress();
  const reduceMotion = useReducedMotion();

  // Adminul vede toate programele active, ca să poată verifica conținutul.
  const courses = isAdmin ? activeCourses() : enrolledCourses(user?.enrollments);
  // Accesul expirat nu se ascunde: elevul trebuie să vadă că a avut, nu să creadă
  // că i-a dispărut contul.
  const expired = isAdmin ? [] : expiredCourses(user?.enrollments);
  const firstName = usableFirstName(user?.full_name);

  const cards = useMemo(() => courses.map(course => {
    const modules = getCourseModules(course.id);
    const trackable = modules.flatMap((m: any) => (m.lessons || []).filter(isTrackable));
    // „În pregătire" nu înseamnă „fără module", ci „fără nimic de urmărit încă":
    // START are structura celor 10 module, dar nicio lecție filmată. Un card care
    // promite 10 lecții și deschide un curs gol e o minciună mică, dar e o minciună.
    const videoLessons = modules.flatMap((m: any) =>
      (m.lessons || []).filter((l: any) => !!(l.video_url && String(l.video_url).trim())));
    const empty = modules.length === 0 || videoLessons.length === 0;
    const modulesDone = modules.filter((m: any) => {
      const items = (m.lessons || []).filter(isTrackable);
      return items.length > 0 && items.every((l: any) => isCompleted(l.id));
    }).length;
    return {
      course,
      modules,
      empty,
      lessonsTotal: videoLessons.length,
      deliverables: trackable.filter((l: any) => l.type === 'exercise').length,
      modulesDone,
      pct: loading || empty ? 0 : getOverallProgressFor(course.id),
      quizDone: hasCompletedOnboarding(user, course.id),
      flow: enrollmentForCourse(user?.enrollments, course.id)?.flow || null,
    };
  }), [courses, isCompleted, loading, getOverallProgressFor, user]);

  const single = cards.length === 1;

  return (
    <div style={{ minHeight: '100dvh', background: 'var(--bg)', display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' }}>
      {/* Fundal ambiental — aceleași glow-uri ca pe dashboard, pentru continuitate. */}
      <div aria-hidden style={{ position: 'absolute', inset: 0, zIndex: 0, pointerEvents: 'none' }}>
        <div className="dash-glow" style={{ width: 420, height: 420, top: -140, left: '8%', background: 'var(--accent-glow)' }} />
        <div className="dash-glow" style={{ width: 360, height: 360, bottom: -160, right: '6%', background: 'var(--gold-dim)' }} />
      </div>

      <header style={{
        position: 'relative', zIndex: 1, minHeight: 56, display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', gap: 12, padding: '0 clamp(16px, 4vw, 32px)',
        borderBottom: '1px solid var(--border)', flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
          <div style={{
            width: 28, height: 28, borderRadius: 8, flexShrink: 0, background: 'var(--accent-dim)',
            border: '1px solid var(--border-hi)', display: 'grid', placeItems: 'center',
          }}>
            <span className="font-aboreto" style={{ fontSize: 11, color: 'var(--accent)', letterSpacing: 1 }}>AA</span>
          </div>
          <span className="font-aboreto" style={{
            fontSize: 11, letterSpacing: '0.14em', color: 'var(--fg-2)',
            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
          }}>
            ARHITECTURA AFACERII
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
          <button onClick={toggleTheme} aria-label={theme === 'dark' ? 'Treci pe tema deschisă' : 'Treci pe tema închisă'} style={iconBtn}>
            {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
          </button>
          <button onClick={() => logout()} aria-label="Ieși din cont" style={{ ...iconBtn, width: 'auto', padding: '0 14px', gap: 7 }}>
            <LogOut size={14} />
            <span style={{ fontSize: 12.5 }}>Ieși</span>
          </button>
        </div>
      </header>

      <main style={{
        position: 'relative', zIndex: 1, flex: 1, display: 'flex', flexDirection: 'column',
        justifyContent: 'center', alignItems: 'center', padding: 'clamp(32px, 7vh, 72px) clamp(16px, 4vw, 32px) clamp(48px, 8vh, 88px)',
      }}>
        <div style={{ width: '100%', maxWidth: single ? 560 : 940 }}>
          <motion.header
            initial={reduceMotion ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            style={{ marginBottom: 'clamp(24px, 4vh, 40px)' }}
          >
            <p style={{
              fontSize: 11.5, color: 'var(--fg-3)', letterSpacing: '0.14em',
              textTransform: 'uppercase', marginBottom: 12,
            }}>
              {firstName ? `Bine ai revenit, ${firstName}` : 'Bine ai revenit'}
            </p>
            <h1 className="font-aboreto" style={{
              fontSize: 'clamp(1.75rem, 5vw, 2.75rem)', color: 'var(--fg)',
              lineHeight: 1.08, letterSpacing: '-0.02em', margin: 0,
            }}>
              {courses.length > 1 ? 'Alege programul' : 'Programul tău'}
            </h1>
            {courses.length > 1 && (
              <p style={{ fontSize: 13.5, color: 'var(--fg-3)', lineHeight: 1.65, marginTop: 12, maxWidth: 480 }}>
                Poți trece dintr-un program în altul oricând, din bara laterală.
              </p>
            )}
          </motion.header>

          {cards.length === 0 ? (
            <EmptyState email={user?.email} />
          ) : (
            <div style={{
              display: 'grid', gap: 'clamp(12px, 2vw, 18px)',
              gridTemplateColumns: single ? '1fr' : 'repeat(auto-fit, minmax(min(100%, 340px), 1fr))',
            }}>
              {cards.map((c, index) => (
                <CourseCard key={c.course.id} data={c} index={index} reduceMotion={reduceMotion} onOpen={() => navigate(courseDashboardPath(c.course))} />
              ))}
            </div>
          )}

          {expired.length > 0 && (
            <section style={{ marginTop: 'clamp(28px, 5vh, 44px)' }}>
              <h2 style={{
                fontSize: 10.5, fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase',
                color: 'var(--fg-3)', marginBottom: 12,
              }}>
                Acces încheiat
              </h2>
              <div style={{ display: 'grid', gap: 10, gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))' }}>
                {expired.map(course => {
                  const enr = enrollmentForCourse(user?.enrollments, course.id);
                  return (
                    <div key={course.id} style={{
                      background: 'var(--bg-3)', border: '1px solid var(--border)', borderRadius: 14,
                      padding: 'clamp(14px, 3vw, 18px)',
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                        <Lock size={13} style={{ color: 'var(--fg-3)', flexShrink: 0 }} />
                        <span className="font-aboreto" style={{ fontSize: 13.5, color: 'var(--fg-2)' }}>{course.title}</span>
                      </div>
                      <p style={{ fontSize: 12.5, color: 'var(--fg-3)', lineHeight: 1.6, margin: 0 }}>
                        Accesul s-a încheiat{enr?.access_until ? ` pe ${new Date(enr.access_until).toLocaleDateString('ro-RO', { day: 'numeric', month: 'long', year: 'numeric' })}` : ''}.
                        {' '}Scrie-i echipei dacă vrei prelungire.
                      </p>
                    </div>
                  );
                })}
              </div>
            </section>
          )}
        </div>
      </main>
    </div>
  );
};

// ─── Cardul unui program ──────────────────────────────────────────────────────

const CourseCard: React.FC<{ data: any; index: number; reduceMotion: boolean; onOpen: () => void }> =
  ({ data, index, reduceMotion, onOpen }) => {
    const { course, empty, pct, modulesDone, modules, lessonsTotal, deliverables, quizDone, flow } = data;
    const accent = COURSE_ACCENT[course.accent];
    const started = pct > 0;

    return (
      <motion.article
        initial={reduceMotion ? false : { opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.42, delay: reduceMotion ? 0 : index * 0.08 }}
        style={{
          position: 'relative', display: 'flex', flexDirection: 'column',
          background: 'var(--bg-card)', border: '1px solid var(--border)',
          borderRadius: 18, overflow: 'hidden', opacity: empty ? 0.7 : 1,
        }}
      >
        {/* Muchia de accent: distinge programele fără să adauge culoare pe fundal. */}
        <div aria-hidden style={{ height: 3, background: empty ? 'var(--border)' : accent.fg, opacity: empty ? 1 : 0.85 }} />

        <div style={{ padding: 'clamp(18px, 3.5vw, 26px)', display: 'flex', flexDirection: 'column', flex: 1 }}>
          <div className="font-aboreto" aria-hidden style={{
            position: 'absolute', right: 4, bottom: -18, fontSize: 'clamp(70px, 14vw, 104px)',
            lineHeight: 1, color: 'var(--border)', opacity: 0.55, userSelect: 'none', pointerEvents: 'none',
          }}>
            {course.shortTitle.charAt(0)}
          </div>

          <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, flexWrap: 'wrap', marginBottom: 14 }}>
              <span style={{
                fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase',
                color: accent.fg, background: accent.dim, border: '1px solid var(--border)',
                padding: '4px 10px', borderRadius: 99,
              }}>
                {course.subtitle}
              </span>
              {flow && (
                <span style={{
                  display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 10.5,
                  color: 'var(--fg-3)', border: '1px solid var(--border)', padding: '4px 9px', borderRadius: 99,
                }}>
                  <CalendarDays size={10} /> {flow.name.replace(/\s*·.*$/, '')}
                </span>
              )}
            </div>

            <h2 className="font-aboreto" style={{
              fontSize: 'clamp(1.05rem, 2.4vw, 1.3rem)', color: 'var(--fg)',
              margin: '0 0 10px', lineHeight: 1.3, letterSpacing: '-0.01em',
            }}>
              {course.title}
            </h2>
            <p style={{ fontSize: 13, color: 'var(--fg-3)', lineHeight: 1.65, margin: '0 0 20px' }}>
              {course.description}
            </p>

            <div style={{ marginTop: 'auto' }}>
              {empty ? (
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap', marginBottom: 10 }}>
                    <Meta value={String(modules.length)} label="module" />
                    <Meta value={String(deliverables)} label="livrabile" />
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12.5, color: 'var(--fg-3)' }}>
                    <Lock size={13} style={{ flexShrink: 0 }} /> Structura e gata — lecțiile se filmează
                  </div>
                </div>
              ) : (
                <>
                  {/* Reperele programului: cifre concrete, nu doar un procent. */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap', marginBottom: 12 }}>
                    <Meta value={`${modulesDone}/${modules.length}`} label="module" done={modulesDone === modules.length && modules.length > 0} />
                    <Meta value={String(lessonsTotal)} label="lecții" />
                    {quizDone && (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 11.5, color: 'var(--ok)' }}>
                        <CheckCircle2 size={12} /> diagnostic dat
                      </span>
                    )}
                  </div>

                  <div className="progress-bar" style={{ marginBottom: 12 }}>
                    <div style={{
                      height: '100%', width: `${pct}%`, borderRadius: 2,
                      background: accent.fg, transition: 'width 0.8s cubic-bezier(0.4,0,0.2,1)',
                    }} />
                  </div>

                  <button
                    onClick={onOpen}
                    aria-label={`Deschide ${course.title}${started ? `, ${pct}% parcurs` : ''}`}
                    style={{
                      width: '100%', minHeight: 44, display: 'flex', alignItems: 'center',
                      justifyContent: 'space-between', gap: 10, padding: '0 14px',
                      borderRadius: 10, cursor: 'pointer', font: 'inherit',
                      background: accent.dim, color: accent.fg, border: '1px solid var(--border-hi)',
                      transition: 'filter 0.15s',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.filter = 'brightness(1.25)')}
                    onMouseLeave={e => (e.currentTarget.style.filter = 'none')}
                  >
                    <span style={{ fontSize: 13, fontWeight: 600 }}>
                      {!quizDone ? 'Începe cu diagnosticul' : started ? `Continuă · ${pct}%` : 'Intră în program'}
                    </span>
                    <ArrowRight size={15} style={{ flexShrink: 0 }} />
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </motion.article>
    );
  };

const Meta: React.FC<{ value: string; label: string; done?: boolean }> = ({ value, label, done }) => (
  <span style={{ display: 'inline-flex', alignItems: 'baseline', gap: 5 }}>
    <span className="font-aboreto" style={{ fontSize: 15, color: done ? 'var(--ok)' : 'var(--fg-2)', lineHeight: 1 }}>{value}</span>
    <span style={{ fontSize: 11.5, color: 'var(--fg-3)' }}>{label}</span>
  </span>
);

const iconBtn: React.CSSProperties = {
  height: 34, minWidth: 34, display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
  background: 'transparent', border: '1px solid var(--border)', borderRadius: 9,
  color: 'var(--fg-2)', cursor: 'pointer',
};

const EmptyState: React.FC<{ email?: string }> = ({ email }) => (
  <div style={{
    background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 18,
    padding: 'clamp(24px, 5vw, 40px)', textAlign: 'center',
  }}>
    <div style={{
      width: 40, height: 40, borderRadius: 12, margin: '0 auto 16px',
      background: 'var(--warn-dim)', display: 'grid', placeItems: 'center',
    }}>
      <Lock size={17} style={{ color: 'var(--warn)' }} />
    </div>
    <h2 className="font-aboreto" style={{ fontSize: 16.5, color: 'var(--fg)', margin: '0 0 10px' }}>
      Nu ai încă acces la niciun program
    </h2>
    <p style={{ fontSize: 13, color: 'var(--fg-3)', lineHeight: 1.7, maxWidth: 440, margin: '0 auto' }}>
      Contul <strong style={{ color: 'var(--fg-2)', wordBreak: 'break-all' }}>{email}</strong> există, dar nu e înscris
      la niciun practicum. Dacă tocmai ai achitat, scrie-i echipei — accesul se deschide manual.
    </p>
  </div>
);
