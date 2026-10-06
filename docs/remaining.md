# Remaining work

The current owner checklist, including Supabase, Stripe, Vercel, and the video upload, is in [still-to-do.md](still-to-do.md).

Reviewed against the Neeraj task pack (Website Build Pack v3.1, prepared 29 Sep 2026). A criterion is listed here when the running app cannot demonstrate it yet. Rules that already pass in `npm test` are named so they are not rebuilt.

End-to-end coverage that can run without owner accounts is `npm run test:e2e`. It does not replace the real-phone, Stripe, Cal.com, or restore checks below.

## Already covered by unit tests

These behaviours exist as pure functions and Vitest cases. They are not wired to Supabase, Stripe, Cal.com, or the screens students use today.

- CRS totals for the three reference profiles, job-offer points staying at 0, and the CLB 7 best-change case (N03).
- Writing word count, range flags, markup escaping, and the failed-mark message (N04).
- Speaking audio-first mode, text-only fallback, and “No speech detected” under 5 seconds (N05).
- Allowance windows, oldest-first dispatch, and one-of-two concurrent reserves (N06).
- Calibration error stats and the generous-drift flag (N07).
- Player script order, deadlines, practice versus test, and offline save keys (N08).
- Speaking prep, record, Task 5 timeout, and practice-only media controls (N09).
- Checkout mode, webhook signature check, refund revoke, and batch seat rules (N10, N11).
- Eight class times across the October 2026 DST week, unpaid holds, and calendar mismatch flags (N12).
- Lesson sandbox token, CSP, and upload warnings (N13).
- Video preview cap, token expiry, seek clamp, and completion at 90 percent (N14).
- Rate-limit decisions, signed media paths, host-only cookie flags, and same-origin checks (N15).
- Assistant handover categories and the daily-cap decision (N16).
- One prescription, re-practice selection, and practice-estimate copy (N17).
- Cohort aggregates, the “too few” rule, a nameless CSV, and coach permission defaults (N18).

## Global rules still open

The pack’s definition of done applies to every task.

- Nothing has been demonstrated on a Vercel preview URL. GitHub secrets are unset, and `scripts/protect-main.sh` has not been run.
- No screen has been tested on a real iPhone Safari or Android Chrome at 375px. Desktop emulation is not enough for N08, N09, N10, N13, N14, N16, and N17.
- Analytics events from section 22 are not sent to a cookieless tool. `checkout_started` and `assistant_handover` are only fields on a JSON response.
- Paid content is not shown locked-with-preview in the existing course and mock screens.
- Limits, prices, and timings are read from `defaultSettings()` in the new routes. Changing a row in the `settings` table does not change the running app within 60 seconds.
- Instruction text for the existing player was not re-audited against the “original wording only” rule.

## N01 — Quote

`docs/quote/n01-internal-budget.md` has the 45,600 CAD total, phase subtotals that add up, the three Phase 1 breakout lines, numbered assumptions, rates, a sequence timeline, a 30-day warranty, and a Phase 3 uncertainty note.

Still open:

1. Avinash and Sahil task IDs are not in the mapping. Criterion 3 asks for every ID in all three packs, once each.
2. AI cents are a formula, not a measurement from a sample writing answer and a 90 second recording.
3. Two references are blank on purpose. Add real projects before the budget is shown outside the team.
4. Transactional email has no named vendor or monthly price.

## N02 — Architecture and data model

`docs/architecture/extend-vs-rebuild.md`, `docs/architecture/schema.md`, and `supabase/migrations/015_platform_schema.sql` are in the repo. Money is integer cents. `.env.example` lists the variables.

Still open:

1. Migrations have not been applied to an empty database.
2. The migration does not create every section 19 table. Missing names include `mock_parts`, `mock_media`, `mock_questions`, `intake_answers`, `consents`, `coupons`, `templates`, `resources`, `reviews`, `testimonials`, `questions`, `question_messages`, `referral_consents`, `recordings`, `ee_draws`, `follow_ups`, `test_results`, and the email tables. Several of those belong to other packs, but criterion 2 asks for every section 19 table.
3. `crs_points`, `part_timings`, and `settings` are not seeded in SQL. The calculator and the player read TypeScript defaults.
4. A past `ends_at` does not deny the existing speaking, writing, or mock APIs. The check exists only as `isEntitlementActive`.
5. A course purchase does not insert two entitlement rows. Revoke does not set `revoked_at` in the database.
6. Settings changes are not written to `settings_audit`, and the 60 second cache never reads the database.
7. The coach redact function is tested. It is not applied on a query against `notes.body` or `users.whatsapp_e164`.
8. `lessons.celpipdecoded.com` is not provisioned. The session cookie helper is host-only in code only.

## N03 — CRS calculator

`/crs` is server-rendered. The form uses GET, so it works with JavaScript off. The end-to-end test covers the CLB 7 / doctoral / 5-year profile (total 483), the breakdown, the IRCC link, the disclaimer, the last-verified line, and the job-offer label.

Still open:

1. Editing `crs_points` in the database does not change the page. The table is hardcoded in `src/features/platform/crs.ts`.
2. Spouse fields stay on screen when “Applying with a spouse” is unchecked. Points are zeroed, but the pack asks the fields to hide.
3. Level dropdowns do not restore the submitted values.
4. “Save to my account” opens sign-up and then does not insert `crs_results`.
5. `crs_calculated` does not fire.
6. The three official IRCC reference profiles are unit-tested, not re-checked in a browser against the IRCC site on a recorded date.

## N04 — Writing evaluation

Still open:

1. A real answer is not stored as an evaluation row with exactly four `criterion_scores`.
2. The student-facing result card still comes from the older `/api/writing/evaluate` path, not `src/features/platform/writing.ts`.
3. Up to five mistakes and both rewrites are specified in the schema and are not rendered by the new path.
4. Invalid JSON after three tries is tested in memory. The live route does not skip the allowance or show that failure message.

## N05 — Speaking evaluation

Still open:

1. A real recording is not scored by `evaluateSpeaking`. The live path can still transcribe before scoring.
2. Deliberate fillers are not asserted against a stored test recording.
3. “No speech detected” does not run on an uploaded file, so allowance is not protected on that path.
4. iPhone Safari and Android Chrome recordings are not in the test set.

## N06 — Queue, limits, and cost

Still open:

1. `GET /api/app/allowance` always returns the free plan with zero use. A fourth answer is not saved as `waiting_allowance`.
2. There is no waiting row in the UI and no Upgrade button on that state.
3. Upgrading to Test Sprint does not dispatch waiting answers.
4. The app does not show the local reset time, and `allowance_reached` does not fire.
5. Daily, weekly, and monthly waits are not applied to the live submit routes. A forged client counter is irrelevant there because those routes do not consult this allowance service.
6. Changing `eval.daily` in the database does nothing.
7. An admin grant of extra evaluations does not process waiting rows.
8. Completed evaluations do not write `model_version`, `cost_cents`, or `ai_usage`.
9. The speaking section does not tell the student that it needs 8 evaluations.
10. There is no allowance counter at 375px.

## N07 — Calibration

The admin page at `/dashboard/admin/platform/calibration` renders an empty batch.

Still open:

1. An admin cannot add a writing sample or a speaking sample. There is no 403 check on a calibration route because there is no write route.
2. “Run all” does not call the production evaluator or insert `calibration_runs`.
3. The comparison view does not show known level, today’s level, delta, or the previous run.
4. Calibration cost is not added to a spend total, and retired samples cannot be excluded from a new run.

## N08 — Mock player engine

The existing mock-test screens are still the player. The new engine is not what a student runs.

Still open:

1. Listening pauses are not driven by the builder’s per-conversation question counts.
2. Test mode does not auto-advance the real UI, and a late answer is not rejected by the live API.
3. Practice mode does not show the “Time is up” notice on the real screens.
4. Back is not enforced by the live API.
5. Device-clock changes, refresh, and a 5 minute offline gap are not handled by the screens students use.
6. Editing `part_timings` does not change the next attempt. Scripts are not frozen per attempt in the database.
7. A complete test does not start at the intro video, and instruction videos do not skip or auto-advance from this engine.
8. Practice section results and test-mode silence until the end are not the live flow.
9. `POST /api/app/attempts` can refuse a mock in memory. The existing mock routes do not.
10. Real-device 375px runs, including Reading, have not been done.

## N09 — Speaking and media in the player

Still open:

1. Prep and record durations in the live speaking UI are not asserted against the section 8.3 fixture.
2. Test mode does not auto-start recording or auto-advance to the next task.
3. Practice “Record again” does not guarantee that only the submitted take is queued, or that the allowance drops by one per task.
4. Task 5 does not show the chosen option plus the third image as a three-screen flow in the live player.
5. Practice audio controls (−10s, +10s, replay) and test-mode single play are not on the live media element.
6. Refresh during test-mode audio does not resume at an offset.
7. A 20 second network drop during recording does not resume a chunked upload.
8. Microphone denial does not show the help screen before timed tasks.
9. iPhone and Android upload-and-playback has not been done.

## N10 — Card payments

`/checkout/success` says the page itself does not unlock access. The end-to-end test checks that sentence. Signature verification is unit-tested.

Still open:

1. Checkout does not create a Stripe Checkout Session. No test-card purchase writes `purchases` or two entitlements.
2. Closing the browser after payment cannot grant access, because the webhook does not load or save state.
3. Replaying a webhook does not persist one purchase. The handler starts from an empty in-memory state.
4. Renewal, cancel-at-period-end, and the cancellation email are not implemented against Stripe.
5. The 3-day renewal reminder is a function, not a queued email.
6. A dashboard refund does not revoke entitlements within one minute.
7. Stripe Tax is not enabled, and an Ontario address does not show HST on a receipt.
8. Changing the Sprint price in admin does not change checkout.
9. Checkout has not been completed on a phone.
10. `purchase_completed` does not fire. `checkout_started` is only a JSON field.

## N11 — Live batch reserve-and-charge

Still open:

1. Reserve does not save a card or send “Seat reserved”.
2. The third seat does not charge the first two or send “Batch confirmed” with a Zoom link.
3. A declined charge does not mark one seat `payment_failed` while leaving the others charged.
4. The daily job does not email “Batch not running”. `POST /api/cron/tick` runs the release function on an empty list.
5. A ninth reservation and a race for the last seat are not enforced on stored seats.
6. An Interac seat does not create a refund task in the database.
7. Cancel at 72 hours does not move a seat. Cancel at 24 hours does not refuse a refund in the product.
8. Webhook replay is not idempotent against `webhook_events`.
9. Changing `batch.min_to_run` in the database does not change the trigger.
10. `batch_reserved`, `batch_confirmed`, and `batch_released` do not fire.

## N12 — Calendar sync

`docs/runbook/calendar-sync.md` includes the “reschedule from admin only” instruction. Class times are unit-tested across DST.

Still open:

1. A Google Calendar busy time does not remove a 1:1 slot.
2. Paying for a 1:1 does not create a Google event, a Zoom link, a `bookings` row, or a “Session booked” email.
3. The 15 minute unpaid hold is not released by a live job.
4. Admin move and cancel do not update Google, Zoom, or student email.
5. Creating a batch does not create 8 calendar events.
6. Blocking a date does not remove slots in a booking tool.
7. A replayed booking webhook does not write one row, because no webhook is stored.
8. The reconciliation job does not read a real calendar. The admin calendar page only prints computed times.

## N13 — Mini-course sandbox

`docs/mini-course-guide.md` and `public/shared/celpip-lesson.v1.js` exist.

Still open:

1. No student page loads a lesson in an iframe with `sandbox="allow-scripts"`.
2. A malicious lesson (cookie, main-site API, top navigation) has not been hosted and blocked.
3. A lesson URL is not rejected when the token is missing or expired.
4. `CelpipLesson.start`, `drill`, and `finish` do not insert three `mini_events` rows.
5. A foreign-origin `postMessage` is not ignored by a mounted parent listener. The parser exists. The route does not persist or log.
6. Admin upload does not warn before publish, and there is no versioned publish flow or live message panel.
7. The shared stylesheet has not been checked at 375px inside a real lesson iframe.

## N14 — Secure video

Still open:

1. An admin cannot upload English and Hindi videos without opening the video host.
2. A copied playback URL is not minted, so the cross-site and expiry tests cannot be run on a real token.
3. `GET /api/app/lessons/[id]/playback` does not read entitlements. A user without a course is treated as having no course only because the route passes an empty entitlement list.
4. There is no player that stops at 2 minutes and shows an upgrade prompt.
5. Language switch does not continue at the same timestamp, and the choice is not remembered.
6. Punjabi is not a disabled “Soon” control, and marking it live in settings does nothing.
7. A missing Punjabi video does not show “Watch in English”.
8. `lesson_progress` is not written, and `lesson_played` does not fire.
9. Playback has not been tested on a phone, including an Android device without a Hindi font.

## N15 — Security, rate limits, and backups

Security headers are on every page. The end-to-end suite checks them, checks that signed-out calls to `/api/app/allowance`, `/attempts`, `/checkout`, and `/assistant` return 401, checks cron auth, and checks that a bad Stripe signature returns 400.

`docs/runbook/backups.md` describes the restore drill. It has not been performed.

Still open:

1. The 401 check is not a sweep of every paid resource, and it does not prove an expired entitlement is denied.
2. `GET /api/app/submissions/[id]` returns 404 even for the owner, because no row is loaded. That is not an IDOR test against real data.
3. The 11th sign-in from one IP is not limited on the login route.
4. Five wrong verification codes do not invalidate a code, and a resend inside 60 seconds is not refused.
5. Checkout, evaluation, and assistant limits live in process memory. They reset on restart and do not follow a database setting.
6. Unsigned object URLs in the `attempt-audio` bucket are not re-checked by this work.
7. The Supabase session cookie set in the browser has not been inspected for HttpOnly, Secure, SameSite=Lax, and host-only.
8. Daily backups retained 35 days are not evidenced from the Supabase console.
9. No restore into a separate project is recorded with date, duration, and row counts.
10. Admin accounts do not require 2-step sign-in.

## N16 — AI help assistant

The bubble is on every page, labelled “AI assistant”, and says it is an AI. The end-to-end test opens it at 375px. Handover rules for immigration, refunds, account questions, score promises, and other students are unit-tested.

Still open:

1. Answers do not come from stored `kb_entries` with embeddings. The route uses a starter list in memory.
2. A miss does not create an Ask Amar question with the conversation attached.
3. The daily cap trusts `messagesToday` from the browser. The 21st message is not counted on the server.
4. Changing `assistant.daily_cap` in the database does nothing.
5. There is no one-click “create KB entry” after a human reply.
6. There is no admin assistant log, and `assistant_handover` is not sent to analytics.
7. The open chat is a small card, not a full-screen phone layout. It has no focus trap, and Escape does not close it.
8. Cost per assistant message is not written to `ai_usage`.

## N17 — Diagnose, prescribe, prove

Still open:

1. No student sees a single Grammar Gym card after two weak writing evaluations.
2. Reading and listening accuracy is not computed from stored answers.
3. An active prescription is not saved, so a second one cannot be blocked on the next visit.
4. A free student cannot open the prescribed mini-course from an account.
5. A lesson finish event does not set `completed_at` or offer a same-tag re-practice set.
6. There is no before/after panel.
7. Changing `loop.rl_accuracy_below` in the database does nothing.
8. A detected skill with no mini-course is not logged for an admin.
9. The flow has not been run at 375px.

## N18 — Cohort report and second coach

`cohortReport` can compute sent, completed, proved, mean change, a non-completer baseline, and the “too few” flag. The admin page shows an empty table.

Still open:

1. The page has no seeded data, so it cannot be checked against a hand calculation.
2. Filters for date, module, plan, starting level, and course language are not on the page.
3. CSV download is not a real export of the filtered screen.
4. A coach cannot be invited, and revoke does not end access on the next request.
5. Coach 403s are not enforced on admin APIs, and attempts are not audit-logged.
6. Turning on WhatsApp for one coach does not reveal numbers only to that coach.
7. A coach reply is not labelled with the coach’s name.
8. Coach sign-in does not require 2-step verification.

## Accounts and deploy, in order

1. Fill `.env.local` from `.env.example`.
2. Create the Supabase project, allow the auth callback URLs, and apply migrations from `main`.
3. Seed `settings`, `crs_points`, `part_timings`, `products`, and `languages`.
4. Put the same variable names in Vercel. Add the GitHub Actions secrets. Run `bash scripts/protect-main.sh`.
5. Create Stripe, Cal.com, the video host, and the lesson host in the owner’s name.
6. Run one low-value live card payment and refund it.
7. Run the backup restore drill and write down the date, duration, and counts.
8. Repeat the 375px pass on a real iPhone and a real Android phone.
