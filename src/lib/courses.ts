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

/**
 * Adresa la care scriu elevii când n-au acces.
 * PROVIZORIE — de înlocuit cu cutia reală a echipei.
 */
export const SUPPORT_EMAIL = 'contact@arhitecturaafacerii.ro';

export type CourseId = 'business' | 'start';

/** Accente de brand, exprimate ca tokeni de design (vezi invariantul 6). */
export type CourseAccent = 'accent' | 'gold';

/**
 * O treaptă de preț a unui program.
 *
 * Treptele NU sunt globale. Business vinde Student / Designer / Arhitect, START vinde
 * Singur / PRO / Ultra — nume, prețuri și beneficii diferite. Înainte, tipul `Tariff`
 * conținea doar cele trei de la Business, iar accesul la bibliotecă se verifica prin
 * șirul literal 'arhitect', deci START n-avea cum să încapă.
 *
 * `id` e ce se scrie în `enrollments.tariff` și `whitelist.tariff` (coloane text).
 */
export interface CourseTier {
  id: string;
  label: string;
  /** Prețul afișat în admin, ca reper pentru cine acordă accesul. */
  price?: string;
  /** Ierarhia în interiorul programului. Mai mare = mai mult acces. */
  order: number;
  accent: 'neutral' | 'accent' | 'gold';
  /**
   * Ce deblochează treapta. Gating-ul se face pe capabilități, nu pe numele treptei —
   * altfel fiecare program nou ar cere încă un `if` prin toată aplicația.
   */
  grants: {
    /** Biblioteca de materiale bonus. */
    library?: boolean;
    /** Mentor dedicat și urmărire personală. */
    mentor?: boolean;
    /** Consultație unu-la-unu. */
    oneOnOne?: boolean;
  };
}

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
  /** Treptele de preț ale programului, de la cea mai mică la cea mai mare. */
  tiers: CourseTier[];
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
    tiers: [
      { id: 'student',  label: 'Student',  price: '589€',   order: 1, accent: 'neutral', grants: {} },
      { id: 'designer', label: 'Designer', price: '777€',   order: 2, accent: 'accent',  grants: { mentor: true } },
      { id: 'arhitect', label: 'Arhitect', price: '1.129€', order: 3, accent: 'gold',    grants: { library: true, mentor: true, oneOnOne: true } },
    ],
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
    // Treptele din pagina de vânzare a programului START.
    tiers: [
      { id: 'singur', label: 'Singur', price: '397€', order: 1, accent: 'neutral', grants: { library: true } },
      { id: 'pro',    label: 'PRO',    price: '597€', order: 2, accent: 'accent',  grants: { library: true, mentor: true } },
      { id: 'ultra',  label: 'Ultra',  price: '997€', order: 3, accent: 'gold',    grants: { library: true, mentor: true, oneOnOne: true } },
    ],
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

// ─── Trepte de preț ───────────────────────────────────────────────────────────

/** Treptele unui program, de la cea mai mică la cea mai mare. */
export function courseTiers(courseId: string | null | undefined): CourseTier[] {
  return getCourse(courseId)?.tiers || [];
}

/** Treapta unui elev la un program. Null dacă id-ul nu aparține programului. */
export function getTier(courseId: string | null | undefined, tierId: string | null | undefined): CourseTier | null {
  if (!tierId) return null;
  return courseTiers(courseId).find(t => t.id === tierId) || null;
}

/** Treapta implicită (cea mai mică) a unui program. */
export function defaultTier(courseId: string | null | undefined): CourseTier | null {
  return courseTiers(courseId)[0] || null;
}

/**
 * Treapta elevului deblochează capabilitatea cerută?
 *
 * De folosit în locul comparațiilor cu numele treptei. `tariff === 'arhitect'` era
 * corect doar pentru Business; la START ar fi refuzat biblioteca tuturor, deși acolo
 * e inclusă din prima treaptă.
 */
export function tierGrants(
  courseId: string | null | undefined,
  tierId: string | null | undefined,
  capability: keyof CourseTier['grants'],
): boolean {
  return !!getTier(courseId, tierId)?.grants?.[capability];
}

/** Culorile insignei de treaptă, în tokeni. */
export const TIER_ACCENT: Record<CourseTier['accent'], { fg: string; bg: string }> = {
  neutral: { fg: 'var(--fg-2)', bg: 'var(--bg-3)' },
  accent: { fg: 'var(--accent)', bg: 'var(--accent-dim)' },
  gold: { fg: 'var(--gold)', bg: 'var(--gold-dim)' },
};

// ─── Vederea adminului: toate programele deodată ──────────────────────────────
//
// Elevul vede un singur program odată — al lui. Adminul nu: el vede tot și poate tot,
// iar programul e o coloană și un filtru, nu un mod global în care intri.
// Funcțiile de aici există ca listele de admin să nu mai hardcodeze un program.

/** O treaptă împreună cu programul din care face parte. */
export interface ScopedTier extends CourseTier {
  courseId: CourseId;
  courseShortTitle: string;
}

/** Toate treptele, din toate programele active, grupate pe program. */
export function allTiers(): ScopedTier[] {
  return activeCourses().flatMap(c =>
    c.tiers.map(t => ({ ...t, courseId: c.id, courseShortTitle: c.shortTitle })),
  );
}

/**
 * Treptele care au sens pentru un domeniu de filtrare.
 * `null` = toate programele, deci reuniunea treptelor.
 */
export function tiersInScope(courseId: string | null | undefined): ScopedTier[] {
  if (!courseId) return allTiers();
  const c = getCourse(courseId);
  return c ? c.tiers.map(t => ({ ...t, courseId: c.id, courseShortTitle: c.shortTitle })) : [];
}

/**
 * Numele unei trepte fără să știi programul.
 * Necesar în listele neîngrădite: rândurile vin din programe diferite, iar un
 * `tariff` de 'singur' nu înseamnă nimic căutat în treptele Business.
 */
export function tierLabelAnywhere(tierId: string | null | undefined): string {
  if (!tierId) return '—';
  const hit = allTiers().find(t => t.id === tierId);
  return hit?.label || tierId.charAt(0).toUpperCase() + tierId.slice(1);
}

/** Programul căruia îi aparține o treaptă. Ambiguitățile se rezolvă în ordinea cursurilor. */
export function courseIdFromTier(tierId: string | null | undefined): CourseId | undefined {
  return allTiers().find(t => t.id === tierId)?.courseId;
}

/**
 * Valoarea filtrului de treaptă: „program:treaptă".
 *
 * Nu doar „treaptă". Astăzi id-urile nu se ciocnesc (student/designer/arhitect vs
 * singur/pro/ultra), dar e un noroc, nu o garanție: primul program care refolosește
 * un id ar amesteca tăcut elevii a două metodologii într-un singur filtru. Perechea
 * o face imposibilă din construcție.
 */
export function tariffFilterValue(courseId: string, tierId: string): string {
  return `${courseId}:${tierId}`;
}

export function parseTariffFilter(value: string | null | undefined): { courseId: string; tierId: string } | null {
  if (!value) return null;
  const i = value.indexOf(':');
  // Forma veche, fără program (linkuri salvate): o acceptăm și căutăm treapta oriunde.
  if (i < 0) {
    const cid = courseIdFromTier(value);
    return cid ? { courseId: cid, tierId: value } : null;
  }
  return { courseId: value.slice(0, i), tierId: value.slice(i + 1) };
}
