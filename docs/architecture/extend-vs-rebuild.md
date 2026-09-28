# Extend the existing Next.js app

Date: 29 Sep 2026
Decision: extend. Do not rebuild.

## What is already here

The live codebase is Next.js 16 with the app router, React 19, Tailwind, and Supabase (auth, Postgres, private audio storage). Speaking practice, writing practice, the mock-test builder, and the Mock Test 1 player are already in the repo. Replacing that would throw away working student flows.

## What we keep

- The domain celpipdecoded.com
- The Next.js app and the existing Supabase project
- Early-access rows in `early_access_leads`. Import them as leads. Do not email them unless a consent row exists.
- Hosting stays on Vercel. The database stays on Supabase. Prefer a Canadian region when the project is created (legal placeholder: hosting region).

## What this change adds

Entitlements, a settings table, the CRS calculator, evaluation queue rules, the server-side mock script, payments, batches, calendar helpers, the lesson sandbox, video tokens, the assistant, the diagnose loop, and cohort reporting. New tables are in `supabase/migrations/015_platform_schema.sql`. They sit beside the builder tables. `mock_tests` is not recreated.

## Organisations later

Entitlements point at `user_id` and `source_purchase_id` separately. One purchase can grant several users. An `organisations` table and `users.organisation_id` can be added later without rewriting entitlements.

## Cookies

Session cookies stay host-only. They are not set with `Domain=.celpipdecoded.com`, so `lessons.celpipdecoded.com` does not receive them.
