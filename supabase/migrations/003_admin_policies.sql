-- Allow admins to view all users
CREATE POLICY "Admins can view all users" ON users
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.is_admin = true)
  );

-- Allow admins to manage race_periods
CREATE POLICY "Admins can manage race periods" ON race_periods
  FOR ALL USING (
    EXISTS (SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.is_admin = true)
  );

-- Allow admins to view contact submissions
CREATE POLICY "Admins can view contact submissions" ON contact_submissions
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.is_admin = true)
  );

-- Allow admins to manage blog posts
CREATE POLICY "Admins can manage blog posts" ON blog_posts
  FOR ALL USING (
    EXISTS (SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.is_admin = true)
  );
