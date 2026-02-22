-- Race section rebuild: add race types, typing columns, announcements

-- Add new columns to race_periods
ALTER TABLE race_periods ADD COLUMN IF NOT EXISTS race_type TEXT DEFAULT 'xp' CHECK (race_type IN ('xp', 'typing'));
ALTER TABLE race_periods ADD COLUMN IF NOT EXISTS title TEXT;
ALTER TABLE race_periods ADD COLUMN IF NOT EXISTS description TEXT;

-- Add typing columns to race_entries
ALTER TABLE race_entries ADD COLUMN IF NOT EXISTS typing_speed_wpm INTEGER;
ALTER TABLE race_entries ADD COLUMN IF NOT EXISTS typing_accuracy DECIMAL(5,2);
ALTER TABLE race_entries ADD COLUMN IF NOT EXISTS is_final_submission BOOLEAN DEFAULT false;

-- Index for typing race leaderboard
CREATE INDEX IF NOT EXISTS idx_race_entries_typing_wpm ON race_entries(race_period_id, typing_speed_wpm DESC) WHERE typing_speed_wpm IS NOT NULL;

-- race_announcements table
CREATE TABLE IF NOT EXISTS race_announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  race_period_id UUID REFERENCES race_periods(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  sent_to_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS for race_announcements
ALTER TABLE race_announcements ENABLE ROW LEVEL SECURITY;

-- Anyone can view announcements (displayed on race page)
CREATE POLICY "Anyone can view race announcements" ON race_announcements
  FOR SELECT USING (true);

-- Admins can manage announcements
CREATE POLICY "Admins can manage race announcements" ON race_announcements
  FOR ALL USING (
    EXISTS (SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.is_admin = true)
  );
