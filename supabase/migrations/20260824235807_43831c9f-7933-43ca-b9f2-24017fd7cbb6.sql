CREATE OR REPLACE FUNCTION public.max_tariff(a text, b text)
RETURNS text
LANGUAGE sql
IMMUTABLE
SET search_path = public
AS $$
  SELECT CASE
    WHEN 'arhitect' IN (a, b) THEN 'arhitect'
    WHEN 'designer' IN (a, b) THEN 'designer'
    ELSE COALESCE(a, b, 'student')
  END
$$;