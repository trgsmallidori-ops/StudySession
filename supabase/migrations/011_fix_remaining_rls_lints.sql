-- Fix remaining Supabase linter issues:
-- 1. auth_rls_initplan: Use (select auth.jwt()) ->> 'role' (extraction outside select)
-- 2. multiple_permissive_policies: Consolidate users table into one policy per action
-- See: https://supabase.com/docs/guides/database/postgres/row-level-security#call-functions-with-select

-- =============================================================================
-- USERS: Consolidate into single policy per action (fix multiple_permissive_policies)
-- Also fix auth_rls_initplan: (select auth.jwt()) ->> 'role'
-- =============================================================================
DROP POLICY IF EXISTS "Users can view own profile or admins" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Service role can manage users" ON users;
DROP POLICY IF EXISTS "Users select" ON users;
DROP POLICY IF EXISTS "Users update" ON users;
DROP POLICY IF EXISTS "Users insert" ON users;
DROP POLICY IF EXISTS "Users delete" ON users;

-- Single SELECT policy: service_role OR own profile OR admin
CREATE POLICY "Users select" ON users
  FOR SELECT USING (
    ((select auth.jwt()) ->> 'role') = 'service_role'
    OR (select auth.uid()) = id
    OR EXISTS (SELECT 1 FROM users u WHERE u.id = (select auth.uid()) AND u.is_admin = true)
  );

-- Single UPDATE policy: service_role OR own profile
CREATE POLICY "Users update" ON users
  FOR UPDATE USING (
    ((select auth.jwt()) ->> 'role') = 'service_role'
    OR (select auth.uid()) = id
  );

-- INSERT/DELETE: service_role only (user creation via trigger uses definer)
CREATE POLICY "Users insert" ON users
  FOR INSERT WITH CHECK (((select auth.jwt()) ->> 'role') = 'service_role');
CREATE POLICY "Users delete" ON users
  FOR DELETE USING (((select auth.jwt()) ->> 'role') = 'service_role');

-- =============================================================================
-- ACCOUNT_DELETION_FEEDBACK: Fix auth_rls_initplan
-- Use (select auth.jwt()) ->> 'role' with extraction outside the select
-- =============================================================================
DROP POLICY IF EXISTS "Insert deletion feedback" ON account_deletion_feedback;
DROP POLICY IF EXISTS "Service role can manage deletion feedback" ON account_deletion_feedback;
DROP POLICY IF EXISTS "Service role can select deletion feedback" ON account_deletion_feedback;
DROP POLICY IF EXISTS "Service role can update deletion feedback" ON account_deletion_feedback;
DROP POLICY IF EXISTS "Service role can delete deletion feedback" ON account_deletion_feedback;

CREATE POLICY "Insert deletion feedback" ON account_deletion_feedback
  FOR INSERT WITH CHECK (
    ((select auth.jwt()) ->> 'role') = 'service_role'
    OR (select auth.uid()) = user_id
  );

CREATE POLICY "Service role can select deletion feedback" ON account_deletion_feedback
  FOR SELECT USING (((select auth.jwt()) ->> 'role') = 'service_role');
CREATE POLICY "Service role can update deletion feedback" ON account_deletion_feedback
  FOR UPDATE USING (((select auth.jwt()) ->> 'role') = 'service_role');
CREATE POLICY "Service role can delete deletion feedback" ON account_deletion_feedback
  FOR DELETE USING (((select auth.jwt()) ->> 'role') = 'service_role');

-- =============================================================================
-- CONTACT_SUBMISSIONS: Fix rls_policy_always_true
-- Replace WITH CHECK (true) with validation to prevent unrestricted access
-- Public contact form: anyone can submit, but with reasonable limits
-- =============================================================================
DROP POLICY IF EXISTS "Anyone can submit contact" ON contact_submissions;

CREATE POLICY "Anyone can submit contact" ON contact_submissions
  FOR INSERT
  WITH CHECK (
    length(name) <= 500
    AND length(email) <= 255
    AND length(message) <= 10000
  );
