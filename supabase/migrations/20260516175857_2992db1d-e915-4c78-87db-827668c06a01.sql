
-- 1. Whitelist: drop overly permissive SELECT policies
DROP POLICY IF EXISTS "anyone reads whitelist for register" ON public.whitelist;
DROP POLICY IF EXISTS "anyone authenticated reads whitelist" ON public.whitelist;
DROP POLICY IF EXISTS "authenticated reads whitelist" ON public.whitelist;
DROP POLICY IF EXISTS "public reads whitelist" ON public.whitelist;

-- Only admins can SELECT whitelist directly
CREATE POLICY "admins read whitelist"
  ON public.whitelist
  FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));

-- 2. Safe RPC for registration eligibility (no email enumeration)
CREATE OR REPLACE FUNCTION public.is_email_whitelisted(_email text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.whitelist WHERE lower(email) = lower(_email)
  ) OR lower(_email) = 'babaradumi@gmail.com';
$$;

REVOKE ALL ON FUNCTION public.is_email_whitelisted(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_email_whitelisted(text) TO anon, authenticated;

-- 3. Prevent privilege escalation via profile tariff self-update
CREATE OR REPLACE FUNCTION public.prevent_tariff_self_escalation()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.tariff IS DISTINCT FROM OLD.tariff
     AND NOT public.has_role(auth.uid(), 'admin'::app_role) THEN
    NEW.tariff := OLD.tariff;
  END IF;
  -- Also lock down email & id changes by non-admins
  IF NEW.id IS DISTINCT FROM OLD.id THEN
    NEW.id := OLD.id;
  END IF;
  IF NEW.email IS DISTINCT FROM OLD.email
     AND NOT public.has_role(auth.uid(), 'admin'::app_role) THEN
    NEW.email := OLD.email;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS profiles_prevent_tariff_escalation ON public.profiles;
CREATE TRIGGER profiles_prevent_tariff_escalation
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.prevent_tariff_self_escalation();
