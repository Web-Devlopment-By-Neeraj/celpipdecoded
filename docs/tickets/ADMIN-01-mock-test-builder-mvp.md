# ADMIN-01 - Admin Mock Test Builder MVP

## Goal

Build the first working admin MVP for managing mock tests.

This ticket follows ADMIN-00.

ADMIN-00 created:

- admin workflow blueprint
- database blueprint
- draft schema
- Mock Test 1 manual-to-admin map
- admin next steps

This ticket should create the first real admin system.

Build only the smallest useful admin MVP:

- production database migration
- protected admin route
- admin mock test list
- create mock test draft
- edit mock test basic details
- create sections
- create parts
- preview mock test structure

Do not build full question editor in this ticket.
Do not build answer key editor in this ticket.
Do not build media upload in this ticket.
Do not build drag and drop.
Do not build analytics.
Do not build student attempt save.
Do not build full learner dynamic mock test runner.
Do not replace the hardcoded Mock Test 1 learner routes yet.
Do not build payment.
Do not build live classes.

## Product

Toronto Academy of Education CELPIP Preparation Program

Use practice wording:

- mock test
- practice test
- admin builder
- draft
- published
- estimated level
- not an official CELPIP score

Do not say:

- official CELPIP score
- official result
- guaranteed score
- pass guarantee

## Required database work

Use ADMIN-00 draft schema as the source:

docs/admin/mock-test-builder-draft-schema.sql
docs/admin/mock-test-builder-database-blueprint.md

Create production migration:

supabase/migrations/011_mock_test_builder_admin_foundation.sql

The migration should include only the tables needed for ADMIN-01 MVP:

1. mock_tests
2. mock_test_sections
3. mock_test_parts
4. mock_test_validation_issues

Optional only if very easy and already stable:

5. mock_test_media_assets

Do not create all future tables yet unless they are required for this MVP.

Keep question tables for ADMIN-02.

Suggested tables for this MVP:

mock_tests:
- id uuid primary key
- title text not null
- slug text unique not null
- description text
- status text not null default 'draft'
- version integer not null default 1
- internal_notes text
- created_by uuid
- created_at timestamptz
- updated_at timestamptz

mock_test_sections:
- id uuid primary key
- mock_test_id uuid references mock_tests(id)
- section_type text not null
- title text not null
- instructions text
- section_order integer not null
- estimated_duration_minutes integer
- scoring_type text
- status text not null default 'draft'
- created_at timestamptz
- updated_at timestamptz

mock_test_parts:
- id uuid primary key
- mock_test_id uuid references mock_tests(id)
- section_id uuid references mock_test_sections(id)
- title text not null
- part_type text
- instructions text
- part_order integer not null
- timer_type text
- prep_time_seconds integer
- response_time_seconds integer
- question_count integer
- status text not null default 'draft'
- created_at timestamptz
- updated_at timestamptz

mock_test_validation_issues:
- id uuid primary key
- mock_test_id uuid references mock_tests(id)
- issue_type text not null
- issue_message text not null
- severity text not null
- resolved boolean not null default false
- created_at timestamptz

Use updated_at trigger if the project already has a pattern.

Add indexes for:
- mock_tests(status)
- mock_tests(slug)
- mock_test_sections(mock_test_id)
- mock_test_parts(section_id)
- mock_test_parts(mock_test_id)

## RLS

Enable RLS.

For this MVP:

- learners should not access draft admin data
- admin pages should use authenticated users only
- do not expose answer keys because they are not built yet
- do not expose service role key to client

If the project already has an admin role pattern, use it.

If no admin role pattern exists, create a safe temporary admin check helper that allows only a configured email list from server env.

Use server-only environment variable:

ADMIN_EMAILS

Example format:

ADMIN_EMAILS=sajin@example.com,office@torontoacademy.ca

Do not expose ADMIN_EMAILS to client.
Do not hardcode real emails in committed code.

If ADMIN_EMAILS is missing:
- admin route should show access denied
- do not crash

## Admin route

Create route group:

src/app/dashboard/admin/mock-tests/page.tsx

URL:

/dashboard/admin/mock-tests

Create pages:

1. Admin mock test list
2. Create mock test draft
3. Edit mock test details
4. Add section
5. Add part
6. Preview structure

Preferred routes:

/dashboard/admin/mock-tests
/dashboard/admin/mock-tests/new
/dashboard/admin/mock-tests/[mockTestId]
/dashboard/admin/mock-tests/[mockTestId]/sections/new
/dashboard/admin/mock-tests/[mockTestId]/sections/[sectionId]/parts/new
/dashboard/admin/mock-tests/[mockTestId]/preview

Keep UI simple.

## Required server files

Create admin auth helper:

src/lib/admin/require-admin.ts

Create admin database actions:

src/app/dashboard/admin/mock-tests/actions.ts

Actions:

- createMockTest
- updateMockTest
- createMockTestSection
- updateMockTestSection
- createMockTestPart
- updateMockTestPart
- validateMockTestStructure

Use server actions.
Use Supabase server client pattern already in project.

Do not use service role unless project already uses it safely for admin server actions.
Prefer authenticated server client and RLS.

## Required components

Create:

src/components/admin/mock-tests/AdminMockTestList.tsx
src/components/admin/mock-tests/MockTestForm.tsx
src/components/admin/mock-tests/MockTestSectionList.tsx
src/components/admin/mock-tests/MockTestSectionForm.tsx
src/components/admin/mock-tests/MockTestPartList.tsx
src/components/admin/mock-tests/MockTestPartForm.tsx
src/components/admin/mock-tests/MockTestStructurePreview.tsx
src/components/admin/mock-tests/AdminAccessDenied.tsx
src/components/admin/mock-tests/AdminPageHeader.tsx

Keep components simple and readable.

## Admin MVP behavior

Admin can:

1. Visit /dashboard/admin/mock-tests
2. See list of mock tests
3. Create a new mock test draft
4. Edit title, slug, description, status, version, internal notes
5. Add sections:
   - Listening
   - Reading
   - Writing
   - Speaking
6. Add parts under each section
7. Set simple timing values
8. Preview test structure
9. See basic validation warnings

Validation examples:

- mock test has no sections
- section has no parts
- title missing
- slug missing
- duplicate section order
- invalid status

Do not publish if validation fails.
Publishing can remain mostly disabled or protected in this ticket.

## Status behavior

Allowed statuses:

- draft
- internal_preview
- published
- archived

For ADMIN-01:

- creating test should default to draft
- publishing should be blocked if structure is incomplete
- learner dashboard should not read from these dynamic tests yet

Hardcoded Mock Test 1 learner routes stay untouched.

## Manual Supabase step

Claude should create the migration file only.

User will manually run the SQL in Hosted Supabase SQL Editor.

Do not assume local Supabase CLI.

After Claude creates migration, copy SQL from:

supabase/migrations/011_mock_test_builder_admin_foundation.sql

Then run it in:

Hosted Supabase -> SQL Editor -> New query -> Run

## Environment variable

Add documentation only.

Do not edit .env.local.

Document that user needs:

ADMIN_EMAILS=your-admin-email@example.com

For Vercel later, add the same variable in:

Vercel -> Project -> Settings -> Environment Variables

## Documentation

Create:

docs/admin/admin-01-mock-test-builder-mvp.md

Include:

1. Routes created
2. Tables created
3. RLS approach
4. Admin access approach
5. Server actions created
6. MVP features
7. What is intentionally not built
8. Manual Supabase SQL step
9. Vercel env step
10. ADMIN-02 continuation note

Update:

docs/product/admin-workflow-next-steps.md

Add that ADMIN-02 should build:

- question editor
- options editor
- answer key editor
- media link editor
- first dynamic preview of objective questions

## Security requirements

- Admin route must be protected
- ADMIN_EMAILS server-only
- no service role key in client
- no answer keys in learner UI
- draft tests hidden from students
- no public dynamic mock test route yet
- no hardcoded real admin emails in code
- no secrets printed
- no .env.local changes committed

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

- production migration file exists
- admin mock test route exists
- admin route is protected
- admin list page works
- admin create mock test works
- admin edit mock test works
- admin create section works
- admin create part works
- structure preview works
- basic validation works
- no learner route is replaced
- no hardcoded Mock Test 1 learner flow is broken
- no question editor is built
- no answer key editor is built
- no media upload is built
- no student attempt save is built
- no service role key exposed
- docs/admin/admin-01-mock-test-builder-mvp.md exists
- npm run lint passes
- npm run build passes
