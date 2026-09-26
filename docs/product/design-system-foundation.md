# Design System Foundation

Ticket: CELPIP-UX-01
Product: Toronto Academy of Education CELPIP Preparation Program
Scope: shared UI foundation for the signed in app, before the dashboard
redesign (CELPIP-UX-03), usage limits and launch work.

This document is the reference for anyone adding UI to the signed in
app. It covers the brand direction, the tokens, the components, and the
asset rules.

## 1. Brand direction

The signed in app reads as a calm, professional, adult education
product. It is not a game and it is not a children's app.

- deep navy is the primary brand colour and carries headings, primary
  buttons and progress fills
- white is the card surface, warm white is the page surface
- soft blue is the secondary colour, used for accents, secondary buttons
  and focus rings
- a controlled Canadian red is an accent only, never a large surface
- green means success, amber means warning, red means error
- the tone is calm and premium, with generous spacing and soft shadows
  rather than heavy borders or bright fills

The public landing page keeps its existing warm editorial palette
(cream, terracotta brand). That palette was not changed by this ticket
and the design tokens here do not apply to it.

## 2. Design tokens

Raw colours live in `src/app/globals.css` as `academy-*` theme
variables, so they are available as Tailwind utility classes:

| Variable | Value | Meaning |
| --- | --- | --- |
| `--academy-navy` | `#12294a` | primary brand, headings, primary buttons |
| `--academy-navy-dark` | `#0b1b33` | primary hover |
| `--academy-navy-soft` | `#e9eef6` | soft navy surface, chips |
| `--academy-blue` | `#2c6bab` | secondary accent, focus ring |
| `--academy-blue-soft` | `#eef4fb` | secondary button surface |
| `--academy-red` | `#c8102e` | Canadian red accent, destructive |
| `--academy-red-soft` | `#fdeef0` | error surface |
| `--academy-paper` | `#ffffff` | card background |
| `--academy-paper-warm` | `#faf8f4` | warm white page background |
| `--academy-line` | `#e4e7ee` | borders and dividers |

Semantic tokens live in `src/features/design/design-tokens.ts`. Every
value there is a Tailwind class string, so components never hardcode a
brand colour:

- `surface` - page, card, subtle, brand, accent, danger backgrounds
- `text` - primary, secondary, muted, onBrand, accent, danger, heading,
  eyebrow
- `border` - default, subtle, strong, divider, ring
- `shadow` - card, raised, none
- `radius` - card, panel, control, chip, tile
- `focus.ring` - the single keyboard focus treatment for the app
- `layout` - max widths, page padding, card padding, section gap
- `cardStyles` - default, highlighted, subtle, danger card recipes
- `buttonBase`, `buttonVariants`, `buttonSizes` - button recipes
- `progress` - progress bar track and fill
- `cx` - small class name joiner, so no new dependency was needed

Status colours live in `src/features/design/status-styles.ts` with six
shared tones: success, warning, error, info, neutral, progress. Each
tone provides `badge`, `text`, `surface` and `dot` class strings. The
file also maps the speaking and writing attempt tones (ready, working,
failed, neutral) onto these shared tones, which is how the duplicated
pill styling was removed.

Display helpers live in `src/features/design/formatters.ts`:
`formatShortDate`, `formatDateTime`, `toPercent`, `formatPercent`,
`formatLevelOutOf`, `formatDurationShort`, `formatCount`,
`formatSlugLabel`.

## 3. Component list

All in `src/components/app/`:

| Component | Purpose |
| --- | --- |
| `AppPageShell` | page title block, description, action area, consistent width and spacing |
| `AppSectionHeader` | section heading with eyebrow, description and action slot |
| `AppCard` | card wrapper, variants: default, highlighted, subtle, danger |
| `AppButton` | button, variants primary, secondary, ghost, danger, sizes sm, md, lg, loading state |
| `AppButtonLink` | link styled as a button, shares the button recipes |
| `AppMetricCard` | one number with label, helper text, optional status pill and icon |
| `AppProgressBar` | accessible progress bar with label, helper text and optional percent |
| `AppStatusBadge` | the one status pill, driven by the shared tones |
| `AppEmptyState` | centered empty panel with optional image and action |
| `AppModuleCard` | practice module card, icon from the module asset map |
| `AppBadgeIcon` | badge artwork for a stored badge slug |
| `AppAssetImage` | Next.js Image wrapper for local optimized assets |

Notes:

- `DashboardShell` still owns the outer frame (header, main, footer).
  `AppPageShell` owns the page body inside it.
- These are plain components with no state, so they work in both server
  and client components. `AppButton` accepts `onClick`, which requires
  the calling component to be a client component.
- `AppAssetImage` exposes `priority`, which maps to the Next.js 16
  `preload` prop. The Next.js `priority` prop is deprecated in 16.

## 4. Asset usage rules

- image paths always come from `src/features/assets/asset-registry.ts`
  or the two maps built on it, never as a hardcoded string in a component
- WebP is the default, the PNG twins exist only as a fallback for
  contexts where WebP is not an option
- large source PNGs are never rendered in the UI
- all design system images go through `AppAssetImage`, so they stay
  inside their container and lazy load by default
- `priority` is opt in and should be used for at most one above the fold
  image per page, never for a grid of cards
- decorative images use an empty `alt`, meaningful images get real alt
  text
- the asset scripts stay the source of truth for generating optimized
  copies: `npm run assets:optimize` and `npm run assets:normalize-badges`

## 5. Badge usage rules

- badge artwork is resolved through
  `src/features/assets/badge-asset-map.ts` using `AppBadgeIcon`
- database badge slugs must not be renamed. Known slugs:
  `foundation-speaker`, `developing-communicator`, `test-ready-builder`,
  `confident-speaker`, `advanced-communicator`
- the UI may show communicator wording even where the slug says speaker.
  The slug selects artwork, the visible label comes from the badge
  catalog or the feature level badge mapping
- an unmapped slug falls back to the consistent learner badge, so the UI
  never renders a broken image
- `foundation-speaker` and `developing-communicator` still use stand in
  artwork, tracked in `BADGE_SLUGS_NEEDING_ARTWORK`
- `AppBadgeIcon` picks the 512px artwork below 96px and the 1024px
  artwork at 96px and above, so a small chip does not download a full
  size badge

## 6. Module icon usage rules

- module icons are resolved through
  `src/features/assets/module-asset-map.ts` using `AppModuleCard`
- mapped slugs: `celpip-speaking`, `celpip-writing`, `celpip-reading`,
  `celpip-listening`, `live-classes`
- an unmapped slug falls back to the speaking icon and the practice
  journey illustration
- module icons are decorative next to the module title, so they use an
  empty `alt`
- reading, listening and live classes reuse the closest available
  artwork until dedicated pieces are commissioned

## 7. What was adopted in this ticket

The adoption was deliberately limited and behaviour preserving.

- `src/components/app/ModuleCard.tsx` now delegates to `AppModuleCard`.
  The slug to route mapping stayed in place, so
  `src/app/dashboard/page.tsx` was not changed. Dashboard module cards
  now show the real module icons from the asset registry.
- `AttemptStatusBadge` and `WritingAttemptStatusBadge` now render
  `AppStatusBadge`. Labels and status mapping are unchanged, the two
  duplicated tone tables were deleted.
- `EmptyAttemptsState`, `SpeakingEmptyState`, `WritingEmptyAttemptsState`
  and `WritingEmptyState` now render `AppEmptyState` with optimized WebP
  empty state artwork. Copy and destinations are unchanged.
- `BadgeDisplayCard` and `WritingBadgeDisplayCard` now render
  `AppBadgeIcon` instead of a star glyph. Both take an optional `slug`,
  which the two result pages fill from the `badge_slug` already read
  from `attempt_scores`. No new query was added.

Not touched: routes, server logic, AI prompts, scoring behaviour,
database calls, auth helpers, API routes.

## 8. What should be adopted in later tickets

- CELPIP-UX-03 learner dashboard redesign: rebuild the dashboard on
  `AppPageShell`, `AppSectionHeader`, `AppMetricCard` and
  `AppModuleCard`, and use the dashboard illustrations
- speaking and writing overview pages: replace the hand rolled hero and
  progress panels with `AppPageShell`, `AppCard`, `AppMetricCard` and
  `AppProgressBar`. `LevelProgressCard` and `WritingLevelProgressCard`
  both contain a progress bar that `AppProgressBar` should replace
- the many result, practice and task cards across speaking and writing
  should move onto `AppCard`, which removes the repeated
  `rounded-3xl bg-white shadow-sm ring-1` string
- form and action buttons in speaking and writing should move onto
  `AppButton` and `AppButtonLink`
- feature date and duration formatters can move onto the shared
  formatters once each call site is verified
- a badge gallery or profile screen should use `AppBadgeIcon` at `lg` or
  `xl`
- once the app is fully on the tokens, the app surfaces can move from
  the cream background to the warm white page token

## 9. Do not delete asset notes

None of the following may be deleted or moved:

- `public/assets/branding/` - original logos and favicons. The favicon
  and app icon stay PNG on purpose.
- `public/assets/normalized/badges/` - normalized 512px and 1024px
  badges, both WebP and PNG. The PNG twins are the fallback format.
- `public/assets/normalized/skills/` - normalized 512px skill icons,
  both WebP and PNG.
- `public/assets/optimized/` - optimized WebP copies used by the app.
- the original landscape badge and icon sheets are the regeneration
  source for `npm run assets:normalize-badges`. Deleting them makes the
  normalized artwork unreproducible.

Related documents:

- `docs/product/asset-inventory.md`
- `docs/product/badge-icon-normalization-report.md`
- `docs/tickets/CELPIP-UX-01-design-system-foundation.md`
