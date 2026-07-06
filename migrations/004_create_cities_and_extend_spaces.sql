


create table if not exists public.cities (
  id         uuid primary key default gen_random_uuid(),
  name       text not null unique,
  created_at timestamptz not null default now()
);


insert into public.cities (id, name)
select gen_random_uuid(), v.name
from (values ('Quito'), ('Guayaquil'), ('Cuenca')) as v(name)
where not exists (
  select 1 from public.cities c where lower(c.name) = lower(v.name)
);


alter table public.spaces
  add column if not exists city_id      uuid,
  add column if not exists neighborhood text,
  add column if not exists space_type   text,
  add column if not exists common_areas jsonb not null default '[]'::jsonb,
  add column if not exists amenities    jsonb not null default '[]'::jsonb;


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


create index if not exists idx_spaces_city_id on public.spaces (city_id);
