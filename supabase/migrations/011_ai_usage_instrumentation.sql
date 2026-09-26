-- USAGE-00: AI usage instrumentation and cost tracking
-- Toronto Academy of Education CELPIP Preparation Program
-- Safe to run more than once.
--
-- public.usage_events already exists from migration 001 with a minimal
-- shape (id, user_id, event_type, module_slug, attempt_id, created_at).
-- This migration reuses that table instead of creating a second usage
-- table. It only adds the AI specific columns that are missing.
--
-- No existing column is removed and no existing policy is changed.
-- Row level security stays as migration 001 left it:
--   - authenticated users can select their own usage_events
--   - there is no insert policy, so the browser cannot insert
--   - server code inserts with the service role, which bypasses RLS
--
-- This ticket records measurement only. It does not enforce free
-- attempts, deduct credits, or block any user.

-- =========================================================
-- Columns
-- =========================================================

alter table public.usage_events
  add column if not exists task_id uuid references public.tasks (id) on delete set null;

alter table public.usage_events
  add column if not exists provider text default 'openai';

alter table public.usage_events
  add column if not exists model text;

alter table public.usage_events
  add column if not exists endpoint text;

-- Nullable on purpose. Rows written before this migration have no
-- status, and backfilling them would invent data that was never
-- measured. New AI rows always set 'succeeded' or 'failed'.
alter table public.usage_events
  add column if not exists status text;

alter table public.usage_events
  add column if not exists prompt_tokens integer;

alter table public.usage_events
  add column if not exists completion_tokens integer;

alter table public.usage_events
  add column if not exists total_tokens integer;

alter table public.usage_events
  add column if not exists audio_duration_seconds integer;

alter table public.usage_events
  add column if not exists input_size_bytes integer;

-- Provider cost estimate, not a user price. Null when the cost cannot
-- be estimated safely. See docs/product/ai-usage-instrumentation.md.
alter table public.usage_events
  add column if not exists estimated_cost_usd numeric(10, 6);

alter table public.usage_events
  add column if not exists latency_ms integer;

alter table public.usage_events
  add column if not exists error_code text;

alter table public.usage_events
  add column if not exists error_message text;

alter table public.usage_events
  add column if not exists metadata jsonb default '{}'::jsonb;

-- =========================================================
-- Indexes
-- =========================================================

-- usage_events_user_id_idx already exists from migration 001.

create index if not exists usage_events_attempt_id_idx
  on public.usage_events (attempt_id);

create index if not exists usage_events_event_type_created_at_idx
  on public.usage_events (event_type, created_at desc);

create index if not exists usage_events_user_created_at_idx
  on public.usage_events (user_id, created_at desc);
