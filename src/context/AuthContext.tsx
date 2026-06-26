// @ts-nocheck
import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { User, WhitelistEntry, Tariff } from '../lib/types';

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
  try { return localStorage.getItem(`aa_quiz_done_${userId}`) === '1'; } catch { return false; }
}

function buildFallbackUser(authUser: any): User {
  return {
    id: authUser.id,
    email: authUser.email,
    full_name: authUser.user_metadata?.full_name || '',
    role: 'student',
    tariff: 'student',
    quiz_completed: readLocalQuizDone(authUser.id),
    avatar_url: null,
    created_at: authUser.created_at,
  };
}

async function hydrateUser(authUser: any): Promise<User | null> {
  if (!authUser) return null;

  try {
    const [{ data: profile }, { data: roles }, { data: quiz }] = await Promise.all([
      supabase.from('profiles').select('full_name,email,tariff,avatar_url').eq('id', authUser.id).maybeSingle(),
      supabase.from('user_roles').select('role').eq('user_id', authUser.id),
      supabase.from('quiz_responses').select('answers,completed_at').eq('user_id', authUser.id).maybeSingle(),
    ]);
    const isAdmin = (roles || []).some((r: any) => r.role === 'admin');
    // Sync quiz state into localStorage for legacy gating
    try {
      if (quiz?.completed_at) {
        localStorage.setItem(`aa_quiz_done_${authUser.id}`, '1');
        if (quiz.answers) localStorage.setItem(`aa_quiz_answers_${authUser.id}`, JSON.stringify(quiz.answers));
      }
    } catch {}
    const localQuizDone = readLocalQuizDone(authUser.id);
    return {
      id: authUser.id,
      email: profile?.email || authUser.email,
      full_name: profile?.full_name || authUser.user_metadata?.full_name || '',
      role: isAdmin ? 'admin' : 'student',
      tariff: (profile?.tariff as Tariff) || 'student',
      quiz_completed: !!quiz?.completed_at || localQuizDone,
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
    supabase.auth.getSession()
      .then(({ data: { session } }) => runHydration(session?.user))
      .catch((error) => {
        console.warn('[Auth] initial session failed', error);
        if (!cancelled) { setUser(null); setLoading(false); }
      });

    // Only react to identity changes. Skip INITIAL_SESSION and
    // TOKEN_REFRESHED — those fire on every mount / ~hourly and used to
    // re-fetch profile+quiz, briefly flipping quiz_completed=false and
    // hiding the lesson video behind the onboarding gate.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event !== 'SIGNED_IN' && event !== 'SIGNED_OUT' && event !== 'USER_UPDATED') return;
      if (event === 'SIGNED_OUT') {
        hydrationSeq++;
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

  const login = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim().toLowerCase(), password });
    if (error) return { error: error.message === 'Invalid login credentials' ? 'Email sau parolă incorectă.' : error.message };
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
