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

async function hydrateUser(authUser: any): Promise<User | null> {
  if (!authUser) return null;
  const [{ data: profile }, { data: roles }] = await Promise.all([
    supabase.from('profiles').select('full_name,email,tariff,avatar_url').eq('id', authUser.id).maybeSingle(),
    supabase.from('user_roles').select('role').eq('user_id', authUser.id),
  ]);
  const isAdmin = (roles || []).some((r: any) => r.role === 'admin');
  return {
    id: authUser.id,
    email: profile?.email || authUser.email,
    full_name: profile?.full_name || authUser.user_metadata?.full_name || '',
    role: isAdmin ? 'admin' : 'student',
    tariff: (profile?.tariff as Tariff) || 'student',
    avatar_url: profile?.avatar_url || null,
    created_at: authUser.created_at,
  };
}

// Whitelist helper for register page — reads live from Supabase
export async function fetchWhitelist(): Promise<WhitelistEntry[]> {
  const { data } = await supabase.from('whitelist').select('email,tariff').order('added_at', { ascending: false });
  return (data || []) as WhitelistEntry[];
}

// Legacy sync helper kept for components that still expect it; returns cached snapshot
let _cachedWhitelist: WhitelistEntry[] = [];
export function getWhitelist(): WhitelistEntry[] {
  return _cachedWhitelist;
}
fetchWhitelist().then(w => { _cachedWhitelist = w; }).catch(() => {});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      // defer DB calls to avoid deadlock inside listener
      setTimeout(async () => {
        const u = await hydrateUser(session?.user);
        setUser(u);
        setLoading(false);
      }, 0);
    });
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      const u = await hydrateUser(session?.user);
      setUser(u);
      setLoading(false);
    });
    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim().toLowerCase(), password });
    if (error) return { error: error.message === 'Invalid login credentials' ? 'Email sau parolă incorectă.' : error.message };
    return { error: null };
  };

  const register = async (email: string, password: string, fullName: string) => {
    const cleanEmail = email.trim().toLowerCase();
    // Pre-check whitelist for nicer UX (DB trigger also enforces)
    if (cleanEmail !== 'babaradumi@gmail.com') {
      const { data: wl } = await supabase.from('whitelist').select('email').ilike('email', cleanEmail).maybeSingle();
      if (!wl) return { error: 'Adresa de email nu este în lista de acces. Contactează administratorul.' };
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
    // Refresh whitelist cache
    fetchWhitelist().then(w => { _cachedWhitelist = w; }).catch(() => {});
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
