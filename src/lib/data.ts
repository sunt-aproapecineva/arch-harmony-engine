// Date reziduale ale platformei.
//
// Conținutul cursurilor (module, lecții, evenimente live) NU mai stă aici — a fost
// mutat în src/lib/content/, cu un fișier per curs. Cere-l prin
// `getCourseModules(courseId)` din '@/lib/content', niciodată global.
//
// Tipurile LiveEvent / EventType au trecut în './types'.
import { User, WhitelistEntry } from './types';

// Rămășițe din perioada pre-Supabase. Nefolosite de aplicație; tarifele reale vin
// din tabelul `enrollments`, iar whitelist-ul din tabelul `whitelist`.
export const MOCK_WHITELIST_ENTRIES: WhitelistEntry[] = [
  { email: 'babaradumi@gmail.com', tariff: 'arhitect' },
  { email: 'victor@arhitecturaafacerii.ro', tariff: 'arhitect' },
];

export const MOCK_WHITELIST: string[] = MOCK_WHITELIST_ENTRIES.map(e => e.email);

export const MOCK_ADMIN: User = {
  id: 'admin-1',
  email: 'babaradumi@gmail.com',
  full_name: 'Admin',
  role: 'admin',
  tariff: 'arhitect',
  created_at: new Date().toISOString(),
};
