// @ts-nocheck
// Ecranul general: „la ce am acces". Prima pagină după login pentru elevii cu mai
// multe cursuri. Elevul cu un singur curs nu ajunge aici — e trimis direct în el
// (vezi resolveLandingPath), ca să nu plătească un click în plus la fiecare intrare.
import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Sun, Moon, LogOut, Lock } from 'lucide-react';
import { useNavigate } from '@/lib/router-compat';
import { useAuthContext } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useProgress } from '../hooks/useProgress';
import { enrolledCourses } from '../lib/enrollments';
import { activeCourses, COURSE_ACCENT } from '../lib/courses';
import { getCourseModules } from '../lib/content';
import { courseDashboardPath } from '../lib/navigation';
import { hasCompletedOnboarding } from '../lib/access';

export const CoursesHub: React.FC = () => {
  const { user, logout, isAdmin } = useAuthContext();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const { getOverallProgressFor, loading } = useProgress();

  // Adminul vede toate cursurile active, ca să poată verifica conținutul.
  const courses = isAdmin ? activeCourses() : enrolledCourses(user?.enrollments);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', flexDirection: 'column' }}>
      <header style={{
        height: 52, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 20px', borderBottom: '1px solid var(--border)', flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 26, height: 26, borderRadius: 7, background: 'var(--accent-dim)',
            border: '1px solid var(--border-hi)', display: 'grid', placeItems: 'center',
          }}>
            <span className="font-aboreto" style={{ fontSize: 11, color: 'var(--accent)', letterSpacing: 1 }}>AA</span>
          </div>
          <span className="font-aboreto" style={{ fontSize: 11, letterSpacing: '0.12em', color: 'var(--fg)' }}>
            ARHITECTURA AFACERII
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button onClick={toggleTheme} aria-label="Schimbă tema" style={iconBtn}>
            {theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
          </button>
          <button onClick={() => logout()} style={{ ...iconBtn, width: 'auto', padding: '0 12px', gap: 6 }}>
            <LogOut size={13} />
            <span style={{ fontSize: 12 }}>Ieși</span>
          </button>
        </div>
      </header>

      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '48px 20px 64px' }}>
        <div style={{ width: '100%', maxWidth: 880 }}>
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            style={{ marginBottom: 36 }}
          >
            <p style={{ fontSize: 12, color: 'var(--fg-3)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 10 }}>
              Bine ai revenit{user?.full_name ? `, ${user.full_name.split(' ')[0]}` : ''}
            </p>
            <h1 className="font-aboreto" style={{ fontSize: 'clamp(1.6rem,3vw,2.4rem)', color: 'var(--fg)', lineHeight: 1.1, letterSpacing: '-0.02em' }}>
              Alege programul
            </h1>
          </motion.div>

          {courses.length === 0 ? (
            <EmptyState email={user?.email} />
          ) : (
            <div style={{ display: 'grid', gap: 16, gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))' }}>
              {courses.map((course, index) => {
                const accent = COURSE_ACCENT[course.accent];
                const modules = getCourseModules(course.id);
                const empty = modules.length === 0;
                const pct = loading || empty ? 0 : getOverallProgressFor(course.id);
                const quizDone = hasCompletedOnboarding(user, course.id);

                return (
                  <motion.button
                    key={course.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.07 }}
                    whileHover={empty ? undefined : { y: -2 }}
                    onClick={() => !empty && navigate(courseDashboardPath(course))}
                    disabled={empty}
                    style={{
                      textAlign: 'left', background: 'var(--bg-card)', border: '1px solid var(--border)',
                      borderRadius: 16, padding: 22, cursor: empty ? 'not-allowed' : 'pointer',
                      opacity: empty ? 0.6 : 1, position: 'relative', overflow: 'hidden',
                      transition: 'border-color 0.2s, box-shadow 0.2s', font: 'inherit', color: 'inherit',
                    }}
                    onMouseEnter={e => { if (!empty) e.currentTarget.style.boxShadow = 'var(--shadow)'; }}
                    onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; }}
                  >
                    <div className="font-aboreto" style={{
                      position: 'absolute', right: -2, bottom: -14, fontSize: 76, lineHeight: 1,
                      color: 'var(--border)', userSelect: 'none', pointerEvents: 'none',
                    }}>
                      {course.shortTitle.charAt(0)}
                    </div>

                    <div style={{ position: 'relative', zIndex: 1 }}>
                      <span style={{
                        fontSize: 10, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase',
                        color: accent.fg, background: accent.dim, border: `1px solid ${accent.dim}`,
                        padding: '3px 9px', borderRadius: 99,
                      }}>
                        {course.subtitle}
                      </span>

                      <h2 className="font-aboreto" style={{ fontSize: 19, color: 'var(--fg)', margin: '14px 0 8px', lineHeight: 1.25 }}>
                        {course.title}
                      </h2>
                      <p style={{ fontSize: 13, color: 'var(--fg-3)', lineHeight: 1.6, marginBottom: 18 }}>
                        {course.description}
                      </p>

                      {empty ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 12, color: 'var(--fg-3)' }}>
                          <Lock size={13} />
                          <span>În pregătire — se deschide în curând</span>
                        </div>
                      ) : (
                        <>
                          <div style={{ height: 4, borderRadius: 99, background: 'var(--bg-3)', overflow: 'hidden', marginBottom: 10 }}>
                            <div style={{ width: `${pct}%`, height: '100%', background: accent.fg, transition: 'width 0.4s' }} />
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <span style={{ fontSize: 12, color: 'var(--fg-3)' }}>
                              {quizDone ? `${pct}% parcurs` : 'Începe cu diagnosticul'}
                            </span>
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12, fontWeight: 600, color: accent.fg }}>
                              {pct > 0 ? 'Continuă' : 'Intră'} <ArrowRight size={13} />
                            </span>
                          </div>
                        </>
                      )}
                    </div>
                  </motion.button>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

const iconBtn: React.CSSProperties = {
  height: 28, width: 28, display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
  background: 'transparent', border: '1px solid var(--border)', borderRadius: 7,
  color: 'var(--fg-2)', cursor: 'pointer',
};

const EmptyState: React.FC<{ email?: string }> = ({ email }) => (
  <div style={{
    background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 16,
    padding: 32, textAlign: 'center',
  }}>
    <h2 className="font-aboreto" style={{ fontSize: 17, color: 'var(--fg)', marginBottom: 10 }}>
      Nu ai încă acces la niciun program
    </h2>
    <p style={{ fontSize: 13, color: 'var(--fg-3)', lineHeight: 1.65, maxWidth: 460, margin: '0 auto' }}>
      Contul <strong style={{ color: 'var(--fg-2)' }}>{email}</strong> există, dar nu e înscris la niciun
      practicum. Dacă tocmai ai achitat, scrie-i echipei — accesul se deschide manual.
    </p>
  </div>
);
