-- One paid 1:1 with Amar. A hold blocks a time while checkout is open.
-- needs_slot means the card payment succeeded and the time was taken,
-- so the student picks another time without a second charge or a refund.

create table if not exists public.private_session_bookings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  starts_at timestamptz,
  ends_at timestamptz,
  status text not null check (status in ('held', 'confirmed', 'cancelled', 'needs_slot')),
  held_until timestamptz,
  stripe_session_id text,
  purchase_id uuid,
  google_event_id text,
  meet_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists private_session_one_active_slot
  on public.private_session_bookings (starts_at)
  where status in ('held', 'confirmed');

create unique index if not exists private_session_one_hold_per_user
  on public.private_session_bookings (user_id)
  where status = 'held';

create unique index if not exists private_session_one_credit_per_user
  on public.private_session_bookings (user_id)
  where status = 'needs_slot';

create index if not exists private_session_user_status_idx
  on public.private_session_bookings (user_id, status, starts_at);

alter table public.private_session_bookings enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'private_session_bookings'
      and policyname = 'private_session_select_own'
  ) then
    create policy "private_session_select_own"
      on public.private_session_bookings for select
      using (auth.uid() = user_id);
  end if;
end $$;
