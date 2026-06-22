
-- student_insights: cache pentru rezumatul AI și scorurile elevilor
CREATE TABLE public.student_insights (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  summary text,
  scores jsonb NOT NULL DEFAULT '{}'::jsonb,
  model_used text,
  generated_at timestamp with time zone NOT NULL DEFAULT now(),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.student_insights TO authenticated;
GRANT ALL ON public.student_insights TO service_role;

ALTER TABLE public.student_insights ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can read student insights"
  ON public.student_insights FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert student insights"
  ON public.student_insights FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update student insights"
  ON public.student_insights FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete student insights"
  ON public.student_insights FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER trg_student_insights_touch
  BEFORE UPDATE ON public.student_insights
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- supervisor_notes: notițe private ale supervizorului despre elevi
CREATE TABLE public.supervisor_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  author_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  author_name text,
  note text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE INDEX idx_supervisor_notes_user ON public.supervisor_notes(user_id, created_at DESC);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.supervisor_notes TO authenticated;
GRANT ALL ON public.supervisor_notes TO service_role;

ALTER TABLE public.supervisor_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can read supervisor notes"
  ON public.supervisor_notes FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert supervisor notes"
  ON public.supervisor_notes FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin') AND author_id = auth.uid());

CREATE POLICY "Admins can update own supervisor notes"
  ON public.supervisor_notes FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin') AND author_id = auth.uid())
  WITH CHECK (public.has_role(auth.uid(), 'admin') AND author_id = auth.uid());

CREATE POLICY "Admins can delete own supervisor notes"
  ON public.supervisor_notes FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin') AND author_id = auth.uid());

CREATE TRIGGER trg_supervisor_notes_touch
  BEFORE UPDATE ON public.supervisor_notes
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
