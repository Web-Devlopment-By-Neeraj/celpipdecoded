# CELPIP-UX-00 - Existing Product Audit

Toronto Academy of Education CELPIP Preparation Program

Audit date: 2026-07-28
Branch audited: feat/celpip-ux-00-product-audit
Last commit audited: 78fd054 feat: normalize badge and skill icon assets (#20)

This is a documentation-only audit. No app source file, asset, migration,
or dependency was changed while producing it.

---

## 1. Executive summary

The product is further along than a typical pre-launch codebase. Two full
practice modules (speaking and writing) work end to end: task library,
timed practice, submission, AI evaluation, result report, attempt history,
progress summary, and level badges. Auth, RLS, private audio storage, and
server-only AI calls are all in place and follow a consistent pattern.

The gap is not capability. The gap is the learner-facing surface and the
commercial layer.

Five findings drive every recommendation below.

**Finding 1: the dashboard is a stub.** `/dashboard` renders a welcome
paragraph and a grid of five module cards read from the `modules` table.
It shows no progress, no recent attempts, no badges, no next action, and
no imagery. Everything a learner earned lives one or two clicks deeper on
`/dashboard/speaking` and `/dashboard/writing`. The home screen of the
product is the weakest screen in the product.

**Finding 2: the asset system is fully built and completely unused.**
`src/features/assets/asset-registry.ts`, `badge-asset-map.ts`, and
`module-asset-map.ts` have zero importers anywhere in `src/`. Grep for
`features/assets` returns no matches outside the three files themselves.
109 files sit in `public/`, roughly 118 MB of source PNG and JPG, with
optimized WebP and normalized square copies already generated. The app
currently ships `/favicon.png` in two headers and five raw root JPGs on
the landing page. Badges render as a star glyph. Empty states render as
text. Two completed asset tickets produced infrastructure that no screen
consumes yet.

**Finding 3: there is no usage limit, no attempt balance, and no cost
ceiling.** `docs/product/pricing-and-attempt-model.md` specifies a free
tier of one scored attempt and three paid tiers. None of it exists. Both
`/api/speaking/feedback` and `/api/writing/evaluate` explicitly document
that they create no usage events and deduct no credits. The
`usage_events` table exists in migration 001 and has zero references in
`src/`. Any authenticated user can call the AI endpoints without limit.
This is the single largest launch blocker.

**Finding 4: design is consistent by convention, not by system.** The
same card shape (`rounded-3xl bg-white p-6 shadow-sm ring-1 ring-ink/5`)
and the same button shape are hand-copied across roughly 120 components.
Nothing enforces it. Four semantic status tones are duplicated verbatim in
two separate files. There are no shared UI primitives outside
`src/components/landing/primitives.tsx`, which the app screens do not use.

**Finding 5: launch-critical plumbing is missing.** No middleware, no rate
limiting, no live class inquiry flow despite a `live_class_interest` table
existing, no pricing surface for signed-in users, and no terms page.

Recommended immediate order: design system, then app shell, then dashboard
redesign, then usage limits. Cleanup runs last, after the dashboard proves
which assets the UI actually consumes.

---

## 2. Current architecture summary

| Layer | Choice |
| --- | --- |
| Framework | Next.js 16.2.9, App Router, React 19.2.4 |
| Styling | Tailwind CSS v4 via `@tailwindcss/postcss`, tokens in `src/app/globals.css` |
| Fonts | Geist Sans, Geist Mono, Fraunces (serif display), all via `next/font/google` |
| Backend | Supabase (hosted), Postgres with RLS on every table |
| Auth | Supabase Auth, cookie sessions via `@supabase/ssr` |
| Storage | Private `attempt-audio` bucket, signed URLs only |
| AI | OpenAI SDK v6, server-only, transcription plus two scoring models |
| Validation | zod v4 on every API body and every AI response |
| Image tooling | sharp, dev dependency, used only by the two scripts |
| Deployment | Vercel |

`next.config.ts` is empty. No `middleware.ts` exists anywhere in the
repository.

### Supabase client split

Three clients with a clear separation of duties:

- `src/lib/supabase/client.ts` - browser client, anon key, RLS applies.
- `src/lib/supabase/server.ts` - server component and route handler
  client, reads the caller's session cookies, RLS applies.
- `src/lib/supabase/admin.ts` - service role client, cached module
  singleton, `persistSession: false`. Documented as server-only.

### Directory conventions

- `src/app/` - routes only, thin. Pages fetch data and compose components.
- `src/components/<area>/` - presentational and interactive components,
  named per area (`app`, `auth`, `landing`, `speaking`, `writing`).
- `src/features/<area>/` - pure logic, copy constants, schemas, and
  server pipelines. Copy strings live in `task-copy.ts` and
  `practice-flow.ts` rather than inline in JSX.

This split is clean and worth preserving through the redesign.

---

## 3. Completed features

Working end to end and not to be rebuilt:

1. **Landing page** - seven sections, early access lead capture posting to
   `/api/early-access`.
2. **Auth** - email and password signup, login, email confirmation
   callback with an open-redirect guard, sign out, auto profile creation
   via a Postgres trigger.
3. **Speaking task library** - 8 CELPIP speaking task types seeded, task
   detail panel with prep and speaking timing.
4. **Speaking timed practice** - prep phase, speaking phase, timers,
   MediaRecorder capture with per-browser mime negotiation.
5. **Speaking upload** - attempt row created first, audio uploaded to the
   user's own storage folder, status advanced to `uploaded`.
6. **Speaking transcription** - server-side, OpenAI transcription model,
   own status lifecycle.
7. **Speaking AI feedback** - four sub-scores, estimated level, strengths,
   improvements, next steps, saved to `attempt_scores`, badge awarded.
8. **Speaking result page, history, progress summary, level badges.**
9. **Writing task library** - 10 original prompts across the two CELPIP
   writing task types, seeded in migration 008.
10. **Writing timed editor** - live word count, timer, minimum word guard.
11. **Writing submission** - server recomputes the word count, verifies
    the task is active and belongs to the writing module.
12. **Writing AI evaluation, result page, history, progress, badges.**
13. **Asset optimization pipeline** - `npm run assets:audit`,
    `assets:optimize`, `assets:normalize-badges`, plus two generated
    reports.
14. **Asset registry and maps** - typed, commented, with documented
    fallbacks.

### Partially completed features

| Feature | State |
| --- | --- |
| Dashboard | Renders modules only. No learner data, no assets. |
| Asset system | Fully generated, zero UI consumers. |
| Badges | Awarded and stored correctly, rendered as a star glyph. |
| Reading module | Seeded as `coming_soon`. No tasks, no routes. |
| Listening module | Seeded as `coming_soon`. No tasks, no routes. |
| Live classes | Module row and `live_class_interest` table exist. No route, no form, no code reference. |
| Usage events | Table exists. Zero code references. |
| Pricing | Documented in full. Zero implementation. |
| Empty states | Text-only. Five empty-state illustrations generated and unused. |

---

## 4. Route inventory

### Public routes

| Route | File | Notes |
| --- | --- | --- |
| `/` | `src/app/page.tsx` | Landing. Server component, composes 9 landing components. |

### Auth routes

| Route | File | Notes |
| --- | --- | --- |
| `/login` | `src/app/(auth)/login/page.tsx` | Renders `LoginForm`. No shared layout in the `(auth)` group. |
| `/signup` | `src/app/(auth)/signup/page.tsx` | Renders `SignupForm`. |
| `/auth/callback` | `src/app/auth/callback/route.ts` | GET. Exchanges the code for a session. `next` param is accepted only when it starts with `/`. |

### Dashboard routes

All under `src/app/dashboard/`, all protected by `layout.tsx` calling
`supabase.auth.getUser()` and redirecting to `/login`. Every page repeats
the check close to its own data, because layouts do not re-render on
client navigation. This is deliberate and correct.

| Route | Purpose |
| --- | --- |
| `/dashboard` | Module grid. |
| `/dashboard/speaking` | Hero, progress summary, level card, recent attempts, task grid. |
| `/dashboard/speaking/tasks/[taskId]` | Task detail and timing before starting. |
| `/dashboard/speaking/practice/[taskId]` | Timed practice, recording, upload, submit. |
| `/dashboard/speaking/attempts` | Full attempt history table. |
| `/dashboard/speaking/attempts/[attemptId]` | Feedback report. |
| `/dashboard/writing` | Hero, writing progress, level card, recent attempts, task grid. |
| `/dashboard/writing/tasks/[taskId]` | Task detail and timing. |
| `/dashboard/writing/practice/[taskId]` | Timed editor and submit. |
| `/dashboard/writing/attempts` | Writing attempt history table. |
| `/dashboard/writing/attempts/[attemptId]` | Writing feedback report. |

### API routes

All `runtime = "nodejs"`. All POST unless noted.

| Route | Auth | Client used | Notes |
| --- | --- | --- | --- |
| `/api/early-access` | None (public form) | Service role | Only route where an unauthenticated caller reaches the service role client. |
| `/api/speaking/transcribe` | Session cookie | Service role inside the pipeline | Ownership checked before any audio is downloaded. |
| `/api/speaking/feedback` | Session cookie | Service role inside the pipeline | Transcribes first if no transcript exists, then scores. |
| `/api/writing/attempts` | Session cookie | Caller session client | Insert runs under RLS, so the row can only be created for the caller. |
| `/api/writing/evaluate` | Session cookie | Service role inside the pipeline | Ownership and module both verified. |

### Boundary file coverage

| Segment | error.tsx | loading.tsx | not-found.tsx |
| --- | --- | --- | --- |
| `/dashboard` | yes | yes | - |
| `/dashboard/speaking` | yes | yes | - |
| `/dashboard/speaking/tasks/[taskId]` | - | - | yes |
| `/dashboard/speaking/practice/[taskId]` | - | - | yes |
| `/dashboard/speaking/attempts` | - | yes | - |
| `/dashboard/speaking/attempts/[attemptId]` | - | no | yes |
| `/dashboard/writing` | yes | yes | - |
| `/dashboard/writing/tasks/[taskId]` | - | - | yes |
| `/dashboard/writing/practice/[taskId]` | - | - | no |
| `/dashboard/writing/attempts` | - | no | - |
| `/dashboard/writing/attempts/[attemptId]` | - | no | no |
| `/` and `(auth)` | no | no | no |

Speaking has better boundary coverage than writing. Writing calls
`notFound()` in three pages but ships no `not-found.tsx` for two of the
segments that call it, so those fall through to the default Next.js 404
instead of a branded one. This is a gap for CELPIP-UX-02, not a bug.

---

## 5. Speaking flow audit

### Task library

`/dashboard/speaking` queries `tasks` joined to `modules` with
`modules!inner(slug)` filtered to `celpip-speaking` and `status = active`,
ordered by `sort_order`, embedding `speaking_task_details`. Three queries
run in parallel via `Promise.all`: tasks, attempt history, badge count.
`SpeakingTaskGrid` renders the 8 task types.

### Practice route

`/dashboard/speaking/practice/[taskId]`. `params` is awaited (correct for
this Next.js version). The task id is validated as a UUID before the query
so a malformed URL becomes a 404 rather than a database error. Only safe
task fields cross into `TimedPracticeShell`, the client component that
owns the phase machine.

### Recording flow

`useAudioRecorder` owns the `MediaRecorder` lifecycle. Strong points:

- `start()` resolves `true` only once the microphone is live, so the
  speaking timer cannot start before capture actually begins.
- Callback refs prevent stale handler closures.
- The unmount effect stops the recorder and releases every media track.
- `pickRecordingMimeType()` negotiates `audio/webm;codecs=opus`, then
  `audio/webm`, then `audio/mp4` for Safari.

### Upload flow

`submitRecording` in `src/features/speaking/recording-upload.ts` runs
entirely on the browser client, so RLS and storage policies enforce
access. Three steps: insert the attempt as `created`, upload to
`{userId}/...` in the private bucket, update to `uploaded` with duration
and path. A failed upload marks the attempt `failed_upload` rather than
leaving it dangling. The storage policies in migration 004 require the
first path segment to equal `auth.uid()`.

### Transcription and AI feedback flow

`generateSpeakingFeedback` is the pipeline. Order of operations:

1. Fetch the attempt with its task and timing embedded, verify
   `attempt.user_id === input.userId`, return 403 if not.
2. Return early with the existing result path if the attempt is already
   `feedback_ready` and a score row exists. This is real duplicate-charge
   protection at the AI-call level.
3. Transcribe if no transcript exists.
4. Score with `OPENAI_SCORING_MODEL`, `response_format: json_object`,
   parsed through `scoringResponseSchema`.
5. Override the model's chosen badge with `getBadgeForLevel()`, so the
   level-to-badge mapping is enforced server side.
6. Update the existing `attempt_scores` row if there is one, otherwise
   insert, so each attempt keeps exactly one score row.
7. Mark `feedback_ready`, then award the badge with
   `onConflict: "user_id,badge_id", ignoreDuplicates: true`.

Status lifecycle: `created`, `failed_upload`, `uploaded`, `transcribing`,
`transcribed`, `transcription_failed`, `scoring`, `scoring_failed`,
`feedback_ready`. `attempts.status` is plain text, so new statuses need no
migration. That is convenient and also means nothing constrains the value.

### Result page

`/dashboard/speaking/attempts/[attemptId]` composes `ResultSummaryCard`
(estimated level in a circle, badge label, level label, summary),
`SkillScoreGrid` (four sub-scores), `FeedbackSection` (strengths,
improvements, next steps), `TranscriptCard`, `AudioPlaybackCard`,
`BadgeDisplayCard`, and `NextPracticeActions`.

### History and progress

`/dashboard/speaking/attempts` renders `AttemptHistoryTable`. The module
page shows `SpeakingProgressSummary` and `LevelProgressCard`. Migration
007 added `attempts (user_id, created_at)` and
`user_badges (user_id, earned_at)` indexes for these queries.

### Mobile usability risks

1. **Microphone permission on iOS Safari.** Capture requires a secure
   context and a user gesture. There is no explicit pre-permission
   explainer screen, so a first-time mobile user meets the browser dialog
   with no context.
2. **Backgrounding kills the recording.** If a learner switches apps or
   locks the phone mid-answer, iOS suspends the media stream. Nothing
   detects `visibilitychange` and nothing warns the learner.
3. **No `audio/mp4` verification path.** Safari records mp4. The code
   handles it, but nothing in the repo records that it has been tested on
   a real device.
4. **Timer plus recorder plus prompt in one viewport.** On a 375px screen
   the practice shell has to fit prompt text, phase card, timer, and
   controls. Worth an explicit narrow-viewport pass in CELPIP-UX-05.
5. **No connection loss handling during upload.** A dropped connection
   mid-upload marks the attempt `failed_upload` with no resume path.

No change was made to any of this.

---

## 6. Writing flow audit

### Task library

`/dashboard/writing` mirrors the speaking page structure, filtered to
`celpip-writing`, embedding `writing_task_details` (task number, time,
word min and max, evaluation focus). Migration 008 replaced the
`(module_id, task_type)` unique constraint with
`(module_id, task_type, sort_order)` so a task type can hold several
prompts. 10 prompts are seeded.

### Timed editor

`TimedWritingShell` plus `WritingEditor`, `WritingTimer`, `WordCountCard`.
The timer default is `DEFAULT_WRITING_TIME_SECONDS`, overridden per task
by `writing_task_details.time_seconds`.

### Submission flow

`POST /api/writing/attempts`. Notable properties:

- The body is zod-validated: `taskId` UUID, `responseText` 1 to 50000
  chars, non-negative integer counts.
- The server **recomputes** the word count with `countWords()` and ignores
  the client value, so the stored count always matches the stored text.
- `MIN_SUBMIT_WORD_COUNT` is enforced server side, returning 422.
- `timeSpentSeconds` is clamped to 86400, so a stuck client clock cannot
  write an absurd value.
- The task must exist, be `active`, and belong to `celpip-writing`.
- The insert uses the caller's session client, so RLS is the final guard.

This route is the strongest input-validation example in the codebase and
is a good template for the usage-limit ticket.

### AI feedback flow

`generateWritingFeedback` follows the speaking pipeline shape:
`EVALUABLE_STATUSES = ["writing_submitted", "writing_evaluation_failed"]`
gates entry, `writing_feedback_ready` with an existing score row returns
early, the response is zod-validated, the badge comes from
`getWritingBadgeForLevel`, and the score row is updated in place if one
exists.

Writing scores reuse `attempt_scores`. Migration 010 added
`writing_feedback jsonb`, `writing_overall_summary`, and
`writing_suggested_structure`. Migration 009 added `response_text`,
`word_count`, `time_spent_seconds`, `writing_submitted_at` to `attempts`.
No separate writing tables. Reusing the two attempt tables for both
modules keeps history and progress queries uniform, and is the right call
to preserve.

Writing statuses: `writing_submitted`, `writing_evaluating`,
`writing_feedback_ready`, `writing_evaluation_failed`.

### Result page and history

`/dashboard/writing/attempts/[attemptId]` composes
`WritingResultSummaryCard`, `WritingSkillScoreGrid`,
`WritingFeedbackSection`, `WritingResponseReferenceCard`,
`WritingBadgeDisplayCard`, `WritingNextPracticeActions`.
`/dashboard/writing/attempts` renders `WritingAttemptHistoryTable`.

### Mobile usability risks

1. **Long-form typing on a phone.** A 150 to 200 word CELPIP response on a
   mobile keyboard is genuinely hard. The editor has no autosave and no
   draft recovery. Losing a session loses the text.
2. **The virtual keyboard covers the timer and word count.** On iOS the
   keyboard takes roughly half the viewport. Nothing pins the timer or
   the count to a visible position.
3. **No unsaved-work guard.** Navigating away or refreshing during a timed
   session discards the response with no confirmation.
4. **No paste or autocorrect policy.** Worth a product decision, not a
   code change.

Item 1 and item 3 together are the highest-value writing UX fix and belong
in CELPIP-UX-06.

---

## 7. Dashboard audit

### What it currently shows

`src/app/dashboard/page.tsx` is 67 lines and produces exactly two things:

1. A white card with "Welcome to your CELPIP practice dashboard" and one
   sentence of body copy.
2. A responsive grid (1 / 2 / 3 columns) of `ModuleCard`, one per row in
   `modules`, ordered by `sort_order`.

`ModuleCard` shows the title, a status pill reading "Active" or "Coming
soon", the description, and either an "Open module" link or a disabled
"Coming soon" span. `moduleRoutes` hard-codes only `celpip-speaking` and
`celpip-writing`, so reading, listening, and live classes always render as
disabled previews regardless of their database status.

### Does it feel learner-focused or admin-like?

Admin-like, and closer to a catalog than a dashboard. It answers "what
modules exist" rather than "how am I doing and what should I do next". It
is the same screen on day 1 and on day 30. Nothing on it changes as a
learner practices.

### Are speaking and writing progress visible?

No. Not at all. Every progress element already exists and is rendered one
level deeper:

- `SpeakingProgressSummary`, `LevelProgressCard`, `RecentAttemptsCard`
  on `/dashboard/speaking`.
- `WritingProgressSummary`, `WritingLevelProgressCard`,
  `WritingRecentAttemptsCard` on `/dashboard/writing`.

A learner has to visit two separate module pages to assemble a picture of
their own progress. There is no cross-module view anywhere in the app.

### Are assets being used?

No. The dashboard imports no images. The only image on any signed-in
screen is `/favicon.png` at 32x32 in `AppHeader`. Meanwhile
`dashboardAssets` in the registry already points at four ready WebP
illustrations (`studyHero`, `practiceJourney`, `progressOverview`,
`liveClasses`) sized for exactly this screen, and `MODULE_ASSET_MAP`
already maps all five module slugs, including `live-classes`, to a skill
icon plus an illustration. The mapping is finished. Nothing calls it.

### What should improve

1. Surface combined speaking and writing progress above the fold.
2. Give a single primary next action ("Continue practicing", deep-linked
   to the most useful task) instead of a flat module list.
3. Show earned badges with real artwork via `getBadgeArtwork()`.
4. Wire `ModuleCard` to `getModuleAsset(module.slug)` for the icon and
   illustration.
5. Show the remaining free or paid attempt balance once USAGE-01 lands.
6. Replace the static welcome card with a hero using
   `dashboardAssets.studyHero`.
7. Give `live-classes` a real destination instead of a permanent disabled
   pill.
8. Add a real empty state for a brand new user, using
   `emptyStateAssets.noProgress`.

---

## 8. AI feedback audit

### Speaking feedback structure

Validated by `scoringResponseSchema` and persisted to `attempt_scores`:

| Field | Column |
| --- | --- |
| Estimated level | `estimated_level` numeric |
| Level label | `level_label` text |
| Badge slug | `badge_slug` text, server-enforced |
| Content and coherence | `content_coherence_score` |
| Vocabulary | `vocabulary_score` |
| Listenability | `listenability_score` |
| Task fulfillment | `task_fulfillment_score` |
| Strengths, improvements, next steps | three jsonb arrays |
| Full model output | `raw_ai_response` jsonb |

Storing `raw_ai_response` means a future report redesign can render richer
detail from data already captured, without re-running any AI call.

### Writing feedback structure

Same table, plus `writing_feedback jsonb`, `writing_overall_summary`, and
`writing_suggested_structure` from migration 010.

### OpenAI usage locations

Exactly three, all server-only:

| File | Model env var | Default |
| --- | --- | --- |
| `src/features/speaking/transcription-client.ts` | `OPENAI_TRANSCRIPTION_MODEL` | `gpt-4o-mini-transcribe` |
| `src/features/speaking/generate-speaking-feedback.ts` | `OPENAI_SCORING_MODEL` | `gpt-5.4-mini` |
| `src/features/writing/generate-writing-feedback.ts` | `OPENAI_WRITING_MODEL` | `gpt-5.4-mini` |

Prompts are isolated in `scoring-prompt.ts` and `writing-scoring-prompt.ts`
and were not read for content or modified.

### Server-side safety

Good. Every one of the following holds:

- `OPENAI_API_KEY` is read only from `process.env` inside server modules.
  It is never `NEXT_PUBLIC_` prefixed and never reaches a client component.
- Both pipelines carry an explicit header comment warning against client
  import.
- Ownership is verified before any paid work starts.
- Every model response passes through zod before it touches the database.
- The badge is decided by server code, not by the model.
- Failure paths write a `*_failed` status and return a typed result rather
  than throwing to the client.
- A missing API key returns a clean 503 with a configured-message, not a
  stack trace.

### Result-card presentation

Consistent between modules: a summary card with the level in a circle, a
sub-score grid, and a feedback section. Presentation is competent but
plain. The report is the moment a learner decides whether the product is
worth paying for, and today it is four numbers and three bullet lists on
white cards, with a star glyph where the badge artwork belongs.

### Estimated-score disclaimers

The disclaimer is present but weakly placed. `DashboardShell`'s footer
carries "Practice estimates and AI feedback are for preparation only and
are not official CELPIP scores." That is at the very bottom of every
signed-in page. `resultCopy` carries a disclaimer on the result page
itself, which is better. For launch the disclaimer should sit adjacent to
the score number, not only in the page footer.

### Opportunities for clearer structured reports

Documented for later tickets, not acted on:

1. Show each sub-score against the CELPIP band it maps to, not as a bare
   number.
2. Chart level progression over attempts using data already in
   `attempt_scores`.
3. Show the transcript with the specific improvement points anchored to
   it.
4. Render the badge artwork in the award moment.
5. Add a "compare with your last attempt on this task" panel.
6. Surface `writing_suggested_structure` as a visual outline.

Prompts must not be changed to achieve any of this. All six can be built
from `raw_ai_response` as already stored.

---

## 9. Supabase schema audit

Eight migrations, numbered 001 to 010 with **005 and 006 absent**. Every
migration is written to be safely re-runnable (`if not exists`,
`on conflict do nothing`, `drop policy if exists` before create).

### Table support

| Table | Exists | Migration | Used in code |
| --- | --- | --- | --- |
| `profiles` | yes | 001, trigger in 002 | Created by trigger. Not read by any page yet. |
| `modules` | yes | 001 | Dashboard module grid, module slug filters. |
| `tasks` | yes | 001, altered in 008 | Both task libraries. |
| `speaking_task_details` | yes | 001 | Speaking timing. |
| `writing_task_details` | yes | 008 | Writing timing and word bounds. |
| `attempts` | yes | 001, 009 | Both modules, shared table. |
| `attempt_scores` | yes | 001, 008 policy repair, 010 | Both modules, shared table. |
| `badges` | yes | 001, 5 seeded | Badge lookup and award. |
| `user_badges` | yes | 001 | Award and count. |
| `usage_events` | yes | 001 | **Zero references in src/.** |
| `live_class_interest` | yes | 001 | **Zero references in src/.** |
| `early_access_leads` | yes | 001 | `/api/early-access`. |
| Asset tables | none | - | Assets are filesystem-only, by design. |

### RLS

RLS is enabled on all eleven tables. Policy shape:

- `profiles` - select, insert, update, all scoped to `auth.uid() = id`.
- `modules`, `badges` - select for `authenticated`.
- `tasks`, `speaking_task_details`, `writing_task_details` - select only
  where the task is `active`.
- `attempts` - select, insert, update own rows only.
- `attempt_scores` - select where the parent attempt belongs to the caller.
- `user_badges`, `usage_events` - select own rows only.

Migration 008 re-creates the `attempt_scores` select policy with fully
qualified table names, repairing an earlier version that relied on
ambiguous aliases. Good hygiene.

### Storage

Private `attempt-audio` bucket. Migration 004 adds insert, select, update,
and delete policies that all require
`(storage.foldername(name))[1] = auth.uid()::text`. Audio is served by
signed URL only.

### Observations, no action taken

1. **`usage_events` has select-own but no insert policy.** When USAGE-01
   writes usage rows it must do so through the service role client, which
   is the correct pattern anyway. Worth knowing before that ticket starts.
2. **`live_class_interest` has RLS enabled and no policies at all.** No
   authenticated caller can read or write it. Only the service role can.
   LIVE-01 must account for this.
3. **`attempts.status` and `tasks.status` are unconstrained text.** Eleven
   speaking statuses and four writing statuses are enforced only by
   convention in TypeScript. A check constraint would be safer, but adding
   one is a migration and out of scope here.
4. **Numbering gap at 005 and 006.** Cosmetic. Do not renumber existing
   migrations; hosted Supabase has already applied them.
5. **No `updated_at` on `attempts` or `attempt_scores`.** Only `profiles`
   has the `set_updated_at` trigger.

No migration was created. No schema was changed.

---

## 10. Asset system audit

### Inventory

109 files under `public/`. Per `docs/product/asset-inventory.md`: 36
source assets scanned, 29 with optimized WebP copies, 118.55 MB of
originals reducing to 8.05 MB when WebP is served, a 93 percent saving
that the app is currently **not** collecting because no screen references
an optimized path.

Directory roles:

| Directory | Role | Files |
| --- | --- | --- |
| `public/` root | Legacy landing images | 9 |
| `public/assets/badges/` | Source PNG, 2816x1536 landscape sheets | 9 |
| `public/assets/skills/` | Source PNG, same shape | 4 |
| `public/assets/illustrations/` | Source dashboard art | 4 |
| `public/assets/empty-states/` | Source empty-state art | 5 |
| `public/assets/branding/` | Logos and icons | 5 |
| `public/assets/optimized/` | Generated WebP, mirrors source tree | 24 |
| `public/assets/normalized/` | Generated square badges and icons | 44 |
| `public/assets/scenarios/` | **Empty** | 0 |
| `public/assets/social/` | **Empty** | 0 |
| `public/assets/ui-icons/` | **Empty** | 0 |
| `public/reference/` | **Empty** | 0 |

### Which optimized WebP files should be used in future UI

Use these. They are generated, correctly sized, and already named in the
registry.

**Dashboard illustrations** (via `dashboardAssets`):

| Key | Path | Size |
| --- | --- | --- |
| `studyHero` | `/assets/optimized/illustrations/dashboard-study-hero.webp` | 145 KB |
| `practiceJourney` | `/assets/optimized/illustrations/dashboard-practice-journey.webp` | 147 KB |
| `progressOverview` | `/assets/optimized/illustrations/dashboard-progress-overview.webp` | 89 KB |
| `liveClasses` | `/assets/optimized/illustrations/dashboard-live-classes.webp` | 97 KB |

**Empty states** (via `emptyStateAssets`): `empty-no-badges.webp` 97 KB,
`empty-no-feedback.webp` 206 KB, `empty-no-progress.webp` 104 KB,
`empty-speaking-history.webp` 188 KB, `empty-writing-history.webp` 153 KB.

**Skill icons** - use the **normalized** 512 WebP, not
`/assets/optimized/skills/`. The optimized skills WebP files are still
landscape 2816x1536 with a painted checkerboard background and are not
usable in a tile. `skillAssets` correctly points at
`/assets/normalized/skills/skill-*-512.webp`, 20 to 24 KB each.

**Badges** - use the normalized set. `badgeAssets` gives 1024 WebP (53 to
87 KB) for award moments and detail; `badgeAssetsSmall` gives 512 WebP (26
to 41 KB) for chips and list rows. Pick the size that matches the render
box rather than downscaling 1024 into a chip.

**Branding** - `poweredBy` at
`/assets/optimized/branding/georgo-powered-by.webp`, 58 KB.

Rule for the design-system ticket: **never hard-code an asset path in a
component.** Import from `@/features/assets/asset-registry` or resolve
through `getModuleAsset()` / `getBadgeArtwork()`.

### Which PNG files should stay as source or fallback

Keep all of these. None is a cleanup candidate.

1. **All 9 badge source PNGs** in `public/assets/badges/` and **all 4
   skill source PNGs** in `public/assets/skills/`. They are the inputs to
   `npm run assets:normalize-badges`. Deleting them makes the normalized
   set unreproducible.
2. **All source PNG and JPG** in `illustrations/` and `empty-states/`.
   Inputs to `npm run assets:optimize`.
3. **The 44 normalized PNG twins.** `skillAssetsPng` and `badgeAssetsPng`
   exist for any surface where WebP is not an option: email, PDF export,
   Open Graph images, or an old in-app webview. Keep them.
4. **`/favicon.png` and `/assets/branding/tae-favicon.png`.** The audit
   script treats icons as protected and never converts them. Browsers and
   `src/app/icon.png` need raster.
5. **`/assets/branding/georgo-powered-by.png`.** Registered as
   `poweredByOriginal`, the deliberate fallback for the WebP.

### Which root public images should move later

Six files are referenced directly from landing components and cannot move
until those imports change. Move them in CLEANUP-01, not before.

| File | Referenced by | Optimized twin exists |
| --- | --- | --- |
| `/taelogo.jpg` | `LandingHeader`, `Footer` | no |
| `/georgo.png` | `Footer` | `/assets/optimized/root/georgo.webp` |
| `/img1.jpg` | `CollegeMomentsSection` | yes, 1.66 MB |
| `/img2.jpg` | `CollegeMomentsSection`, `ProgramHeroSection` | yes, 439 KB |
| `/img3.jpg` | `CollegeMomentsSection`, `ProgramHeroSection` | yes, 1.12 MB |
| `/img4.jpg` | `CollegeMomentsSection` | yes, 1.01 MB |
| `/onlineclass.jpg` | `LiveClassesSection` | yes, 783 KB |
| `/favicon.png` | `AppHeader`, `/login`, `/signup` | protected |
| `/canada-city-hero.jpg` | **nothing** | no |

`canada-city-hero.jpg` (550 KB) is the only root image with no reference
anywhere in `src/`. It is the clearest single cleanup candidate in the
repository.

The landing page currently serves roughly 15.8 MB of raw JPG across five
photos where the WebP twins total roughly 5.0 MB. Switching those five
references alone is the largest single performance win available, and
belongs in CELPIP-UX-01 or CELPIP-UX-02.

### Which logos need better SVG or transparent PNG versions

Flagged by the audit script and confirmed here. All four need new artwork
from a designer; none can be fixed by a script.

| Asset | Problem | Needed |
| --- | --- | --- |
| `/taelogo.jpg` 1024x768 | JPG, so no transparency, plus baked-in white background and JPG artifacts on the wordmark edges | SVG, or transparent PNG at 2x |
| `/assets/branding/tae-logo-horizontal.jpg` 1024x768 | Same, and the file is 4:3 despite being a horizontal lockup, so it carries large empty margins | SVG horizontal lockup |
| `/assets/branding/tae-logo-primary.jpg` 492x166 | JPG, and 492px is too small for a retina header | SVG, or transparent PNG at 1600px+ |
| `/assets/branding/logo_final_Tslogan.png` 250x250 | PNG but only 250x250 and 8 KB, too small for any hero use | SVG, or transparent PNG at 1024px+ |

Until then, the app should keep using `/favicon.png` for the header mark,
which is what `AppHeader` already does.

### Which missing asset mappings need future artwork

Recorded in code as explicit fallbacks. Each needs a commissioned piece.

**Badges** (`BADGE_SLUGS_NEEDING_ARTWORK` in `badge-asset-map.ts`):

| Slug | Currently borrows | Needed |
| --- | --- | --- |
| `foundation-speaker` | `firstSpeaking` artwork | Own foundation badge |
| `developing-communicator` | `speakingImprover` artwork | Own developing badge |

`confident-speaker` maps to the `confidentCommunicator` artwork. The slug
and the artwork name differ but the meaning matches, so this is a naming
mismatch and not a missing asset. **Do not rename the slug** - it is
seeded in migration 001 and read by `level-badges.ts`.

Three badge images exist with no slug pointing at them:
`badge-consistent-learner` (used as `FALLBACK_BADGE_ARTWORK`),
`badge-feedback-finisher`, `badge-first-writing`, and
`badge-writing-improver` are only reachable through the writing level
ladder or the fallback. When CELPIP-GAME-01 and GAME-02 add streaks and
XP, `feedback-finisher` and `consistent-learner` become the natural
rewards, and the artwork is already there.

**Modules** (`module-asset-map.ts`):

| Slug | Gap |
| --- | --- |
| `celpip-reading` | No reading illustration. Uses the neutral `progressOverview`. |
| `celpip-listening` | No listening illustration. Same fallback. |
| `live-classes` | No live-classes **icon**. Borrows the speaking icon. The illustration is real. |

**Whole categories with no artwork at all:** `assets/scenarios/`,
`assets/social/`, `assets/ui-icons/` are empty directories. `social/`
matters first - there is no Open Graph or Twitter card image anywhere in
the repo, so every shared link renders bare.

### Normalization caveat carried forward

The normalization report flags all 13 badge and skill assets for manual
review: each source had a painted checkerboard background rather than a
real alpha channel, the alpha was rebuilt, and stray specks (up to 57 on
`badge-advanced-communicator`) were dropped as likely generator watermark
fragments. Before any badge ships at 1024px in a hero or award moment,
someone should look at the rebuilt cutout edges at full size. At 512px in
a chip the edges will not be noticeable.

---

## 11. Design consistency audit

### Colors

Eight CSS custom properties in `src/app/globals.css`, exposed to Tailwind
v4 through `@theme inline`: `--background`, `--foreground`, `--brand`
(#c1743a terracotta), `--brand-dark`, `--cream`, `--cream-soft`, `--ink`,
`--ink-soft`.

The token set is coherent and no component hard-codes a hex value. But it
is missing every semantic role a product UI needs: success, warning,
danger, info, muted surface, border, focus ring. Components fill the gap
with raw Tailwind palette classes. Current off-palette usage:

- Red family, 8 distinct classes across error cards and status pills.
- Amber family, 6 distinct classes for working states.
- Emerald family, 3 distinct classes.

None of these are tokens, so a brand change would miss them.

**Standardize in CELPIP-UX-01:** add `--color-success`, `--color-warning`,
`--color-danger`, `--color-info`, `--color-surface`, `--color-border`,
`--color-muted`, and a focus-ring token. Replace the raw palette classes.

There is also no dark mode. `globals.css` declares no
`prefers-color-scheme` block. That is a legitimate scope decision for the
design-system ticket, but it should be a stated decision.

### Cards

One shape, repeated by hand roughly 76 times:
`rounded-3xl bg-white p-6 shadow-sm ring-1 ring-ink/5 sm:p-8`.

The consistency is real and impressive for hand-copied code. It is also
brittle: changing the card radius means editing 76 call sites.
`rounded-3xl` (76), `rounded-2xl` (34), and `rounded-xl` (14) are mixed
with no documented rule for which applies where, and there are stray
`rounded-lg` (2), `rounded-md` (1), and `rounded-sm` (2) uses.

**Standardize:** one `<Card>` primitive with `default` and `compact`
padding. One radius scale with a documented rule.

### Buttons

The primary button is also hand-repeated:
`inline-flex h-11 items-center justify-center rounded-full bg-brand px-6
text-sm font-semibold text-white shadow-lg shadow-brand/20
transition-colors hover:bg-brand-dark`.

`rounded-full` appears 99 times, covering buttons, pills, badges, and
avatars with no distinction. There is no secondary, no ghost, no
destructive, and no disabled variant beyond ad-hoc opacity. Focus rings
are inherited from the browser default in most places.

**Standardize:** `<Button>` with `primary`, `secondary`, `ghost`,
`danger`; `sm`, `md`, `lg`; a real disabled state; a visible focus ring;
and a loading state, because several submit buttons manage their own.

### Spacing

`mt-8`, `mt-6`, `mt-5`, `mt-4`, `mt-3` appear freely with no rhythm.
Page-level spacing comes from `DashboardShell`'s `px-5 py-10 sm:px-8`.
Section gaps are decided per component.

**Standardize:** a 4-point scale with named section and stack gaps, and a
`<Stack>` or `<PageSection>` wrapper so pages stop setting margins.

### Typography

Fraunces for display via `font-serif`, Geist for body. Applied
consistently: headings are `font-serif ... tracking-tight text-ink`, body
is `text-sm leading-6 text-ink/70`. Eyebrow labels are
`text-xs font-semibold uppercase tracking-[0.2em] text-ink/50` and repeat
verbatim in many files.

Sizes are ad hoc: `text-sm` 204 uses, `text-xs` 86, `text-xl` 32,
`text-lg` 23, `text-base` 20, plus one-off `text-[10px]`.

**Standardize:** named roles (`display`, `h1`, `h2`, `h3`, `body`,
`body-sm`, `caption`, `eyebrow`) instead of raw size classes.

### Navigation

This is the weakest structural area.

`AppHeader` contains a logo linking to `/dashboard`, the user's email
(hidden below `sm`), and a sign-out button. **There are no navigation
links at all.** No link to Speaking, no link to Writing, no link to
history. A learner deep in `/dashboard/writing/attempts/[attemptId]` can
only reach Speaking by clicking the logo and then a module card.

There is also no breadcrumb, no active-route indicator, no mobile menu,
and no back affordance other than the browser's.

**Standardize in CELPIP-UX-02:** persistent primary navigation with an
active state, a mobile pattern (bottom tab bar or a drawer), and
breadcrumbs on nested routes.

### Status badges

`AttemptStatusBadge` and `WritingAttemptStatusBadge` are **byte-identical
in their `TONE_CLASSES` maps** and near-identical in markup. Four tones -
`ready`, `working`, `failed`, `neutral` - defined twice. The tone
resolvers correctly live in feature files
(`attempt-history.ts`, `writing-status-labels.ts`) and should stay there.

**Standardize:** one `<StatusPill tone={...}>` primitive; both feature
modules keep their own status-to-tone mapping and feed it.

### Loading states

Four `loading.tsx` files (`/dashboard`, `/dashboard/speaking`,
`/dashboard/writing`, `/dashboard/speaking/attempts`). Missing on
`/dashboard/writing/attempts` and on all four `[attemptId]` and `[taskId]`
detail segments. In-component loading is handled ad hoc inside submit
buttons and processing cards, each with its own markup.

**Standardize:** a `<Skeleton>` primitive and a card-skeleton composition,
then complete the `loading.tsx` coverage.

### Empty states

Five distinct empty-state components exist (`SpeakingEmptyState`,
`EmptyAttemptsState`, `WritingEmptyState`, `WritingEmptyAttemptsState`,
plus the inline "No modules are available yet" paragraph on the
dashboard). All are heading plus paragraph plus optional link. **None uses
an image**, while five empty-state illustrations sit generated and mapped
in `emptyStateAssets`.

**Standardize:** one `<EmptyState image title description action>`
primitive, wired to `emptyStateAssets`, replacing all five.

### Mobile layout

Breakpoint usage is almost entirely `sm:` (640px). `md:` and `lg:` are
rare, and `lg:grid-cols-3` on the dashboard grid is one of the few. The
practical effect is a two-state layout, phone and everything else, with
tablets getting the desktop layout at 640px.

### Use of images

Covered in section 10. Summary: the signed-in app uses one image, a 32px
favicon. The registry is complete and unimported.

---

## 12. Mobile responsiveness concerns

Ranked by launch risk.

1. **No navigation on mobile.** The header has no links at any width, so
   the problem is not mobile-specific, but on a phone there is no browser
   chrome to compensate. Highest priority.
2. **The user's email is hidden below 640px** (`hidden ... sm:inline`), so
   a mobile learner has no way to confirm which account is signed in.
3. **Recording on iOS Safari** - permission prompt with no explainer,
   backgrounding suspends the stream, no `visibilitychange` handling.
4. **Writing on a phone** - no autosave, no unsaved-work guard, timer and
   word count can be hidden behind the virtual keyboard.
5. **History tables.** `AttemptHistoryTable` and
   `WritingAttemptHistoryTable` are table layouts. Tables at 375px either
   overflow horizontally or compress columns to unreadable widths. A card
   list below `sm:` is the standard fix.
6. **Two-state responsive design.** Only `sm:` is used meaningfully, so
   768px to 1024px tablets get a layout tuned for desktop.
7. **Tap target sizes.** Buttons are `h-11` (44px), which is correct.
   Status pills at `py-1 text-xs` are not tappable targets, which is fine
   since they are not interactive. No violation found.
8. **No viewport-specific testing record.** Nothing in the repo documents
   a device pass. Section 18 supplies a checklist.

---

## 13. Security and secret-handling review

`.env.local` was not read. No secret value appears in this document.

### What is correct

1. **Service role isolation.** `SUPABASE_SERVICE_ROLE_KEY` is read only in
   `src/lib/supabase/admin.ts`, which carries a warning comment and is
   imported by exactly three server modules plus `/api/early-access`. It
   is never `NEXT_PUBLIC_` prefixed.
2. **OpenAI key isolation.** `OPENAI_API_KEY` is read only inside the two
   server pipelines and the transcription client. No client component
   touches it.
3. **RLS everywhere.** All eleven tables have RLS enabled, with own-row
   policies on every user-scoped table.
4. **Private audio.** The `attempt-audio` bucket is `public: false` and
   every storage policy requires the first path segment to equal
   `auth.uid()::text`. Audio is served by signed URL.
5. **Ownership checks before paid work.** Both AI pipelines verify
   `attempt.user_id === input.userId` and return 403 before any
   transcription or scoring call.
6. **Open-redirect guard.** `/auth/callback` accepts `next` only when it
   starts with `/`.
7. **Input validation.** Every API body passes through zod. UUIDs are
   validated before database queries so a bad path becomes a 404.
8. **Server-side recomputation.** The writing route recomputes the word
   count and clamps `timeSpentSeconds`, so client values cannot corrupt
   stored data.
9. **AI output validation.** Every model response is zod-parsed before it
   reaches the database. `raw_ai_response` is stored as validated data.
10. **Error messages carry no internals.** Errors go to `console.error`;
    users receive copy constants.
11. **`.gitignore` covers `.env*` with an `!.env.example` exception**, and
    `.env.example` holds only placeholder values.

### Risks documented, not changed

1. **`/api/early-access` is unauthenticated and writes with the service
   role key.** It is the only such route. There is no rate limit, no
   CAPTCHA, and no duplicate-email guard, so it can be flooded with junk
   leads or used to inflate the table. Zod caps field length, which limits
   the blast radius, but the route is the most exposed surface in the app.
   Mitigation belongs in LIVE-01 or a dedicated hardening ticket.

2. **No rate limiting anywhere.** Grep for "rate limit" returns nothing.
   Any authenticated user can call `/api/speaking/feedback` or
   `/api/writing/evaluate` in a loop. The duplicate guards prevent
   re-scoring the *same* finished attempt, but nothing prevents creating
   many attempts and scoring each once. This is a direct, uncapped billing
   exposure on the OpenAI account. Highest-severity finding in this
   section.

3. **No `middleware.ts`.** Route protection is per-layout and per-page.
   That is correct and defensible, and the doubled `getUser()` check is
   deliberate. The cost is that a future route added under `/dashboard`
   without its own check is silently unprotected. A middleware matcher
   would make protection structural rather than conventional.

4. **`live_class_interest` has RLS enabled with zero policies.** Currently
   safe (nothing can read it), but LIVE-01 must add policies or write
   through the service role.

5. **`usage_events` has a select-own policy and no insert policy.**
   USAGE-01 must write through the service role.

6. **No CSRF protection on the POST routes.** They rely on Supabase cookie
   auth. Supabase sets `SameSite=Lax`, which blocks cross-site POST, so
   the practical risk is low. Worth an explicit decision rather than an
   assumption.

7. **`raw_ai_response` stores the full model output** including anything
   the model echoed from the learner's transcript or essay. This is the
   learner's own data behind their own RLS policy, so it is correct today.
   It becomes a data-retention question when a privacy policy is written.

8. **`_reference/canva-design/desktop.png` is committed**, 4.5 MB, and is
   design reference rather than product code. Not a security issue.

No auth code, RLS policy, or service-role usage was changed.

---

## 14. Launch-readiness gaps

| # | Gap | State | Blocker | Ticket |
| --- | --- | --- | --- | --- |
| 1 | Free attempt logic | Not built. `usage_events` unused. | Yes | USAGE-01 |
| 2 | Paid usage limits | Not built. No balance, no plan, no enforcement. | Yes | USAGE-01 |
| 3 | AI rate limiting | None. Uncapped OpenAI spend. | Yes | USAGE-01 |
| 4 | AI cost tracking | None. No token or cost record. | Yes | CELPIP-COST-01 |
| 5 | Live class inquiry | Table exists, no route, no form, no policies. | Yes | LIVE-01 |
| 6 | Pricing surface for signed-in users | Only `ProgramOptionsSection` on the landing page. Nothing in-app. | Yes | USAGE-01 |
| 7 | Terms and disclaimer page | No `/terms`, no `/privacy`. Disclaimer only in footer copy. | Yes | LIVE-01 or launch ticket |
| 8 | AI score disclaimer placement | Present but in the page footer, far from the score. | Yes | CELPIP-UX-01 |
| 9 | Mobile navigation | Header has no links at any width. | Yes | CELPIP-UX-02 |
| 10 | Learner dashboard | Stub. No progress, no next action. | Yes | CELPIP-UX-03 |
| 11 | Email capture in-app | Only the landing early-access form. | No | LIVE-01 |
| 12 | Duplicate submission protection | **Partly done.** Both pipelines return early for an already-scored attempt. Nothing stops a double-click creating two attempts. | No | USAGE-01 |
| 13 | Error handling | Two `error.tsx` boundaries. Missing on landing, auth, and all detail segments. | No | CELPIP-UX-02 |
| 14 | Loading states | Four `loading.tsx`. Missing on five segments. | No | CELPIP-UX-02 |
| 15 | Open Graph and social images | None. `assets/social/` is empty. | No | CELPIP-UX-01 |
| 16 | Landing image weight | Roughly 15.8 MB of raw JPG where 5.0 MB of WebP exists. | No | CELPIP-UX-01 |
| 17 | Analytics | None. | No | CELPIP-COST-01 |
| 18 | Account settings | No profile page. `profiles` is written by trigger and never read. | No | Later |
| 19 | Password reset | Not implemented. | Yes | Auth follow-up |
| 20 | Reading and listening modules | Seeded `coming_soon`, permanently disabled cards. | No | Later |

Gaps 1, 2, 3, and 4 are one cluster: they must land together or the
product ships with an uncapped bill. Gap 19 is the quietest blocker on
this list - a learner who forgets their password today has no recovery
path.

---

## 15. Recommended next tickets

Full reasoning, sequencing, and dependencies are in
`docs/product/recommended-ticket-sequence.md`. Summary:

1. **CELPIP-UX-01 - Design System Foundation**
2. **CELPIP-UX-02 - Responsive App Shell**
3. **CELPIP-UX-03 - Learner Dashboard Redesign**
4. **USAGE-01 - Free Attempt Limit and Premium Access Rules**
5. **LIVE-01 - Live Class Inquiry and Schedule Interest**
6. **CELPIP-COST-01 - AI Usage Tracking**
7. **CLEANUP-01 - Safe Unused Asset and File Cleanup**

One deviation from the expected order is proposed: **CELPIP-COST-01 should
run before or alongside USAGE-01**, not after LIVE-01. See the sequence
document.

---

## 16. Do-not-rewrite list

These are working, tested against the hosted database, and must survive
every redesign ticket. Restyle them. Do not re-architect them.

### Server pipelines - do not touch the logic

- `src/features/speaking/generate-speaking-feedback.ts`
- `src/features/speaking/transcribe-attempt.ts`
- `src/features/speaking/transcription-client.ts`
- `src/features/writing/generate-writing-feedback.ts`
- `src/features/writing/evaluate-writing-attempt.ts`
- `src/features/writing/submit-writing-attempt.ts`

### Prompts and schemas - do not edit

- `src/features/speaking/scoring-prompt.ts`
- `src/features/speaking/scoring-schema.ts`
- `src/features/writing/writing-scoring-prompt.ts`
- `src/features/writing/writing-scoring-schema.ts`

Changing a prompt invalidates comparison against every attempt already
scored.

### Auth and data access

- `src/lib/supabase/client.ts`, `server.ts`, `admin.ts`
- `src/app/auth/callback/route.ts`
- The doubled `getUser()` check in `dashboard/layout.tsx` and each page.
  It looks redundant. It is not - layouts do not re-render on client
  navigation.

### Database

- All eight migrations in `supabase/migrations/`. Already applied to
  hosted Supabase. Never edit, never renumber, never delete. New work adds
  `011_*` and above.
- Badge slugs: `foundation-speaker`, `developing-communicator`,
  `test-ready-builder`, `confident-speaker`, `advanced-communicator`.
  Seeded in 001 and read by `level-badges.ts`.
- Module slugs: `celpip-speaking`, `celpip-writing`, `celpip-reading`,
  `celpip-listening`, `live-classes`.
- The decision to keep writing attempts in `attempts` and writing scores
  in `attempt_scores` rather than in separate tables.

### Recording

- `src/components/speaking/useAudioRecorder.ts` - the mount guards, the
  callback refs, and the `start()` resolution contract are all load-bearing.
- `src/features/speaking/audio-utils.ts` - mime negotiation.
- The three-step upload order in `recording-upload.ts`. The attempt row
  must exist before the upload so the storage path can carry the attempt id.

### Assets

- Every source PNG and JPG under `public/assets/`. They are script inputs.
- Both scripts in `scripts/`.
- The three files in `src/features/assets/`. They are correct and ready;
  they only lack consumers.

### Business logic

- `src/features/speaking/level-badges.ts` and
  `src/features/writing/writing-level-badges.ts` - the server enforces
  these mappings over whatever badge the model returns.
- `src/features/writing/word-count.ts` - the server recomputes with it.
- The rule in `docs/product/pricing-and-attempt-model.md` that an attempt
  is consumed only after the result card is saved.

---

## 17. Manual testing checklist

To run before and after each redesign ticket. Nothing here was executed as
part of this audit.

### Auth

- [ ] Sign up with a new email; confirmation email arrives.
- [ ] Confirmation link lands on `/dashboard` with a session.
- [ ] A tampered `next` param (absolute URL) does not redirect off-site.
- [ ] Log in, log out, then confirm `/dashboard` redirects to `/login`.
- [ ] A signed-out visit to `/dashboard/speaking/attempts` redirects.
- [ ] A new user has a `profiles` row created by the trigger.

### Speaking, desktop Chrome

- [ ] `/dashboard/speaking` lists 8 task types.
- [ ] A task detail page shows correct prep and speaking seconds.
- [ ] Prep timer runs, then the speaking timer starts only once the mic is live.
- [ ] Denying microphone permission shows a readable error, not a crash.
- [ ] A finished recording plays back before submit.
- [ ] Submit creates the attempt and advances to `uploaded`.
- [ ] Feedback returns a level, four sub-scores, and three list sections.
- [ ] Clicking submit twice on a finished attempt does not double-charge.
- [ ] The attempt appears in history with the correct status pill.
- [ ] A badge is awarded and the count increases.
- [ ] Re-submitting the same finished attempt returns the same result page.

### Speaking, iOS Safari and Android Chrome

- [ ] Recording works on a real iPhone (mp4 container).
- [ ] Recording works on a real Android device (webm container).
- [ ] Backgrounding the app mid-recording fails gracefully.
- [ ] Playback works on both.
- [ ] The practice screen fits a 375px viewport with no horizontal scroll.

### Writing

- [ ] `/dashboard/writing` lists both task types with all seeded prompts.
- [ ] The timer matches `writing_task_details.time_seconds`.
- [ ] The word count updates live and matches the server-stored count.
- [ ] Submitting below the minimum word count shows the too-short message.
- [ ] A submission over 50000 characters is rejected cleanly.
- [ ] Evaluation returns a level, sub-scores, and the suggested structure.
- [ ] Re-evaluating a finished attempt returns the existing result.
- [ ] History and progress reflect the new attempt.
- [ ] The editor is usable on a 375px viewport with the keyboard open.

### Cross-cutting

- [ ] Signing in as user A never exposes any row belonging to user B.
- [ ] A direct URL to another user's attempt returns 404 or 403.
- [ ] An invalid UUID in any `[taskId]` or `[attemptId]` returns 404.
- [ ] Every page renders at 375px, 768px, 1024px, and 1440px.
- [ ] The AI disclaimer is visible on every result page.
- [ ] `npm run lint` passes.
- [ ] `npm run build` passes.
- [ ] No console error on any route in production mode.

### After any asset change

- [ ] `npm run assets:audit` reports no new warnings.
- [ ] Every registry path resolves; no broken image on any screen.
- [ ] Badge artwork renders at full size without visible cutout artifacts.
