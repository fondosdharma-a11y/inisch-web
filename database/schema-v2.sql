-- ============================================================
-- INISCH CAMPUS · Esquema v2 (AMPLIACION)
-- ============================================================
-- Ejecuta este archivo DESPUES de schema.sql, en:
--   Supabase -> SQL Editor -> New query -> pegar todo -> Run
--
-- Es aditivo: no borra nada de lo que ya existe.
-- Agrega las tablas de las herramientas del campus:
--   · mi_pelicula      -> el registro del "desde donde" (figuras y personajes)
--   · bitacora         -> el diario del "darte cuenta"
--   · notas_leccion    -> apuntes por leccion
--   · practicas        -> registro de practica de Atencion Fina y meditacion
-- ============================================================

-- ------------------------------------------------------------
-- 1. MI PELICULA · el trabajo de interiorizacion del alumno
--    tipo: 'paterna' | 'materna' | 'otra_figura' | 'personaje'
-- ------------------------------------------------------------
create table if not exists mi_pelicula (
  id uuid primary key default gen_random_uuid(),
  student_id uuid references profiles(id) on delete cascade,
  tipo text not null check (tipo in ('paterna','materna','otra_figura','personaje')),
  etiqueta text,                 -- ej. "Mi abuela Carmen", "El mejor amigo de la primaria"
  respuestas jsonb default '{}', -- { "pregunta_id": "respuesta", ... }
  personaje_hoy text,            -- para tipo 'personaje': quien ocupa hoy ese lugar
  notas text,
  updated_at timestamptz default now(),
  created_at timestamptz default now()
);

-- ------------------------------------------------------------
-- 2. BITACORA · el diario del "darte cuenta"
-- ------------------------------------------------------------
create table if not exists bitacora (
  id uuid primary key default gen_random_uuid(),
  student_id uuid references profiles(id) on delete cascade,
  fecha date default current_date,
  situacion text,        -- que paso
  emocion text,          -- que senti
  patron text,           -- control / expectativa / apego / juicio / otro
  desde_donde text,      -- de donde viene esto
  comprension text,      -- que comprendi
  created_at timestamptz default now()
);

-- ------------------------------------------------------------
-- 3. NOTAS POR LECCION
-- ------------------------------------------------------------
create table if not exists notas_leccion (
  id uuid primary key default gen_random_uuid(),
  student_id uuid references profiles(id) on delete cascade,
  lesson_id uuid references lessons(id) on delete cascade,
  contenido text,
  updated_at timestamptz default now(),
  unique (student_id, lesson_id)
);

-- ------------------------------------------------------------
-- 4. PRACTICAS · Atencion Fina, meditacion, silencio
-- ------------------------------------------------------------
create table if not exists practicas (
  id uuid primary key default gen_random_uuid(),
  student_id uuid references profiles(id) on delete cascade,
  tipo text not null check (tipo in ('atencion_fina','meditacion','silencio','perdon')),
  minutos int,
  sentido text,      -- para atencion fina: vista / tacto / olfato / gusto / oido
  observacion text,
  fecha date default current_date,
  created_at timestamptz default now()
);

-- ============================================================
-- SEGURIDAD (RLS): cada alumno ve y edita SOLO lo suyo
-- ============================================================
alter table mi_pelicula    enable row level security;
alter table bitacora       enable row level security;
alter table notas_leccion  enable row level security;
alter table practicas      enable row level security;

do $$
begin
  -- mi_pelicula
  if not exists (select 1 from pg_policies where tablename='mi_pelicula' and policyname='pelicula_all_own') then
    create policy "pelicula_all_own" on mi_pelicula
      for all using (auth.uid() = student_id) with check (auth.uid() = student_id);
  end if;
  -- bitacora
  if not exists (select 1 from pg_policies where tablename='bitacora' and policyname='bitacora_all_own') then
    create policy "bitacora_all_own" on bitacora
      for all using (auth.uid() = student_id) with check (auth.uid() = student_id);
  end if;
  -- notas_leccion
  if not exists (select 1 from pg_policies where tablename='notas_leccion' and policyname='notas_all_own') then
    create policy "notas_all_own" on notas_leccion
      for all using (auth.uid() = student_id) with check (auth.uid() = student_id);
  end if;
  -- practicas
  if not exists (select 1 from pg_policies where tablename='practicas' and policyname='practicas_all_own') then
    create policy "practicas_all_own" on practicas
      for all using (auth.uid() = student_id) with check (auth.uid() = student_id);
  end if;
end $$;

-- ------------------------------------------------------------
-- 5. Faltaban politicas de UPDATE/DELETE en tablas de v1
-- ------------------------------------------------------------
do $$
begin
  if not exists (select 1 from pg_policies where tablename='progress' and policyname='progress_delete_own') then
    create policy "progress_delete_own" on progress for delete using (auth.uid() = student_id);
  end if;
end $$;

-- ------------------------------------------------------------
-- 6. Campos extra de perfil
-- ------------------------------------------------------------
alter table profiles add column if not exists ciudad text;
alter table profiles add column if not exists fecha_nacimiento date;
alter table profiles add column if not exists avatar_url text;
alter table profiles add column if not exists nombre_certificado text;

-- ------------------------------------------------------------
-- 7. updated_at automatico
-- ------------------------------------------------------------
create or replace function public.touch_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists t_pelicula_touch on mi_pelicula;
create trigger t_pelicula_touch before update on mi_pelicula
  for each row execute procedure public.touch_updated_at();

drop trigger if exists t_notas_touch on notas_leccion;
create trigger t_notas_touch before update on notas_leccion
  for each row execute procedure public.touch_updated_at();

-- ------------------------------------------------------------
-- 8. Contenido de las lecciones de Etapa 1 (descripciones)
-- ------------------------------------------------------------
update lessons set content = 'Que es el Sistema Codigo Holografico, de donde surge y como se va a trabajar. La premisa de partida: nadie puede guiar a otro a donde no ha llegado primero.'
  where order_index = 1 and content is null;
update lessons set content = 'El paso de sentirse victima de las circunstancias a asumir el rol de observador consciente. El entorno exterior como reflejo del mundo interno.'
  where order_index = 2 and content is null;
update lessons set content = 'Como se formo tu pelicula entre los 2 y los 10 anos. El proyector interno y la deteccion de patrones.'
  where order_index = 3 and content is null;
update lessons set content = 'Control, expectativas y apego: las tres raices del sufrimiento cotidiano y como empezar a soltarlas.'
  where order_index = 4 and content is null;
update lessons set content = 'El autentico perdon como comprension y compasion, no como olvido ni justificacion. La dinamica completa.'
  where order_index = 5 and content is null;
update lessons set content = 'Comprension, Compasion y Bondad como los tres componentes del Amor Real, y como modifican la pelicula.'
  where order_index = 6 and content is null;
