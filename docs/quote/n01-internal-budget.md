# Internal budget (N01)

This is an internal planning budget in the shape asked for by the build pack, so later scope changes stay line-item conversations. It is not a signed client quote. Labour dollars use assumption A1. If that rate is rejected, the total moves by the effort points times the difference.

Firm planning total: **45,600 CAD**

| Phase | Points | Subtotal |
| --- | ---: | ---: |
| Phase 1 | 48 | 38,400 CAD |
| Phase 2 | 6 | 4,800 CAD |
| Phase 3 | 3 | 2,400 CAD |
| Total | 57 | 45,600 CAD |

Phase 1 breakout, still inside the Phase 1 subtotal:

| Line | Tasks | Points | Amount |
| --- | --- | ---: | ---: |
| AI evaluation | N04, N05, N06, N07 | 15 | 12,000 CAD |
| Mock test player | N08, N09. The builder stays its own line. | 8 | 6,400 CAD |
| CRS calculator | N03, plus seeding and draws UI owned elsewhere | 3 | 2,400 CAD |
| Other Phase 1 | N01, N02, N10, N11, N12, N13, N14, N15 | 22 | 17,600 CAD |

## Task to line

Each Neeraj task is on exactly one line: N04-N07 AI evaluation, N08-N09 player, N03 CRS, and the other Phase 1 tasks on "Other Phase 1". N16 and N17 are Phase 2. N18 is Phase 3. Avinash and Sahil task packs are not in this repo, so they are not given a second line here. When those packs are priced, each of their IDs must be added once.

## Phase 3 uncertainty

N18 is fixed as one cohort report and a coach role. The dollar amount uses A1. It changes if the report needs a warehouse, or if coach permissions grow past notes, WhatsApp, sales, settings, refunds, grants, and calibration.

## Assumptions

1. Labour rate is 800 CAD per effort point (A1). Affects every line. If the rate is different, multiply the points by the new rate.
2. Extend the current Next.js app. Affects N02. A rebuild would reprice Phase 1.
3. Payments: Stripe hosted Checkout, Stripe Tax, CAD. Affects N10 and N11. A different provider changes the tax and webhook work.
4. Booking: hosted Cal.com. It reads Google busy times and writes events we create. It does not email students when someone edits the event only in Google Calendar or Zoom. Affects N12. See `docs/runbook/calendar-sync.md`.
5. Video: Cloudflare Stream or Mux, signed playback, direct upload. Affects N14. The host account is in the owner's name.
6. Speaking model: one audio-capable model on the same vendor as writing, on terms that do not train on customer audio. Affects N05 and the AI cost line.
7. Transactional email is a later task. This budget does not include its monthly plan.
8. Analytics stay cookieless. Affects the running-cost line, not engineering, until a tool is chosen.
9. Hosting region is the Supabase project region, Canadian if the owner's project is created there.
10. Paraphrased instructions, question labels, testimonial consent, and legal review are separate tasks and are not inside these engineering lines.
11. Organisation accounts, native apps, batch homework upload, and immigration-advice features are out of scope.
12. Course instalments are an optional later line, not part of the 199 CAD course.

## Rates

- Out of scope: 800 CAD per day (assumption A1, one day treated as one point).
- After launch: 1,600 CAD per month for up to one day of bug fixes. Extra days use the out-of-scope rate.

## Running costs to check on the provider page

These are not part of the 45,600 CAD build total.

| Service | Indicative | Source |
| --- | --- | --- |
| Vercel Pro | 20 USD per member per month | vercel.com/pricing |
| Supabase Pro | 25 USD per month | supabase.com/pricing |
| Google Workspace | about 9.20 CAD per month on the annual plan, as the spec states | spec §16.4, check current pricing |
| Stripe | 2.9% + 0.30 per successful card charge | stripe.com/en-ca/pricing |
| Cal.com | hosted plan, check cal.com/pricing | cal.com/pricing |
| Cloudflare Stream or Mux | check the host's pricing page | developers.cloudflare.com/stream/pricing |
| AI | see below | platform.openai.com/docs/pricing |

## AI cost method

Not a live sample. A writing call is estimated at about 2,000 input tokens and 800 output tokens. A 90 second speaking call adds audio. Using the settings price table (`ai.price_table`) the stored `cost_cents` is `round(input tokens × input price + output tokens × output price + audio seconds × audio price)`. The spec's rough band is 5 to 15 cents per evaluation. 200 evaluations in a month at that band is about 10 to 30 CAD, which is the comparison point for the 5 CAD per paying student target. Re-measure on 3 writing answers and 3 recordings before treating the cents as final.

## Timeline

No calendar launch date. Sequence only.

| Milestone | What is demonstrable | Duration |
| --- | --- | --- |
| M1 | CRS value edited in admin and visible on a phone | weeks 1-2 |
| M2 | Settings, entitlements, preview deploys | weeks 1-3 |
| M3 | Test card buys the course | weeks 3-5 |
| M4 | Video upload and language switch | weeks 4-6 |
| M5 | A real recording returns a practice estimate | weeks 4-7 |
| M6 | Mock timings and time-up rules | weeks 5-8 |
| M7 | Third reservation confirms a batch; calendar move emails the student | weeks 7-9 |
| M8 | Lesson sandbox reports start, drill, finish | weeks 8-10 |
| M9 | Assistant handover and one prescription with before and after | weeks 10-12 |

## Warranty and references

Bugs in delivered behaviour are fixed for 30 days after the production handover of that milestone.

References are not invented here. Add two projects that took payments and stored user content before this budget is shown outside the team.

## Questions

| Question | Status |
| --- | --- |
| Is this an internal budget? | Answered: yes, in the full format, using assumption A1. |
| Is the mock builder inside the player line? | Answered: no. N08 and N09 are the player. The builder is separate. |
| Which payment, video, and booking tools? | Assumption: Stripe, Cloudflare Stream or Mux, hosted Cal.com. |
| AI cost measured on samples? | Open. Method above stands until three writing and three speaking samples are run. |
