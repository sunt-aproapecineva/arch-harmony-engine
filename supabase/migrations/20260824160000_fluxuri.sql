-- Fluxuri (cohorte) — Etapa B.
--
-- Problema: modulele aveau date de deblocare ABSOLUTE, scrise în cod. Fluxul 1 a rulat
-- 18 mai → 6 iulie 2026. Orice elev care intră după acele date primea tot practicumul
-- deblocat instantaneu — ritmul de 8 săptămâni dispărea. La fel, calendarul de evenimente
-- și linkul de Telegram erau comune, deci un flux nou ateriza în grupul celui vechi.
--
-- Soluția: fluxul NU e un curs. Conținutul rămâne comun, o singură dată. Ce diferă e
-- calendarul (ancorat în data de start a fluxului) și canalul de comunicare.

-- ============ FLUXURI ============
CREATE TABLE public.cohorts (
  id text PRIMARY KEY,
  course_id text NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  name text NOT NULL,
  slug text NOT NULL,
  /**
   * Ancora tuturor deblocărilor. Modulul cu unlockWeek = N se deschide la
   * starts_on + N*7 zile. Fără ea, fluxul arată tot conținutul de la început.
   */
  starts_on date NOT NULL,
  telegram_url text,
  notes text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (course_id, slug)
);

GRANT SELECT ON public.cohorts TO authenticated;
GRANT ALL ON public.cohorts TO service_role;

ALTER TABLE public.cohorts ENABLE ROW LEVEL SECURITY;

-- Elevul trebuie să-și poată citi fluxul (data de start, linkul de Telegram).
-- Citirea e permisă tuturor autentificaților: nu conține date personale.
CREATE POLICY "authenticated read cohorts"
  ON public.cohorts FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "admins manage cohorts"
  ON public.cohorts FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER trg_cohorts_touch
  BEFORE UPDATE ON public.cohorts
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE INDEX IF NOT EXISTS idx_cohorts_course ON public.cohorts(course_id, starts_on);

-- Fluxul 1 al cursului Business: data de start e exact prima dată de deblocare din cod,
-- ca elevii actuali să vadă EXACT aceleași date ca până acum.
INSERT INTO public.cohorts (id, course_id, name, slug, starts_on, telegram_url) VALUES
  ('business-f1', 'business', 'Fluxul 1', 'f1', '2026-05-18', 'https://t.me/+f2YYXZlVWjVhMzcy')
ON CONFLICT (id) DO NOTHING;

-- ============ APARTENENȚA LA FLUX ============
ALTER TABLE public.enrollments
  ADD COLUMN IF NOT EXISTS cohort_id text REFERENCES public.cohorts(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_enrollments_cohort ON public.enrollments(cohort_id);

-- Toți elevii existenți de la Business sunt, prin definiție, Fluxul 1.
UPDATE public.enrollments
   SET cohort_id = 'business-f1'
 WHERE course_id = 'business' AND cohort_id IS NULL;

-- ============ CALENDARUL FLUXULUI ============
-- Evenimentele live erau în cod, cu date absolute din mai–iulie. Fiecare flux își are
-- propriul calendar, altfel un flux nou vede opt întâlniri deja trecute.
CREATE TABLE public.cohort_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cohort_id text NOT NULL REFERENCES public.cohorts(id) ON DELETE CASCADE,
  type text NOT NULL DEFAULT 'zoom',
  title text NOT NULL,
  description text,
  event_date date NOT NULL,
  event_time text,
  duration text,
  workshop_themes jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.cohort_events TO authenticated;
GRANT ALL ON public.cohort_events TO service_role;

ALTER TABLE public.cohort_events ENABLE ROW LEVEL SECURITY;

-- Elevul vede doar evenimentele fluxului la care e înscris.
CREATE POLICY "students read own cohort events"
  ON public.cohort_events FOR SELECT TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin'::app_role)
    OR EXISTS (
      SELECT 1 FROM public.enrollments e
       WHERE e.user_id = auth.uid() AND e.cohort_id = cohort_events.cohort_id
    )
  );

CREATE POLICY "admins manage cohort events"
  ON public.cohort_events FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER trg_cohort_events_touch
  BEFORE UPDATE ON public.cohort_events
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE INDEX IF NOT EXISTS idx_cohort_events_cohort ON public.cohort_events(cohort_id, event_date);

-- ============ ANUNȚURI ȚINTITE ============
-- Politica veche era `USING (true)`: un anunț despre Zoom-ul de mâine ajungea și la
-- absolvenții fluxului trecut. cohort_id NULL = anunț pentru toată lumea.
ALTER TABLE public.announcements
  ADD COLUMN IF NOT EXISTS cohort_id text REFERENCES public.cohorts(id) ON DELETE CASCADE;

DROP POLICY IF EXISTS "authenticated read announcements" ON public.announcements;

CREATE POLICY "read announcements for own cohort"
  ON public.announcements FOR SELECT TO authenticated
  USING (
    cohort_id IS NULL
    OR public.has_role(auth.uid(), 'admin'::app_role)
    OR EXISTS (
      SELECT 1 FROM public.enrollments e
       WHERE e.user_id = auth.uid() AND e.cohort_id = announcements.cohort_id
    )
  );
