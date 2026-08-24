// Gating-ul de acces al elevului: quizul de onboarding și înscrierea la curs.
//
// Quizul e per curs — fiecare metodologie are diagnosticul ei, obligatoriu înainte de
// practicum. Flagul local oglindește starea din DB ca gating-ul să fie instant și un
// elev să nu fie blocat de o citire lentă (același tipar ca înainte, dar cu cheia
// extinsă cu id-ul cursului).
import type { User } from './types';
import { isEnrolled } from './enrollments';

/** Cheia locală care oglindește „am terminat quizul cursului X". */
export function quizDoneKey(userId: string, courseId: string): string {
  return `aa_quiz_done_${userId}_${courseId}`;
}

/** Cheia veche, de dinainte de multicurs — însemna implicit cursul Business. */
export function legacyQuizDoneKey(userId: string): string {
  return `aa_quiz_done_${userId}`;
}

function readLocalFlag(key: string): boolean {
  try {
    return typeof window !== 'undefined' && window.localStorage.getItem(key) === '1';
  } catch {
    return false;
  }
}

export function hasCompletedOnboarding(
  user: Pick<User, 'id' | 'quiz_completed' | 'quiz_completed_courses'> | null | undefined,
  courseId: string | null | undefined,
): boolean {
  if (!user?.id || !courseId) return false;

  if (user.quiz_completed_courses?.includes(courseId)) return true;
  if (readLocalFlag(quizDoneKey(user.id, courseId))) return true;

  // Compatibilitate: elevii care au dat quizul înainte de multicurs au doar flagul
  // vechi, fără id de curs. Îl acceptăm exclusiv pentru Business, cursul care exista
  // atunci; altfel un elev de Business ar sări gratis peste quizul de Start.
  if (courseId === 'business' && (user.quiz_completed || readLocalFlag(legacyQuizDoneKey(user.id)))) {
    return true;
  }

  return false;
}

/** Cheia sub care ține o trimitere de quiz care n-a ajuns în cloud. */
export function quizPendingKey(userId: string, courseId: string): string {
  return `aa_quiz_pending_${userId}_${courseId}`;
}

/**
 * Reține o trimitere de quiz care a eșuat în cloud, ca să fie reîncercată la
 * următoarea hidratare.
 *
 * De ce există: flagul local deschide practicumul instant (local-first, invariantul 3),
 * dar dacă scrierea în DB eșuează, elevul trece de poartă iar mentorul nu vede niciun
 * diagnostic — și pe alt dispozitiv elevul e pus să-l dea din nou. Coada asta închide
 * gaura fără să-l blocheze pe elev.
 */
export function queuePendingQuiz(userId: string, courseId: string, payload: unknown) {
  if (!userId || !courseId || typeof window === 'undefined') return;
  try { window.localStorage.setItem(quizPendingKey(userId, courseId), JSON.stringify(payload)); } catch { /* noop */ }
}

export function readPendingQuiz(userId: string, courseId: string): any | null {
  if (!userId || !courseId || typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(quizPendingKey(userId, courseId));
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function clearPendingQuiz(userId: string, courseId: string) {
  if (!userId || !courseId || typeof window === 'undefined') return;
  try { window.localStorage.removeItem(quizPendingKey(userId, courseId)); } catch { /* noop */ }
}

/** Marchează local quizul ca terminat, imediat după trimiterea răspunsurilor. */
export function markOnboardingDoneLocally(userId: string, courseId: string) {
  if (!userId || !courseId || typeof window === 'undefined') return;
  try { window.localStorage.setItem(quizDoneKey(userId, courseId), '1'); } catch { /* noop */ }
}

/** Elevul are acces la curs? Sursa de adevăr e tabelul `enrollments`. */
export function hasCourseAccess(
  user: Pick<User, 'enrollments'> | null | undefined,
  courseId: string | null | undefined,
): boolean {
  if (!user || !courseId) return false;
  return isEnrolled(user.enrollments, courseId);
}
