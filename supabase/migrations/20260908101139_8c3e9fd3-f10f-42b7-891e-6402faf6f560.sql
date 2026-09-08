ALTER TABLE public.flows ADD COLUMN open_modules integer;

UPDATE public.flows SET open_modules = 2 WHERE id = 'business-f2';