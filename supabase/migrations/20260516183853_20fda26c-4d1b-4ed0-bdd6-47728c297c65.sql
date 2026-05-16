
-- Revoke anon EXECUTE on SECURITY DEFINER helpers that should never be probed publicly
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM anon;
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated;

REVOKE EXECUTE ON FUNCTION public.prevent_tariff_self_escalation() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.touch_updated_at() FROM PUBLIC, anon, authenticated;

-- is_email_whitelisted intentionally remains callable by anon (used during signup pre-check)

-- Server-enforce user_email/user_name on activity_log so clients cannot forge them
CREATE OR REPLACE FUNCTION public.activity_log_set_identity()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_email text;
  v_name text;
BEGIN
  SELECT email, full_name INTO v_email, v_name
    FROM public.profiles WHERE id = NEW.user_id;
  NEW.user_email := v_email;
  NEW.user_name := v_name;
  RETURN NEW;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.activity_log_set_identity() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS activity_log_set_identity_trg ON public.activity_log;
CREATE TRIGGER activity_log_set_identity_trg
  BEFORE INSERT OR UPDATE ON public.activity_log
  FOR EACH ROW EXECUTE FUNCTION public.activity_log_set_identity();
