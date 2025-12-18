-- Create users table with role support
create table if not exists public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  full_name text,
  role text not null check (role in ('admin', 'manager', 'worker')) default 'worker',
  created_at timestamp with time zone default now()
);

-- Enable RLS
alter table public.users enable row level security;

-- Policies
create policy "users_select_own"
  on public.users for select
  using (auth.uid() = id);

create policy "users_insert_own"
  on public.users for insert
  with check (auth.uid() = id);

create policy "users_update_own"
  on public.users for update
  using (auth.uid() = id);

-- Allow admins to view all users
create policy "admins_select_all"
  on public.users for select
  using (
    exists (
      select 1 from public.users
      where id = auth.uid() and role = 'admin'
    )
  );
