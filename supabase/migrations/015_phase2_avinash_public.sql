-- Phase 2 public site tables for the Avinash task pack.
-- Safe to run more than once. Writes from the browser are denied.
-- Server routes use the service role after an admin or session check.

create table if not exists public.app_settings (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now()
);

create table if not exists public.page_copy (
  key text primary key,
  body text not null,
  published boolean not null default false,
  updated_at timestamptz not null default now()
);

create table if not exists public.ee_draws (
  id uuid primary key default gen_random_uuid(),
  draw_date date not null,
  draw_type text not null,
  invitations integer not null check (invitations > 0),
  min_crs integer not null check (min_crs between 0 and 1200),
  tie_break timestamptz,
  source_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.testimonials (
  id uuid primary key default gen_random_uuid(),
  first_name text not null,
  listening integer not null,
  reading integer not null,
  writing integer not null,
  speaking integer not null,
  before_scores jsonb,
  quote text not null,
  proof_type text,
  first_attempt boolean not null default false,
  consent_received_at timestamptz,
  published boolean not null default false,
  covered_proof boolean not null default false,
  test_date date
);

alter table public.testimonials enable row level security;
alter table public.ee_draws enable row level security;
alter table public.page_copy enable row level security;

drop policy if exists testimonials_public_read on public.testimonials;
create policy testimonials_public_read on public.testimonials
  for select using (published = true and consent_received_at is not null);

drop policy if exists draws_public_read on public.ee_draws;
create policy draws_public_read on public.ee_draws for select using (true);

drop policy if exists page_copy_public_read on public.page_copy;
create policy page_copy_public_read on public.page_copy
  for select using (published = true);
