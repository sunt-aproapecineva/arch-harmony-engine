// Registrul cursurilor platformei.
//
// Platforma a pornit ca un singur curs (Arhitectura Afacerii · Business) și a fost
// ridicată la două niveluri: curs -> module -> lecții. Acest fișier este singura
// sursă de adevăr pentru „ce cursuri există"; conținutul lor stă în src/lib/content/.
//
// REGULA ID-URILOR: fiecare curs are un `idPrefix` propriu, iar toate id-urile de
// module / lecții / exerciții ale cursului încep cu el. Business păstrează prefixul
// gol pentru că id-urile lui ('m-0', 'l-1-1', 'e-0-1') sunt deja scrise în datele
// elevilor (progress.lesson_id, exercise_responses.exercise_id, lesson_notes.lesson_id,
// document_responses.document_id). Orice curs nou trebuie să aibă prefix ne-gol, ca
// id-urile să rămână unice global și cele patru tabele să nu aibă nevoie de migrație.

export type CourseId = 'business' | 'start';

/** Accente de brand, exprimate ca tokeni de design (vezi invariantul 6). */
export type CourseAccent = 'accent' | 'gold';

export interface Course {
  id: CourseId;
  /** segmentul din URL: /c/<slug>/dashboard */
  slug: string;
  /** numele complet, afișat în ecranul de selecție */
  title: string;
  /** numele scurt, pentru header și comutatorul de curs */
  shortTitle: string;
  subtitle: string;
  description: string;
  order_index: number;
  /** vezi REGULA ID-URILOR de mai sus */
  idPrefix: string;
  accent: CourseAccent;
  /** cursul cere quiz de onboarding înainte de practicum */
  hasQuiz: boolean;
  /** cursurile inactive nu apar în ecranul de selecție nici dacă există înscriere */
  is_active: boolean;
}

export const COURSES: Course[] = [
  {
    id: 'business',
    slug: 'business',
    title: 'Arhitectura Afacerii · Business',
    shortTitle: 'Business',
    subtitle: 'Practicum de 8 săptămâni',
    description:
      'Construiești sistemul firmei tale etapă cu etapă: fundația, fluxurile, oamenii, ' +
      'tabloul de bord și ritmul de conducere.',
    order_index: 0,
    idPrefix: '',
    accent: 'accent',
    hasQuiz: true,
    is_active: true,
  },
  {
    id: 'start',
    slug: 'start',
    title: 'Arhitectura Afacerii · Start',
    shortTitle: 'Start',
    subtitle: 'Metodologia pentru început',
    description:
      'Prima structură a unei afaceri care abia pornește: de la idee la primul flux ' +
      'care aduce bani, fără să construiești pe nisip.',
    order_index: 1,
    idPrefix: 'st-',
    accent: 'gold',
    hasQuiz: true,
    is_active: true,
  },
];

const BY_ID = new Map<string, Course>(COURSES.map(c => [c.id, c]));
const BY_SLUG = new Map<string, Course>(COURSES.map(c => [c.slug, c]));

export function getCourse(id: string | null | undefined): Course | undefined {
  return id ? BY_ID.get(id) : undefined;
}

export function getCourseBySlug(slug: string | null | undefined): Course | undefined {
  return slug ? BY_SLUG.get(slug) : undefined;
}

export function activeCourses(): Course[] {
  return COURSES.filter(c => c.is_active).sort((a, b) => a.order_index - b.order_index);
}

/**
 * Cursul căruia îi aparține un id de conținut ('m-0' -> business, 'st-m-0' -> start).
 * Se potrivește prefixul cel mai lung, ca prefixul gol al lui Business să rămână
 * fallback-ul și să nu „fure" id-urile celorlalte cursuri.
 */
export function courseIdFromContentId(contentId: string | null | undefined): CourseId | undefined {
  if (!contentId) return undefined;
  let best: Course | undefined;
  for (const c of COURSES) {
    if (!c.idPrefix) continue;
    if (contentId.startsWith(c.idPrefix) && (!best || c.idPrefix.length > best.idPrefix.length)) {
      best = c;
    }
  }
  if (best) return best.id;
  const fallback = COURSES.find(c => c.idPrefix === '');
  return fallback?.id;
}

/** Tokenii de culoare ai accentului unui curs — fără valori literale în componente. */
export const COURSE_ACCENT: Record<CourseAccent, { fg: string; dim: string }> = {
  accent: { fg: 'var(--accent)', dim: 'var(--accent-dim)' },
  gold: { fg: 'var(--gold)', dim: 'var(--gold-dim)' },
};
