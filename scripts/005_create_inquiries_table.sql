-- Inquiries (פניות) — employees submit requests to admins, admins respond.
create table if not exists public.inquiries (
  id uuid primary key default gen_random_uuid(),
  worker_id uuid not null references public.users(id) on delete cascade,
  subject text not null,
  content text not null,
  status text not null check (status in ('open', 'closed')) default 'open',
  admin_response text,
  responded_at timestamp with time zone,
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now() not null
);

create index if not exists inquiries_worker_id_idx on public.inquiries(worker_id);
create index if not exists inquiries_status_idx on public.inquiries(status);

-- Enable RLS
alter table public.inquiries enable row level security;

-- Any user can read their own inquiries
create policy "inquiries_select_own"
  on public.inquiries for select
  using (auth.uid() = worker_id);

-- Any user can insert inquiries for themselves
create policy "inquiries_insert_own"
  on public.inquiries for insert
  with check (auth.uid() = worker_id);

-- Admins can read all inquiries
create policy "inquiries_admin_select_all"
  on public.inquiries for select
  using (
    exists (
      select 1 from public.users
      where id = auth.uid() and role = 'admin'
    )
  );

-- Admins can update any inquiry (set response, change status)
create policy "inquiries_admin_update_all"
  on public.inquiries for update
  using (
    exists (
      select 1 from public.users
      where id = auth.uid() and role = 'admin'
    )
  );
