-- One saved mock run per student.
--
-- An in-progress row is the attempt they can resume. A submitted row is
-- the result they can open again. Both stay on the account, so a closed
-- browser does not drop the run.
--
-- Writes go through the service role. Students can read their own rows.

create table if not exists public.learner_mock_runs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  slug text not null,
  mode text not null check (mode in ('full', 'section')),
  section text not null,
  status text not null default 'in_progress' check (status in ('in_progress', 'submitted')),
  screen_index integer not null default 0,
  payload jsonb not null default '{}'::jsonb,
  timer_key text,
  timer_remaining_seconds integer,
  timer_saved_at timestamptz,
  summary jsonb,
  started_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  submitted_at timestamptz
);

create unique index if not exists learner_mock_runs_one_open
  on public.learner_mock_runs (user_id, slug, mode, section)
  where status = 'in_progress';

create index if not exists learner_mock_runs_user_updated
  on public.learner_mock_runs (user_id, updated_at desc);

alter table public.learner_mock_runs enable row level security;

drop policy if exists learner_mock_runs_own_read on public.learner_mock_runs;
create policy learner_mock_runs_own_read
  on public.learner_mock_runs
  for select
  to authenticated
  using (user_id = auth.uid());
