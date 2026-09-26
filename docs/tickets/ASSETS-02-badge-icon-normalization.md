# ASSETS-02 - Badge and Icon Normalization

## Goal

Normalize the badge and skill icon assets so they are usable inside the Toronto Academy of Education CELPIP app UI.

ASSETS-01 optimized large image files into WebP copies, but some badge and skill icon files are still large landscape images. They may visually look round or icon-like, but their canvas size may be too large for UI usage.

This ticket should create clean square badge and skill icon assets without redesigning the app.

Do not redesign the dashboard.
Do not change speaking logic.
Do not change writing logic.
Do not change AI scoring logic.
Do not build payment.
Do not create Supabase migrations.
Do not delete original assets.

## Product name

Toronto Academy of Education CELPIP Preparation Program

## Background

Current Gemini-created badge and skill assets may be:

- visually round
- visually badge-like
- but stored as 2816x1536 landscape images
- too large for small UI usage
- possibly padded with excess empty area
- possibly lacking true transparency

The goal is not to regenerate artwork. The goal is to make existing artwork usable in the app.

## Required script

Create:

scripts/normalize-badge-icon-assets.mjs

The script should:

1. Inspect badge assets and skill icon assets
2. Read dimensions, file size, alpha channel information, and transparency status
3. Detect large landscape canvas assets
4. Create normalized square versions
5. Trim excess padding where safe
6. Preserve transparency if available
7. If no transparency exists, do not guess aggressively
8. Create PNG and WebP normalized versions
9. Preserve originals
10. Generate a report

## Required folders

Create if needed:

public/assets/normalized/badges/
public/assets/normalized/skills/

## Normalized output rules

For badges:

- output square image
- preferred size: 1024x1024
- also create 512x512 if simple
- center the badge
- preserve transparent background if present
- use PNG for high-quality UI badge
- use WebP for optimized web display

For skill icons:

- output square image
- preferred size: 512x512
- preserve transparent background if present
- use PNG and WebP

## Transparency rules

If asset has a real alpha channel:

- preserve transparency

If asset has no real transparency but a clean white or near-white background:

- create a report warning
- optionally create a candidate transparent version only if background removal is very safe

If the background is complex or uncertain:

- do not remove background automatically
- report manual review needed

Do not produce ugly cutouts.

## Canvas rules

If the image is landscape but the badge or icon is centered:

- crop or trim around the visible badge or icon
- add safe padding
- place on square canvas
- resize to target size

Do not stretch the image.

Do not distort the badge.

## Required report

Create or update:

docs/product/badge-icon-normalization-report.md

Report should include:

- original path
- original dimensions
- original size
- whether alpha exists
- whether meaningful transparency exists
- normalized PNG path
- normalized WebP path
- normalized dimensions
- normalized size
- warning notes
- manual review notes

## Update asset maps

Update:

src/features/assets/badge-asset-map.ts
src/features/assets/module-asset-map.ts
src/features/assets/asset-registry.ts

Use normalized assets where available.

Do not change database badge slugs.

Known badge slugs:

- foundation-speaker
- developing-communicator
- test-ready-builder
- confident-speaker
- advanced-communicator

UI labels can say communicator, but database slugs must stay unchanged.

## Package scripts

Add package.json script:

"assets:normalize-badges": "node scripts/normalize-badge-icon-assets.mjs"

## Do not overbuild

Do not create a complex image editor.

Do not install heavy image libraries beyond sharp.

Do not use Cloudinary.

Do not use AI background removal.

Do not manually recreate badges.

Do not change UI pages yet.

## Security requirements

- Do not read .env.local
- Do not print secrets
- Do not touch API routes
- Do not touch Supabase migrations

## Manual Supabase steps

None.

## Important UI copy rule

Do not use long hyphens or em dashes anywhere in UI copy, comments, docs, or prompts. Use normal hyphens only.

## Done criteria

- Badge/icon normalization script exists
- Normalized badge assets are created
- Normalized skill icon assets are created
- Originals are untouched
- Report is created
- Asset registry uses normalized files where available
- Badge map uses normalized files where available
- Module asset map uses normalized files where available
- No UI redesign is done
- No Supabase migration is created
- npm run lint passes
- npm run build passes
