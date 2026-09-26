-- ADMIN-02: mock test question, option, answer key and media link editor
-- Toronto Academy of Education CELPIP Preparation Program
-- Safe to run more than once.
--
-- ADMIN-01 created the structure tables in
-- 013_mock_test_builder_admin_foundation.sql: mock_tests,
-- mock_test_sections, mock_test_parts and mock_test_validation_issues.
-- It stopped deliberately before anything that carries a right answer.
--
-- ADMIN-02 adds the four tables that hold the content of a part:
--
--   mock_test_media_assets   an audio, video or image link on a part
--   mock_test_questions      one numbered question inside a part
--   mock_test_options        one answer option on a question
--   mock_test_answer_keys    the correct answer for a question
--
-- Source documents:
--   docs/tickets/ADMIN-02-question-answer-media-editor.md
--   docs/admin/mock-test-builder-database-blueprint.md
--   docs/admin/mock-test-builder-draft-schema.sql   (ADMIN-00 draft)
--   docs/admin/admin-01-mock-test-builder-mvp.md
--
-- CREATE OR REPAIR. Written the same way 013 had to be rewritten. All
-- four names below may already exist in the hosted database, carried
-- over from the earlier hardcoded Mock Test 1 work and from the ADMIN-00
-- draft schema, and their columns will not match the ones ADMIN-02
-- writes. So every "create table if not exists" is followed by an "add
-- column if not exists" block covering every column this ticket owns,
-- and by a block that lifts NOT NULL from any legacy required column
-- ADMIN-02 does not write. Without that second block, a table created
-- under the older draft shape would refuse every insert this ticket
-- makes, with a not-null violation on a column the admin forms have no
-- field for.
--
-- Nothing is dropped. No column is removed or retyped, no row is
-- deleted, and the existing Mock Test 1 data is untouched. Lifting a NOT
-- NULL removes a rule, never a value.
--
-- Every check constraint below is added only when no existing row would
-- violate it. A legacy row with an unexpected value must not fail the
-- whole migration, because that would leave the other three tables
-- unapplied. What it does instead is show up as a validation warning in
-- the admin preview, which is where an authoring problem belongs.
--
-- Deliberately NOT created here, because no code in ADMIN-02 reads or
-- writes them: mock_test_screens, mock_test_option_sets,
-- mock_test_timer_rules, mock_test_scoring_rules, mock_test_ai_rubrics
-- and the four student attempt tables. Each arrives with the ticket that
-- uses it.
--
-- ANSWER KEY RULE. mock_test_answer_keys is admin only. It gets no RLS
-- policy for anon or authenticated at all, so Postgres denies it by
-- default rather than relying on a using clause being written correctly.
-- No learner route reads it, and ADMIN-02 builds no learner route.
--
-- House style: normal hyphens only, no long hyphens or em dashes,
-- straight quotes only.


-- =========================================================
-- Shared updated_at trigger function
-- =========================================================

-- Identical to the definition in 002_auth_profile_trigger.sql and in
-- 013. Repeated with create or replace so this file can be pasted into
-- the SQL editor on its own without depending on run order.
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
-- Legacy NOT NULL repair helper
-- =========================================================

-- Lifts NOT NULL from every column on one of the four ADMIN-02 tables
-- that this ticket does not write and that has no default.
--
-- Why this exists. A table that already exists under the ADMIN-00 draft
-- shape carries required columns with different names: mock_test_part_id
-- rather than part_id on questions, position rather than display_order,
-- text rather than option_text on options. The admin forms have no field
-- for any of them, so every insert would be refused with a not-null
-- violation on a column a staff member cannot see or fill.
--
-- The repair is to stop requiring them. That is the smallest safe
-- change: a NOT NULL is a rule about future rows, so lifting it removes
-- no value from any existing row and deletes nothing. The columns
-- themselves stay, with their data, so anything still reading the older
-- shape keeps working.
--
-- The primary key is never touched, and neither is any column ADMIN-02
-- writes, which is what the owned list is for.
create or replace function public.admin02_relax_legacy_not_null(
  target_table text,
  owned_columns text[]
)
returns void
language plpgsql
set search_path = ''
as $$
declare
  legacy record;
begin
  for legacy in
    select a.attname
    from pg_attribute a
    join pg_class c on c.oid = a.attrelid
    join pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'public'
      and c.relname = target_table
      and a.attnum > 0
      and not a.attisdropped
      and a.attnotnull
      -- A column with a default fills itself in, so a NOT NULL on one of
      -- them blocks nothing.
      and not a.atthasdef
      and a.attname <> all (owned_columns)
      -- Never relax a primary key column.
      and not exists (
        select 1
        from pg_constraint pk
        where pk.conrelid = c.oid
          and pk.contype = 'p'
          and a.attnum = any (pk.conkey)
      )
  loop
    execute format(
      'alter table public.%I alter column %I drop not null',
      target_table,
      legacy.attname
    );

    raise notice
      'ADMIN-02: relaxed NOT NULL on legacy column public.%.%',
      target_table,
      legacy.attname;
  end loop;
end;
$$;


-- =========================================================
-- mock_test_media_assets
-- =========================================================

-- One media link on a part. ADMIN-02 stores a URL and never uploads a
-- file: every Mock Test 1 asset is already a Cloudinary URL, and file
-- upload is explicitly out of scope for this ticket.
--
-- The asset is scoped to a test, a section and a part, all three. The
-- part is what the editor works in; the other two are carried so a media
-- read can be scoped to a test without a two level join, and so a
-- misfiled asset is visible rather than implied.
--
-- transcript is staff facing in ADMIN-02. It becomes learner facing
-- accessibility text only when a ticket builds a learner route, and no
-- ticket has.
create table if not exists public.mock_test_media_assets (
  id uuid primary key default gen_random_uuid(),
  mock_test_id uuid references public.mock_tests (id) on delete cascade,
  section_id uuid references public.mock_test_sections (id) on delete cascade,
  part_id uuid references public.mock_test_parts (id) on delete cascade,
  media_type text not null,
  url text not null,
  title text,
  alt_text text,
  transcript text,
  -- Staff only. Never selected into a learner response.
  internal_notes text,
  display_order integer not null default 0,
  created_by uuid references auth.users (id),
  updated_by uuid references auth.users (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.mock_test_media_assets
  add column if not exists mock_test_id uuid
    references public.mock_tests (id) on delete cascade,
  add column if not exists section_id uuid
    references public.mock_test_sections (id) on delete cascade,
  add column if not exists part_id uuid
    references public.mock_test_parts (id) on delete cascade,
  add column if not exists media_type text,
  add column if not exists url text,
  add column if not exists title text,
  add column if not exists alt_text text,
  add column if not exists transcript text,
  add column if not exists internal_notes text,
  add column if not exists display_order integer not null default 0,
  add column if not exists created_by uuid references auth.users (id),
  add column if not exists updated_by uuid references auth.users (id),
  add column if not exists created_at timestamptz not null default now(),
  add column if not exists updated_at timestamptz not null default now();

select public.admin02_relax_legacy_not_null(
  'mock_test_media_assets',
  array[
    'mock_test_id', 'section_id', 'part_id', 'media_type', 'url',
    'title', 'alt_text', 'transcript', 'internal_notes', 'display_order',
    'created_by', 'updated_by', 'created_at', 'updated_at'
  ]
);

-- media_type and url are required by this ticket, so they are set NOT
-- NULL here rather than in the create above, which does nothing on a
-- table that already exists. Guarded, because a legacy table may hold
-- rows with a null in either column and the alter would fail on them.
-- When it does, the missing value is reported by validatePartContent
-- instead, which is the same warning a staff member gets for a media row
-- with no URL.
do $$
begin
  if not exists (
    select 1 from public.mock_test_media_assets where media_type is null
  ) then
    alter table public.mock_test_media_assets
      alter column media_type set not null;
  else
    raise notice
      'ADMIN-02: mock_test_media_assets.media_type left nullable, existing rows hold nulls';
  end if;

  if not exists (
    select 1 from public.mock_test_media_assets where url is null
  ) then
    alter table public.mock_test_media_assets
      alter column url set not null;
  else
    raise notice
      'ADMIN-02: mock_test_media_assets.url left nullable, existing rows hold nulls';
  end if;
end
$$;

-- Constraints are added separately so a partially applied earlier run
-- can be brought up to date without dropping the table.
--
-- The media_type list is the one the ADMIN-02 ticket names. It is
-- broader and plainer than the ADMIN-00 draft list, which named a
-- purpose rather than a format: a staff member pasting a link knows they
-- have an audio file, not that it is an audio_passage.
do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'mock_test_media_assets_type_check'
  ) then
    if not exists (
      select 1 from public.mock_test_media_assets
      where media_type is not null
        and media_type not in (
          'audio', 'video', 'image', 'thumbnail', 'document', 'other'
        )
    ) then
      alter table public.mock_test_media_assets
        add constraint mock_test_media_assets_type_check
        check (media_type in (
          'audio', 'video', 'image', 'thumbnail', 'document', 'other'
        ));
    else
      raise notice
        'ADMIN-02: mock_test_media_assets_type_check skipped, existing rows use other media types';
    end if;
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'mock_test_media_assets_url_present_check'
  ) then
    if not exists (
      select 1 from public.mock_test_media_assets
      where url is not null and length(trim(url)) = 0
    ) then
      alter table public.mock_test_media_assets
        add constraint mock_test_media_assets_url_present_check
        check (url is null or length(trim(url)) > 0);
    else
      raise notice
        'ADMIN-02: mock_test_media_assets_url_present_check skipped, existing rows hold a blank url';
    end if;
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'mock_test_media_assets_display_order_check'
  ) then
    if not exists (
      select 1 from public.mock_test_media_assets where display_order < 0
    ) then
      alter table public.mock_test_media_assets
        add constraint mock_test_media_assets_display_order_check
        check (display_order >= 0);
    else
      raise notice
        'ADMIN-02: mock_test_media_assets_display_order_check skipped, existing rows hold a negative order';
    end if;
  end if;
end
$$;

create index if not exists mock_test_media_assets_part_idx
  on public.mock_test_media_assets (part_id, display_order);

create index if not exists mock_test_media_assets_test_idx
  on public.mock_test_media_assets (mock_test_id, media_type);

drop trigger if exists mock_test_media_assets_set_updated_at
  on public.mock_test_media_assets;

create trigger mock_test_media_assets_set_updated_at
  before update on public.mock_test_media_assets
  for each row
  execute function public.set_updated_at();


-- =========================================================
-- mock_test_questions
-- =========================================================

-- One numbered question inside a part.
--
-- There is deliberately no is_correct column here, and none on the
-- options either. Correctness lives in mock_test_answer_keys alone, so
-- the rows a future learner route would select can be read without the
-- query ever being able to touch a key.
--
-- passage_text sits on the question for ADMIN-02. Reading Part 1 repeats
-- the same passage across eleven questions, which is duplication, and
-- the fix is a shared passage row that a later ticket adds. Storing it
-- per question first is the smaller step and keeps the editor to one
-- form.
--
-- status is draft or ready and describes the authoring state of the
-- question only. It grants no learner visibility: no learner route reads
-- this table, and publishing stays blocked.
create table if not exists public.mock_test_questions (
  id uuid primary key default gen_random_uuid(),
  mock_test_id uuid references public.mock_tests (id) on delete cascade,
  section_id uuid references public.mock_test_sections (id) on delete cascade,
  part_id uuid references public.mock_test_parts (id) on delete cascade,
  question_type text not null,
  question_number integer not null,
  prompt text,
  instruction text,
  passage_text text,
  stem text,
  helper_text text,
  media_asset_id uuid
    references public.mock_test_media_assets (id) on delete set null,
  points integer not null default 1,
  display_order integer not null default 0,
  is_required boolean not null default true,
  status text not null default 'draft',
  created_by uuid references auth.users (id),
  updated_by uuid references auth.users (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.mock_test_questions
  add column if not exists mock_test_id uuid
    references public.mock_tests (id) on delete cascade,
  add column if not exists section_id uuid
    references public.mock_test_sections (id) on delete cascade,
  add column if not exists part_id uuid
    references public.mock_test_parts (id) on delete cascade,
  add column if not exists question_type text,
  add column if not exists question_number integer,
  add column if not exists prompt text,
  add column if not exists instruction text,
  add column if not exists passage_text text,
  add column if not exists stem text,
  add column if not exists helper_text text,
  add column if not exists media_asset_id uuid
    references public.mock_test_media_assets (id) on delete set null,
  add column if not exists points integer not null default 1,
  add column if not exists display_order integer not null default 0,
  add column if not exists is_required boolean not null default true,
  add column if not exists status text not null default 'draft',
  add column if not exists created_by uuid references auth.users (id),
  add column if not exists updated_by uuid references auth.users (id),
  add column if not exists created_at timestamptz not null default now(),
  add column if not exists updated_at timestamptz not null default now();

select public.admin02_relax_legacy_not_null(
  'mock_test_questions',
  array[
    'mock_test_id', 'section_id', 'part_id', 'question_type',
    'question_number', 'prompt', 'instruction', 'passage_text', 'stem',
    'helper_text', 'media_asset_id', 'points', 'display_order',
    'is_required', 'status', 'created_by', 'updated_by', 'created_at',
    'updated_at'
  ]
);

do $$
begin
  if not exists (
    select 1 from public.mock_test_questions where question_type is null
  ) then
    alter table public.mock_test_questions
      alter column question_type set not null;
  else
    raise notice
      'ADMIN-02: mock_test_questions.question_type left nullable, existing rows hold nulls';
  end if;

  if not exists (
    select 1 from public.mock_test_questions where question_number is null
  ) then
    alter table public.mock_test_questions
      alter column question_number set not null;
  else
    raise notice
      'ADMIN-02: mock_test_questions.question_number left nullable, existing rows hold nulls';
  end if;
end
$$;

-- The five question types ADMIN-02 supports. All five are objective
-- Listening or Reading shapes, which is the slice this ticket targets.
-- Writing and Speaking prompt types arrive with ADMIN-03, and this
-- constraint is what stops one being authored here by accident before
-- the rubric editor that owns it exists.
--
-- There is deliberately NO unique constraint on
-- (part_id, question_number). Two questions sharing a number is an
-- authoring mistake, but refusing the write would make renumbering
-- impossible: swapping question 3 and question 4 has to pass through a
-- state where two rows share a number. It is reported as a validation
-- warning instead, which is the same choice ADMIN-01 made for section
-- and part order.
do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'mock_test_questions_type_check'
  ) then
    if not exists (
      select 1 from public.mock_test_questions
      where question_type is not null
        and question_type not in (
          'single_choice',
          'dropdown_sentence_completion',
          'reading_correspondence_choice',
          'reading_information_choice',
          'reading_viewpoints_choice'
        )
    ) then
      alter table public.mock_test_questions
        add constraint mock_test_questions_type_check
        check (question_type in (
          'single_choice',
          'dropdown_sentence_completion',
          'reading_correspondence_choice',
          'reading_information_choice',
          'reading_viewpoints_choice'
        ));
    else
      raise notice
        'ADMIN-02: mock_test_questions_type_check skipped, existing rows use other question types';
    end if;
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'mock_test_questions_number_check'
  ) then
    if not exists (
      select 1 from public.mock_test_questions
      where question_number is not null and question_number < 1
    ) then
      alter table public.mock_test_questions
        add constraint mock_test_questions_number_check
        check (question_number is null or question_number >= 1);
    else
      raise notice
        'ADMIN-02: mock_test_questions_number_check skipped, existing rows hold a number below 1';
    end if;
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'mock_test_questions_points_check'
  ) then
    if not exists (
      select 1 from public.mock_test_questions
      where points < 0 or points > 100
    ) then
      alter table public.mock_test_questions
        add constraint mock_test_questions_points_check
        check (points >= 0 and points <= 100);
    else
      raise notice
        'ADMIN-02: mock_test_questions_points_check skipped, existing rows hold points outside 0 to 100';
    end if;
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'mock_test_questions_display_order_check'
  ) then
    if not exists (
      select 1 from public.mock_test_questions where display_order < 0
    ) then
      alter table public.mock_test_questions
        add constraint mock_test_questions_display_order_check
        check (display_order >= 0);
    else
      raise notice
        'ADMIN-02: mock_test_questions_display_order_check skipped, existing rows hold a negative order';
    end if;
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'mock_test_questions_status_check'
  ) then
    if not exists (
      select 1 from public.mock_test_questions
      where status is not null and status not in ('draft', 'ready')
    ) then
      alter table public.mock_test_questions
        add constraint mock_test_questions_status_check
        check (status in ('draft', 'ready'));
    else
      raise notice
        'ADMIN-02: mock_test_questions_status_check skipped, existing rows use other statuses';
    end if;
  end if;
end
$$;

create index if not exists mock_test_questions_part_idx
  on public.mock_test_questions (part_id, display_order);

create index if not exists mock_test_questions_test_idx
  on public.mock_test_questions (mock_test_id);

create index if not exists mock_test_questions_media_idx
  on public.mock_test_questions (media_asset_id);

drop trigger if exists mock_test_questions_set_updated_at
  on public.mock_test_questions;

create trigger mock_test_questions_set_updated_at
  before update on public.mock_test_questions
  for each row
  execute function public.set_updated_at();


-- =========================================================
-- mock_test_options
-- =========================================================

-- One answer option on one question.
--
-- No is_correct column, on purpose. See the note on mock_test_questions
-- above: the whole point of the separation is that a route can select
-- every option a learner needs without the query being able to reach a
-- key.
--
-- option_label is the letter a learner sees, normally A to D. It is
-- stored rather than derived from the display order, because a dropdown
-- completion item does not use letters at all, and because reordering
-- options should not silently relabel them.
--
-- No unique constraint on (question_id, option_label), for the same
-- reason questions have none on their number: reordering has to pass
-- through a duplicate. Reported as a validation warning instead.
create table if not exists public.mock_test_options (
  id uuid primary key default gen_random_uuid(),
  question_id uuid
    references public.mock_test_questions (id) on delete cascade,
  option_label text not null,
  option_text text not null,
  display_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.mock_test_options
  add column if not exists question_id uuid
    references public.mock_test_questions (id) on delete cascade,
  add column if not exists option_label text,
  add column if not exists option_text text,
  add column if not exists display_order integer not null default 0,
  add column if not exists created_at timestamptz not null default now(),
  add column if not exists updated_at timestamptz not null default now();

select public.admin02_relax_legacy_not_null(
  'mock_test_options',
  array[
    'question_id', 'option_label', 'option_text', 'display_order',
    'created_at', 'updated_at'
  ]
);

do $$
begin
  if not exists (
    select 1 from public.mock_test_options where option_label is null
  ) then
    alter table public.mock_test_options
      alter column option_label set not null;
  else
    raise notice
      'ADMIN-02: mock_test_options.option_label left nullable, existing rows hold nulls';
  end if;

  if not exists (
    select 1 from public.mock_test_options where option_text is null
  ) then
    alter table public.mock_test_options
      alter column option_text set not null;
  else
    raise notice
      'ADMIN-02: mock_test_options.option_text left nullable, existing rows hold nulls';
  end if;
end
$$;

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'mock_test_options_label_present_check'
  ) then
    if not exists (
      select 1 from public.mock_test_options
      where option_label is not null and length(trim(option_label)) = 0
    ) then
      alter table public.mock_test_options
        add constraint mock_test_options_label_present_check
        check (option_label is null or length(trim(option_label)) > 0);
    else
      raise notice
        'ADMIN-02: mock_test_options_label_present_check skipped, existing rows hold a blank label';
    end if;
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'mock_test_options_text_present_check'
  ) then
    if not exists (
      select 1 from public.mock_test_options
      where option_text is not null and length(trim(option_text)) = 0
    ) then
      alter table public.mock_test_options
        add constraint mock_test_options_text_present_check
        check (option_text is null or length(trim(option_text)) > 0);
    else
      raise notice
        'ADMIN-02: mock_test_options_text_present_check skipped, existing rows hold blank text';
    end if;
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'mock_test_options_display_order_check'
  ) then
    if not exists (
      select 1 from public.mock_test_options where display_order < 0
    ) then
      alter table public.mock_test_options
        add constraint mock_test_options_display_order_check
        check (display_order >= 0);
    else
      raise notice
        'ADMIN-02: mock_test_options_display_order_check skipped, existing rows hold a negative order';
    end if;
  end if;
end
$$;

create index if not exists mock_test_options_question_idx
  on public.mock_test_options (question_id, display_order);

drop trigger if exists mock_test_options_set_updated_at
  on public.mock_test_options;

create trigger mock_test_options_set_updated_at
  before update on public.mock_test_options
  for each row
  execute function public.set_updated_at();


-- =========================================================
-- mock_test_answer_keys
-- =========================================================

-- ADMIN ONLY. The correct answer for one question.
--
-- This is the table where a mistake hands a learner the answers, so it
-- carries the strictest rule in the file: no RLS policy for anon or
-- authenticated at all. Not a filtered policy, none. Postgres denies when
-- nothing matches, so the absence is the enforcement.
--
-- One row per question, which is what makes setMockTestAnswerKey an
-- upsert rather than an append. correct_option_id is nullable, so a
-- staff member can record an explanation and come back to the option
-- later, and validatePartContent reports the gap.
--
-- correct_option_id uses on delete set null rather than restrict. A
-- question delete cascades to its options and to its key at the same
-- time, and restrict would make the order of those two cascades matter.
-- Deleting an option that is currently the correct answer is refused in
-- deleteMockTestOption instead, where the message can say why.
--
-- points here is what the question is worth when it is marked. It
-- duplicates mock_test_questions.points on purpose: the question value
-- is the authoring default, and the key value is what a marker uses, so
-- a later scoring ticket can change one without silently changing the
-- other.
create table if not exists public.mock_test_answer_keys (
  id uuid primary key default gen_random_uuid(),
  question_id uuid
    references public.mock_test_questions (id) on delete cascade,
  correct_option_id uuid
    references public.mock_test_options (id) on delete set null,
  correct_text text,
  explanation text,
  points integer not null default 1,
  created_by uuid references auth.users (id),
  updated_by uuid references auth.users (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.mock_test_answer_keys
  add column if not exists question_id uuid
    references public.mock_test_questions (id) on delete cascade,
  add column if not exists correct_option_id uuid
    references public.mock_test_options (id) on delete set null,
  add column if not exists correct_text text,
  add column if not exists explanation text,
  add column if not exists points integer not null default 1,
  add column if not exists created_by uuid references auth.users (id),
  add column if not exists updated_by uuid references auth.users (id),
  add column if not exists created_at timestamptz not null default now(),
  add column if not exists updated_at timestamptz not null default now();

-- id REPAIR. The create table above declares id, but it only runs when
-- the table is absent. The hosted database already carried a legacy
-- mock_test_answer_keys from the earlier hardcoded Mock Test 1 work, and
-- that older shape was keyed on question_id alone with no id column at
-- all. The add column block above covers every other column this ticket
-- owns and skipped id, so on the hosted database the table stayed
-- without one, and the question editor crashed the moment it read a key
-- back by id.
--
-- So id is added the same way every other column here is: only when it
-- is missing, filled in for rows that predate it, then required. The
-- default is set explicitly as well, because a legacy table could carry
-- an id column with no default and every insert would fail on it.
--
-- question_id is untouched. It keeps its data, its foreign key and its
-- one-key-per-question unique index below, so anything already reading a
-- key by question_id keeps working exactly as it did.
alter table public.mock_test_answer_keys
  add column if not exists id uuid default gen_random_uuid();

alter table public.mock_test_answer_keys
  alter column id set default gen_random_uuid();

update public.mock_test_answer_keys
  set id = gen_random_uuid()
  where id is null;

do $$
begin
  if not exists (
    select 1 from public.mock_test_answer_keys where id is null
  ) then
    alter table public.mock_test_answer_keys
      alter column id set not null;
  else
    raise notice
      'ADMIN-02: mock_test_answer_keys.id left nullable, existing rows hold nulls';
  end if;
end
$$;

-- A unique index rather than a primary key. A legacy table may already
-- have a primary key on question_id, and adding a second one would fail
-- the whole file; a unique index gives id the guarantee the editor needs
-- without touching the key the old rows were built on.
create unique index if not exists mock_test_answer_keys_id_unique
  on public.mock_test_answer_keys (id);


select public.admin02_relax_legacy_not_null(
  'mock_test_answer_keys',
  array[
    'id', 'question_id', 'correct_option_id', 'correct_text', 'explanation',
    'points', 'created_by', 'updated_by', 'created_at', 'updated_at'
  ]
);

do $$
begin
  if not exists (
    select 1 from public.mock_test_answer_keys where question_id is null
  ) then
    alter table public.mock_test_answer_keys
      alter column question_id set not null;
  else
    raise notice
      'ADMIN-02: mock_test_answer_keys.question_id left nullable, existing rows hold nulls';
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'mock_test_answer_keys_points_check'
  ) then
    if not exists (
      select 1 from public.mock_test_answer_keys
      where points < 0 or points > 100
    ) then
      alter table public.mock_test_answer_keys
        add constraint mock_test_answer_keys_points_check
        check (points >= 0 and points <= 100);
    else
      raise notice
        'ADMIN-02: mock_test_answer_keys_points_check skipped, existing rows hold points outside 0 to 100';
    end if;
  end if;
end
$$;

-- One key per question. Added as a unique index rather than assumed, and
-- skipped when a legacy table already holds two keys for the same
-- question, because failing the whole migration over old duplicate rows
-- would leave every other table in this file unapplied.
--
-- setMockTestAnswerKey reads before it writes rather than relying on
-- this index existing, so the editor behaves the same either way.
do $$
begin
  if not exists (
    select 1 from pg_class
    where relname = 'mock_test_answer_keys_question_key'
  ) then
    if not exists (
      select question_id
      from public.mock_test_answer_keys
      where question_id is not null
      group by question_id
      having count(*) > 1
    ) then
      create unique index mock_test_answer_keys_question_key
        on public.mock_test_answer_keys (question_id);
    else
      raise notice
        'ADMIN-02: mock_test_answer_keys_question_key skipped, existing rows hold more than one key per question';
    end if;
  end if;
end
$$;

create index if not exists mock_test_answer_keys_option_idx
  on public.mock_test_answer_keys (correct_option_id);

drop trigger if exists mock_test_answer_keys_set_updated_at
  on public.mock_test_answer_keys;

create trigger mock_test_answer_keys_set_updated_at
  before update on public.mock_test_answer_keys
  for each row
  execute function public.set_updated_at();


-- =========================================================
-- Row level security
-- =========================================================

-- Deny by default, exactly as ADMIN-01 did for its four tables.
--
-- RLS is enabled on all four tables here and NO policy is created for
-- anon or authenticated. Postgres denies when no policy matches, so a
-- learner session holding the anon key reads zero rows from any of them
-- and can write nothing. That covers every ADMIN-02 requirement at once:
-- answer keys are unreachable, draft content is unreachable, the staff
-- internal notes on a media row are unreachable, and no public dynamic
-- mock test route can exist because there is no readable data behind
-- one.
--
-- Admin writes are protected by server side requireAdmin plus the
-- service role client. They are deliberately NOT protected by a broad
-- authenticated write policy. The two are not interchangeable: admin
-- membership is a comma separated list in the server only ADMIN_EMAILS
-- environment variable, which a Postgres policy has no way to read, so
-- the nearest a policy could get is "any signed in user". That is not
-- the rule. On these four tables it would hand every student in the
-- academy the answer keys.
--
-- The chain is:
--
--   1. RLS denies anon and authenticated on all four tables, by having
--      no policy for them.
--   2. Every admin page and every admin server action calls requireAdmin
--      in src/lib/admin/require-admin.ts first. A server action is
--      reachable by direct POST, so a page level check alone would not
--      be enough.
--   3. Only after that does the code reach the service role client in
--      src/lib/supabase/admin.ts, which bypasses RLS. That module is
--      server only and throws if it is ever called in a browser.
--
-- Learner dynamic policies will be added later, when the dynamic runner
-- is built. They are not drafted here for mock_test_answer_keys at all,
-- because that table is never getting one.

alter table public.mock_test_media_assets enable row level security;
alter table public.mock_test_questions enable row level security;
alter table public.mock_test_options enable row level security;
alter table public.mock_test_answer_keys enable row level security;


-- ---------------------------------------------------------------------
-- Remove any stale learner policy on these four tables
-- ---------------------------------------------------------------------

-- The hosted database may carry select policies created before this
-- ticket, alongside the two ADMIN-01 dropped from mock_tests and
-- mock_test_sections. Any of them would refer to the old 'active' status
-- that mock_tests_status_check now refuses, so none can match a row, but
-- a dead policy that reads like live learner access is the worst thing
-- to leave behind on a table that holds answer keys.
--
-- Dropping a policy removes a rule, not a row. No data is touched, and a
-- policy that was never there makes this a no-op.
drop policy if exists "mock_test_questions_select_active"
  on public.mock_test_questions;
drop policy if exists "mock_test_options_select_active"
  on public.mock_test_options;
drop policy if exists "mock_test_media_assets_select_active"
  on public.mock_test_media_assets;
drop policy if exists "mock_test_answer_keys_select_active"
  on public.mock_test_answer_keys;


-- ---------------------------------------------------------------------
-- Learner policies, kept as a draft on purpose
-- ---------------------------------------------------------------------

-- Left as a comment rather than a live statement, the same way ADMIN-01
-- left its own. This is the future dynamic learner route's half of the
-- problem, and ADMIN-02 does not build that route.
--
-- Three things have to be settled before these become real:
--
--   1. Every child table policy has to walk up to the test status, or a
--      learner reads the questions of a draft test through
--      mock_test_questions without ever touching mock_tests.
--   2. internal_notes on mock_test_media_assets is staff only, and a
--      select policy is row level rather than column level, so the read
--      has to go through a view that omits it.
--   3. mock_test_answer_keys is excluded from all of this. It never gets
--      a learner policy. Marking runs server side.
--
--   create policy "mock_test_questions_select_published"
--     on public.mock_test_questions for select
--     to anon, authenticated
--     using (exists (
--       select 1 from public.mock_tests t
--       where t.id = mock_test_questions.mock_test_id
--         and t.status = 'published'
--     ));
--
-- Do not enable any of these until a ticket actually publishes a test
-- and a dynamic learner runner exists to read them. Publishing is still
-- blocked, so nothing is waiting on them.


-- =========================================================
-- Clean up the repair helper
-- =========================================================

-- The helper exists only for the run of this migration. Leaving a
-- function that can drop NOT NULL from an arbitrary table sitting in the
-- schema is not something to do casually, so it is removed once the four
-- tables above have used it. Dropping a function removes no data.
drop function if exists public.admin02_relax_legacy_not_null(text, text[]);


-- =========================================================
-- After running this file
-- =========================================================

-- Reload the PostgREST schema cache, or the new columns stay invisible
-- to the admin client and every write is refused with PGRST204:
--
--   notify pgrst, 'reload schema';


-- =========================================================
-- End of ADMIN-02 migration
-- =========================================================
