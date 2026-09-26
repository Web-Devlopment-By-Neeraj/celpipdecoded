# Usage Access Rules

USAGE-01. Free attempt limit and premium access rules for AI scored
CELPIP practice.

Product: Toronto Academy of Education CELPIP Preparation Program.

USAGE-00 measures what the AI provider costs us. USAGE-01 decides
whether a learner is allowed to make that call. Both stay in place:
`usage_events` records AI activity and estimated provider cost,
`scored_attempt_consumptions` records learner access consumption.

No payment is collected anywhere in this ticket. There is no Stripe
integration and no checkout. Paid balances are granted manually in the
Supabase SQL editor until a payment ticket exists.

## 1. What counts as a scored attempt

A scored attempt is one completed AI feedback report:

- one saved speaking feedback report, or
- one saved writing feedback report

The charge happens after the score row is written and the attempt is
marked ready. Nothing earlier in the flow charges anything.

## 2. What does not count

None of these consume a scored attempt:

- opening a task or reading a prompt
- starting or running a timed practice session
- recording audio
- uploading audio
- saving a writing draft or a writing response
- transcription on its own
- a failed AI request
- a failed upload or a failed save
- refreshing a result page
- viewing a previous feedback report
- viewing speaking or writing history

Transcription is never charged separately. A speaking feedback run may
need transcription first, but the scored attempt is consumed only after
the final feedback report is saved.

## 3. Free attempt rule

Every authenticated learner gets 1 free scored attempt.

The free preview is stored as `free_scored_attempts_total` (default 1)
and `free_scored_attempts_used` (default 0), so staff can raise the
total for a support case without rewriting history.

After the free attempt is used, the learner needs access from another
source or the AI feedback request is blocked.

## 4. Access sources

Access is spent in this order:

1. `free_trial` - the learner's 1 free scored attempt
2. `monthly_plan` - a monthly allowance, if a plan is granted
3. `paid_pack` - a one time balance from a pack or an admin grant

The perishable monthly allowance is spent before the balance that never
expires, which is the order that costs the learner least.

`admin_grant` exists in the credit source vocabulary for a future grant
ledger. Today an admin grant is added to
`paid_scored_attempts_balance`, so it is spent as `paid_pack`.

Future packages, for reference only, not built here:

- Starter Pack: 5 scored attempts
- Practice Pack: 12 scored attempts
- Monthly Practice Plan: 40 scored attempts per month

## 5. Database tables

Migration: `supabase/migrations/012_usage_access_limits.sql`.

### public.learner_usage_accounts

One row per learner, created on first use.

| Column | Meaning |
| --- | --- |
| `user_id` | Primary key, references `auth.users` |
| `free_scored_attempts_total` | Free preview size, default 1 |
| `free_scored_attempts_used` | Free preview attempts spent |
| `paid_scored_attempts_balance` | One time balance, decremented on use |
| `monthly_plan_code` | Null when the learner has no plan |
| `monthly_scored_attempt_limit` | Attempts allowed per period |
| `monthly_scored_attempts_used` | Attempts spent in the current period |
| `monthly_period_start` | Current period start date |
| `monthly_period_end` | Current period end date |
| `access_status` | `active` or `suspended` |
| `created_at`, `updated_at` | Timestamps |

A `suspended` account has zero access whatever the balances say.

### public.scored_attempt_consumptions

One row per successfully charged scored attempt. This is the ledger.

| Column | Meaning |
| --- | --- |
| `id` | Primary key |
| `user_id` | References `auth.users` |
| `attempt_id` | References `public.attempts`, unique |
| `module_slug` | `celpip-speaking` or `celpip-writing` |
| `task_id` | References `public.tasks` |
| `credit_source` | `free_trial`, `monthly_plan`, `paid_pack`, `admin_grant` |
| `credits_used` | Always 1 today |
| `metadata` | Free form context, for example the estimated level |
| `created_at` | Timestamp |

The unique index on `attempt_id` is the idempotency guarantee.

### Functions

- `public.ensure_learner_usage_account(uuid)` - creates the account row
  on first use, rolls a finished monthly period forward, and locks the
  row for the rest of the transaction
- `public.get_learner_usage_summary(uuid)` - read only access summary
- `public.consume_scored_attempt_credit(uuid, uuid, text, uuid, jsonb)` -
  charges exactly one scored attempt

All three are security invoker. Execute is revoked from `public`, so
neither `anon` nor `authenticated` can call them, and granted to
`service_role`. Only server code holding the service role key can
charge or read balances.

### Row level security

RLS is enabled on both tables.

- learners can select their own `learner_usage_accounts` row
- learners can select their own `scored_attempt_consumptions` rows
- there is no insert, update, or delete policy on either table, so a
  browser cannot grant itself credits
- all writes happen server side with the service role, which bypasses
  RLS

No existing policy from earlier migrations is changed or weakened.

## 6. Consumption flow

Speaking, in `src/features/speaking/generate-speaking-feedback.ts`:

1. Verify the attempt exists and belongs to the caller
2. If the attempt is already `feedback_ready` with a saved score,
   return that report and stop, so no check and no charge happens
3. Check access with `checkScoredAttemptAccess`. If blocked, return 402
   before any OpenAI call
4. Transcribe if needed, then score the transcript
5. Save the score row
6. Mark the attempt `feedback_ready`
7. Charge one scored attempt with `consumeScoredAttemptCredit`
8. Award the practice badge

Writing, in `src/features/writing/generate-writing-feedback.ts`, follows
the same order with `writing_feedback_ready`.

Transcription, in `src/features/speaking/transcribe-attempt.ts`, runs
the same access check before it downloads audio or calls OpenAI, because
`/api/speaking/transcribe` can be reached on its own. It never charges.

Inside `consume_scored_attempt_credit`:

1. Ensure the account row exists and lock it
2. Roll a finished monthly period forward
3. If a consumption row already exists for the attempt, return
   `already_consumed` without charging again
4. If `access_status` is not `active`, return `blocked`
5. Pick `free_trial`, then `monthly_plan`, then `paid_pack`
6. If no source has access left, return `blocked`
7. Update the account counters
8. Insert the `scored_attempt_consumptions` row
9. Return the credit source and the refreshed summary

## 7. Idempotency rules

- `attempt_id` is unique in `scored_attempt_consumptions`, so one
  attempt can only ever be charged once
- the account row is locked for update before the balance is read, so
  two concurrent requests for the same learner cannot both spend the
  last credit
- a repeat charge for the same attempt returns `already_consumed` with
  the original credit source
- an attempt that already has a saved report returns that report before
  the access check runs, so a refresh charges nothing
- a failed OpenAI call returns before the charge, so it charges nothing
- a failed score save returns before the charge, so it charges nothing
- an attempt that has already been charged stays retryable even when the
  balance is now empty, because `checkScoredAttemptAccess` looks at the
  ledger before the summary
- viewing history or a previous report never touches this code

Charging is best effort in one direction only: the feedback is already
saved by the time the charge runs, so a charge failure is logged and
never turned into an error the learner sees. The pre-flight check is
what holds the line.

## 8. Manual admin grant steps

Run these in the hosted Supabase SQL editor. Replace `<USER_ID>` with
the learner's `auth.users.id`.

Create the account row if it does not exist yet:

```sql
insert into public.learner_usage_accounts (user_id)
values ('<USER_ID>')
on conflict (user_id) do nothing;
```

Grant 5 extra scored attempts:

```sql
update public.learner_usage_accounts
set paid_scored_attempts_balance = paid_scored_attempts_balance + 5,
    updated_at = now()
where user_id = '<USER_ID>';
```

Grant a monthly plan for the current month:

```sql
update public.learner_usage_accounts
set monthly_plan_code = 'monthly-practice-plan',
    monthly_scored_attempt_limit = 40,
    monthly_scored_attempts_used = 0,
    monthly_period_start = date_trunc('month', current_date)::date,
    monthly_period_end = (date_trunc('month', current_date) + interval '1 month - 1 day')::date,
    updated_at = now()
where user_id = '<USER_ID>';
```

Reset a learner's free preview for testing:

```sql
update public.learner_usage_accounts
set free_scored_attempts_used = 0,
    updated_at = now()
where user_id = '<USER_ID>';

delete from public.scored_attempt_consumptions
where user_id = '<USER_ID>';
```

Put an account on hold:

```sql
update public.learner_usage_accounts
set access_status = 'suspended', updated_at = now()
where user_id = '<USER_ID>';
```

This is admin and testing only until payment is built.

## 9. API behavior when blocked

`POST /api/speaking/feedback`, `POST /api/writing/evaluate`, and
`POST /api/speaking/transcribe` return HTTP 402 with:

```json
{
  "ok": false,
  "error": "No scored attempts remaining",
  "code": "NO_SCORED_ATTEMPTS_REMAINING"
}
```

The client matches on `code`, never on the message.

`GET /api/usage/access` returns the signed in learner's access summary:

```json
{
  "ok": true,
  "accessStatus": "active",
  "freeAttemptsRemaining": 1,
  "paidAttemptsRemaining": 0,
  "monthlyAttemptsRemaining": 0,
  "totalAttemptsRemaining": 1,
  "planCode": null,
  "monthlyPeriod": null
}
```

The user comes from the session cookies and is validated against
Supabase, so the route can only ever describe the caller's own access.
It never reads a user id from the request.

The blocked UI message is:

> You have used your free AI feedback report. To continue practising
> with AI feedback, please request access or choose a practice package.

Actions offered: Request access, Back to dashboard, View previous
feedback. Request access points at the academy inquiry form. There is no
checkout.

## 10. How this prepares payment

A later payment ticket needs to do one thing: add attempts to an
account after a confirmed purchase.

- packs increment `paid_scored_attempts_balance`
- a subscription sets `monthly_plan_code`,
  `monthly_scored_attempt_limit`, and the period dates
- the spend order, the ledger, the idempotency guarantee, the blocked
  response, and the access UI already exist and do not change

Nothing in the enforcement path needs to know how the attempts were
bought.

## 11. How to test locally

1. Apply the migration in the hosted Supabase SQL editor, see section 12
2. Sign in as a test learner
3. Open `/dashboard`. The access card shows 1 free attempt remaining
4. Open `/dashboard/speaking` or `/dashboard/writing`. The balance badge
   shows the same number
5. Call `GET /api/usage/access` in the browser. It returns the same
   numbers for the signed in learner only
6. Complete one speaking or writing attempt through to a saved feedback
   report. The dashboard now shows 0 remaining, and
   `scored_attempt_consumptions` has one row
7. Refresh the result page and open it from history. No new row appears
   and the balance does not move
8. Start a second attempt and submit it for feedback. The request is
   blocked with 402 and the access message appears with the three
   actions
9. Grant 5 attempts with the SQL in section 8, reload, and confirm the
   next attempt succeeds and spends from `paid_pack`
10. To confirm a failure does not charge, temporarily set an invalid
    `OPENAI_API_KEY` in the local environment, submit an attempt, and
    check that `scored_attempt_consumptions` gained no row while
    `usage_events` recorded a failed row

## 12. Manual Supabase migration steps

Hosted Supabase only. Do not use the Supabase CLI and do not run a local
Supabase instance.

1. Open the Supabase dashboard for the project
2. Go to SQL Editor and start a new query
3. Paste the whole contents of
   `supabase/migrations/012_usage_access_limits.sql`
4. Run it. The file is safe to run more than once
5. Confirm `public.learner_usage_accounts` and
   `public.scored_attempt_consumptions` appear in Table Editor
6. Confirm RLS is enabled on both tables and each has exactly one select
   policy
7. Confirm the three functions exist under Database, Functions

No secret values are needed for this migration. Never paste an API key
into the SQL editor.
