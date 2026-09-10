-- Modulul 1 START: Nișa și Ideea
INSERT INTO public.modules (id, course_id, order_index, title, subtitle, description, etapa, saptamana, created_at)
VALUES (
  'a111821a-e2ec-44ac-b9d0-208990a6f1c7',
  'start',
  1,
  'Nișa și Ideea',
  'Nișa se alege cu metodă, nu cu intuiție.',
  'Cel mai frecvent răspuns greșit la „ce business fac" e fie prea larg, fie prea pasional. Nișa se alege cu metodă, nu cu intuiție și nu cu pasiune.',
  'Modulul 1',
  'Săptămâna 1',
  now()
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  subtitle = EXCLUDED.subtitle,
  description = EXCLUDED.description,
  etapa = EXCLUDED.etapa,
  saptamana = EXCLUDED.saptamana;

-- Lecțiile video ale modulului 1 START
INSERT INTO public.lessons (id, module_id, order_index, title, description, video_url, pdf_url, duration_min, is_published, created_at) VALUES
('b111821a-e2ec-44ac-b9d0-208990a6f1c8', 'a111821a-e2ec-44ac-b9d0-208990a6f1c7', 1, 'O afacere începe cu o problemă, nu cu un produs', 'Ce cumpără de fapt omul: produs vs. rezultat, problemă vs. neplăcere. Cele trei costuri ale unei probleme — bani, timp, stres — și cum deosebești „nice to have" de „must solve". Livrabil: 10 probleme reale, nu 10 idei de business.', 'https://youtu.be/HHco-8PCDRs', null, 0, true, now()),
('c111821a-e2ec-44ac-b9d0-208990a6f1c9', 'a111821a-e2ec-44ac-b9d0-208990a6f1c7', 2, 'Cu ce avantaj pornești?', 'Experiență, acces la clienți și oameni din industrie, resurse reale și credibilitate — de ce doi oameni pot vedea aceeași problemă, dar pornesc din poziții diferite. Livrabil: harta avantajului de start și 2–3 direcții.', 'https://youtu.be/iXd5P35G8lI', null, 0, true, now()),
('d111821a-e2ec-44ac-b9d0-208990a6f1ca', 'a111821a-e2ec-44ac-b9d0-208990a6f1c7', 5, 'Ce este piața și cum o segmentezi corect', 'De ce „toți oamenii" nu e o piață. Cele patru lentile de segmentare — omul, situația, momentul, nivelul de așteptare — și regula cine + situație + problemă. Livrabil: 5–7 segmente concrete.', 'https://www.youtube.com/watch?v=sI6iHUA1RA0', null, 0, true, now()),
('e111821a-e2ec-44ac-b9d0-208990a6f1cb', 'a111821a-e2ec-44ac-b9d0-208990a6f1c7', 7, 'Problema reală și soluția pe care clientul o folosește acum', 'Simptomul vizibil vs. problema din spate. Concurentul real poate fi obiceiul, Excelul, WhatsApp-ul sau amânarea — de ce omul rămâne acolo ani întregi și unde e golul. Livrabil: harta problemei și a soluției actuale.', 'https://www.youtube.com/watch?v=RqXyuSPxxuE', null, 0, true, now()),
('f111821a-e2ec-44ac-b9d0-208990a6f1cc', 'a111821a-e2ec-44ac-b9d0-208990a6f1c7', 8, 'Uită-te înainte să alegi', 'Cele trei locuri unde observi piața: terenul, ce cumpără oamenii deja, ce spun în public. Semnalele care contează — repetiție, fricțiune, plată, compromis — și separarea faptului de interpretare. Livrabil: fișa de observație.', 'https://www.youtube.com/watch?v=YsJsLL0Q4fg', null, 0, true, now()),
('0111821a-e2ec-44ac-b9d0-208990a6f1cd', 'a111821a-e2ec-44ac-b9d0-208990a6f1c7', 10, 'Cum îți alegi nișa', 'Nișa formulată ca om + situație + problemă. Cele două porți de trecere — dovada problemei și accesul la client — și cele trei criterii de ordonare: golul soluției actuale, avantajul de start, spațiul de creștere. Livrabil: matricea de selecție și nișa aleasă.', 'https://www.youtube.com/watch?v=2N006ukkKNc', null, 0, true, now())
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  video_url = EXCLUDED.video_url,
  duration_min = EXCLUDED.duration_min,
  is_published = EXCLUDED.is_published,
  order_index = EXCLUDED.order_index;