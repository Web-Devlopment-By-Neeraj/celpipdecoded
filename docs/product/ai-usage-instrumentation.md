# AI usage instrumentation and cost tracking

Toronto Academy of Education CELPIP Preparation Program
Ticket: USAGE-00

This document describes how the app measures its AI usage.

This is measurement only. Nothing described here blocks a user, counts an
attempt against a quota, deducts a credit, or charges anyone. USAGE-01
will add free attempts, packages, and premium access on top of the data
collected here.

## 1. What is tracked

Every paid OpenAI call made on behalf of a student writes one row to
`public.usage_events`.

Columns used by AI usage events:

| Column | Meaning |
| --- | --- |
| `id` | Row id |
| `user_id` | The student the call was made for |
| `attempt_id` | The attempt the call belongs to |
| `task_id` | The CELPIP task being practised |
| `module_slug` | `celpip-speaking` or `celpip-writing` |
| `event_type` | See section 3 |
| `provider` | Always `openai` today |
| `model` | The model id actually sent to the provider |
| `endpoint` | `audio.transcriptions.create` or `chat.completions.create` |
| `status` | `succeeded` or `failed` |
| `prompt_tokens` | Input tokens, when the provider reports them |
| `completion_tokens` | Output tokens, when the provider reports them |
| `total_tokens` | Total tokens, when the provider reports them |
| `audio_duration_seconds` | Audio length, when the provider reports it |
| `input_size_bytes` | Audio file size, or response text size in bytes |
| `estimated_cost_usd` | Approximate provider cost, or null |
| `latency_ms` | Wall clock time of the provider call only |
| `error_code` | Coarse failure bucket, see section 4 |
| `error_message` | Short provider or validation message, truncated to 500 characters |
| `metadata` | Small jsonb blob of extra context |
| `created_at` | Insert time |

`metadata` never contains a prompt, a transcript, a student response, or
any credential. It holds small facts such as `reached_provider` and
`cost_estimate_verified`.

Rows written before USAGE-00 have a null `status` and null AI columns.
They were not backfilled, because backfilling would invent measurements
that were never taken. Filter on `status is not null` when reading AI
usage.

## 2. Where events are recorded

| Location | Call instrumented |
| --- | --- |
| `src/features/speaking/transcribe-attempt.ts` | `openai.audio.transcriptions.create` |
| `src/features/speaking/generate-speaking-feedback.ts` | `openai.chat.completions.create` for speaking scoring |
| `src/features/writing/generate-writing-feedback.ts` | `openai.chat.completions.create` for writing scoring |

Supporting files:

- `src/features/usage/ai-usage-types.ts` - event type, status, provider, module, and endpoint vocabulary
- `src/features/usage/ai-cost-estimates.ts` - approximate provider cost estimation
- `src/features/usage/ai-usage-metadata.ts` - reads token usage and audio duration from provider responses, buckets thrown errors
- `src/features/usage/record-ai-usage-event.ts` - the single writer, server only

Rules that the writer follows:

- Recording is best effort. `recordAiUsageEvent` never throws. If the
  insert fails it logs and returns, so instrumentation can never change
  what a student sees.
- One event per paid provider call. A speaking feedback request that
  also has to transcribe writes two events: one
  `speaking_transcription` and one `speaking_feedback`.
- Early returns that avoid a provider call write no event. An attempt
  that already has a transcript or a saved score short circuits before
  OpenAI and correctly costs nothing.
- The writer uses the service role client. It must never be imported
  into a client component.

## 3. Event types

- `speaking_transcription` - audio to text for a speaking attempt
- `speaking_feedback` - CELPIP scoring of a speaking transcript
- `writing_feedback` - CELPIP scoring of a writing response

## 4. Status values

Only terminal outcomes are recorded:

- `succeeded` - the provider call returned and the result was usable
- `failed` - the call threw, returned nothing usable, or failed validation

A `started` status was considered and skipped. It would double the row
count, and these pipelines are short enough that a missing terminal row
already tells us the request died.

`error_code` buckets a failure:

- `rate_limited` - provider returned 429
- `provider_error` - any other provider HTTP error
- `timeout` - request aborted or connection timed out
- `invalid_response` - JSON parse or zod validation failed
- `empty_response` - transcription returned an empty transcript
- `storage_error` - attempt audio could not be downloaded, so OpenAI was never called
- `unknown` - anything else

A failed event can still carry tokens and a cost. If the provider
answered and only validation failed, the call was still billed, so the
usage figures are recorded.

## 5. Cost-estimate limitations

`estimated_cost_usd` is an approximate provider cost. It is not a
customer price and it is not a billing source of truth.

Known limitations:

1. The rates in `ai-cost-estimates.ts` are placeholders in the right
   order of magnitude, not confirmed prices. Every rate must be checked
   against the current OpenAI pricing page before launch. Each event
   carries `metadata.cost_estimate_verified` so a report can exclude
   unverified estimates.
2. Unknown models return null. A model id with no entry in the pricing
   table produces no estimate rather than a guess.
3. Transcription usually has no usage signal. The `json` response format
   does not include a duration, and the audio models do not always
   report tokens, so `audio_duration_seconds` and the token columns are
   often null and the cost is null with them. `input_size_bytes` is
   always recorded and is a usable proxy for relative volume. Switching
   the transcription call to `verbose_json` would start populating the
   duration with no other code change.
4. When only a total token count is reported, the whole total is priced
   at the input rate. This understates output heavy calls.
5. Cached input tokens, batch discounts, and reasoning tokens are not
   modelled at all.

Treat the sum of `estimated_cost_usd` as a lower bound and a trend line,
not an invoice. Reconcile against the OpenAI dashboard before any
pricing decision.

## 6. Known duplicate-risk areas

USAGE-00 does not solve duplicate requests. It records them, which is
how we will size the problem for USAGE-01.

Existing protection today:

- A speaking attempt already transcribed returns its saved transcript
  without calling OpenAI.
- A speaking or writing attempt already in a feedback ready state with a
  saved score returns its result route without calling OpenAI.
- Writing evaluation only runs from `writing_submitted` or
  `writing_evaluation_failed`.

Remaining risks:

1. Double click on Submit. Two requests can pass the status check
   together before either one writes a status, and both will pay for a
   full scoring call.
2. Browser refresh while feedback is processing. The first request keeps
   running server side and the second starts a new one.
3. Retry after a client timeout. The provider call may still be in
   flight and billed.
4. A failed attempt retried by the user. This is intended behaviour, but
   it means one attempt can cost several calls, so cost per attempt must
   be measured per attempt and not per user.
5. Speaking feedback on an attempt with no transcript triggers a
   transcription inside the same request. That is one attempt and two
   billed calls, which is expected and visible as two rows.

To size the problem, group `usage_events` by `attempt_id` and
`event_type` and look for counts above one.

USAGE-01 should add a real lock or an idempotency key, not just a status
check.

## 7. Manual Supabase migration steps

Run this in the hosted Supabase SQL editor. Do not use the local
Supabase CLI.

1. Open the Supabase dashboard, then SQL Editor.
2. Paste the full contents of
   `supabase/migrations/011_ai_usage_instrumentation.sql`.
3. Run it.

The migration is safe to run more than once. It only uses
`alter table ... add column if not exists` and
`create index if not exists`.

What it does:

- Adds the AI columns listed in section 1 to the existing
  `public.usage_events` table from migration 001.
- Adds indexes on `attempt_id`, on `(event_type, created_at desc)`, and
  on `(user_id, created_at desc)`.

What it does not do:

- It creates no new table. `usage_events` is reused.
- It removes no column.
- It changes no policy. Row level security stays exactly as migration
  001 left it: authenticated users can select their own rows, there is
  no insert policy so the browser cannot write, and server code inserts
  with the service role, which bypasses RLS.

## 8. How to test

Prerequisites: migration 011 applied, `OPENAI_API_KEY` and
`SUPABASE_SERVICE_ROLE_KEY` set in the server environment.

Success path, speaking:

1. Sign in and record a speaking attempt.
2. Request feedback.
3. In the SQL editor, run:

```sql
select event_type, status, model, endpoint,
       prompt_tokens, completion_tokens, total_tokens,
       audio_duration_seconds, input_size_bytes,
       estimated_cost_usd, latency_ms, metadata, created_at
from public.usage_events
where attempt_id = '<attempt id>'
order by created_at;
```

Expect one `speaking_transcription` row and one `speaking_feedback` row,
both `succeeded`, both with a non-null `latency_ms`. The feedback row
should have token counts. The transcription row will often have null
tokens and a null cost, which is expected.

Success path, writing:

1. Submit a writing attempt and request evaluation.
2. Run the same query. Expect one `writing_feedback` row with
   `succeeded`, token counts, and a non-null `input_size_bytes`.

Failure path:

1. Temporarily set `OPENAI_SCORING_MODEL` to a model id that does not
   exist and restart the server.
2. Request speaking feedback.
3. Expect the existing error message in the UI, the attempt status
   `scoring_failed`, and one `speaking_feedback` row with `failed` and
   an `error_code` of `provider_error`.
4. Restore the environment variable.

Instrumentation safety:

1. Rename `usage_events` in a scratch project, or revoke insert, so the
   insert fails.
2. Request feedback. The student flow must still work end to end, with
   only a console error from the usage writer.

Client safety:

1. `npm run build`, then confirm the client bundle contains no service
   role key and no OpenAI key. `record-ai-usage-event.ts` is imported
   only by server side feature modules that already used the service
   role client.

## 9. How this prepares USAGE-01

USAGE-01 needs to answer three questions before it can enforce anything.
This ticket makes all three answerable with SQL:

1. What does one attempt actually cost us? Group `estimated_cost_usd`,
   tokens, and `input_size_bytes` by `attempt_id` and `event_type`.
2. How much AI does a real student use? Count `succeeded` events per
   `user_id` per month, split by `module_slug`.
3. How much waste is there? Look at `failed` events by `error_code`, and
   at duplicate counts per `attempt_id` from section 6.

The shape of the data also matches what enforcement will need:
`user_id` plus `event_type` plus `created_at` is exactly the index used
to count a student's attempts inside a period, which is why
`(user_id, created_at desc)` is indexed here.

USAGE-01 should add, on top of this table and not in place of it:

- a free attempt allowance checked before the provider call
- a real idempotency guard for the duplicate risks in section 6
- confirmed provider pricing, replacing the placeholder rates
- an entitlement record for packages and premium access
