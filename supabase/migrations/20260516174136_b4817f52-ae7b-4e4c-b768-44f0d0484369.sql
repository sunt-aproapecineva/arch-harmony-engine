
-- Add tariff to whitelist & profiles
ALTER TABLE public.whitelist ADD COLUMN IF NOT EXISTS tariff text NOT NULL DEFAULT 'student';
ALTER TABLE public.whitelist ADD CONSTRAINT whitelist_email_unique UNIQUE (email);
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS tariff text NOT NULL DEFAULT 'student';

-- Drop old trigger/function so we can recreate cleanly
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_email text := lower(new.email);
  v_tariff text := 'student';
  v_is_admin boolean := false;
  v_whitelisted boolean := false;
BEGIN
  -- Always admin
  IF v_email = 'babaradumi@gmail.com' THEN
    v_is_admin := true;
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

  IF v_is_admin THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (new.id, 'admin')
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;

  RETURN new;
END;
$$;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Ensure babaradumi is whitelisted
INSERT INTO public.whitelist (email, tariff)
VALUES ('babaradumi@gmail.com', 'arhitect')
ON CONFLICT (email) DO UPDATE SET tariff = 'arhitect';

-- If babaradumi already has an account, promote to admin now
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::app_role FROM auth.users WHERE lower(email) = 'babaradumi@gmail.com'
ON CONFLICT (user_id, role) DO NOTHING;
