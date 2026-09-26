# INFRA-01 - Toronto Academy Supabase Switch and Foundation Schema

## Goal

Switch the project to the Toronto Academy Supabase project and prepare the database foundation for the CELPIP practice web app.

This ticket is infrastructure and database foundation only.

Do not build the speaking practice UI yet.
Do not build recording yet.
Do not build transcription yet.
Do not build AI scoring yet.
Do not build payment yet.

## Product direction

Brand:
Toronto Academy CELPIP Practice

First module:
CELPIP Speaking Practice

Future modules:
CELPIP Writing Practice
CELPIP Reading Practice
CELPIP Listening Practice
Live CELPIP Classes

## Why this ticket is first

The current landing page already stores early access leads. Before building the real product, the app must point to the Toronto Academy Supabase project so all users, leads, audio, attempts, scores, badges, and class interest data belong to the correct organization.

## Environment variables

Standardize the project to these variables:

NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_APP_URL=

The service role key must only be used on the server.
Never expose SUPABASE_SERVICE_ROLE_KEY in client components.

If the current code uses SUPABASE_URL, update it to use NEXT_PUBLIC_SUPABASE_URL on the server side where appropriate, while keeping service role server only.

## Required Supabase setup

Create the following migration file:

supabase/migrations/001_academy_foundation.sql

The migration should create:

1. profiles
2. modules
3. tasks
4. speaking_task_details
5. attempts
6. attempt_scores
7. badges
8. user_badges
9. usage_events
10. live_class_interest
11. early_access_leads if it does not already exist

Enable RLS on all user data tables.

## Database table requirements

profiles:
- id uuid primary key references auth.users(id) on delete cascade
- email text
- full_name text
- role text default 'student'
- created_at timestamptz default now()
- updated_at timestamptz default now()

modules:
- id uuid primary key default gen_random_uuid()
- slug text unique not null
- title text not null
- description text
- status text default 'coming_soon'
- sort_order integer default 0
- created_at timestamptz default now()

tasks:
- id uuid primary key default gen_random_uuid()
- module_id uuid references modules(id) on delete cascade
- task_type text not null
- title text not null
- prompt text not null
- difficulty text default 'starter'
- status text default 'active'
- sort_order integer default 0
- created_at timestamptz default now()

speaking_task_details:
- task_id uuid primary key references tasks(id) on delete cascade
- task_number integer
- prep_seconds integer not null
- speaking_seconds integer not null
- scoring_focus jsonb default '[]'::jsonb

attempts:
- id uuid primary key default gen_random_uuid()
- user_id uuid references auth.users(id) on delete cascade
- module_id uuid references modules(id)
- task_id uuid references tasks(id)
- status text default 'created'
- audio_path text
- audio_duration_seconds integer
- transcript text
- submitted_at timestamptz
- created_at timestamptz default now()

attempt_scores:
- id uuid primary key default gen_random_uuid()
- attempt_id uuid references attempts(id) on delete cascade
- estimated_level numeric
- level_label text
- badge_slug text
- content_coherence_score numeric
- vocabulary_score numeric
- listenability_score numeric
- task_fulfillment_score numeric
- strengths jsonb default '[]'::jsonb
- improvements jsonb default '[]'::jsonb
- next_steps jsonb default '[]'::jsonb
- raw_ai_response jsonb
- created_at timestamptz default now()

badges:
- id uuid primary key default gen_random_uuid()
- slug text unique not null
- title text not null
- description text
- min_estimated_level numeric
- icon_name text
- created_at timestamptz default now()

user_badges:
- id uuid primary key default gen_random_uuid()
- user_id uuid references auth.users(id) on delete cascade
- badge_id uuid references badges(id) on delete cascade
- attempt_id uuid references attempts(id) on delete set null
- earned_at timestamptz default now()
- unique(user_id, badge_id)

usage_events:
- id uuid primary key default gen_random_uuid()
- user_id uuid references auth.users(id) on delete cascade
- event_type text not null
- module_slug text
- attempt_id uuid references attempts(id) on delete set null
- created_at timestamptz default now()

live_class_interest:
- id uuid primary key default gen_random_uuid()
- user_id uuid references auth.users(id) on delete set null
- full_name text
- email text not null
- phone text
- interested_module text default 'celpip-speaking'
- preferred_schedule text
- notes text
- created_at timestamptz default now()

early_access_leads:
- keep compatible with the existing landing page form

## Seed data

Seed the modules table with:

1. celpip-speaking
Title: CELPIP Speaking Practice
Status: active

2. celpip-writing
Title: CELPIP Writing Practice
Status: coming_soon

3. celpip-reading
Title: CELPIP Reading Practice
Status: coming_soon

4. celpip-listening
Title: CELPIP Listening Practice
Status: coming_soon

5. live-classes
Title: Live CELPIP Classes
Status: coming_soon

Seed badges:

- foundation-speaker
- developing-communicator
- test-ready-builder
- confident-speaker
- advanced-communicator

## Supabase Storage

Create a private storage bucket named:

attempt-audio

Do not create public audio URLs.
Audio should be accessed through signed URLs later.

## RLS policies

Set RLS as follows:

profiles:
- user can select own profile
- user can update own profile
- authenticated user can insert own profile

modules:
- authenticated users can select modules

tasks:
- authenticated users can select active tasks

speaking_task_details:
- authenticated users can select details for active tasks

attempts:
- user can select own attempts
- user can insert own attempts
- user can update own attempts

attempt_scores:
- user can select scores for own attempts
- service role handles inserts from API routes later

badges:
- authenticated users can select badges

user_badges:
- user can select own badges

usage_events:
- user can select own usage events
- service role handles inserts from API routes later

live_class_interest:
- public or authenticated insert is allowed through server API later
- no public select

early_access_leads:
- inserts are handled by server API using service role
- no public select

## Code tasks

1. Add @supabase/ssr if missing.
2. Create or update Supabase client helpers:
   - src/lib/supabase/client.ts
   - src/lib/supabase/server.ts
   - src/lib/supabase/admin.ts
3. Update env helper if one exists.
4. Update .env.example with the standardized variable names.
5. Update /api/early-access so it uses NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY server side.
6. Confirm no service role key is referenced in client components.
7. Create docs/deployment/supabase-academy.md with setup notes.

## Important security rules

- Never commit .env.local.
- Never print real Supabase keys.
- Never expose SUPABASE_SERVICE_ROLE_KEY to the browser.
- Client code can use NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY only.
- Server admin routes can use SUPABASE_SERVICE_ROLE_KEY only.

## Important UI copy rule

Do not use long hyphens or em dashes anywhere in UI copy, comments, docs, or prompts. Use normal hyphens only.

## Done criteria

- New Supabase env variable names are documented
- .env.example is updated
- Supabase helper files exist
- Foundation migration file exists
- Existing early access form still submits locally
- npm run lint passes
- npm run build passes
- No secrets are committed
- No service role key is used in client components
EOF