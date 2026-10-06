# Still to do

Status on 30 Sep 2026. This is the work that is not finished. The line-by-line task-pack gaps are in [remaining.md](remaining.md).

Secrets stay in `.env.local`. Do not paste them into this file or into git.

## Already in `.env.local`

- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_ROLE_KEY`
- `OPENAI_API_KEY` and the three model names
- `CAL_API_KEY`
- `ADMIN_EMAILS` for gsahil0508@gmail.com, neeraj190499@gmail.com, and avisingh0002@gmail.com
- Local `CRON_SECRET` and `MEDIA_SIGNING_SECRET`
- `NEXT_PUBLIC_APP_URL` set to `http://localhost:3000`

The OpenAI key, the Cal.com key, and the Supabase service role key were pasted in chat. Rotate them in each provider, then replace the values in `.env.local`.

## 1. Supabase Auth callback

Sign-in emails will not return to the app until this is saved.

1. Open [Authentication URL configuration](https://supabase.com/dashboard/project/ewykjltuiipmyrybetbk/auth/url-configuration).
2. In the dashboard: the project, then **Authentication**, then **URL Configuration**.
3. Set **Site URL** to `http://localhost:3000`.
4. Add redirect URL `http://localhost:3000/auth/callback`.
5. After the live domain exists, add `https://<production-domain>/auth/callback` and set Site URL to that domain.

Restart `npm run dev` so Next.js loads `.env.local`.

## 2. Database migrations and instructional videos

The five intro mp4 files are no longer tracked by git. They are still on disk under `public/assets/instructional-thumbnails/`. Playback expects them in the public bucket `instructional-videos`. That bucket is created by `supabase/migrations/016_instructional_videos_bucket.sql`. The migration has not been applied, and the files have not been uploaded.

You still need the database password from **Project Settings → Database**, or the direct connection URI on port 5432.

1. Put `SUPABASE_DB_URL` in the shell for the deploy, or set `SUPABASE_ACCESS_TOKEN`, `SUPABASE_PROJECT_REF` (`ewykjltuiipmyrybetbk`), and `SUPABASE_DB_PASSWORD` as GitHub secrets. Leave those names commented in `.env.local`.
2. From `main`, run `bash scripts/deploy.sh production --migrate-only`.
3. Run `npm run videos:upload`.

Older commits on GitHub still contain the mp4 files until the git history is rewritten. The next commit only stops tracking them from that commit forward.

`settings`, `crs_points`, and `part_timings` are still not seeded in SQL. The app reads the TypeScript defaults until that seed exists.

## 3. Stripe

The Stripe account exists. These three values are still empty in `.env.local`:

| Name | Where |
| --- | --- |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe Dashboard, Test mode, **Developers → API keys**, Publishable key |
| `STRIPE_SECRET_KEY` | Same page, Secret key |
| `STRIPE_WEBHOOK_SECRET` | **Developers → Webhooks**, endpoint `https://<production-domain>/api/webhooks/payments`, Signing secret |

Checkout still does not create a Stripe session, and the webhook does not grant access. Those are code gaps in [remaining.md](remaining.md) under N10.

## 4. Cal.com webhook secret

`CAL_API_KEY` is set. `CAL_WEBHOOK_SECRET` is empty.

1. Open [Cal.com webhooks](https://app.cal.com/settings/developer/webhooks).
2. Create or open the webhook.
3. Copy the secret into `CAL_WEBHOOK_SECRET` in `.env.local`.

Google Calendar and Zoom are not connected. Class booking is not live. See N12 in [remaining.md](remaining.md).

## 5. Vercel

A Pro plan is required only if several people must be members of the Vercel team. One owner can deploy on the Hobby plan.

1. Sign in at [vercel.com](https://vercel.com) with the account that will own the project.
2. Import this GitHub repo.
3. **Settings → Environment Variables**. Add every name from `.env.example` for Production, Preview, and Development.
4. On Vercel, set `NEXT_PUBLIC_APP_URL` to the real site URL.
5. Generate new production values for `CRON_SECRET` and `MEDIA_SIGNING_SECRET` with `openssl rand -hex 32`. Do not reuse the local ones.
6. Create a token at [vercel.com/account/tokens](https://vercel.com/account/tokens). That is `VERCEL_TOKEN`.
7. Run `npx vercel link`. From `.vercel/project.json`, copy `orgId` to `VERCEL_ORG_ID` and `projectId` to `VERCEL_PROJECT_ID`.

## 6. GitHub

1. Repo **Settings → Secrets and variables → Actions**.
2. Add `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`.
3. Add `SUPABASE_ACCESS_TOKEN` from [supabase.com/dashboard/account/tokens](https://supabase.com/dashboard/account/tokens).
4. Add `SUPABASE_PROJECT_REF` as `ewykjltuiipmyrybetbk` and `SUPABASE_DB_PASSWORD`, or add `SUPABASE_DB_URL` instead of those three.
5. From a repo admin account, run `bash scripts/protect-main.sh`.

Nothing has been deployed. Production deploy runs only after a pull request is merged to `main`.

## 7. Hosts that do not exist yet

- `LESSON_ORIGIN` is set to `https://lessons.celpipdecoded.com`. That host is not provisioned, and it must not share the main site's cookie domain.
- Course video still needs Cloudflare Stream or Mux in the owner's name. The instructional intro clips use Supabase storage. Paid lesson video does not.
- Supabase backups are not confirmed, and the restore drill in [runbook/backups.md](runbook/backups.md) has not been run.
- `SENTRY_DSN` can stay empty.

## 8. Product work still open

The rules for N01–N18 pass in `npm test`. The running app does not save purchases, scores, seats, settings, or lesson events. The student speaking, writing, and mock-test screens are still the older ones.

| Area | What is left |
| --- | --- |
| N01 Quote | Avinash and Sahil task IDs are not mapped. Two references are blank. AI cost is not measured from a real sample. |
| N02 Schema | Migrations are not applied. Several section 19 tables are not in `015`. Settings are not read from the database. |
| N03 CRS | `/crs` calculates. Saving a result does not write `crs_results`. Spouse fields do not hide. `crs_points` are not edited from the database. |
| N04–N07 AI | New scoring rules are not the live writing or speaking path. Allowance, cost rows, and calibration samples are not stored. |
| N08–N09 Player | The new timer and speaking flow do not drive the screens students use. No real-phone pass. |
| N10–N11 Payments | No Stripe Checkout session, no saved purchase, no batch charge or email. |
| N12 Calendar | No Google, Zoom, or Cal.com booking sync. |
| N13–N14 Lessons and video | No sandboxed lesson page, no `mini_events` rows, no paid-video player. |
| N15 Security | Login rate limits, verification-code limits, admin 2-step sign-in, and the backup restore are not done. |
| N16 Assistant | Bubble exists. Knowledge base, server-side daily cap, admin log, and full-screen phone chat are not done. |
| N17–N18 Loop and cohort | No saved prescription, no before/after panel, no coach invite or revoke. |

Also still open for every task: a preview URL demo, analytics events sent to a tool, locked-not-hidden paid content, and a test on a real iPhone and a real Android phone at 375px.

Run the checks that exist today:

```bash
npm test
npx playwright install chromium
npm run test:e2e
```
