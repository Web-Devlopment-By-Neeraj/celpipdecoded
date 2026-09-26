# CELPIP Decoded client demo rebrand (BRAND-01)

What the rebrand changed, what it deliberately left alone, and how to
walk a client through the demo.

House style: normal hyphens only, no long hyphens or em dashes, straight
quotes only. CELPIP is always uppercase, everything else is sentence
case.

## 1. Source brief used

The client brand brief, "CELPIP Decoded - Brand and Build Brief",
summarized in the ticket at
`docs/tickets/BRAND-01-celpip-decoded-client-demo-rebrand.md`. The
ticket is the working copy of the brief for this repository: it carries
the product name, the ownable word, the instructor and community names,
the palette, the logo concept, the typography direction, the copy lines
and the required disclaimer.

Where the brief used a long dash, it was normalized to a normal hyphen,
which is the house rule for this repository.

## 2. Brand name

- Product name: CELPIP Decoded
- Ownable word: Decoded
- Instructor: Amar
- Instructor credibility: CLB 10+
- Community: The Codebreakers

Every one of these strings lives in `src/features/brand/brand-copy.ts`.
Screens import from there rather than typing the name again, so a
wording change happens once.

## 3. Colour palette

Defined as CSS variables in `src/app/globals.css`:

| Token              | Value     | Role                                         |
| ------------------ | --------- | -------------------------------------------- |
| `--brand-ink`      | `#12314F` | Trust and structure: headings, dark surfaces |
| `--brand-teal`     | `#0E9F6E` | Progress, correct states, accents            |
| `--brand-offwhite` | `#F4F1EA` | Calm background surfaces                     |

Five support values are derived from those and are not new brand
colours:

| Token                   | Value     | Why it exists                             |
| ----------------------- | --------- | ----------------------------------------- |
| `--brand-ink-deep`      | `#0C2338` | Hover state and the dark footer ground    |
| `--brand-ink-soft`      | `#E7EDF4` | Navy tint for bars, chips and soft panels |
| `--brand-teal-deep`     | `#0A7A54` | Fill behind white button labels           |
| `--brand-teal-soft`     | `#E4F5EE` | Teal tint for accent panels               |
| `--brand-offwhite-deep` | `#EAE5D9` | Second surface tone on the public site    |

The deep teal exists for contrast, not for variety. Solid `#0E9F6E`
under white text reaches roughly 3.4:1, which fails small text, so a
solid teal button uses `--brand-teal-deep` at roughly 5.4:1 and the
brand teal keeps the rules, dots, borders and tints where it reads at
full strength.

How the three are used, following the brief:

- Navy carries trust and structure: page headings, the public site's
  dark sections, exam chrome text, the footer ground.
- Teal carries progress and action: primary buttons, focus rings,
  eyebrows, progress fills, correct and success states.
- Off-white carries calm surfaces: the public site background and the
  signed in page background.

Not everything is teal. Navy still leads.

Deliberately avoided: the official CELPIP blue-red pairing, and the
competitor purple. The one red left in the palette is `#B3261E`, used
only for destructive actions and an expired timer, and it is not the
official CELPIP red that the previous palette used.

### How the palette reaches every screen

The signed in product reads colour through Tailwind class recipes in
`src/features/design/design-tokens.ts` and
`src/features/exam-engine/exam-theme.ts`, which name `academy-*` theme
variables rather than raw hex. Those `academy-*` names are internal
token names and were not renamed. Instead every one of them now points
at a brand value in `globals.css`, so the palette swap happened in one
file and flowed through the dashboard, the exam engine and the admin
builder without touching a component.

## 4. Logo implementation

`src/components/brand/CelpipDecodedLogo.tsx`.

- The mark is the brief's concept: two code brackets with a solved
  centre dot in teal.
- Drawn as inline SVG plus real text. No image request, no raster asset
  to keep in sync, nothing that can 404 on a demo machine.
- Props: `tone` (`light` for pale surfaces, `reversed` for navy),
  `size` (`sm` / `md` / `lg`), and `showWordmark` for the mark on its
  own.
- On `reversed` the centre dot lightens to `#5AD3A4` so it keeps its
  contrast on navy.
- The wordmark renders "CELPIP" in the tone's ink and "Decoded" in
  teal, so the ownable word is the coloured half.
- No official CELPIP logo, no Paragon or Prometric mark, and no other
  brand's artwork.

The same mark is also the browser and home screen icon:
`src/app/icon.svg` for the tab and `src/app/apple-icon.tsx`, which
generates the iOS PNG. The previous brand's `icon.png` and
`apple-icon.png` were removed.

## 5. Typography approach

The brief asks for one clean humanist sans, Inter or a system sans.

- `src/app/layout.tsx` loads Inter as `--font-brand-sans`, and JetBrains
  Mono as `--font-brand-mono` for the identifiers in the admin builder.
- The previous display serif (Fraunces) is gone. Rather than sweeping
  the `font-serif` class off roughly a hundred headings, the
  `--font-serif` slot in `globals.css` is mapped to the same Inter
  variable, so every existing heading renders in the brand face and the
  class stays a harmless alias.
- The body font stack falls back to Segoe UI and the system sans.

## 6. Pages updated

Public and auth:

- Landing hero (`ProgramHeroSection`): the brief's headline, supporting
  line and instructor line, plus a brand panel that replaced a photo
  collage of another school's banners.
- Landing header and footer: brand lockup in the reversed tone.
- Community section (`CollegeMomentsSection`): now The Codebreakers.
- What is included, live classes, AI practice, pricing and inquiry
  sections: brand wording and sentence case.
- Login and signup: brand lockup, brand metadata, footer disclaimer.

Signed in app:

- Dashboard: welcome wording, next practice heading, module labels, the
  Codebreakers chip in the hero, practice estimate wording.
- App sidebar, top bar and footer: brand lockup, tagline, disclaimer.
- Navigation labels and breadcrumbs in sentence case.
- Mock test cards: Mock Test 1 plus listening, reading, writing and
  speaking test wording.

Exam routes, theme and wording only, no behaviour change:

- Listening mock test route and its six part routes.
- Reading mock test route and its four part routes.
- Writing mock test route.
- Speaking mock test route.
- Shell preview and instruction preview routes.

Standalone practice:

- Speaking practice page and its task, timed practice, attempt history
  and result screens.
- Writing practice page and its equivalents.

AI result screens: brand wording in the estimate notes, and the short
practice estimate line kept beside every level.

Admin:

- Every admin builder screen through `AdminPageHeader`, whose eyebrow is
  now "CELPIP Decoded admin".
- Admin metadata titles.

Metadata: root title, description and application name, plus every page
title, now in the form "Dashboard - CELPIP Decoded".

## 7. Copy replaced

Removed from user facing copy:

- Toronto Academy of Education
- Toronto Academy
- Toronto Academy CELPIP Preparation Program
- CELPIP Preparation Program, as a product name
- Powered by Georgo Analytics and Automation
- The Georgo logo image in the public and app footers

Replaced with CELPIP Decoded, and where a longer phrase read badly after
the swap it was rewritten rather than left as a substitution.

Brief lines now in the product:

- "You're not bad at English." as the public hero headline
- "Most people do not struggle with CELPIP because of their English.
  They struggle because they do not know how CELPIP wants them to
  answer." as the public hero supporting line
- "I scored CLB 10+ on CELPIP, and now I teach the exact method I used."
  as the public hero instructor line
- "The Codebreakers" in the public community section and as a dashboard
  chip

The instructor "I" line is used on public surfaces only. Inside the
signed in app the brand speaks as the product, not as Amar.

Sentence case was applied to metadata titles, navigation labels, module
titles and mock test card labels. CELPIP stays uppercase and Mock Test 1
keeps its capitals as a proper name.

Two OpenAI system prompts named the old brand in text a learner can end
up reading back in feedback, so the brand name there was swapped too.
Nothing else about those prompts changed: no scoring rule, no schema, no
temperature, no model.

## 8. Disclaimer added

`src/components/brand/BrandDisclaimer.tsx` renders the required line:

> Not affiliated with, endorsed by, or acting on behalf of Paragon
> Testing Enterprises, Prometric, or CELPIP. CELPIP is a trademark of
> its owner. AI feedback is a practice estimate, not an official CELPIP
> result.

It appears once per surface:

- Public site footer, reversed tone on the navy ground
- Signed in app footer, which every dashboard, practice, exam and admin
  screen renders
- Login and signup pages, which sit outside the app shell

Result screens keep the short line instead of the paragraph, so a score
is not buried under legal text:

> Practice estimate, not an official CELPIP result.

That short line is `PRACTICE_ESTIMATE_LINE` in the brand copy file, and
the dashboard's existing `PRACTICE_ESTIMATE_DISCLAIMER` now points at
it, so the two cannot drift apart.

## 9. What was intentionally not changed

Not touched, by ticket instruction:

- Database schema. No migration was written and no SQL was run.
- Supabase client, server or admin logic, and no credential.
- Auth logic, the auth callback route, or the admin allow list check.
- Admin builder functionality. Only its wording and its header eyebrow
  changed.
- ADMIN-03. Nothing from it was started.
- Scoring logic, band tables, evaluation schemas and flow state.
- The hardcoded Mock Test 1 content and flows.
- Payments, live class booking, intake and community features. The
  Codebreakers appears as a name, not as a feature.

Not renamed, because they are internal rather than user facing:

- The repository folder and the `georgoacademy` package name.
- Environment variables and database table names.
- The `academy-*` theme variable names and the `src/features/design`
  token names.
- Code comments recording that the Mock Test 1 content is licensed
  Toronto Academy material. That is a provenance fact about where the
  content came from, and rewriting it would have made the comment
  false. It is a comment, and it is not rendered anywhere.

Left in place in `public/`:

- `taelogo.jpg`, `georgo.png`, `favicon.png`, and the photo set
  `img1.jpg` to `img4.jpg`. Nothing in the app references them any
  more. They were kept rather than deleted because removing binaries is
  a separate decision from a UI rebrand.

One judgement call worth flagging. The landing page's photo collage and
its college moments grid showed another school's banners in the frames.
Those could not stay on a CELPIP Decoded page, so both sections were
rebuilt without photography: the hero now carries a brand panel, and the
grid became The Codebreakers section. `onlineclass.jpg` was kept,
because it is a generic natural light study photo and matches the
brief's photography direction.

## 10. Client demo checklist

Run `npm run dev` and walk these in order.

1. `/` - navy hero, "You're not bad at English.", the supporting line,
   the instructor line, and the bracket logo top left. No Toronto
   Academy or Georgo anywhere. The footer carries the full disclaimer.
2. Scroll the landing page - what is included, live classes, AI
   practice, The Codebreakers, pricing. Teal buttons on navy and cream,
   no purple, no CELPIP blue-red.
3. `/login` - brand lockup, teal accents, disclaimer under the card.
4. Sign in and land on `/dashboard` - "Welcome to CELPIP Decoded" or
   "Welcome back", the Codebreakers chip, teal primary button.
5. Dashboard sidebar - brand lockup, sentence case navigation, practice
   estimate line at the bottom.
6. Dashboard mock test cards - Mock Test 1 listening, reading, writing
   and speaking test.
7. Open the listening test - exam chrome in navy and teal, timer and
   progress in brand colours, wording says practice test and not the
   official CELPIP test.
8. Open the reading, writing and speaking tests - same treatment.
9. `/dashboard/speaking` and `/dashboard/writing` - brand headings, task
   grids, timed practice.
10. Finish or open a saved attempt to reach an AI result screen - the
    estimated level, the AI-supported feedback, and the practice
    estimate line beside the score.
11. `/dashboard/admin/mock-tests`, which needs an admin email - the
    eyebrow reads "CELPIP Decoded admin" and the builder works exactly
    as before.
12. Any signed in screen - scroll to the footer and read the
    disclaimer.
13. Browser tab - the bracket icon with the teal dot.

Validation run for this ticket:

- `npm run lint` passes with no findings.
- `npm run build` passes and every route compiles.
- Changed files were scanned for em dashes, en dashes, other long
  hyphens and curly quotes. None were found.
