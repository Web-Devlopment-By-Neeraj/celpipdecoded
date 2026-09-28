-- N02 platform schema. Extends the existing academy tables.
-- Mock content stays in mock_tests and the builder tables from earlier
-- migrations. These tables add entitlements, settings, evaluations,
-- attempts, commerce, lessons, and the live batch model.

create table if not exists public.users (
  id uuid primary key references auth.users (id) on delete cascade,
  email text,
  full_name text,
  timezone text not null default 'America/Toronto',
  whatsapp_e164 text,
  default_lang text default 'en',
  created_at timestamptz not null default now()
);

create table if not exists public.user_roles (
  user_id uuid not null references public.users (id) on delete cascade,
  role text not null check (role in ('student', 'coach', 'admin', 'owner')),
  primary key (user_id, role)
);

create table if not exists public.role_permissions (
  user_id uuid not null references public.users (id) on delete cascade,
  permission text not null,
  allowed boolean not null default false,
  primary key (user_id, permission)
);

create table if not exists public.settings (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now(),
  updated_by uuid references public.users (id)
);

create table if not exists public.settings_audit (
  id bigint generated always as identity primary key,
  key text not null,
  old_value jsonb,
  new_value jsonb,
  updated_by uuid,
  updated_at timestamptz not null default now()
);

create table if not exists public.products (
  code text primary key,
  name text not null,
  price_cents integer not null,
  currency text not null default 'CAD',
  provider_price_id text,
  active boolean not null default true
);

create table if not exists public.purchases (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users (id),
  product_code text not null references public.products (code),
  method text not null,
  provider_ref text unique,
  amount_cents integer not null,
  tax_cents integer not null default 0,
  status text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.entitlements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users (id),
  product_code text not null,
  starts_at timestamptz not null,
  ends_at timestamptz,
  source_purchase_id uuid references public.purchases (id),
  revoked_at timestamptz
);

create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users (id),
  provider_sub_id text unique,
  status text not null,
  current_period_end timestamptz,
  cancel_at_period_end boolean not null default false
);

create table if not exists public.webhook_events (
  provider_event_id text primary key,
  type text not null,
  payload jsonb,
  received_at timestamptz not null default now(),
  processed_at timestamptz,
  result text
);

create table if not exists public.crs_points (
  id bigint generated always as identity primary key,
  factor text not null,
  condition_key text not null,
  with_spouse boolean not null default false,
  points integer not null check (points >= 0),
  source_url text,
  verified_on date not null
);

create table if not exists public.crs_results (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users (id),
  inputs jsonb not null,
  total integer not null,
  breakdown jsonb not null,
  created_at timestamptz not null default now()
);

create table if not exists public.part_timings (
  part_type text not null,
  screen text not null,
  seconds integer not null,
  prep_seconds integer,
  record_seconds integer,
  primary key (part_type, screen)
);

create table if not exists public.mock_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users (id),
  mock_test_id uuid references public.mock_tests (id),
  version integer not null default 1,
  scope text not null,
  attempt_no integer not null,
  mode text not null,
  current_screen text,
  screen_started_at timestamptz,
  script jsonb,
  started_at timestamptz not null default now(),
  submitted_at timestamptz
);

create table if not exists public.submissions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users (id),
  task_type text not null,
  prompt_id text,
  attempt_id uuid references public.mock_attempts (id),
  text_body text,
  audio_asset_id text,
  audio_expires_at timestamptz,
  seconds_spoken integer,
  take_no integer,
  evaluation_status text not null default 'queued',
  created_at timestamptz not null default now()
);

create table if not exists public.evaluations (
  id uuid primary key default gen_random_uuid(),
  submission_id uuid not null references public.submissions (id) on delete cascade,
  model_version text not null,
  overall_level smallint,
  payload jsonb not null,
  cost_cents integer not null default 0
);

create table if not exists public.criterion_scores (
  id uuid primary key default gen_random_uuid(),
  evaluation_id uuid not null references public.evaluations (id) on delete cascade,
  criterion text not null,
  level smallint,
  evidence text,
  next_level_gap text
);

create table if not exists public.ai_usage (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users (id),
  kind text not null,
  cost_cents integer not null,
  created_at timestamptz not null default now()
);

create table if not exists public.evaluation_grants (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users (id),
  extra_count integer not null,
  granted_by uuid references public.users (id),
  reason text,
  created_at timestamptz not null default now()
);

create table if not exists public.calibration_set (
  id uuid primary key default gen_random_uuid(),
  label text not null,
  task_type text not null,
  body_or_audio_id text,
  known_level smallint not null,
  prompt_id text,
  known_criteria jsonb,
  retired_at timestamptz
);

create table if not exists public.calibration_runs (
  id uuid primary key default gen_random_uuid(),
  calibration_set_id uuid not null references public.calibration_set (id),
  model_version text not null,
  scored_level smallint,
  run_at timestamptz not null default now(),
  run_batch_id uuid,
  payload jsonb,
  cost_cents integer not null default 0
);

create table if not exists public.languages (
  code text primary key,
  name text not null,
  native_name text not null,
  status text not null,
  ordinal integer not null
);

create table if not exists public.lessons (
  id uuid primary key default gen_random_uuid(),
  module text not null,
  ordinal integer not null,
  is_free boolean not null default false,
  published boolean not null default false
);

create table if not exists public.lesson_videos (
  id uuid primary key default gen_random_uuid(),
  lesson_id uuid not null references public.lessons (id) on delete cascade,
  lang text not null references public.languages (code),
  title text,
  video_id text,
  duration_sec integer,
  published boolean not null default false
);

create table if not exists public.lesson_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users (id),
  lesson_id uuid not null references public.lessons (id),
  lang text not null,
  seconds_watched integer not null default 0,
  completed_at timestamptz
);

create table if not exists public.mini_courses (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  skill_tag text,
  skill_tags text[] not null default '{}',
  html_asset_id text,
  version integer not null default 1,
  is_free boolean not null default false,
  published boolean not null default false
);

create table if not exists public.mini_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users (id),
  mini_course_id uuid not null references public.mini_courses (id),
  kind text not null,
  score numeric,
  drill_id text,
  session_id text,
  created_at timestamptz not null default now()
);

create table if not exists public.skill_scores (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users (id),
  skill_tag text not null,
  rolling_level numeric,
  sample_count integer not null default 0,
  updated_at timestamptz not null default now(),
  unique (user_id, skill_tag)
);

create table if not exists public.prescriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users (id),
  skill_tag text not null,
  mini_course_id uuid references public.mini_courses (id),
  sent_at timestamptz not null default now(),
  completed_at timestamptz,
  level_before numeric,
  level_after numeric
);

create table if not exists public.batches (
  id uuid primary key default gen_random_uuid(),
  starts_on date not null,
  ends_on date,
  seat_cap integer not null default 8,
  min_to_run integer not null default 3,
  status text not null default 'open',
  zoom_link text
);

create table if not exists public.batch_seats (
  id uuid primary key default gen_random_uuid(),
  batch_id uuid not null references public.batches (id) on delete cascade,
  user_id uuid not null references public.users (id),
  status text not null,
  saved_payment_method text,
  purchase_id uuid references public.purchases (id),
  unique (batch_id, user_id)
);

create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users (id),
  kind text not null,
  external_ref text unique,
  starts_at timestamptz not null,
  zoom_join_url text,
  status text not null
);

create table if not exists public.kb_entries (
  id uuid primary key default gen_random_uuid(),
  question text not null,
  answer text not null,
  tags text[] not null default '{}',
  active boolean not null default true,
  source_question_id uuid,
  updated_at timestamptz not null default now()
);

create table if not exists public.chat_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users (id),
  started_at timestamptz not null default now(),
  handed_over_question_id uuid,
  message_count integer not null default 0
);

create table if not exists public.notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users (id),
  body text,
  created_at timestamptz not null default now()
);

create table if not exists public.jobs (
  id uuid primary key default gen_random_uuid(),
  type text not null,
  payload jsonb not null,
  status text not null default 'pending',
  attempts integer not null default 0,
  run_at timestamptz not null default now(),
  last_error text
);

create table if not exists public.job_dead_letters (
  id uuid primary key default gen_random_uuid(),
  job_id uuid,
  type text not null,
  error text not null,
  created_at timestamptz not null default now()
);

alter table public.crs_points enable row level security;
alter table public.entitlements enable row level security;
alter table public.crs_results enable row level security;
alter table public.notes enable row level security;

drop policy if exists crs_points_public_read on public.crs_points;
create policy crs_points_public_read on public.crs_points
  for select to anon, authenticated using (true);

drop policy if exists entitlements_own_read on public.entitlements;
create policy entitlements_own_read on public.entitlements
  for select to authenticated using (user_id = auth.uid());

drop policy if exists crs_results_own on public.crs_results;
create policy crs_results_own on public.crs_results
  for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

insert into public.products (code, name, price_cents, currency, active)
values
  ('sprint', 'Test Sprint', 4900, 'CAD', true),
  ('course', 'Decoded Course', 19900, 'CAD', true),
  ('batch', 'Live Batch', 9900, 'CAD', true),
  ('private_1to1', 'Private 1:1', 4900, 'CAD', true)
on conflict (code) do nothing;

insert into public.languages (code, name, native_name, status, ordinal)
values
  ('en', 'English', 'English', 'live', 1),
  ('hi', 'Hindi', 'हिंदी', 'live', 2),
  ('pa', 'Punjabi', 'ਪੰਜਾਬੀ', 'coming_soon', 3),
  ('ta', 'Tamil', 'தமிழ்', 'coming_soon', 4),
  ('gu', 'Gujarati', 'ગુજરાતી', 'coming_soon', 5)
on conflict (code) do nothing;
