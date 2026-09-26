-- SPEAKING-06: attempt history and badge support
-- Adds composite indexes for the attempt history and badge queries.
-- attempt_scores (attempt_id) is already covered by
-- attempt_scores_attempt_id_idx from 001_academy_foundation.sql.
-- user_badges inserts run through the service role in the feedback
-- pipeline, so no new RLS policies are needed.

-- Attempt history lists a user's attempts newest first.
create index if not exists attempts_user_id_created_at_idx
  on public.attempts (user_id, created_at desc);

-- Badge lookups list a user's earned badges newest first.
create index if not exists user_badges_user_id_earned_at_idx
  on public.user_badges (user_id, earned_at desc);
