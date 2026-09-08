-- Granturi explicite pe tabelele atinse din client prin Data API.
-- Toate sunt tabele auth-only (politicile RLS sunt pe auth.uid()), deci fără anon.

GRANT SELECT, INSERT, UPDATE, DELETE ON public.exercise_responses TO authenticated;
GRANT ALL ON public.exercise_responses TO service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.exercise_completions TO authenticated;
GRANT ALL ON public.exercise_completions TO service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.progress TO authenticated;
GRANT ALL ON public.progress TO service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.lesson_notes TO authenticated;
GRANT ALL ON public.lesson_notes TO service_role;