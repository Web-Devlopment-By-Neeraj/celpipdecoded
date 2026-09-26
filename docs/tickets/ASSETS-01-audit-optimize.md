# ASSETS-01 - Asset Audit and Optimization Pipeline

## Goal

Audit, organize, and optimize the image assets created for the Toronto Academy of Education CELPIP app.

The app now has branding assets, dashboard illustrations, empty-state illustrations, skill icons, and badge assets. Some Gemini-created PNG files may be large. This ticket should create a safe asset optimization workflow before the next design-system or dashboard redesign work begins.

Do not redesign the dashboard in this ticket.
Do not change speaking logic.
Do not change writing logic.
Do not change AI scoring logic.
Do not build payment.
Do not create Supabase migrations.
Do not remove working assets without a report.

## Product name

Toronto Academy of Education CELPIP Preparation Program

## Current asset direction

The product should use a professional Toronto Academy of Education visual style:

- navy and white primary theme
- adult-focused education platform feel
- clean web app illustrations
- subtle badges and progress visuals
- no childish game style
- no random mixed asset styles

## Asset folders to inspect

Inspect:

- public/
- public/assets/
- public/assets/branding/
- public/assets/illustrations/
- public/assets/empty-states/
- public/assets/skills/
- public/assets/badges/
- public/assets/ui-icons/

Some folders may not exist yet. Create them only if needed.

## Important source rule

Do not overwrite original files.

If assets are currently mixed directly in public, organize copies into public/assets where appropriate.

Keep the original files untouched unless there is a clear duplicate and the report explains it.

## Required script

Create:

scripts/audit-and-optimize-assets.mjs

The script should:

1. Scan image files in public and public/assets
2. Include png, jpg, jpeg, webp
3. Exclude favicon files from conversion
4. Exclude obvious app icon files from unsafe conversion
5. Read file size and dimensions
6. Decide whether optimization is recommended
7. Create optimized WebP copies for heavy images
8. Preserve transparency when converting PNG badges or icons to WebP
9. Save optimized files beside the originals or in a clear optimized folder
10. Generate a markdown report

Recommended output folder:

public/assets/optimized/

The script should keep subfolder structure where practical.

Example:

public/assets/badges/badge-first-writing.png

becomes:

public/assets/optimized/badges/badge-first-writing.webp

## Optimization rules

Use these default rules:

1. Branding logos

Keep original PNG/SVG.

Only create optimized display copy if file is very large.

Do not convert favicon as the main browser icon.

2. Dashboard illustrations

If larger than 500 KB, create WebP version.

Quality target:

82 to 88

3. Empty-state illustrations

If larger than 300 KB, create WebP version.

Quality target:

82 to 88

4. Badges

If larger than 200 KB, create WebP version with transparency.

Quality target:

88 to 92

5. Skill icons

If larger than 150 KB, create WebP version with transparency.

Quality target:

88 to 92

6. Photos

If larger than 800 KB, create WebP version.

Quality target:

80 to 85

## Required dependency

Use sharp for image metadata and conversion.

If sharp is not installed, install it.

Command:

npm install -D sharp

Do not add unnecessary image libraries.

## Package script

Add package.json scripts:

"assets:audit": "node scripts/audit-and-optimize-assets.mjs --audit"
"assets:optimize": "node scripts/audit-and-optimize-assets.mjs --optimize"

The audit mode should only report.

The optimize mode should create WebP files and update the report.

## Required report

Create or update:

docs/product/asset-inventory.md

The report should include:

- asset filename
- current path
- type category
- dimensions
- original size
- optimized path if created
- optimized size
- percent saved
- recommended use
- warning notes

Warnings should include:

- very large file
- unclear category
- possible duplicate
- possible fake transparency or checkerboard background
- logo may need SVG or higher-quality PNG
- image is in public root but should be organized

## Required asset registry

Create:

src/features/assets/asset-registry.ts

This file should export grouped asset paths.

Include groups:

- brandingAssets
- dashboardAssets
- emptyStateAssets
- skillAssets
- badgeAssets

Use optimized WebP paths when available.

Use original PNG paths when:

- favicon
- logo needs transparency and WebP copy does not improve quality
- optimized copy does not exist

Example structure:

export const badgeAssets = {
  firstWriting: "/assets/optimized/badges/badge-first-writing.webp",
  firstSpeaking: "/assets/optimized/badges/badge-first-speaking.webp"
} as const;

Do not import this registry into many UI pages yet unless minimal safe use is already obvious.

The main goal is to prepare for future UI tickets.

## Badge mapping file

Create or update:

src/features/assets/badge-asset-map.ts

Map current shared badge slugs to asset paths if matching files exist.

Known badge slugs:

- foundation-speaker
- developing-communicator
- test-ready-builder
- confident-speaker
- advanced-communicator

The UI label can say communicator even if the slug says speaker.

Do not change badge slugs in the database.

## Module asset map

Create:

src/features/assets/module-asset-map.ts

Map modules to skill icons if matching files exist:

- celpip-speaking
- celpip-writing
- celpip-reading
- celpip-listening
- live-classes

If an asset is missing, use a safe fallback.

## Do not over-optimize

Do not convert every small image.

Do not create many duplicate versions.

Do not create AVIF in this ticket unless simple and clearly beneficial.

Do not delete source images.

Do not use Cloudinary.

Do not add remote image hosting.

## Quality requirements

Optimized assets should still look sharp in the app.

Do not reduce quality so much that badges, icons, or illustrations look blurry.

Large illustrations can use WebP.

Small icons and badges can remain PNG if they are already small and crisp.

## Manual review requirement

After running the script, list:

- total assets scanned
- number optimized
- total original size
- total optimized size
- total saved
- top 10 largest files
- assets that should be manually reviewed

## Security requirements

- Do not expose secrets
- Do not read .env.local
- Do not print environment variables
- Do not touch Supabase keys
- Do not modify API routes

## Manual Supabase steps

None.

Do not create migrations.

## Important UI copy rule

Do not use long hyphens or em dashes anywhere in UI copy, comments, docs, or prompts. Use normal hyphens only.

## Done criteria

- Asset audit script exists
- assets:audit script works
- assets:optimize script works
- docs/product/asset-inventory.md is generated
- Large PNG/JPG assets have optimized WebP copies
- Favicon and logos are not broken
- Original files are not overwritten
- Asset registry exists
- Badge asset map exists
- Module asset map exists
- No UI redesign is done
- No Supabase migration is created
- npm run lint passes
- npm run build passes
- No secrets are committed
