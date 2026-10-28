-- Task 3: two free AI feedback reports — 1 Speaking, 1 Writing (separate buckets).

alter table public.learner_usage_accounts
  add column if not exists free_speaking_scored_total integer not null default 1,
  add column if not exists free_speaking_scored_used integer not null default 0,
  add column if not exists free_writing_scored_total integer not null default 1,
  add column if not exists free_writing_scored_used integer not null default 0;

update public.learner_usage_accounts
set
  free_speaking_scored_total = 1,
  free_writing_scored_total = 1
where free_speaking_scored_total is distinct from 1
   or free_writing_scored_total is distinct from 1;

-- Rebuild module free usage from the ledger where possible.
update public.learner_usage_accounts
set free_speaking_scored_used = 0,
    free_writing_scored_used = 0;

update public.learner_usage_accounts a
set free_speaking_scored_used = 1
where exists (
  select 1
  from public.scored_attempt_consumptions c
  where c.user_id = a.user_id
    and c.credit_source = 'free_trial'
    and c.module_slug = 'celpip-speaking'
);

update public.learner_usage_accounts a
set free_writing_scored_used = 1
where exists (
  select 1
  from public.scored_attempt_consumptions c
  where c.user_id = a.user_id
    and c.credit_source = 'free_trial'
    and c.module_slug = 'celpip-writing'
);

-- Legacy shared counter: if the old single free was marked used but slug
-- was missing on an old row, treat it as speaking only (one-time migration).
update public.learner_usage_accounts a
set free_speaking_scored_used = 1
where a.free_scored_attempts_used >= 1
  and a.free_speaking_scored_used = 0
  and a.free_writing_scored_used = 0
  and not exists (
    select 1
    from public.scored_attempt_consumptions c
    where c.user_id = a.user_id
      and c.credit_source = 'free_trial'
  );

create or replace function public.get_learner_usage_summary(p_user_id uuid)
returns jsonb
language plpgsql
as $$
declare
  v_account public.learner_usage_accounts;
  v_free_speaking integer;
  v_free_writing integer;
  v_free integer;
  v_monthly integer;
  v_paid integer;
  v_total integer;
begin
  v_account := public.ensure_learner_usage_account(p_user_id);

  v_free_speaking := greatest(
    0,
    v_account.free_speaking_scored_total - v_account.free_speaking_scored_used
  );

  v_free_writing := greatest(
    0,
    v_account.free_writing_scored_total - v_account.free_writing_scored_used
  );

  v_free := v_free_speaking + v_free_writing;

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

  v_total := case
    when v_account.access_status <> 'active' then 0
    else v_free + v_monthly + v_paid
  end;

  return jsonb_build_object(
    'user_id', v_account.user_id,
    'access_status', v_account.access_status,
    'free_attempts_remaining', v_free,
    'free_speaking_remaining', v_free_speaking,
    'free_writing_remaining', v_free_writing,
    'monthly_attempts_remaining', v_monthly,
    'paid_attempts_remaining', v_paid,
    'total_attempts_remaining', v_total,
    'free_scored_attempts_total', v_free_speaking + v_free_writing,
    'free_scored_attempts_used',
      v_account.free_speaking_scored_used + v_account.free_writing_scored_used,
    'free_speaking_scored_total', v_account.free_speaking_scored_total,
    'free_speaking_scored_used', v_account.free_speaking_scored_used,
    'free_writing_scored_total', v_account.free_writing_scored_total,
    'free_writing_scored_used', v_account.free_writing_scored_used,
    'plan_code', v_account.monthly_plan_code,
    'monthly_scored_attempt_limit', v_account.monthly_scored_attempt_limit,
    'monthly_period_start', v_account.monthly_period_start,
    'monthly_period_end', v_account.monthly_period_end
  );
end;
$$;

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

  if p_module_slug = 'celpip-speaking'
     and v_account.free_speaking_scored_used < v_account.free_speaking_scored_total then
    v_source := 'free_trial';
    update public.learner_usage_accounts
       set free_speaking_scored_used = free_speaking_scored_used + 1,
           updated_at = now()
     where user_id = p_user_id;

  elsif p_module_slug = 'celpip-writing'
        and v_account.free_writing_scored_used < v_account.free_writing_scored_total then
    v_source := 'free_trial';
    update public.learner_usage_accounts
       set free_writing_scored_used = free_writing_scored_used + 1,
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
