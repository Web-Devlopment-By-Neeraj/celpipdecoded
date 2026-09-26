# Reading Part 2 prototype (EXAM-18)

Mock Test 1, Reading Part 2, Reading to Apply a Diagram. The second
Reading part built, and the first screen in the practice test engine that
is answered from a picture rather than from prose.

It continues the Reading engine after EXAM-16, Reading Part 1 Prototype,
and EXAM-17, Reading Part 1 Review and Score. It deliberately stops where
EXAM-16 stopped rather than where EXAM-17 did: there is no Reading Part 2
review and no Reading Part 2 score in this ticket.

House style: normal hyphens only, no long hyphens or em dashes.

---

## 1. Route created

```
/dashboard/mock-tests/mock-test-1/reading/part-2
```

Source file: `src/app/dashboard/mock-tests/mock-test-1/reading/part-2/page.tsx`

The route sits under `/dashboard`, so the layout auth guard covers it, and
the page verifies the session again close to the content. It carries
`robots: { index: false, follow: false }`. It is not in navigation.

It has one link, added late in this ticket: an Internal preview card in
the Mock tests section of the dashboard. See section 1a. The student
facing Mock Test 1 card is untouched and still offers Listening only.

The page is a server component. It strips the answer key with
`withoutReadingAnswerKey` before the content crosses to the client
prototype, which is the same precaution the Reading Part 1 route and every
Listening route take.

There is no `actions.ts` beside this route, unlike Reading Part 1. Nothing
marks a Part 2 attempt in this ticket, so there is nothing for the browser
to send and no server action to return anything. No API route, no service
role, no Supabase write, no migration.

The route runs in exam mode. It is listed in
`src/features/navigation/exam-mode-routes.ts`, so `AppShellFrame` renders
no sidebar, header, breadcrumb trail or footer on it, and
`ExamModeViewport` gives the frame a fixed, one window tall viewport with
document scrolling switched off.

That is the same departure Reading Part 1 made from the six Listening part
routes, which stay outside exam mode and keep their dashboard chrome. It
matters more here than it did there: Part 2's left column is a tall course
brochure that has to be read at a usable size to answer eight questions,
and a dashboard content column cannot give it one.

Because the exam surface carries no preview label, the caveats are said
where a learner meets them. The part intro screen's notice states that
answers are held on the screen only and nothing is saved. The completion
screen repeats it and says plainly that the review and the score are the
next ticket.

---

## 1a. Dashboard internal preview links

Added after the route was built, on request, because the route had no way
in. An exam mode route renders no dashboard chrome and carries no preview
label, which is what the split screen needs and also what left pasting the
URL as the only way to open it.

Two cards now sit in the existing Mock tests section of the dashboard,
beside the Listening card:

```
Mock Test 1 - Reading Part 1   /dashboard/mock-tests/mock-test-1/reading/part-1
Mock Test 1 - Reading Part 2   /dashboard/mock-tests/mock-test-1/reading/part-2
```

Part 2 is the one this ticket needed. Part 1 was added beside it for
convenience, since it has the same problem for the same reason and there
was no sense in linking one exam mode Reading route and not the other.

**Both are temporary.** They are internal prototype links, and they go
when the full Reading section is assembled and gets a single student
facing entry point of its own, the way EXAM-15A replaced nine internal
Listening preview cards with one Listening test card.

They are dressed as internal build links so no learner can read them as a
released feature, following the rule the old `ExamShellPreviewLink` set:

- Tinted panel with a dashed rule, not the Listening card's solid panel.
- An `Internal preview` badge where the Listening card shows `Available`.
- A secondary button, not the navy call to action.
- The card layout underneath is the Listening card's layout, so the three
  read as one section rather than as two competing designs.

The wording, in `readingCopy` under `dashboard*`:

| Card | Description | Meta | Button |
| --- | --- | --- | --- |
| Mock Test 1 - Reading Part 1 | Reading Correspondence prototype with local answers and practice review. | Reading / Part 1 / 11 questions | Open Reading Part 1 |
| Mock Test 1 - Reading Part 2 | Reading to Apply a Diagram prototype with local answers. Review and score are added next. | Reading / Part 2 / 8 questions | Open Reading Part 2 |

Both counts are read off the built content rather than invented: Part 1
asks 11 questions and Part 2 asks 8, which is section 4.

Each part is named by the CELPIP task it is, Reading Correspondence and
Reading to Apply a Diagram, rather than by a generic label. Naming Part 2
a reading information prototype would have described a different task,
Reading for Information, which is Part 3 and is not built.

What the cards do not say, because none of it is true: that a Reading test
is available, that a full Reading section exists, or that either part
produces a score, a CELPIP level or a Reading band. Two of the four
Reading parts are built and Part 2 has no review or score yet.

The Listening card was not touched. No route, no flow, no content file and
no exam screen changed for this. The only files involved are the dashboard
card component and the copy file, plus the stale "not linked from
anywhere" comments on the two Reading route pages, which are now wrong and
say what is actually true instead.

---

## 2. Source content used

Authority: `mock-tests/mock-test-1/Mock Test 1 -Sajinlinks.docx`, the block
headed "Reading Part 2: Reading to Apply a Diagram".

Cross checked against:

- `docs/product/mock-test-1-content-map.md`, Reading Part 2 section and
  the Reading answer keys table
- `mock-tests/mock-test-1/extracted-content-outline.md`, Reading Part 2
  outline
- `mock-tests/mock-test-1/extracted-links.md`, Reading images and the note
  on the two mailto links
- `docs/product/celpip-exam-rules-research.md`, sections 3, 10 and 11
- `docs/product/reading-part-1-prototype.md` and
  `docs/product/reading-part-1-review-score.md`, for the patterns this
  part follows

Content file: `src/features/exam-engine/mock-tests/mock-test-1/reading-part-2.ts`

Everything the screens print comes from that one module. No passage text,
diagram content, question, option or answer was invented, and no wording
was replaced with general CELPIP knowledge.

### Transcription decisions

All of these are recorded again in the content file header, beside the
text they apply to.

- The document's curly apostrophes are written as straight ones, which is
  the house style and what the Listening content files and Reading Part 1
  already do. No other character in the passage or the options was
  changed.
- The email's blanks are printed in the document as `1. _______ .`, with a
  space before the full stop, a consequence of the underscores being typed
  inline. The space is dropped, so each sentence closes normally once its
  blank is filled. Reading Part 1 made the same call.
- Both instruction lines end `from the drop-down menu (  ).` in the
  document. The empty brackets held a picture of the drop-down control
  that did not survive into the text, so they are dropped and each
  sentence ends at `menu.`. No wording is changed.
- The email header is printed in the document as one unbroken run,
  `Subject: Language CoursesTo: Charlie Veui cveui@tmscollg.comFrom: Gerry
  Nalen Grnal@tmscollg.com`. It is split back into the three lines it
  plainly is.
- The two addresses, `cveui@tmscollg.com` and `Grnal@tmscollg.com`, are
  passage text rather than real addresses, which `extracted-links.md`
  records. They are stored and rendered as plain text and never as mailto
  links.
- The three author notes in this block are instructions to us and not
  learner facing copy, so they are not in the content file: `(the Diagram
  will come here on the left side of the screen)`, `And question will
  appear on the right side of the screen`, and the bare `Image <url>`
  line. What they describe is the layout the split screen already
  implements.
- The part's three instruction bullets on the intro screen are written for
  this prototype and are not from the document, exactly as Reading Part
  1's are. The document gives Reading Part 2 no part level instruction
  bullets: it has section level Reading instructions, which belong to the
  Reading instructions screen and not to this part, and two instruction
  lines that sit above the content they govern and are carried on the
  question groups. The written bullets describe only what this screen
  actually does and promise no official test behaviour.

### The diagram asset

One Cloudinary PNG, the only Reading image in the test, listed in
`extracted-links.md`:

```
https://res.cloudinary.com/dkvsshy7n/image/upload/v1785339294/Reading_Test_1_-_Part_2_czz4w3_z3b0au.png
```

It is referenced by URL, the way the Listening content files reference
their clips. Nothing was downloaded into the repository and nothing was
re-hosted, which is the handling rule `extracted-links.md` sets out.

The file is 412 by 557 pixels. It is a course brochure for a fictional
language school, the Alpaca Education Centre, listing three courses. It
carries no official CELPIP branding, so nothing about it conflicts with
the rule against putting official branding in production UI.

---

## 3. Task structure

Screen type 8 from `docs/product/exam-engine-screen-types.md`, in its
diagram variant. Three screens:

```
1  part intro
2  the diagram split screen, brochure on the left and all 8 questions
   on the right
3  part complete
```

Built by `buildReadingFlow(content, { taskScreen: "diagram", ending: "complete" })`.

Both options already existed on the flow builder in a usable form.
`ending: "complete"` is the EXAM-16 ending that EXAM-17 kept rather than
replaced. `taskScreen` is new in EXAM-18 and is the only change the flow
builder needed for a second part to use it.

The split screen holds two question panels on the answer side, which is
the shape the source document gives it:

| Column | Content |
| --- | --- |
| Left | The course brochure image, and nothing else. No prose. |
| Right, panel 1 | The email from Gerry to Charlie, with five inline blanks, questions 1 to 5 |
| Right, panel 2 | Questions 6 to 8, three whole questions about the situation |

---

## 4. Question count

8 questions, numbered 1 to 8 continuously across the two panels.

- Questions 1 to 5: the blanks inside the email
- Questions 6 to 8: the questions about the situation

Every question has 4 options, so 32 options in total.

This matches all three sources: the content map, the extracted outline,
and the published Reading structure table in
`docs/product/celpip-exam-rules-research.md` section 3, which gives
Reading Part 2 as 8 questions.

### Numbering gaps in the source, and how they were resolved

Two, both recorded in the content file header.

- **Question 1 has no `1.` label in the document.** Its four options run
  directly under the `Questions:` heading and the labels resume at `2.`.
  `docs/product/mock-test-1-content-map.md` already flagged this and asked
  for it to be verified when the content was entered. It was: the answer
  key table's first entry is `little experience`, which is the first
  option in that unlabelled list, so the mapping is confirmed rather than
  assumed. The numbering below it is 1 to 5 in document order.
- **Questions 6, 7 and 8 print no numbers at all.** They are three whole
  questions under the line `Using the drop-down menu, choose the best
  option.` Their numbering comes from the answer key table, which runs
  Question 1 to Question 8 and puts `roommate`, `returning to school` and
  `to prepare for a trip abroad` last, in the same order the questions
  appear.

---

## 5. Question types used

Two, and the second is new to the engine.

| Questions | Type | Shape |
| --- | --- | --- |
| 1 to 5 | Inline blank in a response | No stem of their own. The sentence each completes is in the email above the list. |
| 6 to 8 | Whole question | A complete sentence ending in a question mark, with no blank anywhere in it. |

Both are answered from a drop-down with four options and one selection,
which is what the source document's own instruction lines describe.

Questions 1 to 5 are exactly the shape Reading Part 1 questions 7 to 11
already use, so they needed nothing new: they carry no `textBefore`, and
the list prints the number alone while the email above echoes each chosen
answer back into the sentence it lands in.

Questions 6 to 8 are new. Reading Part 1 has stem questions and reply
blanks, and neither fits a question like "What is Gerry's relationship to
Charlie?": storing it as a stem would mean drawing a blank the source does
not have, and storing it as a reply blank would mean printing nothing at
all. So `ReadingQuestion` gained an optional `text` field for a question
the source writes whole, and `ReadingQuestionList` gained a branch that
prints it with no blank drawn.

`text` and `textBefore` are mutually exclusive in practice. They are two
optional fields rather than a discriminated union, for the same reason the
first two shapes already shared one type: the difference changes one line
of layout and nothing else.

---

## 6. Timer behaviour

**9 minutes, 540 seconds, for the whole part.** Amber at 60 seconds
remaining, red at 20.

Stored on the content object as `timer`, with `source: "published"`, the
same way Reading Part 1 stores its own. Rendered by the shared
`ExamCountdownTimer` in the top bar of the split screen, which is the
Reading Part 1 timer pattern reused unchanged.

### Where the figure comes from, and the absence of a conflict

`docs/product/celpip-exam-rules-research.md` sections 3 and 10 give
Reading Part 2 as 9 minutes, published per part in the official Reading
Overview PDF. `docs/product/mock-test-1-content-map.md` reads 9 minutes
off an official screenshot.

**The two sources agree, so nothing had to be preferred over anything.**
This is not a placeholder and it is not derived. That is a difference from
Reading Part 1, where the published table said 11 minutes and the
screenshot said 10, and the published figure had to be chosen and the
disagreement written up.

### What the timer does and does not do

- It counts down live, from the moment the split screen is reached.
- The window is keyed to the flow screen id, so it belongs to the screen
  and answering a question does not restart it. Reading is timed per part
  in every source we hold, which
  `docs/product/celpip-exam-rules-research.md` section 11 records.
- Warning and urgent states work: the reading turns amber at one minute
  and red at twenty seconds.
- At zero it shows "Time is up" and stops.
- **It does not auto-submit.** No `onTimeExpire` handler is passed.
- **It does not erase answers.** Every selection is still in place after
  the window closes, and the learner finishes the part by hand.
- It does not gate Next and does not move the learner anywhere.

The part intro screen carries no countdown. The window starts when the
diagram does. The completion screen carries none either, because nothing
is being timed on a screen with no task on it.

Strict full Reading timing, and whatever a Reading section flow decides
should happen at zero, are later work. The screen already takes an
`onTimeExpire` handler, so a section flow that has to move a learner on
passes one and nothing here has to change.

---

## 7. Answer state strategy

Local React state in `ReadingPartTwoPrototype`, in the shape the ticket
asks for and the shape Reading Part 1 already uses:

```
{ questionId: selectedOptionId }
```

The prototype owns two pieces of state: which screen is showing, an index
into the flow, and the answers. Selections are written through
`setReadingAnswer` from `reading-flow.ts`, which returns a new object each
time so React sees a changed reference.

Answers survive moving between screens, because they are keyed by question
id rather than by screen position, and because the prototype stays mounted
across the whole part. Back from the completion screen lands on the split
screen with all 8 selections still in place.

Nothing else holds them:

- no database write, and no Supabase migration
- no server action, and no API route
- no `localStorage`, no `sessionStorage`, no cookie
- no attempt row and no persisted history

A page reload starts the part again with an empty answer map. That is
deliberate for a prototype and is said on screen, in the intro screen's
notice and again on the completion screen.

There is no marking state machine here, which is the one real structural
difference from `ReadingPartOnePrototype`. Part 1 holds a request id and a
four state machine because it sends answers to a server action and waits
for a result. Part 2 sends nothing anywhere in this ticket.

---

## 8. Blank answer behaviour

Blanks are allowed everywhere and block nothing.

- A question with no selection simply has no key in the answer map.
- **Nothing gates Next on the split screen.** A learner can leave any
  number of questions blank, including all eight, and still reach the
  completion screen. This is the EXAM-17 rule inherited rather than
  rediscovered: Reading Part 1 originally held Next disabled until every
  question was answered, which trapped a learner who could not answer one
  of them on the last screen of the part with no way forward. The gate was
  removed there and was never built here.
- The drop-down's placeholder is a real option with an empty value, so an
  unanswered question reads "Select answer" rather than silently
  defaulting to the first option.
- Under the question column, the progress line says how many of the eight
  are answered. While any are outstanding it adds the shared hint, that
  continuing with questions unanswered is allowed and that a blank is
  counted as incorrect. So leaving one is an informed choice rather than
  an accident.
- The completion screen prints "You answered X of 8 questions." It reports
  the shortfall without treating it as a failure to finish.

Nothing in this ticket counts a blank as anything, because nothing in this
ticket marks anything. The wording above describes what marking will do
when EXAM-19 builds it, and matches what Reading Part 1's marking already
does.

---

## 9. Answer key status

**Present, complete, confirmed, stored, and never sent to the browser.**

The source document prints the Reading answer keys as text, in four tables
under "Answers & Explanations". The Part 2 table gives eight answers:

| Question | Correct option |
| --- | --- |
| 1 | little experience |
| 2 | seems more demanding |
| 3 | teaches functional language |
| 4 | many people like it |
| 5 | it may be too much work |
| 6 | roommate |
| 7 | returning to school |
| 8 | to prepare for a trip abroad |

Every one of the eight was matched to an existing option by exact text. No
option text was changed to make a key fit and nothing was guessed. Each
entry carries `source: "document"` and a trailing comment repeating the
option text, so an id can be checked against its question without
scrolling and a later edit to an option cannot quietly move an answer.

### How it is kept off the client

Two rules, the same two Reading Part 1 follows.

- The key lives in the content module, which is imported by the server
  component only.
- The route calls `withoutReadingAnswerKey(readingPart2)` before the
  content crosses to the client prototype. That strips both places a key
  can hide in a Reading part, `content.answerKey` and each question's
  `correctOptionId`, and rebuilds the question groups rather than mutating
  them, so the module level object is left as it was.

A client component receives its props as serialized data, so a key handed
down that way would be readable in the page payload before a learner had
answered anything. It is not handed down.

**Nothing reads the key in this ticket.** It is stored and stripped and
that is all. No score is calculated, no correct answer is shown, and the
prototype has no way to obtain one.

---

## 10. Visual layout

Neutral exam style throughout, consistent with Reading Part 1 and the
completed Listening exam mode.

- Neutral exam background. No orange, no marketing background.
- No dashboard sidebar, header, breadcrumb trail or footer inside the
  route.
- No internal preview label on the exam surface.
- Fixed top exam bar carrying the part title, the countdown and Next.
- Fixed bottom bar carrying Back.
- The middle content area is stable and the document does not scroll.
- No official CELPIP branding anywhere.

### The split screen

The canvas is unpadded and the split draws no outer rule of its own, so
the canvas border is the only rule around the work area and the divider
runs the full height between the two columns. Both columns scroll on their
own at the same fixed height, so a tall brochure never pushes the
questions off the screen and neither column can make the page scroll.

That is `ReadingTwoColumnLayout`, shared with Reading Part 1 and used
unchanged. Its own note already anticipated this part: it says Part 2 is
the diagram variant and needs nothing from it that Part 1 does not, and
that turned out to be true.

### The diagram column

Labelled "Diagram" rather than "Reading passage", because the column holds
a picture and calling it a passage would describe the wrong thing.

The picture is a plain `img` rather than `next/image`, for the reason
`ListeningScenarioScreen` records: the file is a remote Cloudinary asset,
so `next/image` would need an `images.remotePatterns` entry in
`next.config.ts` and would route licensed practice test artwork through
the Next image optimizer. A plain element keeps both out of scope.

Two things keep it behaving inside the exam canvas.

- **No layout shift.** The content file carries the file's intrinsic 412
  by 557, the screen puts them on the element as `width` and `height`, and
  the browser reserves the right box from the ratio before the file
  arrives. So the question column beside it does not jump when the picture
  loads. The size lives on the content rather than as a hard coded aspect
  ratio in a class recipe, so it cannot go stale if the asset is ever
  replaced.
- **No distortion.** The class recipe sets the width and leaves the height
  automatic, so the brochure fills its column, keeps its own shape, and
  scrolls inside the column rather than being squashed to fit.

The picture is not lazy loaded. The diagram is the passage, so the screen
is unusable until it is on the page.

### The question column

Compact, on the light blue answer wash, and made of the shared
`ReadingQuestionPanel` and `ReadingQuestionList` rather than anything new.

The email sits in a plain white box, so it reads as a document on the
answer side rather than as more chrome. Above the salutation, the three
header lines print quieted and ruled off, so it reads as an email rather
than as a letter with an odd first paragraph.

An answered blank is echoed back into the email text, replacing the
underscores with the chosen option on a tinted background, which is what
lets a learner check a choice against the sentence it lands in. The
control stays in the list below, because option text here runs to several
words and a select inside the sentence would push the rest of the
paragraph around every time the value changed.

Questions 6 to 8 print their whole sentence in the header strip with no
blank drawn, and their select underneath.

---

## 11. Source gaps and timing conflicts

### No timing conflict

Both sources we hold give Reading Part 2 as 9 minutes and they agree. See
section 6.

### Gap 1: the diagram is an image, and its text is not in the repository

This is the one real gap, and it is an accessibility gap rather than a
build blocker.

The brochure is the passage. Every one of questions 1 to 5, and arguably 6
to 8, is answered by comparing what the email says against what the
brochure lists. The source document gives it only as a Cloudinary URL, so
the repository holds no text version of what is printed on it.

What was done about it: the `alt` text is a described summary written from
the image itself rather than a label naming it as a picture. It names the
three courses, the enrolment window, and the kinds of fact each course
entry carries, plus the centre's contact details and the enrolment
footnote. That is enough for a learner who cannot see it to know what the
diagram is and what it holds.

**It is not enough for them to answer the eight questions.** A full text
transcription of the brochure, course by course, is the fix, and it is a
content ticket rather than this one: transcribing licensed content into
production UI is work that should be checked against the source by a
person, and inventing it here is exactly what the ticket forbids. It
should be entered as a structured table beside the image, so the diagram
column can offer both.

Until then, this route is not offered to learners. Its only dashboard link
is the Internal preview card in section 1a, which is a build link for the
team and is dressed as one.

### Gap 2: no instruction line above the diagram

The source document prints no instruction above the brochure, only the
author note saying where it goes. `passageInstruction` is therefore unset
on the content object, and the diagram column prints no instruction line.
Writing one would be inventing source text.

The instruction the document does print, "Read the following email message
about the diagram on the left", is about the email and is carried on that
question group, where the document puts it.

### Gap 3: numbering absent from the source

Two places, both resolved against the answer key rather than guessed. See
section 4.

### Gap 4: no explanations

The source document gives no explanation for any Reading answer, in this
part or any other. `ReadingAnswerKeyEntry.explanation` is unset
throughout. Nothing invents one and no AI writes one, which is the rule
the Reading Part 1 review already holds.

---

## 12. What is intentionally not built

- No Reading Part 2 review screen
- No Reading Part 2 score screen
- No Reading Part 2 marking, and no server action for this route
- No Reading band estimate
- No Reading Part 3
- No Reading Part 4
- No full Reading section flow
- No database save, no attempt row, no migration
- No persisted attempt history
- No `localStorage` or any other browser storage
- No admin panel
- No full Mock Test 1 all-skills flow
- No student facing dashboard entry point for Reading. The two cards in
  section 1a are temporary internal preview links and say so
- No auto-submit when the timer expires
- No text transcription of the brochure diagram, see gap 1
- No payment, no live classes
- No change to Listening, Writing or Speaking

Nothing in Listening, Writing or Speaking was touched. Reading Part 1 was
not touched except through shared files, and only additively. See section
14.

---

## 13. How EXAM-19 should continue

Reading Part 2 review and score, following the shape EXAM-17 set for Part
1. The pieces are already in place and the work should be mostly wiring.

**1. Mark on the server, never in the browser.**

Add `actions.ts` beside the route with a `markReadingPartTwo` server
action, modelled on `markReadingPartOne`. It should import
`reading-part-2.ts` directly rather than trusting anything the browser
sends, verify the session again inside the action, sanitize the submitted
answer map against the real questions and options, and return finished
review rows plus a summary. The key must cross the boundary in neither
direction.

`markReadingPart` in `reading-score.ts` and `buildReadingReviewRows` in
`reading-review.ts` should both work on Part 2 as they stand.

**2. `formatReadingQuestionText` is already ready for the new shape.**

EXAM-18 taught it the whole question case, so questions 6 to 8 print their
own sentence in a review row rather than falling through to "Blank in the
written response." That was done in this ticket rather than left for the
next one, because without it a review row would have printed a wrong
string. Nothing calls it with a Part 2 question yet.

**3. Change the flow ending, not the flow builder.**

The prototype currently asks for `{ taskScreen: "diagram", ending: "complete" }`.
EXAM-19 drops the `ending` option so it falls to the `"score"` default,
which turns the three screen flow into four: intro, diagram, score,
review. `taskScreen: "diagram"` stays. This is the same one line move
EXAM-17 made for Part 1, and `buildReadingFlow` needs no change.

**4. Add the marking state machine to the prototype.**

Port the request id ref and the four state machine from
`ReadingPartOnePrototype`, including the stale reply guard. Kick marking
off from the handler that walks onto the score screen, not from an effect.

**5. Make the review and score wording a builder.**

`readingReviewCopy` in `reading-copy.ts` is written out for Reading Part 1
by name, with a note saying so: it says that the moment Reading Part 2
reaches its own review, it should become `buildReadingReviewCopy` and the
Part 1 export should become one call to it, which is the move EXAM-06 made
for Listening. EXAM-19 is that moment. Doing it now avoids a second
hand-written copy object.

Two constraints that carry over unchanged. Nothing may claim an official
CELPIP score or level; the result is a Toronto Academy practice score
every time it appears. And nothing may estimate a CELPIP Reading band from
one part, which needs the full section.

**6. Consider the shared closing screens.**

`ReadingPartCompleteScreen` says it is a candidate for sharing once there
are two real callers. After EXAM-19 there may be none, if Part 2 moves to
a score ending as Part 1 did. Leave it in place either way: a part built
before its key is confirmed can still ask for `{ ending: "complete" }`.

**Separate from EXAM-19:** the brochure transcription in gap 1 should be
raised as a content ticket. It is an accessibility fix, not a review
feature, and it should not be folded into the review work.

---

## Files added

```
src/app/dashboard/mock-tests/mock-test-1/reading/part-2/page.tsx
src/features/exam-engine/mock-tests/mock-test-1/reading-part-2.ts
src/components/exam/reading/ReadingPartTwoPrototype.tsx
src/components/exam/reading/ReadingPartTwoIntroScreen.tsx
src/components/exam/reading/ReadingPartTwoInformationScreen.tsx
src/components/exam/reading/ReadingPartTwoQuestionPanel.tsx
docs/product/reading-part-2-prototype.md
```

### What each component does, and why it is not a duplicate

`ReadingPartTwoPrototype` owns the flow and the answer state. It is a
smaller sibling of `ReadingPartOnePrototype`: same screen index and answer
map, no marking machine, because nothing is marked.

`ReadingPartTwoIntroScreen` is a thin named wrapper over the shared
`ReadingPartIntroScreen`, filling in the Part 2 format label. It is a
wrapper rather than a copy because the intro screen is already right: the
part name, bullets, summary, question count and time all come from the
content object, and the only Part 2 difference is what the learner is
given.

`ReadingPartTwoInformationScreen` is the diagram split screen. It is a
sibling of `ReadingCorrespondenceScreen` rather than a branch inside it.
The two share everything structural through `ReadingTwoColumnLayout`, the
shell and the timer, and differ in exactly one thing: Part 1's left column
is a letter and this one's is a picture with no prose beside it. Folding
both into one component would mean a screen with two mutually exclusive
halves and a flag choosing between them.

`ReadingPartTwoQuestionPanel` is the answer column: which groups go in it,
in what order, and the progress line under them. It draws neither panel
itself, both are the shared `ReadingQuestionPanel`. Reading Part 1 does
this same work inline inside `ReadingCorrespondenceScreen`; lifting it out
is what lets the Part 2 screen file be about the split and the timer. It
is also where Parts 3 and 4 will diverge: Part 3's answer column is nine
statements sharing one option list.

### Components reused unchanged in shape

```
src/components/exam/reading/ReadingTwoColumnLayout.tsx
src/components/exam/reading/ReadingPartIntroScreen.tsx
src/components/exam/reading/ReadingPartCompleteScreen.tsx
src/components/exam/reading/ReadingQuestionPanel.tsx    (one addition)
src/components/exam/reading/ReadingQuestionList.tsx     (one addition)
```

---

## 14. Files changed, and why none of them is a regression

Every change to a shared file is additive and guarded by an optional field
that Reading Part 1 does not set. Reading Part 1's content has no
`question.text`, no `response.headerLines` and no `passage.image`, and its
prototype calls `buildReadingFlow(content)` with no `taskScreen`, so it
still gets `"correspondence"` from the default.

```
src/features/exam-engine/reading-types.ts
```

Added `ReadingPassageImage` and `ReadingPassage.image`, optional. Added
`ReadingQuestion.text`, optional. Added `ReadingResponse.headerLines`,
optional. Added the `"diagram"` screen kind to `ReadingScreen`.

`width` and `height` are required on `ReadingPassageImage`, as `alt` is. A
content file that has the URL has the file, so the size is never
unknowable, and requiring it is what makes the no-layout-shift guarantee
structural rather than a thing a content file can forget.

```
src/features/exam-engine/reading-flow.ts
```

Added the `ReadingTaskScreen` type and the `taskScreen` option, defaulting
to `"correspondence"`. One line changed inside the builder.

```
src/features/exam-engine/reading-copy.ts
```

Added `diagramColumnLabel`, the Part 2 block (intro format label,
completion heading, restart label, page title, page description and exam
region label), and the `dashboard*` block holding the wording for the two
internal preview cards in section 1a. Nothing existing was reworded. Part
2 reuses
`partCompletePendingReview`, `partCompleteNotice` and
`blanksAllowedHint` unchanged, because all three are true of it too.

```
src/features/exam-engine/exam-theme.ts
```

Added `passageFigure`, `passageImage` and `passageCaption` for the diagram
column, and `responseHeader` and `responseHeaderLine` for the email
header, all on `examReading`. No existing recipe was touched.

```
src/components/exam/reading/ReadingQuestionList.tsx
```

One branch: a question carrying `text` prints it whole and draws no blank.
The stem and reply blank branches are unchanged and are what Reading Part
1 still takes.

```
src/components/exam/reading/ReadingQuestionPanel.tsx
```

One block: a response carrying `headerLines` prints them above the
salutation. Reading Part 1's reply carries none, so it renders exactly as
before.

```
src/features/exam-engine/reading-review.ts
```

One branch in `formatReadingQuestionText`, so a whole question prints its
own sentence in a review row instead of falling through to "Blank in the
written response." Nothing calls it with a Part 2 question yet, because
EXAM-18 builds no Part 2 review. This is the shared helper being made
correct for a shape that now exists, not the review being started. Reading
Part 1's rows are unaffected: none of its questions carries `text`.

```
src/features/navigation/exam-mode-routes.ts
```

Added the Reading Part 2 route to `EXAM_MODE_ROUTES`. Matching is exact,
so nothing else changed behaviour.

```
src/components/dashboard/DashboardMockTestCard.tsx
```

Added the two Reading internal preview cards in section 1a. The Listening
card's markup is unchanged in what it renders: its meta list moved into a
local `CardMetaList` helper that both kinds of card call, so the same
element tree comes out. No data is read, no state is held, and the
component is still a server component with no client boundary.

```
src/app/dashboard/mock-tests/mock-test-1/reading/part-1/page.tsx
src/app/dashboard/mock-tests/mock-test-1/reading/part-2/page.tsx
```

Comment only, in both. Each said the route was linked from nowhere and the
dashboard card pointed at Listening only. The second half is still true
and stays; the first half is not, so it now describes the internal preview
card and what makes it read as one.

### Regression check

- **Reading Part 1**: route builds and renders through the same four
  screen flow. Its content sets none of the new optional fields, so every
  new branch is skipped and it takes the paths it took before.
- **Listening**: untouched. No Listening type, content file, flow,
  component or route was changed. The Listening card on the dashboard
  keeps its wording, its solid panel, its `Available` pill, its meta line
  and its `Start Listening test` button.
- **Writing and Speaking**: untouched. No AI logic of any kind was
  changed.
- `npm run lint` passes. `npm run build` passes, with
  `/dashboard/mock-tests/mock-test-1/reading/part-2` in the route table.
- No dependency was installed and `package.json` was not changed.
