
-- ============ ROLES ============
create type public.app_role as enum ('student', 'admin');

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  role app_role not null,
  created_at timestamptz default now(),
  unique (user_id, role)
);
alter table public.user_roles enable row level security;

create or replace function public.has_role(_user_id uuid, _role app_role)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role = _role)
$$;

create policy "users read own roles" on public.user_roles
  for select to authenticated using (user_id = auth.uid() or public.has_role(auth.uid(), 'admin'));
create policy "admin manage roles" on public.user_roles
  for all to authenticated using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));

-- ============ WHITELIST ============
create table public.whitelist (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  added_at timestamptz default now(),
  added_by uuid references auth.users(id)
);
alter table public.whitelist enable row level security;
create policy "anyone authenticated reads whitelist" on public.whitelist
  for select to authenticated using (true);
-- Allow anonymous to check email during registration
create policy "anyone reads whitelist for register" on public.whitelist
  for select to anon using (true);
create policy "admin writes whitelist" on public.whitelist
  for all to authenticated using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));

-- ============ PROFILES ============
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique not null,
  full_name text,
  avatar_url text,
  created_at timestamptz default now()
);
alter table public.profiles enable row level security;
create policy "users read own profile" on public.profiles
  for select to authenticated using (id = auth.uid() or public.has_role(auth.uid(), 'admin'));
create policy "users update own profile" on public.profiles
  for update to authenticated using (id = auth.uid()) with check (id = auth.uid());
create policy "admin reads all profiles" on public.profiles
  for select to authenticated using (public.has_role(auth.uid(), 'admin'));
create policy "users insert own profile" on public.profiles
  for insert to authenticated with check (id = auth.uid());

-- Auto-create profile + default student role on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'full_name', new.email))
  on conflict (id) do nothing;
  insert into public.user_roles (user_id, role) values (new.id, 'student')
  on conflict (user_id, role) do nothing;
  return new;
end;
$$;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============ MODULES ============
create table public.modules (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  subtitle text,
  description text,
  order_index int not null,
  etapa text,
  saptamana text,
  created_at timestamptz default now()
);
alter table public.modules enable row level security;
create policy "authenticated reads modules" on public.modules
  for select to authenticated using (true);
create policy "admin manages modules" on public.modules
  for all to authenticated using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));

-- ============ LESSONS ============
create table public.lessons (
  id uuid primary key default gen_random_uuid(),
  module_id uuid references public.modules(id) on delete cascade,
  title text not null,
  description text,
  video_url text,
  pdf_url text,
  duration_min int,
  order_index int not null,
  is_published boolean default true,
  created_at timestamptz default now()
);
alter table public.lessons enable row level security;
create policy "authenticated reads lessons" on public.lessons
  for select to authenticated using (true);
create policy "admin manages lessons" on public.lessons
  for all to authenticated using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));

-- ============ EXERCISES ============
create table public.exercises (
  id uuid primary key default gen_random_uuid(),
  lesson_id uuid references public.lessons(id) on delete cascade,
  module_id uuid references public.modules(id) on delete cascade,
  title text not null,
  description text,
  order_index int not null
);
alter table public.exercises enable row level security;
create policy "authenticated reads exercises" on public.exercises
  for select to authenticated using (true);
create policy "admin manages exercises" on public.exercises
  for all to authenticated using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));

-- ============ PROGRESS ============
create table public.progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  lesson_id uuid references public.lessons(id) on delete cascade not null,
  completed_at timestamptz default now(),
  unique(user_id, lesson_id)
);
alter table public.progress enable row level security;
create policy "users read own progress" on public.progress
  for select to authenticated using (user_id = auth.uid() or public.has_role(auth.uid(), 'admin'));
create policy "users write own progress" on public.progress
  for insert to authenticated with check (user_id = auth.uid());
create policy "users delete own progress" on public.progress
  for delete to authenticated using (user_id = auth.uid());

-- ============ SEED CURRICULUM ============
do $$
declare m0 uuid; m1 uuid; m2 uuid; m3 uuid; m4 uuid; m5 uuid; m6 uuid;
begin
insert into public.modules (title, subtitle, description, order_index, etapa, saptamana) values
('Proiectul Casei: Diagnostică & Plan', 'Înainte să sapi fundația, desenezi proiectul.', 'Diagnostic complet al afacerii tale + plan personalizat pe 8 săptămâni.', 0, 'Etapa 0', 'Săptămâna 0')
returning id into m0;
insert into public.modules (title, subtitle, description, order_index, etapa, saptamana) values
('Fundația: Claritate & Poziționare', 'Dacă fundația e strâmbă, toată casa e strâmbă.', 'Rol, misiune, viziune, valori, identitate.', 1, 'Etapa 1', 'Săptămâna 1')
returning id into m1;
insert into public.modules (title, subtitle, description, order_index, etapa, saptamana) values
('Pereții Portanți: Structură Organizațională', 'Pereții portanți împart casa în camere și o țin în picioare la cutremur.', 'Organigramă, funcții, fișe de rol.', 2, 'Etapa 2', 'Săptămâna 2')
returning id into m2;
insert into public.modules (title, subtitle, description, order_index, etapa, saptamana) values
('Instalațiile: Procese Operaționale', 'Fără țevi, fără curent — nu poți locui în casă.', 'Procese, standardizare, instrucțiuni.', 3, 'Etapa 3', 'Săptămânile 3–4')
returning id into m3;
insert into public.modules (title, subtitle, description, order_index, etapa, saptamana) values
('Contoarele: Control & KPI', 'Fără contoare nu conduci — ghicești.', 'Produs finit, indicatori, tablou de bord.', 4, 'Etapa 4', 'Săptămâna 5')
returning id into m4;
insert into public.modules (title, subtitle, description, order_index, etapa, saptamana) values
('Predarea Cheilor: Delegare Reală', 'Constructorul nu locuiește în casa pe care a construit-o.', 'Delegare de rezultate, retragere din operațional.', 5, 'Etapa 5', 'Săptămânile 6–7')
returning id into m5;
insert into public.modules (title, subtitle, description, order_index, etapa, saptamana) values
('Recepția Finală: Management & Scalare', 'La recepție verifici că totul funcționează și semnezi.', 'Nivelul de management, owner de sistem.', 6, 'Etapa 6', 'Săptămâna 8')
returning id into m6;

-- MODULE 0 lessons
insert into public.lessons (module_id, title, description, duration_min, order_index) values
(m0, 'Bun venit. Hai să începem.', 'Video introductiv — ce vei construi în 8 săptămâni.', 20, 0),
(m0, 'Unde ești și de ce ești blocat acolo', '24 slide-uri despre cele 7 trepte ale evoluției unei afaceri.', 18, 1);
insert into public.exercises (module_id, title, description, order_index) values
(m0, 'Chestionarul de Diagnostic', '50 de întrebări despre afacerea ta reală. Timp estimat: 45–60 min.', 0),
(m0, 'Auditul de Timp (5 zile)', 'Notezi tot ce faci în blocuri de 30 min. Marchezi: 5€/oră, 50€/oră, 100€/oră.', 1),
(m0, 'Harta Gâturilor de Sticlă', 'Listezi deciziile care au trecut prin tine săptămâna trecută.', 2);

-- MODULE 1
insert into public.lessons (module_id, title, duration_min, order_index) values
(m1, 'Rolul tău rescris — ce faci TU și ce nu mai faci TU', 10, 0),
(m1, 'Misiunea care chiar conduce o firmă, nu cea pentru flyere', 12, 1),
(m1, 'Viziunea cu cifre — cum o scrii și cum o folosești săptămânal', 11, 2),
(m1, 'Valorile ca reguli de comportament, nu ca slogane', 9, 3),
(m1, 'Identitatea companiei — de ce contează pentru recrutare, vânzări și brand', 13, 4);
insert into public.exercises (module_id, title, description, order_index) values
(m1, 'Lista Rolului Tău', 'Coloana A: ce faci TU acum (min 15). Coloana B: ce nu mai faci TU (min 15). Pentru fiecare item din B: cui predai și până când.', 0),
(m1, 'Manifestul Fundației', 'Misiunea, Viziunea cu cifre, Valorile, Rolul tău rescris — pe 1 pagină.', 1);

-- MODULE 2
insert into public.lessons (module_id, title, duration_min, order_index) values
(m2, 'Cum se desenează o organigramă reală — desenezi VIITORUL, nu prezentul', 14, 0),
(m2, 'Cele 7 funcții obligatorii ale oricărei companii', 12, 1),
(m2, 'Fișa de rol funcțională — de ce fără indicatori e o foaie albă', 10, 2);
insert into public.exercises (module_id, title, description, order_index) values
(m2, 'Organigrama Actuală', 'Cu nume reale, toate rolurile pe care le porți TU evidențiate.', 0),
(m2, 'Organigrama Finală la 3 ani', 'Cum trebuie să arate când ajungi la viziune.', 1),
(m2, 'Fișele de Rol pentru 3 Poziții Pilot', 'Scop, responsabilități, indicatori, decizii autonome.', 2);

-- MODULE 3
insert into public.lessons (module_id, title, duration_min, order_index) values
(m3, 'Cum identifici cele 5–7 procese care chiar contează', 10, 0),
(m3, 'Cum scrii un proces exact așa cum SE FACE — nu cum ar trebui', 18, 1),
(m3, 'Standardizarea deciziilor — cum scoți butonul tău de OK din mijlocul firmei', 14, 2),
(m3, 'Instrucțiunea pas cu pas care nu lasă loc de interpretare', 12, 3);
insert into public.exercises (module_id, title, description, order_index) values
(m3, 'Inventarul Proceselor', 'Listezi 20–40, le scorezi pe impact + frecvență, alegi top 5–7.', 0),
(m3, 'Cartografierea unui Proces Real', 'Pași reali, cine face ce, unde apar întârzierile.', 1),
(m3, 'Documentezi 2 Procese Pas cu Pas', 'Metodă: filmezi cu telefonul, transcrii.', 2),
(m3, 'Matricea Decizională pentru Procese', 'Cine decide singur, când escaladează.', 3),
(m3, 'Testul Instrucțiunii', 'Dai instrucțiunea unui coleg care NU lucrează în acel rol.', 4);

-- MODULE 4
insert into public.lessons (module_id, title, duration_min, order_index) values
(m4, 'Produsul finit al fiecărui rol — cum îl identifici și de ce contează', 12, 0),
(m4, 'De ce indicatorii complicați nu se folosesc — și cei simpli, da', 10, 1),
(m4, 'Sistemul de raportare în 3 întrebări', 11, 2);
insert into public.exercises (module_id, title, description, order_index) values
(m4, 'Produsul Finit al Fiecărui Rol', 'Ce livrează concret fiecare din cele 5 roluri cheie.', 0),
(m4, 'Cei 3–5 Indicatori per Rol', 'Testul: e cifră? e verificabilă? omul are control?', 1),
(m4, 'Tabloul de Bord în Excel', 'Max 10 cifre, citit în 5 min luni dimineața.', 2),
(m4, 'Testul de Absență de 2 Zile', 'Pleci 2 zile fără să suni pe nimeni.', 3);

-- MODULE 5
insert into public.lessons (module_id, title, duration_min, order_index) values
(m5, 'Diferența dintre a delega o sarcină și a delega un rezultat', 16, 0),
(m5, 'Greșelile controlate — dacă echipa nu greșește niciodată, nu ai delegat', 14, 1),
(m5, 'Ieșirea treptată din operațional — planul pe 30 de zile', 15, 2),
(m5, 'Studiu de caz: cum am ieșit eu din operațional', 20, 3);
insert into public.exercises (module_id, title, description, order_index) values
(m5, 'Lista de Eliberare', '20 de lucruri pe care le faci tu și altcineva le-ar putea face.', 0),
(m5, 'Acordul de Responsabilitate', 'Rezultat, autoritate, ritm de raportare — semnat fizic.', 1),
(m5, 'Zona Greșelii Admise', 'Ce greșeli sunt acceptabile, ce sunt linii roșii.', 2),
(m5, 'Planul de Retragere pe 30 de Zile', '4 săptămâni cu implicare descrescând.', 3),
(m5, 'Analiza Primei Greșeli', 'Când apare, repari sistemul, nu omul.', 4);

-- MODULE 6
insert into public.lessons (module_id, title, duration_min, order_index) values
(m6, 'Nivelul de management — când îl introduci și cum recunoști momentul', 13, 0),
(m6, 'Owner de sistem — ce faci tu de luni încolo', 12, 1),
(m6, 'Optimizarea continuă — revizuirea trimestrială', 10, 2),
(m6, 'Măsurarea succesului — testul de absență de 2 săptămâni', 14, 3);
insert into public.exercises (module_id, title, description, order_index) values
(m6, 'Fișa Noului Tău Rol', 'Max 5 zone de responsabilitate de acum încolo.', 0),
(m6, 'Calendarul Săptămânii Tale de Proprietar', 'Cum arată o săptămână normală.', 1),
(m6, 'Calendarul Trimestrial de Revizuire', 'Date fixe pentru revizuirea proceselor.', 2),
(m6, 'Planificarea Vacanței-Test', '1–2 săptămâni în următoarele 60 de zile.', 3);

-- Whitelist seed admin email
insert into public.whitelist (email) values ('babaradumi@gmail.com') on conflict do nothing;
end $$;
