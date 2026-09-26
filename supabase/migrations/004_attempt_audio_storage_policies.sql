-- SPEAKING-03: storage policies for the private attempt-audio bucket.
-- Lets authenticated students manage recordings only inside their own
-- user id folder: {auth.uid()}/{attempt_id}/answer.webm
--
-- Safe to run in the hosted Supabase SQL Editor. Policies are dropped
-- and recreated so the script can be re-run without errors.

-- =========================================================
-- Bucket
-- =========================================================

-- Ensure the bucket exists and stays private. Audio is played back
-- later through signed URLs only, never public URLs.
insert into storage.buckets (id, name, public)
values ('attempt-audio', 'attempt-audio', false)
on conflict (id) do update set public = false;

-- =========================================================
-- Storage object policies
-- =========================================================

-- The first folder segment of the object path must equal the caller's
-- user id, so users can never touch another user's recordings.

drop policy if exists "attempt_audio_insert_own" on storage.objects;
create policy "attempt_audio_insert_own"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'attempt-audio'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "attempt_audio_select_own" on storage.objects;
create policy "attempt_audio_select_own"
  on storage.objects for select
  to authenticated
  using (
    bucket_id = 'attempt-audio'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "attempt_audio_update_own" on storage.objects;
create policy "attempt_audio_update_own"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'attempt-audio'
    and (storage.foldername(name))[1] = auth.uid()::text
  )
  with check (
    bucket_id = 'attempt-audio'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "attempt_audio_delete_own" on storage.objects;
create policy "attempt_audio_delete_own"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'attempt-audio'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- =========================================================
-- Attempts table
-- =========================================================

-- No changes needed here. Migration 001 already created these policies
-- for public.attempts, which cover the browser submit flow:
--   attempts_select_own  (select own rows)
--   attempts_insert_own  (insert own rows)
--   attempts_update_own  (update own rows)
