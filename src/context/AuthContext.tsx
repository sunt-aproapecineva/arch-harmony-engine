// @ts-nocheck
import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { User, WhitelistEntry, Tariff } from '../lib/types';
import { saveSessionBackup, readSessionBackup, clearSessionBackup, startRememberWindow, isRememberMode, isRememberExpired } from '../lib/sessionPersistence';
import { fetchEnrollments, readCachedEnrollments, clearCachedEnrollments } from '../lib/enrollments';
import { quizDoneKey, legacyQuizDoneKey, readPendingQuiz, clearPendingQuiz } from '../lib/access';
import { COURSES } from '../lib/courses';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<{ error: string | null }>;
  register: (email: string, password: string, fullName: string) => Promise<{ error: string | null }>;
  logout: () => Promise<void>;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: async () => ({ error: null }),
  register: async () => ({ error: null }),
  logout: async () => {},
  isAdmin: false,
});

export const useAuthContext = () => useContext(AuthContext);

function readLocalQuizDone(userId: string): boolean {
  try { return localStorage.getItem(legacyQuizDoneKey(userId)) === '1'; } catch { return false; }
}

function buildFallbackUser(authUser: any): User {
  return {
    id: authUser.id,
    email: authUser.email,
    full_name: authUser.user_metadata?.full_name || '',
    role: 'student',
    tariff: 'student',
    quiz_completed: readLocalQuizDone(authUser.id),
    // Cache-ul local ține elevul în cursurile lui chiar dacă hidratarea a eșuat.
    enrollments: readCachedEnrollments(authUser.id),
    quiz_completed_courses: [],
    avatar_url: null,
    created_at: authUser.created_at,
  };
}

/**
 * Quizurile elevului, tolerant la lipsa coloanei `course_id`.
 *
 * Codul multicurs poate ajunge în producție cu câteva minute înaintea migrației. Fără
 * plasa asta, interogarea ar eșua, `quiz_completed` ar deveni fals pentru toată lumea și
 * fiecare elev s-ar trezi blocat în spatele diagnosticului pe care deja l-a dat.
 */
async function fetchQuizRows(userId: string) {
  const res = await supabase
    .from('quiz_responses')
    .select('answers,completed_at,course_id')
    .eq('user_id', userId);
  if (!res.error) return res;
  if (res.error.code !== '42703') return res;
  console.warn('[Auth] quiz_responses.course_id lipsește — migrația multicurs nu e aplicată');
  return await supabase
    .from('quiz_responses')
    .select('answers,completed_at')
    .eq('user_id', userId);
}

/**
 * Retrimite quizurile care n-au ajuns în cloud la trimiterea inițială.
 *
 * Închide gaura dintre flagul local (care deschide practicumul instant) și baza de
 * date (de unde mentorul își ia briefingul). Rulează la fiecare hidratare, e ieftină
 * — de obicei nu are nimic de făcut — și nu blochează niciodată încărcarea aplicației.
 */
async function flushPendingQuizzes(userId: string): Promise<string[]> {
  const recovered: string[] = [];
  for (const course of COURSES) {
    const pending = readPendingQuiz(userId, course.id);
    if (!pending) continue;
    try {
      const { error } = await supabase
        .from('quiz_responses')
        .upsert(pending, { onConflict: 'user_id,course_id' });
      if (!error) {
        clearPendingQuiz(userId, course.id);
        recovered.push(course.id);
      }
    } catch { /* rămâne în coadă pentru data viitoare */ }
  }
  return recovered;
}

async function hydrateUser(authUser: any): Promise<User | null> {
  if (!authUser) return null;

  try {
    const [{ data: profile }, { data: roles }, { data: quizRows }, enrollments] = await Promise.all([
      supabase.from('profiles').select('full_name,email,tariff,avatar_url').eq('id', authUser.id).maybeSingle(),
      supabase.from('user_roles').select('role').eq('user_id', authUser.id),
      fetchQuizRows(authUser.id),
      fetchEnrollments(authUser.id),
    ]);
    const isAdmin = (roles || []).some((r: any) => r.role === 'admin');

    // Quizuri rămase în coadă de la o trimitere eșuată — le împingem acum.
    const recovered = await flushPendingQuizzes(authUser.id);

    // Oglindește starea quizului în localStorage, per curs, pentru gating instant.
    const quizCourses: string[] = [...recovered];
    try {
      for (const row of quizRows || []) {
        if (!row?.completed_at) continue;
        const courseId = row.course_id || 'business';
        quizCourses.push(courseId);
        localStorage.setItem(quizDoneKey(authUser.id, courseId), '1');
        if (row.answers) {
          localStorage.setItem(`aa_quiz_answers_${authUser.id}_${courseId}`, JSON.stringify(row.answers));
        }
      }
    } catch {}
    const localQuizDone = readLocalQuizDone(authUser.id);
    return {
      id: authUser.id,
      email: profile?.email || authUser.email,
      full_name: profile?.full_name || authUser.user_metadata?.full_name || '',
      role: isAdmin ? 'admin' : 'student',
      tariff: (profile?.tariff as Tariff) || 'student',
      quiz_completed: quizCourses.includes('business') || localQuizDone,
      enrollments,
      quiz_completed_courses: quizCourses,
      avatar_url: profile?.avatar_url || null,
      created_at: authUser.created_at,
    };
  } catch (error) {
    // Never leave the app stuck on a blank/loading state if one profile query
    // fails transiently. The session itself is enough to render the platform;
    // profile/role data can be refreshed on the next auth update/page load.
    console.warn('[Auth] hydrate failed; using session fallback', error);
    return buildFallbackUser(authUser);
  }
}

// Whitelist helpers — admin-only direct reads; eligibility check via secure RPC
export async function fetchWhitelist(): Promise<WhitelistEntry[]> {
  const { data } = await supabase.from('whitelist').select('email,tariff').order('added_at', { ascending: false });
  return (data || []) as WhitelistEntry[];
}

let _cachedWhitelist: WhitelistEntry[] = [];
export function getWhitelist(): WhitelistEntry[] {
  return _cachedWhitelist;
}

import { logActivity, logActivityOnce } from '../lib/activity';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    let hydrationSeq = 0;

    const runHydration = async (authUser: any, showLoading = false) => {
      const seq = ++hydrationSeq;
      if (showLoading) setLoading(true);
      const u = await hydrateUser(authUser);
      if (cancelled || seq !== hydrationSeq) return;
      setUser(u);
      setLoading(false);
    };

    // Initial hydration from persisted session (storage). This is the only
    // path that runs on mount — avoids the race where INITIAL_SESSION fires
    // before getSession() returns and re-hydrates with stale state.
    (async () => {
      try {
        let { data: { session } } = await supabase.auth.getSession();

        // The 12h window elapsed while the app was closed → sign out for real.
        if (isRememberExpired()) {
          clearSessionBackup();
          if (session) { try { await supabase.auth.signOut(); } catch { /* noop */ } }
          if (!cancelled) { setUser(null); setLoading(false); }
          return;
        }

        // Mobile browsers (notably iOS Safari) can drop the Supabase storage
        // entry when the browser is closed. If a valid 12h "remember me"
        // backup exists, restore the session from it instead of logging out.
        if (!session) {
          const backup = readSessionBackup();
          if (backup) {
            const { data, error } = await supabase.auth.setSession({
              access_token: backup.access_token,
              refresh_token: backup.refresh_token,
            });
            if (error || !data.session) clearSessionBackup();
            else session = data.session;
          }
        }

        if (session && isRememberMode()) saveSessionBackup(session);
        await runHydration(session?.user);
      } catch (error) {
        console.warn('[Auth] initial session failed', error);
        if (!cancelled) { setUser(null); setLoading(false); }
      }
    })();


    // Only react to identity changes. Skip INITIAL_SESSION and
    // TOKEN_REFRESHED — those fire on every mount / ~hourly and used to
    // re-fetch profile+quiz, briefly flipping quiz_completed=false and
    // hiding the lesson video behind the onboarding gate.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      // Keep the 12h backup in sync with the freshest tokens (window start
      // time is preserved, so it still expires exactly 12h after login).
      if (isRememberMode() && (event === 'TOKEN_REFRESHED' || event === 'SIGNED_IN' || event === 'USER_UPDATED')) {
        saveSessionBackup(session);
      }
      if (event !== 'SIGNED_IN' && event !== 'SIGNED_OUT' && event !== 'USER_UPDATED') return;
      if (event === 'SIGNED_OUT') {
        hydrationSeq++;
        clearSessionBackup();
        setUser(null);
        setLoading(false);
        return;
      }
      // defer DB calls to avoid deadlock inside listener
      setLoading(true);
      setTimeout(() => runHydration(session?.user, false), 0);
    });

    return () => { cancelled = true; subscription.unsubscribe(); };
  }, []);

  // Enforce the 12h window: once the deadline passes, sign the user out.
  useEffect(() => {
    if (!user || !isRememberMode()) return;
    const check = () => {
      if (isRememberExpired()) {
        clearSessionBackup();
        supabase.auth.signOut().catch(() => {});
      }
    };
    check();
    const id = setInterval(check, 30 * 1000);
    // Mobile browsers freeze timers in background tabs — re-check on wake.
    document.addEventListener('visibilitychange', check);
    window.addEventListener('focus', check);
    return () => {
      clearInterval(id);
      document.removeEventListener('visibilitychange', check);
      window.removeEventListener('focus', check);
    };
  }, [user]);


  const login = async (email: string, password: string, rememberMe = false) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email: email.trim().toLowerCase(), password });
    if (error) return { error: error.message === 'Invalid login credentials' ? 'Email sau parolă incorectă.' : error.message };
    if (rememberMe) startRememberWindow(data.session);
    else clearSessionBackup();
    if (data?.user) {
      // Identity fields are filled server-side by the activity_log trigger.
      logActivityOnce('login', {
        userId: data.user.id,
        userEmail: data.user.email || '',
        userName: '',
        type: 'login',
        label: 'S-a autentificat pe platformă',
        data: {},
      });
    }
    return { error: null };
  };


  const register = async (email: string, password: string, fullName: string) => {
    const cleanEmail = email.trim().toLowerCase();
    // Pre-check whitelist via secure RPC (DB trigger also enforces)
    const { data: allowed } = await supabase.rpc('is_email_whitelisted', { _email: cleanEmail });
    if (allowed !== true) {
      return { error: 'Adresa de email nu este în lista de acces. Contactează administratorul.' };
    }
    const { error } = await supabase.auth.signUp({
      email: cleanEmail,
      password,
      options: {
        data: { full_name: fullName },
        emailRedirectTo: `${window.location.origin}/dashboard`,
      },
    });
    if (error) {
      if (error.message.includes('already registered') || error.message.includes('already been registered')) {
        return { error: 'Există deja un cont cu această adresă de email.' };
      }
      if (error.message.includes('lista de acces')) {
        return { error: 'Adresa de email nu este în lista de acces. Contactează administratorul.' };
      }
      return { error: error.message };
    }
    // No cache refresh needed — whitelist is admin-only
    return { error: null };
  };

  const logout = async () => {
    if (user) {
      await logActivity({
        userId: user.id,
        userEmail: user.email,
        userName: user.full_name,
        type: 'logout',
        label: `${user.full_name} s-a deconectat`,
        data: {},
      });
    }
    // Cache-ul de înscrieri e per utilizator; îl curățăm ca următorul cont logat
    // pe același dispozitiv să nu vadă o clipă cursurile celui dinainte.
    if (user) clearCachedEnrollments(user.id);
    await supabase.auth.signOut();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, login, register, logout, isAdmin: user?.role === 'admin' }}
    >
      {children}
    </AuthContext.Provider>
  );
};
