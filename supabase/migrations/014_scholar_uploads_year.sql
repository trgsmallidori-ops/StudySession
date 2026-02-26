-- Scholar: 30 calendar uploads per year. Track which year the count applies to.
ALTER TABLE users ADD COLUMN IF NOT EXISTS calendar_uploads_year INTEGER;
