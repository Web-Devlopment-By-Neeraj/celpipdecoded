# EXAM-03 - Listening Part 1 Prototype

## Goal

Build the first real CELPIP-style mock test prototype using Mock Test 1 Listening Part 1 only.

This ticket should implement Listening Part 1: Listening to Problem Solving.

It should use the exam shell from EXAM-01 and the instruction/video screen components from EXAM-02.

Do not build the full Listening test.
Do not build Listening Parts 2 to 6.
Do not build Reading.
Do not build Writing.
Do not build Speaking.
Do not build the result page.
Do not build score calculation.
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

Use Mock Test 1 Listening Part 1 from:

mock-tests/mock-test-1/Mock Test 1 -Sajinlinks.docx

or the extracted documentation created in EXAM-00.

Listening Part 1 details:

- Section name: Listening to Problem Solving
- Scenario: conversation between a man and a woman at a dogsled tour business
- Conversation is split into 3 audio sections
- Questions: 8 total
- Question audio files are provided
- One image link is provided for the scenario
- Students choose one answer per question

Use the Cloudinary links from the Mock Test 1 source document.

Do not download media files in this ticket.

## Required route

Create a protected route:

src/app/dashboard/mock-tests/mock-test-1/listening/part-1/page.tsx

This route should render the Listening Part 1 prototype.

It can be linked from the internal preview area on the dashboard as:

Mock Test 1 Listening Part 1 Prototype

Mark it clearly as Internal preview until the full mock test flow exists.

## Required files to create

Create:

src/features/exam-engine/mock-tests/mock-test-1/listening-part-1.ts
src/features/exam-engine/listening-types.ts
src/features/exam-engine/listening-flow.ts
src/features/exam-engine/listening-copy.ts

src/components/exam/listening/ListeningPartIntroScreen.tsx
src/components/exam/listening/ListeningScenarioScreen.tsx
src/components/exam/listening/ListeningAudioScreen.tsx
src/components/exam/listening/ListeningQuestionScreen.tsx
src/components/exam/listening/ListeningSectionBreakScreen.tsx
src/components/exam/listening/ListeningPartOnePrototype.tsx

docs/product/listening-part-1-prototype.md

## Data structure

Create a typed content object for Listening Part 1.

It should include:

- testId
- sectionId
- title
- subtitle
- instructions
- scenario text
- scenario image URL
- conversation sections
- question groups
- questions
- options
- answer key if available, but do not show it yet

Suggested structure:

listeningPart1 = {
  testId: "mock-test-1",
  sectionId: "listening-part-1",
  title: "Practice Test 1 - Listening Part 1: Listening to Problem Solving",
  partTitle: "Listening to Problem Solving",
  instructions: [],
  scenario: {
    text: "...",
    imageUrl: "..."
  },
  sections: [
    {
      id: "section-1",
      conversationAudioUrl: "...",
      questions: [...]
    }
  ]
}

## Flow requirements

Implement a local client-side prototype flow.

Screen order:

1. Part intro screen

Shows:
- Listening to Problem Solving
- You will hear a conversation in 3 sections.
- You will hear each section only once.
- After each section, you will hear 2 or 3 questions.
- Choose the best answer to each question.

2. Scenario screen

Shows:
- Instructions
- scenario text
- scenario image
- Next button

3. Conversation audio section 1

Shows:
- Listen to the conversation.
- audio player for section 1
- Next button

4. Question 1

Shows:
- question audio player
- question 1 of 8
- answer options
- user selects one answer
- Next button

5. Question 2

Same as above.

6. Section break before section 2

Shows:
- You will hear the second section of the conversation shortly.
- small preparation placeholder
- Next button

7. Conversation audio section 2

8. Questions 3, 4, and 5

9. Section break before section 3

Shows:
- You will hear the third section of the conversation shortly.
- small preparation placeholder
- Next button

10. Conversation audio section 3

11. Questions 6, 7, and 8

12. Completion screen

Shows:
- Listening Part 1 complete
- You answered 8 questions
- Continue to answer review, disabled or Coming soon

Do not build answer review yet. That belongs to EXAM-04.

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

The official-style behavior should eventually be one-time playback, but do not overbuild it in this first prototype.

## Question behavior

For each question:

- show question number
- show question audio player
- show instruction: Choose the best answer to each question.
- show radio options
- store selected answer in local component state
- Next button should be disabled until an answer is selected
- preserve selected answer when moving back and forward within this prototype

Because this is a prototype, allow Back for testing.

## Visual requirements

Use EXAM-01 shell components.

The question screen should feel close to the reference:

- grey top bar
- timer area if provided
- left side audio/question prompt area
- right side light blue answer panel
- question number near top of answer panel
- radio options with horizontal separators
- compact text
- blue Next button
- Back button in bottom bar

Do not use marketing dashboard cards inside the exam canvas.

## Timer

Show a static timer label for question screens:

Time remaining: 30 seconds

Do not implement countdown yet.

For audio conversation screens, timer can be hidden.

## Internal preview link

If dashboard has internal preview links, add one more:

- Mock Test 1 Listening Part 1 Prototype
- /dashboard/mock-tests/mock-test-1/listening/part-1

Mark it Internal preview.

Do not expose this as a final public mock test.

## Result and answer review

Do not build result page in this ticket.

But prepare answer state so EXAM-04 can use it.

Suggested local state:

{
  questionId: selectedOptionId
}

No database save in this ticket.

## Documentation

Create:

docs/product/listening-part-1-prototype.md

Include:

1. Route created
2. Source content used
3. Screen sequence
4. Audio links used
5. Question count
6. What is interactive
7. What is intentionally not built
8. Known fidelity gaps
9. How EXAM-04 should continue

## Known fidelity gaps to document

Document these as intentional for now:

- audio does not autoplay
- audio can be replayed
- Next does not wait for audio completion
- timer is static
- answers are not saved to database
- result page is not built
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

- Listening Part 1 prototype route exists
- Listening Part 1 content is typed and centralized
- scenario screen uses the dogsled tour scenario image
- 3 conversation audio sections are represented
- 8 question screens are represented
- each question has audio and options
- selected answers are stored locally
- Next is disabled until answer selection on question screens
- section break screens exist
- completion screen exists
- dashboard internal preview link exists if internal preview section exists
- no answer review is built
- no score page is built
- no database save is built
- no full mock test flow is built
- no official screenshots are embedded
- no official CELPIP branding is copied
- existing Speaking and Writing AI flows are untouched
- no Supabase migration is created
- no dependencies are installed
- docs/product/listening-part-1-prototype.md exists
- npm run lint passes
- npm run build passes
