// Diagnosticul potrivit cursului. Fiecare ramură are propriile întrebări și propriul
// calcul de profil — vezi §13 din PLATFORM_LOGIC.
import type { QuizDefinition } from './types';
import { BUSINESS_QUIZ } from './business';
import { START_QUIZ } from './start';

const QUIZZES: Record<string, QuizDefinition> = {
  business: BUSINESS_QUIZ,
  start: START_QUIZ,
};

export function getQuizDefinition(courseId: string | null | undefined): QuizDefinition | null {
  return (courseId && QUIZZES[courseId]) || null;
}

export type { QuizDefinition, QuizQuestion, QuizAnswerValue } from './types';
