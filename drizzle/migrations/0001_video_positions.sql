CREATE TABLE public.video_positions (
  user_id uuid NOT NULL,
  video_id text NOT NULL,
  position real NOT NULL DEFAULT 0,
  duration real NOT NULL DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, video_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.video_positions TO authenticated;
GRANT ALL ON public.video_positions TO service_role;
ALTER TABLE public.video_positions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own positions" ON public.video_positions FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);