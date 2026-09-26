-- WRITING-03: Writing evaluation fields
-- Toronto Academy of Education CELPIP Writing Practice
-- Safe to run more than once.
--
-- Adds the columns needed to store AI writing feedback on
-- public.attempt_scores. No new table is created: writing scores live
-- in the same attempt_scores table as speaking scores. Existing
-- speaking score columns are not touched.
--
-- attempts.status is text, so the new writing statuses
-- (writing_evaluating, writing_feedback_ready, writing_evaluation_failed)
-- need no schema change.

alter table public.attempt_scores
  add column if not exists writing_feedback jsonb default '{}'::jsonb;

alter table public.attempt_scores
  add column if not exists writing_overall_summary text;

alter table public.attempt_scores
  add column if not exists writing_suggested_structure text;
