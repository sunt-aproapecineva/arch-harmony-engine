-- lesson_notes.lesson_id stores static lesson IDs like "l-3-3" (text), not UUIDs.
-- Also add uniqueness so upsert(user_id, lesson_id) works for autosave.
ALTER TABLE public.lesson_notes ALTER COLUMN lesson_id TYPE text USING lesson_id::text;
ALTER TABLE public.lesson_notes ADD CONSTRAINT lesson_notes_user_lesson_unique UNIQUE (user_id, lesson_id);
CREATE INDEX IF NOT EXISTS lesson_notes_user_idx ON public.lesson_notes(user_id);