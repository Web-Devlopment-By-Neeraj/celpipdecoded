# CELPIP Decoded

Practice app for CELPIP listening, reading, writing, and speaking. The site runs on [Next.js](https://nextjs.org) and deploys to [Vercel](https://vercel.com). Data and auth live in [Supabase](https://supabase.co).

Scores shown in the product are practice estimates. They are not official CELPIP results.

## Prerequisites

- Node.js 22
- npm 10
- A Supabase project
- A Vercel project linked to this repo
- The [Supabase CLI](https://supabase.com/docs/guides/cli) and [Vercel CLI](https://vercel.com/docs/cli) when you deploy from a machine (`npx` can fetch both)

## Local setup

```bash
npm ci
cp .env.example .env.local
npm run dev
```

Fill `.env.local` from the Supabase project settings (API URL, anon key, service role key) and the Vercel project settings. Never commit `.env.local`.

Open [http://localhost:3000](http://localhost:3000).

Apply the database to a Supabase project before using auth or saved attempts:

```bash
export SUPABASE_ACCESS_TOKEN=...
export SUPABASE_PROJECT_REF=...
export SUPABASE_DB_PASSWORD=...
bash scripts/deploy.sh production --migrate-only
```

`SUPABASE_DB_URL` can replace the three variables above. Use the direct database URI (port 5432), not the transaction pooler.

In the Supabase dashboard, add these Auth redirect URLs:

- `http://localhost:3000/auth/callback`
- `https://<your-production-domain>/auth/callback`

Set `ADMIN_EMAILS` to the staff addresses that may open `/dashboard/admin`.

## Checks

```bash
npm run lint
npm run typecheck
npm test
```

The pre-commit hook refuses commits on `main` or `master`, then runs those three commands. Work on a feature branch and open a pull request.

## Deploy

Production ships from `main` after a pull request merge. GitHub Actions (`.github/workflows/deploy.yml`) applies `supabase/migrations` in order, then builds and deploys the app to Vercel production. The daily job in `vercel.json` calls `POST /api/cron/tick`.

From a clean `main` that matches `origin/main`:

```bash
bash scripts/deploy.sh production
```

Preview, from any branch, does not change the database unless you pass `--migrate`:

```bash
bash scripts/deploy.sh preview
```

| Command | What it does |
| --- | --- |
| `bash scripts/deploy.sh preview` | Lint, typecheck, test, then a Vercel preview deployment |
| `bash scripts/deploy.sh production` | Same checks, then migrations, then Vercel production |
| `bash scripts/deploy.sh production --migrate-only` | Pending Supabase migrations only |
| `bash scripts/deploy.sh production --skip-migrate` | App deploy only |
| `bash scripts/deploy.sh production --sync-env` | Copy non-empty `.env.local` values into Vercel, then deploy |

`--skip-checks` is for CI, which already ran the suite.

### GitHub Actions secrets

| Secret | Used for |
| --- | --- |
| `VERCEL_TOKEN` | Vercel CLI |
| `VERCEL_ORG_ID` | Team or user id from `.vercel/project.json` |
| `VERCEL_PROJECT_ID` | Project id from `.vercel/project.json` |
| `SUPABASE_ACCESS_TOKEN` | Supabase CLI, from [account tokens](https://supabase.com/dashboard/account/tokens) |
| `SUPABASE_PROJECT_REF` | Project reference in the Supabase URL |
| `SUPABASE_DB_PASSWORD` | Database password used by `supabase link` |
| `SUPABASE_DB_URL` | Optional. When set, migrations use this URI and the three Supabase secrets above are not required |

Create the Vercel token at [Account tokens](https://vercel.com/account/tokens). After `npx vercel link`, copy `orgId` and `projectId` from `.vercel/project.json`.

Put the application environment variables in the Vercel project for Production, Preview, and Development. The names are listed in `.env.example`. `CRON_SECRET` must be set in Vercel so the scheduled job can authenticate.

### Lock `main`

Local commits to `main` are already blocked. To block them on GitHub as well, from a repo admin account:

```bash
bash scripts/protect-main.sh
```

That requires a pull request and the `check` status before a merge. The deploy workflow also stops if a commit on `main` did not come from a pull request.

## Layout

- `src/app` — routes, including `/crs` and `/api`
- `src/features/platform` — scoring, payments, player, and access rules covered by Vitest
- `supabase/migrations` — schema, applied in filename order
- `scripts/deploy.sh` — Vercel and Supabase deploy
- `docs/runbook` — backups, calendar sync, and the deploy checklist

More detail: [docs/runbook/vercel-supabase.md](docs/runbook/vercel-supabase.md).
