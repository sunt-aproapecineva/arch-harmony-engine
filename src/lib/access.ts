export function hasCompletedOnboarding(user: { id?: string; quiz_completed?: boolean } | null | undefined): boolean {
  if (!user?.id) return false;
  if (user.quiz_completed) return true;

  try {
    return typeof window !== 'undefined' && window.localStorage.getItem(`aa_quiz_done_${user.id}`) === '1';
  } catch {
    return false;
  }
}