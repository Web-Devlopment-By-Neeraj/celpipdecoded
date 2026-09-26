# EXAM-09 - Listening Part 4 Prototype

## Goal

Build Mock Test 1 Listening Part 4 prototype.

This ticket should implement Listening Part 4: Listening to a News Item.

Part 4 is different from Listening Parts 1 to 3. It uses one news audio item followed by 5 dropdown-style completion questions.

Do not build Listening Part 5.
Do not build Listening Part 6.
Do not build the full Listening section.
Do not build Reading.
Do not build Writing.
Do not build Speaking.
Do not build the Part 4 answer review screen.
Do not build the Part 4 score screen.
Do not save answers to Supabase.
Do not create Supabase migrations.
Do not change existing Speaking AI logic.
Do not change existing Writing AI logic.
Do not change AI scoring prompts.
Do not build payment.
Do not build live classes.
Do not use official screenshots as public UI images.
Do not copy official CELPIP branding into production UI.

## Product

Toronto Academy of Education CELPIP Preparation Program

## Source content

Use Mock Test 1 Listening Part 4 from:

mock-tests/mock-test-1/Mock Test 1 -Sajinlinks.docx

or the extracted documentation created in EXAM-00.

Listening Part 4 details:

- Section name: Listening to a News Item
- Scenario: news story about a magician
- One news audio file
- Five dropdown-style completion questions
- Students choose the best way to complete each statement

Use Cloudinary links from the Mock Test 1 source document.

Do not download media files in this ticket.

## Confirmed Part 4 answer key

The user provided the confirmed answer key from the Part 4 answer screenshot.

Store this answer key in the centralized content object, but do not build review or scoring yet.

Correct answers:

Question 1:
tearing up a $20 bill.

Question 2:
took a picture of her $20 bill.

Question 3:
had different numbers.

Question 4:
a school project.

Question 5:
stole money from his audience.

Important:

- Match correct answers by exact option text first.
- If punctuation differs, map to the closest existing option text.
- Do not guess if the option text is not present.
- Keep answer key hidden from the question screen.
- Part 4 review and score will be built in the next ticket.

## Required route

Create protected route:

src/app/dashboard/mock-tests/mock-test-1/listening/part-4/page.tsx

This route should render Listening Part 4 prototype.

Add an internal preview link on the dashboard if the internal preview area exists:

Mock Test 1 Listening Part 4 Prototype

Mark it Internal preview.

## Required files to create

Create:

src/features/exam-engine/mock-tests/mock-test-1/listening-part-4.ts
src/features/exam-engine/listening-dropdown-types.ts

src/components/exam/listening/ListeningPartFourPrototype.tsx
src/components/exam/listening/ListeningDropdownQuestionScreen.tsx
src/components/exam/listening/ListeningDropdownQuestionList.tsx

Create or update shared components only if needed:

src/components/exam/listening/ListeningPartIntroScreen.tsx
src/components/exam/listening/ListeningScenarioScreen.tsx
src/components/exam/listening/ListeningAudioScreen.tsx

Create documentation:

docs/product/listening-part-4-prototype.md

## Flow requirements

Implement a local client-side prototype flow.

Screen order:

1. Part intro screen

Shows:

- Listening to a News Item
- You will hear a news item once.
- It is about 1.5 minutes long.
- Then 5 questions will appear.
- Choose the best way to complete each statement from the drop-down menu.

2. Scenario screen

Shows:

- Instructions
- You will hear a news story about a magician.
- Next button

3. News audio screen

Shows:

- Listen to the following news item.
- audio player for Part 4 news item
- Next button

4. Dropdown question screen

Shows all 5 completion questions on one screen.

Each question should show:

- question number
- incomplete statement
- select/dropdown input
- four answer choices

Next should be disabled until all 5 dropdowns have a selected answer.

5. Completion screen

Shows:

- Listening Part 4 complete
- You answered 5 questions
- Continue to answer review, disabled or Coming soon

Do not build Part 4 answer review yet.

## Question content

Use these five completion statements and options from the Mock Test 1 source.

Question 1:

Statement:
One of the magician's tricks involved ___________

Options:
- giving away a $20 bill.
- copying a $20 bill.
- making a $20 bill disappear.
- tearing up a $20 bill.

Question 2:

Statement:
Before giving the magician money, Patricia ___________

Options:
- asked her father for another $20 bill.
- took a picture of her $20 bill.
- took a picture of the magician.
- wrote down the serial number.

Question 3:

Statement:
Patricia noticed that the new bill ___________

Options:
- had different numbers.
- had bigger numbers.
- had a serial number.
- had the same number.

Question 4:

Statement:
Patricia knew about counterfeit from ___________

Options:
- a course on currency.
- a museum tour.
- a school project.
- training in fake money.

Question 5:

Statement:
The magician was in trouble because he ___________

Options:
- stole money from the bank.
- stole money from his audience.
- tore a $20 bill into pieces.
- used Patricia's $20 bill in his show.

## Audio behavior

Use native HTML audio.

Rules:

- no autoplay
- controls visible
- preload metadata
- audio URL from Cloudinary
- show fallback text if audio cannot load
- do not force one-time playback yet
- do not block Next until audio finishes yet
- document this as a later fidelity improvement

## Dropdown behavior

For each dropdown:

- store selected answer in local component state
- preserve selected answers when moving back and forward
- show a default placeholder such as "Select answer"
- do not show correct answers on this screen
- do not calculate score yet

Next button should be disabled until all 5 questions are answered.

Because this is a prototype, allow Back for testing.

## Visual requirements

Use EXAM-01 shell components.

The dropdown question screen should feel close to the reference:

- grey top bar
- timer area with Time remaining: 30 seconds
- white exam canvas
- compact instruction row
- left aligned question list
- dropdown controls inline or beneath each statement
- clear question separators
- blue Next button
- Back button in bottom bar

Do not use marketing dashboard cards inside the exam canvas.

## Result and answer review

Do not build result page in this ticket.

But prepare local answer state so the next ticket can use it.

Suggested local state:

{
  questionId: selectedOptionId
}

No database save in this ticket.

## Documentation

Create:

docs/product/listening-part-4-prototype.md

Include:

1. Route created
2. Source content used
3. Screen sequence
4. Audio link used
5. Question count
6. Dropdown question behavior
7. Answer key stored
8. What is interactive
9. What is intentionally not built
10. Known fidelity gaps
11. How the next ticket should continue

## Known fidelity gaps to document

Document these as intentional for now:

- audio does not autoplay
- audio can be replayed
- Next does not wait for audio completion
- timer is static
- answers are not saved to database
- result page is not built
- Part 4 answer review is not built
- full Listening section is not built

## Security requirements

- Do not read .env.local
- Do not print secrets
- Do not touch API routes
- Do not touch Supabase helpers
- Do not call service role
- Do not change auth
- Do not create migrations

## Manual Supabase steps

None.

Do not create migrations.

## Important UI copy rule

Do not use long hyphens or em dashes anywhere in UI copy, docs, comments, or prompts. Use normal hyphens only.

## Done criteria

- Listening Part 4 prototype route exists
- Listening Part 4 content is typed and centralized
- news item scenario appears
- news audio is represented
- 5 dropdown completion questions are represented
- selected answers are stored locally
- Next is disabled until all 5 dropdowns are answered
- completion screen exists
- Part 4 answer key is stored but not shown on the question screen
- dashboard internal preview link exists if internal preview section exists
- no answer review is built
- no score page is built
- no database save is built
- no full Listening section is built
- no official screenshots are embedded
- no official CELPIP branding is copied
- existing Speaking and Writing AI flows are untouched
- no Supabase migration is created
- no dependencies are installed
- docs/product/listening-part-4-prototype.md exists
- npm run lint passes
- npm run build passes
