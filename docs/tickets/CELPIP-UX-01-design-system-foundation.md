# CELPIP-UX-01 - Design System Foundation

## Goal

Create a reusable design-system foundation for the Toronto Academy of Education CELPIP app before dashboard redesign and launch-readiness work.

This ticket should standardize colors, cards, buttons, section headers, metric cards, progress bars, empty states, status badges, module cards, badge artwork, and asset usage.

Do not redesign the full dashboard in this ticket.
Do not change speaking logic.
Do not change writing logic.
Do not change AI scoring logic.
Do not change authentication.
Do not change Supabase schema.
Do not create migrations.
Do not build payment.
Do not build usage limits.
Do not delete assets.

## Product

Toronto Academy of Education CELPIP Preparation Program

## Context

CELPIP-UX-00 audit found:

- asset registry exists but is unused
- signed-in app barely uses images
- badges display as star glyphs instead of badge assets
- dashboard is a simple stub
- card and button styles are repeated many times
- status badge tone logic is duplicated
- no semantic design-system foundation exists
- AI usage is uncapped, but usage protection is a later ticket

This ticket creates the UI foundation only.

## Brand direction

Use a professional academy style:

- deep navy primary
- white and warm white background
- soft blue secondary
- controlled Canadian red accent
- green for success
- amber for warning
- red only for destructive or error states
- adult-focused
- calm
- premium education product
- not childish
- not game-first

## Required files to create

Create these if they do not already exist:

src/features/design/design-tokens.ts
src/features/design/status-styles.ts
src/features/design/formatters.ts

src/components/app/AppPageShell.tsx
src/components/app/AppSectionHeader.tsx
src/components/app/AppCard.tsx
src/components/app/AppButton.tsx
src/components/app/AppButtonLink.tsx
src/components/app/AppMetricCard.tsx
src/components/app/AppProgressBar.tsx
src/components/app/AppStatusBadge.tsx
src/components/app/AppEmptyState.tsx
src/components/app/AppModuleCard.tsx
src/components/app/AppBadgeIcon.tsx
src/components/app/AppAssetImage.tsx

docs/product/design-system-foundation.md

## Existing asset files to use

Use the existing asset maps from ASSETS-01 and ASSETS-02:

src/features/assets/asset-registry.ts
src/features/assets/badge-asset-map.ts
src/features/assets/module-asset-map.ts

Important:

- use WebP asset paths by default
- do not use large PNGs unless needed as source or fallback
- do not delete original image files
- do not move assets in this ticket
- do not create new assets in this ticket

## Design token requirements

Create a centralized token file with semantic class strings.

Include tokens for:

- page background
- card background
- primary text
- secondary text
- muted text
- border
- navy brand surface
- blue accent
- red accent
- success tone
- warning tone
- error tone
- info tone
- card shadow
- focus ring
- rounded card styles

Do not hardcode brand values in every component.

Use class strings that work with the existing Tailwind setup.

Do not install a new UI library.

## Component requirements

### AppPageShell

Reusable protected-page layout container.

Should support:

- title
- description
- children
- optional action area
- consistent max width
- consistent padding
- mobile friendly spacing

### AppSectionHeader

Reusable section header.

Should support:

- title
- description
- action slot
- eyebrow text if needed

### AppCard

Reusable card wrapper.

Should support:

- children
- variant: default, highlighted, subtle, danger
- optional className

### AppButton

Reusable button style.

Should support:

- variant: primary, secondary, ghost, danger
- size: sm, md, lg
- disabled
- loading text if needed
- className

If the project already has a button component, reuse it or wrap it instead of duplicating.

### AppButtonLink

Reusable link styled as a button.

Should support:

- href
- variant
- size
- className

### AppMetricCard

For dashboard and progress numbers.

Should support:

- label
- value
- helper text
- trend or status text
- optional icon or image

### AppProgressBar

Simple accessible progress bar.

Should support:

- value
- max
- label
- helper text
- show percent

### AppStatusBadge

One shared status badge.

Should centralize status colors for:

- success
- warning
- error
- info
- neutral
- progress

This should reduce duplicated status styling later.

### AppEmptyState

Reusable empty state.

Should support:

- title
- description
- action
- optional image path
- optional image alt text

Use optimized WebP images from the asset registry if available.

### AppModuleCard

Reusable module card for Speaking, Writing, Reading, Listening, and Live Classes.

Should support:

- module slug
- title
- description
- href
- status
- optional metric
- optional call to action

Use module-asset-map.ts for module icons.

### AppBadgeIcon

Reusable badge artwork component.

Should support:

- badge slug
- size
- alt text
- fallback if artwork missing

Use badge-asset-map.ts.

Use WebP by default.

### AppAssetImage

Reusable Next.js Image wrapper for local optimized assets.

Should support:

- src
- alt
- width
- height
- className
- priority only when explicitly passed

Do not mark all images priority.

## Limited adoption in this ticket

This ticket may make small safe updates to use the new components.

Allowed updates:

- update the main dashboard module cards to use AppModuleCard
- update badge display components to use AppBadgeIcon where simple and safe
- update empty states to use AppEmptyState where simple and safe
- update repeated status badges only when behavior remains unchanged

Not allowed:

- full dashboard redesign
- changing route structure
- changing server logic
- changing AI prompts
- changing database calls
- changing scoring behavior

## Dashboard rule

Do not build the new learner dashboard yet.

The dashboard can look slightly cleaner after using AppModuleCard, but the full dashboard redesign belongs to:

CELPIP-UX-03 - Learner Dashboard Redesign

## Badge rule

Do not change database badge slugs.

Known slugs:

- foundation-speaker
- developing-communicator
- test-ready-builder
- confident-speaker
- advanced-communicator

UI can display communicator wording, but database slugs must remain unchanged.

## Accessibility requirements

Components should support:

- readable color contrast
- keyboard focus styles
- meaningful alt text for images
- decorative images should use empty alt only if truly decorative
- buttons should have clear labels
- progress bars should expose accessible values

## Mobile requirements

Components should be mobile-first.

Cards should stack properly.
Buttons should be easy to tap.
Images should not overflow.
Module cards should not rely on hover only.

## Documentation

Create:

docs/product/design-system-foundation.md

Include:

1. Brand direction
2. Design token summary
3. Component list
4. Asset usage rules
5. Badge usage rules
6. Module icon usage rules
7. What was adopted in this ticket
8. What should be adopted in later tickets
9. Do-not-delete asset notes

## Security requirements

- Do not read .env.local
- Do not print secrets
- Do not expose Supabase service role key
- Do not expose OpenAI keys
- Do not touch API routes
- Do not change auth helpers

## Manual Supabase steps

None.

Do not create migrations.

## Important UI copy rule

Do not use long hyphens or em dashes anywhere in UI copy, docs, comments, or prompts. Use normal hyphens only.

## Done criteria

- design token file exists
- shared status style file exists
- shared app UI components exist
- asset registry is used safely by at least module or badge components
- WebP paths are used by default
- no full dashboard redesign is done
- no Supabase migration is created
- no dependencies are installed
- no original assets are deleted
- docs/product/design-system-foundation.md exists
- npm run lint passes
- npm run build passes
- no secrets are committed
