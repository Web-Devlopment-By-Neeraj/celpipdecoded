# Reading Part 3 prototype (EXAM-20)

Mock Test 1, Reading Part 3, Reading for Information. The third Reading
part built, and the first screen in the practice test engine that is
answered by naming a paragraph rather than by completing a sentence.

It continues the Reading engine after EXAM-16 and EXAM-17, Reading Part 1
Prototype and Review and Score, and EXAM-18 and EXAM-19, the same pair for
Reading Part 2. It deliberately stops where EXAM-16 and EXAM-18 stopped
rather than where EXAM-17 and EXAM-19 did: there is no Reading Part 3
review and no Reading Part 3 score in this ticket.

House style: normal hyphens only, no long hyphens or em dashes.

---

## 1. Route created

```
/dashboard/mock-tests/mock-test-1/reading/part-3
```

Source file: `src/app/dashboard/mock-tests/mock-test-1/reading/part-3/page.tsx`

The route sits under `/dashboard`, so the layout auth guard covers it, and
the page verifies the session again close to the content. It carries
`robots: { index: false, follow: false }`. It is not in navigation.

It has one link: an Internal preview card in the Mock tests section of the
dashboard. See section 11. The student facing Mock Test 1 card is
untouched and still offers Listening only.

The page is a server component. It strips the answer key with
`withoutReadingAnswerKey` before the content crosses to the client
prototype, which is the same precaution the Reading Part 1 and Part 2
routes and every Listening route take.

There is no `actions.ts` beside this route, as there was none beside the
EXAM-18 Reading Part 2 route. Nothing marks a Part 3 attempt in this
ticket, so there is nothing for the browser to send and no server action
to return anything. No API route, no service role, no Supabase write, no
migration.

The route runs in exam mode. It is listed in
`src/features/navigation/exam-mode-routes.ts`, so `AppShellFrame` renders
no sidebar, header, breadcrumb trail or footer on it, and
`ExamModeViewport` gives the frame a fixed, one window tall viewport with
document scrolling switched off.

That is the same departure Reading Parts 1 and 2 made from the six
Listening part routes, which stay outside exam mode and keep their
dashboard chrome. It matters most of all here: Part 3 is answered by
scanning back and forth between five lettered paragraphs on the left and
nine statements on the right, so both columns have to be on screen at the
same time or the part cannot be answered at all.

Because the exam surface carries no preview label, the caveats are said
where a learner meets them. The part intro screen's notice states that
answers are held on the screen only and nothing is saved. The completion
screen repeats it and says plainly that the review and the score are the
next ticket.

---

## 2. Source content used

Authority: `mock-tests/mock-test-1/Mock Test 1 -Sajinlinks.docx`, the
block headed "Reading Part 3: Reading for Information".

Cross checked against:

- `mock-tests/mock-test-1/extracted-content-outline.md`, which records
  "left: paragraphs A to D plus fixed option E, one dollar coin article /
  right: 9 statements, each with an A to E dropdown"
- `mock-tests/mock-test-1/extracted-links.md`, which lists one Reading
  image in the whole test and it belongs to Part 2, so this part has no
  assets
- `docs/product/mock-test-1-content-map.md`, the Part 3 summary and the
  Reading answer key table
- `docs/product/celpip-exam-rules-research.md` sections 3, 10 and 11, for
  the part rules and the published timing
- `docs/product/admin-mock-test-builder-blueprint.md` sections 3.5, 3.6
  and 8, for the shared option set the future database gives this part

Everything below is taken from the source document. Nothing was invented:
no paragraph, no statement, no option and no answer key entry.

Content file:
`src/features/exam-engine/mock-tests/mock-test-1/reading-part-3.ts`

What was taken:

| Item | Value |
| --- | --- |
| Part title | Reading Part 3: Reading for Information |
| Passage instruction | "Read the following message." |
| Passage | 4 labelled paragraphs, A to D, about the Canadian one dollar coin |
| Fixed fifth entry | "E. Not given in any of the above paragraphs." |
| Question instruction | "Decide which paragraph, A to D, has the information given in each statement below. Select E if the information is not given in any of the paragraphs." |
| Questions | 9 statements |
| Options | A, B, C, D, E on every statement |
| Answer key | C, D, B, E, A, E, E, A, D |
| Assets | none |

### Transcription decisions

All deliberate, all recorded in the content file header as well.

1. **Curly quotes and apostrophes are written as straight ones.** House
   style, and what every Listening content file and Reading Parts 1 and 2
   already do. No wording changes.
2. **The one long dash is written as a normal hyphen.** Paragraph A has
   "Robert Ralph Carmichael" followed by a long dash before "a loon on one
   side". It is written as " - ". House style, no wording change.
3. **The en dash in "$175-250 million" is written as a normal hyphen.**
   Paragraph B. Same rule.
4. **The hyphens inside "the silver dollar-which was made of nickel by
   1967-wasn't used much" are the source document's own plain hyphens**
   and are kept exactly as they are. They are not long dashes that were
   converted; the document types them as hyphens.
5. **The instruction line above the paragraphs is carried verbatim, even
   though it is wrong.** It reads "Read the following message." where the
   passage is a magazine style article. See section 12, gap 1.
6. **Paragraph E is kept on the passage side, with A to D.** The document
   prints it in the same lettered run. It is not a paragraph, it is the
   fixed fifth choice, and its own sentence says so.
7. **The statements are numbered 1 to 9 in document order.** The document
   prints no numbers beside them. The numbering is confirmed by the answer
   key table, which runs Question 1 to Question 9 against the same
   sequence. See section 12, gap 2.
8. **The two author notes in this block are not in the content file.**
   "(the passage will come here on the left side of the screen)" and "And
   question will appear on the right side of the screen" are instructions
   to us, not learner facing copy. What they describe is the layout the
   split screen already implements.

### No assets

`extracted-links.md` lists exactly one Reading image in Mock Test 1 and it
is the Part 2 course brochure. Part 3 is text throughout, so nothing is
referenced, downloaded or re-hosted here.

---

## 3. Task structure

Three screens, built by `buildReadingFlow` with
`{ taskScreen: "information", ending: "complete" }`.

```
1  Reading Part 3 intro
2  Information split screen, all 9 statements
3  Reading Part 3 complete
```

Screen 2 is the whole of the task. A Reading part is one working screen,
which is what makes a Reading flow so much shorter than a Listening one.

The split screen, screen type 8 from
`docs/product/exam-engine-screen-types.md` in its new information variant:

- **Left**: the instruction line, then the five lettered entries A to E,
  each drawing its letter as a marker beside its text. Own scrollbar.
- **Right**: one panel, holding the source document's instruction line and
  the nine statements, each with its own A to E selector. Own scrollbar,
  on the light blue answer wash. The answered count sits under it.

The right column is one panel where Parts 1, 2 and 4 have two. Those parts
pair a set of questions with a body of text carrying inline blanks. Part 3
has neither: it is nine statements under one instruction line, which is one
group.

---

## 4. Question count

**9**, matching every source we hold: the source document prints nine
statements, `docs/product/mock-test-1-content-map.md` says 9, the answer
key table gives nine letters, and
`docs/product/celpip-exam-rules-research.md` section 3 says 9 for Reading
Part 3. There is no disagreement anywhere.

The dashboard card says "9 questions" and the intro card says
"Questions 9", both read from the content object rather than typed.

---

## 5. Question types used

One type, on all nine questions: a whole statement answered from a
drop-down.

In `ReadingQuestion` terms, each statement carries `text` and neither
`textBefore` nor `textAfter`, so `ReadingQuestionList` prints it as a
complete sentence and draws no blank. That is the shape EXAM-18 added for
Reading Part 2 questions 6 to 8, and it fits these nine with no change at
all.

The blueprint's name for this is `reading_information_choice`
(`docs/product/admin-mock-test-builder-blueprint.md` section 8) and the
content map calls it `paragraph_match`. Both describe the same thing.

### The shared option list, and why the shared types did not change

This is the one Reading part whose options are shared across all
questions. `celpip-exam-rules-research.md` section 10 says so, and the
blueprint gives the future database an `option_set_id` for it, noting that
without one the part needs "45 near-duplicate option rows and a rule that
they must stay in sync".

The content file honours that without changing the shared
`ReadingQuestion` shape. The five choices are written once, in a
`PARAGRAPH_LABELS` constant, and a small `buildParagraphOptions` helper
stamps them onto each statement with ids of the usual
`<questionId>-<letter>` form. The result:

- there is one place the option list is edited
- the answer key still points at a real option on a real question, exactly
  as the Part 1 and Part 2 keys do
- `ReadingQuestionList`, `ReadingQuestionPanel` and the EXAM-21 marking
  that follows read this part exactly as they read Parts 1 and 2

So no shared component and no shared type had to learn about option sets
for the sake of one part. The database will still want `option_set_id`
when the admin builder is built; that is a storage concern and this is a
content module.

The options are the bare letters "A" to "E", which is what the document
prints under each statement. Nothing expands "E" into its sentence,
because that sentence is on the left where the document puts it.

---

## 6. Timer behaviour

**600 seconds, 10 minutes**, `source: "published"`.

Amber at 60 seconds remaining, red at 20. The same long window thresholds
Reading Parts 1 and 2 use.

The timer is the shared `ExamCountdownTimer` in the top bar, keyed on the
flow screen id so that the window belongs to the screen and none of the
nine selections made on it starts a new one. Reading is timed per part in
every source we hold, which `celpip-exam-rules-research.md` section 11
records, so there is no per-question window here.

### Where the figure comes from, and the conflict

There is a conflict, and it is the same shape as the one Reading Part 1
carries.

| Source | Figure |
| --- | --- |
| `celpip-exam-rules-research.md` sections 3 and 10, from the official Reading Overview PDF | 10 minutes |
| `mock-test-1-content-map.md`, read off an official screenshot | 9 minutes |

**10 minutes is used.** The overview PDF is the only source that gives a
figure for every Reading part in one consistent unit, and preferring it is
the call Reading Part 1 already made for exactly the same one minute
disagreement. The reasoning is repeated in the `timer.note` field on the
content object, so it travels with the number.

Reading Part 2 had no conflict: both sources say 9 minutes there. Part 3
is the second part where they disagree.

This should be confirmed against the official published timings before
strict Reading section timing is built, which is item 7 on the content
map's list of gaps to close.

### What the timer does and does not do

It counts down live, turns amber, turns red, reaches zero and shows
"Time is up". Then it stops.

It does not:

- auto-submit
- advance the screen
- erase or lock any answer
- disable Next, or move it

The prototype passes no `onTimeExpire` handler at all, which is what makes
all of that true rather than a promise. A learner whose window runs out
keeps every selection and finishes the part by hand. Strict full Reading
timing is a later ticket.

---

## 7. Answer state strategy

One `useState` in `ReadingPartThreePrototype`, holding a
`ReadingAnswerMap`:

```
{ questionId: selectedOptionId }
```

The same shape Reading Parts 1 and 2 use, and the shape EXAM-21 will read.
Writes go through `setReadingAnswer` from `reading-flow.ts`, which returns
a new object so React sees a changed reference.

Keyed by question id rather than by screen position or by group, which is
what makes an answer survive navigation: the prototype stays mounted for
the whole part, so going forward to the completion screen and back again
finds all nine selections where they were left.

The prototype owns two pieces of state, not three. The Part 2 prototype
also holds a marking request; there is no marking here, so there is no
third piece.

Nothing is persisted. No database write, no Supabase call from the client,
no `localStorage`, no `sessionStorage`, no cookie, no URL state. A page
reload starts the part again with an empty map, and Restart clears it
deliberately.

---

## 8. Blank answer behaviour

Blanks are allowed everywhere and block nothing.

- No question is required.
- Next on the split screen is never gated on the answers. The screen takes
  no `allAnswered` or `requireAllAnswered` prop, because EXAM-17 removed
  both from the Reading screens after finding that a gate traps a learner
  who cannot answer one question on the last screen of the part.
- The completion screen is reachable with zero answers selected.
- Nothing is cleared or filled in on the learner's behalf, at any point,
  including when the timer expires.

A blank travels as a missing key in the answer map. The completion screen
counts it as unanswered through `countAnsweredReadingQuestions` and says
so plainly: "You answered 4 of 9 questions."

While any statement is outstanding, the line under the question column
carries the shared hint, that continuing with questions unanswered is
allowed and that a question left blank is counted as incorrect. The second
half of that sentence is about the marking EXAM-21 will build; it is said
now so that leaving a blank is an informed choice rather than an accident.

---

## 9. Answer key status

**Present, complete, confirmed, and stored. Not exposed to the client, and
not read by anything yet.**

The source document prints the Reading answer keys as text, under
"Answers & Explanations". The PART03 table gives nine letters against
Question 1 to Question 9:

```
1 C   2 D   3 B   4 E   5 A   6 E   7 E   8 A   9 D
```

That is the same key `docs/product/mock-test-1-content-map.md` records. It
is stored in the content file as `ANSWER_KEY`, one
`ReadingAnswerKeyEntry` per question, each with `source: "document"` and
the letter repeated in a trailing comment so an entry can be checked
against its question without scrolling.

Every letter matched an existing option on the question of that number.
Nothing was guessed, and no statement or option was reworded to make a key
fit.

`explanation` is unset on every entry. The source document gives no
explanations for the Reading answers, and nothing here writes one. No AI
writes one either.

### How it is kept off the client

`ReadingPartThreePrototype` is a client component, so anything handed to
it as a prop is serialized into the page payload and readable by anyone
who opens the network panel. So the route strips the key on the server,
before the content crosses the boundary:

```ts
const learnerContent = withoutReadingAnswerKey(readingPart3);
```

`withoutReadingAnswerKey` removes both places a key can hide in a Reading
part: `content.answerKey`, and `correctOptionId` on any individual
question. It rebuilds the question groups rather than mutating them, so
the module level content object is left exactly as it was.

The component that receives the result could not show a correct answer if
it tried, because it does not have one.

### Nothing reads it yet

EXAM-20 builds no review and no score, so the key is stored and stripped
and that is all. When EXAM-21 reads it, it should read it the way
`markReadingPartOne` and `markReadingPartTwo` read theirs: on the server,
in a server action beside the route, importing the content module directly
rather than trusting anything the browser sends, and returning finished
review rows rather than the key itself.

---

## 10. Visual layout

The existing neutral exam style, unchanged. No orange, no marketing
background, no dashboard sidebar, no official CELPIP branding, and no
preview label anywhere on the exam surface.

The frame is `ExamModeViewport` plus `ExamShell`: a fixed grey top bar
carrying the part title, the countdown and Next, a white exam canvas in
the middle, and a fixed bottom bar carrying Back. The canvas is the only
thing that changes between screens.

### The split screen

`ReadingTwoColumnLayout`, the same wrapper Parts 1 and 2 use, so the three
parts stay one screen type. The canvas is unpadded and the split draws no
outer rule of its own, so the canvas border is the only rule around the
work area and the divider runs the full height between the columns.

Both columns scroll on their own, at the same fixed height. Nothing about
this screen makes the document scroll, which is what
`ExamModeViewport` locks down.

### The information column

The left column is the part's own contribution to the design.

Each lettered entry prints its label as a marker in its own narrow column,
with the paragraph text beside it. That keeps the five letters in a
straight vertical line down the left edge, so a learner scanning for
paragraph C can find it without reading B and D to get there, and it keeps
the paragraph text on one comfortable measure. Running "C." into the first
sentence would be faithful to how the document types it and useless to
scan.

No rules, no boxes, no card per paragraph: five bordered containers would
make five documents out of one article. The gap between sections carries
the separation instead.

The label is marked up as a heading for the paragraphs beside it, not as a
loose span, because it is content rather than decoration: it is the thing
the statements on the right are answered with.

Entry E is drawn with the other four, because the source document prints
it in the same lettered run and because a learner choosing E has to be
able to read what it means.

### The question column

`ReadingPartThreeQuestionPanel`, which owns the column, over the shared
`ReadingQuestionPanel` and `ReadingQuestionList`, which own the panel and
the list. Nothing new was drawn here: a whole statement with a drop-down
under it is exactly what the shared list already renders.

Each statement is a bordered box with a tinted header strip carrying the
number and the sentence, and the selector in the body below it. The header
strip is the selector's label, wired with `htmlFor`. The placeholder is a
real option with an empty value, so an unanswered selector reads "Select
answer" rather than silently defaulting to A.

The answered count sits under the panel, with the blanks-allowed hint
beside it while any statement is outstanding.

Compact by construction: nine statements and their selectors are what the
column holds, and it scrolls internally rather than pushing the page.

---

## 11. Dashboard internal preview link

A third Internal preview card now sits in the existing Mock tests section
of the dashboard, beside the Part 1 and Part 2 cards:

```
Mock Test 1 - Reading Part 1   /dashboard/mock-tests/mock-test-1/reading/part-1
Mock Test 1 - Reading Part 2   /dashboard/mock-tests/mock-test-1/reading/part-2
Mock Test 1 - Reading Part 3   /dashboard/mock-tests/mock-test-1/reading/part-3
```

The Part 3 card:

| Field | Value |
| --- | --- |
| Title | Mock Test 1 - Reading Part 3 |
| Badge | Internal preview |
| Description | Reading for Information prototype with local answers. No review or score yet. |
| Facts | Reading / Part 3 / 9 questions |
| Button | Open Reading Part 3 |
| Href | /dashboard/mock-tests/mock-test-1/reading/part-3 |

It is dressed as an internal build link, following the rule the EXAM-18
cards set: a tinted panel with a dashed rule rather than the solid one, an
Internal preview badge where the Available pill sits, and a secondary
button rather than the navy call to action. The layout underneath is the
Listening card's layout, so the four cards read as one section.

The three Reading cards are one list and one renderer in
`DashboardMockTestCard.tsx`, so adding this one was a list entry and six
strings in `reading-copy.ts`.

**Untouched:** the student facing Listening card, which still offers the
full Listening section and carries its Available pill. The Reading Part 1
and Part 2 cards keep their wording and their links.

**Not created:** a full Reading test card. Three of the four parts are
built, one of them has no marking, and there is no assembled Reading
section, so there is nothing honest to offer. Nothing on the dashboard
claims a Reading test exists, and no card mentions a CELPIP level or a
Reading band.

---

## 12. Source gaps and timing conflicts

### The timing conflict

Covered in full in section 6. The published Reading Overview PDF says 10
minutes, the Mock Test 1 screenshot says 9, and the published figure is
used. Confirm both against the official published timings before strict
Reading section timing is built.

### Gap 1: the passage instruction says "message"

The line the document prints above the paragraphs is:

```
Read the following message.
```

The passage is a magazine style article about the Canadian one dollar
coin. It is not a message, and Reading Part 1 is the part whose passage is
a message, so this looks like a copy and paste from that part.

It is carried verbatim anyway. This codebase does not rewrite source
wording, and a line that is odd is a smaller problem than a line that is
ours. If a wording decision is wanted, it belongs to a content pass over
Mock Test 1 rather than to a prototype ticket, and the honest replacement
would be "Read the following article." Flag it to whoever owns the source
document.

### Gap 2: the statements carry no numbers

The document prints the nine statements one after another under a
"Questions:" heading, each followed by its own A to E list, with no
numbers anywhere.

Resolved from the answer key rather than assumed. The PART03 table runs
Question 1 to Question 9 and gives C D B E A E E A D, and each of those
letters is a sound answer to the statement in that position: statement 1,
about officials fearing unauthorized coins, is paragraph C, which is where
the Mint fears counterfeits; statement 5, about the animal on the loonie
being found throughout Canada, is paragraph A, which says the loon is
common across Canada. Document order and key order agree throughout, so
the numbering is 1 to 9 in document order.

This is the same kind of gap Reading Part 2 had, where questions 6 to 8
printed no numbers either and the key settled it.

### Gap 3: no explanations

The source document gives no explanation for any Reading answer, in this
part or any other. `explanation` is unset on every key entry and nothing
writes one. When EXAM-21 builds the review, its rows will carry the
correct option and no reason, and its notice should say so, the way the
Part 1 and Part 2 review notices already do.

### Gap 4: the shared option set has no home in the database yet

Not a gap in the source, but worth recording beside the others. The
blueprint's `mock_test_option_sets` and `option_set_id` exist on paper for
exactly this part and there is no migration for them, because no ticket
has built the admin schema yet. The content file works around it in the
way section 5 describes. Nothing here should be read as a decision against
the option set; it is a decision to leave storage to the ticket that
builds storage.

---

## 13. What is intentionally not built

Every one of these is out of scope for EXAM-20 by the ticket:

- **No Reading Part 3 answer review screen.** EXAM-21.
- **No Reading Part 3 practice score screen.** EXAM-21.
- **No Reading band estimate.** A band is a reading of the whole Reading
  section. Three parts of four are built, so there is nothing honest to
  show, and there is no wording for one anywhere in `reading-copy.ts`.
- **No CELPIP level.** Same reason.
- **No Reading Part 4.**
- **No full Reading section flow**, and no full Reading section route.
- **No full Mock Test 1 all-skills flow.**
- **No database save.** No attempt row, no answers table, no write of any
  kind. Answers live in one React state object and are lost on reload.
- **No Supabase migration.** None was created and none is needed.
- **No persisted attempt history.**
- **No `localStorage`, `sessionStorage`, cookie or URL state.**
- **No auto-submit and no timer enforcement.** The countdown reaches
  "Time is up" and stops.
- **No admin panel** and no content editor.
- **No payment and no live classes.**
- **No new dependency.** Nothing was installed.

Untouched by this ticket: every Listening route and content file, the
Reading Part 1 and Part 2 content files, routes and marking actions, the
Writing AI logic, the Speaking AI logic, the auth helpers, the Supabase
helpers, and the student facing dashboard Listening card.

---

## 14. How EXAM-21 should continue

EXAM-21 is Reading Part 3 Review and Score. EXAM-19 did the same job for
Reading Part 2 and is the model to follow; almost nothing new has to be
designed.

1. **Add `actions.ts` beside the route**, holding `markReadingPartThree`.
   Copy the shape of `markReadingPartTwo`: verify the session, sanitize
   the submitted answer map against the real questions and options,
   then call `markReadingPart` with `readingPart3` imported directly.
   Never trust a key, a question or an option that arrives from the
   browser.
2. **Pick the review wording for an unstemmed question, or skip it.** Part
   1 passes `responseBlankQuestionText` and Part 2 passes
   `emailBlankQuestionText`, because both parts hold questions that print
   no stem of their own. Part 3 has none: all nine statements are whole
   sentences and carry `text`, so `buildReadingReviewRows` will use the
   statement itself and no `blankQuestionText` option is needed. Check
   this rather than assuming it.
3. **Add the two Part 3 titles to `readingReviewCopy`**, beside
   `partTwoScoreTitle` and `partTwoReviewTitle`. Everything else in that
   object is part neutral and is reused as it stands. At three parts, the
   builder EXAM-06 made for Listening is worth making here: turn the
   hand written titles into `buildReadingReviewCopy(partLabel)` and leave
   the exports as calls to it.
4. **Add `ReadingPartThreeScoreScreen` and `ReadingPartThreeReviewScreen`**
   as thin wrappers over the shared score and review screens, the way the
   Part 2 pair are wrappers.
5. **Switch the flow ending.** Drop `ending: "complete"` from the
   `buildReadingFlow` call in `ReadingPartThreePrototype` so the part
   takes the default score ending, and keep `taskScreen: "information"`.
   Then add the marking state, the request id guard and the two closing
   branches, exactly as the Part 2 prototype has them. The completion
   screen branch stays as the fall-through, for the same reason Parts 1
   and 2 keep theirs.
6. **Update the dashboard card description**, which currently says "No
   review or score yet."
7. **Say what is not there.** The review notice must keep saying that no
   explanation is written for these answers, because the source document
   has none, and the score must keep being named a Toronto Academy
   practice score. No CELPIP level, and no Reading band from one part.

After EXAM-21, three of four Reading parts are complete with marking. The
natural next steps are Reading Part 4, then the assembled Reading section
with its own strict timing and its own student facing card, at which point
the three Internal preview cards and their wording in `reading-copy.ts`
should be removed.

---

## Files added

```
src/app/dashboard/mock-tests/mock-test-1/reading/part-3/page.tsx
src/features/exam-engine/mock-tests/mock-test-1/reading-part-3.ts
src/components/exam/reading/ReadingPartThreePrototype.tsx
src/components/exam/reading/ReadingPartThreeIntroScreen.tsx
src/components/exam/reading/ReadingPartThreeInformationScreen.tsx
src/components/exam/reading/ReadingPartThreeQuestionPanel.tsx
docs/product/reading-part-3-prototype.md
```

### What each component does, and why it is not a duplicate

**`ReadingPartThreePrototype`** owns the flow and the answers. Two state
values, three screens, no marking. It is the part's only stateful
component.

**`ReadingPartThreeIntroScreen`** is a thin wrapper over the shared
`ReadingPartIntroScreen` with the Part 3 format label filled in. It is the
same kind of wrapper `ReadingPartTwoIntroScreen` is, and the two are
deliberately not folded into one component taking a label prop: the intro
card is where a part states its own facts, and the next part that needs a
fourth detail row should be able to pass one without every other part's
wrapper acquiring the option.

**`ReadingPartThreeInformationScreen`** is the split screen. It is a
sibling of `ReadingCorrespondenceScreen` and
`ReadingPartTwoInformationScreen` rather than a branch inside either. All
three share the layout, the shell and the timer and differ in exactly one
thing: what the left column holds. This one's left column is the lettered
section list described in section 10, which neither of the others draws.

**`ReadingPartThreeQuestionPanel`** owns the right column: which groups go
in it, and the answered count under them. It draws no panel itself. It is
the counterpart of `ReadingPartTwoQuestionPanel` and it exists for the
same reason: it lets the screen file be about the split and the timer
rather than about the contents of one column.

### Components reused unchanged

```
ReadingPartIntroScreen
ReadingTwoColumnLayout
ReadingQuestionPanel
ReadingQuestionList
ReadingPartCompleteScreen
ExamShell
ExamModeViewport
ExamCountdownTimer
ExamInstructionScreen
ExamSectionIntroCard
```

`ReadingScoreSummaryCard` and `ReadingReviewQuestionCard` are not used.
There is no score and no review in this ticket.

---

## Files changed, and why none of them is a regression

```
src/features/exam-engine/reading-types.ts
src/features/exam-engine/reading-flow.ts
src/features/exam-engine/reading-copy.ts
src/features/exam-engine/exam-theme.ts
src/features/navigation/exam-mode-routes.ts
src/components/dashboard/DashboardMockTestCard.tsx
```

**`reading-types.ts`** gained one new type and two additions:

- `ReadingPassageSection`, a label and the paragraphs under it
- `ReadingPassage.sections`, optional, set on Part 3 and unset everywhere
  else
- `"information"` added to the `ReadingScreen` union

All three are additive. No existing field changed type, became required,
or was removed. Reading Parts 1 and 2 pass no `sections` and are
unaffected.

**`reading-flow.ts`** gained `"information"` as a third
`ReadingTaskScreen` value. `buildReadingFlow`'s body did not change: it
already put `taskScreen` straight into the screen list. The defaults are
unchanged, so a caller passing no options still gets the correspondence
screen and the score ending.

**`reading-copy.ts`** gained the Part 3 strings: the information column
label, the intro format label, the completion heading and restart label,
the three page metadata strings, and the six dashboard card strings. No
existing string was edited. Two comment blocks were extended to mention
the third part.

**`exam-theme.ts`** gained four recipes in `examReading` for the lettered
section list: `passageSections`, `passageSection`, `passageSectionLabel`
and `passageSectionBody`. Nothing existing was touched, so no screen
outside Part 3 renders differently.

**`exam-mode-routes.ts`** gained the Part 3 route in the list. Matching is
exact, so the two existing Reading routes and the full Listening route are
unaffected.

**`DashboardMockTestCard.tsx`** gained a third entry in the Reading
preview card list, and three comment blocks were updated to say three
cards rather than two. The Listening card and its wording are byte for
byte unchanged, and the two existing Reading cards keep their strings and
their hrefs.

### Regression check

- `npm run lint` passes.
- `npm run build` passes, and the route list shows
  `/dashboard/mock-tests/mock-test-1/reading/part-3` beside parts 1 and 2
  and the seven Listening routes, all still present.
- Reading Parts 1 and 2 import no file that changed behaviour. Every
  change to the four shared modules is an addition; nothing they read was
  edited.
- No Listening file was opened.
- No Supabase helper, auth file, Writing file or Speaking file was
  touched.
- No dependency was added, removed or upgraded.
