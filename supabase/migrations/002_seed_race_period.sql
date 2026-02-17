-- Seed initial race period for development
-- In production, create via admin dashboard or cron job on 1st of each month
INSERT INTO race_periods (start_date, end_date, status, prize_pool_1st, prize_pool_2nd, prize_pool_3rd)
SELECT
  date_trunc('month', CURRENT_DATE)::timestamptz,
  (date_trunc('month', CURRENT_DATE) + interval '1 month' - interval '1 second')::timestamptz,
  'active',
  100,
  60,
  40
WHERE NOT EXISTS (SELECT 1 FROM race_periods WHERE status = 'active' LIMIT 1);
