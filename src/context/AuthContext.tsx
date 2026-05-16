import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, MockUser, WhitelistEntry, Tariff } from '../lib/types';
import { supabase, isMockMode } from '../lib/supabase';
import { MOCK_WHITELIST_ENTRIES, MOCK_ADMIN } from '../lib/data';
import { logActivity } from '../lib/activity';

async function detectCountry(): Promise<{ country: string; city: string }> {
  try {
    const r = await fetch('https://ipapi.co/json/');
    const d = await r.json();
    return { country: d.country_name || d.country || 'Necunoscut', city: d.city || '' };
  } catch { return { country: 'Necunoscut', city: '' }; }
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<{ error: string | null }>;
  register: (
    email: string,
    password: string,
    fullName: string
  ) => Promise<{ error: string | null }>;
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

// --- Mock helpers ---
const STORAGE_USER_KEY = 'aa_user';
const STORAGE_USER_EXPIRES_KEY = 'aa_user_expires';
const STORAGE_USERS_KEY = 'aa_users';
const STORAGE_WHITELIST_ENTRIES_KEY = 'aa_whitelist_entries';
const REMEMBER_ME_HOURS = 12;

export function getWhitelist(): WhitelistEntry[] {
  try {
    const stored = localStorage.getItem(STORAGE_WHITELIST_ENTRIES_KEY);
    if (stored) return JSON.parse(stored) as WhitelistEntry[];
  } catch {}
  return [...MOCK_WHITELIST_ENTRIES];
}

export function saveWhitelistEntries(entries: WhitelistEntry[]) {
  localStorage.setItem(STORAGE_WHITELIST_ENTRIES_KEY, JSON.stringify(entries));
}

function getStoredUsers(): MockUser[] {
  try {
    const stored = localStorage.getItem(STORAGE_USERS_KEY);
    if (stored) return JSON.parse(stored);
  } catch {}
  return [];
}

function saveUsers(users: MockUser[]) {
  localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(users));
}

function hashPassword(password: string): string {
  return btoa(password + 'aa_salt_2024');
}

function getCurrentMockUser(): User | null {
  try {
    // Session-only login (no remember me)
    const session = sessionStorage.getItem(STORAGE_USER_KEY);
    if (session) return JSON.parse(session);
    // Remember-me login (check expiry)
    const stored = localStorage.getItem(STORAGE_USER_KEY);
    if (stored) {
      const expires = localStorage.getItem(STORAGE_USER_EXPIRES_KEY);
      if (!expires || Date.now() < Number(expires)) {
        return JSON.parse(stored);
      }
      // Expired
      localStorage.removeItem(STORAGE_USER_KEY);
      localStorage.removeItem(STORAGE_USER_EXPIRES_KEY);
    }
  } catch {}
  return null;
}

function persistMockUser(user: User, rememberMe: boolean) {
  if (rememberMe) {
    localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(user));
    localStorage.setItem(STORAGE_USER_EXPIRES_KEY, String(Date.now() + REMEMBER_ME_HOURS * 3600 * 1000));
    sessionStorage.removeItem(STORAGE_USER_KEY);
  } else {
    sessionStorage.setItem(STORAGE_USER_KEY, JSON.stringify(user));
    localStorage.removeItem(STORAGE_USER_KEY);
    localStorage.removeItem(STORAGE_USER_EXPIRES_KEY);
  }
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isMockMode) {
      // Initialize default admin if not exists
      const users = getStoredUsers();
      const adminExists = users.find((u) => u.email === MOCK_ADMIN.email);
      if (!adminExists) {
        users.push({
          ...MOCK_ADMIN,
          password_hash: hashPassword('admin123'),
        });
        saveUsers(users);
      }

      const current = getCurrentMockUser();
      setUser(current);
      setLoading(false);
    } else {
      supabase?.auth.getSession().then(({ data: { session } }) => {
        if (session?.user) {
          setUser({
            id: session.user.id,
            email: session.user.email!,
            full_name: session.user.user_metadata?.full_name || '',
            role: session.user.user_metadata?.role || 'student',
            tariff: (session.user.user_metadata?.tariff as Tariff) || 'student',
            created_at: session.user.created_at,
          });
        }
        setLoading(false);
      });

      const {
        data: { subscription },
      } = supabase!.auth.onAuthStateChange((_event, session) => {
        if (session?.user) {
          setUser({
            id: session.user.id,
            email: session.user.email!,
            full_name: session.user.user_metadata?.full_name || '',
            role: session.user.user_metadata?.role || 'student',
            tariff: (session.user.user_metadata?.tariff as Tariff) || 'student',
            created_at: session.user.created_at,
          });
        } else {
          setUser(null);
        }
      });

      return () => subscription.unsubscribe();
    }
  }, []);

  const login = async (
    email: string,
    password: string,
    rememberMe = false
  ): Promise<{ error: string | null }> => {
    if (isMockMode) {
      const users = getStoredUsers();
      const found = users.find(
        (u) =>
          u.email.toLowerCase() === email.toLowerCase() &&
          u.password_hash === hashPassword(password)
      );
      if (!found) {
        return { error: 'Email sau parolă incorectă.' };
      }
      const { country, city } = await detectCountry();
      const last_login = new Date().toISOString();
      const { password_hash: _, ...userWithoutHash } = found;
      const updatedUser: User = { ...userWithoutHash, country, city, last_login };

      // Update user in users list
      const allUsers = getStoredUsers();
      const userIdx = allUsers.findIndex(u => u.id === found.id);
      if (userIdx !== -1) {
        allUsers[userIdx] = { ...allUsers[userIdx], country, city, last_login };
        saveUsers(allUsers);
      }

      persistMockUser(updatedUser, rememberMe);
      setUser(updatedUser);

      logActivity({
        userId: found.id,
        userEmail: found.email,
        userName: found.full_name,
        type: 'login',
        label: `${found.full_name} s-a conectat`,
        data: { tariff: found.tariff },
        country,
        city,
      });

      return { error: null };
    } else {
      const { error } = await supabase!.auth.signInWithPassword({
        email,
        password,
      });
      return { error: error?.message || null };
    }
  };

  const register = async (
    email: string,
    password: string,
    fullName: string
  ): Promise<{ error: string | null }> => {
    if (isMockMode) {
      const whitelist = getWhitelist();
      const whitelistEntry = whitelist.find(
        (e) => e.email.toLowerCase() === email.toLowerCase()
      );
      if (!whitelistEntry) {
        return {
          error:
            'Adresa de email nu este în lista de acces. Contactează administratorul.',
        };
      }

      const users = getStoredUsers();
      const existing = users.find(
        (u) => u.email.toLowerCase() === email.toLowerCase()
      );
      if (existing) {
        return { error: 'Există deja un cont cu această adresă de email.' };
      }

      const isAdmin = email.toLowerCase() === MOCK_ADMIN.email;
      const tariff: Tariff = isAdmin ? MOCK_ADMIN.tariff : whitelistEntry.tariff;

      const newUser: MockUser = {
        id: `user-${Date.now()}`,
        email: email.toLowerCase(),
        full_name: fullName,
        role: isAdmin ? 'admin' : 'student',
        tariff,
        created_at: new Date().toISOString(),
        password_hash: hashPassword(password),
      };

      users.push(newUser);
      saveUsers(users);

      const { password_hash: _, ...userWithoutHash } = newUser;
      persistMockUser(userWithoutHash, false);
      setUser(userWithoutHash);

      logActivity({
        userId: newUser.id,
        userEmail: newUser.email,
        userName: newUser.full_name,
        type: 'platform_register',
        label: `${newUser.full_name} s-a înregistrat`,
        data: { tariff: newUser.tariff, role: newUser.role },
      });

      return { error: null };
    } else {
      const { error } = await supabase!.auth.signUp({
        email,
        password,
        options: { data: { full_name: fullName, role: 'student' } },
      });
      return { error: error?.message || null };
    }
  };

  const logout = async () => {
    if (isMockMode) {
      localStorage.removeItem(STORAGE_USER_KEY);
      localStorage.removeItem(STORAGE_USER_EXPIRES_KEY);
      sessionStorage.removeItem(STORAGE_USER_KEY);
      setUser(null);
    } else {
      await supabase?.auth.signOut();
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        isAdmin: user?.role === 'admin',
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
