
create table if not exists public.space_requests (
  id           uuid primary key default gen_random_uuid(),
  space_id     uuid not null references public.spaces(id) on delete cascade,
  requester_id uuid not null references public.users(id) on delete cascade,
  message      text,
  status       text not null default 'pending'
               check (status in ('pending', 'accepted', 'rejected', 'cancelled')),
  resolved_by  uuid references public.users(id),
  resolved_at  timestamptz,
  created_at   timestamptz not null default now()
);


create unique index if not exists uq_space_requests_pending
  on public.space_requests (space_id, requester_id)
  where status = 'pending';

create index if not exists idx_space_requests_space
  on public.space_requests (space_id, status);
create index if not exists idx_space_requests_requester
  on public.space_requests (requester_id, status);


create table if not exists public.department_members (
  id            uuid primary key default gen_random_uuid(),
  department_id uuid not null references public.departments(id) on delete cascade,
  user_id       uuid not null references public.users(id) on delete cascade,
  role          text not null default 'member' check (role in ('owner', 'member')),
  joined_at     timestamptz not null default now(),
  unique (department_id, user_id)
);

create index if not exists idx_department_members_user
  on public.department_members (user_id);


insert into public.department_members (department_id, user_id, role)
select d.id, d.created_by, 'owner'
from public.departments d
where d.created_by is not null
on conflict (department_id, user_id) do nothing;


create table if not exists public.notifications (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.users(id) on delete cascade,
  type        text not null
              check (type in ('new_message', 'join_request', 'request_accepted', 'request_rejected')),
  title       text not null,
  body        text,

  resource_id uuid,
  is_read     boolean not null default false,
  created_at  timestamptz not null default now()
);

create index if not exists idx_notifications_user
  on public.notifications (user_id, is_read, created_at desc);

do $$
begin
  alter publication supabase_realtime add table public.notifications;
exception
  when duplicate_object then null;
end $$;
