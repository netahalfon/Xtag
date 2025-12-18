-- Drop the problematic policy
drop policy if exists "admins_select_all" on public.users;

-- Remove the recursive policy and simplify RLS
-- Users can read their own data
-- Admins can be granted broader access through a different mechanism if needed later
