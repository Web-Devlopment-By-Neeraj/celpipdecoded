# USAGE-01 - Free Attempt Limit and Premium Access Rules

## Goal

Add free attempt limits and premium access rules for AI-scored CELPIP practice.

Each learner should receive 1 free scored attempt.

After the free scored attempt is used, the learner should not be able to generate more AI feedback unless they have available access through a paid pack, monthly plan, or admin-granted credits.

This ticket does not build Stripe.
This ticket does not collect payment.
This ticket does not create a full pricing page.
This ticket does not redesign the dashboard.
This ticket does not change AI scoring prompts.
This ticket does not change speaking or writing task content.

## Product

Toronto Academy of Education CELPIP Preparation Program

## Context

Completed before this ticket:

- Speaking practice
- Writing practice
- AI feedback for speaking
- AI feedback for writing
- Speaking and writing history
- AI usage instrumentation in USAGE-00
- Design-system foundation
- Asset system

USAGE-00 records AI activity.

USAGE-01 now controls whether a learner is allowed to start an AI-scored feedback request.

## Business rule

A scored attempt means:

- 1 completed speaking feedback report
- or 1 completed writing feedback report

A scored attempt does not mean:

- opening a task
- starting preparation
- recording audio
- uploading audio
- saving a draft
- failed AI evaluation
- failed upload
- viewing a previous report

Charge only when a feedback report is successfully saved.

## Free access rule

Every authenticated learner gets:

- 1 free scored attempt

After that, they must have access.

## Future product packages

Prepare the system for these future packages, but do not build payment checkout yet:

- Starter Pack: 5 scored attempts
- Practice Pack: 12 scored attempts
- Monthly Practice Plan: 40 scored attempts per month

These can be represented internally as access balances.

Actual payment and checkout will be a later ticket.

## Access sources

Support these access sources:

1. free_trial

The learner's 1 free scored attempt.

2. paid_pack

A manually granted or future paid attempt balance.

3. monthly_plan

A monthly allowance.

4. admin_grant

Manual internal credit added by staff for testing, support, or promotions.

## Required database migration

Create:

supabase/migrations/012_usage_access_limits.sql

Do not modify old migrations.

Prefer safe create table if not exists and alter table add column if not exists.

## Required tables

Create or update these tables if they do not already exist:

### learner_usage_accounts

One row per learner.

Suggested columns:

- user_id uuid primary key references auth.users(id) on delete cascade
- free_scored_attempts_total integer not null default 1
- free_scored_attempts_used integer not null default 0
- paid_scored_attempts_balance integer not null default 0
- monthly_plan_code text
- monthly_scored_attempt_limit integer
- monthly_scored_attempts_used integer not null default 0
- monthly_period_start date
- monthly_period_end date
- access_status text not null default 'active'
- created_at timestamptz not null default now()
- updated_at timestamptz not null default now()

### scored_attempt_consumptions

One row for each successfully charged scored attempt.

Suggested columns:

- id uuid primary key default gen_random_uuid()
- user_id uuid not null references auth.users(id) on delete cascade
- attempt_id uuid not null references public.attempts(id) on delete cascade
- module_slug text not null
- task_id uuid references public.tasks(id)
- credit_source text not null
- credits_used integer not null default 1
- metadata jsonb not null default '{}'::jsonb
- created_at timestamptz not null default now()

Important:

- attempt_id should be unique
- this prevents double charging the same attempt

## Required database function

Create a safe database function if useful:

consume_scored_attempt_credit

It should:

1. Accept attempt_id, module_slug, and task_id
2. Use the authenticated user or server-verified user
3. Ensure the learner usage account exists
4. Check if the attempt was already consumed
5. If already consumed, return success without charging again
6. Use free_trial first if available
7. Use monthly_plan allowance if available
8. Use paid_pack balance if available
9. Return blocked if no access exists
10. Insert scored_attempt_consumptions only after a credit source is selected
11. Update learner_usage_accounts
12. Return credit_source and remaining counts

Do not allow a client to charge credits for another user.

Use row locking where appropriate to avoid double consumption.

## Required RLS

RLS should be enabled.

Rules:

- learners can select their own learner_usage_accounts
- learners can select their own scored_attempt_consumptions
- learners should not directly insert or update credits from the client
- server-side code should control charging
- do not weaken existing RLS

## Required feature files

Create:

src/features/usage/access-types.ts
src/features/usage/get-usage-access-summary.ts
src/features/usage/check-scored-attempt-access.ts
src/features/usage/consume-scored-attempt-credit.ts
src/features/usage/usage-copy.ts

Optional if useful:

src/features/usage/usage-errors.ts

## Required API route

Create:

src/app/api/usage/access/route.ts

GET should return the authenticated learner's access summary:

- free attempts remaining
- paid attempts remaining
- monthly attempts remaining
- total attempts remaining
- access status
- plan code if available
- monthly period if available

Do not expose other users' data.

## Required UI components

Create:

src/components/usage/UsageAccessCard.tsx
src/components/usage/ScoredAttemptLimitMessage.tsx
src/components/usage/ScoredAttemptBalanceBadge.tsx

Use design-system components from CELPIP-UX-01.

These components should be simple.

Do not redesign the dashboard.

## Where access should be enforced

Access must be checked before expensive AI calls.

Enforce access in:

1. Speaking feedback request

Before transcription or feedback generation starts, confirm the learner has access unless the attempt already has feedback ready.

2. Writing feedback request

Before OpenAI evaluation starts, confirm the learner has access unless the attempt already has feedback ready.

3. Any direct transcription route if it can be called independently

If a direct transcription route can incur OpenAI cost, it should be protected or restricted to the feedback pipeline.

Do not charge for transcription separately.

The scored attempt should be consumed only after final feedback is successfully saved.

## Important idempotency rule

Do not double charge.

If the same attempt already has a consumption row, do not charge again.

If the same attempt already has feedback ready, do not charge again.

If OpenAI fails, do not charge.

If the user refreshes the result page, do not charge.

If the user views history, do not charge.

## Blocked state behavior

If the learner has no access left, the API should return a clear 402 or 403 response.

Suggested response:

{
  "error": "No scored attempts remaining",
  "code": "NO_SCORED_ATTEMPTS_REMAINING"
}

The UI should show a friendly message:

You have used your free AI feedback report. To continue practising with AI feedback, please request access or choose a practice package.

Buttons or actions:

- Request access
- Back to dashboard
- View previous feedback

Do not build payment checkout in this ticket.

## Minimal UI adoption

Show the learner's access summary in safe places:

- /dashboard
- /dashboard/speaking
- /dashboard/writing

Do not redesign these pages.

Add only a small card or badge where appropriate.

## Manual admin grant for testing

Document how staff can manually grant credits in Supabase.

Example:

update public.learner_usage_accounts
set paid_scored_attempts_balance = paid_scored_attempts_balance + 5
where user_id = '<USER_ID>';

If the account row does not exist, create it first.

This is only for testing/admin until payment is built.

## Interaction with usage_events

Keep USAGE-00 usage event logging.

This ticket should not replace usage_events.

usage_events records AI activity and estimated provider cost.

scored_attempt_consumptions records learner access consumption.

Both are needed.

## Documentation

Create:

docs/product/usage-access-rules.md

Include:

1. What counts as a scored attempt
2. What does not count
3. Free attempt rule
4. Access sources
5. Database tables
6. Consumption flow
7. Idempotency rules
8. Manual admin grant steps
9. API behavior when blocked
10. How this prepares payment
11. How to test locally
12. Manual Supabase migration steps

## Security requirements

- Do not read .env.local
- Do not print secrets
- Do not expose Supabase service role key in client components
- Do not expose OpenAI key
- Do not create client-side direct credit updates
- Do not allow users to grant themselves credits
- Do not weaken RLS
- Do not change auth helpers unless absolutely necessary
- Do not call service role from client components

## Manual Supabase steps

The user will run the migration manually in hosted Supabase SQL Editor.

Do not use local Supabase CLI.

## Important UI copy rule

Do not use long hyphens or em dashes anywhere in UI copy, docs, comments, or prompts. Use normal hyphens only.

## Done criteria

- migration 012_usage_access_limits.sql exists
- learner_usage_accounts exists
- scored_attempt_consumptions exists
- RLS is safe
- access summary API exists
- access helper files exist
- speaking feedback checks access before AI cost
- writing feedback checks access before AI cost
- scored attempt is consumed only after successful feedback save
- failed AI requests do not consume attempts
- same attempt cannot be charged twice
- usage_events remains in place
- small access UI is added without dashboard redesign
- no Stripe/payment checkout is built
- no AI prompts are changed
- no Supabase secrets are exposed
- docs/product/usage-access-rules.md exists
- npm run lint passes
- npm run build passes
