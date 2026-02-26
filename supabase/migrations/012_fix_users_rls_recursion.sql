-- Fix infinite recursion in RLS on "users": policies must not SELECT from users
-- or the policy re-runs when evaluating that SELECT.
-- Use a SECURITY DEFINER function so the admin check reads users without RLS.
-- See: https://supabase.com/docs/guides/database/postgres/row-level-security#call-functions-with-select

CREATE OR REPLACE FUNCTION public.current_user_is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid() AND is_admin = true
  );
$$;

-- Recreate "Users select" to use the function instead of SELECT from users
DROP POLICY IF EXISTS "Users select" ON users;

CREATE POLICY "Users select" ON users
  FOR SELECT USING (
    ((select auth.jwt()) ->> 'role') = 'service_role'
    OR (select auth.uid()) = id
    OR public.current_user_is_admin()
  );
