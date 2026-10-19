# End-to-end checklist

Use this list to walk the Neeraj, Avinash, and Sahil packs. Tick a row only after you see the expected result. The automated rows run with:

```bash
npm test
npx playwright install chromium
npm run test:e2e
```

`npm test` is 49 unit tests. `npm run test:e2e` boots the app and checks the public pages, the CRS form with JavaScript off, signed-out API rejection, cron auth, a bad payment signature, and the security headers. Both commands must pass before a manual pass starts.

Search every page you open for the phrase the packs forbid: a claim that this product produced an official score. A practice estimate is the wording that should appear instead.

Viewport for every UI row: 375px wide, no sideways scroll. A desktop browser is the stand-in. A real iPhone Safari and Android Chrome pass is still required before launch.

## Automated, run first

- [ ] `npm test` passes
- [ ] `npm run test:e2e` passes
- [ ] `/crs` without JavaScript shows Estimate 483 for age 29, doctoral, CLB 7, 5 years Canadian work, and language as the biggest gain (93)
- [ ] `/crs` shows the IRCC calculator link, the estimate disclaimer, the last-verified date, and a job offer labelled not currently awarded
- [ ] `/draws?total=483` shows the estimate and does not predict an invitation
- [ ] `/checkout/success` says the page itself does not unlock access
- [ ] The help control is labelled AI assistant and says it is an AI
- [ ] Signed-out calls to `/api/app/allowance`, `/api/app/attempts`, `/api/app/checkout`, and `/api/app/assistant` return 401
- [ ] `POST /api/cron/tick` without the secret returns 401, and with `Bearer` plus `CRON_SECRET` returns 200
- [ ] `POST /api/webhooks/payments` with a bad signature returns 400
- [ ] `/crs` sends `X-Content-Type-Options: nosniff`, `X-Frame-Options: SAMEORIGIN`, a strict referrer policy, and a microphone permission limited to self

## Public pages to click

Open each URL at 375px. Confirm the heading, no sideways scroll, and no forbidden score phrase.

- [ ] A01 `/` header has Sign in and Get started. Footer has Pricing, Course, Ask Amar, Book, Privacy, Terms, and Refunds
- [ ] A03 `/` shows the program, AI practice, live classes, and pricing sections
- [ ] A05 `/diagnostic` — choose Speaking and submit. The next step is about a timed speaking task. The page works with JavaScript off
- [ ] A06 and A15 `/courses` — English and Hindi say Available. Punjabi, Tamil, and Gujarati say Soon. Lesson 1 is locked and offers a preview
- [ ] A11 `/pricing` — Test Sprint $49.00 CAD, Decoded Course $199.00 CAD, Live Batch $99.00 CAD, Private 1:1 $49.00 CAD
- [ ] A12 `/sitemap.xml` lists `/`, `/crs`, `/draws`, `/pricing`, `/courses`, `/ask`, `/book`, `/blog`, and the three legal pages. `/robots.txt` disallows `/dashboard`, `/account`, and `/api/`
- [ ] A21 `/ask` — says the corner button is an AI assistant and that immigration, refund, and account questions go to Amar
- [ ] A22 `/book` — says a reserved seat is not charged until the batch is confirmed, and that sessions are moved from the admin calendar
- [ ] A29 `/blog` — both notes are original and call levels a practice estimate
- [ ] N03 `/crs` and `/draws` as in the automated section. Save to my account goes to `/signup?next=`
- [ ] S27 `/legal/privacy`, `/legal/terms`, `/legal/refunds` — each says a lawyer still needs to review it. Refunds mention the 48 hour move window and that a full course refund also removes the included sprint
- [ ] S04 refund page matches the rule: 72 hours before start moves the seat, 24 hours does not

## Signed-in paths

Use a verified account. Admin rows need an email in `ADMIN_EMAILS`.

- [ ] S01 `/signup` creates an account. The confirmation link returns to `/auth/callback`. Unverified users are refused by the app APIs with 403
- [ ] A09 a signed-out visit to `/account` lands on `/login?next=/account`. After sign-in, Account shows the email
- [ ] A14 `/dashboard` loads practice modules for that user only
- [ ] A16 `/dashboard/writing` opens a task, counts words on the server, and shows a practice estimate after evaluation
- [ ] A17 `/dashboard` mock card opens Mock test 1. A free account cannot start another mock through `POST /api/app/attempts`
- [ ] N04 and N05 submit one writing answer and one speaking recording. The result is a practice estimate. A recording under 5 seconds says no speech was detected and does not spend the allowance
- [ ] N06 the allowance counter matches `GET /api/app/allowance`. A failed mark does not reduce it
- [ ] N16 open AI assistant, ask a help question, then ask an immigration question. The second one hands over and does not answer
- [ ] A24 `/account` links to the refund rules and says cancelling keeps access until the period ends

## Admin paths

- [ ] N02 and S18 `/dashboard/admin/platform/settings` lists every settings key. A non-admin sees access denied
- [ ] N07 `/dashboard/admin/platform/calibration` opens
- [ ] N12 `/dashboard/admin/platform/calendar` lists the eight class times
- [ ] N18 `/dashboard/admin/platform/cohort` opens and the export has no student names
- [ ] S08 `/dashboard/admin/platform/costs` shows a sample writing cost in cents
- [ ] S11 `/dashboard/admin/platform/inbox` opens
- [ ] S15 `/dashboard/admin/platform/queue` opens
- [ ] S16 `/dashboard/admin/platform/students` does not show notes or WhatsApp numbers
- [ ] S19 `/dashboard/admin/platform/reviews` says a review stays private until it is published
- [ ] S09 `/dashboard/admin/mock-tests` opens the builder for an admin

## Rules already covered by unit tests

These do not have a click-through yet. `npm test` is the check.

- [ ] N01 quote totals in `docs/quote/n01-internal-budget.md` add up: 38400 + 4800 + 2400 = 45600 CAD
- [ ] N05 audio mode does not score from a transcript. Text-only mode says pronunciation, rhythm, and intonation were not assessed
- [ ] N06 Kolkata and Vancouver midnights differ. Two concurrent reserves spend one slot
- [ ] N08 test mode rejects a late answer. Practice mode stays on the screen when time ends
- [ ] N09 Task 5 in test mode selects option A if the student does not choose. Practice audio has controls. Test audio does not
- [ ] N10 a full refund revokes both entitlements from a course purchase. Replaying a webhook id is a no-op
- [ ] N11 the third reserved seat confirms the batch. A ninth reservation is refused. Cancel at 72 hours moves the seat. Cancel at 24 hours does not
- [ ] N13 the lesson iframe sandbox is `allow-scripts` only
- [ ] N14 a visitor preview stops at 120 seconds. A coming-soon language is refused
- [ ] N15 media signatures expire. A host-only session cookie has no Domain attribute
- [ ] N17 two weak writing results on the same skill create one prescription. One weak result does not. A second prescription is blocked while one is active
- [ ] S10 question-type labels exist and do not use the forbidden score phrase
- [ ] S20 seat-reserved email says nothing is charged yet
- [ ] S28 the analytics event names include `crs_calculated`, `checkout_started`, `purchase_completed`, `allowance_reached`, `lesson_played`, and `assistant_handover`

## Owner accounts, tick only when you have done it

These cannot be closed from the repo.

- [ ] Supabase Auth URL configuration includes `http://localhost:3000/auth/callback` and the production callback
- [ ] Migrations `001` through `016` are applied on the Supabase project `ewykjltuiipmyrybetbk`
- [ ] `npm run videos:upload` has put `overview.mp4`, `listening.mp4`, `reading.mp4`, `writing.mp4`, and `speaking.mp4` in the `instructional-videos` bucket, and an intro screen plays one of them
- [ ] Stripe test card buys the course. The webhook writes a purchase and two entitlements. The success URL alone grants nothing
- [ ] Stripe webhook signing secret is the value in `STRIPE_WEBHOOK_SECRET`
- [ ] `CAL_WEBHOOK_SECRET` is set. A test booking creates one row. Replaying the webhook does not create a second
- [ ] Vercel Production, Preview, and Development contain every name from `.env.example`
- [ ] GitHub Actions secrets are set and `bash scripts/protect-main.sh` has been run
- [ ] A lawyer has reviewed `/legal/privacy`, `/legal/terms`, and `/legal/refunds`
- [ ] Backup restore into a separate Supabase project is recorded with date, duration, and row counts
- [ ] One pass on a real iPhone and one pass on a real Android phone at 375px, including a speaking recording

## IDs checked inside another row

- [ ] A02 the home hero offers a speaking practice path, and the AI assistant does not promise an official score
- [ ] A04 `/draws` is the Express Entry handoff. It links to the official rounds page
- [ ] A07 and A20 `/courses` shows the locked lesson instead of hiding it. Mini-courses use the same lock
- [ ] A08 results on a finished writing or speaking attempt say practice estimate
- [ ] A10 the 375px rows above have no sideways scroll
- [ ] A13 keyboard: tab to Calculate on `/crs`, the focus ring is visible, and every control has a label
- [ ] A18 instruction screens use the original text already in the player, not copied test-provider wording
- [ ] A19 and A20 open a mini-course from the app only after sign-in
- [ ] A23 a signed-in student can open a review form. It stays unpublished until admin publishes it
- [ ] A25 course content is the locked lesson on `/courses`, not a hidden URL
- [ ] A26 the builder can hold more than one mock. Importing ten tests is a content task, not a code switch
- [ ] A27 `/dashboard` shows recent feedback and a recommended next practice
- [ ] A28 a finished evaluation can be read on the attempt page. PDF export is a later phase
- [ ] A30 phase 3 content is the cohort page plus the practice notes on `/blog`
- [ ] S02 after sign-up the student lands on the dashboard
- [ ] S03 an admin can grant access from settings once a purchase row exists
- [ ] S05 course instalments are off. The course price on `/pricing` is one payment
- [ ] S06 reading and listening answers are marked by the answer key, not by the writing model
- [ ] S07 speaking audio is stored in the private `attempt-audio` bucket
- [ ] S12 the marking desk is the writing and speaking attempt pages an admin can open
- [ ] S13 content edits for mocks go through `/dashboard/admin/mock-tests`
- [ ] S14 CRS points are the values behind `/crs`. Seeding them into SQL is the owner migration step
- [ ] S17 a student record does not show notes or WhatsApp numbers to a coach by default
- [ ] S21 and S22 follow-up and broadcast email are not sent until the email provider is connected
- [ ] S23 owner alerts are the admin queue, inbox, and reviews pages
- [ ] S24 DNS and the lesson host are the owner steps in the last section
- [ ] S25 and S26 legal pages exist and are marked for lawyer review
- [ ] S29 testimonials are not published from the reviews queue until consent is stored
- [ ] S30 open product decisions are recorded in `docs/still-to-do.md`
- [ ] S31 coupons are not accepted at `/pricing`
- [ ] S32 class recordings are not a public library
- [ ] S33 buying for two people is not offered. Each account buys for itself
- [ ] S34 handover is this checklist plus `docs/runbook/vercel-supabase.md` and `docs/runbook/backups.md`

## Task index

Every ID below must have a ticked row above before the pass is complete.

Neeraj: N01 N02 N03 N04 N05 N06 N07 N08 N09 N10 N11 N12 N13 N14 N15 N16 N17 N18

Avinash: A01 A02 A03 A04 A05 A06 A07 A08 A09 A10 A11 A12 A13 A14 A15 A16 A17 A18 A19 A20 A21 A22 A23 A24 A25 A26 A27 A28 A29 A30

Sahil: S01 S02 S03 S04 S05 S06 S07 S08 S09 S10 S11 S12 S13 S14 S15 S16 S17 S18 S19 S20 S21 S22 S23 S24 S25 S26 S27 S28 S29 S30 S31 S32 S33 S34
