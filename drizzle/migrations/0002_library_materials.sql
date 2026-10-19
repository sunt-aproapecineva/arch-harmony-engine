CREATE TABLE public.library_materials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id text NOT NULL REFERENCES public.courses(id),
  title text NOT NULL,
  description text,
  topic text,
  file_path text,
  file_name text,
  external_url text,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.library_materials TO authenticated;
GRANT ALL ON public.library_materials TO service_role;
ALTER TABLE public.library_materials ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enrolled or admin read library" ON public.library_materials FOR SELECT TO authenticated
USING (public.has_role(auth.uid(),'admin') OR EXISTS (SELECT 1 FROM public.enrollments e WHERE e.user_id = auth.uid() AND e.course_id = library_materials.course_id));
CREATE POLICY "Admins manage library" ON public.library_materials FOR ALL TO authenticated
USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

CREATE POLICY "Library files read" ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'library-files' AND (public.has_role(auth.uid(),'admin') OR EXISTS (SELECT 1 FROM public.enrollments e WHERE e.user_id = auth.uid() AND e.course_id = split_part(name,'/',1))));
CREATE POLICY "Library files admin insert" ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'library-files' AND public.has_role(auth.uid(),'admin'));
CREATE POLICY "Library files admin delete" ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'library-files' AND public.has_role(auth.uid(),'admin'));