# Phase 2 preview on branch phase2/avinash

Deploy this branch on Vercel. Do not merge it to main until the preview has been checked.

## Vercel

- Framework: Next.js
- Production branch stays `main`. Attach this branch as a preview deployment.
- Set `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `NEXT_PUBLIC_APP_URL`, and `ADMIN_EMAILS` in the Vercel project. Keys stay in the business owner account.

## Supabase

Run `supabase/migrations/015_phase2_avinash_public.sql` on the project after the earlier migrations. Public reads are limited to published testimonials, draws, and published page copy. Writes go through server routes.

## Checks before a pull request

`npm test` runs the unit tests. `npm run lint` is the pre-commit check together with the tests. `npm run test:e2e` opens the public pages at 375px and fails if the page scrolls sideways.

## Admin

Draws are added at `/dashboard/admin/draws`. A non-admin request to `POST /api/draws` returns 403. Consultant details are not in the public HTML. `GET /api/consultant` returns 403 until a referral consent exists.
