-- Table for tracking exercise completions (separate from lesson `progress` because exercise ids are TEXT, not uuid)
CREATE TABLE IF NOT EXISTS public.exercise_completions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  exercise_id text NOT NULL,
  completed_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE (user_id, exercise_id)
);

ALTER TABLE public.exercise_completions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users read own ex completions"
  ON public.exercise_completions FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "users insert own ex completions"
  ON public.exercise_completions FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "users delete own ex completions"
  ON public.exercise_completions FOR DELETE TO authenticated
  USING (user_id = auth.uid());

CREATE INDEX IF NOT EXISTS exercise_completions_user_idx
  ON public.exercise_completions(user_id);