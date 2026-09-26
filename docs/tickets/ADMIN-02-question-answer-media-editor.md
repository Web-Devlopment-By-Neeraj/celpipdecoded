# ADMIN-02 - Admin Question, Options, Answer Key, and Media Link Editor

## Goal

Build the next admin workflow after ADMIN-01.

ADMIN-01 created:

- admin mock test list
- create/edit mock test
- create sections
- create parts
- preview structure

ADMIN-02 should let admin add actual test content under each part.

Build:

- question editor
- answer option editor
- answer key editor
- media link editor
- question preview

Focus first on objective Listening and Reading questions.

Do not replace the hardcoded learner Mock Test 1 routes yet.
Do not build the dynamic student test runner yet.
Do not build Writing AI rubric editor yet.
Do not build Speaking AI rubric editor yet.
Do not build student attempt saving yet.
Do not build analytics.
Do not build payments.
Do not build live classes.
Do not build drag and drop.
Do not build file upload.
Do not copy official CELPIP branding into production UI.

## Product wording

Use:

- practice test
- mock test
- admin builder
- answer key
- media link
- preview
- not an official CELPIP score

Do not say:

- official CELPIP score
- official result
- guaranteed score
- pass guarantee

## Required database migration

Create:

supabase/migrations/014_mock_test_question_answer_media_editor.sql

The migration must be idempotent and safe for hosted Supabase.

Use:

- create table if not exists
- alter table add column if not exists
- create index if not exists
- constraint checks only inside safe DO blocks
- do not drop data
- do not delete existing Mock Test 1 data

Create or repair these tables:

1. mock_test_media_assets
2. mock_test_questions
3. mock_test_options
4. mock_test_answer_keys

## Table requirements

mock_test_media_assets:

- id uuid primary key
- mock_test_id uuid references mock_tests(id)
- section_id uuid references mock_test_sections(id)
- part_id uuid references mock_test_parts(id)
- media_type text not null
- url text not null
- title text
- alt_text text
- transcript text
- internal_notes text
- display_order integer default 0
- created_by uuid
- updated_by uuid
- created_at timestamptz
- updated_at timestamptz

Allowed media_type:

- audio
- video
- image
- thumbnail
- document
- other

mock_test_questions:

- id uuid primary key
- mock_test_id uuid references mock_tests(id)
- section_id uuid references mock_test_sections(id)
- part_id uuid references mock_test_parts(id)
- question_type text not null
- question_number integer not null
- prompt text
- instruction text
- passage_text text
- stem text
- helper_text text
- media_asset_id uuid references mock_test_media_assets(id)
- points integer default 1
- display_order integer default 0
- is_required boolean default true
- status text default draft
- created_by uuid
- updated_by uuid
- created_at timestamptz
- updated_at timestamptz

Allowed question_type for ADMIN-02:

- single_choice
- dropdown_sentence_completion
- reading_correspondence_choice
- reading_information_choice
- reading_viewpoints_choice

mock_test_options:

- id uuid primary key
- question_id uuid references mock_test_questions(id)
- option_label text not null
- option_text text not null
- display_order integer default 0
- created_at timestamptz
- updated_at timestamptz

mock_test_answer_keys:

- id uuid primary key
- question_id uuid references mock_test_questions(id)
- correct_option_id uuid references mock_test_options(id)
- correct_text text
- explanation text
- points integer default 1
- created_by uuid
- updated_by uuid
- created_at timestamptz
- updated_at timestamptz

Important security rule:

Answer keys must never be exposed to learner routes.
ADMIN-02 is admin-only.

## RLS and admin access

Use the same ADMIN-01 pattern:

- requireAdmin checks ADMIN_EMAILS server-side
- after admin check passes, admin server actions use the server-only service role client
- service role must never be imported into client components
- do not create broad authenticated write policies

Enable RLS on new tables.

Add comments in migration:

- admin writes are protected by server-side requireAdmin and service role
- learner dynamic policies will be added later when dynamic runner is built

## Required admin routes

Create routes:

/dashboard/admin/mock-tests/[mockTestId]/sections/[sectionId]/parts/[partId]

This part detail page should show:

- part details
- media assets for the part
- questions under the part
- add media link button
- add question button
- preview button

Create:

/dashboard/admin/mock-tests/[mockTestId]/sections/[sectionId]/parts/[partId]/questions/new

Create:

/dashboard/admin/mock-tests/[mockTestId]/sections/[sectionId]/parts/[partId]/questions/[questionId]

Create:

/dashboard/admin/mock-tests/[mockTestId]/sections/[sectionId]/parts/[partId]/media/new

Create:

/dashboard/admin/mock-tests/[mockTestId]/sections/[sectionId]/parts/[partId]/preview

## Required server actions

Create or update:

src/app/dashboard/admin/mock-tests/actions.ts

Add actions:

- createMockTestMediaAsset
- updateMockTestMediaAsset
- deleteMockTestMediaAsset
- createMockTestQuestion
- updateMockTestQuestion
- deleteMockTestQuestion
- createMockTestOption
- updateMockTestOption
- deleteMockTestOption
- setMockTestAnswerKey
- updateMockTestAnswerKey
- deleteMockTestAnswerKey
- validatePartContent

Each action must call requireAdmin first.

Each action must use safe Supabase error handling.

Do not log secrets.
Do not log service role key.
Do not log ADMIN_EMAILS.

## Required query files

Create or update:

src/features/admin/mock-test-question-queries.ts
src/features/admin/mock-test-media-queries.ts

These should use the server-only admin client only after requireAdmin has passed.

## Required components

Create:

src/components/admin/mock-tests/MockTestPartDetail.tsx
src/components/admin/mock-tests/MockTestMediaList.tsx
src/components/admin/mock-tests/MockTestMediaForm.tsx
src/components/admin/mock-tests/MockTestQuestionList.tsx
src/components/admin/mock-tests/MockTestQuestionForm.tsx
src/components/admin/mock-tests/MockTestOptionEditor.tsx
src/components/admin/mock-tests/MockTestAnswerKeyEditor.tsx
src/components/admin/mock-tests/MockTestPartContentPreview.tsx
src/components/admin/mock-tests/MockTestContentValidationPanel.tsx

Keep UI simple and functional.

## Question form behavior

Admin can create a question with:

- question type
- question number
- instruction
- passage text
- prompt
- stem
- helper text
- points
- status
- display order
- optional media asset

For single choice:

- admin can add options A, B, C, D
- admin can select correct option
- admin can add explanation

For dropdown sentence completion:

- admin can add answer options
- admin can set correct option
- explanation optional

For Reading question types:

- passage text can be stored at question level for now
- later we can optimize shared passages

## Media form behavior

Admin can add media link:

- media type
- URL
- title
- alt text
- transcript
- internal notes
- display order

For now, use URL only.

Supported examples:

- Cloudinary audio URL
- Cloudinary video URL
- Cloudinary image URL
- public image URL
- thumbnail URL

Do not upload files in this ticket.

## Preview behavior

The part preview should show:

- part title
- instructions
- media preview if available
- question prompt/stem
- options
- correct answer visible only because it is admin preview
- explanation if available
- validation warnings

Do not make this learner-facing yet.

## Validation behavior

Show validation warnings for:

- no questions in part
- question missing prompt or stem
- objective question has fewer than 2 options
- objective question has no answer key
- answer key points missing or invalid
- media URL missing
- media type missing
- duplicate question numbers in same part
- duplicate option labels in same question

## Documentation

Create:

docs/admin/admin-02-question-answer-media-editor.md

Include:

1. Routes created
2. Tables created
3. Admin access approach
4. Media link workflow
5. Question workflow
6. Option workflow
7. Answer key workflow
8. Preview behavior
9. Validation behavior
10. Security notes
11. What is intentionally not built
12. ADMIN-03 continuation note

Update:

docs/product/admin-workflow-next-steps.md

ADMIN-03 should be:

- Admin Writing and Speaking Prompt Editor
- AI rubric settings
- dynamic learner preview preparation

## Manual Supabase step

Claude creates migration only.

User manually runs:

supabase/migrations/014_mock_test_question_answer_media_editor.sql

in Hosted Supabase SQL Editor.

Do not assume local Supabase CLI.

After running SQL:

notify pgrst, 'reload schema';

## Security requirements

- admin routes protected
- answer keys admin-only
- service role server-only
- no service role in client
- no broad authenticated write policy
- no learner route replacement
- draft tests hidden from students
- no secrets printed
- no .env.local committed

## Style rule

Use normal hyphens only.
Do not use em dashes.
Do not use long hyphens.
Use straight quotes only.

## Validation

Run:

npm run lint
npm run build

Search changed files for:

- long hyphens
- em dashes
- curly quotes

Replace with normal hyphens and straight quotes.

## Done criteria

- migration 014 exists
- media table exists in migration
- questions table exists in migration
- options table exists in migration
- answer keys table exists in migration
- part detail page exists
- add media link page exists
- add question page exists
- edit question page exists
- part preview page exists
- admin can add media URL
- admin can add objective question
- admin can add options
- admin can set correct answer
- admin can preview question and answer key
- validation warnings appear
- answer key is only visible in admin preview
- no learner route is replaced
- no dynamic learner runner is built
- no student attempt save is built
- no upload feature is built
- no ADMIN-03 features are built
- existing dashboard works
- existing Listening route works
- existing Reading route works
- existing Writing route works
- existing Speaking route works
- npm run lint passes
- npm run build passes
