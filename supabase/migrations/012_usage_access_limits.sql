-- USAGE-01: free attempt limit and premium access rules
-- Toronto Academy of Education CELPIP Preparation Program
-- Safe to run more than once.
--
-- USAGE-00 (migration 011) measures what the AI provider costs us.
-- This migration is the other half: it records what a learner is
-- allowed to consume, and charges exactly one scored attempt per saved
-- feedback report.
--
-- A scored attempt is one completed speaking or writing feedback
-- report. Opening a task, recording, uploading, saving a draft, a
-- failed AI call, a failed upload, and viewing a previous report are
-- never charged. See docs/product/usage-access-rules.md.
--
-- Nothing here collects payment. Paid balances are granted manually in
-- the SQL editor until a checkout ticket exists.
--
-- No existing table, column, or policy is changed by this file.

-- =========================================================
-- Tables
-- =========================================================

-- One row per learner. Created on demand by
-- ensure_learner_usage_account, so a learner who never asks for AI
-- feedback never gets a row.
create table if not exists public.learner_usage_accounts (
  user_id uuid primary key references auth.users (id) on delete cascade,
  -- The free preview. One scored attempt for every authenticated
  -- learner, tracked as total and used so a support grant can raise the
  -- total without rewriting history.
  free_scored_attempts_total integer not null default 1,
  free_scored_attempts_used integer not null default 0,
  -- One time balance from a pack or an admin grant. Decremented on use.
  paid_scored_attempts_balance integer not null default 0,
  -- Monthly allowance. Null plan code means the learner has no plan.
  monthly_plan_code text,
  monthly_scored_attempt_limit integer,
  monthly_scored_attempts_used integer not null default 0,
  monthly_period_start date,
  monthly_period_end date,
  -- 'active' or 'suspended'. Anything other than 'active' blocks all
  -- scored attempts regardless of the balances above.
  access_status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Columns are added defensively so a partially applied earlier run can
-- be brought up to date without dropping the table.
alter table public.learner_usage_accounts
  add column if not exists free_scored_attempts_total integer not null default 1;

alter table public.learner_usage_accounts
  add column if not exists free_scored_attempts_used integer not null default 0;

alter table public.learner_usage_accounts
  add column if not exists paid_scored_attempts_balance integer not null default 0;

alter table public.learner_usage_accounts
  add column if not exists monthly_plan_code text;

alter table public.learner_usage_accounts
  add column if not exists monthly_scored_attempt_limit integer;

alter table public.learner_usage_accounts
  add column if not exists monthly_scored_attempts_used integer not null default 0;

alter table public.learner_usage_accounts
  add column if not exists monthly_period_start date;

alter table public.learner_usage_accounts
  add column if not exists monthly_period_end date;

alter table public.learner_usage_accounts
  add column if not exists access_status text not null default 'active';

alter table public.learner_usage_accounts
  add column if not exists created_at timestamptz not null default now();

alter table public.learner_usage_accounts
  add column if not exists updated_at timestamptz not null default now();

-- One row per successfully charged scored attempt. This is the ledger:
-- if a row exists for an attempt, that attempt has been paid for and is
-- never charged again.
create table if not exists public.scored_attempt_consumptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  attempt_id uuid not null references public.attempts (id) on delete cascade,
  module_slug text not null,
  task_id uuid references public.tasks (id),
  -- free_trial, monthly_plan, paid_pack, or admin_grant.
  credit_source text not null,
  credits_used integer not null default 1,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

alter table public.scored_attempt_consumptions
  add column if not exists task_id uuid references public.tasks (id);

alter table public.scored_attempt_consumptions
  add column if not exists credits_used integer not null default 1;

alter table public.scored_attempt_consumptions
  add column if not exists metadata jsonb not null default '{}'::jsonb;

-- The idempotency guarantee. One attempt can only ever be charged once,
-- enforced by the database and not by application code.
create unique index if not exists scored_attempt_consumptions_attempt_id_key
  on public.scored_attempt_consumptions (attempt_id);

create index if not exists scored_attempt_consumptions_user_created_at_idx
  on public.scored_attempt_consumptions (user_id, created_at desc);

-- =========================================================
-- Constraints
-- =========================================================

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'learner_usage_accounts_access_status_check'
  ) then
    alter table public.learner_usage_accounts
      add constraint learner_usage_accounts_access_status_check
      check (access_status in ('active', 'suspended'));
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conname = 'learner_usage_accounts_non_negative_check'
  ) then
    alter table public.learner_usage_accounts
      add constraint learner_usage_accounts_non_negative_check
      check (
        free_scored_attempts_total >= 0
        and free_scored_attempts_used >= 0
        and paid_scored_attempts_balance >= 0
        and monthly_scored_attempts_used >= 0
      );
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conname = 'scored_attempt_consumptions_credit_source_check'
  ) then
    alter table public.scored_attempt_consumptions
      add constraint scored_attempt_consumptions_credit_source_check
      check (
        credit_source in ('free_trial', 'monthly_plan', 'paid_pack', 'admin_grant')
      );
  end if;
end
$$;

-- =========================================================
-- Functions
-- =========================================================

-- Returns the learner's usage account, creating it on first use and
-- rolling a finished monthly period forward. Unused monthly attempts do
-- not roll over, so the used counter resets with the new period.
--
-- The row is locked for update, so a caller that goes on to charge a
-- credit in the same transaction is already serialized against a
-- concurrent charge for the same learner.
create or replace function public.ensure_learner_usage_account(p_user_id uuid)
returns public.learner_usage_accounts
language plpgsql
as $$
declare
  v_account public.learner_usage_accounts;
  v_start date;
  v_end date;
begin
  if p_user_id is null then
    raise exception 'ensure_learner_usage_account requires a user id';
  end if;

  insert into public.learner_usage_accounts (user_id)
  values (p_user_id)
  on conflict (user_id) do nothing;

  select * into v_account
    from public.learner_usage_accounts
   where user_id = p_user_id
   for update;

  if v_account.monthly_plan_code is not null
     and v_account.monthly_period_start is not null
     and v_account.monthly_period_end is not null
     and v_account.monthly_period_end < current_date then
    v_start := v_account.monthly_period_start;
    v_end := v_account.monthly_period_end;

    -- Advance whole periods so a learner who was away for months lands
    -- on the current period rather than the next one after the old end.
    while v_end < current_date loop
      v_start := (v_start + interval '1 month')::date;
      v_end := (v_end + interval '1 month')::date;
    end loop;

    update public.learner_usage_accounts
       set monthly_period_start = v_start,
           monthly_period_end = v_end,
           monthly_scored_attempts_used = 0,
           updated_at = now()
     where user_id = p_user_id
    returning * into v_account;
  end if;

  return v_account;
end;
$$;

-- Read only access summary for one learner. Used by the access API and
-- by the server side check that runs before an expensive AI call.
create or replace function public.get_learner_usage_summary(p_user_id uuid)
returns jsonb
language plpgsql
as $$
declare
  v_account public.learner_usage_accounts;
  v_free integer;
  v_monthly integer;
  v_paid integer;
  v_total integer;
begin
  v_account := public.ensure_learner_usage_account(p_user_id);

  v_free := greatest(
    0,
    v_account.free_scored_attempts_total - v_account.free_scored_attempts_used
  );

  v_monthly := case
    when v_account.monthly_plan_code is null
      or v_account.monthly_scored_attempt_limit is null
    then 0
    else greatest(
      0,
      v_account.monthly_scored_attempt_limit - v_account.monthly_scored_attempts_used
    )
  end;

  v_paid := greatest(0, v_account.paid_scored_attempts_balance);

  -- A suspended account has no access, whatever the balances say.
  v_total := case
    when v_account.access_status <> 'active' then 0
    else v_free + v_monthly + v_paid
  end;

  return jsonb_build_object(
    'user_id', v_account.user_id,
    'access_status', v_account.access_status,
    'free_attempts_remaining', v_free,
    'monthly_attempts_remaining', v_monthly,
    'paid_attempts_remaining', v_paid,
    'total_attempts_remaining', v_total,
    'free_scored_attempts_total', v_account.free_scored_attempts_total,
    'free_scored_attempts_used', v_account.free_scored_attempts_used,
    'plan_code', v_account.monthly_plan_code,
    'monthly_scored_attempt_limit', v_account.monthly_scored_attempt_limit,
    'monthly_period_start', v_account.monthly_period_start,
    'monthly_period_end', v_account.monthly_period_end
  );
end;
$$;

-- Charges exactly one scored attempt for one attempt id.
--
-- Call this only after a feedback report has been saved. It is
-- idempotent: the unique index on attempt_id means a repeat call for
-- the same attempt returns the original charge instead of making a
-- second one.
--
-- Returns jsonb with a status of 'consumed', 'already_consumed', or
-- 'blocked', the credit_source that was used, and the refreshed
-- summary.
create or replace function public.consume_scored_attempt_credit(
  p_user_id uuid,
  p_attempt_id uuid,
  p_module_slug text,
  p_task_id uuid default null,
  p_metadata jsonb default '{}'::jsonb
)
returns jsonb
language plpgsql
as $$
declare
  v_account public.learner_usage_accounts;
  v_existing public.scored_attempt_consumptions;
  v_source text;
begin
  if p_user_id is null or p_attempt_id is null or p_module_slug is null then
    raise exception
      'consume_scored_attempt_credit requires a user id, an attempt id, and a module slug';
  end if;

  -- Locks the account row for the rest of the transaction, so two
  -- concurrent requests for the same learner cannot both spend the last
  -- credit.
  v_account := public.ensure_learner_usage_account(p_user_id);

  select * into v_existing
    from public.scored_attempt_consumptions
   where attempt_id = p_attempt_id;

  if found then
    if v_existing.user_id <> p_user_id then
      raise exception 'Attempt % does not belong to user %', p_attempt_id, p_user_id;
    end if;

    return jsonb_build_object(
      'status', 'already_consumed',
      'credit_source', v_existing.credit_source,
      'summary', public.get_learner_usage_summary(p_user_id)
    );
  end if;

  if v_account.access_status <> 'active' then
    return jsonb_build_object(
      'status', 'blocked',
      'credit_source', null,
      'summary', public.get_learner_usage_summary(p_user_id)
    );
  end if;

  -- Free preview first, then the monthly allowance, then the one time
  -- balance. Spending the perishable allowance before the balance that
  -- never expires is the order that costs the learner least.
  if v_account.free_scored_attempts_used < v_account.free_scored_attempts_total then
    v_source := 'free_trial';

    update public.learner_usage_accounts
       set free_scored_attempts_used = free_scored_attempts_used + 1,
           updated_at = now()
     where user_id = p_user_id;

  elsif v_account.monthly_plan_code is not null
        and v_account.monthly_scored_attempt_limit is not null
        and v_account.monthly_scored_attempts_used < v_account.monthly_scored_attempt_limit then
    v_source := 'monthly_plan';

    update public.learner_usage_accounts
       set monthly_scored_attempts_used = monthly_scored_attempts_used + 1,
           updated_at = now()
     where user_id = p_user_id;

  elsif v_account.paid_scored_attempts_balance > 0 then
    v_source := 'paid_pack';

    update public.learner_usage_accounts
       set paid_scored_attempts_balance = paid_scored_attempts_balance - 1,
           updated_at = now()
     where user_id = p_user_id;

  else
    return jsonb_build_object(
      'status', 'blocked',
      'credit_source', null,
      'summary', public.get_learner_usage_summary(p_user_id)
    );
  end if;

  insert into public.scored_attempt_consumptions (
    user_id,
    attempt_id,
    module_slug,
    task_id,
    credit_source,
    credits_used,
    metadata
  )
  values (
    p_user_id,
    p_attempt_id,
    p_module_slug,
    p_task_id,
    v_source,
    1,
    coalesce(p_metadata, '{}'::jsonb)
  );

  return jsonb_build_object(
    'status', 'consumed',
    'credit_source', v_source,
    'summary', public.get_learner_usage_summary(p_user_id)
  );
end;
$$;

-- =========================================================
-- Function privileges
-- =========================================================

-- These functions are security invoker on purpose. They are only ever
-- called by server code holding the service role key, which already
-- bypasses row level security. Revoking execute from anon and
-- authenticated means a browser cannot call them even with a valid
-- session, so no learner can grant or spend credits directly.

revoke all on function public.ensure_learner_usage_account(uuid) from public;
revoke all on function public.get_learner_usage_summary(uuid) from public;
revoke all on function public.consume_scored_attempt_credit(uuid, uuid, text, uuid, jsonb) from public;

grant execute on function public.ensure_learner_usage_account(uuid) to service_role;
grant execute on function public.get_learner_usage_summary(uuid) to service_role;
grant execute on function public.consume_scored_attempt_credit(uuid, uuid, text, uuid, jsonb) to service_role;

-- =========================================================
-- Row level security
-- =========================================================

alter table public.learner_usage_accounts enable row level security;
alter table public.scored_attempt_consumptions enable row level security;

-- learner_usage_accounts: a learner can read their own balances and
-- nothing else. There is deliberately no insert, update, or delete
-- policy, so the browser cannot give itself credits. All writes happen
-- through the functions above using the service role.
do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'learner_usage_accounts'
      and policyname = 'learner_usage_accounts_select_own'
  ) then
    create policy "learner_usage_accounts_select_own"
      on public.learner_usage_accounts for select
      to authenticated
      using (auth.uid() = user_id);
  end if;

  -- scored_attempt_consumptions: a learner can read their own charge
  -- history. Same rule, inserts are server side only.
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'scored_attempt_consumptions'
      and policyname = 'scored_attempt_consumptions_select_own'
  ) then
    create policy "scored_attempt_consumptions_select_own"
      on public.scored_attempt_consumptions for select
      to authenticated
      using (auth.uid() = user_id);
  end if;
end
$$;
