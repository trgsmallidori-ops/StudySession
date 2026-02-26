-- Allow limiting how often users can change their full name (e.g. once per week)
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS full_name_updated_at TIMESTAMPTZ;
