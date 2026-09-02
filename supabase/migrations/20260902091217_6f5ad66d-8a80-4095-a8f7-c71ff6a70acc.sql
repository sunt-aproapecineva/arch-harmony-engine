-- Seed START Module 0 (Etapa 0) so the live content overlay never hides
-- the permanently-published base lessons. This migration is idempotent:
-- re-running it leaves existing rows unchanged.

INSERT INTO public.modules (
  id, course_id, title, subtitle, description, order_index, etapa, saptamana
) VALUES (
  'e111821a-e2ec-44ac-b9d0-208990a6f1c6',
  'start',
  'Ce Construiești de Fapt',
  'Claritate înainte de orice construcție.',
  'Înainte să vorbim despre nișă, validare sau vânzări, trebuie să existe claritate despre ce construim și de ce ordinea pașilor contează mai mult decât energia cu care pornești.',
  0,
  'Etapa 0',
  'Săptămâna 0'
)
ON CONFLICT (id) DO UPDATE SET
  course_id = EXCLUDED.course_id,
  title = EXCLUDED.title,
  subtitle = EXCLUDED.subtitle,
  description = EXCLUDED.description,
  order_index = EXCLUDED.order_index,
  etapa = EXCLUDED.etapa,
  saptamana = EXCLUDED.saptamana;

INSERT INTO public.lessons (
  id, module_id, order_index, title, description, video_url, pdf_url, duration_min, is_published
) VALUES
  (
    '1c7a92c8-a0b3-418b-b8ed-1759a168f367',
    'e111821a-e2ec-44ac-b9d0-208990a6f1c6',
    0,
    'Bun venit. Hai să începem.',
    'Mesaj de bun venit în practicum: ce construiești în următoarele săptămâni, cum să folosești platforma și cum să lucrezi direct pe ideea ta de afacere.',
    'https://www.youtube.com/watch?v=xVn5iZF8o_Q',
    NULL,
    0,
    true
  ),
  (
    'c7e3d76e-270c-43ac-9259-6fc02460adde',
    'e111821a-e2ec-44ac-b9d0-208990a6f1c6',
    1,
    'Business vs. Freelancing vs. Job cu Firmă Proprie',
    'Cele trei forme de activitate independentă și de ce diferența nu e juridică, ci structurală. Un freelancer vinde timp. Un antreprenor construiește un sistem.',
    'https://www.youtube.com/watch?v=qtkp9N5_20A',
    NULL,
    0,
    true
  ),
  (
    '54647238-2cbf-40fd-b6bf-66923992ab76',
    'e111821a-e2ec-44ac-b9d0-208990a6f1c6',
    2,
    'De Ce Eșuează 80% din Afacerile Noi',
    'Cei 3 factori comuni ai eșecului din consultațiile reale: pornesc fără validare, construiesc fără sistem, vând fără strategie.',
    'https://www.youtube.com/watch?v=R-0_W7DEYpQ',
    NULL,
    0,
    true
  ),
  (
    'cb72e0e2-05c9-4f44-8e13-37f13a86de7a',
    'e111821a-e2ec-44ac-b9d0-208990a6f1c6',
    3,
    'Erorile de Mentalitate Care Omoară Afacerile Înainte să Înceapă',
    'Pasiunea ca criteriu de nișă, energia ca substitut al sistemului, capcana pregătirii infinite. Construiești pentru supraviețuire sau pentru scalare?',
    'https://www.youtube.com/watch?v=07xM9FbSojc',
    NULL,
    0,
    true
  ),
  (
    '76f8a942-6d94-435b-9350-e28d22a8da53',
    'e111821a-e2ec-44ac-b9d0-208990a6f1c6',
    4,
    'Primul Filtru: Merită Să Continui?',
    'Cum testezi o idee înainte să investești timp și bani. Diferența dintre o idee interesantă și una cu șanse reale de a deveni afacere.',
    'https://www.youtube.com/watch?v=3FLJ_3gP8RY',
    NULL,
    0,
    true
  )
ON CONFLICT (id) DO UPDATE SET
  module_id = EXCLUDED.module_id,
  order_index = EXCLUDED.order_index,
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  video_url = EXCLUDED.video_url,
  pdf_url = EXCLUDED.pdf_url,
  duration_min = EXCLUDED.duration_min,
  is_published = EXCLUDED.is_published;