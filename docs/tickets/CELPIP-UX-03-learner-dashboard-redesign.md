# CELPIP-UX-03 - Learner Dashboard Redesign

## Goal

Redesign the signed-in learner dashboard for the Toronto Academy of Education CELPIP app.

The dashboard should become a learner-focused home screen that answers:

- What should I practise today?
- What is my current estimated practice level?
- How many AI feedback attempts do I have left?
- What did I complete recently?
- Which module should I continue?
- What badge or progress have I earned?

This ticket should use the existing design system and asset registry.

Do not build Live Classes in this ticket.
Do not build payment.
Do not build Stripe.
Do not change AI scoring prompts.
Do not change speaking logic.
Do not change writing logic.
Do not change authentication logic.
Do not create Supabase migrations unless absolutely required.
Do not delete assets.
Do not redesign the public landing page.

## Product

Toronto Academy of Education CELPIP Preparation Program

## Context

Completed before this ticket:

- Speaking practice
- Writing practice
- Speaking history and progress
- Writing history and progress
- AI usage instrumentation
- Free attempt and premium access rules if merged
- Asset optimization
- Badge and skill icon normalization
- Design-system foundation
- Responsive app shell and navigation if merged

Use existing shared components from CELPIP-UX-01:

- AppPageShell
- AppSectionHeader
- AppCard
- AppButton
- AppButtonLink
- AppMetricCard
- AppProgressBar
- AppStatusBadge
- AppEmptyState
- AppModuleCard
- AppBadgeIcon
- AppAssetImage

Use existing asset files:

- src/features/assets/asset-registry.ts
- src/features/assets/badge-asset-map.ts
- src/features/assets/module-asset-map.ts

Use WebP assets by default.

## Main dashboard route

Update:

src/app/dashboard/page.tsx

Do not change the dashboard route path.

## Required dashboard sections

The new dashboard should include:

1. Learner welcome hero

Show:

- greeting
- Toronto Academy CELPIP Preparation Program
- short supportive message
- primary action: Continue practice
- secondary action: View speaking or writing history
- optional dashboard illustration from asset registry

2. AI feedback access card

If USAGE-01 access components exist, use them.

Show:

- free attempts remaining
- paid attempts remaining if available
- total scored attempts remaining
- simple message about AI feedback access

If usage access components are not available yet, show a safe placeholder card:

- AI feedback access
- Your practice access details will appear here.

Do not build payment checkout.

3. Recommended next practice

Use existing attempt history to suggest a next action.

Simple rules:

- If no completed feedback reports exist, recommend starting Speaking or Writing
- If user has only speaking attempts, recommend Writing
- If user has only writing attempts, recommend Speaking
- If latest completed score is lower in one module, recommend that module
- If both modules have recent attempts, recommend the module practised less recently

Do not use OpenAI for recommendations in this ticket.

4. Speaking and Writing progress overview

Show two progress cards:

- CELPIP Speaking Practice
- CELPIP Writing Practice

Each card should show:

- feedback reports completed
- best estimated practice level
- latest estimated practice level
- latest practice date
- action button

Actions:

- Continue Speaking
- Continue Writing
- View Speaking History
- View Writing History

5. Recent feedback reports

Show the latest 3 to 5 completed speaking and writing feedback reports.

Each item should show:

- module
- task title
- estimated practice level
- submitted date
- badge if available
- View feedback link

6. Practice badges preview

Show recent or earned badges using real badge artwork.

Use AppBadgeIcon and badge-asset-map.

If no badges exist, show a nice empty state.

Do not create a full badge collection page in this ticket.

7. Module cards

Keep module cards for:

- Speaking
- Writing
- Reading
- Listening

Speaking and Writing should be active.

Reading and Listening can stay Coming soon.

Use AppModuleCard.

8. Live Classes placeholder only

Because live package work is intentionally after UI design, do not build live class feature here.

Only include either:

- no live class card

or a very small Coming soon card if the current app already has one.

Do not create a live class form.
Do not create a live class CRM flow.
Do not create live class pricing logic.
Do not add live class enquiry.

## Data sources

Use existing Supabase data only.

Use:

- attempts
- attempt_scores
- tasks
- modules
- badges
- user_badges
- learner_usage_accounts if available
- scored_attempt_consumptions if available

Do not create new tables.

Do not create new migrations unless there is a real missing index issue.

## Required feature files

Create if useful:

src/features/dashboard/dashboard-summary.ts
src/features/dashboard/dashboard-recommendations.ts
src/features/dashboard/dashboard-copy.ts

Optional:

src/features/dashboard/dashboard-types.ts

## Required components

Create:

src/components/dashboard/DashboardHero.tsx
src/components/dashboard/DashboardRecommendedPractice.tsx
src/components/dashboard/DashboardProgressOverview.tsx
src/components/dashboard/DashboardRecentFeedback.tsx
src/components/dashboard/DashboardBadgePreview.tsx
src/components/dashboard/DashboardModuleGrid.tsx
src/components/dashboard/DashboardAccessSummary.tsx

Use existing app components from src/components/app.

Do not create one-off card/button styles if an app component already exists.

## Recommended dashboard layout

Desktop:

- Hero at top
- Access summary and recommended practice beside each other
- Speaking and Writing progress cards
- Recent feedback and badges
- Module grid

Mobile:

- Stack sections vertically
- Keep primary action near the top
- Do not overflow horizontally
- Keep tap targets comfortable

## Copy direction

Use professional learner-focused copy.

Good copy:

- Continue practice
- Your next recommended practice
- Recent feedback
- Practice progress
- Estimated practice level
- AI feedback access
- Practice badges
- Keep building your CELPIP skills

Avoid:

- official CELPIP score
- guaranteed score
- pass guaranteed
- cheap AI checker
- unlimited AI
- game-first language

## Disclaimer

Where estimated levels are shown, include:

Practice estimates are for preparation only and are not official CELPIP scores.

## AI recommendation rule

Do not call OpenAI to generate dashboard recommendations.

Use simple deterministic logic from stored attempts and scores.

## Access rule

If USAGE-01 is merged:

- display access summary
- do not enforce access here except through existing backend rules
- do not allow users to grant themselves credits

If USAGE-01 is not merged:

- do not create usage logic in this ticket
- show no access card or a safe placeholder only

## Live Classes rule

Live package comes later.

Do not implement live class promotion or CRM handoff in this ticket.

Later ticket:

LIVE-01 - Live Class Promotion and CRM Handoff

## Security requirements

- Do not read .env.local
- Do not print secrets
- Do not expose Supabase service role key
- Do not expose OpenAI key
- Do not call admin Supabase helper from client components
- Do not change auth helpers
- Do not weaken RLS
- Do not create client-side access updates

## Manual Supabase steps

None expected.

Do not create migrations unless there is a clear reason.

## Documentation

Create:

docs/product/learner-dashboard-redesign.md

Include:

1. Dashboard sections added
2. Data sources used
3. Recommendation logic
4. Asset usage
5. Badge usage
6. Access summary behavior
7. Mobile behavior
8. What was intentionally not built
9. Follow-up tickets

## Important UI copy rule

Do not use long hyphens or em dashes anywhere in UI copy, docs, comments, or prompts. Use normal hyphens only.

## Done criteria

- /dashboard is redesigned as learner-focused home
- dashboard uses shared design-system components
- dashboard uses optimized WebP assets where images are shown
- module cards use AppModuleCard
- badge preview uses real badge artwork where available
- Speaking and Writing progress are visible
- recent feedback reports are visible
- recommended next practice is visible
- AI feedback access summary appears if available
- Reading and Listening remain Coming soon
- no live class feature is built
- no payment checkout is built
- no AI prompts are changed
- no speaking/writing logic is changed
- no Supabase migration is created unless justified
- docs/product/learner-dashboard-redesign.md exists
- npm run lint passes
- npm run build passes
