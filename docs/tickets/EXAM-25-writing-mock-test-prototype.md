# EXAM-25 - Writing Mock Test Section Prototype

## Goal

Build Mock Test 1 Writing section prototype.

This starts the Writing mock test flow after completing Listening and Reading.

This ticket should build only the Writing mock test screen experience:

- Writing section route
- Writing instructions screen
- Writing Task 1 screen
- Writing Task 2 screen
- text editor for both tasks
- timer support
- local answer state
- completion screen
- dashboard internal access

Do not build AI review in this ticket.
Do not build Writing score in this ticket.
Do not build estimated Writing band in this ticket.
Do not save answers to Supabase.
Do not create database migrations.
Do not build Speaking.
Do not build full all-skills mock test flow.
Do not build admin panel.
Do not change Listening unless fixing an accidental shared regression.
Do not change Reading unless fixing an accidental shared regression.
Do not change existing standalone Writing Practice AI flow.
Do not change existing standalone Speaking Practice AI flow.
Do not build payment.
Do not build live classes.
Do not copy official CELPIP branding into production UI.

## Product

Toronto Academy of Education CELPIP Preparation Program

Use practice wording:

- Toronto Academy writing practice
- Mock Test 1 - Writing
- practice response
- AI review will be added later
- not an official CELPIP score

Do not say:

- official CELPIP score
- official result
- guaranteed score
- pass guarantee

## Source content

Use this source file as the authority:

mock-tests/mock-test-1/Mock Test 1 -Sajinlinks.docx

Also inspect:

mock-tests/mock-test-1/extracted-content-outline.md
mock-tests/mock-test-1/extracted-links.md
docs/product/mock-test-1-content-map.md
docs/product/celpip-exam-rules-research.md
docs/product/admin-mock-test-builder-blueprint.md

Use the source document for:

- Writing section title
- Writing instructions
- Writing Task 1 prompt
- Writing Task 1 situation
- Writing Task 1 requirements
- Writing Task 2 prompt
- Writing Task 2 survey question
- Writing Task 2 response choices or position choices
- image links if available
- timing if available

Do not invent Writing prompts.
Do not invent task requirements.
Do not invent images.
Do not replace source wording with generic CELPIP knowledge.

If the source document is unclear, document the gap instead of guessing.

## Required route

Create protected route:

src/app/dashboard/mock-tests/mock-test-1/writing/page.tsx

URL:

/dashboard/mock-tests/mock-test-1/writing

This is the Writing mock test section prototype route.

## Required files to create or update

Create content file:

src/features/exam-engine/mock-tests/mock-test-1/writing-section.ts

Create writing mock test types:

src/features/exam-engine/writing-mock-types.ts

Create writing mock flow helpers:

src/features/exam-engine/writing-mock-flow.ts
src/features/exam-engine/writing-mock-copy.ts

Create components:

src/components/exam/writing/WritingSectionPrototype.tsx
src/components/exam/writing/WritingSectionIntroScreen.tsx
src/components/exam/writing/WritingTaskScreen.tsx
src/components/exam/writing/WritingPromptPanel.tsx
src/components/exam/writing/WritingResponseEditor.tsx
src/components/exam/writing/WritingTaskTransitionScreen.tsx
src/components/exam/writing/WritingSectionCompleteScreen.tsx
src/components/exam/writing/WritingWordCount.tsx

Reuse existing exam shell components where possible:

src/components/exam/ExamModeViewport.tsx
src/components/exam/ExamShell.tsx
src/components/exam/timer/ExamCountdownTimer.tsx
src/features/exam-engine/exam-theme.ts

Create documentation:

docs/product/writing-mock-test-prototype.md

Update dashboard:

Add internal preview card or button for:

Title:
Mock Test 1 - Writing Test

Badge:
Internal preview or Prototype

Route:
/dashboard/mock-tests/mock-test-1/writing

Description:
Writing section prototype with Task 1 and Task 2 editors. AI review will be added next.

Button:
Open Writing Test

Keep existing Listening and Reading cards untouched.

Do not claim full all-skills Mock Test 1 is complete yet.

## Expected Writing structure

Build only what the Mock Test 1 source supports.

Expected writing section:

1. Writing Task 1
Usually email writing.

2. Writing Task 2
Usually survey response.

Use the exact task prompts and task requirements from the source.

## Screen flow

Create a local client-side flow.

Suggested flow:

1. Writing section intro

Shows:

- Mock Test 1 - Writing
- practice-only note
- includes Task 1 and Task 2
- no AI review yet
- Next button

2. Writing Task 1

Shows:

- task title
- source prompt
- writing instructions
- text editor
- word count
- timer
- Next button

3. Transition to Writing Task 2

Shows:

- Task 1 complete
- Task 1 word count
- Continue to Task 2

4. Writing Task 2

Shows:

- task title
- source prompt
- survey or choice prompt
- writing instructions
- text editor
- word count
- timer
- Finish Writing button

5. Completion screen

Shows:

- Writing section complete
- Task 1 word count
- Task 2 word count
- AI review and estimated score will be added in the next ticket
- Restart Writing
- Return to dashboard

Do not call AI in this ticket.

## Answer state

Use local React state.

Suggested shape:

{
  task1Response: string,
  task2Response: string
}

or:

{
  [taskId: string]: string
}

Do not save to database.
Do not use localStorage.
Do not use cookies.
Do not call Supabase.
Do not submit to existing Writing Practice evaluator yet.

## Timer behavior

Use source-supported timing if available.

If source or research docs specify official Writing timing, use the appropriate timing for the mock test section and document the source.

If exact task-level timing is unclear, use a clearly documented placeholder.

For this prototype:

- timer should count down live
- warning and urgent states should work
- time-up should show "Time is up"
- do not auto-submit yet
- do not erase written responses when time expires
- user can continue manually

Strict Writing timing can be handled later.

## Editor behavior

Writing editor should:

- allow multiline typing
- preserve typed text during navigation
- show word count
- not auto-save
- not submit to AI
- not block empty responses in this prototype
- show simple placeholder text
- be readable on desktop
- be usable on mobile if possible

## Word count

Create a simple word count helper or component.

Word count should:

- count words from typed response
- update live
- show 0 when empty
- avoid crashing on whitespace-only input

Do not enforce official word count minimums yet unless the source explicitly requires it.

## AI review

Do not implement AI review in this ticket.

But design the flow so EXAM-26 can add:

- server action or API call
- reuse existing Writing Practice AI evaluator where safe
- AI feedback
- estimated Writing band
- task-level feedback
- full Writing result screen

Document how EXAM-26 should continue.

## Visual requirements

Writing section should feel consistent with Listening and Reading exam mode:

- neutral exam background
- no orange or marketing background
- no dashboard sidebar inside exam route
- no internal preview label inside exam surface
- fixed top exam bar
- fixed bottom navigation where appropriate
- stable middle content area
- internal scroll only where needed
- full browser-width exam experience is acceptable
- no official CELPIP branding

The writing screen should be comfortable:

- prompt panel readable
- editor large enough for writing
- word count visible
- timer visible
- buttons clear

## Dashboard behavior

Dashboard Mock tests section should show:

- Mock Test 1 - Listening Test
- Mock Test 1 - Reading Test
- Mock Test 1 - Writing Test

Writing should be marked internal preview or prototype.

Do not show individual writing task cards on dashboard.

## Documentation

Create:

docs/product/writing-mock-test-prototype.md

Include:

1. Route created
2. Source content used
3. Tasks included
4. Prompt structure
5. Timer behavior
6. Answer state strategy
7. Editor behavior
8. Word count behavior
9. Dashboard link status
10. What is intentionally not built
11. EXAM-26 continuation note

## Known intentional gaps

Document these:

- no AI review yet
- no Writing score yet
- no estimated Writing band yet
- no persisted attempt history
- no database save
- no admin panel
- no Speaking mock test section yet
- no full all-skills mock test flow yet

## Security requirements

- Do not read .env.local
- Do not print secrets
- Do not touch Supabase service role
- Do not change auth
- Do not create migrations
- Do not save writing responses to database
- Do not call OpenAI in this ticket
- Do not expose secrets in client code

## Manual Supabase steps

None.

Do not create migrations.

## Style rule

Use normal hyphens only.
Do not use em dashes.
Do not use long hyphens.
Use straight quotes only.

## Validation

Run:

npm run lint
npm run build

Search changed files for:

- long hyphens
- em dashes
- curly quotes

Replace with normal hyphens and straight quotes.

## Done criteria

- Writing route exists
- Writing section intro appears
- Writing Task 1 prompt appears from source content
- Writing Task 2 prompt appears from source content
- User can type Task 1 response
- User can type Task 2 response
- Responses preserve during navigation
- Word count updates live
- Timer displays and counts down
- Completion screen appears
- Empty responses are allowed
- No AI review is built
- No Writing score is built
- No estimated Writing band is built
- No database save is created
- No Supabase migration is created
- Dashboard has internal Writing access
- Existing Listening route still works
- Existing Reading full route still works
- Existing individual Reading routes still work
- Existing standalone Writing Practice AI flow is untouched
- Existing standalone Speaking Practice AI flow is untouched
- docs/product/writing-mock-test-prototype.md exists
- npm run lint passes
- npm run build passes
