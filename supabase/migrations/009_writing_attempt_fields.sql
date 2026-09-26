-- WRITING-02: Writing attempt fields
-- Toronto Academy of Education CELPIP Writing Practice
-- Safe to run more than once.
--
-- Adds the columns needed to store a submitted writing response on
-- public.attempts. No new table is created: writing attempts live in
-- the same attempts table as speaking attempts.
--
-- attempts.status is text, so the new "writing_submitted" status value
-- needs no schema change.

alter table public.attempts
  add column if not exists response_text text;

alter table public.attempts
  add column if not exists word_count integer;

alter table public.attempts
  add column if not exists time_spent_seconds integer;

alter table public.attempts
  add column if not exists writing_submitted_at timestamptz;
