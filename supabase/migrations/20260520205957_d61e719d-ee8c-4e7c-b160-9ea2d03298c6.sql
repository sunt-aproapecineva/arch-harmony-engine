-- Lock the admin role to the 3 existing admin user_ids. No one — not even existing admins —
-- can grant admin to a new user or remove admin from one of the 3.

CREATE OR REPLACE FUNCTION public.lock_admin_role()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  allowed uuid[] := ARRAY[
    '8ff429de-b41f-4a28-81df-a073ac2e27ed'::uuid,
    '9dcec3df-525c-4dfd-806b-9855bf36ef35'::uuid,
    'da675daa-3713-4d49-8c4e-255eab7a698d'::uuid
  ];
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.role = 'admin' AND NOT (NEW.user_id = ANY(allowed)) THEN
      RAISE EXCEPTION 'Admin role is locked. Cannot grant admin to user %', NEW.user_id
        USING ERRCODE = 'check_violation';
    END IF;
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    -- Block any UPDATE that would create a new admin or change an existing admin row's user
    IF NEW.role = 'admin' AND NOT (NEW.user_id = ANY(allowed)) THEN
      RAISE EXCEPTION 'Admin role is locked.' USING ERRCODE = 'check_violation';
    END IF;
    IF OLD.role = 'admin' AND OLD.user_id = ANY(allowed)
       AND (NEW.role <> 'admin' OR NEW.user_id <> OLD.user_id) THEN
      RAISE EXCEPTION 'Cannot modify locked admin assignment.' USING ERRCODE = 'check_violation';
    END IF;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    IF OLD.role = 'admin' AND OLD.user_id = ANY(allowed) THEN
      RAISE EXCEPTION 'Cannot remove locked admin %', OLD.user_id
        USING ERRCODE = 'check_violation';
    END IF;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS trg_lock_admin_role ON public.user_roles;
CREATE TRIGGER trg_lock_admin_role
BEFORE INSERT OR UPDATE OR DELETE ON public.user_roles
FOR EACH ROW EXECUTE FUNCTION public.lock_admin_role();

-- Also patch handle_new_user so the email-based admin grant on signup is a no-op
-- (the trigger above would block it anyway, but this keeps signup from erroring).
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
    SELECT true, COALESCE(tariff, 'student')
      INTO v_whitelisted, v_tariff
      FROM public.whitelist
      WHERE lower(email) = v_email
      LIMIT 1;
    IF NOT v_whitelisted THEN
      RAISE EXCEPTION 'Email % nu este în lista de acces. Contactează administratorul.', v_email
        USING ERRCODE = 'check_violation';
    END IF;
  END IF;

  INSERT INTO public.profiles (id, email, full_name, tariff)
  VALUES (new.id, v_email, COALESCE(new.raw_user_meta_data->>'full_name', v_email), v_tariff)
  ON CONFLICT (id) DO UPDATE SET tariff = EXCLUDED.tariff, full_name = EXCLUDED.full_name;

  INSERT INTO public.user_roles (user_id, role)
  VALUES (new.id, 'student')
  ON CONFLICT (user_id, role) DO NOTHING;

  -- Admin role is no longer auto-granted. The 3 locked admins are already in user_roles.
  RETURN new;
END;
$function$;