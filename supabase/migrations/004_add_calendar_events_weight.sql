-- Add grade weight column to calendar_events for tests/exams
ALTER TABLE calendar_events ADD COLUMN IF NOT EXISTS weight NUMERIC;
