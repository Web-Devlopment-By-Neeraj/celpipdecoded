# EXAM-11 - Listening Part 5 Prototype

## Goal

Build Mock Test 1 Listening Part 5 prototype.

This ticket should implement Listening Part 5: Listening to a Discussion.

Part 5 uses a video discussion followed by 8 multiple-choice questions.

Do not build Listening Part 6.
Do not build the full Listening section.
Do not build Reading.
Do not build Writing.
Do not build Speaking.
Do not build the Part 5 answer review screen.
Do not build the Part 5 score screen.
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

Use Mock Test 1 Listening Part 5 from:

mock-tests/mock-test-1/Mock Test 1 -Sajinlinks.docx

or the extracted documentation created in EXAM-00.

Listening Part 5 details:

- Section name: Listening to a Discussion
- Scenario: discussion among three colleagues
- There are two women and one man
- They are in a meeting room at their workplace
- One video file
- Eight multiple-choice questions
- Students choose the best answer for each question

Use Cloudinary links from the Mock Test 1 source document.

Do not download media files in this ticket.

## Confirmed Part 5 answer key

The user provided the confirmed answer key from the Part 5 answer screenshot.

Store this answer key in the centralized content object, but do not build review or scoring yet.

Correct answers:

Question 1:
the format of the event

Question 2:
Their company regularly organizes fundraisers.

Question 3:
generating ideas

Question 4:
the chosen recipient of the funds

Question 5:
Bidders can make high bids for items they want.

Question 6:
It will encourage bidders to bid low.

Question 7:
It takes too long to process the results.

Question 8:
They will request outside input.

Important:

- Match correct answers by exact option text first.
- If punctuation differs, map to the closest existing option text.
- Do not guess if the option text is not present.
- Keep answer key hidden from the question screen.
- Part 5 review and score will be built in the next ticket.

## Required route

Create protected route:

src/app/dashboard/mock-tests/mock-test-1/listening/part-5/page.tsx

This route should render Listening Part 5 prototype.

Add an internal preview link on the dashboard if the internal preview area exists:

Mock Test 1 Listening Part 5 Prototype

Mark it Internal preview.

## Required files to create

Create:

src/features/exam-engine/mock-tests/mock-test-1/listening-part-5.ts
src/features/exam-engine/listening-video-types.ts
src/features/exam-engine/listening-video-flow.ts

src/components/exam/listening/ListeningPartFivePrototype.tsx
src/components/exam/listening/ListeningVideoScreen.tsx
src/components/exam/listening/ListeningVideoQuestionScreen.tsx
src/components/exam/listening/ListeningVideoQuestionList.tsx

Create or update shared components only if needed:

src/components/exam/listening/ListeningPartIntroScreen.tsx
src/components/exam/listening/ListeningScenarioScreen.tsx

Create documentation:

docs/product/listening-part-5-prototype.md

## Flow requirements

Implement a local client-side prototype flow.

Screen order:

1. Part intro screen

Shows:

- Listening to a Discussion
- You will watch a 2-minute video.
- Then 8 questions will appear.
- Choose the best way to answer each question.

2. Scenario screen

Shows:

- Instructions
- You will watch a discussion among three colleagues.
- There are two women and one man.
- They are in a meeting room at their workplace.
- Next button

3. Video screen

Shows:

- Watch the discussion.
- native video player for Part 5 video
- Next button

4. Question screen

Shows all 8 multiple-choice questions on one screen.

Each question should show:

- question number
- question text
- four radio options
- one selected answer per question

Next should be disabled until all 8 questions have a selected answer.

5. Completion screen

Shows:

- Listening Part 5 complete
- You answered 8 questions
- Continue to answer review, disabled or Coming soon

Do not build Part 5 answer review yet.

## Question content

Use the question text and options from the Mock Test 1 source.

Question 1:
What aspect of the fundraiser are the three colleagues debating?

Options:
- the recipient of the funds
- the format of the event
- the schedule of the auction
- the purpose of the fundraiser

Question 2:
Why are the three colleagues planning a fundraiser?

Options:
- Eric's wife asked the company for help.
- The hospital wards are in bad condition.
- Their company regularly organizes fundraisers.
- The employees enjoy participating in silent auctions.

Question 3:
What stage are the three colleagues at in their planning?

Options:
- generating ideas
- finalizing details
- distributing tasks
- awaiting approval

Question 4:
What is Eric pleased about?

Options:
- the new fundraising strategy
- the chosen recipient of the funds
- the postponed meeting time
- the traditional auction system

Question 5:
Which statement is true about a traditional silent auction?

Options:
- Bidders know how much each person bids.
- The highest bidders are notified immediately.
- It requires choosing an identification number.
- Bidders can make high bids for items they want.

Question 6:
Why does Marie dislike the change that Isabella suggested?

Options:
- It will make the auction longer.
- It will confuse experienced bidders.
- It will encourage bidders to bid low.
- It will make the auction less efficient.

Question 7:
Why does Isabella dislike traditional silent auctions?

Options:
- The system is difficult to understand.
- The bidding is too competitive.
- Bidders' names are made public.
- It takes too long to process the results.

Question 8:
How will the group's indecision be resolved?

Options:
- They will do further research.
- They will vote on the matter.
- They will request outside input.
- They will continue the debate later.

## Video behavior

Use native HTML video.

Rules:

- no autoplay
- controls visible
- preload metadata
- video URL from Cloudinary
- show fallback text if video cannot load
- do not force one-time playback yet
- do not block Next until video finishes yet
- document this as a later fidelity improvement

## Question behavior

For each question:

- store selected answer in local component state
- preserve selected answers when moving back and forward
- show radio options
- do not show correct answers on this screen
- do not calculate score yet

Next button should be disabled until all 8 questions are answered.

Because this is a prototype, allow Back for testing.

## Visual requirements

Use EXAM-01 shell components.

The video and question screens should feel close to the reference:

- grey top bar
- timer area with Time remaining: 30 seconds on the question screen
- white exam canvas
- compact instruction row
- video player centered in a clean bordered area
- question list with clear separators
- radio options
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

docs/product/listening-part-5-prototype.md

Include:

1. Route created
2. Source content used
3. Screen sequence
4. Video link used
5. Question count
6. Radio question behavior
7. Answer key stored
8. What is interactive
9. What is intentionally not built
10. Known fidelity gaps
11. How the next ticket should continue

## Known fidelity gaps to document

Document these as intentional for now:

- video does not autoplay
- video can be replayed
- Next does not wait for video completion
- timer is static
- answers are not saved to database
- result page is not built
- Part 5 answer review is not built
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

- Listening Part 5 prototype route exists
- Listening Part 5 content is typed and centralized
- workplace discussion scenario appears
- video is represented
- 8 multiple-choice questions are represented
- selected answers are stored locally
- Next is disabled until all 8 questions are answered
- completion screen exists
- Part 5 answer key is stored but not shown on the question screen
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
- docs/product/listening-part-5-prototype.md exists
- npm run lint passes
- npm run build passes
