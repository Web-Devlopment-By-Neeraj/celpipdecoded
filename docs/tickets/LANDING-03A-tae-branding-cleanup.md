# LANDING-03A - Toronto Academy Branding Cleanup

## Goal

Clean up branding across the public landing page and app so Toronto Academy of Education is the main brand.

This ticket is only for branding cleanup, favicon, logo usage, and header polish.

Do not redesign the full landing page.
Do not change dashboard logic.
Do not change speaking practice logic.
Do not change AI feedback logic.
Do not build payment.
Do not change Supabase schema.

## Brand

Main brand:

Toronto Academy of Education

Program name:

Toronto Academy CELPIP Preparation Program

Georgo should only appear as:

Powered by Georgo Analytics and Automation

Do not use Georgo as the main brand.

## Assets

Use files from public:

- taelogo.jpg
- favicon.png
- georgo.png if available

If filenames differ, inspect the public folder and use the correct files.

## Required changes

Update:

- src/app/layout.tsx
- src/app/page.tsx
- landing header component if it exists
- landing footer component if it exists
- app header component if it exists
- auth pages if they mention the wrong brand
- dashboard pages if they mention the wrong brand
- favicon or app icon setup

## Header requirements

Landing page header should show:

- Toronto Academy logo
- Program or page name
- Sign in
- Get started

Mobile header should:

- not overflow
- keep logo readable
- keep buttons easy to tap

## Favicon requirements

Browser tab should show the Toronto Academy favicon.

Remove or replace any default Next.js icon.

Use:

public/favicon.png

## Image quality requirements

Use next/image where practical.

Do not stretch the logo.

Use object-contain for logo.

If logo appears unclear, do not use Cloudinary in this ticket. Leave a note that a higher-resolution PNG or SVG logo may be needed.

## Footer requirement

Footer should include:

Toronto Academy of Education

Practice estimates and AI feedback are for preparation only and are not official CELPIP scores.

Powered by Georgo Analytics and Automation

## Security requirements

- Do not expose service role key in client components
- Do not expose OpenAI keys in client components
- Keep .env.local ignored
- Do not print real environment values

## Important UI copy rule

Do not use long hyphens or em dashes anywhere in UI copy, comments, docs, or prompts. Use normal hyphens only.

## Done criteria

- Toronto Academy of Education is the main brand
- Toronto Academy logo appears in the landing header
- Toronto Academy favicon appears in browser tab
- Next.js default icon is gone
- Georgo appears only as powered-by
- Header works on mobile
- Existing form still submits
- Dashboard and app screens do not show Georgo as main brand
- npm run lint passes
- npm run build passes
- No secrets are committed
