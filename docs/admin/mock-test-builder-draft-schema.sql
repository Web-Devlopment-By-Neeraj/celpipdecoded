-- =====================================================================
-- DRAFT SCHEMA - NOT A MIGRATION - DO NOT RUN
-- =====================================================================
--
-- ADMIN-00 mock test builder draft schema.
--
-- THIS FILE IS A DRAFT. It is deliberately NOT in supabase/migrations/.
-- It has NOT been applied to hosted Supabase and MUST NOT be applied
-- until a later ticket explicitly approves it. Nothing in the running
-- application reads any table defined below, because none of them
-- exists.
--
-- Companion documents:
--   docs/admin/mock-test-builder-database-blueprint.md  - the entities
--   docs/admin/mock-test-builder-workflow.md            - the workflow
--   docs/admin/mock-test-1-manual-to-admin-map.md       - the mapping
--
-- Conventions, matching supabase/migrations/001_academy_foundation.sql:
--   - public schema
--   - uuid primary keys with gen_random_uuid()
--   - created_at and updated_at timestamptz defaulting to now()
--   - enumerated values as text with a check constraint, not as
--     Postgres enum types, because a check constraint can be changed in
--     one statement while a vocabulary is still settling
--   - row level security enabled on every table
--
-- Row level security policies are written as COMMENTS ONLY at the foot
-- of this file. They are draft intent, not statements to execute.
--
-- House style: normal hyphens only, no long hyphens or em dashes,
-- straight quotes only.
-- =====================================================================


-- =====================================================================
-- Shared trigger for updated_at
-- =====================================================================

-- DRAFT. Applied to every authored content table below.
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;


-- =====================================================================
-- 1. mock_tests
-- =====================================================================

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
  source_note text,
  created_by uuid references auth.users (id),
  updated_by uuid references auth.users (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint mock_tests_status_check
    check (status in ('draft', 'ready_for_review', 'published', 'archived')),
  constraint mock_tests_version_check
    check (version >= 1),
  -- A published test must record when it was published.
  constraint mock_tests_published_at_check
    check (status <> 'published' or published_at is not null)
);

create index if not exists mock_tests_status_idx
  on public.mock_tests (status);

create trigger mock_tests_set_updated_at
  before update on public.mock_tests
  for each row execute function public.set_updated_at();


-- =====================================================================
-- 2. mock_test_sections
-- =====================================================================

create table if not exists public.mock_test_sections (
  id uuid primary key default gen_random_uuid(),
  mock_test_id uuid not null
    references public.mock_tests (id) on delete cascade,
  skill text not null,
  position integer not null,
  title text not null,
  instruction_text text,
  instruction_lines jsonb not null default '[]'::jsonb,
  -- Nullable. Points at a shared academy asset, not a per test upload.
  instruction_video_asset_id uuid,
  -- Display only. The clock a learner runs against is a timer rule.
  estimated_duration_seconds integer,
  scoring_rule_id uuid,
  status text not null default 'draft',
  created_by uuid references auth.users (id),
  updated_by uuid references auth.users (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint mock_test_sections_skill_check
    check (skill in ('listening', 'reading', 'writing', 'speaking')),
  constraint mock_test_sections_status_check
    check (status in ('draft', 'ready')),
  constraint mock_test_sections_position_check
    check (position >= 1),
  constraint mock_test_sections_unique_skill
    unique (mock_test_id, skill),
  constraint mock_test_sections_unique_position
    unique (mock_test_id, position)
);

create index if not exists mock_test_sections_test_idx
  on public.mock_test_sections (mock_test_id);

create trigger mock_test_sections_set_updated_at
  before update on public.mock_test_sections
  for each row execute function public.set_updated_at();


-- =====================================================================
-- Option sets
-- =====================================================================
--
-- Not one of the sixteen named entities. A shared option set needs a
-- parent row, and Reading Part 3 needs a shared option set: nine
-- statements draw from one A to E list rather than each carrying five
-- options of its own. Called out in the blueprint rather than added
-- silently.

create table if not exists public.mock_test_option_sets (
  id uuid primary key default gen_random_uuid(),
  mock_test_id uuid not null
    references public.mock_tests (id) on delete cascade,
  label text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger mock_test_option_sets_set_updated_at
  before update on public.mock_test_option_sets
  for each row execute function public.set_updated_at();


-- =====================================================================
-- 3. mock_test_parts
-- =====================================================================

create table if not exists public.mock_test_parts (
  id uuid primary key default gen_random_uuid(),
  mock_test_section_id uuid not null
    references public.mock_test_sections (id) on delete cascade,
  position integer not null,
  part_type text not null,
  title text not null,
  subtitle text,
  format_label text,
  instruction_lines jsonb not null default '[]'::jsonb,

  -- Scenario and context screen.
  scenario_instruction text,
  scenario_heading text,
  scenario_text text,
  scenario_image_asset_id uuid,
  question_instruction text,
  media_instruction text,

  -- Reading passage. Text, never an image: a passage has to stay
  -- selectable, scrollable and readable by assistive technology.
  passage_label text,
  passage_heading text,
  passage_paragraphs jsonb not null default '[]'::jsonb,
  passage_sign_off jsonb not null default '[]'::jsonb,

  -- Writing task fields.
  prompt_requirements jsonb not null default '[]'::jsonb,
  word_min integer,
  word_max integer,
  editor_placeholder text,

  -- Speaking task fields.
  visual_kind text,

  -- Reading Part 3 shared option list.
  option_set_id uuid
    references public.mock_test_option_sets (id) on delete set null,

  answer_explanation_asset_id uuid,
  is_scored boolean not null default true,
  known_gap_note text,

  created_by uuid references auth.users (id),
  updated_by uuid references auth.users (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint mock_test_parts_position_check
    check (position >= 1),
  constraint mock_test_parts_part_type_check
    check (part_type in (
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
    )),
  constraint mock_test_parts_visual_kind_check
    check (visual_kind is null or visual_kind in ('scene', 'option-cards')),
  constraint mock_test_parts_word_target_check
    check (word_min is null or word_max is null or word_min <= word_max),
  constraint mock_test_parts_unique_position
    unique (mock_test_section_id, position)
);

create index if not exists mock_test_parts_section_idx
  on public.mock_test_parts (mock_test_section_id);

create trigger mock_test_parts_set_updated_at
  before update on public.mock_test_parts
  for each row execute function public.set_updated_at();


-- =====================================================================
-- 4. mock_test_screens
-- =====================================================================
--
-- The materialised screen run for a part. Created from the part type's
-- default flow and editable afterwards. This is what makes Listening
-- Parts 1 to 3 expressible: three media screens interleaved with eight
-- question screens in one part.

create table if not exists public.mock_test_screens (
  id uuid primary key default gen_random_uuid(),
  mock_test_part_id uuid not null
    references public.mock_test_parts (id) on delete cascade,
  position integer not null,
  screen_type text not null,
  title text,
  body_text text,
  helper_text text,
  media_asset_id uuid,
  timer_rule_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint mock_test_screens_position_check
    check (position >= 1),
  constraint mock_test_screens_screen_type_check
    check (screen_type in (
      'instruction_text',
      'instruction_video',
      'listening_context',
      'listening_audio',
      'listening_video',
      'listening_question_radio',
      'listening_question_dropdown',
      'reading_split',
      'writing_task',
      'speaking_prep',
      'speaking_recording',
      'speaking_option_choice',
      'answer_review',
      'score_summary',
      'section_end',
      'reference_standards',
      'transition'
    )),
  constraint mock_test_screens_unique_position
    unique (mock_test_part_id, position)
);

create index if not exists mock_test_screens_part_idx
  on public.mock_test_screens (mock_test_part_id);

create trigger mock_test_screens_set_updated_at
  before update on public.mock_test_screens
  for each row execute function public.set_updated_at();


-- =====================================================================
-- 5. mock_test_questions
-- =====================================================================

create table if not exists public.mock_test_questions (
  id uuid primary key default gen_random_uuid(),
  mock_test_part_id uuid not null
    references public.mock_test_parts (id) on delete cascade,
  -- Which screen prints it. Null until the screen run is built.
  mock_test_screen_id uuid
    references public.mock_test_screens (id) on delete set null,
  position integer not null,
  question_type text not null,

  -- The whole question, for a radio item, or the task instruction for a
  -- Writing or Speaking task.
  prompt text,
  -- Statement text either side of the blank, for a completion item.
  text_before text,
  text_after text,

  question_audio_asset_id uuid,
  image_asset_id uuid,
  option_set_id uuid
    references public.mock_test_option_sets (id) on delete set null,

  -- Authoring aid only. Never rendered to a learner.
  cognitive_type text,
  explanation text,
  is_scored boolean not null default true,

  created_by uuid references auth.users (id),
  updated_by uuid references auth.users (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint mock_test_questions_position_check
    check (position >= 1),
  constraint mock_test_questions_type_check
    check (question_type in (
      'single_choice',
      'dropdown_sentence_completion',
      'video_listening_choice',
      'reading_correspondence_choice',
      'reading_diagram_choice',
      'reading_information_choice',
      'reading_viewpoints_choice',
      'writing_email_response',
      'writing_survey_response',
      'speaking_recorded_response',
      'speaking_image_response',
      'speaking_option_response'
    )),
  constraint mock_test_questions_cognitive_type_check
    check (cognitive_type is null or cognitive_type in (
      'general_meaning',
      'specific_information',
      'inference'
    )),
  -- A question needs some prompt text. Either a whole prompt, or the
  -- text before its blank.
  constraint mock_test_questions_prompt_present_check
    check (
      coalesce(nullif(trim(prompt), ''), nullif(trim(text_before), ''))
        is not null
    ),
  constraint mock_test_questions_unique_position
    unique (mock_test_part_id, position)
);

create index if not exists mock_test_questions_part_idx
  on public.mock_test_questions (mock_test_part_id);

create index if not exists mock_test_questions_screen_idx
  on public.mock_test_questions (mock_test_screen_id);

create trigger mock_test_questions_set_updated_at
  before update on public.mock_test_questions
  for each row execute function public.set_updated_at();


-- =====================================================================
-- 6. mock_test_options
-- =====================================================================
--
-- There is deliberately no is_correct column. Correctness lives in
-- mock_test_answer_keys, so the options a learner's browser receives
-- can be selected without the query ever touching the key.

create table if not exists public.mock_test_options (
  id uuid primary key default gen_random_uuid(),
  mock_test_question_id uuid
    references public.mock_test_questions (id) on delete cascade,
  option_set_id uuid
    references public.mock_test_option_sets (id) on delete cascade,
  position integer not null,
  label text,
  text text not null,
  -- Speaking Task 5 option cards carry a picture.
  image_asset_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint mock_test_options_position_check
    check (position >= 1),
  constraint mock_test_options_text_check
    check (length(trim(text)) > 0),
  -- Exactly one parent: a question, or a shared option set.
  constraint mock_test_options_one_parent_check
    check (
      (mock_test_question_id is not null and option_set_id is null)
      or (mock_test_question_id is null and option_set_id is not null)
    )
);

create index if not exists mock_test_options_question_idx
  on public.mock_test_options (mock_test_question_id);

create index if not exists mock_test_options_set_idx
  on public.mock_test_options (option_set_id);

create trigger mock_test_options_set_updated_at
  before update on public.mock_test_options
  for each row execute function public.set_updated_at();


-- =====================================================================
-- 7. mock_test_answer_keys
-- =====================================================================
--
-- ADMIN ONLY. This table is never readable by a learner role. Row level
-- security grants it no policy for `authenticated` at all, so RLS denies
-- it by default rather than relying on a using clause being written
-- correctly. Marking runs server side with the service role client.

create table if not exists public.mock_test_answer_keys (
  id uuid primary key default gen_random_uuid(),
  mock_test_question_id uuid not null unique
    references public.mock_test_questions (id) on delete cascade,
  -- Null means the key is known to be missing. Publishing rejects it.
  correct_option_id uuid
    references public.mock_test_options (id) on delete restrict,
  score_value integer not null default 1,
  explanation text,
  source text not null default 'staff-entered',
  note text,
  created_by uuid references auth.users (id),
  updated_by uuid references auth.users (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint mock_test_answer_keys_source_check
    check (source in ('document', 'answer-image', 'staff-entered')),
  constraint mock_test_answer_keys_score_value_check
    check (score_value >= 0)
);

create index if not exists mock_test_answer_keys_option_idx
  on public.mock_test_answer_keys (correct_option_id);

create trigger mock_test_answer_keys_set_updated_at
  before update on public.mock_test_answer_keys
  for each row execute function public.set_updated_at();

-- Draft integrity note, not enforceable as a simple check constraint:
-- correct_option_id must belong to the same question, or to that
-- question's shared option set. Enforce with a trigger or as
-- validation rule 10 in the workflow document. Left as validation for
-- now, because a trigger that fires on every option edit would make
-- reordering options expensive.


-- =====================================================================
-- 8. mock_test_media_assets
-- =====================================================================
--
-- Assets are referenced, never re-hosted. mock_test_id is nullable: a
-- null means a shared academy asset such as a section instruction
-- video, which is how instructional-video-assets.ts already works.

create table if not exists public.mock_test_media_assets (
  id uuid primary key default gen_random_uuid(),
  mock_test_id uuid
    references public.mock_tests (id) on delete cascade,
  media_type text not null,
  url text not null,
  cloud_name text,
  title text,
  alt_text text,
  transcript text,
  duration_label text,
  poster_url text,
  width integer,
  height integer,
  caption text,
  -- Staff only.
  internal_notes text,
  -- Set once a HEAD request confirms the URL resolves.
  is_verified boolean not null default false,
  verified_at timestamptz,
  created_by uuid references auth.users (id),
  updated_by uuid references auth.users (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint mock_test_media_assets_type_check
    check (media_type in (
      'instruction_video',
      'audio_passage',
      'audio_question',
      'video_passage',
      'image_prompt',
      'diagram_image',
      'scene_image',
      'reference_image'
    )),
  constraint mock_test_media_assets_url_check
    check (length(trim(url)) > 0),
  -- Every image type needs alt text. Note that mp3 audio is served by
  -- Cloudinary under the video resource type, so an audio_passage URL
  -- containing /video/upload/ is correct and is not flagged.
  constraint mock_test_media_assets_alt_text_check
    check (
      media_type not in (
        'image_prompt', 'diagram_image', 'scene_image', 'reference_image'
      )
      or length(trim(coalesce(alt_text, ''))) > 0
    )
);

create index if not exists mock_test_media_assets_test_type_idx
  on public.mock_test_media_assets (mock_test_id, media_type);

create trigger mock_test_media_assets_set_updated_at
  before update on public.mock_test_media_assets
  for each row execute function public.set_updated_at();


-- =====================================================================
-- 9. mock_test_timer_rules
-- =====================================================================
--
-- target_id is polymorphic, so it carries no foreign key. Validation
-- checks that it resolves against target_type.
--
-- source is the column that matters most. Some timings are published,
-- such as 30 seconds per question in Listening Parts 1 to 3 and 11
-- minutes for Reading Part 1. Others are derived, such as the Listening
-- Parts 4 to 6 screen windows, which are a part total minus a clip
-- length. Flattening both into bare integers loses the difference.

create table if not exists public.mock_test_timer_rules (
  id uuid primary key default gen_random_uuid(),
  mock_test_id uuid not null
    references public.mock_tests (id) on delete cascade,
  scope text not null,
  target_type text not null,
  target_id uuid not null,
  duration_seconds integer not null,
  warning_at_seconds integer,
  urgent_at_seconds integer,
  on_expire text not null default 'advance',
  source text not null,
  source_note text,
  created_by uuid references auth.users (id),
  updated_by uuid references auth.users (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint mock_test_timer_rules_scope_check
    check (scope in (
      'per_question',
      'per_screen',
      'per_part',
      'per_section',
      'prep_timer',
      'recording_timer'
    )),
  constraint mock_test_timer_rules_target_type_check
    check (target_type in ('question', 'screen', 'part', 'section')),
  constraint mock_test_timer_rules_duration_check
    check (duration_seconds > 0),
  constraint mock_test_timer_rules_on_expire_check
    check (on_expire in ('advance', 'submit_section', 'stop_recording', 'none')),
  constraint mock_test_timer_rules_source_check
    check (source in ('published', 'derived', 'staff-set')),
  -- A derived number nobody can trace must not reach production.
  constraint mock_test_timer_rules_source_note_check
    check (source <> 'derived' or length(trim(coalesce(source_note, ''))) > 0),
  -- Amber before red, both inside the window.
  constraint mock_test_timer_rules_thresholds_check
    check (
      (warning_at_seconds is null or warning_at_seconds < duration_seconds)
      and (urgent_at_seconds is null or urgent_at_seconds < duration_seconds)
      and (
        warning_at_seconds is null
        or urgent_at_seconds is null
        or urgent_at_seconds <= warning_at_seconds
      )
    )
);

create index if not exists mock_test_timer_rules_target_idx
  on public.mock_test_timer_rules (target_type, target_id);

create index if not exists mock_test_timer_rules_test_idx
  on public.mock_test_timer_rules (mock_test_id);

create trigger mock_test_timer_rules_set_updated_at
  before update on public.mock_test_timer_rules
  for each row execute function public.set_updated_at();


-- =====================================================================
-- 11. mock_test_ai_rubrics
-- =====================================================================
--
-- Declared before mock_test_scoring_rules so the scoring rule can
-- reference it.
--
-- ADMIN ONLY, and super_admin for writes. Prompt bodies, checklists and
-- model settings are never sent to a learner. model_settings names a
-- model; it never carries a credential. The API key stays in the server
-- environment, as OPENAI_API_KEY does today.

create table if not exists public.mock_test_ai_rubrics (
  id uuid primary key default gen_random_uuid(),
  skill text not null,
  name text not null,
  -- Writing:  Content/Coherence, Vocabulary, Readability, Task Fulfillment
  -- Speaking: Content/Coherence, Vocabulary, Listenability, Task Fulfillment
  criteria jsonb not null,
  task_checklists jsonb not null default '{}'::jsonb,
  level_descriptors jsonb not null default '{}'::jsonb,
  -- Speaking only.
  audio_notes jsonb not null default '[]'::jsonb,
  timing_checks jsonb not null default '[]'::jsonb,
  prompt_version text not null,
  model_settings jsonb not null default '{}'::jsonb,
  disclaimer_text text not null,
  status text not null default 'draft',
  created_by uuid references auth.users (id),
  updated_by uuid references auth.users (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint mock_test_ai_rubrics_skill_check
    check (skill in ('writing', 'speaking')),
  constraint mock_test_ai_rubrics_status_check
    check (status in ('draft', 'active')),
  constraint mock_test_ai_rubrics_disclaimer_check
    check (length(trim(disclaimer_text)) > 0)
);

create trigger mock_test_ai_rubrics_set_updated_at
  before update on public.mock_test_ai_rubrics
  for each row execute function public.set_updated_at();


-- =====================================================================
-- 10. mock_test_scoring_rules
-- =====================================================================
--
-- band_map holds rows of { level, min_correct, max_correct }. The rows
-- overlap on purpose: a raw Listening score of 35 matches both the
-- level 9 row and the level 10-12 row, and the honest rendering is
-- "Level 9 or 10-12". The overlap must survive into the database.
--
-- disclaimer_text is not null because the estimated-practice wording is
-- a compliance requirement, not an option.

create table if not exists public.mock_test_scoring_rules (
  id uuid primary key default gen_random_uuid(),
  -- Null for a shared default map.
  mock_test_id uuid
    references public.mock_tests (id) on delete cascade,
  skill text not null,
  scoring_type text not null,
  total_questions integer,
  band_map jsonb,
  ai_rubric_id uuid
    references public.mock_test_ai_rubrics (id) on delete restrict,
  disclaimer_text text not null,
  created_by uuid references auth.users (id),
  updated_by uuid references auth.users (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint mock_test_scoring_rules_skill_check
    check (skill in ('listening', 'reading', 'writing', 'speaking')),
  constraint mock_test_scoring_rules_type_check
    check (scoring_type in (
      'objective_correct_incorrect',
      'raw_to_band_map',
      'ai_rubric_estimate',
      'manual_review'
    )),
  constraint mock_test_scoring_rules_disclaimer_check
    check (length(trim(disclaimer_text)) > 0),
  -- A band map rule needs a map. A rubric rule needs a rubric.
  constraint mock_test_scoring_rules_band_map_check
    check (scoring_type <> 'raw_to_band_map' or band_map is not null),
  constraint mock_test_scoring_rules_rubric_check
    check (scoring_type <> 'ai_rubric_estimate' or ai_rubric_id is not null)
);

create index if not exists mock_test_scoring_rules_test_skill_idx
  on public.mock_test_scoring_rules (mock_test_id, skill);

create trigger mock_test_scoring_rules_set_updated_at
  before update on public.mock_test_scoring_rules
  for each row execute function public.set_updated_at();


-- =====================================================================
-- 12. mock_test_validation_issues
-- =====================================================================
--
-- A cache of a computation, taken deliberately: recomputing every rule
-- on every dashboard render would mean reading a whole test to draw one
-- number. Rows are refreshed on every save of an affected entity and
-- always immediately before a status change. A publish never trusts the
-- cached rows.

create table if not exists public.mock_test_validation_issues (
  id uuid primary key default gen_random_uuid(),
  mock_test_id uuid not null
    references public.mock_tests (id) on delete cascade,
  entity_type text not null,
  -- Null for a whole test rule.
  entity_id uuid,
  rule_code text not null,
  severity text not null,
  message text not null,
  status text not null default 'open',
  detected_at timestamptz not null default now(),
  resolved_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint mock_test_validation_issues_entity_type_check
    check (entity_type in (
      'test',
      'section',
      'part',
      'screen',
      'question',
      'option',
      'answer_key',
      'media_asset',
      'timer_rule',
      'scoring_rule',
      'ai_rubric'
    )),
  constraint mock_test_validation_issues_severity_check
    check (severity in ('error', 'warning')),
  constraint mock_test_validation_issues_status_check
    check (status in ('open', 'resolved'))
);

create index if not exists mock_test_validation_issues_dashboard_idx
  on public.mock_test_validation_issues (mock_test_id, status, severity);

create trigger mock_test_validation_issues_set_updated_at
  before update on public.mock_test_validation_issues
  for each row execute function public.set_updated_at();


-- =====================================================================
-- Deferred foreign keys on the authored content tree
-- =====================================================================
--
-- These columns point at tables declared later than the table that owns
-- them, so the constraints are added here rather than inline.

alter table public.mock_test_sections
  add constraint mock_test_sections_instruction_video_fk
  foreign key (instruction_video_asset_id)
  references public.mock_test_media_assets (id) on delete set null;

alter table public.mock_test_sections
  add constraint mock_test_sections_scoring_rule_fk
  foreign key (scoring_rule_id)
  references public.mock_test_scoring_rules (id) on delete set null;

alter table public.mock_test_parts
  add constraint mock_test_parts_scenario_image_fk
  foreign key (scenario_image_asset_id)
  references public.mock_test_media_assets (id) on delete set null;

alter table public.mock_test_parts
  add constraint mock_test_parts_answer_explanation_fk
  foreign key (answer_explanation_asset_id)
  references public.mock_test_media_assets (id) on delete set null;

alter table public.mock_test_screens
  add constraint mock_test_screens_media_asset_fk
  foreign key (media_asset_id)
  references public.mock_test_media_assets (id) on delete set null;

alter table public.mock_test_screens
  add constraint mock_test_screens_timer_rule_fk
  foreign key (timer_rule_id)
  references public.mock_test_timer_rules (id) on delete set null;

alter table public.mock_test_questions
  add constraint mock_test_questions_question_audio_fk
  foreign key (question_audio_asset_id)
  references public.mock_test_media_assets (id) on delete set null;

alter table public.mock_test_questions
  add constraint mock_test_questions_image_fk
  foreign key (image_asset_id)
  references public.mock_test_media_assets (id) on delete set null;

alter table public.mock_test_options
  add constraint mock_test_options_image_fk
  foreign key (image_asset_id)
  references public.mock_test_media_assets (id) on delete set null;


-- =====================================================================
-- 13. student_mock_test_attempts
-- =====================================================================
--
-- Holds mock_test_id rather than a slug, so an attempt against version 1
-- keeps rendering version 1 after version 2 is published.

create table if not exists public.student_mock_test_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  mock_test_id uuid not null
    references public.mock_tests (id) on delete restrict,
  status text not null default 'in_progress',
  started_at timestamptz not null default now(),
  submitted_at timestamptz,
  current_section_id uuid
    references public.mock_test_sections (id) on delete set null,
  current_screen_id uuid
    references public.mock_test_screens (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint student_mock_test_attempts_status_check
    check (status in ('in_progress', 'submitted', 'abandoned')),
  constraint student_mock_test_attempts_submitted_at_check
    check (status <> 'submitted' or submitted_at is not null)
);

create index if not exists student_mock_test_attempts_user_test_idx
  on public.student_mock_test_attempts (user_id, mock_test_id);

create trigger student_mock_test_attempts_set_updated_at
  before update on public.student_mock_test_attempts
  for each row execute function public.set_updated_at();


-- =====================================================================
-- 14. student_mock_test_answers
-- =====================================================================
--
-- A null selected_option_id on a present row means reached and left
-- blank, which scores zero. A missing row means not reached. Both must
-- survive, which is why a blank is stored rather than omitted.
--
-- recording_path is a Supabase storage path, not a Cloudinary URL.
-- Cloudinary is a delivery account for authored material; learner audio
-- is private data and belongs in storage with per-user policies.

create table if not exists public.student_mock_test_answers (
  id uuid primary key default gen_random_uuid(),
  attempt_id uuid not null
    references public.student_mock_test_attempts (id) on delete cascade,
  question_id uuid not null
    references public.mock_test_questions (id) on delete restrict,
  selected_option_id uuid
    references public.mock_test_options (id) on delete restrict,
  text_response text,
  word_count integer,
  recording_path text,
  transcript text,
  time_expired boolean not null default false,
  answered_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint student_mock_test_answers_unique_question
    unique (attempt_id, question_id),
  constraint student_mock_test_answers_word_count_check
    check (word_count is null or word_count >= 0)
);

create index if not exists student_mock_test_answers_attempt_idx
  on public.student_mock_test_answers (attempt_id);

create trigger student_mock_test_answers_set_updated_at
  before update on public.student_mock_test_answers
  for each row execute function public.set_updated_at();


-- =====================================================================
-- 15. student_mock_test_section_scores
-- =====================================================================
--
-- estimated_levels is an array because the band charts overlap. Storing
-- a single level would claim a precision the chart does not have.
--
-- disclaimer_text is copied rather than joined, so a result a learner
-- saw a year ago still renders with the wording it was produced under.

create table if not exists public.student_mock_test_section_scores (
  id uuid primary key default gen_random_uuid(),
  attempt_id uuid not null
    references public.student_mock_test_attempts (id) on delete cascade,
  section_id uuid not null
    references public.mock_test_sections (id) on delete restrict,
  raw_correct integer,
  total_questions integer not null,
  estimated_levels text[],
  estimated_label text,
  rubric_result jsonb,
  rubric_prompt_version text,
  scoring_rule_id uuid
    references public.mock_test_scoring_rules (id) on delete set null,
  disclaimer_text text not null,
  scored_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint student_mock_test_section_scores_unique
    unique (attempt_id, section_id),
  constraint student_mock_test_section_scores_raw_check
    check (raw_correct is null or (raw_correct >= 0 and raw_correct <= total_questions)),
  constraint student_mock_test_section_scores_disclaimer_check
    check (length(trim(disclaimer_text)) > 0)
);

create trigger student_mock_test_section_scores_set_updated_at
  before update on public.student_mock_test_section_scores
  for each row execute function public.set_updated_at();


-- =====================================================================
-- 16. student_mock_test_final_scores
-- =====================================================================
--
-- There is deliberately no overall or average level. CELPIP reports a
-- level per component and publishes no composite, so producing one
-- would be a claim no source supports.

create table if not exists public.student_mock_test_final_scores (
  id uuid primary key default gen_random_uuid(),
  attempt_id uuid not null unique
    references public.student_mock_test_attempts (id) on delete cascade,
  listening_levels text[],
  reading_levels text[],
  writing_levels text[],
  speaking_levels text[],
  listening_label text,
  reading_label text,
  writing_label text,
  speaking_label text,
  disclaimer_text text not null,
  computed_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint student_mock_test_final_scores_disclaimer_check
    check (length(trim(disclaimer_text)) > 0)
);

create trigger student_mock_test_final_scores_set_updated_at
  before update on public.student_mock_test_final_scores
  for each row execute function public.set_updated_at();


-- =====================================================================
-- Row level security
-- =====================================================================

alter table public.mock_tests enable row level security;
alter table public.mock_test_sections enable row level security;
alter table public.mock_test_option_sets enable row level security;
alter table public.mock_test_parts enable row level security;
alter table public.mock_test_screens enable row level security;
alter table public.mock_test_questions enable row level security;
alter table public.mock_test_options enable row level security;
alter table public.mock_test_answer_keys enable row level security;
alter table public.mock_test_media_assets enable row level security;
alter table public.mock_test_timer_rules enable row level security;
alter table public.mock_test_scoring_rules enable row level security;
alter table public.mock_test_ai_rubrics enable row level security;
alter table public.mock_test_validation_issues enable row level security;
alter table public.student_mock_test_attempts enable row level security;
alter table public.student_mock_test_answers enable row level security;
alter table public.student_mock_test_section_scores enable row level security;
alter table public.student_mock_test_final_scores enable row level security;


-- =====================================================================
-- DRAFT RLS POLICIES - COMMENTS ONLY, NOT EXECUTED
-- =====================================================================
--
-- Written as comments on purpose. They depend on a staff role check
-- that does not exist yet: profiles.role is a plain text column
-- defaulting to 'student' and nothing reads it. ADMIN-01 decides how a
-- role is asserted, and only then do these become statements.
--
-- The intended helper, so a policy does not repeat a subquery:
--
--   create or replace function public.is_staff()
--   returns boolean
--   language sql
--   stable
--   security definer
--   set search_path = public
--   as $$
--     select exists (
--       select 1 from public.profiles
--       where id = auth.uid()
--         and role in ('staff_admin', 'super_admin')
--     );
--   $$;
--
-- ---------------------------------------------------------------------
-- Authored content, learner reads
-- ---------------------------------------------------------------------
--
-- A learner sees published tests and nothing else. Draft and
-- ready_for_review tests are invisible, and so is everything under them,
-- because each child policy walks up to the test's status rather than
-- trusting a filter in the query.
--
--   create policy "mock_tests_select_published"
--     on public.mock_tests for select
--     to authenticated
--     using (status = 'published');
--
--   create policy "mock_test_sections_select_published"
--     on public.mock_test_sections for select
--     to authenticated
--     using (exists (
--       select 1 from public.mock_tests t
--       where t.id = mock_test_id and t.status = 'published'
--     ));
--
-- The same shape repeats for mock_test_parts, mock_test_screens,
-- mock_test_questions, mock_test_options, mock_test_timer_rules and
-- mock_test_scoring_rules, each walking up to its test.
--
-- mock_test_media_assets additionally allows a shared asset:
--
--   using (
--     mock_test_id is null
--     or exists (
--       select 1 from public.mock_tests t
--       where t.id = mock_test_id and t.status = 'published'
--     )
--   )
--
-- ---------------------------------------------------------------------
-- Authored content, staff writes
-- ---------------------------------------------------------------------
--
--   create policy "mock_tests_staff_all"
--     on public.mock_tests for all
--     to authenticated
--     using (public.is_staff())
--     with check (public.is_staff());
--
-- The same for every authored content table. Moving a test to
-- 'published' is restricted to super_admin, which is a check inside the
-- server action rather than in the policy, because a policy cannot see
-- the previous value of a column cheaply.
--
-- ---------------------------------------------------------------------
-- The two admin-only tables
-- ---------------------------------------------------------------------
--
-- mock_test_answer_keys and mock_test_ai_rubrics get NO policy for
-- authenticated learners at all. Not a filtered policy: none. RLS denies
-- by default when no policy matches, so the absence is the enforcement.
-- These are the two tables where a mistake hands a learner the answers
-- or the grading prompt, so neither relies on a using clause being
-- written correctly.
--
--   create policy "mock_test_answer_keys_staff_all"
--     on public.mock_test_answer_keys for all
--     to authenticated
--     using (public.is_staff())
--     with check (public.is_staff());
--
-- mock_test_validation_issues is staff only for the same reason it is
-- not learner data: it is authoring state.
--
-- ---------------------------------------------------------------------
-- Learner attempts
-- ---------------------------------------------------------------------
--
-- A learner reads and writes their own attempt, reads their own answers,
-- and reads but never writes their own scores. Scoring is done server
-- side with the service role client, which bypasses RLS by design and
-- stays out of the browser.
--
--   create policy "student_mock_test_attempts_own"
--     on public.student_mock_test_attempts for all
--     to authenticated
--     using (auth.uid() = user_id)
--     with check (auth.uid() = user_id);
--
--   create policy "student_mock_test_answers_own"
--     on public.student_mock_test_answers for all
--     to authenticated
--     using (exists (
--       select 1 from public.student_mock_test_attempts a
--       where a.id = attempt_id and a.user_id = auth.uid()
--     ))
--     with check (exists (
--       select 1 from public.student_mock_test_attempts a
--       where a.id = attempt_id and a.user_id = auth.uid()
--     ));
--
--   create policy "student_mock_test_section_scores_own_select"
--     on public.student_mock_test_section_scores for select
--     to authenticated
--     using (exists (
--       select 1 from public.student_mock_test_attempts a
--       where a.id = attempt_id and a.user_id = auth.uid()
--     ));
--
-- The same select-only shape for student_mock_test_final_scores.
--
-- Staff get no direct policy on the four attempt tables. Staff read
-- learner work through server side code with an explicit role check,
-- which keeps one audited path for reading another person's work.
--
-- =====================================================================
-- END OF DRAFT SCHEMA - DO NOT RUN
-- =====================================================================
