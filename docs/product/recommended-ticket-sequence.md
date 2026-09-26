# Recommended ticket sequence

Companion to `docs/product/celpip-ux-audit.md` (CELPIP-UX-00).

This document recommends the next 7 tickets, in order, with the reasoning
for each position. The order is derived from what the repository actually
contains as of commit 78fd054, not from a generic roadmap.

---

## The two facts that set the order

**Fact 1: the product works, the surface does not.** Speaking and writing
both run end to end - timed practice, recording or editor, AI evaluation,
result report, history, progress, badges. What is missing is a coherent
learner-facing surface. That means UI tickets come first, and they can
come first safely, because none of them needs to touch a pipeline.

**Fact 2: the AI endpoints have no limit of any kind.** Any authenticated
user can call `/api/speaking/feedback` and `/api/writing/evaluate` in a
loop. There is no rate limit, no attempt balance, and no cost record. The
`usage_events` table exists and has zero references in `src/`. This is an
uncapped bill on a live OpenAI account and it is the reason nothing can
launch until USAGE-01 and CELPIP-COST-01 ship.

Everything below follows from those two facts.

---

## Immediate next tickets

### 1. CELPIP-UX-01 - Design System Foundation

**Why first.** Every subsequent UI ticket writes components. Without a
system, each one invents its own card, button, and spacing, and the debt
compounds. The repository already proves this: the card shape
`rounded-3xl bg-white p-6 shadow-sm ring-1 ring-ink/5` is hand-copied
roughly 76 times, the primary button roughly as often, and
`AttemptStatusBadge` and `WritingAttemptStatusBadge` contain
byte-identical tone maps in two separate files. The conventions are
already there and already consistent - they just are not enforced by
anything. This ticket turns convention into code.

Doing it second, after the app shell, would mean rewriting the shell.

**Scope.**

- Extend `globals.css` tokens with the semantic roles that are missing:
  success, warning, danger, info, surface, border, muted, focus ring.
  Today those needs are met by raw Tailwind palette classes (8 red, 6
  amber, 3 emerald variants) that a brand change would silently miss.
- Named typography roles (`display`, `h1`, `h2`, `h3`, `body`, `body-sm`,
  `caption`, `eyebrow`) replacing ad-hoc `text-sm` / `text-xs` / `text-xl`.
- A 4-point spacing scale and a documented radius rule. Currently
  `rounded-3xl` (76), `rounded-2xl` (34), `rounded-xl` (14) mix with no
  rule, plus stray `lg`, `md`, and `sm` uses.
- Primitives: `<Card>`, `<Button>` (primary, secondary, ghost, danger,
  with real disabled, focus, and loading states), `<StatusPill>`,
  `<EmptyState>` (image, title, description, action), `<Skeleton>`,
  `<PageSection>`.
- Wire `<EmptyState>` to `emptyStateAssets`. This is the **first
  consumer of the asset registry**, which unblocks precondition 3 of
  CLEANUP-01.
- Repoint the five landing photos at `/assets/optimized/root/*.webp` via
  the registry. Roughly 15.8 MB of raw JPG becomes roughly 5.0 MB.
- Move the AI disclaimer from footer-only to adjacent to the score.
- An explicit written decision on dark mode. `globals.css` has no
  `prefers-color-scheme` block today; that should be a choice, not an
  omission.
- Add Open Graph and Twitter card images. `public/assets/social/` is
  empty and every shared link currently renders bare.

**Depends on.** Nothing.

**Do not.** Change any pipeline, prompt, schema, or route handler. Do not
delete the old hand-rolled classes in bulk; migrate screen by screen.

---

### 2. CELPIP-UX-02 - Responsive App Shell

**Why second.** This is the single worst structural gap in the app.
`AppHeader` contains a logo, the user's email, and a sign-out button.
**There are no navigation links at all, at any viewport width.** A learner
reading a writing feedback report can only reach the speaking module by
clicking the logo to return to `/dashboard` and then clicking a module
card. On mobile it is worse: the email is `hidden ... sm:inline`, so a
phone user cannot even confirm which account they are signed in as.

It comes before the dashboard redesign because the dashboard is a screen
inside the shell. Building the screen first means rebuilding it once the
shell changes around it.

**Scope.**

- Persistent primary navigation: Dashboard, Speaking, Writing, History,
  with an active-route indicator.
- A mobile pattern - bottom tab bar or drawer - and show the account
  identity at every width.
- Breadcrumbs on nested routes.
- Complete the boundary file coverage. Missing today: `loading.tsx` on
  `/dashboard/writing/attempts` and on all four detail segments;
  `not-found.tsx` on `/dashboard/writing/practice/[taskId]` and
  `/dashboard/writing/attempts/[attemptId]` (both of which call
  `notFound()` and therefore fall through to the unbranded default 404);
  `error.tsx` on the landing and auth routes.
- Convert `AttemptHistoryTable` and `WritingAttemptHistoryTable` to a card
  list below `sm:`. Table layouts at 375px either overflow or compress to
  unreadable widths.
- Introduce a `md:` and `lg:` tier. Breakpoint use today is almost
  entirely `sm:`, so tablets between 768px and 1024px get a layout tuned
  for desktop.
- Consider a `middleware.ts` matcher on `/dashboard/*`. The current
  per-layout and per-page `getUser()` checks are correct and deliberate -
  keep them - but middleware would make protection structural rather than
  conventional, so a future route added without its own check is not
  silently public.

**Depends on.** CELPIP-UX-01.

**Do not.** Remove the doubled `getUser()` calls. They look redundant and
are not: layouts do not re-render on client navigation.

---

### 3. CELPIP-UX-03 - Learner Dashboard Redesign

**Why third.** `/dashboard` is 67 lines that render a welcome paragraph
and a grid of module cards read from the `modules` table. It shows no
progress, no recent attempts, no badges, no next action, and no imagery.
It is the same screen on day 1 and day 30. It is the home screen of the
product and the weakest screen in the product.

Everything it needs already exists and is rendered one level deeper:
`SpeakingProgressSummary`, `LevelProgressCard`, `RecentAttemptsCard`,
`WritingProgressSummary`, `WritingLevelProgressCard`,
`WritingRecentAttemptsCard`. There is no cross-module view anywhere in the
app; a learner must visit two separate pages to assemble a picture of
their own progress.

This ticket is also what finally consumes the asset system. Two completed
tickets (ASSETS-01, ASSETS-02) produced a typed registry, a badge map, a
module map, 24 optimized WebP files, and 44 normalized badge and icon
files - and `grep -r "features/assets" src/` returns **zero matches**
outside the three files themselves. Badges currently render as a star
glyph while nine pieces of normalized badge artwork sit unused.

**Scope.**

- Combined speaking and writing progress above the fold.
- One primary next action, deep-linked, instead of a flat module list.
- Earned badges rendered with `getBadgeArtwork()` - `small` (512) for
  chips, `large` (1024) for award moments. Do not downscale 1024 into a
  chip; both sizes are already generated.
- `ModuleCard` wired to `getModuleAsset(module.slug)` for icon and
  illustration. The map already covers all five slugs including
  `live-classes`.
- Hero using `dashboardAssets.studyHero`.
- A real first-run empty state using `emptyStateAssets.noProgress`.
- A slot for the attempt balance, populated by USAGE-01.
- Give `live-classes` a real destination instead of a permanently disabled
  pill. `moduleRoutes` in `ModuleCard.tsx` hard-codes only speaking and
  writing, so reading, listening, and live classes render disabled
  regardless of their database status.

**Depends on.** CELPIP-UX-01, CELPIP-UX-02.

**Unblocks.** CLEANUP-01 preconditions 3 and 4.

**Note.** Before shipping badge artwork at 1024px, check the rebuilt
cutout edges. The normalization report flags all 13 badge and skill assets
for manual review - each source had a painted checkerboard background
rather than a real alpha channel, and up to 57 stray specks were dropped
per file. At 512px in a chip this will not be visible; in a full-size
award moment it might be.

---

### 4. USAGE-01 - Free Attempt Limit and Premium Access Rules

**Why fourth, and why this is the launch blocker.** Everything above is
polish. This is the ticket that decides whether the product can be exposed
to the public without an uncapped bill.

Current state, verified: `/api/speaking/feedback` and
`/api/writing/evaluate` both carry an explicit comment stating that no
usage events are created and no credits are deducted. `usage_events`
exists in migration 001 and has zero references in `src/`. Grep for "rate
limit" across `src/` returns nothing. `docs/product/pricing-and-attempt-model.md`
specifies a free tier of 1 scored attempt plus three paid tiers, all
planned, none implemented.

It comes after the UI tickets because a limit needs somewhere to be
displayed. Shipping enforcement before there is a dashboard slot, a
paywall surface, and a design-system pattern for the "limit reached" state
means shipping a 402 with nowhere to explain it.

**Scope.**

- Enforce the rule already specified in the pricing doc: an attempt is
  consumed **only after the result card is saved successfully**. Opening a
  task, running a timer, cancelling, a failed upload, and a failed AI
  response must never consume anything.
- Write `usage_events` rows server side, at the end of the pipeline, after
  the score is persisted.
- Show the remaining balance before the learner submits for feedback.
- An in-app pricing or plan surface. Today the only pricing anywhere is
  `ProgramOptionsSection` on the public landing page.
- Rate limiting on both AI endpoints. The existing duplicate guards
  prevent re-scoring the *same* finished attempt, but nothing prevents
  creating many attempts and scoring each once.
- Guard against a double-click creating two attempts.

**Schema notes from the audit, read before starting.**

- `usage_events` has a select-own RLS policy and **no insert policy**.
  Writes must go through the service role client, which is the correct
  pattern for server-side accounting anyway.
- `attempts.status` is unconstrained text, so new statuses need no
  migration.
- Both pipelines already return early when an attempt is `feedback_ready`
  or `writing_feedback_ready` with an existing score row. That early
  return is the correct place to skip decrementing on a retry.

**Depends on.** CELPIP-UX-03 for the display surface. Should ship together
with CELPIP-COST-01 - see the deviation note below.

**Do not.** Build payment processing in this ticket. Free-tier enforcement
and the plan model come first; checkout is a separate ticket.

---

### 5. LIVE-01 - Live Class Inquiry and Schedule Interest

**Why fifth.** This is the highest-value ticket per unit of effort in the
list, because most of it already exists. `live_class_interest` is in
migration 001 with columns for name, email, phone, interested module,
preferred schedule, and notes. The `live-classes` module row is seeded.
`dashboardAssets.liveClasses` points at a ready 97 KB WebP illustration,
and `MODULE_ASSET_MAP` already maps the slug. `LiveClassesSection` already
sells live classes on the landing page. What is missing is a form and a
route - roughly one ticket of work against a table that has been waiting
since the foundation migration.

It also captures revenue intent from learners who hit the free limit in
USAGE-01, which is why it directly follows it.

**Scope.**

- An inquiry route and form, reachable from the dashboard `live-classes`
  card and from the landing page.
- Server-side write to `live_class_interest`.
- Preferred schedule capture.
- Confirmation state.
- Terms and disclaimer copy, plus a real `/terms` page. Neither `/terms`
  nor `/privacy` exists anywhere in the repository today, and the AI score
  disclaimer currently lives only in the `DashboardShell` footer.

**Critical schema note.** `live_class_interest` has **RLS enabled with
zero policies**. No authenticated caller can read or write it. Either add
policies in a new migration or write through the service role client. Do
not discover this at implementation time.

**Security note.** If the form is public, it inherits the exposure already
present on `/api/early-access`: an unauthenticated route writing with the
service role key, with no rate limit, no CAPTCHA, and no duplicate-email
guard. Fix both routes together.

**Depends on.** CELPIP-UX-01, CELPIP-UX-03.

---

### 6. CELPIP-COST-01 - AI Usage Tracking

**Why sixth in the list, but see the deviation.** Three OpenAI call sites
exist: transcription in `transcription-client.ts`, speaking scoring in
`generate-speaking-feedback.ts`, and writing evaluation in
`generate-writing-feedback.ts`. None records tokens, latency, model, or
cost. There is no way to answer "what does one scored attempt cost" today,
which means the pricing tiers in the pricing doc are unvalidated guesses.

**Scope.**

- Record model, prompt tokens, completion tokens, latency, and outcome for
  every one of the three call sites.
- A cost-per-attempt figure to validate the $5 / $10 / $20 tiers.
- Alerting or a hard ceiling on daily spend.
- Track failure rates per pipeline stage. The statuses already exist -
  `transcription_failed`, `scoring_failed`, `writing_evaluation_failed` -
  but nothing aggregates them.

**Depends on.** Nothing technically. Deliberately sequenced with USAGE-01.

---

### 7. CLEANUP-01 - Safe Unused Asset and File Cleanup

**Why last.** Detailed reasoning is in
`docs/product/cleanup-candidates.md`. The short version: a naive
unused-file scan run today would flag the entire
`public/assets/optimized/` tree, the entire `public/assets/normalized/`
tree, all three files in `src/features/assets/`, and every source PNG -
that is 109 asset files minus `/favicon.png` and five landing JPGs, and it
would delete two completed tickets of work on the strength of a grep.

The four preconditions from the cleanup doc:

1. The audit is complete. Done, CELPIP-UX-00.
2. The design system is decided. CELPIP-UX-01.
3. Asset registry usage is confirmed. First satisfied by CELPIP-UX-01's
   `<EmptyState>`, fully satisfied by CELPIP-UX-03.
4. The dashboard redesign uses optimized assets. CELPIP-UX-03.

**Scope.** Ten ordered steps listed at the end of
`docs/product/cleanup-candidates.md`. Highest-confidence item:
`public/canada-city-hero.jpg`, 550 KB, referenced by nothing in `src/`.

**Do not.** Touch anything in the high-risk section, replace any logo, or
change the asset scripts beyond the single optimize skip rule.

---

## Deviation from the expected order

The ticket brief suggested CELPIP-COST-01 at position 6, after LIVE-01.
The audit recommends moving it **to run before or alongside USAGE-01**.

**Reason.** USAGE-01 has to set a free-tier size and validate three price
points. Doing that without cost data means guessing. The pricing doc
proposes $5 for 5 scored attempts, which prices a scored attempt at $1.00,
and $20/month for up to 40, which prices it at $0.50. A scored speaking
attempt runs a transcription call plus a scoring call. Nobody in this
repository currently knows what that costs, because nothing measures it.
Shipping enforcement against unvalidated numbers means either leaving
margin on the table or selling below cost.

The instrumentation half of CELPIP-COST-01 is small - three call sites,
each already returning a completion object that carries usage data. The
dashboards and alerting can follow later.

**Practical recommendation:** split it. Ship the instrumentation half
immediately before USAGE-01. Ship the reporting and alerting half after
LIVE-01, in the original slot. Everything else in the suggested order is
confirmed by what the repository shows.

One other change worth flagging: **password reset does not exist.** It is
not on the suggested list at all. A learner who forgets their password
today has no recovery path, and that is a launch blocker regardless of how
small the ticket is. Slot it wherever it fits, but do not launch without it.

---

## Later tickets

Deferred, with the reason each can wait.

| Ticket | Why it waits |
| --- | --- |
| **CELPIP-UX-04 - Practice Library and Learning Path** | Needs the dashboard to establish the navigation model first. Both task libraries already work. |
| **CELPIP-UX-05 - Speaking Experience Upgrade** | The mobile risks are real - iOS permission with no explainer, backgrounding suspends the stream, no `visibilitychange` handling, no upload resume - but the flow works on desktop today. Needs the design system. |
| **CELPIP-UX-06 - Writing Experience Upgrade** | Highest-value items are autosave and an unsaved-work guard. Losing a timed response to a refresh is the worst failure mode in the writing flow. Consider promoting this above UX-05 if mobile writing traffic dominates. |
| **CELPIP-GAME-01 - XP and Learning Levels** | Engagement layer on top of a dashboard that must exist first. |
| **CELPIP-GAME-02 - Streaks and Weekly Goals** | Same. Note that `badge-consistent-learner` and `badge-feedback-finisher` artwork is already generated and currently reachable only through the fallback - these two tickets give both a real home. |
| **Reading and listening modules** | Seeded `coming_soon` with no tasks and no routes. Substantial content work, not UI work. |
| **Account settings** | `profiles` is written by the auth trigger and read by nothing. No profile page exists. |
| **Payment checkout** | Follows USAGE-01. Enforcement and the plan model come first. |
| **Analytics** | None exists. Lower priority than cost tracking, which at least protects the bill. |

---

## Summary table

| # | Ticket | Blocks launch | Depends on | Main reason |
| --- | --- | --- | --- | --- |
| 1 | CELPIP-UX-01 Design System | Yes | - | 76 hand-copied cards, duplicated tone maps, no semantic color tokens |
| 2 | CELPIP-UX-02 App Shell | Yes | 1 | Header has zero navigation links at any width |
| 3 | CELPIP-UX-03 Dashboard | Yes | 1, 2 | 67-line stub; asset registry has zero importers |
| 4 | USAGE-01 Attempt Limits | Yes | 3 | AI endpoints are completely uncapped |
| 5 | LIVE-01 Live Class Inquiry | Yes | 1, 3 | Table waiting since migration 001; no terms page |
| 6 | CELPIP-COST-01 Cost Tracking | Yes | - | Pricing tiers are unvalidated guesses |
| 7 | CLEANUP-01 Cleanup | No | 1, 3 | Must run last so real usage is observable |

Recommended execution: 1, 2, 3, then the instrumentation half of 6, then
4, then 5, then the rest of 6, then 7. Add password reset anywhere before
launch.
