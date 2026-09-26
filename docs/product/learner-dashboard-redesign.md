# Learner Dashboard Redesign (CELPIP-UX-03)

The signed in `/dashboard` route is now a learner home screen for the
Toronto Academy of Education CELPIP Preparation Program. It answers what
to practise next, where the learner stands, what AI feedback access is
left, and what was completed recently.

The route path did not change. No new Supabase table, no new migration,
no payment flow and no live class feature were added.

## 1. Dashboard sections added

In render order:

1. **Learner welcome hero** (`DashboardHero`)
   Greeting, program name, a short supportive message, a primary
   "Continue practice" action that points at the recommended module, and
   a secondary link to speaking history. Carries the dashboard study
   illustration as the one preloaded image on the page.

2. **AI feedback access summary** (`DashboardAccessSummary`)
   Renders the existing `UsageAccessCard` when the USAGE-01 summary can
   be read, otherwise a safe placeholder card.

3. **Recommended next practice** (`DashboardRecommendedPractice`)
   A highlighted card with the suggested module, a plain reason line, a
   "Continue Speaking" or "Continue Writing" action, and a link to that
   module's history.

4. **Speaking and Writing progress overview** (`DashboardProgressOverview`)
   Two headline metric cards (feedback reports completed, best estimated
   practice level) above one card per module. Each module card shows a
   progress bar for the best level, feedback reports completed, best
   estimated practice level, latest estimated practice level, latest
   practice date, and the two module actions.

5. **Recent feedback reports** (`DashboardRecentFeedback`)
   The latest 5 completed speaking and writing reports. Each row shows
   the module, task title, task type, estimated practice level, submitted
   date, the earned badge artwork and label where one exists, and a
   "View feedback" link into the module's saved report.

6. **Practice badges preview** (`DashboardBadgePreview`)
   Earned badges with real badge artwork, capped at 8. Empty state when
   the learner has none.

7. **Module cards** (`DashboardModuleGrid`)
   Speaking, Writing, Reading and Listening. Speaking and Writing are
   active, Reading and Listening stay Coming soon.

8. **No live class section.** See "What was intentionally not built".

## 2. Data sources used

All reads use the session scoped Supabase server client, so RLS applies
and only the signed in learner's rows come back. The explicit `user_id`
filters are a second guard. Three queries run in parallel:

| Query | Tables | Purpose |
| --- | --- | --- |
| Modules | `modules` | The four practice module cards, filtered to the practice slugs and ordered by `sort_order` |
| Attempts | `attempts`, `tasks`, `modules`, `attempt_scores` | Progress values, recommendation input and recent feedback rows |
| Badges | `user_badges`, `badges` | The badge preview |

The attempt query is `DASHBOARD_ATTEMPT_SELECT` in
`src/features/dashboard/dashboard-summary.ts`. It inner joins `tasks` and
`modules` so every row can be assigned to speaking or writing, embeds
`attempt_scores` for the estimated level and badge slug, filters to the
history statuses of both modules, and is capped at 200 rows. The page
only needs counts plus best and latest values, so an unbounded history
read would grow with every attempt for no extra display value.

AI feedback access is read separately through the existing
`getUsageAccessSummary` server helper (USAGE-01), which calls
`public.get_learner_usage_summary`.

No new table, column, index or migration was needed. Existing indexes on
`attempts.user_id` and `user_badges.user_id` already cover these reads.

## 3. Recommendation logic

`src/features/dashboard/dashboard-recommendations.ts`. Deterministic and
derived only from stored attempts and scores that the page has already
loaded. **No OpenAI call, no extra query and no writes.** First matching
rule wins:

| Rule | Condition | Result |
| --- | --- | --- |
| `start-practice` | No saved feedback reports in either module | Start with Speaking, copy also points at Writing |
| `balance-writing` | Saved reports in Speaking only | Try Writing next |
| `balance-speaking` | Saved reports in Writing only | Try Speaking next |
| `lower-level` | Both modules have reports and the latest estimated levels differ | The module with the lower latest level |
| `less-recent` | Levels are equal or not comparable | The module practised less recently, Speaking wins a tie |

A module never practised counts as the least recent, so it is the one to
return to. The chosen recommendation also drives the hero's primary
action, so the first clickable thing on the page matches the advice.

## 4. Asset usage

WebP by default, all paths resolved through the asset registry and the
asset maps. Nothing was added to `public/` and no asset was deleted.

- `dashboardAssets.studyHero` in the hero, the one preloaded image
- `getModuleAsset(slug).icon` (normalized 512 WebP skill icons) on the
  recommendation card, the two progress cards and the module cards
- `skillAssets.speaking` and `skillAssets.writing` on the two headline
  metric cards
- `emptyStateAssets.noFeedback`, `emptyStateAssets.noBadges` and
  `emptyStateAssets.noProgress` on the three empty states

Every image renders through `AppAssetImage`, so sizing and lazy loading
stay consistent.

## 5. Badge usage

Badges come from `user_badges` joined to the `badges` catalog, ordered by
`earned_at` descending and capped at 8. Artwork is rendered by
`AppBadgeIcon`, which resolves the stored slug through
`badge-asset-map.ts` and falls back to a generic badge for an unmapped
slug, so an unknown slug never renders a broken image. Slugs are database
values and are not renamed in the UI.

Recent feedback rows also show the badge earned for that report, using
the small badge artwork next to the row and the module's own badge label
(speaking labels from `level-badges.ts`, writing labels from
`writing-level-badges.ts`).

With no badges, `AppEmptyState` renders with the no badges illustration
and a link into writing practice. This ticket does not add a full badge
collection page.

## 6. Access summary behavior

- The summary is read on the server with the service role helper and
  passed to the component as a plain object. No Supabase key, no admin
  helper and no direct table access reaches the browser.
- When the read succeeds, the existing `UsageAccessCard` renders free,
  monthly and paid balances plus the standard helper line.
- When the read fails, for example because USAGE-01 is not configured on
  the environment, the component renders a placeholder card titled
  "AI feedback access" with the text "Your practice access details will
  appear here." A zero balance the learner cannot act on is never shown
  as if it were real.
- The dashboard displays access only. It does not enforce it, and there
  is no control anywhere on the page that can change a balance. Access is
  still enforced by the existing backend rules before an AI call.
- No checkout, pricing or Stripe UI was added.

## 7. Mobile behavior

- Every section stacks to a single column below the `sm` breakpoint.
- The hero action sits near the top on mobile, so the primary next step
  is reachable without scrolling past the illustration.
- Access summary and recommended practice sit side by side from `lg` and
  stack below it. Progress cards do the same. Module cards run four
  across at `lg`, two at `sm`, one below that.
- Recent feedback rows switch from a single row to a stacked block on
  small screens, and the task title truncates rather than pushing the
  row wide, so nothing overflows horizontally.
- All actions reuse `AppButtonLink`, whose smallest size is still a
  comfortable tap target.

## 8. What was intentionally not built

- **Live Classes.** No card, promotion, schedule request, enquiry form,
  CRM handoff or pricing logic. The module grid is filtered to the four
  practice slugs, so the `live-classes` catalog row does not render on
  the dashboard at all.
- **Payment and Stripe.** No checkout, no credit purchase, no client side
  access update.
- **AI scoring changes.** No prompt, schema or scoring logic was touched.
- **Speaking and writing logic.** The module pages, practice flows,
  history pages and feedback generation are unchanged.
- **Auth changes.** No auth helper or session logic was modified.
- **Migrations.** None created. No new table, and no missing index was
  found for these queries.
- **A full badge collection page.** The dashboard shows a preview only.

## 9. Follow-up tickets

- **LIVE-01 - Live Class Promotion and CRM Handoff.** The live package
  work that this ticket deliberately leaves out.
- **Badge collection page.** A dedicated page for the full badge set,
  with the two badge slugs that still need their own artwork
  (`foundation-speaker`, `developing-communicator`, see
  `BADGE_SLUGS_NEEDING_ARTWORK`).
- **Reading and Listening modules.** Both remain Coming soon until their
  practice flows exist.
- **Module catalog status.** `celpip-writing` is seeded as `coming_soon`
  in migration 001 even though the module has shipped. The dashboard
  works around this by treating a module with a route as available.
  A later data fix should set the catalog status correctly so the
  workaround can be dropped.
