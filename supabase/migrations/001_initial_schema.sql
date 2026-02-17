-- Calearnder Database Schema
-- Subscription tiers enum
CREATE TYPE subscription_tier AS ENUM ('free', 'scholar', 'champion', 'ultimate');

-- Event types enum
CREATE TYPE event_type AS ENUM ('test', 'assignment', 'lecture', 'other');

-- Difficulty enum
CREATE TYPE difficulty AS ENUM ('beginner', 'intermediate', 'advanced');

-- Race status enum
CREATE TYPE race_status AS ENUM ('upcoming', 'active', 'completed');

-- Contact status enum
CREATE TYPE contact_status AS ENUM ('new', 'responded', 'archived');

-- users (extends Supabase auth.users)
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  subscription_tier subscription_tier DEFAULT 'free',
  subscription_id TEXT,
  total_xp INTEGER DEFAULT 0,
  calendar_uploads_used INTEGER DEFAULT 0,
  is_admin BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- classes
CREATE TABLE classes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  color TEXT NOT NULL DEFAULT '#00f0ff',
  days_of_week INTEGER[] DEFAULT '{}',
  start_time TIME,
  end_time TIME,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- calendar_events
CREATE TABLE calendar_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  class_id UUID REFERENCES classes(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  event_type event_type DEFAULT 'other',
  due_date TIMESTAMPTZ NOT NULL,
  color TEXT DEFAULT '#00f0ff',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- courses (Learn section)
CREATE TABLE courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  duration_days INTEGER DEFAULT 7,
  thumbnail_url TEXT,
  difficulty difficulty DEFAULT 'beginner',
  total_xp_reward INTEGER DEFAULT 100,
  is_published BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- course_modules
CREATE TABLE course_modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  order_index INTEGER NOT NULL DEFAULT 0,
  content JSONB DEFAULT '{}'
);

-- course_enrollments
CREATE TABLE course_enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  progress_percentage DECIMAL(5,2) DEFAULT 0,
  xp_earned INTEGER DEFAULT 0,
  completed_at TIMESTAMPTZ,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, course_id)
);

-- achievements
CREATE TABLE achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  icon_url TEXT,
  xp_requirement INTEGER,
  unlock_condition JSONB DEFAULT '{}'
);

-- user_achievements
CREATE TABLE user_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  achievement_id UUID NOT NULL REFERENCES achievements(id) ON DELETE CASCADE,
  unlocked_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, achievement_id)
);

-- race_periods
CREATE TABLE race_periods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ NOT NULL,
  status race_status DEFAULT 'upcoming',
  participant_count INTEGER DEFAULT 0,
  prize_pool_1st DECIMAL(10,2) DEFAULT 100,
  prize_pool_2nd DECIMAL(10,2) DEFAULT 60,
  prize_pool_3rd DECIMAL(10,2) DEFAULT 40,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- race_entries
CREATE TABLE race_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  race_period_id UUID NOT NULL REFERENCES race_periods(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  opted_in_at TIMESTAMPTZ DEFAULT NOW(),
  xp_earned_during_race INTEGER DEFAULT 0,
  final_rank INTEGER,
  payout_amount DECIMAL(10,2),
  paid_out BOOLEAN DEFAULT false,
  UNIQUE(user_id, race_period_id)
);

-- blog_posts
CREATE TABLE blog_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  content TEXT,
  author_id UUID REFERENCES users(id) ON DELETE SET NULL,
  published_at TIMESTAMPTZ,
  featured_image TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- contact_submissions
CREATE TABLE contact_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  message TEXT NOT NULL,
  status contact_status DEFAULT 'new',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- xp_transactions (audit trail for XP)
CREATE TABLE xp_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  source TEXT NOT NULL,
  source_id UUID,
  race_period_id UUID REFERENCES race_periods(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_classes_user_id ON classes(user_id);
CREATE INDEX idx_calendar_events_user_id ON calendar_events(user_id);
CREATE INDEX idx_calendar_events_due_date ON calendar_events(due_date);
CREATE INDEX idx_courses_creator_id ON courses(creator_id);
CREATE INDEX idx_courses_is_published ON courses(is_published);
CREATE INDEX idx_course_enrollments_user_id ON course_enrollments(user_id);
CREATE INDEX idx_course_enrollments_course_id ON course_enrollments(course_id);
CREATE INDEX idx_race_entries_race_period_id ON race_entries(race_period_id);
CREATE INDEX idx_race_entries_xp ON race_entries(race_period_id, xp_earned_during_race DESC);
CREATE INDEX idx_xp_transactions_user_id ON xp_transactions(user_id);
CREATE INDEX idx_xp_transactions_race ON xp_transactions(race_period_id, user_id, created_at);

-- RLS Policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE calendar_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE race_periods ENABLE ROW LEVEL SECURITY;
ALTER TABLE race_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE xp_transactions ENABLE ROW LEVEL SECURITY;

-- users: users can read/update their own row
CREATE POLICY "Users can view own profile" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Service role can manage users" ON users FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- classes: user's own
CREATE POLICY "Users can manage own classes" ON classes FOR ALL USING (auth.uid() = user_id);

-- calendar_events: user's own
CREATE POLICY "Users can manage own events" ON calendar_events FOR ALL USING (auth.uid() = user_id);

-- courses: public read if published, creator can manage
CREATE POLICY "Anyone can view published courses" ON courses FOR SELECT USING (is_published = true OR auth.uid() = creator_id);
CREATE POLICY "Creators can manage own courses" ON courses FOR ALL USING (auth.uid() = creator_id);

-- course_modules: through course
CREATE POLICY "View modules of accessible courses" ON course_modules FOR SELECT USING (
  EXISTS (SELECT 1 FROM courses c WHERE c.id = course_id AND (c.is_published = true OR c.creator_id = auth.uid()))
);
CREATE POLICY "Creators can manage course modules" ON course_modules FOR ALL USING (
  EXISTS (SELECT 1 FROM courses c WHERE c.id = course_id AND c.creator_id = auth.uid())
);

-- course_enrollments: user's own
CREATE POLICY "Users can manage own enrollments" ON course_enrollments FOR ALL USING (auth.uid() = user_id);

-- achievements: public read
CREATE POLICY "Anyone can view achievements" ON achievements FOR SELECT USING (true);

-- user_achievements: user's own
CREATE POLICY "Users can view own achievements" ON user_achievements FOR SELECT USING (auth.uid() = user_id);

-- race_periods: public read
CREATE POLICY "Anyone can view race periods" ON race_periods FOR SELECT USING (true);

-- race_entries: user's own
CREATE POLICY "Users can manage own race entries" ON race_entries FOR ALL USING (auth.uid() = user_id);

-- blog_posts: public read published
CREATE POLICY "Anyone can view published posts" ON blog_posts FOR SELECT USING (published_at IS NOT NULL);

-- contact_submissions: insert only for public
CREATE POLICY "Anyone can submit contact" ON contact_submissions FOR INSERT WITH CHECK (true);

-- xp_transactions: user can read own
CREATE POLICY "Users can view own xp transactions" ON xp_transactions FOR SELECT USING (auth.uid() = user_id);

-- Function to create user on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update users.updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
