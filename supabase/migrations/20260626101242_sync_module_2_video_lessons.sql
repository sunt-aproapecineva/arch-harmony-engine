-- Keep DB-managed lesson overrides in sync with the static curriculum so
-- LiveContent overlay cannot hide real videos with old/empty database rows.
WITH mod2 AS (
  SELECT id FROM public.modules WHERE order_index = 2 LIMIT 1
), updated_1 AS (
  UPDATE public.lessons
     SET title = 'Produsul final al fiecărei funcții.',
         description = 'De ce desenezi VIITORUL, nu prezentul. Organigrama actuală vs organigrama la 3 ani.',
         video_url = 'https://youtu.be/9ZOKyML5_pk',
         duration_min = 60,
         order_index = 1,
         is_published = true
   WHERE module_id = (SELECT id FROM mod2)
     AND title = 'Produsul final al fiecărei funcții.'
), updated_2 AS (
  UPDATE public.lessons
     SET title = 'Organigrama',
         description = 'De la 5 la 500 de angajați, aceleași 7 funcții există. Cum le identifici și cum le acoperi în stadiul tău actual.',
         video_url = 'https://youtu.be/qSiLBz9nwIU',
         duration_min = 46,
         order_index = 2,
         is_published = true
   WHERE module_id = (SELECT id FROM mod2)
     AND title = 'Organigrama'
), existing_matrix AS (
  SELECT id FROM public.lessons
   WHERE module_id = (SELECT id FROM mod2)
     AND title = 'Matricea decizională'
   LIMIT 1
), updated_matrix AS (
  UPDATE public.lessons
     SET description = 'Continuarea lecției despre cele 7 funcții obligatorii: aplicare practică și exemple.',
         video_url = 'https://youtu.be/UYzWC4ciDeM',
         duration_min = 25,
         order_index = 3,
         is_published = true
   WHERE id IN (SELECT id FROM existing_matrix)
)
INSERT INTO public.lessons (module_id, title, description, video_url, duration_min, order_index, is_published)
SELECT (SELECT id FROM mod2),
       'Matricea decizională',
       'Continuarea lecției despre cele 7 funcții obligatorii: aplicare practică și exemple.',
       'https://youtu.be/UYzWC4ciDeM',
       25,
       3,
       true
WHERE EXISTS (SELECT 1 FROM mod2)
  AND NOT EXISTS (SELECT 1 FROM existing_matrix);
