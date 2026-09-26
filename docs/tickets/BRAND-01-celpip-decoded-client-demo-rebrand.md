# BRAND-01 - CELPIP Decoded Client Demo Rebrand

## Goal

Rebrand the current app for the client demo using the CELPIP Decoded brand brief.

This is a UI-only demo polish ticket.

Do not change database schema.
Do not create migrations.
Do not change Supabase logic.
Do not change auth logic.
Do not change admin builder functionality.
Do not build ADMIN-03.
Do not build new exam features.
Do not change scoring logic.
Do not change OpenAI prompts unless old brand names appear in user-facing copy.
Do not replace hardcoded Mock Test 1 flows.
Do not build payment.
Do not build live classes.
Do not build intake.
Do not build community features.

## Source of truth

Use the uploaded PDF brand brief:

CELPIP Decoded - Brand and Build Brief

Important brand values from the PDF:

- Product name: CELPIP Decoded
- Ownable word: Decoded
- Instructor: Amar
- Instructor credibility line: CLB 10+
- Community name: The Codebreakers
- Primary idea: students are not bad at English, they need to understand how CELPIP expects answers
- Logo concept: code brackets with a solved centre dot
- Colour palette:
  - Ink navy: #12314F
  - Emerald-teal: #0E9F6E
  - Warm off-white: #F4F1EA
- Typography: clean humanist sans, Inter or system sans
- Sentence case everywhere
- CELPIP stays uppercase
- Photography style: calm natural-light study moments
- Avoid official CELPIP blue-red
- Avoid competitor purple
- Avoid official CELPIP logo
- Avoid other-brand logos
- Footer disclaimer required

Project style rule:
Use normal hyphens only.
Do not use em dashes or long hyphens in code, docs, or UI copy.
If the PDF uses a long dash, normalize it to a normal hyphen.

## Required rebrand changes

Replace old demo branding where visible:

- Toronto Academy of Education
- Toronto Academy
- Georgo Academy
- Georgo
- Powered by Georgo Analytics and Automation

With:

- CELPIP Decoded

Use instructor wording where useful:

- Instructor: Amar
- CLB 10+ CELPIP instructor

Do not remove technical package names or internal paths unless they are user-facing.

## Brand copy

Use these public-facing lines where appropriate:

Hero headline:
You're not bad at English.

Supporting line:
Most people do not struggle with CELPIP because of their English. They struggle because they do not know how CELPIP wants them to answer.

Instructor line:
I scored CLB 10+ on CELPIP, and now I teach the exact method I used.

CTA options:
- Start free trial
- Start mock test
- Continue practice
- View my study plan

Community:
The Codebreakers

Do not overuse the instructor "I" line inside the authenticated app. Use it mostly on public/home/demo screens.

## Logo

Create a simple reusable brand logo component if one does not exist:

src/components/brand/CelpipDecodedLogo.tsx

Logo requirements:

- text: CELPIP Decoded
- bracket mark concept
- solved centre dot
- works on light background
- supports reversed version on navy background
- no official CELPIP logo
- no external image dependency required
- use SVG or CSS
- keep it simple and professional

If an existing Logo component exists, update or wrap it safely.

## Theme tokens

Find the existing theme/design system files.

Likely areas to inspect:

- src/app/globals.css
- tailwind.config.ts
- src/features/exam-engine/exam-theme.ts
- src/components/layout/*
- src/components/app/*
- src/components/exam/*
- src/components/admin/*

Add or update CSS variables:

--brand-ink: #12314F;
--brand-teal: #0E9F6E;
--brand-offwhite: #F4F1EA;

Use these consistently for:

- page backgrounds
- headings
- buttons
- progress states
- success states
- cards
- dashboard accents
- admin headers
- exam mode headers

Do not make everything teal.
Navy should carry trust and structure.
Teal should be used for progress, correct states, primary buttons, and accents.
Off-white should be used for calm background surfaces.

## Pages to rebrand

Rebrand visible UI copy and theme on these areas:

1. Public landing/home page
2. Login page
3. Dashboard
4. Mock test cards
5. Listening mock test route
6. Reading mock test route
7. Writing mock test route
8. Speaking mock test route
9. Standalone Speaking Practice page
10. Standalone Writing Practice page
11. AI result screens
12. Admin mock test pages
13. Footer and legal/disclaimer area
14. Metadata titles and descriptions

Do not change functionality.

## Footer disclaimer

Add a simple footer disclaimer where appropriate:

Not affiliated with, endorsed by, or acting on behalf of Paragon Testing Enterprises, Prometric, or CELPIP. CELPIP is a trademark of its owner. AI feedback is a practice estimate, not an official CELPIP result.

Keep it readable but not huge.

## Dashboard demo polish

Dashboard should feel client-ready.

Update visible labels:

- Welcome to CELPIP Decoded
- Start your next practice
- Mock tests
- Speaking practice
- Writing practice
- Reading practice
- Listening practice
- The Codebreakers community
- Practice estimate, not an official CELPIP result

Remove or hide unfinished rough labels if they look confusing for client demo.

Do not hide working features.

## Mock test wording

Use:

- Mock Test 1
- Listening test
- Reading test
- Writing test
- Speaking test
- Practice score
- Estimated level
- AI-supported feedback
- Not an official CELPIP result

Avoid:

- official score
- guaranteed score
- Toronto Academy branding
- Georgo branding
- unfinished internal wording on learner pages

Internal admin pages may still say "Admin" or "Instructor dashboard".

## Admin demo polish

Rebrand admin pages as instructor/admin for CELPIP Decoded.

Use:

- CELPIP Decoded admin
- Mock test builder
- Instructor dashboard
- Draft
- Internal preview
- Published

Keep admin functionality unchanged.

Do not add new admin features.

## Metadata

Update relevant metadata:

- App name: CELPIP Decoded
- Title examples:
  - CELPIP Decoded
  - Dashboard - CELPIP Decoded
  - Mock Tests - CELPIP Decoded
  - Speaking Practice - CELPIP Decoded
- Description:
  Practice CELPIP with real-format mock tests, AI-supported feedback, and instructor-led strategy.

## Documentation

Create:

docs/brand/celpip-decoded-rebrand-demo.md

Include:

1. Source PDF used
2. Brand name
3. Colour palette
4. Logo implementation
5. Typography approach
6. Pages updated
7. Copy replaced
8. Disclaimer added
9. What was intentionally not changed
10. Client demo checklist

Update, if useful:

docs/product/admin-workflow-next-steps.md

Add a note that admin work is paused for client demo rebrand.

## Search checklist

Search for old visible brand names:

- Toronto Academy
- Toronto Academy of Education
- Georgo
- Georgo Academy
- Powered by Georgo

Replace only where user-facing.
Do not rename repo folders.
Do not rename environment variables.
Do not rename database tables.

## Security

- Do not read or print .env.local
- Do not expose keys
- Do not change Supabase credentials
- Do not change API keys
- Do not change auth
- Do not create migrations
- Do not run Supabase SQL

## Validation

Run:

npm run lint
npm run build

Search changed files for:

- em dashes
- long hyphens
- curly quotes

Replace with normal hyphens and straight quotes.

## Done criteria

- App visibly says CELPIP Decoded
- Old Toronto Academy/Georgo user-facing branding is removed
- Brand colours are applied
- Logo or text mark appears
- Dashboard is client-demo ready
- Mock test routes are rebranded
- Speaking and Writing pages are rebranded
- AI result pages keep practice estimate disclaimer
- Admin pages are rebranded but functionality unchanged
- Footer disclaimer appears where appropriate
- No Supabase changes
- No migrations
- No database writes
- No admin feature changes
- No learner functionality broken
- npm run lint passes
- npm run build passes
