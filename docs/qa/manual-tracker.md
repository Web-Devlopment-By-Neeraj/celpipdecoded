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

- [ ] *Home page "Choose how you prepare" prices are stale:* the landing section still shows "Free preview / $299 live classes / From $5 packages", while `/pricing` sells Test Sprint $49, Decoded Course $199 and so on. Styling was updated in Task 3a; the **content** needs the real plans from Task 10 (`P1`) · branch: `sahil/task-10-pricing-copy`

- [ ] *Home page "Live classes" section also shows $299 per month:* confirm with Amar before launch (`P2`) · branch: `sahil/task-10-pricing-copy`

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

### Task 3a — Client UI parity + perfected dark mode ✓ built

**Goal:** Align **basic UI** with client mockups / Build Pack (spacing, typography, component polish) and **re-enable dark mode properly** — especially **landing/hero** (client: hero dark mode was wrong; dashboard dark was closer). Do this as one focused pass when you have mockups in hand.

**Plan**

- [x] **UI audit:** Landing, auth, dashboard shell vs client references. Findings and fixes are in [`DESIGN.md`](../../DESIGN.md) §12. One emerald primary button (app was navy), cards `rounded-2xl` / panels `rounded-3xl`, headings bold, navy sidebar, light hero.
- [x] **Dark mode:** Re-enabled with a new implementation, not the old commented block. `data-theme="dark"` on `<html>`, set before first paint by the boot script in `layout.tsx` (`localStorage["celpip-theme"]`, no flash). Text variables flip so every opacity step keeps its hierarchy; surfaces get explicit dark values in `globals.css`. `ThemeToggle` is in the app top bar, the mobile More sheet and the public header; all switches stay in sync.
- [x] **Hero + marketing:** Hero is now light (client mockup direction) with a navy proof card, so dark mode has no inverted sections. Teal eyebrows on navy sections switched to mint for contrast.
- [x] **Dashboard + app:** Light and dark checked on desktop and a 390px phone, signed in. The mock player stays light in dark mode: `ExamModeViewport` carries `data-theme-scope="light"` and every dark rule excludes it and `[data-mock-test-player]` (checked on `/dashboard/mock-tests/mock-test-1/reading` with dark on).
- [x] **QA (local):** Toggle works, choice survives reload, no flash of the wrong theme, `theme-color` meta follows the theme, PWA manifest unchanged.
- [ ] **QA on staging:** Repeat the pass above on a real phone (iOS Safari + Android Chrome, installed PWA) once merged.

**Suggested branch:** `sahil/task-3a-ui-dark-polish` · **Severity:** `P2`

---

### Task 3b — Design guide (`DESIGN.md`) ✓ built

**Goal:** One written source for colours, type, spacing, radii, components, mobile and dark-mode rules, so new screens stop drifting.

- [x] [`DESIGN.md`](../../DESIGN.md) at the repo root: principles, light + dark palette, score colours, type scale, layout rhythm, radii, elevation, buttons/cards/forms/nav/testimonials/icons, mobile + PWA rules, dark-mode rules, motion, the mock player exclusion rule, do/don't, and the audit summary.
- [x] Tokens updated to match: `design-tokens.ts` (primary = emerald, `radius.card = rounded-2xl`, `radius.feature`, bold `text.heading`), `globals.css` (`navy-panel`, `brand-mint`, `score-high/mid/low`, motion keyframes).
- [x] Sweep across app screens: `rounded-3xl` cards → `rounded-2xl`, `font-semibold` headings → `font-bold`. Mock test player, mock-test components and dialogs excluded.
- [ ] Team review: Amar / client sign-off on the guide before Task 8 landing rebuild.

**Suggested branch:** `sahil/task-3a-ui-dark-polish` (same PR as 3a) · **Severity:** `P2`

---

### Task 3c — Mobile PWA navigation (bottom tab bars) ✓ built

**Goal:** The installed app should feel native on a phone: thumb-reach navigation, safe areas, no drawer hunting.

- [x] **Signed in tab bar** (`AppMobileTabBar` → shared `MobileTabBar`): Home, Mocks, Speaking, Writing, More. Active tab gets an emerald pill and `aria-current`. Hidden from `lg`, where the navy sidebar takes over.
- [x] **More sheet** (`AppMobileNav`, now a bottom sheet): account email + Sign out, Courses, Live classes, Dark theme, Take a tour. Escape / backdrop close it, body scroll locks, focus moves in. The avatar in the top bar opens the same sheet.
- [x] **Top bar on phones:** logo, theme switch, avatar. Hamburger removed. Sticky, translucent, pads under the notch.
- [x] **Public tab bar** (`PublicMobileTabBar`): Home, Results, CRS, Pricing, Sign in (Dashboard when signed in). Rendered by `LandingHeader`, so every public page has it.
- [x] **Public pages get header + footer:** `/crs`, `/draws`, `/pricing`, `/results`, `/courses`, `/diagnostic`, `/ask`, `/book`, `/blog`, `/account`, `/legal/*` via a `layout.tsx` → `PublicPageFrame` (page files unchanged except the old ad-hoc pricing header).
- [x] **Safe areas + spacing:** `viewportFit: "cover"`, `env(safe-area-inset-*)` on bars and sheets, page bottom padding and the AI assistant button lift above the bar automatically (`data-mobile-tab-bar` / `data-assistant-bubble`). Assistant shows as an icon on phones.
- [x] **Tests excluded:** no tab bar or padding on exam-mode routes or whenever a test overlay is on screen.
- [x] Product tour copy updated for the bottom bar and More.
- [ ] **QA on staging:** installed PWA on iPhone (home indicator gap) and Android; tour steps land on the tab bar items.

**Suggested branch:** `sahil/task-3c-mobile-tab-bar` · **Severity:** `P1`

---

### Task 3d — UI fixes round (scroll landing, live classes row, logo, breadcrumbs, player buttons) ✓ built

**Goal:** Fix the inconsistencies found while reviewing 3a–3c on desktop and on an iPhone 12 Pro viewport.

- [x] **Pages land in the right place:** every in-page link (`/#program`, `/#results`, `/#live-classes`, `/#pricing`, Request class schedule → `#inquiry`) now stops with the section top exactly under the sticky header. There is one offset for the whole site (`scroll-padding-top` on `html` in `globals.css` = header height + 1px border + notch inset) instead of mixed `scroll-mt-20` / `scroll-mt-16` / `:target` values. The `:target` rule did not apply on client-side hash changes. Checked on desktop 1280, tablet 820 and phone 390: direct load, link from another page, link on the same page.
- [x] **Mobile menu no longer shifts the page:** the public header's dropdown menu now floats over the page instead of pushing it down, so tapping a section link from the menu no longer lands too far down when the menu closes.
- [x] **Page tops are consistent:** every public page starts 40px under the header (`/pricing`, `/results` and `/crs` were 64px, 64px and 32px). Pricing content lines up with the header logo.
- [x] **Live classes:** `$299 per month` and **Request class schedule** share one row (button on the right). On narrow phones the button wraps under the price.
- [x] **Hero Decode · Practice · Succeed:** same line above the headline as before, now in the eyebrow green (`BrandPromiseTagline tone="brand"`, `text-brand`, same as "Real student results"). No logo in the hero.
- [x] **Hero headline:** now reads "You're not bad at English. You just don't know how CELPIP wants you to answer." as one `h1` in two lines of weight: the reassurance in large navy, the answer below it in smaller brand green. Both lines use balanced wrapping, so there are no one-word last lines at 390px or 1280px. The old support paragraph under the headline was removed because it repeated the new second line. Copy lives in `brandCopy.heroHeadline` / `heroHeadlineAnswer`. Checked light and dark.
- [x] **Public header logo:** "CELPIP Decoded" moves up with the three words in small caps under it (`CelpipDecodedLogo showPromiseBelow`, compact 8px line). Signed in (menu button only), phones from 380px get the full lockup. Signed out, the **Get started** button needs more room, so the three words show from 410px. Narrower phones get the plain logo and under 360px just the mark, so the header buttons never overlap it (at least 21px gap at every width). Footer lockup unchanged.
- [x] **No duplicate Dashboard button on phones:** the signed-in **Dashboard** button in the public header only shows from `lg` (1024px) up. Below that the bottom tab bar already has Dashboard, so the header is just the logo and the menu.
- [x] **Dashboard sidebar logo:** plain logo (no words), set in a 64px row so its centre lines up exactly with the top bar (both at 32px).
- [x] **Writing / Speaking practice:** breadcrumb removed on `/dashboard/writing` and `/dashboard/speaking` (they already have **← Back to dashboard**). Deeper pages (attempts, results) keep the breadcrumb.
- [x] **Mock test player, buttons only:** **Back** was rendered twice (top bar and bottom bar) on every screen. It now appears once, next to **Next** in the top bar. On a phone the bar is always title, then timer and screen count, then a full-width row with Back on the left and Next on the right; on desktop Back and Next sit together at the top right. The bottom bar only shows when a screen has its own extra action. Mock Test 1 complete screen: removed the second "Back to Mock Test 1" button (top bar Back already goes there). Everything else in the player is unchanged.
- [ ] **QA on staging:** listening, reading, writing and speaking sections on a real phone: one Back, Back and Next on the same row on every screen.

**Suggested branch:** `sahil/task-3d-ui-fixes` · **Severity:** `P1`

---

### Task 4 — Disable dark mode for now (comment out)

**Goal:** **Turn off** dark mode in the product until hero/landing polish is done. Client note: **hero dark mode is bad**; **dashboard dark mode is acceptable** — revisit in **Task 3a**.

**Plan**

- [x] Comment or gate: `ThemeToggle` in `LandingHeader` / `AppTopNav`, inline theme script in `layout.tsx`, and **`html[data-theme="dark"]` rules** in `globals.css` (force light on load).
- [x] Confirm signed-in dashboard stays usable in **light** mode only.
- [x] Leave PWA/manifest as-is unless toggle removal affects icons only.

**Superseded by Task 3a:** dark mode is back on with the new implementation; the commented-out block was removed.

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
- [x] Follow-up (Task 3d): Back is shown once per screen, beside Next in the top bar. It is no longer repeated in the bottom bar.

#### Task 5e — Full mock: no break between sections

- [x] The 30 Oct handover removes the "Prepare for Reading" break. A complete test goes straight to the next section. The 10 second pause that stays is the Listening preparation pause between conversation sections (L-04).

#### Task 5f — “Move to next section” at section end

- [x] Explicit **Move to next section** button when a section completes (full mock path).

#### Task 5g — After Mock Test 1: “Next mock test” + payment popup

- [x] On **last screen** of completed free mock, **Move to next mock test** → **plan upgrade / payment modal** (`PlanUpgradeDialog`). Mock Test 2 hub gated with upgrade CTA.

**Suggested branches:** `sahil/task-5a-mock-copy`, `sahil/task-5b-mock-nav`, … or one epic `sahil/task-5-mock-tests` if small enough · **Severity:** `P0`–`P1` (large)

---

### Task 6 — Mock Test builder (Amar / client)

**Goal:** The client uploads a content file. A clean file becomes a draft. Publish puts it on the student Mock tests screen as Mock Test 2, 3, and so on, and the student sits it in the same exam screens as Mock Test 1.

**Plan**

- [x] **Upload, not a form.** `/dashboard/admin/mock-tests` downloads a CSV template and uploads it. Example rows are ignored. The checklist names problems such as a missing correct answer or an empty option, and a file with an error is not saved. A clean file is a draft. Publish is a separate button. The step-by-step section, part and question forms were removed.
- [x] **Same exam as Mock Test 1.** A published test plays through the Listening audio exam, the Reading split page, the Writing editor and the Speaking recorder. The five instruction videos are the shared clips. Repeated part instructions stay in the app. The file supplies the passage, the clip, the picture, the task and the questions. Answer keys are loaded only when the section is marked.
- [x] **Hub.** `mock-test-1` stays the built-in free test. `mock-test-2` and later replace the coming-soon cards for students with Test Sprint.
- [ ] **QA, signed in:** Download the template, upload a small file, confirm the checklist blocks a missing answer, publish a clean draft, and sit Listening, Reading, Writing and Speaking as a Test Sprint student. Tick this after that pass, including once the branch is on staging.

**Suggested branch:** `sahil/task-6-mock-builder` · **Severity:** `P1`

---

### Task 6b — Mock Test 1 handover (30 Oct 2026)

**Goal:** Mock Test 1 matches Amar's handover. The same screens are the template for Mock Test 2 and later. Final copy is used word for word.

**Plan**

- [x] **Complete test.** Time running out moves to the next screen. Back sits beside Next and returns to the previous screen. The first screen still has Back to mock test. Part-complete and task-complete screens are skipped. There is no "Prepare for Reading" break. Listening audio and the discussion video play once, without a pause or seek bar. Audio-only screens move on when the clip ends. Instructional videos can be skipped and move on when they end. Speaking recording starts when preparation ends, and the next task starts when recording time ends.
- [x] **One section.** The same timers run, then this banner stays until Next: "Time is up. In the real test, the screen moves on by itself at this point. You are practicing one section, so you can take a moment and click Next when you're ready." Pause, replay and Back stay available.
- [x] **Headings and instructions.** Grey bar uses `Mock Test N - Section / Part / Task`, including the official part and task names. Instruction screens drop the repeated name and stats row. Listening, Reading, Writing and Speaking use the approved extra lines. Instructional videos use the celpip.ca caption. Listening Part 4 starts at 4:00 and Part 5 at 5:00. The Listening pause between conversation sections is 10 seconds. Speaking Task 5 instructions are generic.
- [x] **Hub and details.** Mock tests headline and card lines match the free, locked and paid copy. A card on `/dashboard/mock-tests` opens that mock's details. The buttons on the details page start the test. Mock Test 1 and a published test both use "Before you start". Complete test opens on the Overview Video. After one-section Writing, Continue to Speaking. After Speaking, and after the complete-test summary, Go to Mock Test 2. Breadcrumbs name the mock and Complete test.
- [x] **Review screens.** The AI wait shows a moving step. Result cards use a dark header, a large level, and red and green boxes for the mistake pair. Evaluation prompts forbid the em dash, and any em dash in the reply is replaced before it is shown.
- [ ] **Saved attempts (G-07) and the progress hub (D-01).** Attempts, scores, writing text, speaking audio, resume, and the progress cards are not stored yet. A closed tab still loses an in-progress test. Do not tick this until a student can log out and still open the result, the text and the audio. The "saved until you upgrade" line on the details page is Amar's approved copy and is ahead of this save.
- [ ] **QA, signed in:** Sit Mock Test 1 as a complete test only long enough to confirm the overview video, one Listening question auto-advances, Back returns to the previous screen, and the playbar is hidden. Then sit Listening as one section and let a short timer hit 0:00. Confirm the banner and that Next still works. From the mock list, open a card and confirm the test starts only from a button on the details page. Tick this after that pass, including once the branch is on staging.

**Suggested branch:** `sahil/task-6b-mock-handover` · **Severity:** `P1`

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

- [x] Landing **results** section: stats strip from records, before/after spotlight, 18 filterable cards, score rings (own design, not official report look). Built as `ResultsSection` right after the hero (proof row in the hero links to it) and a full `/results` page with filters (All, CLB 9+ in all four, Big jumps, First attempt). Data in `src/features/testimonials/testimonials.ts`; stats are computed (18 shown, 10 with CLB 9+ in all four, 4 with a 12, biggest jump Dawinder Reading 6 → 10) and covered by `testimonials.test.ts`. On phones the home wall is a swipe row.
- [ ] **Before production (`P0`):** written **website consent** from every student on the wall (Build Pack §4.8). Until then the section is demo content.
- [ ] **Client to confirm scores** flagged in the pack: **Nikhil** and **Gurnoor**. Edit `testimonials.ts` only; the stats update themselves.
- [ ] Confirm the **"100+ students coached to CLB 9+"** headline claim with Amar (`RESULTS_HEADLINE`).
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

