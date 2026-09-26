-- ADMIN-01: mock test builder admin foundation
-- Toronto Academy of Education CELPIP Preparation Program
-- Safe to run more than once.
--
-- FILE NUMBER NOTE. The ADMIN-01 ticket names this file
-- 011_mock_test_builder_admin_foundation.sql. Numbers 011 and 012 were
-- already taken by 011_ai_usage_instrumentation.sql and
-- 012_usage_access_limits.sql, so this file takes the next free number
-- instead of creating a second 011. Nothing else about the ticket
-- changes.
--
-- This is the first real table set for the admin mock test builder.
-- It creates four tables and nothing else:
--
--   mock_tests                   one authored practice test
--   mock_test_sections           Listening, Reading, Writing, Speaking
--   mock_test_parts              a numbered part or task in a section
--   mock_test_validation_issues  cached authoring problems
--
-- Source documents:
--   docs/admin/mock-test-builder-draft-schema.sql   (ADMIN-00 draft)
--   docs/admin/mock-test-builder-database-blueprint.md
--   docs/admin/mock-test-builder-workflow.md
--   docs/admin/admin-01-mock-test-builder-mvp.md
--
-- Deliberately NOT created here, because no code in ADMIN-01 reads or
-- writes them: questions, options, answer keys, media assets, timer
-- rules, scoring rules, AI rubrics, screens, and the four student
-- attempt tables. Each arrives with the ticket that uses it. Answer keys
-- in particular stay out until ADMIN-02 builds the editor that owns
-- them.
--
-- RERUN NOTE. This file was written as if the four tables were new. They
-- were not: all four already existed in the hosted database from the
-- earlier hardcoded Mock Test 1 work, so every "create table if not
-- exists" below did nothing and none of the ADMIN-01 columns were ever
-- added. That is what made the builder fail to create a practice test,
-- with PGRST204 on a missing updated_by column, while the list screen
-- still rendered.
--
-- The file now reconciles as well as creates. After each create table
-- there is an "add column if not exists" block covering every column
-- ADMIN-01 owns, so the file produces the same shape whether it meets an
-- empty database or the hosted one. Run it again on any database; it is
-- still safe to run more than once.
--
-- Nothing is dropped and no column is retyped or removed, so the Mock
-- Test 1 rows and the older learner columns alongside them are untouched.
-- Two exceptions, both deliberate and both explained where they happen:
-- NOT NULL is lifted from the legacy learner columns on
-- mock_test_sections, and the two stale active-only policies are
-- dropped.
--
-- House style: normal hyphens only, no long hyphens or em dashes,
-- straight quotes only.


-- =========================================================
-- Shared updated_at trigger function
-- =========================================================

-- Identical to the definition in 002_auth_profile_trigger.sql. Repeated
-- with create or replace so this migration can be pasted into the SQL
-- editor on its own without depending on run order.
create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;


-- =========================================================
-- mock_tests
-- =========================================================

-- One authored practice test. status drives learner visibility, and for
-- ADMIN-01 nothing is learner visible at all: the learner dashboard
-- still renders the hardcoded Mock Test 1 content files and reads none
-- of these tables.
--
-- Statuses, per the ADMIN-01 ticket:
--   draft             being authored
--   internal_preview  staff review, still invisible to learners
--   published         reserved, blocked until the validation set is
--                     complete in a later ticket
--   archived          retired, kept so past work still renders
--
-- ADMIN-00 called the middle status ready_for_review. ADMIN-01 renames
-- it internal_preview. Same position in the flow, clearer wording.
create table if not exists public.mock_tests (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  description text,
  status text not null default 'draft',
  version integer not null default 1,
  published_at timestamptz,
  -- Staff only. Never selected into a learner response.
  internal_notes text,
  created_by uuid references auth.users (id),
  updated_by uuid references auth.users (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Reconcile an already existing mock_tests.
--
-- This is the block that fixes the reported bug. All four tables in this
-- file already existed in the hosted database, carried over from the
-- earlier hardcoded Mock Test 1 work, so every "create table if not
-- exists" above quietly did nothing and none of the ADMIN-01 columns
-- arrived with it. The admin list still rendered, because it only reads
-- columns the old table happened to have, but createMockTest writes
-- updated_by and the write was refused with PGRST204, "Could not find
-- the 'updated_by' column of 'mock_tests' in the schema cache".
--
-- So every ADMIN-01 column is added here as well, idempotently. On a
-- fresh database these are all no-ops; on the hosted one they are the
-- repair. Nothing is dropped and no existing column is retyped, so the
-- Mock Test 1 rows and the old learner columns on them survive untouched.
alter table public.mock_tests
  add column if not exists description text,
  add column if not exists status text not null default 'draft',
  add column if not exists version integer not null default 1,
  add column if not exists published_at timestamptz,
  add column if not exists internal_notes text,
  add column if not exists created_by uuid references auth.users (id),
  add column if not exists updated_by uuid references auth.users (id),
  add column if not exists created_at timestamptz not null default now(),
  add column if not exists updated_at timestamptz not null default now();

-- Constraints are added separately so a partially applied earlier run
-- can be brought up to date without dropping the table.
do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'mock_tests_status_check'
  ) then
    alter table public.mock_tests
      add constraint mock_tests_status_check
      check (status in ('draft', 'internal_preview', 'published', 'archived'));
  end if;

  if not exists (
    select 1 from pg_constraint where conname = 'mock_tests_version_check'
  ) then
    alter table public.mock_tests
      add constraint mock_tests_version_check
      check (version >= 1);
  end if;

  if not exists (
    select 1 from pg_constraint where conname = 'mock_tests_slug_format_check'
  ) then
    alter table public.mock_tests
      add constraint mock_tests_slug_format_check
      check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$');
  end if;

  if not exists (
    select 1 from pg_constraint where conname = 'mock_tests_title_present_check'
  ) then
    alter table public.mock_tests
      add constraint mock_tests_title_present_check
      check (length(trim(title)) > 0);
  end if;

  -- A published test must record when it was published.
  if not exists (
    select 1 from pg_constraint where conname = 'mock_tests_published_at_check'
  ) then
    alter table public.mock_tests
      add constraint mock_tests_published_at_check
      check (status <> 'published' or published_at is not null);
  end if;
end
$$;

create index if not exists mock_tests_status_idx
  on public.mock_tests (status);

-- The ticket also asks for an index on slug. The unique constraint above
-- already creates a btree index on that column, so a second one would be
-- dead weight. Recorded here rather than added.

create index if not exists mock_tests_updated_at_idx
  on public.mock_tests (updated_at desc);

drop trigger if exists mock_tests_set_updated_at on public.mock_tests;

create trigger mock_tests_set_updated_at
  before update on public.mock_tests
  for each row
  execute function public.set_updated_at();


-- =========================================================
-- mock_test_sections
-- =========================================================

-- One skill inside one test. A test holds at most one section per
-- skill, which is what the unique constraint on (mock_test_id,
-- section_type) enforces.
--
-- section_order is deliberately NOT unique. Swapping two sections means
-- passing through a state where two rows share an order, and a unique
-- constraint would refuse the first of the two writes. Duplicate and
-- non contiguous orders are reported by validateMockTestStructure as
-- issues instead, which is also how the ADMIN-01 ticket lists them.
--
-- estimated_duration_minutes is display text, not a clock. The timer a
-- learner runs against comes from mock_test_timer_rules in a later
-- ticket, so nothing here is authoritative for timing.
create table if not exists public.mock_test_sections (
  id uuid primary key default gen_random_uuid(),
  mock_test_id uuid not null
    references public.mock_tests (id) on delete cascade,
  section_type text not null,
  title text not null,
  instructions text,
  section_order integer not null,
  estimated_duration_minutes integer,
  scoring_type text,
  status text not null default 'draft',
  created_by uuid references auth.users (id),
  updated_by uuid references auth.users (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Reconcile an already existing mock_test_sections.
--
-- Same story as mock_tests, with one extra problem. The old learner
-- table carries module_type, section_number, slug and content_json, and
-- the first three are NOT NULL with no default. The builder does not
-- know about any of them, so createMockTestSection would have been
-- refused with 23502, "null value in column ... violates not-null
-- constraint", as soon as the missing columns below were fixed.
--
-- The columns stay, because Mock Test 1 content lives in them and this
-- migration drops nothing. Only the NOT NULL is lifted, so a row can be
-- authored by either the old content path or the builder. A section the
-- builder creates leaves them null; the four existing Reading sections
-- keep their values.
alter table public.mock_test_sections
  add column if not exists section_type text,
  add column if not exists title text,
  add column if not exists instructions text,
  add column if not exists section_order integer,
  add column if not exists estimated_duration_minutes integer,
  add column if not exists scoring_type text,
  add column if not exists status text not null default 'draft',
  add column if not exists created_by uuid references auth.users (id),
  add column if not exists updated_by uuid references auth.users (id),
  add column if not exists created_at timestamptz not null default now(),
  add column if not exists updated_at timestamptz not null default now();

-- Legacy learner columns, made optional rather than removed. Written as
-- a loop over the column names so the statement is a no-op on a fresh
-- database where these columns were never created.
do $$
declare
  legacy_column text;
begin
  foreach legacy_column in array array['module_type', 'section_number', 'slug', 'content_json']
  loop
    if exists (
      select 1
      from information_schema.columns
      where table_schema = 'public'
        and table_name = 'mock_test_sections'
        and column_name = legacy_column
        and is_nullable = 'NO'
    ) then
      execute format(
        'alter table public.mock_test_sections alter column %I drop not null',
        legacy_column
      );
    end if;
  end loop;
end
$$;

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'mock_test_sections_section_type_check'
  ) then
    alter table public.mock_test_sections
      add constraint mock_test_sections_section_type_check
      check (section_type in ('listening', 'reading', 'writing', 'speaking'));
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'mock_test_sections_status_check'
  ) then
    alter table public.mock_test_sections
      add constraint mock_test_sections_status_check
      check (status in ('draft', 'ready'));
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'mock_test_sections_scoring_type_check'
  ) then
    alter table public.mock_test_sections
      add constraint mock_test_sections_scoring_type_check
      check (scoring_type is null or scoring_type in ('objective', 'ai_rubric'));
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'mock_test_sections_order_check'
  ) then
    alter table public.mock_test_sections
      add constraint mock_test_sections_order_check
      check (section_order >= 1);
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'mock_test_sections_duration_check'
  ) then
    alter table public.mock_test_sections
      add constraint mock_test_sections_duration_check
      check (
        estimated_duration_minutes is null
        or estimated_duration_minutes > 0
      );
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'mock_test_sections_title_present_check'
  ) then
    alter table public.mock_test_sections
      add constraint mock_test_sections_title_present_check
      check (length(trim(title)) > 0);
  end if;

  -- One section per skill per test, added only when the existing rows
  -- can satisfy it.
  --
  -- On the hosted database they cannot, and that is a real modelling
  -- difference rather than bad data. The old learner rows treat a
  -- section as a numbered part, so Mock Test 1 has four rows that all
  -- read section_type 'reading'. ADMIN-01 treats a section as a skill
  -- with parts underneath it.
  --
  -- Reshaping those four rows would mean rewriting Mock Test 1 content,
  -- which this ticket does not do and which nothing currently needs:
  -- no learner code reads these tables, the test runs from its content
  -- files. So the constraint is skipped rather than forced, the rows are
  -- left alone, and the notice below says so out loud instead of leaving
  -- a silent gap.
  --
  -- While it is skipped, one section per skill is enforced only by
  -- createMockTestSection, which already reads the section list before
  -- it writes. Add the constraint in the later ticket that reshapes the
  -- legacy rows.
  if not exists (
    select 1 from pg_constraint
    where conname = 'mock_test_sections_unique_skill'
  ) then
    if exists (
      select 1
      from public.mock_test_sections
      where section_type is not null
      group by mock_test_id, section_type
      having count(*) > 1
    ) then
      raise notice 'Skipping mock_test_sections_unique_skill: existing rows already repeat a section_type within one test.';
    else
      alter table public.mock_test_sections
        add constraint mock_test_sections_unique_skill
        unique (mock_test_id, section_type);
    end if;
  end if;

  -- Target for the composite foreign key on mock_test_parts below. It
  -- is what stops a part from claiming one test while its section
  -- belongs to another.
  if not exists (
    select 1 from pg_constraint
    where conname = 'mock_test_sections_id_test_unique'
  ) then
    alter table public.mock_test_sections
      add constraint mock_test_sections_id_test_unique
      unique (id, mock_test_id);
  end if;
end
$$;

create index if not exists mock_test_sections_test_idx
  on public.mock_test_sections (mock_test_id);

create index if not exists mock_test_sections_test_order_idx
  on public.mock_test_sections (mock_test_id, section_order);

drop trigger if exists mock_test_sections_set_updated_at
  on public.mock_test_sections;

create trigger mock_test_sections_set_updated_at
  before update on public.mock_test_sections
  for each row
  execute function public.set_updated_at();


-- =========================================================
-- mock_test_parts
-- =========================================================

-- A numbered part or task inside a section.
--
-- mock_test_id is carried on the part as well as on its section, so the
-- builder can read a whole test structure without a join. The composite
-- foreign key below makes that copy safe: (section_id, mock_test_id) has
-- to match a real section row, so the two can never disagree.
--
-- question_count is a staff estimate for the structure preview only. The
-- real count comes off mock_test_questions once ADMIN-02 creates it, and
-- the validator compares the two from that point on.
--
-- part_type is nullable because a part can be sketched before its shape
-- is decided. When it is set it has to be one of the shapes recorded in
-- docs/admin/mock-test-builder-workflow.md section 4.
create table if not exists public.mock_test_parts (
  id uuid primary key default gen_random_uuid(),
  mock_test_id uuid not null
    references public.mock_tests (id) on delete cascade,
  section_id uuid not null
    references public.mock_test_sections (id) on delete cascade,
  title text not null,
  part_type text,
  instructions text,
  part_order integer not null,
  timer_type text,
  prep_time_seconds integer,
  response_time_seconds integer,
  question_count integer,
  status text not null default 'draft',
  created_by uuid references auth.users (id),
  updated_by uuid references auth.users (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Reconcile an already existing mock_test_parts. On the hosted database
-- this table was present but had neither created_by nor updated_by, so
-- createMockTestPart would have been refused the same way createMockTest
-- was.
alter table public.mock_test_parts
  add column if not exists part_type text,
  add column if not exists instructions text,
  add column if not exists timer_type text,
  add column if not exists prep_time_seconds integer,
  add column if not exists response_time_seconds integer,
  add column if not exists question_count integer,
  add column if not exists status text not null default 'draft',
  add column if not exists created_by uuid references auth.users (id),
  add column if not exists updated_by uuid references auth.users (id),
  add column if not exists created_at timestamptz not null default now(),
  add column if not exists updated_at timestamptz not null default now();

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'mock_test_parts_section_test_fk'
  ) then
    alter table public.mock_test_parts
      add constraint mock_test_parts_section_test_fk
      foreign key (section_id, mock_test_id)
      references public.mock_test_sections (id, mock_test_id)
      on delete cascade;
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'mock_test_parts_part_type_check'
  ) then
    alter table public.mock_test_parts
      add constraint mock_test_parts_part_type_check
      check (part_type is null or part_type in (
        'listening_problem_solving',
        'listening_daily_conversation',
        'listening_information',
        'listening_news_item',
        'listening_discussion',
        'listening_viewpoints',
        'reading_correspondence',
        'reading_diagram',
        'reading_information',
        'reading_viewpoints',
        'writing_email',
        'writing_survey',
        'speaking_task',
        'speaking_image_task',
        'speaking_comparison_task'
      ));
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'mock_test_parts_timer_type_check'
  ) then
    alter table public.mock_test_parts
      add constraint mock_test_parts_timer_type_check
      check (timer_type is null or timer_type in (
        'per_question',
        'per_screen',
        'per_part',
        'prep_and_recording',
        'untimed'
      ));
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'mock_test_parts_status_check'
  ) then
    alter table public.mock_test_parts
      add constraint mock_test_parts_status_check
      check (status in ('draft', 'ready'));
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'mock_test_parts_order_check'
  ) then
    alter table public.mock_test_parts
      add constraint mock_test_parts_order_check
      check (part_order >= 1);
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'mock_test_parts_title_present_check'
  ) then
    alter table public.mock_test_parts
      add constraint mock_test_parts_title_present_check
      check (length(trim(title)) > 0);
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'mock_test_parts_prep_time_check'
  ) then
    alter table public.mock_test_parts
      add constraint mock_test_parts_prep_time_check
      check (prep_time_seconds is null or prep_time_seconds >= 0);
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'mock_test_parts_response_time_check'
  ) then
    alter table public.mock_test_parts
      add constraint mock_test_parts_response_time_check
      check (response_time_seconds is null or response_time_seconds > 0);
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'mock_test_parts_question_count_check'
  ) then
    alter table public.mock_test_parts
      add constraint mock_test_parts_question_count_check
      check (question_count is null or question_count >= 0);
  end if;
end
$$;

create index if not exists mock_test_parts_section_idx
  on public.mock_test_parts (section_id);

create index if not exists mock_test_parts_test_idx
  on public.mock_test_parts (mock_test_id);

create index if not exists mock_test_parts_section_order_idx
  on public.mock_test_parts (section_id, part_order);

drop trigger if exists mock_test_parts_set_updated_at on public.mock_test_parts;

create trigger mock_test_parts_set_updated_at
  before update on public.mock_test_parts
  for each row
  execute function public.set_updated_at();


-- =========================================================
-- mock_test_validation_issues
-- =========================================================

-- A cache of a computation. Recomputing every rule on every list render
-- would mean reading a whole test to draw one number, so the validator
-- writes its findings here and the list reads them. A status change
-- never trusts the cache: validateMockTestStructure recomputes and
-- rewrites the rows first, then decides.
--
-- issue_type is the rule code, for example 'test_has_no_sections'. The
-- messages are staff facing and never reach a learner.
create table if not exists public.mock_test_validation_issues (
  id uuid primary key default gen_random_uuid(),
  mock_test_id uuid not null
    references public.mock_tests (id) on delete cascade,
  -- Null for a whole test rule.
  entity_type text,
  entity_id uuid,
  issue_type text not null,
  issue_message text not null,
  severity text not null,
  resolved boolean not null default false,
  resolved_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Reconcile an already existing mock_test_validation_issues. On the
-- hosted database this table had neither entity_type nor entity_id, so
-- validateMockTestStructure would have been refused with PGRST204 when
-- it tried to record what it found.
alter table public.mock_test_validation_issues
  add column if not exists entity_type text,
  add column if not exists entity_id uuid,
  add column if not exists resolved boolean not null default false,
  add column if not exists resolved_at timestamptz,
  add column if not exists created_at timestamptz not null default now(),
  add column if not exists updated_at timestamptz not null default now();

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'mock_test_validation_issues_entity_type_check'
  ) then
    alter table public.mock_test_validation_issues
      add constraint mock_test_validation_issues_entity_type_check
      check (entity_type is null or entity_type in ('test', 'section', 'part'));
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'mock_test_validation_issues_severity_check'
  ) then
    alter table public.mock_test_validation_issues
      add constraint mock_test_validation_issues_severity_check
      check (severity in ('error', 'warning'));
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'mock_test_validation_issues_message_check'
  ) then
    alter table public.mock_test_validation_issues
      add constraint mock_test_validation_issues_message_check
      check (length(trim(issue_message)) > 0);
  end if;
end
$$;

create index if not exists mock_test_validation_issues_dashboard_idx
  on public.mock_test_validation_issues (mock_test_id, resolved, severity);

drop trigger if exists mock_test_validation_issues_set_updated_at
  on public.mock_test_validation_issues;

create trigger mock_test_validation_issues_set_updated_at
  before update on public.mock_test_validation_issues
  for each row
  execute function public.set_updated_at();


-- =========================================================
-- Row level security
-- =========================================================

-- Deny by default, on purpose.
--
-- RLS is enabled on all four tables and NO policy is created for anon or
-- authenticated. Postgres denies when no policy matches, so a learner
-- session that queries these tables directly, with the anon key, gets
-- zero rows and cannot write. That covers every ADMIN-01 requirement at
-- once: draft tests are hidden, internal notes are unreachable, and no
-- public dynamic mock test route can exist because there is no readable
-- data behind one.
--
-- The only path to these tables is server side: a server action that has
-- already passed requireAdmin in src/lib/admin/require-admin.ts and then
-- uses the service role client in src/lib/supabase/admin.ts, which is
-- server only and never imported by a client component. This is the same
-- shape the project already uses for speaking transcription, writing
-- evaluation and usage accounting.
--
-- Admin membership is an email list in the server only ADMIN_EMAILS
-- environment variable, so it is not visible to a Postgres policy. When
-- a database backed staff role lands, the learner read policies drafted
-- at the foot of docs/admin/mock-test-builder-draft-schema.sql become
-- real statements and the service role stops being the only route. That
-- is a later ticket, and ADMIN-01 stays deny by default until then.

alter table public.mock_tests enable row level security;
alter table public.mock_test_sections enable row level security;
alter table public.mock_test_parts enable row level security;
alter table public.mock_test_validation_issues enable row level security;


-- ---------------------------------------------------------------------
-- Remove the stale active-only policies
-- ---------------------------------------------------------------------

-- The hosted database carries two policies from before this ticket:
--
--   mock_tests_select_active           select where status = 'active'
--   mock_test_sections_select_active   select where the parent test
--                                      status = 'active'
--
-- Neither was ever created by a file in supabase/migrations, and both
-- now refer to a status that does not exist. ADMIN-01 replaced the old
-- vocabulary with draft, internal_preview, published and archived, and
-- mock_tests_status_check refuses 'active' outright, so no row can ever
-- match either policy. They are dead statements that read like live
-- learner access, which is the worst combination to leave behind: the
-- next person to look would reasonably believe learner reads are already
-- handled.
--
-- Dropping them changes nothing that works today. No learner code reads
-- these four tables at all, the mock test the students run is still
-- rendered from its content files, and the admin builder does not go
-- through these policies either. Data is untouched; a policy is a rule,
-- not a row.
drop policy if exists "mock_tests_select_active" on public.mock_tests;
drop policy if exists "mock_test_sections_select_active"
  on public.mock_test_sections;


-- ---------------------------------------------------------------------
-- Why there is no admin policy here
-- ---------------------------------------------------------------------

-- Admin writes are protected by server side requireAdmin plus the
-- service role client. They are deliberately NOT protected by a broad
-- authenticated RLS policy.
--
-- The reason is that the two checks are not interchangeable. Admin
-- membership is a comma separated list in the ADMIN_EMAILS environment
-- variable, which is server only and which a Postgres policy has no way
-- to read. The nearest thing a policy could express is "any signed in
-- user", and that is not the rule: it would hand every student in the
-- academy insert and update on every practice test, plus read access to
-- the staff internal_notes column. A policy that is much wider than the
-- rule it stands in for is worse than no policy, because it looks like
-- protection.
--
-- So the chain is:
--
--   1. RLS denies anon and authenticated on all four tables, by having
--      no policy for them. Postgres denies when nothing matches, so a
--      browser holding the anon key reads zero rows and writes nothing.
--   2. Every admin page and every admin server action calls requireAdmin
--      in src/lib/admin/require-admin.ts first. A server action is
--      reachable by direct POST, so a page level check alone would not
--      be enough.
--   3. Only after that does the code reach the service role client in
--      src/lib/supabase/admin.ts, which bypasses RLS. That module is
--      server only and throws if it is ever called in a browser.
--
-- The service role is the route precisely because the authorization
-- decision has already been made, in the one place that can make it.
-- When a database backed staff role lands, that becomes expressible as a
-- policy and this note is what should be revisited.


-- ---------------------------------------------------------------------
-- Learner policies, kept separate on purpose
-- ---------------------------------------------------------------------

-- Left as a draft rather than a live statement. This is the future
-- dynamic learner route's half of the problem, and it is kept apart from
-- the admin half above so that the two are never confused: the admin
-- path is service role, the learner path will be ordinary RLS.
--
-- Two things have to be settled before these become real:
--
--   1. internal_notes. A select policy is row level, not column level,
--      so a plain "published tests are readable" policy on mock_tests
--      would also hand a learner the staff notes on that row. The column
--      has to move to a side table, or the read has to go through a view
--      that omits it, before this is safe.
--   2. Every child table policy has to walk up to the test status at the
--      same time, or a learner reads the parts of a draft test through
--      mock_test_parts without ever touching mock_tests.
--
--   create policy "mock_tests_select_published"
--     on public.mock_tests for select
--     to anon, authenticated
--     using (status = 'published');
--
--   create policy "mock_test_sections_select_published"
--     on public.mock_test_sections for select
--     to anon, authenticated
--     using (exists (
--       select 1 from public.mock_tests t
--       where t.id = mock_test_sections.mock_test_id
--         and t.status = 'published'
--     ));
--
-- Do not enable either until a ticket actually publishes a test.
-- Publishing is blocked in ADMIN-01, so nothing is waiting on them.


-- =========================================================
-- End of ADMIN-01 migration
-- =========================================================
