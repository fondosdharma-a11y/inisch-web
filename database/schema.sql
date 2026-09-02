-- ============================================================
-- INISCH CAMPUS — Esquema de base de datos para Supabase
-- ============================================================
-- Como usarlo:
-- 1. Crea un proyecto gratuito en https://supabase.com
-- 2. Ve a SQL Editor -> New query
-- 3. Pega TODO este archivo y dale Run
-- 4. Ve a Project Settings -> API y copia "Project URL" y "anon public key"
-- 5. Pegalas en /docs/campus/js/supabase-config.js
-- ============================================================

-- 1. Perfiles de alumnos (extiende la tabla auth.users que ya crea Supabase)
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  whatsapp text,
  created_at timestamptz default now()
);

-- 2. Cursos (uno por Etapa, ampliable)
create table if not exists courses (
  id uuid primary key default gen_random_uuid(),
  etapa smallint not null check (etapa in (1,2,3)),
  title text not null,
  description text,
  order_index int default 0,
  created_at timestamptz default now()
);

-- 3. Lecciones dentro de un curso
create table if not exists lessons (
  id uuid primary key default gen_random_uuid(),
  course_id uuid references courses(id) on delete cascade,
  title text not null,
  video_url text,
  content text,
  order_index int default 0,
  unlocks_after_lesson_id uuid references lessons(id),
  created_at timestamptz default now()
);

-- 4. Inscripciones (relaciona alumno <-> etapa <-> Stripe)
create table if not exists enrollments (
  id uuid primary key default gen_random_uuid(),
  student_id uuid references profiles(id) on delete cascade,
  etapa smallint not null check (etapa in (1,2,3)),
  status text not null default 'pending' check (status in ('pending','active','cancelled','completed')),
  stripe_customer_id text,
  stripe_subscription_id text,
  started_at timestamptz,
  created_at timestamptz default now(),
  unique (student_id, etapa)
);

-- 5. Progreso por leccion completada
create table if not exists progress (
  id uuid primary key default gen_random_uuid(),
  student_id uuid references profiles(id) on delete cascade,
  lesson_id uuid references lessons(id) on delete cascade,
  completed_at timestamptz default now(),
  unique (student_id, lesson_id)
);

-- 6. Certificados emitidos
create table if not exists certificates (
  id uuid primary key default gen_random_uuid(),
  student_id uuid references profiles(id) on delete cascade,
  etapa smallint not null,
  folio text unique not null,
  pdf_url text,
  issued_at timestamptz default now()
);

-- ============================================================
-- ROW LEVEL SECURITY: cada alumno solo ve y edita sus propios datos
-- ============================================================
alter table profiles enable row level security;
alter table enrollments enable row level security;
alter table progress enable row level security;
alter table certificates enable row level security;
alter table courses enable row level security;
alter table lessons enable row level security;

create policy "profiles_select_own" on profiles for select using (auth.uid() = id);
create policy "profiles_update_own" on profiles for update using (auth.uid() = id);
create policy "profiles_insert_own" on profiles for insert with check (auth.uid() = id);

create policy "courses_select_authenticated" on courses for select using (auth.role() = 'authenticated');
create policy "lessons_select_authenticated" on lessons for select using (auth.role() = 'authenticated');

create policy "enrollments_select_own" on enrollments for select using (auth.uid() = student_id);

create policy "progress_select_own" on progress for select using (auth.uid() = student_id);
create policy "progress_insert_own" on progress for insert with check (auth.uid() = student_id);

create policy "certificates_select_own" on certificates for select using (auth.uid() = student_id);

-- ============================================================
-- TRIGGER: crea el perfil automaticamente cuando alguien se registra
-- ============================================================
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================================
-- DATOS INICIALES: Etapa 1 como piloto, con sus 7 objetivos como "lecciones" de ejemplo
-- Reemplaza video_url por tus videos reales de YouTube/Vimeo (no listados) cuando los tengas
-- ============================================================
insert into courses (etapa, title, description, order_index)
values (1, 'Etapa 1: Iniciacion - El Despertar', 'Guia de Interiorizacion Personal del Sistema Codigo Holografico', 1)
on conflict do nothing;

insert into lessons (course_id, title, video_url, order_index)
select id, 'Bienvenida y presentacion del Sistema Codigo Holografico', null, 1 from courses where etapa = 1
on conflict do nothing;

insert into lessons (course_id, title, video_url, order_index)
select id, 'El observador consciente: dejar de ser victima de las circunstancias', null, 2 from courses where etapa = 1
on conflict do nothing;

insert into lessons (course_id, title, video_url, order_index)
select id, 'Identificar patrones de pensamiento, emocion y comportamiento', null, 3 from courses where etapa = 1
on conflict do nothing;

insert into lessons (course_id, title, video_url, order_index)
select id, 'Autonomia emocional: expectativas, apegos y codependencia', null, 4 from courses where etapa = 1
on conflict do nothing;

insert into lessons (course_id, title, video_url, order_index)
select id, 'El perdon como proceso de transformacion', null, 5 from courses where etapa = 1
on conflict do nothing;

insert into lessons (course_id, title, video_url, order_index)
select id, 'El Amor Real: comprension, compasion y bondad', null, 6 from courses where etapa = 1
on conflict do nothing;
