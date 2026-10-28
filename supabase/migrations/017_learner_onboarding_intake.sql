-- Sign-up question flow (one-time intake after account creation).

alter table public.profiles
  add column if not exists onboarding_completed_at timestamptz,
  add column if not exists onboarding_current_step text;

comment on column public.profiles.onboarding_completed_at is
  'Set when the learner finishes the sign-up question flow.';
comment on column public.profiles.onboarding_current_step is
  'Resume pointer for the intake wizard (question key).';

create table if not exists public.learner_intake_answers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  question_key text not null,
  answer jsonb not null,
  answered_at timestamptz not null default now(),
  unique (user_id, question_key)
);

create index if not exists learner_intake_answers_user_id_idx
  on public.learner_intake_answers (user_id);

alter table public.learner_intake_answers enable row level security;

create policy "learner_intake_select_own"
  on public.learner_intake_answers for select
  using (auth.uid() = user_id);

create policy "learner_intake_insert_own"
  on public.learner_intake_answers for insert
  with check (auth.uid() = user_id);

create policy "learner_intake_update_own"
  on public.learner_intake_answers for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "learner_intake_delete_own"
  on public.learner_intake_answers for delete
  using (auth.uid() = user_id);

-- Existing accounts skip the wizard; new sign-ups leave onboarding_completed_at null.
update public.profiles
set onboarding_completed_at = coalesce(updated_at, created_at, now())
where onboarding_completed_at is null;
