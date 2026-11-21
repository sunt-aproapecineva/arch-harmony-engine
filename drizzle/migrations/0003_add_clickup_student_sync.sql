CREATE TABLE public.clickup_student_sync (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  course_id text NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  task_id text NOT NULL,
  task_url text,
  subtasks jsonb NOT NULL DEFAULT '{}'::jsonb,
  briefing_comment_id text,
  last_synced_at timestamptz,
  last_error text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, course_id)
);
GRANT SELECT ON public.clickup_student_sync TO authenticated;
GRANT ALL ON public.clickup_student_sync TO service_role;
ALTER TABLE public.clickup_student_sync ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can view ClickUp student sync"
ON public.clickup_student_sync FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER clickup_student_sync_touch_updated_at
BEFORE UPDATE ON public.clickup_student_sync
FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();