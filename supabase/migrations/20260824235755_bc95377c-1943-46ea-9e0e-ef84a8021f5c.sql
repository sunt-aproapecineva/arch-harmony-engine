-- Fluxuri și grupe — Etapa B.
--
-- DOUĂ CONCEPTE DIFERITE. Confundarea lor e sursa de haos, deci le ținem separate:
--
--   FLUX (`flows`) — unitatea de LIVRARE. Decide ce vede elevul și când:
--     data de start (ancorează orarul deblocărilor), canalul de Telegram,
--     calendarul de întâlniri, anunțurile primite, fereastra de acces.
--     Un elev aparține UNUI SINGUR flux per training — altfel nu se poate răspunde
--     la întrebarea „ce orar are omul ăsta".
--
--   GRUPĂ (`groups`) — unitatea de ADMINISTRARE. O listă de oameni cu nume.
--     Nu are orar, nu are canal, nu dă acces prin ea însăși. Există ca să poți face
--     operațiuni în masă: aduni 30 de oameni o dată, aloci grupa unui flux, toți
--     primesc acces cu orarul acelui flux. Un om poate fi în mai multe grupe;
--     o grupă poate fi alocată mai multor fluxuri.
--
--   ÎNSCRIERE (`enrollments`) — rămâne sursa de adevăr pentru acces. Alocarea unei
--     grupe la un flux SCRIE înscrieri; `source_group_id` reține de unde a venit
--     accesul, ca retragerea grupei să nu atingă înscrierile date manual.
--
-- Problema concretă pe care o rezolvă: modulele aveau date de deblocare ABSOLUTE
-- scrise în cod (18 mai → 6 iulie 2026). Orice elev intrat după ele primea tot
-- practicumul deblocat instantaneu — ritmul de 8 săptămâni dispărea din prima zi.

-- ============ FLUXURI ============
CREATE TABLE public.flows (
  id text PRIMARY KEY,
  course_id text NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  name text NOT NULL,
  slug text NOT NULL,
  /** Ancora orarului: modulul cu unlockWeek = N se deschide la starts_on + N*7 zile. */
  starts_on date NOT NULL,
  /** Sfârșitul accesului pentru tot fluxul. NULL = nelimitat. */
  ends_on date,
  /** Alternativa automată la ends_on: durata accesului în săptămâni de la start. */
  access_weeks integer,
  telegram_url text,
  notes text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (course_id, slug)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.flows TO authenticated;
GRANT ALL ON public.flows TO service_role;
ALTER TABLE public.flows ENABLE ROW LEVEL SECURITY;

-- Coloana trebuie să existe ÎNAINTE de politicile care o referă (aceeași tranzacție).
ALTER TABLE public.enrollments
  ADD COLUMN IF NOT EXISTS flow_id text REFERENCES public.flows(id) ON DELETE SET NULL;

-- Elevul își citește DOAR fluxul lui. `USING (true)` ar expune linkul privat de
-- Telegram al tuturor fluxurilor oricărui cont autentificat — inclusiv al grupelor
-- din care nu face parte.
CREATE POLICY "read own flow"
  ON public.flows FOR SELECT TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin'::app_role)
    OR EXISTS (SELECT 1 FROM public.enrollments e
                WHERE e.user_id = auth.uid() AND e.flow_id = flows.id)
  );
CREATE POLICY "admins manage flows"
  ON public.flows FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER trg_flows_touch BEFORE UPDATE ON public.flows
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
CREATE INDEX IF NOT EXISTS idx_flows_course ON public.flows(course_id, starts_on DESC);

-- Fluxul existent. Data de start e prima dată de deblocare din cod, ca elevii actuali
-- să vadă EXACT aceleași date ca înainte de refactor.
INSERT INTO public.flows (id, course_id, name, slug, starts_on, access_weeks, telegram_url) VALUES
  ('business-f1', 'business', 'Flux 1 · AA Business', 'flux-1', '2026-05-18', 26, 'https://t.me/+f2YYXZlVWjVhMzcy')
ON CONFLICT (id) DO NOTHING;

-- ============ CALENDARUL FLUXULUI ============
CREATE TABLE public.flow_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  flow_id text NOT NULL REFERENCES public.flows(id) ON DELETE CASCADE,
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

GRANT SELECT, INSERT, UPDATE, DELETE ON public.flow_events TO authenticated;
GRANT ALL ON public.flow_events TO service_role;
ALTER TABLE public.flow_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "students read own flow events"
  ON public.flow_events FOR SELECT TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin'::app_role)
    OR EXISTS (SELECT 1 FROM public.enrollments e
                WHERE e.user_id = auth.uid() AND e.flow_id = flow_events.flow_id)
  );
CREATE POLICY "admins manage flow events"
  ON public.flow_events FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER trg_flow_events_touch BEFORE UPDATE ON public.flow_events
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
CREATE INDEX IF NOT EXISTS idx_flow_events_flow ON public.flow_events(flow_id, event_date);

-- ============ GRUPE (liste de oameni) ============
CREATE TABLE public.groups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.groups TO authenticated;
GRANT ALL ON public.groups TO service_role;
ALTER TABLE public.groups ENABLE ROW LEVEL SECURITY;

-- Grupele sunt un instrument de administrare: doar adminii le văd și le gestionează.
CREATE POLICY "admins manage groups"
  ON public.groups FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER trg_groups_touch BEFORE UPDATE ON public.groups
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE TABLE public.group_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id uuid NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  added_at timestamptz NOT NULL DEFAULT now(),
  added_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  UNIQUE (group_id, user_id)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.group_members TO authenticated;
GRANT ALL ON public.group_members TO service_role;
ALTER TABLE public.group_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admins manage group members"
  ON public.group_members FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE INDEX IF NOT EXISTS idx_group_members_group ON public.group_members(group_id);
CREATE INDEX IF NOT EXISTS idx_group_members_user ON public.group_members(user_id);

-- ============ ALOCAREA UNEI GRUPE LA UN FLUX ============
CREATE TABLE public.group_flow_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id uuid NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
  flow_id text NOT NULL REFERENCES public.flows(id) ON DELETE CASCADE,
  tariff text NOT NULL DEFAULT 'student',
  assigned_at timestamptz NOT NULL DEFAULT now(),
  assigned_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  UNIQUE (group_id, flow_id)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.group_flow_assignments TO authenticated;
GRANT ALL ON public.group_flow_assignments TO service_role;
ALTER TABLE public.group_flow_assignments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admins manage group flow assignments"
  ON public.group_flow_assignments FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

-- ============ ÎNSCRIERI: FLUX + FEREASTRĂ DE ACCES + PROVENIENȚĂ ============
/** Până când are acces. NULL = nelimitat. Editabil per elev, independent de flux. */
ALTER TABLE public.enrollments
  ADD COLUMN IF NOT EXISTS access_until date;

/** De unde a venit accesul. NULL = dat manual — retragerea unei grupe nu-l atinge. */
ALTER TABLE public.enrollments
  ADD COLUMN IF NOT EXISTS source_group_id uuid REFERENCES public.groups(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_enrollments_flow ON public.enrollments(flow_id);

-- Elevii existenți de la Business intră în fluxul existent.
UPDATE public.enrollments
   SET flow_id = 'business-f1'
 WHERE course_id = 'business' AND flow_id IS NULL;

-- ============ OPERAȚIUNEA ÎN MASĂ ============
/** Ordinea tarifelor: student < designer < arhitect. */
CREATE OR REPLACE FUNCTION public.max_tariff(a text, b text)
RETURNS text LANGUAGE sql IMMUTABLE AS $$
  SELECT CASE
    WHEN 'arhitect' IN (a, b) THEN 'arhitect'
    WHEN 'designer' IN (a, b) THEN 'designer'
    ELSE COALESCE(a, b, 'student')
  END
$$;

/**
 * Aplică o grupă peste un flux: fiecare membru primește (sau își actualizează)
 * înscrierea la cursul fluxului, cu orarul și fereastra lui de acces.
 *
 * Rulează ca SECURITY DEFINER ca să treacă de `prevent_enrollment_self_grant`,
 * dar verifică explicit rolul de admin înainte de orice scriere.
 * Idempotentă: re-rularea după adăugarea unor membri noi îi prinde doar pe ei.
 */
CREATE OR REPLACE FUNCTION public.apply_group_to_flow(_group_id uuid, _flow_id text)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_course text;
  v_until  date;
  v_tariff text;
  v_count  integer;
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin'::app_role) THEN
    RAISE EXCEPTION 'Doar administratorii pot aloca grupe la fluxuri.'
      USING ERRCODE = 'insufficient_privilege';
  END IF;

  SELECT f.course_id,
         COALESCE(f.ends_on, CASE WHEN f.access_weeks IS NOT NULL
                                  THEN f.starts_on + (f.access_weeks * 7) END)
    INTO v_course, v_until
    FROM public.flows f WHERE f.id = _flow_id;

  IF v_course IS NULL THEN
    RAISE EXCEPTION 'Fluxul % nu există.', _flow_id USING ERRCODE = 'check_violation';
  END IF;

  SELECT COALESCE(a.tariff, 'student') INTO v_tariff
    FROM public.group_flow_assignments a
   WHERE a.group_id = _group_id AND a.flow_id = _flow_id;
  v_tariff := COALESCE(v_tariff, 'student');

  INSERT INTO public.enrollments (user_id, course_id, flow_id, tariff, access_until, source_group_id)
  SELECT gm.user_id, v_course, _flow_id, v_tariff, v_until, _group_id
    FROM public.group_members gm
   WHERE gm.group_id = _group_id
  ON CONFLICT (user_id, course_id) DO UPDATE
     SET flow_id         = EXCLUDED.flow_id,
         access_until    = EXCLUDED.access_until,
         -- Proveniența NU se rescrie. Dacă înscrierea exista deja (dată manual sau
         -- prin altă grupă), rămâne a ei: altfel o alocare de grupă „adopta" accesele
         -- manuale, iar retragerea grupei le ștergea pe toate odată cu ale ei.
         source_group_id = enrollments.source_group_id,
         -- Tariful dat manual mai sus nu se coboară de o realocare de grupă.
         tariff          = public.max_tariff(enrollments.tariff, EXCLUDED.tariff);

  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.apply_group_to_flow(uuid, text) FROM PUBLIC, anon;
GRANT  EXECUTE ON FUNCTION public.apply_group_to_flow(uuid, text) TO authenticated;

/**
 * Retrage o grupă dintr-un flux: șterge doar înscrierile venite DIN acea grupă.
 * Accesele date manual rămân neatinse.
 */
CREATE OR REPLACE FUNCTION public.revoke_group_from_flow(_group_id uuid, _flow_id text)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE v_count integer;
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin'::app_role) THEN
    RAISE EXCEPTION 'Doar administratorii pot retrage grupe din fluxuri.'
      USING ERRCODE = 'insufficient_privilege';
  END IF;

  DELETE FROM public.enrollments
   WHERE flow_id = _flow_id AND source_group_id = _group_id;
  GET DIAGNOSTICS v_count = ROW_COUNT;

  DELETE FROM public.group_flow_assignments
   WHERE group_id = _group_id AND flow_id = _flow_id;

  RETURN v_count;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.revoke_group_from_flow(uuid, text) FROM PUBLIC, anon;
GRANT  EXECUTE ON FUNCTION public.revoke_group_from_flow(uuid, text) TO authenticated;

-- ============ ANUNȚURI ȚINTITE PE FLUX ============
-- Politica veche era `USING (true)`: un anunț despre Zoom-ul de mâine ajungea și la
-- absolvenții fluxului trecut. flow_id NULL = anunț pentru toată lumea.
ALTER TABLE public.announcements
  ADD COLUMN IF NOT EXISTS flow_id text REFERENCES public.flows(id) ON DELETE CASCADE;

DROP POLICY IF EXISTS "authenticated read announcements" ON public.announcements;

CREATE POLICY "read announcements for own flow"
  ON public.announcements FOR SELECT TO authenticated
  USING (
    flow_id IS NULL
    OR public.has_role(auth.uid(), 'admin'::app_role)
    OR EXISTS (SELECT 1 FROM public.enrollments e
                WHERE e.user_id = auth.uid() AND e.flow_id = announcements.flow_id)
  );

-- ============ ÎNSCRIEREA NOUĂ PRIMEȘTE UN FLUX ============
/**
 * Fără flux, `isModuleLocked` cade pe datele absolute din cod — care sunt deja trecute
 * — și elevul nou primește TOT practicumul deblocat din prima zi. Redefinim
 * handle_new_user ca să lege înscrierea de cel mai recent flux activ al cursului.
 *
 * Dacă un curs n-are niciun flux, flow_id rămâne NULL și adminul îl vede marcat
 * „fără flux" în lista de utilizatori — o stare vizibilă, nu una tăcută.
 */
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
    INSERT INTO public.enrollments (user_id, course_id, tariff, flow_id, access_until)
    SELECT new.id, c.id, 'arhitect', f.id,
           COALESCE(f.ends_on, CASE WHEN f.access_weeks IS NOT NULL
                                    THEN f.starts_on + (f.access_weeks * 7) END)
      FROM public.courses c
      LEFT JOIN LATERAL (
        SELECT * FROM public.flows fl
         WHERE fl.course_id = c.id AND fl.is_active
         ORDER BY fl.starts_on DESC LIMIT 1
      ) f ON true
    ON CONFLICT (user_id, course_id) DO NOTHING;
  ELSE
    INSERT INTO public.enrollments (user_id, course_id, tariff, flow_id, access_until)
    SELECT new.id, w.course_id, COALESCE(w.tariff, 'student'), f.id,
           COALESCE(f.ends_on, CASE WHEN f.access_weeks IS NOT NULL
                                    THEN f.starts_on + (f.access_weeks * 7) END)
      FROM public.whitelist w
      LEFT JOIN LATERAL (
        SELECT * FROM public.flows fl
         WHERE fl.course_id = w.course_id AND fl.is_active
         ORDER BY fl.starts_on DESC LIMIT 1
      ) f ON true
     WHERE lower(w.email) = v_email
    ON CONFLICT (user_id, course_id) DO NOTHING;
  END IF;

  RETURN new;
END;
$function$;

-- Elevii deja migrați la Flux 1 primesc și fereastra de acces a fluxului.
UPDATE public.enrollments e
   SET access_until = COALESCE(f.ends_on, CASE WHEN f.access_weeks IS NOT NULL
                                               THEN f.starts_on + (f.access_weeks * 7) END)
  FROM public.flows f
 WHERE e.flow_id = f.id AND e.access_until IS NULL;