-- Add course-related fields to classes table (for SpaxioScheduled-style AI parsing)
ALTER TABLE classes ADD COLUMN IF NOT EXISTS course_code TEXT;
ALTER TABLE classes ADD COLUMN IF NOT EXISTS term_start_date DATE;
ALTER TABLE classes ADD COLUMN IF NOT EXISTS term_end_date DATE;
ALTER TABLE classes ADD COLUMN IF NOT EXISTS assignment_weights JSONB DEFAULT '{}';
