# USAGE-00 - AI Usage Instrumentation and Cost Tracking

## Goal

Add AI usage instrumentation and cost tracking for the Toronto Academy of Education CELPIP app.

This ticket should record AI activity for speaking transcription, speaking feedback, and writing feedback.

Do not block users yet.
Do not build payment yet.
Do not enforce free attempt limits yet.
Do not deduct credits yet.
Do not change AI scoring prompts unless required to attach tracking.
Do not change speaking or writing user flow.
Do not redesign UI.
Do not delete assets.

## Product

Toronto Academy of Education CELPIP Preparation Program

## Why this ticket matters

The audit found that AI endpoints are currently uncapped.

Before adding free attempts, paid packages, or monthly plans, the app must understand:

- who used AI
- which module used AI
- which attempt used AI
- which API endpoint was used
- which model was used
- whether the request succeeded
- whether it failed
- how long it took
- estimated cost
- token usage when available
- audio duration when available
- error category when failed

This ticket creates measurement only.

USAGE-01 will enforce free attempts and paid access later.

## Existing context

The app already has:

- Supabase auth
- speaking practice
- speaking upload
- speaking transcription
- speaking AI feedback
- writing AI feedback
- attempts table
- attempt_scores table
- usage_events table may already exist from migration 001

First inspect the existing migrations and current usage_events table before creating anything new.

Do not create duplicate tables if usage_events already supports the required data.

## Required audit before implementation

Inspect:

- supabase/migrations
- current usage_events schema
- speaking transcription route/helper
- speaking feedback route/helper
- writing evaluation route/helper
- attempts status flow
- OpenAI helper files

Document in code comments only where helpful.

## Database requirements

Prefer using existing public.usage_events if it exists.

If usage_events is missing required columns, create a migration:

supabase/migrations/011_ai_usage_instrumentation.sql

Potential columns if missing:

- id uuid primary key default gen_random_uuid()
- user_id uuid references auth.users(id)
- attempt_id uuid references public.attempts(id)
- module_slug text
- task_id uuid references public.tasks(id)
- event_type text not null
- provider text default 'openai'
- model text
- endpoint text
- status text not null
- prompt_tokens integer
- completion_tokens integer
- total_tokens integer
- audio_duration_seconds integer
- input_size_bytes integer
- estimated_cost_usd numeric(10, 6)
- latency_ms integer
- error_code text
- error_message text
- metadata jsonb default '{}'::jsonb
- created_at timestamptz default now()

Use safe alter table add column if not exists where possible.

Do not remove existing columns.

Do not change existing RLS unless necessary.

## Required RLS

If usage_events is readable by users, users should only see their own records.

If admin reporting is not built yet, keep user read minimal.

Suggested:

- authenticated users can select their own usage_events
- authenticated users should not insert usage_events directly from client
- server route should insert usage events using the existing safe server-side pattern

Do not expose service role in client components.

## Event types

Use consistent event_type values:

- speaking_transcription
- speaking_feedback
- writing_feedback

Use consistent status values:

- started
- succeeded
- failed

If logging only final records is simpler, log:

- succeeded
- failed

Do not overbuild a complex event pipeline.

## Required feature files

Create:

src/features/usage/ai-usage-types.ts
src/features/usage/ai-cost-estimates.ts
src/features/usage/record-ai-usage-event.ts

Optional if useful:

src/features/usage/ai-usage-metadata.ts

## Cost estimate file

Create a simple cost-estimate helper.

It should:

- accept provider
- accept model
- accept token usage if available
- accept audio duration if useful
- return estimated_cost_usd
- return null if cost cannot be estimated safely

Important:

Do not hardcode business pricing decisions here.

This is provider cost tracking only, not user billing.

If exact model pricing is uncertain, use conservative placeholders and clearly document that estimates are approximate and should be reviewed before launch.

## Tracking locations

Add AI usage tracking to:

1. Speaking transcription

Track:

- user_id
- attempt_id
- module_slug = celpip-speaking
- event_type = speaking_transcription
- provider = openai
- model
- status
- latency_ms
- audio_duration_seconds if available
- input_size_bytes if available
- estimated_cost_usd if possible
- error_code and error_message on failure

2. Speaking feedback

Track:

- user_id
- attempt_id
- module_slug = celpip-speaking
- task_id
- event_type = speaking_feedback
- provider = openai
- model
- status
- prompt_tokens
- completion_tokens
- total_tokens
- latency_ms
- estimated_cost_usd if possible
- error details on failure

3. Writing feedback

Track:

- user_id
- attempt_id
- module_slug = celpip-writing
- task_id
- event_type = writing_feedback
- provider = openai
- model
- status
- prompt_tokens
- completion_tokens
- total_tokens
- latency_ms
- estimated_cost_usd if possible
- error details on failure

## Failure tracking

If OpenAI fails, record a failed event.

Do not swallow errors.

Do not make failed AI responses look successful.

Keep the existing attempt status behavior:

- speaking failure behavior should remain unchanged
- writing_evaluation_failed should remain unchanged
- no credits deducted

## Idempotency note

This ticket should not fully solve duplicate requests yet.

But it should document duplicate-risk areas for USAGE-01.

For example:

- user double-clicks Submit for feedback
- browser refresh while feedback is processing
- retry after timeout
- same attempt evaluated twice

Do not implement blocking logic unless it is already safely present.

## Admin UI

Do not build admin dashboards in this ticket.

Optional low-risk route only if very simple:

- none preferred

This ticket is backend instrumentation only.

## Documentation

Create:

docs/product/ai-usage-instrumentation.md

Include:

1. What is tracked
2. Where events are recorded
3. Event types
4. Status values
5. Cost-estimate limitations
6. Known duplicate-risk areas
7. Manual Supabase migration steps
8. How to test
9. How this prepares USAGE-01

## Security requirements

- Do not read .env.local
- Do not print secrets
- Do not expose Supabase service role key in client code
- Do not expose OpenAI key in client code
- Do not import admin Supabase helper into client components
- Do not create client-side usage inserts
- Do not change auth helpers
- Do not weaken RLS

## Manual Supabase steps

If a migration is created, the user will run it manually in hosted Supabase SQL Editor.

Do not use local Supabase CLI.

## Important UI copy rule

Do not use long hyphens or em dashes anywhere in docs, comments, or prompts. Use normal hyphens only.

## Done criteria

- existing usage_events schema is inspected
- migration is created only if needed
- AI usage feature files exist
- speaking transcription records usage events
- speaking feedback records usage events
- writing feedback records usage events
- success events are tracked
- failure events are tracked
- estimated cost is recorded when possible
- token usage is recorded when available
- no user blocking is added
- no payment is built
- no credits are deducted
- no UI redesign is done
- no client component exposes secrets
- docs/product/ai-usage-instrumentation.md exists
- npm run lint passes
- npm run build passes
