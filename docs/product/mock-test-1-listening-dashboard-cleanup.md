# Mock Test 1 Listening Dashboard Cleanup and Part 1 Key Security (EXAM-15A)

Two changes, both cleanup after EXAM-15.

1. The learner dashboard now shows one Mock Test 1 card, for the full
   Listening test, instead of nine internal preview cards.
2. The Listening Part 1 route no longer sends its answer key to the
   browser.

House style note: normal hyphens only, no long hyphens or em dashes.

---

## 1. Dashboard card changes

### Before

`src/components/exam/ExamShellPreviewLink.tsx` rendered nine dashed cards
in a two column grid, each one headed "Internal preview":

| Card title | Route |
| --- | --- |
| Practice Test Screen Shell Preview | `/dashboard/mock-tests/shell-preview` |
| Practice Test Instruction Screens Preview | `/dashboard/mock-tests/instruction-preview` |
| Mock Test 1 Listening Part 1 Prototype | `/dashboard/mock-tests/mock-test-1/listening/part-1` |
| Mock Test 1 Listening Part 2 Prototype | `/dashboard/mock-tests/mock-test-1/listening/part-2` |
| Mock Test 1 Listening Part 3 Prototype | `/dashboard/mock-tests/mock-test-1/listening/part-3` |
| Mock Test 1 Listening Part 4 Prototype | `/dashboard/mock-tests/mock-test-1/listening/part-4` |
| Mock Test 1 Listening Part 5 Prototype | `/dashboard/mock-tests/mock-test-1/listening/part-5` |
| Mock Test 1 Listening Part 6 Prototype | `/dashboard/mock-tests/mock-test-1/listening/part-6` |
| Mock Test 1 Full Listening Section | `/dashboard/mock-tests/mock-test-1/listening` |

Every card's description ended in "Temporary link for internal review."
The one card that mattered to a learner was last in the list and dressed
identically to the eight build steps above it.

### After

`src/components/dashboard/DashboardMockTestCard.tsx` renders one card,
under a "Mock tests" section heading:

| Field | Value |
| --- | --- |
| Title | Mock Test 1 - Listening Test |
| Route | `/dashboard/mock-tests/mock-test-1/listening` |
| Description | Complete the full Listening section with instructions, all 6 parts, answer review, and practice score. |
| Metadata | Listening / 6 parts / 38 questions |
| Status pill | Available |
| Action | Start Listening test |

It is styled as a real practice module card rather than an internal note:
solid `AppCard` panel, `AppStatusBadge` for the status, `AppButtonLink`
for the action, and the same primitives `DashboardModuleGrid` uses. There
is **no Internal preview badge and no "Prototype" in the title**.

The prototype caveats did not disappear. They moved to where they belong,
which is the standing notice on the route itself: nothing is saved, media
can be replayed, the timer is static, and the practice score is not an
official CELPIP score. The dashboard section description also says
answers are held for one visit and nothing is saved yet.

Card wording lives in `listeningCopy` in
`src/features/exam-engine/listening-copy.ts`, in a new
`fullSectionCard*` block, beside the `fullSectionPreview*` strings the
route heading still uses.

`ExamShellPreviewLink.tsx` was deleted. It had no other caller.

---

## 2. Which links were hidden

All eight of these lost their dashboard card:

- `/dashboard/mock-tests/shell-preview`
- `/dashboard/mock-tests/instruction-preview`
- `/dashboard/mock-tests/mock-test-1/listening/part-1`
- `/dashboard/mock-tests/mock-test-1/listening/part-2`
- `/dashboard/mock-tests/mock-test-1/listening/part-3`
- `/dashboard/mock-tests/mock-test-1/listening/part-4`
- `/dashboard/mock-tests/mock-test-1/listening/part-5`
- `/dashboard/mock-tests/mock-test-1/listening/part-6`

Nothing was deleted to hide them. There is no redirect, no feature flag
and no `notFound()`. The cards were the only link to any of them, so
removing the cards is what makes them unlisted, and each one already
carries `robots: { index: false, follow: false }`.

---

## 3. Routes preserved for developer testing

Every route above still builds and still serves. From `npm run build`:

```
/dashboard/mock-tests/instruction-preview
/dashboard/mock-tests/mock-test-1/listening
/dashboard/mock-tests/mock-test-1/listening/part-1
/dashboard/mock-tests/mock-test-1/listening/part-2
/dashboard/mock-tests/mock-test-1/listening/part-3
/dashboard/mock-tests/mock-test-1/listening/part-4
/dashboard/mock-tests/mock-test-1/listening/part-5
/dashboard/mock-tests/mock-test-1/listening/part-6
/dashboard/mock-tests/shell-preview
```

They stay the way to check one part in isolation: a part route shows its
own answer review, practice score and end of part screen, which the full
section run deliberately does not do between parts.

They are still protected. Each sits under `/dashboard`, where the layout
auth guard covers it, and each page verifies the session again close to
the content.

The list of preserved routes is repeated as a comment at the top of
`DashboardMockTestCard.tsx`, so the next person to touch that file can
see what used to be linked from it.

---

## 4. Part 1 security issue fixed

### The gap

`ListeningPartOnePrototype` is a client component. A client component
receives its props as serialized data, so anything in the content object
is readable in the page payload before the learner answers anything.

When Part 1 was built in EXAM-03 that was safe, and deliberately so: the
`answerKey` list was eight pending entries with no `correctOptionId` on
any of them, so there was nothing in the object to leak. EXAM-04 scored
the part in the browser for the same reason.

The key was transcribed later, from the Part 1 answer and explanation
sheet. From that point the route was serializing all eight correct option
ids into the payload of the page. Parts 2 to 6 never had this gap: each
strips its key on the server and marks server side, a pattern EXAM-05
introduced precisely because Part 2 shipped with a complete key. Part 1
was the one part left on the old path.

This was a known issue, recorded before it was fixed:

- `docs/product/listening-part-1-review-score.md` section 9 item 2
- `docs/product/listening-part-2-review-score.md` section 7

Both are now closed by this ticket.

### The fix

`src/app/dashboard/mock-tests/mock-test-1/listening/part-1/page.tsx` now
does what the Part 2 to Part 6 routes do:

```ts
const learnerContent = withoutListeningAnswerKey(listeningPart1);
```

`withoutListeningAnswerKey` is the existing helper in
`src/features/exam-engine/listening-flow.ts`, unchanged. It deletes the
part level `answerKey` and any per question `correctOptionId`, and passes
everything else through. Nothing new was written for the stripping.

### Verified

The object the route now hands to the client component was serialized and
inspected:

| Check | Raw content | Prop passed to the client |
| --- | --- | --- |
| Contains an `answerKey` field | yes | **no** |
| Contains a `correctOptionId` field | yes | **no** |
| The 8 known correct option ids appear | as key entries and as options | **as ordinary option ids only** |

The eight ids from the ticket, `listening-part-1-q1-d` through
`listening-part-1-q8-c`, are still in the payload, and they have to be:
each one is the id of an option the learner has to be able to click. What
is gone is the structure that says which of the four is right. There is
nothing in the payload that marks one option in a group of four.

---

## 5. Part 1 scoring pattern after the fix

Part 1 now uses the same server-action marking pattern as Parts 2 to 6.

**New file:**
`src/app/dashboard/mock-tests/mock-test-1/listening/part-1/actions.ts`

It is the Part 2 action with the Part 1 content imported:

- `markListeningPartOne(answers)` is a `"use server"` action
- it verifies the caller's session with `supabase.auth.getUser()` and
  returns `null` when there is none, because a page level auth check does
  not extend to a server action defined for it
- it sanitizes the submitted answers against the real questions and
  options, because a server action is reachable by direct POST
- it runs the same pure EXAM-04 helpers, `buildListeningReviewRows` and
  `buildListeningScoreSummary`, on the server
- it returns finished review rows and a score summary, and nothing else

**Changed component:**
`src/components/exam/listening/ListeningPartOnePrototype.tsx`

It gained the `markAnswers` prop and the marking state machine Parts 2 to
6 already have: `idle`, `working`, `ready`, `failed`, a request id ref so
a late reply cannot overwrite a newer one, and the interstitial marking
screen with a retry when a request fails. Marking is kicked off from the
handler that steps onto the answer review screen, not from an effect. The
two `useMemo` calls that used to compute rows and summary in the browser
are gone.

What did not change:

- the eighteen screen sequence
- the answer review table, the practice score screen and the end of part
  screen, which still read their default Part 1 wording from
  `listeningReviewCopy`
- the score arithmetic, which is the same helpers on the other side of
  the boundary, so Part 1 still scores out of 8

Constraints held:

- learner answers stay in local React state
- no API route
- no database write
- no cookie
- no localStorage
- no Supabase migration
- no change to Supabase helpers, auth or the service role

The Part 1 route notice was also updated. It used to say the practice
score "stays pending until the answer key for this part is transcribed",
which stopped being true when the key landed. It now reads the same as
the Part 2 to Part 6 notices.

---

## 6. Full Listening route regression result

`/dashboard/mock-tests/mock-test-1/listening` was not edited by this
ticket. No file it depends on was edited either:

- `ListeningSectionPrototype.tsx` unchanged
- `listening/actions.ts` unchanged
- `listening/page.tsx` unchanged
- `full-listening-section.ts` unchanged
- `withoutListeningSectionAnswerKeys` unchanged
- `listening-score.ts` and `listening-section-score.ts` unchanged

So the full section still runs the Listening instructions, the
instructional video, Parts 1 to 6 back to back with transitions and no
score between them, then one answer review over all 38 questions and one
practice score with the part breakdown.

**The Listening total is still 38 and the part breakdown is still 8 + 5 +
6 + 5 + 8 + 6.** No official CELPIP score and no CELPIP level appears
anywhere; the result is named a Toronto Academy practice result.

`npm run lint` and `npm run build` both pass, and the route is in the
build output. Static verification only. The browser walkthrough is step 2
of the manual test steps below.

---

## 7. Individual route regression result

The six part routes and the two older preview routes all build and are
present in the route table, and only Part 1 was edited.

| Route | Edited by EXAM-15A | Card on dashboard |
| --- | --- | --- |
| `.../listening` | no | yes, the only one |
| `.../listening/part-1` | yes, key stripped and marking moved | no |
| `.../listening/part-2` | comment only | no |
| `.../listening/part-3` | no | no |
| `.../listening/part-4` | no | no |
| `.../listening/part-5` | no | no |
| `.../listening/part-6` | no | no |
| `/dashboard/mock-tests/shell-preview` | no | no |
| `/dashboard/mock-tests/instruction-preview` | no | no |

Static verification only, as above.

---

## 8. What is intentionally not built

Unchanged from EXAM-15, and all still intentional:

- the app is still not a public paid product flow
- no database save for Listening attempts, and no persisted Listening
  score history
- an in progress attempt is still lost on reload, in the part routes and
  in the full section route
- media can still be replayed, and Next does not wait for a clip to end
- timers are still static and do not count down
- no full Mock Test 1 assembly across Listening, Reading, Writing and
  Speaking
- Reading has not started

Not built by this ticket specifically:

- no Reading, Writing or Speaking work of any kind
- no change to the Speaking or Writing AI flows, or to any AI scoring
  prompt
- no payment and no live classes
- no Supabase migration, no schema change, no service role call, no auth
  change
- no new dependency
- no official CELPIP branding or official screenshots in production UI

The shell preview and instruction preview routes were left in place
rather than deleted. They are the layout references for the exam shell
and the instruction screens, and Reading will want both. Deleting them is
a separate decision from unlisting them.

---

## 9. How EXAM-16 Reading should start next

1. **Start with the content file, not the screens.** Follow
   `listening-part-1.ts`: one exported content object, source noted at
   the top, licensed material, answer key in its own const. Check
   `docs/product/mock-test-1-content-map.md` for what Reading Part 1
   actually contains before typing any of it.
2. **Strip the key on day one.** Do not repeat the Part 1 mistake this
   ticket just cleaned up. A Reading route should call its equivalent of
   `withoutListeningAnswerKey` in the first commit that has a real key,
   and mark in an `actions.ts` beside the route. The pattern to copy is
   `part-2/actions.ts`, now duplicated as `part-1/actions.ts`.
3. **Reuse the exam shell, not the Listening flow.** `ExamShell`,
   `ExamButton`, `ExamInstructionRow` and the screen theme are section
   agnostic. `listening-flow.ts` and `listening-types.ts` are not:
   Reading has passages rather than audio sections, so it wants its own
   `reading-types.ts` and `reading-flow.ts` in the same shape.
4. **The review, score and end screens are close to reusable.**
   `buildListeningReviewCopy` takes a part label, and the score summary
   card is generic. Expect to generalize the names rather than rewrite
   the components, and do that in the ticket that needs the second
   section rather than up front.
5. **One dashboard card per section.** When Reading has a full section
   route, add a second card to `DashboardMockTestCard.tsx`, learner
   facing from the start. Do not reintroduce a per part card list.
6. **The unresolved content question is still open.** The Listening
   denominator question, 38 in the content against 37 on the official
   score screen, is open item 6 in
   `docs/product/mock-test-1-content-map.md`. Check whether Reading has
   the same kind of discrepancy before building its score screen.
7. **Attempt persistence is still the big undecided thing.** Losing
   answers on reload is tolerable for a Listening prototype and not
   tolerable for a full four section mock test. It needs a schema
   decision and a migration, which does not belong in a UI ticket.

---

## Files

Created:

- `src/components/dashboard/DashboardMockTestCard.tsx`
- `src/app/dashboard/mock-tests/mock-test-1/listening/part-1/actions.ts`
- `docs/product/mock-test-1-listening-dashboard-cleanup.md`

Changed:

- `src/app/dashboard/page.tsx`, swapped the preview link block for the
  mock test card
- `src/features/exam-engine/listening-copy.ts`, added the
  `fullSectionCard*` and `mockTests*` strings, corrected the stale Part 1
  summary
- `src/app/dashboard/mock-tests/mock-test-1/listening/part-1/page.tsx`,
  strips the key, passes the marking action, notice updated
- `src/components/exam/listening/ListeningPartOnePrototype.tsx`, marks on
  the server
- `src/components/exam/listening/ListeningPartTwoPrototype.tsx`, comment
  only
- `src/app/dashboard/mock-tests/mock-test-1/listening/part-2/page.tsx`,
  comment only

Deleted:

- `src/components/exam/ExamShellPreviewLink.tsx`

No migration, no schema change, no new dependency.

---

## Manual test steps

1. Sign in and open `/dashboard`. Scroll to the bottom. There should be
   one "Mock tests" section with a single card titled
   "Mock Test 1 - Listening Test", showing Listening / 6 parts / 38
   questions and an Available pill. There should be no dashed cards, no
   "Internal preview" text, and no Part 1 to Part 6 links anywhere on the
   page.
2. Press "Start Listening test". Walk the full section: instructions,
   instructional video, Parts 1 to 6 with transitions and no score
   between them, then the answer review over 38 questions, the practice
   score with the part breakdown, and the end of section screen. Confirm
   the total reads out of 38 and no CELPIP level appears.
3. Type `/dashboard/mock-tests/mock-test-1/listening/part-1` into the
   address bar. The route should load normally.
4. On that route, open DevTools before answering anything. Search the
   document source and the RSC payload for `answerKey` and for
   `correctOptionId`. Neither should appear. The id
   `listening-part-1-q1-d` will appear, as the id of the fourth option on
   question 1, which is expected and unavoidable.
5. Answer all eight Part 1 questions and press Next past question 8. A
   brief marking screen may flash, then the answer review appears with a
   correct answer column and a status per row. Press "View score". The
   score should read out of 8 and be named a practice result.
6. Repeat step 3 for part-2 through part-6, plus
   `/dashboard/mock-tests/shell-preview` and
   `/dashboard/mock-tests/instruction-preview`. All eight should load.
7. Sign out and try `/dashboard/mock-tests/mock-test-1/listening/part-1`
   again. It should redirect to `/login`.
