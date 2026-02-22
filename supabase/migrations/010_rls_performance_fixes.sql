-- Fix Auth RLS Initialization Plan: wrap auth.uid() and auth.jwt() in (select ...)
-- Fix Multiple Permissive Policies: consolidate overlapping policies
-- See: https://supabase.com/docs/guides/database/postgres/row-level-security#call-functions-with-select

-- =============================================================================
-- USERS: 3 SELECT policies + 2 UPDATE policies -> consolidate
-- Service role FOR ALL covers its own ops; user/admin policies cover the rest
-- =============================================================================
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Service role can manage users" ON users;
DROP POLICY IF EXISTS "Admins can view all users" ON users;

-- SELECT: own profile OR admin (service_role covered by FOR ALL below)
CREATE POLICY "Users can view own profile or admins" ON users
  FOR SELECT USING (
    (select auth.uid()) = id
    OR EXISTS (SELECT 1 FROM users u WHERE u.id = (select auth.uid()) AND u.is_admin = true)
  );

-- UPDATE: own profile only (service_role covered by FOR ALL below)
CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING ((select auth.uid()) = id);

-- Service role has full access (single policy for its operations)
CREATE POLICY "Service role can manage users" ON users
  FOR ALL USING ((select auth.jwt() ->> 'role') = 'service_role');

-- =============================================================================
-- CLASSES
-- =============================================================================
DROP POLICY IF EXISTS "Users can manage own classes" ON classes;
CREATE POLICY "Users can manage own classes" ON classes
  FOR ALL USING ((select auth.uid()) = user_id);

-- =============================================================================
-- CALENDAR_EVENTS
-- =============================================================================
DROP POLICY IF EXISTS "Users can manage own events" ON calendar_events;
CREATE POLICY "Users can manage own events" ON calendar_events
  FOR ALL USING ((select auth.uid()) = user_id);

-- =============================================================================
-- COURSES: 2 SELECT policies -> split Creators to INSERT/UPDATE/DELETE only
-- =============================================================================
DROP POLICY IF EXISTS "Anyone can view published courses" ON courses;
DROP POLICY IF EXISTS "Creators can manage own courses" ON courses;

CREATE POLICY "Anyone can view published courses" ON courses
  FOR SELECT USING (
    is_published = true OR (select auth.uid()) = creator_id
  );

CREATE POLICY "Creators can manage own courses" ON courses
  FOR INSERT WITH CHECK ((select auth.uid()) = creator_id);
CREATE POLICY "Creators can update own courses" ON courses
  FOR UPDATE USING ((select auth.uid()) = creator_id);
CREATE POLICY "Creators can delete own courses" ON courses
  FOR DELETE USING ((select auth.uid()) = creator_id);

-- =============================================================================
-- COURSE_MODULES: 2 SELECT policies -> split Creators to INSERT/UPDATE/DELETE only
-- =============================================================================
DROP POLICY IF EXISTS "View modules of accessible courses" ON course_modules;
DROP POLICY IF EXISTS "Creators can manage course modules" ON course_modules;

CREATE POLICY "View modules of accessible courses" ON course_modules
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM courses c
      WHERE c.id = course_id AND (c.is_published = true OR c.creator_id = (select auth.uid()))
    )
  );

CREATE POLICY "Creators can manage course modules" ON course_modules
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM courses c WHERE c.id = course_id AND c.creator_id = (select auth.uid()))
  );
CREATE POLICY "Creators can update course modules" ON course_modules
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM courses c WHERE c.id = course_id AND c.creator_id = (select auth.uid()))
  );
CREATE POLICY "Creators can delete course modules" ON course_modules
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM courses c WHERE c.id = course_id AND c.creator_id = (select auth.uid()))
  );

-- =============================================================================
-- COURSE_ENROLLMENTS
-- =============================================================================
DROP POLICY IF EXISTS "Users can manage own enrollments" ON course_enrollments;
CREATE POLICY "Users can manage own enrollments" ON course_enrollments
  FOR ALL USING ((select auth.uid()) = user_id);

-- =============================================================================
-- USER_ACHIEVEMENTS
-- =============================================================================
DROP POLICY IF EXISTS "Users can view own achievements" ON user_achievements;
CREATE POLICY "Users can view own achievements" ON user_achievements
  FOR SELECT USING ((select auth.uid()) = user_id);

-- =============================================================================
-- RACE_ENTRIES
-- =============================================================================
DROP POLICY IF EXISTS "Users can manage own race entries" ON race_entries;
CREATE POLICY "Users can manage own race entries" ON race_entries
  FOR ALL USING ((select auth.uid()) = user_id);

-- =============================================================================
-- XP_TRANSACTIONS
-- =============================================================================
DROP POLICY IF EXISTS "Users can view own xp transactions" ON xp_transactions;
CREATE POLICY "Users can view own xp transactions" ON xp_transactions
  FOR SELECT USING ((select auth.uid()) = user_id);

-- =============================================================================
-- RACE_PERIODS: 2 SELECT policies -> split Admins to INSERT/UPDATE/DELETE only
-- =============================================================================
DROP POLICY IF EXISTS "Anyone can view race periods" ON race_periods;
DROP POLICY IF EXISTS "Admins can manage race periods" ON race_periods;

CREATE POLICY "Anyone can view race periods" ON race_periods
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage race periods" ON race_periods
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM users u WHERE u.id = (select auth.uid()) AND u.is_admin = true)
  );
CREATE POLICY "Admins can update race periods" ON race_periods
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM users u WHERE u.id = (select auth.uid()) AND u.is_admin = true)
  );
CREATE POLICY "Admins can delete race periods" ON race_periods
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM users u WHERE u.id = (select auth.uid()) AND u.is_admin = true)
  );

-- =============================================================================
-- BLOG_POSTS: 2 SELECT policies -> split Admins to INSERT/UPDATE/DELETE only
-- =============================================================================
DROP POLICY IF EXISTS "Anyone can view published posts" ON blog_posts;
DROP POLICY IF EXISTS "Admins can manage blog posts" ON blog_posts;

CREATE POLICY "Anyone can view published posts or admins" ON blog_posts
  FOR SELECT USING (
    published_at IS NOT NULL
    OR EXISTS (SELECT 1 FROM users u WHERE u.id = (select auth.uid()) AND u.is_admin = true)
  );

CREATE POLICY "Admins can manage blog posts" ON blog_posts
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM users u WHERE u.id = (select auth.uid()) AND u.is_admin = true)
  );
CREATE POLICY "Admins can update blog posts" ON blog_posts
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM users u WHERE u.id = (select auth.uid()) AND u.is_admin = true)
  );
CREATE POLICY "Admins can delete blog posts" ON blog_posts
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM users u WHERE u.id = (select auth.uid()) AND u.is_admin = true)
  );

-- =============================================================================
-- CONTACT_SUBMISSIONS
-- =============================================================================
DROP POLICY IF EXISTS "Admins can view contact submissions" ON contact_submissions;
CREATE POLICY "Admins can view contact submissions" ON contact_submissions
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM users u WHERE u.id = (select auth.uid()) AND u.is_admin = true)
  );

-- =============================================================================
-- RACE_ANNOUNCEMENTS: 2 SELECT policies -> split Admins to INSERT/UPDATE/DELETE only
-- =============================================================================
DROP POLICY IF EXISTS "Anyone can view race announcements" ON race_announcements;
DROP POLICY IF EXISTS "Admins can manage race announcements" ON race_announcements;

CREATE POLICY "Anyone can view race announcements" ON race_announcements
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage race announcements" ON race_announcements
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM users u WHERE u.id = (select auth.uid()) AND u.is_admin = true)
  );
CREATE POLICY "Admins can update race announcements" ON race_announcements
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM users u WHERE u.id = (select auth.uid()) AND u.is_admin = true)
  );
CREATE POLICY "Admins can delete race announcements" ON race_announcements
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM users u WHERE u.id = (select auth.uid()) AND u.is_admin = true)
  );

-- =============================================================================
-- ACCOUNT_DELETION_FEEDBACK: 2 policies for INSERT -> consolidate
-- =============================================================================
DROP POLICY IF EXISTS "Users can submit own deletion feedback" ON account_deletion_feedback;
DROP POLICY IF EXISTS "Service role can manage deletion feedback" ON account_deletion_feedback;

-- Single INSERT policy: service_role OR authenticated user inserting own feedback
CREATE POLICY "Insert deletion feedback" ON account_deletion_feedback
  FOR INSERT WITH CHECK (
    (select auth.jwt() ->> 'role') = 'service_role'
    OR (select auth.uid()) = user_id
  );

-- Service role for SELECT, UPDATE, DELETE
CREATE POLICY "Service role can manage deletion feedback" ON account_deletion_feedback
  FOR SELECT USING ((select auth.jwt() ->> 'role') = 'service_role');
CREATE POLICY "Service role can update deletion feedback" ON account_deletion_feedback
  FOR UPDATE USING ((select auth.jwt() ->> 'role') = 'service_role');
CREATE POLICY "Service role can delete deletion feedback" ON account_deletion_feedback
  FOR DELETE USING ((select auth.jwt() ->> 'role') = 'service_role');
