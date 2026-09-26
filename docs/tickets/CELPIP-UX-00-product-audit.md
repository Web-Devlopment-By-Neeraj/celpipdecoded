# CELPIP-UX-00 - Existing Product Audit

## Goal

Audit the existing Toronto Academy of Education CELPIP web app before starting design-system, dashboard, usage-limit, and launch-readiness tickets.

This is an audit and documentation ticket only.

Do not redesign the app.
Do not change speaking logic.
Do not change writing logic.
Do not change AI scoring logic.
Do not change authentication.
Do not change Supabase schema.
Do not create migrations.
Do not delete files.
Do not move assets.
Do not install dependencies.
Do not build payment.
Do not build usage limits.

## Product

Toronto Academy of Education CELPIP Preparation Program

## Current completed areas

The app already includes:

- Next.js frontend
- Vercel deployment workflow
- Supabase backend
- Supabase auth
- Speaking practice
- Writing practice
- AI scoring and feedback
- Speaking history/progress
- Writing history/progress
- Asset optimization pipeline
- Badge and skill icon normalization
- Asset registry and maps

Do not rebuild working systems.

## Audit output files

Create or update only documentation files:

- docs/product/celpip-ux-audit.md
- docs/product/cleanup-candidates.md
- docs/product/recommended-ticket-sequence.md

Do not modify app source files unless there is a very small typo in documentation only.

## Audit areas

Inspect and document:

1. App routes

Include:

- public landing routes
- auth routes
- dashboard routes
- speaking routes
- writing routes
- history routes
- API routes

2. Current dashboard

Document:

- what the dashboard currently shows
- whether it feels learner-focused or admin-like
- whether speaking and writing progress are visible
- whether assets are being used
- what should improve

3. Speaking flow

Inspect:

- task library
- practice route
- recording flow
- upload flow
- transcription flow
- AI feedback flow
- result page
- history/progress page
- mobile usability risks

Do not change speaking flow.

4. Writing flow

Inspect:

- task library
- timed writing editor
- submission flow
- AI feedback flow
- result page
- history/progress page
- mobile usability risks

Do not change writing flow.

5. AI scoring and feedback

Inspect:

- speaking feedback structure
- writing feedback structure
- OpenAI usage locations
- server-side safety
- result-card presentation
- estimated-score disclaimers
- opportunities for clearer structured reports

Do not change prompts.

6. Supabase schema

Inspect migrations and current table usage.

Document existing support for:

- profiles
- modules
- tasks
- speaking task details
- writing task details
- attempts
- attempt scores
- badges
- user badges
- usage events if present
- live class interest if present
- early access leads if present
- asset-related tables if any

Do not create migrations.

7. Asset system

Inspect:

- public/assets
- public/assets/optimized
- public/assets/normalized
- src/features/assets/asset-registry.ts
- src/features/assets/badge-asset-map.ts
- src/features/assets/module-asset-map.ts
- docs/product/asset-inventory.md
- docs/product/badge-icon-normalization-report.md

Document:

- which assets are ready for UI
- which assets should use WebP
- which PNGs should remain as source/fallback
- which root public assets should later move
- which logos need better SVG or transparent PNG versions
- which fallback mappings still need real artwork

Do not move or delete assets in this ticket.

8. Design consistency

Inspect:

- colors
- cards
- buttons
- spacing
- typography
- navigation
- status badges
- loading states
- empty states
- mobile layout
- use of images

Document what should be standardized in the design-system ticket.

9. Launch readiness

Document gaps for launch:

- free attempt logic
- paid usage limits
- live class inquiry flow
- pricing page or plan section
- email capture
- terms/disclaimer copy
- AI score disclaimer visibility
- mobile responsiveness
- error handling
- loading states
- AI cost tracking
- duplicate submission protection
- rate limits

10. Cleanup candidates

Create docs/product/cleanup-candidates.md.

Group cleanup candidates by risk:

Low risk:
- unused docs
- duplicate generated reports
- clearly unused image copies
- old placeholder files

Medium risk:
- root public images that should move under public/assets
- old logo variants
- duplicate asset formats
- unused components

High risk:
- migrations
- database code
- auth helpers
- API routes
- scoring logic
- speaking/writing attempt flows

Do not delete anything now.

## Required audit report structure

docs/product/celpip-ux-audit.md should include:

1. Executive summary
2. Current architecture summary
3. Completed features
4. Partially completed features
5. Route inventory
6. Speaking flow audit
7. Writing flow audit
8. Dashboard audit
9. AI feedback audit
10. Supabase schema audit
11. Asset system audit
12. Design consistency audit
13. Mobile responsiveness concerns
14. Security and secret-handling review
15. Launch-readiness gaps
16. Recommended next tickets
17. Do-not-rewrite list
18. Manual testing checklist

## Recommended ticket sequence report

docs/product/recommended-ticket-sequence.md should include:

Immediate next tickets:

1. CELPIP-UX-01 - Design System Foundation
2. CELPIP-UX-02 - Responsive App Shell
3. CELPIP-UX-03 - Learner Dashboard Redesign
4. USAGE-01 - Free Attempt Limit and Premium Access Rules
5. LIVE-01 - Live Class Inquiry and Schedule Interest

Later tickets:

- CELPIP-UX-04 - Practice Library and Learning Path
- CELPIP-UX-05 - Speaking Experience Upgrade
- CELPIP-UX-06 - Writing Experience Upgrade
- CELPIP-GAME-01 - XP and Learning Levels
- CELPIP-GAME-02 - Streaks and Weekly Goals
- CELPIP-COST-01 - AI Usage Tracking
- CLEANUP-01 - Safe Unused Asset and File Cleanup

## Cleanup planning rule

Do not delete unnecessary files during this audit.

The audit should decide what belongs in a later cleanup ticket.

The cleanup ticket should only happen after:

- audit is complete
- design-system foundation is decided
- asset registry usage is confirmed
- dashboard redesign has started using optimized assets

## Security requirements

- Do not read .env.local
- Do not print secrets
- Do not expose API keys
- Do not change auth
- Do not change Supabase RLS
- Do not touch service role usage unless only documenting risks

## Manual Supabase steps

None.

Do not create migrations.

## Important UI copy rule

Do not use long hyphens or em dashes anywhere in docs, comments, or prompts. Use normal hyphens only.

## Done criteria

- docs/product/celpip-ux-audit.md exists
- docs/product/cleanup-candidates.md exists
- docs/product/recommended-ticket-sequence.md exists
- audit covers routes, dashboard, speaking, writing, AI, schema, assets, design, launch readiness
- cleanup candidates are grouped by risk
- recommended ticket sequence is clear
- no app source files are changed
- no assets are deleted
- no Supabase migration is created
- no dependency is installed
- npm run lint passes
- npm run build passes
