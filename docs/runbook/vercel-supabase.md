# Deploy on Vercel and Supabase

Production deploys run from `main` after a pull request. The commands live in `scripts/deploy.sh`. The GitHub workflows are `.github/workflows/ci.yml` (lint, typecheck, test, build) and `.github/workflows/deploy.yml` (migrate, then Vercel).

## One-time setup

1. Create the Supabase project in the owner's account. Prefer the Canadian region.
2. In Supabase Auth, allow `http://localhost:3000/auth/callback` and `https://<production-domain>/auth/callback`.
3. Create the Vercel project from this repo. Production tracks `main`. Every other branch gets a preview URL when `VERCEL_TOKEN`, `VERCEL_ORG_ID`, and `VERCEL_PROJECT_ID` are set in GitHub Actions.
4. Copy every name in `.env.example` into the Vercel project for Production, Preview, and Development. Fill the values there. Do not put secrets in the repo.
5. Set `ADMIN_EMAILS` to the owner address and `CRON_SECRET` so `/api/cron/tick` accepts the daily job from `vercel.json`.
6. Add the GitHub Actions secrets listed in the README.
7. From a repo admin account, run `bash scripts/protect-main.sh` so GitHub rejects direct pushes to `main`.
8. Point `lessons.celpipdecoded.com` at a separate Vercel project or host that does not share the parent cookie domain.
9. Turn on Supabase backups and run the restore drill in `docs/runbook/backups.md`.

## Release

1. Open a pull request. The `check` workflow must pass.
2. Merge the pull request into `main`.
3. The deploy workflow confirms the commit belongs to a pull request, applies `supabase/migrations` in order, and runs `vercel deploy --prebuilt --prod`.

To run the same steps from a laptop, check out the updated `main` and run `bash scripts/deploy.sh production`.

Migrations are applied before the new deployment. Keep them additive so the version still running can tolerate the new schema.

Direct commits to `main` are rejected by the pre-commit hook. The deploy workflow also refuses a `main` commit that did not come from a pull request.
