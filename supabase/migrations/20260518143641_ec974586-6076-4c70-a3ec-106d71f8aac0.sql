ALTER TABLE public.progress DROP CONSTRAINT IF EXISTS progress_lesson_id_fkey;
ALTER TABLE public.progress ALTER COLUMN lesson_id TYPE text USING lesson_id::text;
CREATE UNIQUE INDEX IF NOT EXISTS progress_user_lesson_uniq ON public.progress (user_id, lesson_id);