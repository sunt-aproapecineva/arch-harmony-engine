// Tipurile quizului de onboarding. Fiecare curs are diagnosticul lui — vezi §13
// din PLATFORM_LOGIC: „fiecare metodologie își cere propriul calcul de profil".
export type QuizAnswerValue = string | string[] | number;

export interface QuizQuestion {
  id: string;
  block: string;
  blockNum: number;
  question: string;
  type: 'select' | 'radio' | 'multi' | 'slider' | 'text';
  options?: string[];
  allowOther?: boolean;
  maxSelect?: number;
  minSelect?: number;
  min?: number;
  max?: number;
  labels?: Record<number, string>;
}


export interface QuizDefinition {
  courseId: string;
  /** Titlul ecranului de intro, înaintea primei întrebări. */
  introTitle: string;
  introSubtitle: string;
  questions: QuizQuestion[];
  /** Ce se arată în sumarul de la final, în ordine. */
  summaryFields: Array<{ label: string; questionId: string }>;
  /** Calculul profilului. Fiecare curs are logica lui. */
  generateProfile: (answers: Record<string, QuizAnswerValue>) => Record<string, any>;
}
