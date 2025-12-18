-- Drop all existing policies on users table
DROP POLICY IF EXISTS "users_select_own" ON public.users;
DROP POLICY IF EXISTS "admins_select_all" ON public.users;
DROP POLICY IF EXISTS "users_update_own" ON public.users;

-- Disable RLS temporarily to debug
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;

-- Grant necessary permissions
GRANT ALL ON public.users TO authenticated;
GRANT ALL ON public.users TO service_role;

-- Ensure the trigger function has proper permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;

-- Recreate the trigger to ensure it works
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', ''),
    COALESCE(NEW.raw_user_meta_data ->> 'role', 'worker')
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Create a function to manually create missing user profiles
CREATE OR REPLACE FUNCTION public.create_user_profile_if_missing(user_id uuid, user_email text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, role)
  VALUES (user_id, user_email, '', 'worker')
  ON CONFLICT (id) DO NOTHING;
END;
$$;

GRANT EXECUTE ON FUNCTION public.create_user_profile_if_missing TO authenticated;
