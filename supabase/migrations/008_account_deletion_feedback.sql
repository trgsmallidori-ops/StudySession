-- Account deletion feedback (stored before user is deleted, no FK to preserve data)
CREATE TABLE account_deletion_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  user_email TEXT,
  reason_primary TEXT,
  reason_secondary TEXT,
  reason_other TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_deletion_feedback_created_at ON account_deletion_feedback(created_at DESC);

ALTER TABLE account_deletion_feedback ENABLE ROW LEVEL SECURITY;

-- Only authenticated users can insert their own feedback (user_id must match)
CREATE POLICY "Users can submit own deletion feedback" ON account_deletion_feedback
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Admins can view all feedback (via service role)
CREATE POLICY "Service role can manage deletion feedback" ON account_deletion_feedback
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');
