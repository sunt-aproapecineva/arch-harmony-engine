/**
 * Id-ul treptei de preț. NU e o listă fixă: fiecare program își definește treptele în
 * `src/lib/courses.ts` (Business: student/designer/arhitect, START: singur/pro/ultra).
 * Coloanele din DB sunt `text`, deci nu e nevoie de nicio migrație pentru un program nou.
 */
export type Tariff = string;

export interface Enrollment {
  course_id: string;
  tariff: Tariff;
  granted_at?: string;
  /** Fluxul din care face parte elevul la acest curs. */
  flow_id?: string | null;
  /** Fluxul hidratat, când a putut fi citit. Ancorează deblocările și canalul. */
  flow?: {
    id: string;
    course_id: string;
    name: string;
    slug: string;
    starts_on: string;
    ends_on: string | null;
    access_weeks: number | null;
    telegram_url: string | null;
    is_active: boolean;
  } | null;
}

export interface User {
  id: string;
  email: string;
  full_name: string;
  role: 'student' | 'admin';
  /** @deprecated Tariful real e per curs, în `enrollments`. Rămâne doar ca fallback de migrație. */
  tariff: Tariff;
  /** @deprecated Quizul e per curs. Folosește `quiz_completed_courses` / hasCompletedOnboarding(user, courseId). */
  quiz_completed?: boolean;
  /** Cursurile la care elevul are acces, cu tariful fiecăruia. */
  enrollments?: Enrollment[];
  /** Id-urile cursurilor la care elevul a terminat quizul de onboarding. */
  quiz_completed_courses?: string[];
  created_at: string;
  country?: string;
  city?: string;
  last_login?: string;
}

export interface MockUser extends User {
  password_hash: string;
}

export interface WhitelistEntry {
  email: string;
  tariff: Tariff;
}

export interface Module {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  order_index: number;
  etapa: string;
  saptamana: string;
  /**
   * @deprecated Dată absolută, din perioada cu un singur flux. Rămâne doar ca
   * plasă pentru elevii fără flux asignat. Sursa de adevăr e `unlockWeek`.
   */
  unlockDate?: string;
  /**
   * Săptămâna de program în care se deschide modulul, numărată de la data de start
   * a FLUXULUI. Modulul cu unlockWeek = 3 se deschide la start + 21 de zile —
   * pentru fiecare flux la data lui. Fără asta, un flux nou primea tot practicumul
   * deblocat din prima zi, pentru că datele absolute erau deja trecute.
   */
  unlockWeek?: number;
  /**
   * Modul-poartă: modulele următoare presupun că acesta a fost livrat.
   * La START, Modulul 2 (Validarea) e poartă — „dacă sari peste, construiești pe nisip".
   */
  isGate?: boolean;
  lessons: Lesson[];
  exercises: Exercise[];
  deliverable: string;
}

export interface LessonDocument {
  title: string;
  description: string;
  url: string;
  docNumber: string;
}

export interface Lesson {
  id: string;
  module_id: string;
  title: string;
  description: string;
  video_url: string;
  video_url_2?: string;
  pdf_url?: string;
  duration_min: number;
  order_index: number;
  is_published: boolean;
  type?: 'video' | 'exercise';
  exercise_id?: string;
  documents?: LessonDocument[];
}

export interface Exercise {
  id: string;
  module_id: string;
  title: string;
  description: string;
  order_index: number;
}

export interface Progress {
  user_id: string;
  lesson_id: string;
  completed_at: string;
}

export type EventType = 'zoom' | 'workshop';

export interface LiveEvent {
  id: string;
  title: string;
  type: EventType;
  date: string;
  time: string;
  duration: string;
  description: string;
  workshopThemes?: string[];
}
