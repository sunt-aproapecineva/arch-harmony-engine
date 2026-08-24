-- Multicurs — Etapa A: structura de cursuri și înscrieri.
--
-- Platforma a funcționat până acum cu presupunerea că există un singur curs.
-- Migrația ridică modelul la două niveluri (curs -> module -> lecții) FĂRĂ să atingă
-- datele elevilor: progress, exercise_responses, lesson_notes și document_responses
-- rămân neschimbate, pentru că id-urile de conținut ale cursurilor noi primesc prefix
-- ('st-...') și rămân unice global. Vezi REGULA ID-URILOR din src/lib/courses.ts.

-- ============ CURSURI ============
CREATE TABLE public.courses (
  id text PRIMARY KEY,
  slug text NOT NULL UNIQUE,
  title text NOT NULL,
  subtitle text,
  description text,
  order_index integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.courses TO authenticated;
GRANT ALL ON public.courses TO service_role;

ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "authenticated read courses"
  ON public.courses FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "admins manage courses"
  ON public.courses FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER trg_courses_touch
  BEFORE UPDATE ON public.courses
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

INSERT INTO public.courses (id, slug, title, subtitle, order_index) VALUES
  ('business', 'business', 'Arhitectura Afacerii · Business', 'Practicum de 8 săptămâni', 0),
  ('start',    'start',    'Arhitectura Afacerii · Start',    'Metodologia pentru început', 1)
ON CONFLICT (id) DO NOTHING;

-- ============ MODULE: apartenența la curs ============
-- Default 'business': tot conținutul existent aparține cursului existent.
ALTER TABLE public.modules
  ADD COLUMN IF NOT EXISTS course_id text NOT NULL DEFAULT 'business'
  REFERENCES public.courses(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_modules_course ON public.modules(course_id, order_index);

-- ============ ÎNSCRIERI ============
-- Tariful se mută aici din `profiles`: un elev poate fi 'arhitect' la Business și
-- 'student' la Start, iar o singură coloană pe profil nu poate exprima asta.
-- `profiles.tariff` rămâne pe loc, ca plasă de siguranță pentru migrație.
CREATE TABLE public.enrollments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id text NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  tariff text NOT NULL DEFAULT 'student',
  granted_at timestamptz NOT NULL DEFAULT now(),
  granted_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, course_id)
);

GRANT SELECT ON public.enrollments TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.enrollments TO authenticated;
GRANT ALL ON public.enrollments TO service_role;

ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users read own enrollments"
  ON public.enrollments FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "admins manage enrollments"
  ON public.enrollments FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER trg_enrollments_touch
  BEFORE UPDATE ON public.enrollments
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE INDEX IF NOT EXISTS idx_enrollments_user ON public.enrollments(user_id);

-- Oglinda lui prevent_tariff_self_escalation, dar pentru înscrieri: fără asta un elev
-- și-ar putea ridica singur tariful sau s-ar putea înscrie la un curs neplătit.
--
-- `auth.uid() IS NULL` înseamnă context server, nu elev: migrațiile, service_role și
-- triggerul SECURITY DEFINER handle_new_user (care rulează la înregistrare, înainte să
-- existe o sesiune). Acelea trebuie lăsate să treacă, altfel se rupe înregistrarea.
CREATE OR REPLACE FUNCTION public.prevent_enrollment_self_grant()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NULL OR public.has_role(auth.uid(), 'admin'::app_role) THEN
    RETURN COALESCE(NEW, OLD);
  END IF;
  RAISE EXCEPTION 'Înscrierile la cursuri pot fi modificate doar de administratori.'
    USING ERRCODE = 'check_violation';
END;
$$;

REVOKE EXECUTE ON FUNCTION public.prevent_enrollment_self_grant() FROM PUBLIC, anon, authenticated;

CREATE TRIGGER trg_enrollments_no_self_grant
  BEFORE INSERT OR UPDATE OR DELETE ON public.enrollments
  FOR EACH ROW EXECUTE FUNCTION public.prevent_enrollment_self_grant();

-- ============ WHITELIST PER CURS ============
-- Un rând per (email, curs): adminul preautorizează separat fiecare produs.
ALTER TABLE public.whitelist
  ADD COLUMN IF NOT EXISTS course_id text NOT NULL DEFAULT 'business'
  REFERENCES public.courses(id) ON DELETE CASCADE;

ALTER TABLE public.whitelist DROP CONSTRAINT IF EXISTS whitelist_email_unique;
ALTER TABLE public.whitelist DROP CONSTRAINT IF EXISTS whitelist_email_key;
ALTER TABLE public.whitelist
  ADD CONSTRAINT whitelist_email_course_unique UNIQUE (email, course_id);

-- is_email_whitelisted rămâne „are acces la măcar un curs" (folosit la înregistrare).
CREATE OR REPLACE FUNCTION public.is_email_whitelisted(_email text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.whitelist WHERE lower(email) = lower(_email))
$$;

-- ============ QUIZ PER CURS ============
-- Fiecare ramură are diagnosticul ei; constrângerea de „un singur quiz per elev" cade.
ALTER TABLE public.quiz_responses
  ADD COLUMN IF NOT EXISTS course_id text NOT NULL DEFAULT 'business'
  REFERENCES public.courses(id) ON DELETE CASCADE;

ALTER TABLE public.quiz_responses DROP CONSTRAINT IF EXISTS quiz_responses_user_id_key;
ALTER TABLE public.quiz_responses
  ADD CONSTRAINT quiz_responses_user_course_unique UNIQUE (user_id, course_id);

-- ============ BRIEFING PER CURS ============
ALTER TABLE public.student_insights
  ADD COLUMN IF NOT EXISTS course_id text NOT NULL DEFAULT 'business'
  REFERENCES public.courses(id) ON DELETE CASCADE;

ALTER TABLE public.student_insights DROP CONSTRAINT IF EXISTS student_insights_user_id_key;
ALTER TABLE public.student_insights
  ADD CONSTRAINT student_insights_user_course_unique UNIQUE (user_id, course_id);

-- ============ MIGRAREA ELEVILOR EXISTENȚI ============
-- Fără asta, toți elevii actuali s-ar trezi fără niciun curs în ecranul de selecție.
INSERT INTO public.enrollments (user_id, course_id, tariff, granted_at)
SELECT p.id, 'business', COALESCE(p.tariff, 'student'), COALESCE(p.created_at, now())
FROM public.profiles p
ON CONFLICT (user_id, course_id) DO NOTHING;

-- ============ ÎNSCRIERE AUTOMATĂ LA ÎNREGISTRARE ============
-- Elevul primește înscriere pentru fiecare curs la care e preautorizat în whitelist.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_email text := lower(new.email);
  v_tariff text := 'student';
  v_whitelisted boolean := false;
BEGIN
  IF v_email = 'babaradumi@gmail.com' THEN
    v_whitelisted := true;
    v_tariff := 'arhitect';
  ELSE
    -- ATENȚIE: `SELECT ... INTO` fără rânduri pune NULL în TOATE variabilele țintă,
    -- suprascriind `v_whitelisted := false`. Vechiul `IF NOT v_whitelisted` devenea
    -- `IF NOT NULL` → NULL → ramura nu se executa, deci verificarea de whitelist era
    -- cod mort și orice email se putea înregistra. Folosim FOUND, care e explicit.
    SELECT COALESCE(tariff, 'student')
      INTO v_tariff
      FROM public.whitelist
      WHERE lower(email) = v_email
      ORDER BY added_at
      LIMIT 1;
    v_whitelisted := FOUND;
    IF NOT v_whitelisted THEN
      RAISE EXCEPTION 'Email % nu este în lista de acces. Contactează administratorul.', v_email
        USING ERRCODE = 'check_violation';
    END IF;
    v_tariff := COALESCE(v_tariff, 'student');
  END IF;

  INSERT INTO public.profiles (id, email, full_name, tariff)
  VALUES (new.id, v_email, COALESCE(new.raw_user_meta_data->>'full_name', v_email), v_tariff)
  ON CONFLICT (id) DO UPDATE SET tariff = EXCLUDED.tariff, full_name = EXCLUDED.full_name;

  INSERT INTO public.user_roles (user_id, role)
  VALUES (new.id, 'student')
  ON CONFLICT (user_id, role) DO NOTHING;

  IF v_email = 'babaradumi@gmail.com' THEN
    INSERT INTO public.enrollments (user_id, course_id, tariff)
    SELECT new.id, c.id, 'arhitect' FROM public.courses c
    ON CONFLICT (user_id, course_id) DO NOTHING;
  ELSE
    INSERT INTO public.enrollments (user_id, course_id, tariff)
    SELECT new.id, w.course_id, COALESCE(w.tariff, 'student')
    FROM public.whitelist w
    WHERE lower(w.email) = v_email
    ON CONFLICT (user_id, course_id) DO NOTHING;
  END IF;

  RETURN new;
END;
$function$;
