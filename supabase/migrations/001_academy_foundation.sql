-- INFRA-01: Toronto Academy foundation schema
-- Creates the core tables, seed data, storage bucket, and RLS policies
-- for the CELPIP practice web app.

-- =========================================================
-- Tables
-- =========================================================

-- User profiles, one row per auth user.
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text,
  full_name text,
  role text default 'student',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Product modules, for example CELPIP Speaking Practice.
create table if not exists public.modules (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  description text,
  status text default 'coming_soon',
  sort_order integer default 0,
  created_at timestamptz default now()
);

-- Practice tasks inside a module.
create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  module_id uuid references public.modules (id) on delete cascade,
  task_type text not null,
  title text not null,
  prompt text not null,
  difficulty text default 'starter',
  status text default 'active',
  sort_order integer default 0,
  created_at timestamptz default now()
);

-- Speaking specific settings for a task.
create table if not exists public.speaking_task_details (
  task_id uuid primary key references public.tasks (id) on delete cascade,
  task_number integer,
  prep_seconds integer not null,
  speaking_seconds integer not null,
  scoring_focus jsonb default '[]'::jsonb
);

-- One row per practice attempt by a user.
create table if not exists public.attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users (id) on delete cascade,
  module_id uuid references public.modules (id),
  task_id uuid references public.tasks (id),
  status text default 'created',
  audio_path text,
  audio_duration_seconds integer,
  transcript text,
  submitted_at timestamptz,
  created_at timestamptz default now()
);

-- AI scoring results for an attempt.
create table if not exists public.attempt_scores (
  id uuid primary key default gen_random_uuid(),
  attempt_id uuid references public.attempts (id) on delete cascade,
  estimated_level numeric,
  level_label text,
  badge_slug text,
  content_coherence_score numeric,
  vocabulary_score numeric,
  listenability_score numeric,
  task_fulfillment_score numeric,
  strengths jsonb default '[]'::jsonb,
  improvements jsonb default '[]'::jsonb,
  next_steps jsonb default '[]'::jsonb,
  raw_ai_response jsonb,
  created_at timestamptz default now()
);

-- Badge catalog.
create table if not exists public.badges (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  description text,
  min_estimated_level numeric,
  icon_name text,
  created_at timestamptz default now()
);

-- Badges earned by users.
create table if not exists public.user_badges (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users (id) on delete cascade,
  badge_id uuid references public.badges (id) on delete cascade,
  attempt_id uuid references public.attempts (id) on delete set null,
  earned_at timestamptz default now(),
  unique (user_id, badge_id)
);

-- Product usage events for analytics and limits.
create table if not exists public.usage_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users (id) on delete cascade,
  event_type text not null,
  module_slug text,
  attempt_id uuid references public.attempts (id) on delete set null,
  created_at timestamptz default now()
);

-- Interest sign ups for live classes.
create table if not exists public.live_class_interest (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users (id) on delete set null,
  full_name text,
  email text not null,
  phone text,
  interested_module text default 'celpip-speaking',
  preferred_schedule text,
  notes text,
  created_at timestamptz default now()
);

-- Early access leads from the landing page form.
-- Columns match the existing /api/early-access route payload.
create table if not exists public.early_access_leads (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  email text not null,
  preparing_status text,
  test_date text,
  current_practice_method text,
  hardest_part text,
  willingness_to_pay text not null,
  notes text,
  created_at timestamptz default now()
);

-- =========================================================
-- Indexes
-- =========================================================

create index if not exists tasks_module_id_idx on public.tasks (module_id);
create index if not exists attempts_user_id_idx on public.attempts (user_id);
create index if not exists attempts_task_id_idx on public.attempts (task_id);
create index if not exists attempt_scores_attempt_id_idx on public.attempt_scores (attempt_id);
create index if not exists user_badges_user_id_idx on public.user_badges (user_id);
create index if not exists usage_events_user_id_idx on public.usage_events (user_id);

-- =========================================================
-- Seed data
-- =========================================================

insert into public.modules (slug, title, description, status, sort_order)
values
  ('celpip-speaking', 'CELPIP Speaking Practice', 'Practice all CELPIP speaking tasks with timed prompts and AI feedback.', 'active', 1),
  ('celpip-writing', 'CELPIP Writing Practice', 'Practice CELPIP writing tasks with guided feedback.', 'coming_soon', 2),
  ('celpip-reading', 'CELPIP Reading Practice', 'Practice CELPIP reading comprehension.', 'coming_soon', 3),
  ('celpip-listening', 'CELPIP Listening Practice', 'Practice CELPIP listening comprehension.', 'coming_soon', 4),
  ('live-classes', 'Live CELPIP Classes', 'Join live classes with a CELPIP instructor.', 'coming_soon', 5)
on conflict (slug) do nothing;

insert into public.badges (slug, title, description, min_estimated_level, icon_name)
values
  ('foundation-speaker', 'Foundation Speaker', 'You completed your first speaking attempts and built a base.', 0, 'seedling'),
  ('developing-communicator', 'Developing Communicator', 'Your responses are becoming clearer and more organized.', 4, 'trending-up'),
  ('test-ready-builder', 'Test Ready Builder', 'You are building the skills needed for test day.', 6, 'hammer'),
  ('confident-speaker', 'Confident Speaker', 'You speak with confidence across a range of tasks.', 8, 'mic'),
  ('advanced-communicator', 'Advanced Communicator', 'You communicate at an advanced level with strong control.', 10, 'award')
on conflict (slug) do nothing;

-- =========================================================
-- Storage
-- =========================================================

-- Private bucket for attempt audio. Audio is served via signed URLs only.
insert into storage.buckets (id, name, public)
values ('attempt-audio', 'attempt-audio', false)
on conflict (id) do nothing;

-- =========================================================
-- Row level security
-- =========================================================

alter table public.profiles enable row level security;
alter table public.modules enable row level security;
alter table public.tasks enable row level security;
alter table public.speaking_task_details enable row level security;
alter table public.attempts enable row level security;
alter table public.attempt_scores enable row level security;
alter table public.badges enable row level security;
alter table public.user_badges enable row level security;
alter table public.usage_events enable row level security;
alter table public.live_class_interest enable row level security;
alter table public.early_access_leads enable row level security;

-- profiles: users manage their own profile.
create policy "profiles_select_own"
  on public.profiles for select
  to authenticated
  using (auth.uid() = id);

create policy "profiles_insert_own"
  on public.profiles for insert
  to authenticated
  with check (auth.uid() = id);

create policy "profiles_update_own"
  on public.profiles for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- modules: readable by any signed in user.
create policy "modules_select_authenticated"
  on public.modules for select
  to authenticated
  using (true);

-- tasks: signed in users can read active tasks.
create policy "tasks_select_active"
  on public.tasks for select
  to authenticated
  using (status = 'active');

-- speaking_task_details: readable when the parent task is active.
create policy "speaking_task_details_select_active"
  on public.speaking_task_details for select
  to authenticated
  using (
    exists (
      select 1
      from public.tasks t
      where t.id = speaking_task_details.task_id
        and t.status = 'active'
    )
  );

-- attempts: users manage their own attempts.
create policy "attempts_select_own"
  on public.attempts for select
  to authenticated
  using (auth.uid() = user_id);

create policy "attempts_insert_own"
  on public.attempts for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "attempts_update_own"
  on public.attempts for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- attempt_scores: users can read scores for their own attempts.
-- Inserts are done by API routes using the service role, which bypasses RLS.
create policy "attempt_scores_select_own"
  on public.attempt_scores for select
  to authenticated
  using (
    exists (
      select 1
      from public.attempts a
      where a.id = attempt_scores.attempt_id
        and a.user_id = auth.uid()
    )
  );

-- badges: readable by any signed in user.
create policy "badges_select_authenticated"
  on public.badges for select
  to authenticated
  using (true);

-- user_badges: users can read their own earned badges.
create policy "user_badges_select_own"
  on public.user_badges for select
  to authenticated
  using (auth.uid() = user_id);

-- usage_events: users can read their own events.
-- Inserts are done by API routes using the service role, which bypasses RLS.
create policy "usage_events_select_own"
  on public.usage_events for select
  to authenticated
  using (auth.uid() = user_id);

-- live_class_interest: no anon or authenticated policies.
-- Inserts happen through server API routes using the service role.
-- No public select.

-- early_access_leads: no anon or authenticated policies.
-- Inserts happen through the /api/early-access route using the service role.
-- No public select.
