ALTER TABLE public.whitelist
  ADD COLUMN IF NOT EXISTS flow_id text REFERENCES public.flows(id) ON DELETE SET NULL;

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
    -- Fluxul ales explicit în whitelist bate alegerea automată. Fără el, cade pe
    -- cel mai recent flux activ al programului. Fluxul ales e validat pe program,
    -- ca un email de START să nu ajungă într-un flux de Business.
    INSERT INTO public.enrollments (user_id, course_id, tariff, flow_id, access_until)
    SELECT new.id, w.course_id, COALESCE(w.tariff, 'student'), f.id,
           COALESCE(f.ends_on, CASE WHEN f.access_weeks IS NOT NULL
                                    THEN f.starts_on + (f.access_weeks * 7) END)
      FROM public.whitelist w
      LEFT JOIN LATERAL (
        SELECT * FROM public.flows fl
         WHERE fl.course_id = w.course_id
           AND (
             (w.flow_id IS NOT NULL AND fl.id = w.flow_id)
             OR (w.flow_id IS NULL AND fl.is_active)
           )
         ORDER BY fl.starts_on DESC LIMIT 1
      ) f ON true
     WHERE lower(w.email) = v_email
    ON CONFLICT (user_id, course_id) DO NOTHING;
  END IF;

  RETURN new;
END;
$function$;