# Toronto Academy Supabase Setup

This document describes how to point the app at the Toronto Academy Supabase project and apply the foundation schema from INFRA-01.

## 1. Supabase project

1. Sign in to https://supabase.com with the Toronto Academy account.
2. Create a new project (or open the existing Toronto Academy project).
3. From Project Settings > API, note these values:
   - Project URL
   - anon public key
   - service_role key (keep this secret, server only)

## 2. Apply the foundation migration

Option A, SQL editor (simplest):

1. Open the Supabase dashboard > SQL Editor.
2. Paste the full contents of `supabase/migrations/001_academy_foundation.sql`.
3. Run it. It is safe to run once per project. The `create table if not exists` and `on conflict do nothing` guards make re-runs mostly harmless, but the `create policy` statements will fail if run twice. That is expected and fine.

Option B, Supabase CLI:

```
supabase link --project-ref <your-project-ref>
supabase db push
```

The migration creates:

- Tables: profiles, modules, tasks, speaking_task_details, attempts, attempt_scores, badges, user_badges, usage_events, live_class_interest, early_access_leads
- Seed rows: 5 modules (celpip-speaking active, the rest coming_soon) and 5 badges
- A private storage bucket named `attempt-audio`
- RLS enabled on every table, with owner-scoped policies

## 3. Verify the storage bucket

The migration inserts the `attempt-audio` bucket directly. Confirm in Dashboard > Storage that:

- `attempt-audio` exists
- It is marked Private

If the insert into `storage.buckets` was rejected on your plan or project version, create the bucket manually in the dashboard: name `attempt-audio`, public access OFF. Audio will be served through signed URLs only. Never enable public access on this bucket.

## 4. Environment variables

The app uses these variables everywhere:

| Variable | Where it runs | Value |
| --- | --- | --- |
| NEXT_PUBLIC_SUPABASE_URL | client and server | Project URL |
| NEXT_PUBLIC_SUPABASE_ANON_KEY | client and server | anon public key |
| SUPABASE_SERVICE_ROLE_KEY | server only | service_role key |
| NEXT_PUBLIC_APP_URL | client and server | site URL |

Rules:

- Never commit `.env.local`.
- Never expose SUPABASE_SERVICE_ROLE_KEY to the browser. It is only read in `src/lib/supabase/admin.ts`, which must only be imported from server code.
- The old `SUPABASE_URL` variable name is retired. Use `NEXT_PUBLIC_SUPABASE_URL`.

### Local

Copy `.env.example` to `.env.local` and fill in the Toronto Academy project values.

### Vercel

In the Vercel project settings > Environment Variables:

1. Add or update:
   - NEXT_PUBLIC_SUPABASE_URL
   - NEXT_PUBLIC_SUPABASE_ANON_KEY
   - SUPABASE_SERVICE_ROLE_KEY
   - NEXT_PUBLIC_APP_URL (the production URL)
2. Delete the old `SUPABASE_URL` variable if it exists.
3. Redeploy so the new values take effect.

## 5. Supabase client helpers

| File | Key used | Use from |
| --- | --- | --- |
| `src/lib/supabase/client.ts` | anon | client components |
| `src/lib/supabase/server.ts` | anon + user cookies | server components, actions, route handlers |
| `src/lib/supabase/admin.ts` | service role | server API routes only |

## 6. Test locally

1. `npm install`
2. Fill `.env.local` as above.
3. `npm run dev`
4. Open http://localhost:3000 and submit the early access form.
5. Confirm a new row appears in the `early_access_leads` table in the Supabase dashboard.
