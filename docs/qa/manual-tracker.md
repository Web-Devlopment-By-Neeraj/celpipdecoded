# Manual QA tracker

Sahil (and team) use this file while testing **staging** and local dev. Tick a line when the fix or feature is **merged to** `staging` (not only when it works on your machine).

**Branch naming:** one branch per chunk of work, e.g. `sahil/some-ui-fixes`, `sahil/dashboard-gaps` — bugs, gaps, and small features can share the same branch if the PR stays easy to review.

**How to update**

1. Add a row when you find something (copy the template at the bottom).
2. Open a branch from `staging`, fix, PR → merge to `staging`.
3. Change `- [ ]` to `- [x]` on this file in the same PR (or a quick follow-up PR) so everyone sees progress on `staging`.

**Severity (optional):** `P0` blocker · `P1` important · `P2` polish · `P3` nice-to-have

---



## Bugs

- [x] *Ai assist not Listining — NOt lisiting and there is speaking delay:* Mic stays on, and replies speak in the browser without waiting on the speech API (`P1`) · branch: `sahil/qa-tracker-fixes`

- [x] *All the task card has number one  "1" — Task numbers should be in numberic order:* Writing cards use sort order (`P1`) · branch: `sahil/qa-tracker-fixes`

---



## Gap fixes

Things that work but feel incomplete, confusing, or missing copy/empty states.

- [x] *When timer stops there should be a PopUp warning  — with sound and close button :* Writing practice and exam countdown (`P2`) · branch: `sahil/qa-tracker-fixes`

- [x] *When ever some one click on something pro there should be popup for that with the feature custormer is getting with that money  — when some one unlock a feature with money :* Plan upgrade dialog before checkout (price, benefits, Pay with card, Maybe later → 15% off) on course lock, pricing, book, usage card, and AI limit states (`P1`) · branch: `sahil/qa-tracker-fixes`

- [x] *Pricing page UI — plan list looked plain:* `/pricing` uses a card grid (price, period, benefits, featured Decoded Course, full-width CTAs) with header and discount banner (`P2`) · branch: `sahil/qa-tracker-fixes`

---



## Pending features

Not built yet or explicitly out of scope until a ticket is done.

- [x] *Add Stripe  — Add stripe keyys are pending - :* Test key checked (HTTP 200, test mode). Checkout opens a Stripe session. Secret stays in local env, not in git. Renewals and refunds still need STRIPE_WEBHOOK_SECRET in .env.local. The first payment works without it because the success page confirms the Checkout session. (`P0`) · branch: `sahil/qa-tracker-fixes`

- [x] *Discount-Dialog-box — when user scrool full home page then at the end when he is about to leave the app then we show a discount price popoup:* 15% leave offer (`P2`) · branch: `sahil/qa-tracker-fixes`

- [x] *Add PWA and dark mode  — :* Manifest, icons, service worker, and a Dark/Light control (`P1`) · branch: `sahil/qa-tracker-fixes`

---

## Planned work (numbered — review before coding)

**Workflow:** Say **“do Task N”** when ready. Tick `- [ ]` → `- [x]` when merged to `staging`. **Branching:** suggested branch names below are optional; you may combine several tasks on one branch and split PRs however you prefer for review.

**Related docs:** [`competitor-practice-app-comparison.md`](./competitor-practice-app-comparison.md) · **Website Build Pack v3.1** (27 Sep 2026 PDF) · engineering gap list [`../remaining.md`](../remaining.md).

**Product overrides (client — not Build Pack):** Free tier includes **exactly 2 AI feedback reports**: **1 Speaking** and **1 Writing** (separate buckets). The pack’s **3 shared** evaluations are **not** the target. **Task 3** is the source of truth for this.

### Build Pack v3.1 — compliance snapshot (review only)

**CAD plan prices in the pack match the app** ($49 / $199 / $99 / $49). What differs is mostly **free-tier limits, intake, mock player rules, admin ops, and UI layout** — not the dollar amounts on `/pricing`. Where the pack conflicts with **Product overrides** above, follow the overrides.

| Area | Pack says | App today (staging path) |
|------|-----------|---------------------------|
| Brand row under name | **DECODE · PRACTICE · SUCCEED** | Not on lockup; hero uses one short headline + support line |
| Free AI evaluations | Pack: **3** shared (W+S) | **Target: 2 total — 1 Speaking + 1 Writing** (**Task 3**). Today: **1** shared in DB |
| Free mock W/S marking | Pack: 3 marked, 7 waiting on Mock 1 | **Target:** L/R marked in full; W/S uses **free buckets** (1 writing + 1 speaking AI), rest **waiting** until upgrade — define in **Task 10** when wiring mocks |
| Test Sprint AI | **10 / day, 50 / week, 200 / month**, server + timezone | Partial usage model (`docs/remaining.md` N06) |
| Email verify | **6-digit code**; no eval/mock until verified | No verify gate on practice yet |
| Intake after verify | **11 questions** (8 first-timers), welcome + consent + finish | **Task 2** done; **Task 11** = verify-first + gates + admin |
| Student sidebar (§9) | Mock tests, Mini-courses, Ask Amar, Live classes in-app, … | Speaking, Writing, Courses only; mocks not in nav |
| Dashboard (§9) | Countdown, evals left, target, one next-step card | Module grid + mock card lower on page |
| Landing (§4) | Live hero speaking demo, locked app frame, results section | Partial program landing |
| Locked-not-hidden | Same components as app; lock + preview | Partial |
| Mock player (§8) | Practice vs Test rules, settings timings | Section routes; N08–N09 largely open |
| Payments / batch / calendar | Webhook unlock, batch charge-at-3, Cal sync | Partial Stripe; N10–N12 open |
| Admin Today queue | Real triggers from intake + usage | Stub page |
| Phase 2 | Prescription, performance, KB assistant, referrals | **Task 20** — defer |

---

### Task 1 — Brand lockup + hero (Build Pack + mockup)

**Goal:** Match v3.1 cover and hero mockup: **DECODE · PRACTICE · SUCCEED** under the wordmark and a **full, larger hero story** (not only “You're not bad at English.”).

**Plan**

- [x] **Lockup tagline row:** Add **DECODE · PRACTICE · SUCCEED** under “CELPIP Decoded” (PDF p.1; hero mockup). This is the **three-word promise row**, not the bracket icon dot in `CelpipDecodedLogo.tsx`.
- [x] **Hero — bigger / multi-line story:** `ProgramHeroSection` + `brand-copy.ts`: full headline stack from Build Pack / `docs/brand/celpip-decoded-rebrand-demo.md`.
- [x] **QA:** Landing at `/` — lockup row, hero hierarchy on mobile; dark mode deferred until **Task 3a** (Task 4 disables toggle).

**Suggested branch:** `sahil/task-1-logo-hero` · **Severity:** `P2`

---

### Task 2 — First-login onboarding (sign-up question flow PDF)

**Goal:** One-time flow after account creation, before dashboard. Copy from **CELPIP Decoded Sign-up Question Flow** PDF (11 questions, 8 for first-timers, welcome + consent + finish).

**Plan**

- [x] **Flow:** Sign-up / sign-in → `/onboarding` → finish screen → `/dashboard`. Completed users skip (`profiles.onboarding_completed_at`).
- [x] **Persistence:** `017_learner_onboarding_intake.sql` — `learner_intake_answers` + profile resume step. Existing accounts backfilled at migration.
- [x] **UI:** One question per screen, progress bar, Back, auto-advance on choices; WhatsApp / Instagram / scores / consent per PDF.
- [x] **Content:** `src/features/onboarding/onboarding-questions.ts` + wizard at `/onboarding`.
- [x] **Edge cases:** `/dashboard` layout redirects incomplete users; resume from last saved step.

**Suggested branch:** `sahil/task-2-onboarding-mcq` · **Severity:** `P1`

---

### Task 3 — Two free AI feedback reports (Speaking + Writing) ✓ decided

**Goal:** **Client policy (fixed):** **2 free AI feedback reports only** — **1 Speaking** and **1 Writing**, not the Build Pack’s 3 shared evaluations. Replace today’s **one shared** free scored attempt with **per-module** counters.

**Plan**

- [x] **Data model:** `018_free_speaking_writing_feedback.sql` — per-module columns; `get_learner_usage_summary` / `consume_scored_attempt_credit` deduct by `celpip-speaking` vs `celpip-writing`.
- [x] **API:** Pre-flight check uses module slug (speaking, writing, transcribe paths).
- [x] **UI:** Dashboard usage card — separate **Free Speaking AI** / **Free Writing AI** lines; updated limit copy.
- [x] **Migration:** Backfill from `scored_attempt_consumptions` ledger; legacy single-free without ledger → speaking used once.

**Apply in Supabase:** run `018_free_speaking_writing_feedback.sql` after `012`.

**Suggested branch:** `sahil/task-3-free-speaking-writing` · **Severity:** `P1`

---

### Task 3a — Client UI parity + perfected dark mode (deferred)

**Goal:** Align **basic UI** with client mockups / Build Pack (spacing, typography, component polish) and **re-enable dark mode properly** — especially **landing/hero** (client: hero dark mode was wrong; dashboard dark was closer). Do this as one focused pass when you have mockups in hand.

**Plan**

- [ ] **UI audit:** Landing, auth, dashboard shell vs client references; fix obvious mismatches (not full Task 8 landing rebuild).
- [ ] **Dark mode:** Uncomment `ThemeToggle`, `layout.tsx` theme script, and `globals.css` `html[data-theme="dark"]` block (Task 4 left full implementation in comments).
- [ ] **Hero + marketing:** Dark palette tuned for navy hero / cream text — no washed-out or inverted sections.
- [ ] **Dashboard + app:** Match light/dark parity tested on mobile; mock player stays light-in-dark where already designed.
- [ ] **QA:** Toggle works; no flash of wrong theme; PWA unchanged.

**Suggested branch:** `sahil/task-3a-ui-dark-polish` · **Severity:** `P2`

---

### Task 4 — Disable dark mode for now (comment out)

**Goal:** **Turn off** dark mode in the product until hero/landing polish is done. Client note: **hero dark mode is bad**; **dashboard dark mode is acceptable** — revisit in **Task 3a**.

**Plan**

- [x] Comment or gate: `ThemeToggle` in `LandingHeader` / `AppTopNav`, inline theme script in `layout.tsx`, and **`html[data-theme="dark"]` rules** in `globals.css` (force light on load).
- [x] Confirm signed-in dashboard stays usable in **light** mode only.
- [x] Leave PWA/manifest as-is unless toggle removal affects icons only.

**Suggested branch:** `sahil/task-4-dark-mode-off` · **Severity:** `P2`

---

### Task 5 — Mock tests (dashboard, flow, player UX)

**Goal:** Mock tests are easy to find, structured as **Mock Test 1 / 2 / …**, support **full test vs single section**, cleaner instructions, navigation, timing between sections, and paywall after free mock.


#### Task 5a — Remove repeated instruction copy

- [x] Audit mock routes under `src/app/dashboard/mock-tests/` and exam player shells for **duplicate instruction blocks**; keep one clear instruction per screen (section intros already trimmed per EXAM-15 reference pass).

#### Task 5b — Mock tests in left sidebar (high on dashboard)

- [x] Add **Mock tests** to `APP_NAV_ITEMS` (sidebar + mobile nav), not only `DashboardMockTestCard` below the fold on `/dashboard`.
- [x] Optional: shorten dashboard page mock block once nav exists (pointer to sidebar in dashboard card copy).

#### Task 5c — Mock Test 1 / 2 list + full vs section practice

- [x] **Hub UI:** List **Mock Test 1**, **Mock Test 2**, … (only Mock Test 1 is free initially) at `/dashboard/mock-tests`.
- [x] **Inside Mock Test 1:** Choose **Full mock test** OR **single section** (Listening / Reading / Writing / Speaking).
- [x] **Results behaviour:** Full mock → **combined summary at the end** (`sessionStorage` + `MockTestFullCompleteScreen`); single section → **results after that section** (see `mock-test-flow.ts`).
- [x] **Wire CTAs:** Full mock starts at `/dashboard/mock-tests/mock-test-1/full` (overview video) → Listening with `?flow=full`. Instructional videos on Cloudinary (`instructional-video-assets.ts`).

#### Task 5d — Back button in test player / section pages

- [x] Add consistent **Back to mock test** on section intro + instructional video screens (`mockTestContext.exitHref`).

#### Task 5e — Full mock: 10s prep between sections

- [x] After a section ends in **full mock flow**, show **10 second** preparation, then auto- or manual-advance to next section (`MockTestSectionPrepScreen`).

#### Task 5f — “Move to next section” at section end

- [x] Explicit **Move to next section** button when a section completes (full mock path).

#### Task 5g — After Mock Test 1: “Next mock test” + payment popup

- [x] On **last screen** of completed free mock, **Move to next mock test** → **plan upgrade / payment modal** (`PlanUpgradeDialog`). Mock Test 2 hub gated with upgrade CTA.

**Suggested branches:** `sahil/task-5a-mock-copy`, `sahil/task-5b-mock-nav`, … or one epic `sahil/task-5-mock-tests` if small enough · **Severity:** `P0`–`P1` (large)

---

### Task 6 — Mock Test builder (Amar / client)

**Goal:** Confirm and finish tooling so Amar or the client can **author mock tests** for learners.

**Plan**

- [ ] **Already in repo:** Admin routes `/dashboard/admin/mock-tests` (builder MVP). See `docs/admin/admin-01-mock-test-builder-mvp.md`, migrations `013`+.
- [ ] **Verify:** `ADMIN_EMAILS` in env, staff can create/edit mock test structure, preview, validation issues.
- [ ] **Gaps vs Task 5:** Builder content must feed **Mock Test 1 / 2** hub (not only hard-coded `mock-test-1` routes).
- [ ] **QA checklist:** Create part → question → preview → learner-visible test (when published).

**Suggested branch:** `sahil/task-6-mock-builder` · **Severity:** `P1`

---

### Task 7 — Copy: no “Amar and team”; 1:1 is with Amar only

**Goal:** Site-wide copy audit — remove **“team”** where it implies Amar + staff for **1:1** and brand voice; private session = **Do 1:1 with Amar** only.

**Plan**

- [ ] **Search:** `team`, “our team”, “with the team” in `src/`, landing forms, pricing (`plan-upgrade-copy.ts` private_1to1), book page, assistant strings (keep “Ask Amar” where intentional).
- [ ] **Replace:** Early access form (“our team will…”), batch/private checkout copy, any generic support lines — align with client wording.
- [ ] **Do not change:** Internal docs, “Sahil (and team)” in this tracker, or Vercel “team” in deployment docs unless user-facing.

**Suggested branch:** `sahil/task-7-amar-copy-audit` · **Severity:** `P2`

---

### Task 8 — Public landing structure (Build Pack §4)

**Goal:** Rebuild public home to the pack **section order** and behaviours, not only visual polish.

**Plan**

- [ ] **Section order (§4):** Header → hero **with live Speaking Task 1 demo** (30s prep / 90s record, partial feedback, survives sign-up) → proof strip → CRS → “which answer scores higher” → module diagnostic → course videos (EN/HI, Punjabi soon) → **locked student app frame** → study planner → pricing → **results §4.8** → about → FAQ → sign-up prompt → footer disclaimer.
- [ ] **Express Entry draws:** Own page (`/draws`) linked from CRS and free tools; filters/chart/admin add per §4.4 (extend if page is minimal today).
- [ ] **Previews SSR (§4):** CRS and draws remain crawlable; no preview-only-in-JS for key free tools.
- [ ] **Mobile (§4.10):** No horizontal scroll; real-device pass is separate global DoD.

**Suggested branch:** `sahil/task-8-landing-sections` · **Severity:** `P1`

---

### Task 9 — Student app shell: sidebar + dashboard (Build Pack §9)

**Goal:** Match mockup **navigation** and **dashboard** widgets (client noted: more sidebar items, different dashboard layout).

**Plan**

- [ ] **Sidebar / mobile row:** Add routes per §9: **Mock tests** (hub), **Mini-courses**, **Ask Amar** (`/ask` or in-app), **Live classes** inside app (not only `/#live-classes`). Keep Speaking/Writing or fold under “Practice” if mockup uses one Practice area — follow attached mockup when implementing.
- [ ] **Dashboard:** Test **countdown**, **evaluations left** (today/month when Sprint), **target CLB**, **one next-step card** from intake rules, **next live class** — reduce duplicate “everything on one scroll” layout where mockup differs.
- [ ] **Phase 2 nav items:** Performance, My answers, Referral — link as locked/stubs or omit until Phase 2 (**Task 20**).

**Suggested branch:** `sahil/task-9-app-shell-dashboard` · **Severity:** `P1` · overlaps **Task 5b**

---

### Task 10 — Plans, pricing copy, and unlock matrix (Build Pack §5–5.1, §7.5, §8.5)

**Goal:** **Prices already match the pack**; align **what each plan unlocks** with marketing copy. **Free AI = Task 3 only (1 Speaking + 1 Writing).**

**Plan**

- [ ] **Unlock table (Free):** 1 full mock, CRS/draws/diagnostic, section 1 videos, **2 AI feedback (1 Speaking + 1 Writing)**, mini-courses, Ask Amar — copy on `/pricing` and upgrade dialog must say **two** reports, not three.
- [ ] **Test Sprint limits §7.5:** 10 daily / 50 weekly / 200 monthly evaluations, visible counters, timezone midnight/Monday week.
- [ ] **Free mock marking (adapt §8.5):** L/R marked in full; for W/S on Mock 1, consume **writing bucket** and **speaking bucket** once each; additional W/S answers **saved + waiting** with upgrade CTA (not pack’s 3+7).
- [ ] **Pricing page / upgrade dialog:** Benefit bullets match agreed unlocks; Sprint limits as in pack where applicable.

**Suggested branch:** `sahil/task-10-plans-limits-matrix` · **Severity:** `P0` · implement after **Task 3**

---

### Task 11 — Email verification + intake rules (Build Pack §6) — not the wizard again

**Goal:** **Verify email first, then** the sign-up questions (**Task 2**). Wire intake into **product gates** and **admin**, not rebuild the questionnaire.

**Already covered by Task 2 (do not duplicate):** Welcome → Q1–11 (Q4–6 branch) → consent → finish card → dashboard; per-answer save + resume; server-side skip for Q4–6; WhatsApp, Instagram, scores, marketing consent JSON.

**Still open for Task 11**

- [ ] **6-digit email code** (not link-only) + resend/rate limits (§6).
- [ ] **Order:** Unverified users may browse, but **cannot** run AI evaluation or **start a mock** until verified; after verify → `/onboarding` if intake incomplete.
- [ ] **Dashboard countdown / target** from intake (e.g. Q7 target CLB, Q11 next test) — today answers are stored but dashboard may not read them yet.
- [ ] **Admin:** Student record + **Today** queue use intake fields (§15.1, §15.3); optional per-question analytics events.

**Suggested branch:** same multi-task branch as other work · **Severity:** `P0` · **depends on Task 2** (done)

---

### Task 12 — Global product rules (Build Pack §1, §21, assistant §10)

**Goal:** Non-UI rules that govern copy and assistant behaviour.

**Plan**

- [ ] **Practice estimate:** Grep and remove **“your CELPIP score”** and score promises in UI, emails, exports (§1).
- [ ] **Assistant:** No immigration advice, no other students, handover for refunds/account; daily cap **server-enforced** (§10.2–10.3).
- [ ] **Immigration Ask Amar:** Category + disclaimer + optional consultant referral **only after explicit consent**; consultant details from admin settings, never public (§10.3).

**Suggested branch:** `sahil/task-12-product-rules` · **Severity:** `P1`

---

### Task 13 — Mock test player rules (Build Pack §8)

**Goal:** Implement **Practice vs Test** behaviour, timings, and free-tier marking — overlaps **Task 5**; use this task for **pack rule compliance**, Task 5 for **product UX** (nav, paywall, buttons).

**Plan**

- [ ] **Start menu per mock:** Full / L / R / W / S; Practice vs Test stored on attempt; Mock 1 free, others locked (§8.1).
- [ ] **Mode table §8.2:** Time-up behaviour, back navigation, listening controls, speaking auto-record in test mode, results timing (section vs end).
- [ ] **Timings §8.3:** From `part_timings` settings, not hardcoded only.
- [ ] **Writing spell check §8.3:** Custom underline; disable browser autocorrect in box.
- [ ] **Scores & retakes §8.4:** L/R/W/S on mock row; history; 10-day retake reminder (setting).
- [ ] **Instruction text:** Paraphrased only — audit player copy (§8 intro).

**Suggested branch:** `sahil/task-13-mock-player-rules` · **Severity:** `P0` · see **Task 5**, **Task 6**

---

### Task 14 — AI evaluation spec (Build Pack §7)

**Goal:** Writing/speaking evaluation matches pack output and **audio-first** speaking.

**Plan**

- [ ] **Structured JSON §7.4:** Criteria, mistakes, rewrites, markup — not prose-only scores.
- [ ] **Writing §7.2:** Four criteria, word count 150–200, top 5 mistakes, two rewrites, rendered markup.
- [ ] **Speaking §7.3:** Score from **audio**; if text-only, mark pronunciation/rhythm/intonation not assessed.
- [ ] **Limits & queue §7.5–7.6:** Model version + cost on row; retention 14d free / 90d paid audio; student delete.
- [ ] **Reading/listening §7.1:** Key-based marking + conversion tables (no AI).

**Suggested branch:** `sahil/task-14-ai-evaluation` · **Severity:** `P0` · see `docs/remaining.md` N04–N07

---

### Task 15 — Locked-not-hidden + landing app frame (Build Pack §4.7)

**Goal:** Visitors see the **real app shell** on the landing page; paid areas show **lock + preview**; same React components as post-login.

**Plan**

- [ ] **Shared components:** Dashboard/sidebar preview frame uses `AppSideNav` (or same module), not a duplicate mock.
- [ ] **Every nav item opens:** Free works after sign-up; paid shows preview + plan to unlock.
- [ ] **Assistant bubble** on landing as in app (§4.7).

**Suggested branch:** `sahil/task-15-locked-preview-frame` · **Severity:** `P1`

---

### Task 16 — Course video, languages, secure playback (Build Pack §4.6, §13, N14)

**Plan**

- [ ] Language switch EN / हिन्दी / Punjabi **Soon**; Tamil/Gujarati line; **Section 1 free**, paid lessons **2-minute preview** then sign-up/paywall.
- [ ] **Position preserved** on language switch; choice remembered.
- [ ] **Short-lived playback URLs**; copied link fails off-domain (§13).
- [ ] Admin: mark Punjabi live without deploy when videos ready.

**Suggested branch:** `sahil/task-16-course-video` · **Severity:** `P1`

---

### Task 17 — Results, testimonials, reviews (Build Pack §4.8, §15.7)

**Plan**

- [ ] Landing **results** section: stats strip from records, before/after spotlight, 18 filterable cards, score rings (own design, not official report look).
- [ ] **Review form** + personal token link; admin **Reviews queue** (consent, proof redaction, publish rules).
- [ ] `/review` general link with spam traps; website vs Instagram consent separate.

**Suggested branch:** `sahil/task-17-results-reviews` · **Severity:** `P2`

---

### Task 18 — Payments, booking, admin ops (Build Pack §5.2–5.4, §14, §15)

**Goal:** Remaining **Phase 1 money and operations** rules from the pack (many items already partially built).

**Plan**

- [ ] **Stripe:** Webhook-only grant, idempotent `webhook_events`, refund → revoke, Stripe Tax/HST, Sprint renewal reminder + self-serve cancel (§5.2, §5.4).
- [ ] **Interac / manual grant §5.3:** Admin form → same purchase record as card.
- [ ] **Live batch §14:** Reserve card, charge at 3 seats, release at min-not-met, 8-seat cap, curriculum table on marketing.
- [ ] **1:1 / strategy call:** Cal.com ↔ Google two-way sync, holds, Zoom in email + app (N12).
- [ ] **Admin Today §15.1:** Implement triggers (test tomorrow, **both free AI buckets used** / warm upgrade moment, stalled, question >20h, etc.) when intake + usage data exist — not pack’s “3rd eval”.

**Suggested branch:** `sahil/task-18-payments-booking-admin` · **Severity:** `P0` · see `docs/remaining.md` N10–N12, N15

---

### Task 19 — Settings-driven product (Build Pack §13)

**Goal:** Amar changes **limits, timings, CRS points, prices, refund thresholds** in admin; app reflects within ~60s — not only `defaultSettings()` in code.

**Plan**

- [ ] Seed and read `settings`, `crs_points`, `part_timings`, `products` from DB.
- [ ] Settings audit log; checkout price from admin.
- [ ] Align with `docs/remaining.md` N02 global rules.

**Suggested branch:** `sahil/task-19-admin-settings-live` · **Severity:** `P1`

---

### Task 20 — Phase 2 scope (Build Pack §3, §9, §11–12) — track, do not block Phase 1

**Goal:** Explicit backlog so we do not mix Phase 2 into current PRs.

**Plan**

- [ ] **Defer:** KB-trained assistant (not in-memory starter), diagnose/prescribe/prove loop, performance charts, answer history, study plan PDF, coupons/referrals, cohort reporting, second coach (§3, §9, §11–12, §18).
- [ ] **Keep in repo:** stubs/routes documented in `docs/remaining.md` N16–N18.
- [ ] Revisit after Phase 1 tasks above and client sign-off.

**Suggested branch:** n/a (documentation / milestone) · **Severity:** `P3`

---

## Template (copy below each section)

```markdown
- [ ] **Area:** short title — steps to reproduce or what’s missing (`P1`) · branch: `sahil/...` · PR: #
```

