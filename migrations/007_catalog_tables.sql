-- 007: Catálogos servidos desde BD (fin de los UUIDs quemados en frontend)
-- Idempotente.

create table if not exists public.catalog_common_areas (
  id   uuid primary key default gen_random_uuid(),
  name text not null unique
);

create table if not exists public.catalog_amenities (
  id   uuid primary key default gen_random_uuid(),
  name text not null unique
);

insert into public.catalog_common_areas (name)
select v.name from (values ('Sala'), ('Cocina'), ('Baño compartido'), ('Terraza')) as v(name)
where not exists (select 1 from public.catalog_common_areas c where lower(c.name) = lower(v.name));

insert into public.catalog_amenities (name)
select v.name from (values ('Wi-Fi'), ('Lavadora'), ('Aire acondicionado'), ('Parqueadero'), ('Muebles incluidos')) as v(name)
where not exists (select 1 from public.catalog_amenities a where lower(a.name) = lower(v.name));

insert into public.cities (id, name)
select gen_random_uuid(), v.name
from (values ('Quito'), ('Guayaquil'), ('Cuenca')) as v(name)
where not exists (select 1 from public.cities c where lower(c.name) = lower(v.name));
