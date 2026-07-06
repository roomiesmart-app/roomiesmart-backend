-- =====================================================================
-- 004: Tabla de ciudades + nuevas columnas en spaces
-- Ejecutar en el SQL Editor de Supabase.
-- Es idempotente: se puede correr varias veces sin romper nada.
-- =====================================================================

-- 1. Tabla de ciudades (si no existe)
create table if not exists public.cities (
  id         uuid primary key default gen_random_uuid(),
  name       text not null unique,
  created_at timestamptz not null default now()
);

-- Seed por NOMBRE (no por UUID fijo): la tabla cities ya existía en la BD
-- con sus propios ids (ej. Quito = edd2c2ec-d569-4572-84d5-45911d1b0939).
-- Solo inserta las ciudades que falten, sin duplicar.
insert into public.cities (id, name)
select gen_random_uuid(), v.name
from (values ('Quito'), ('Guayaquil'), ('Cuenca')) as v(name)
where not exists (
  select 1 from public.cities c where lower(c.name) = lower(v.name)
);

-- NOTA: el frontend hardcodea los UUIDs en PublishDepartmentPage.tsx
-- (cityOptions). Si cambias filas de cities, actualiza esa lista, o
-- mejor: expón un GET /api/v1/roomies/cities y elimina el hardcodeo.

-- 2. Nuevas columnas en spaces
alter table public.spaces
  add column if not exists city_id      uuid,
  add column if not exists neighborhood text,
  add column if not exists space_type   text,
  add column if not exists common_areas jsonb not null default '[]'::jsonb,
  add column if not exists amenities    jsonb not null default '[]'::jsonb;

-- 3. Llave foránea city_id -> cities(id) (solo si aún no existe)
do $$
begin
  if not exists (
    select 1
    from information_schema.table_constraints
    where table_schema = 'public'
      and table_name = 'spaces'
      and constraint_name = 'spaces_city_id_fkey'
  ) then
    alter table public.spaces
      add constraint spaces_city_id_fkey
      foreign key (city_id) references public.cities(id);
  end if;
end $$;

-- 4. Índice para filtrar por ciudad en el dashboard de exploración
create index if not exists idx_spaces_city_id on public.spaces (city_id);
