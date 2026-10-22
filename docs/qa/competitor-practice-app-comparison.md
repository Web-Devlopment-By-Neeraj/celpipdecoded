# CELPIP Decoded vs reference practice app — feature comparison

**Purpose:** Help the team decide what to build next. We keep **CELPIP Decoded** design, voice, and our own plans on `/pricing` (Test Sprint, Decoded Course, Live Batch, Private 1:1). We do **not** copy a competitor’s pricing bundle or brand.

**Reference reviewed:** A major CELPIP practice web app (logged-in product tour, Oct 2026). The competitor’s name and URL are **not** stored in this repo.

**How to use this file**

1. Read the **Quick picture** and **Intentionally out of scope** sections first.
2. Go through **Decision checklists** and tick what you want: `- [ ]` → `- [x]`.
3. Add notes under any row (owner, branch name, ticket).
4. When you pick items, open one branch from `staging` (e.g. `sahil/performance-page`) per chunk of work.

---

## Quick picture (plain language)

| | **CELPIP Decoded (us)** | **Reference app (them)** |
|---|---|---|
| **Main promise** | Instructor-led method + AI practice + real-format mocks (Amar / CLB 10+ story) | “All-in-one” practice platform — mocks, courses, and one paid tier |
| **How you pay** | **Separate products:** Sprint subscription, one-time course, batch, 1:1 (see `/pricing`) | **One big pass:** about **CA$297 once** for **3 months** of bundled access |
| **AI feedback** | **Counted attempts** (1 free, then paid/monthly cap on Sprint) | Instant writing/speaking scores in paid tier; **human teacher** feedback uses **credits** |
| **Mock tests** | Strong **Mock Test 1** engine (listening/reading/writing/speaking); more mocks need Sprint entitlement | **26+** full mocks listed; exam hub with continue/start |
| **Courses** | **Section exists**; client will supply videos. Today: languages + “Lesson 1” **copy only**, no video player on the page yet | Full **course library** (free intro course, skill courses paid) with sections |
| **Live teaching** | Marketing for **live classes** + book flow; **not** built-in group classroom in the app | **Group classes** (daily live, “My Class” tab, seat saving) |
| **Growth** | **Exit-intent** 15% off (`leave15`) on pricing; **plan upgrade modal** on paid CTAs | Upgrade modal + “Maybe later” discount step; **referral program** |
| **Progress** | Dashboard summary, **badges**, attempt history, usage card | Dedicated **Performance** page (CLB-style cards, radar, trends, exam stats) |

---

## Intentionally out of scope (for now)

These are **deliberate “no”** items unless the client changes direction. Do not treat them as bugs.

- [ ] **In-app group / live group classes** (their “Group Classes”, “My Class”, daily live seats). We may still **market** live programs and **book** via Cal.com / sales, but **not** replicate their classroom product inside the app right now.
- [ ] **Copy their single CA$297 / 3-month bundled pass** as our pricing model. We keep **our** Stripe products and copy on `/pricing`.
- [ ] **Rebrand or clone** their landing visuals or “vs expensive coaching” **word-for-word**. We can adopt the **idea** (comparison section) in **our** voice and design.
- [ ] **Human teacher feedback credits** unless product explicitly adds a human review pipeline.
- [ ] **Referral payouts via Interac** with lifetime commission **unless** legal/finance approves a referral program.

*(Add more “intentional nos” here as the client decides.)*

---

## Things we liked on the reference app (your notes → build candidates)

### A. Upgrade popup + “maybe later” offer

**Shipped on CELPIP Decoded (Oct 2026):**

- `PlanUpgradeDialog` + `PlanUpgradeButton` — before checkout, shows **plan name, CAD price, billing note, and benefit bullets** (`src/features/pricing/plan-upgrade-copy.ts`).
- Wired on **course lock**, **`/pricing`**, **`/book`**, **usage card** (“Choose a plan”), and **AI attempt limit** states.
- **Maybe later** opens a second step with **15% off** (`leave15`) checkout or link to `/pricing?offer=leave15`.
- Landing **exit-intent** offer remains (`LeaveOfferDialog`).

| Decision | Item | Status |
|---|---|---|
| - [x] | **Modal when user clicks a paid / locked action** | Shipped — per-product copy, pay with card from modal |
| - [x] | **“Maybe later” second step with discount** | Shipped — `leave15` step |
| - [ ] | **Logged-in “what’s included” hub page** | Not built — `/pricing` + modal cover most cases |
| - [x] | **Feature bullets inside the modal (not only price)** | Shipped |

### B. Performance page + badges

Reference **Performance** area: CLB-style skill cards, skills radar, score trends, exam history totals.

We already have:

- **Badges** (DB + speaking/writing award on feedback).
- Dashboard: progress overview, badge preview, recent feedback, module grid.
- Attempt histories for speaking/writing.

| Decision | Item | Notes |
|---|---|---|
| - [ ] | **`/dashboard/performance`** (or similar) | One place for “how am I doing?” |
| - [ ] | **Four-skill overview** (L/R/W/S) | Use **practice estimates** and mock section scores where we have data; label clearly as **not official CELPIP/CLB**. |
| - [ ] | **Charts** (trend line, simple radar) | Start with mock + AI attempt data we already store. |
| - [ ] | **Badge gallery** on performance page | Tie badges to attempts and dates; link to attempt detail. |
| - [ ] | **Exam history block** (like their dashboard cards) | Mock Test 1 completions + section scores when available. |

### C. Referral page

Reference **Referral** flow: personal link, copy, WhatsApp share, payout details, commission on subscriptions.

| Decision | Item | Notes |
|---|---|---|
| - [ ] | **Referral link** per user | Needs DB + attribution on signup/checkout. |
| - [ ] | **Discount for friend** (e.g. % off first purchase) | Stripe coupon or custom checkout metadata. |
| - [ ] | **Reward for referrer** (credit, cash, %) | Legal/tax review before copying lifetime commission models. |
| - [ ] | **Share UI** (copy, WhatsApp) | Lightweight; no payout until policy exists. |

### D. Landing page — “better than expensive coaching”

Reference marketing: strong **value vs traditional coaching** framing before login.

We already have:

- Hero (“You’re not bad at English”), program sections, live classes block, pricing CTAs, early-access form, CRS in header, community (“Codebreakers”).

| Decision | Item | Notes |
|---|---|---|
| - [ ] | **Dedicated comparison section** (coaching vs self-serve vs us) | Table or cards: cost, flexibility, what’s included; **our** numbers from `/pricing` and live class copy. |
| - [ ] | **Social proof** (instructor CLB 10+, method) | We already lean on Amar; add testimonials when client provides them. |
| - [ ] | **Clear “start free” vs “upgrade”** path | Align with 1 free AI report + Mock Test 1 free. |

---

## Course videos (client content)

**Our status today**

- Routes: public `/courses`, signed-in `/dashboard/courses`.
- UI: English / Hindi **live**, other languages “Soon”.
- **Lesson 1** is a **placeholder** (title + short text). Playback API exists (`authorizePlayback`: full vs **2-minute preview**), but **no embedded player / lesson list** wired to client videos yet.

**Reference app**

- Course hub with multiple programs (intro course **free**, skill courses **paid**), each with **section counts** and deep links.

| Decision | Item | Notes |
|---|---|---|
| - [ ] | **Lesson list + video player** on course page | Client uploads or hosts videos; we need `lessonId`, language, duration, published flag (see `LessonVideo` in code). |
| - [ ] | **Free preview** (e.g. first 2 minutes) for locked users | Already specified in playback logic; wire UI. |
| - [ ] | **Unlock on `course` purchase** | Already tied to `course_videos` entitlement. |
| - [ ] | **Multi-lesson curriculum** (not only “Lesson 1”) | Admin or CMS later; start with Lesson 1 + expand. |
| - [ ] | **Course structure by skill** (Listening, Reading, Writing, Speaking) | Content decision with client, not necessarily same titles. |

---

## Full feature matrix

Legend: **Yes** = shipped in a meaningful way · **Partial** = started or marketing only · **No** = not in our app · **N/A** = we chose not to offer it.

| Area | Feature | CELPIP Decoded | Reference app |
|---|---|---|---|
| **Auth** | Email / password | Yes | Yes |
| | Sign in with Google | No | Yes |
| | Forgot / reset password | Yes | Yes |
| **Landing (logged out)** | Marketing home | Yes | Yes |
| | Program / pricing story | Yes | Yes |
| | “Vs expensive coaching” comparison | Partial (story, not a sharp comparison block) | Yes (strong positioning) |
| | Exit / leave discount | Yes (`leave15`) | Yes (modal / later flow) |
| **Dashboard** | Home dashboard | Yes | Yes |
| | Mobile bottom nav | No (sidebar + top nav) | Yes |
| | Onboarding “Start here” | Partial (product tour) | Yes |
| | Personalized study plan | No | Yes |
| | Notifications center | No | Yes |
| | User support tickets | No | Yes |
| **Practice** | Speaking timed + record | Yes | Yes |
| | Writing timed | Yes | Yes |
| | AI feedback / scores | Yes (attempt limits) | Yes (instant in paid tier) |
| | Human teacher feedback | No | Yes (credit-based) |
| **Mock exams** | Full mock test experience | Yes (Mock Test 1, exam player) | Yes |
| | Many mock tests (20+) | Partial (gated by Sprint) | Yes (26+ marketed) |
| | Exam list + continue | Partial | Yes |
| | Section scores on dashboard | Partial | Yes |
| **Courses** | Video course library | Partial (placeholder) | Yes |
| | Free + paid course tiers | Partial (lock + preview) | Yes |
| **Live learning** | Group classes in app | **Intentionally no (for now)** | Yes |
| | Book / schedule live (sales) | Partial (`/book`, landing) | Yes (classes + seats) |
| **Progress** | Badges | Yes | Yes (different layout) |
| | Performance / analytics page | No | Yes |
| | Attempt / exam history | Yes (per module) | Yes (aggregated) |
| **Tools** | CRS calculator | Yes (`/crs`) | Yes (paid extras: PR score reports) |
| | Express Entry / draws info | Yes (`/draws`) | Not emphasized in tour |
| **Monetization** | Stripe checkout | Yes | Yes |
| | Multiple products | Yes (4 products) | One main bundled pass |
| | Referral program | No | Yes |
| | Upgrade modal at point of need | **Yes** | Yes |
| **Product** | PWA | Yes (production) | Unknown |
| | Dark mode | Yes | Unknown |
| | Floating AI assistant | Yes | Not seen in tour |
| | Admin mock test builder | Yes | Unknown |
| **Community / brand** | “Codebreakers” community story | Yes (marketing) | Different community framing |

---

## What we have that they de-emphasize (or we do differently)

Worth keeping in our story:

- [ ] **Instructor-led method** (Amar, CLB 10+, “decode the question”) — not just “unlimited tests”.
- [ ] **Honest AI labeling** — practice estimate, not official CELPIP score (already in brand copy).
- [ ] **Mock test player** fidelity (exam-mode UI, timers) — deep investment in `mock-test-1`.
- [ ] **Admin mock test builder** for content team.
- [ ] **Separate products** for “AI practice only” vs “full course” vs live batch / 1:1 (clearer for some buyers than one bundle).
- [ ] **Ask Amar** / program inquiry form on landing.
- [ ] **Blog / draws / diagnostic** routes (check if still needed for SEO and funnel).

---

## Our plans vs features (reference for copy and modals)

Prices from `DEFAULT_PRODUCTS` in code. Modal text lives in `src/features/pricing/plan-upgrade-copy.ts`.

| Plan | Price (CAD) | What it unlocks in the app today |
|---|---|---|
| **Free account** | $0 | Practice without AI; **1** free scored AI report; **Mock Test 1**; course **preview** only. |
| **Test Sprint** (`sprint`) | $49 / month (subscription) | Up to **40** scored AI attempts per period; **all mocks** entitlement; attempt **history**. Does **not** unlock full course videos. |
| **Decoded Course** (`course`) | $199 one-time | **Course videos** entitlement (no expiry) + **3 months** of Sprint-style AI/mock benefits bundled. |
| **Live Batch** (`batch`) | $99 one-time | Purchase recorded; **no extra in-app feature flags** wired yet — operational / sales fulfillment. |
| **Private 1:1** (`private_1to1`) | $49 one-time | Same as batch — payment + fulfillment, not a software feature bundle today. |

Their **single bundled pass (~CA$297 / 3 months)** is different packaging. Our upgrade modal explains **our** rows above, not their price.

---

## Suggested build order (remaining “liked” items)

1. **Performance page + badges** (uses existing data).
2. **Course video player + Lesson 1** when client delivers files.
3. **Landing comparison section** (content + design; no new backend).
4. **Referral program** (needs legal + Stripe rules).
5. **Logged-in “what’s included” page** (optional; modal + `/pricing` may be enough).

---

## Decision log (fill in after review)

| Date | Decision | Owner | Branch / ticket |
|---|---|---|---|
| Oct 2026 | Plan upgrade modal + maybe-later 15% step | — | QA gap / plan upgrade dialog |
| | | | |

---

## Security note

Do **not** store competitor login credentials in this repo or in git history. Use a password manager for shared QA accounts.
