
-- lesson_notes
CREATE TABLE public.lesson_notes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  lesson_id UUID NOT NULL,
  content TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, lesson_id)
);
ALTER TABLE public.lesson_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users read own notes" ON public.lesson_notes
  FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "users insert own notes" ON public.lesson_notes
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "users update own notes" ON public.lesson_notes
  FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "users delete own notes" ON public.lesson_notes
  FOR DELETE TO authenticated USING (user_id = auth.uid());

CREATE INDEX idx_lesson_notes_user ON public.lesson_notes(user_id);

-- exercise_responses
CREATE TABLE public.exercise_responses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  exercise_id TEXT NOT NULL,
  response JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, exercise_id)
);
ALTER TABLE public.exercise_responses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users read own ex" ON public.exercise_responses
  FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "users insert own ex" ON public.exercise_responses
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "users update own ex" ON public.exercise_responses
  FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "users delete own ex" ON public.exercise_responses
  FOR DELETE TO authenticated USING (user_id = auth.uid());

CREATE INDEX idx_exercise_responses_user ON public.exercise_responses(user_id);

-- Trigger pentru updated_at
CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;

CREATE TRIGGER trg_lesson_notes_updated BEFORE UPDATE ON public.lesson_notes
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
CREATE TRIGGER trg_exercise_responses_updated BEFORE UPDATE ON public.exercise_responses
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
