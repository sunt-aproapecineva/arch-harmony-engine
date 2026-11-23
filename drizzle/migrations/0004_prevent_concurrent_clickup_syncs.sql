CREATE TABLE public.clickup_sync_locks (
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  course_id TEXT NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  lock_token TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, course_id)
);

GRANT ALL ON public.clickup_sync_locks TO service_role;

ALTER TABLE public.clickup_sync_locks ENABLE ROW LEVEL SECURITY;