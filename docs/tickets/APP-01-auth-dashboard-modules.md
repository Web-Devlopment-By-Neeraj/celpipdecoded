# APP-01 - Auth, Dashboard, and Module Cards

## Goal

Build the first real app foundation for Toronto Academy CELPIP Practice.

This ticket adds Supabase Auth, protected dashboard routing, profile creation, module cards, and a placeholder CELPIP Speaking module route.

Do not build recording yet.
Do not build transcription yet.
Do not build AI scoring yet.
Do not build payment yet.
Do not build the full speaking practice screen yet.

## Product name

Toronto Academy CELPIP Practice

## Core UX rule

Every route must make the next action clear.

Each screen should answer:

1. Where am I?
2. What can I do here?
3. What should I click next?
4. How do I go back?
5. What happens if something fails?

## Route map

Public routes:

- /
  Landing page

- /signup
  Create account

- /login
  Sign in

- /auth/callback
  Supabase auth callback

Protected routes:

- /dashboard
  Student dashboard with module cards

- /dashboard/speaking
  Placeholder CELPIP Speaking module page

Do not build task library, recording, transcription, or scoring in /dashboard/speaking yet. This page should only confirm that the speaking module is the next area.

## User flow

1. User lands on /
2. User clicks Get started
3. User goes to /signup
4. User creates account
5. User is redirected to /dashboard or sees email confirmation message
6. User sees module cards
7. User clicks CELPIP Speaking Practice
8. User goes to /dashboard/speaking placeholder
9. User can return to /dashboard
10. User can sign out

## Logged out flow

If a logged out user visits:

- /dashboard
- /dashboard/speaking

They must be redirected to:

- /login

## Logged in flow

If a logged in user visits:

- /login
- /signup

They can be redirected to:

- /dashboard

This is preferred, but not mandatory if it adds complexity.

## Required routes

Create or update:

src/app/(auth)/login/page.tsx
src/app/(auth)/signup/page.tsx
src/app/auth/callback/route.ts
src/app/dashboard/layout.tsx
src/app/dashboard/page.tsx
src/app/dashboard/loading.tsx
src/app/dashboard/error.tsx
src/app/dashboard/speaking/page.tsx

## Required components

Create:

src/components/auth/LoginForm.tsx
src/components/auth/SignupForm.tsx
src/components/app/AppHeader.tsx
src/components/app/DashboardShell.tsx
src/components/app/ModuleCard.tsx
src/components/app/SignOutButton.tsx

Optional if useful:

src/components/app/AppFooter.tsx
src/components/app/BackToDashboardLink.tsx

## Supabase helpers

Use the existing helpers from INFRA-01:

src/lib/supabase/client.ts
src/lib/supabase/server.ts
src/lib/supabase/admin.ts

Client components must use the browser client only.
Server components and route handlers can use the server client.
Do not use the admin client in client components.

## Database migration

Create:

supabase/migrations/002_auth_profile_trigger.sql

The migration should create or replace a trigger function that automatically inserts a row into public.profiles when a new auth.users row is created.

The profile row should include:

- id from new.id
- email from new.email
- full_name from new.raw_user_meta_data if available
- role as student
- created_at
- updated_at

Also add or confirm an updated_at trigger for public.profiles updates.

The migration must be safe to run in hosted Supabase SQL Editor.

## Auth requirements

Signup form fields:

- full_name
- email
- password

Login form fields:

- email
- password

Signup behavior:

- Create user with full_name stored in options.data
- If email confirmation is required, show a friendly message
- If session exists immediately, redirect to /dashboard

Login behavior:

- Successful login redirects to /dashboard
- Failed login shows a clear friendly error

Sign out behavior:

- Signs user out
- Redirects to /

## Dashboard requirements

Dashboard must be protected server side.

Dashboard should fetch modules from public.modules.

Display these module cards from the modules table:

- CELPIP Speaking Practice
- CELPIP Writing Practice
- CELPIP Reading Practice
- CELPIP Listening Practice
- Live CELPIP Classes

CELPIP Speaking Practice:

- status active
- button text: Open module
- link: /dashboard/speaking

Other modules:

- status coming_soon
- button text: Coming soon
- disabled button

## Dashboard UX

Dashboard sections:

1. App header

Show:

- Toronto Academy CELPIP Practice
- User email
- Sign out button

2. Welcome card

Heading:

Welcome to your CELPIP practice dashboard

Text:

Start with CELPIP Speaking Practice. More practice modules are coming soon.

3. Module cards

Each card should show:

- module title
- short description
- status badge
- next action button

4. Subtle disclaimer

Use:

Practice estimates and feedback are for preparation only and are not official CELPIP scores.

## Speaking placeholder route

Create /dashboard/speaking.

This page should:

- Be protected by dashboard layout
- Show heading: CELPIP Speaking Practice
- Explain that timed speaking tasks, recording, and AI feedback will be added next
- Show a Back to dashboard link
- Not show fake tasks yet
- Not build recording
- Not build AI scoring

## Landing page update

Update the existing landing page only enough to add navigation links:

- Sign in links to /login
- Get started links to /signup

Do not redesign the landing page.

## Mobile UX requirements

- Auth forms must be easy to complete on mobile
- Dashboard cards must stack cleanly on mobile
- Header must not overflow on mobile
- Sign out must remain visible
- Buttons must be large enough to tap
- User must always have a clear path back to dashboard

## Loading and error states

Add:

- dashboard/loading.tsx
- dashboard/error.tsx

Loading state should be simple and branded.

Error state should show a friendly message and a link back to /dashboard or /.

## Environment variables

Use:

NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
NEXT_PUBLIC_APP_URL

Do not use old SUPABASE_URL.

## Hosted Supabase workflow

We are using hosted Supabase only.

Do not set up local Supabase.
Do not require Supabase CLI.
Create the SQL migration locally, but the user will copy and run it in hosted Supabase SQL Editor.

## Security requirements

- .env.local must stay ignored
- Service role key must not be imported in client components
- Dashboard must use server-side session check
- Client forms must use the browser Supabase client only
- Protected routes must not show dashboard data without a session
- Do not print real environment values

## Important UI copy rule

Do not use long hyphens or em dashes anywhere in UI copy, comments, docs, or prompts. Use normal hyphens only.

## Done criteria

- /signup page works
- /login page works
- /dashboard is protected
- /dashboard/speaking is protected
- Successful login redirects to /dashboard
- Sign out works
- Dashboard shows module cards from Supabase modules table
- CELPIP Speaking card links to /dashboard/speaking
- Coming soon modules are clearly disabled
- Landing page has Sign in and Get started links
- New signup creates auth user
- After migration, new signup creates profile row
- npm run lint passes
- npm run build passes
- No secrets are committed
- No service role key is used in client components
