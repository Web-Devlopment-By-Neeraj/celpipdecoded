# Full Listening exam mode shell (EXAM-15B)

House style: normal hyphens only, no long hyphens or em dashes.

## 1. What problem was fixed

The full Mock Test 1 Listening route worked, but it did not look like a
test. It looked like an internal dashboard details page with an exam
frame somewhere in the middle of it.

Sitting on the route before this ticket:

- the dashboard breadcrumb trail, reading Dashboard / Details / Details /
  Details
- an INTERNAL PREVIEW eyebrow above the page heading
- the page heading "Mock Test 1 Full Listening Section"
- a page description paragraph under the heading
- a dashed internal preview warning box above the exam frame
- the dashboard sidebar, sticky header and footer around all of it
- normal browser page scrolling, so the exam top bar scrolled off the
  screen and the Back and Next area drifted below the fold on the longer
  screens

A learner opening the one Mock Test 1 card on the dashboard landed in
something that read as a prototype under construction. EXAM-15B makes the
route a locked computer based test screen: the exam and nothing else, one
viewport tall, with the browser page unable to scroll.

## 2. Route updated

Only one route changed:

    /dashboard/mock-tests/mock-test-1/listening

File:

    src/app/dashboard/mock-tests/mock-test-1/listening/page.tsx

## 3. How dashboard chrome was removed or covered

Two different mechanisms, because the chrome came from two places.

**Page level chrome was removed.** The heading, the eyebrow, the
description and the preview warning box were the page's own markup. The
page used to render `AppPageShell` with a title, an `examCopy.previewBadge`
eyebrow and a description, plus a dashed notice paragraph above the flow.
All of that is gone. The page now renders the exam and nothing else.

**Layout level chrome is covered.** The breadcrumbs, the sidebar, the
sticky top navigation and the footer come from `src/app/dashboard/layout.tsx`
by way of `AppShell`, which every signed in screen shares. That layout has
no route aware chrome switch, so Option A from the ticket was not
available without teaching the shared shell about exam routes, which would
put test engine rules into the frame the whole signed in product uses.

Option B was taken instead. The route renders inside `ExamModeViewport`, a
fixed overlay pinned over the whole window at `z-[60]`. The dashboard is
still mounted underneath and is still what the learner returns to, it is
simply not on screen while the test is. `z-[60]` is above the sticky app
header at `z-50` and the mobile navigation drawer at `z-40`, so nothing
shows through at the top of the screen.

The route keeps its place under `/dashboard`, so the layout auth guard
still covers it, and the page still verifies the session again close to
the content.

## 4. Exam viewport strategy

New component:

    src/components/exam/ExamModeViewport.tsx

It is a client component that takes the exam flow as children and an
accessible `label`, and renders two elements. The class recipes are
`examViewport` in `src/features/exam-engine/exam-theme.ts`:

- outer: `fixed inset-0 z-[60] overflow-hidden bg-academy-paper-warm`
- inner: `mx-auto flex h-[100dvh] w-full flex-col overflow-hidden p-2 sm:p-3`

`100dvh` rather than `100vh`, so a mobile browser retracting its address
bar does not leave the bottom navigation area hanging below the visible
window.

The exam frame fills that box because of a change in the same theme file.
`examFrame.page`, `examFrame.container` and `examFrame.frame` now each ask
for the full height of their parent, and `examCanvas.region` grows into
whatever height the frame has left after the two bars.

That request is deliberately inert outside exam mode. A percentage height
resolves to auto when the parent's own height comes from its content,
which is the case on every ordinary page, and a flex child cannot grow
into free space that does not exist. So the six part level routes,
`shell-preview` and `instruction-preview` draw exactly as they did before,
while the same classes make the frame exactly one viewport tall inside the
fixed viewport. No screen component needed a new prop, and no screen has to
know which mode it is in.

The result is a three band layout that never moves:

- fixed height exam top bar, holding the title, the meta line and Next
- the canvas between them, taking all the remaining height
- fixed height bottom bar, holding Back

## 5. Scroll lock strategy

`ExamModeViewport` sets `overflow: hidden` on both `document.documentElement`
and `document.body` in an effect while it is mounted, and puts the previous
inline values back in the cleanup. Both elements are set because either one
alone leaves a browser somewhere still able to scroll the document.

Restoring the previous inline value rather than clearing it means leaving
the exam by any route returns the document to whatever it had before: the
end of section "Back to dashboard" link, the browser back button, or any
client side navigation away from the route.

The overlay itself is `overflow-hidden` and the inner box is
`overflow-hidden`, so even if the document lock were bypassed the exam
frame has nowhere to move.

## 6. Which areas can scroll internally

Exactly one region on an exam screen scrolls: the canvas, which is
`examCanvas.region`, the grey gutter holding the white sheet. It is
`grow min-h-0 overflow-y-auto`, so it takes the height the two bars leave
and scrolls anything longer than that inside itself.

The screens where that matters:

- Part 4, the five dropdown completion questions on one screen
- Part 5, the eight multiple-choice questions on one screen
- Part 6, the six viewpoints questions on one screen
- the full answer review, which is six part tables stacked in one column
- the practice score with the part breakdown, on a short window

The white sheet inside the canvas grows to fill it, so a short screen such
as a part transition shows a full height white page rather than a band of
grey underneath it, and never shrinks below its own content, so a long
screen pushes the canvas into scrolling instead of being cut off.

The answer review tables keep the horizontal scrolling they already had
inside their own wrappers, so a narrow window never scrolls the exam frame
sideways.

## 7. Flow preserved

The flow is untouched. `buildListeningSectionFlow` and
`ListeningSectionPrototype` were not changed by this ticket, so the run is
still, in order:

1. Listening instruction screen
2. Listening instructional video screen
3. Part 1
4. Part 2
5. Part 3
6. Part 4
7. Part 5
8. Part 6
9. Full answer review over all 38 questions
10. Full practice score with the part breakdown
11. End of Listening section

No part level review, no part level score and no part level end screen
appears inside the full run, and no score of any kind appears between the
parts.

The score is unchanged: out of 38, with the six part breakdown, marked on
the server in `actions.ts` where the answer keys stay. No official CELPIP
score and no CELPIP level is shown. The review and score screens still
carry the line "This is a Toronto Academy practice result, not an official
CELPIP score."

Two pieces of copy did change, both route level naming rather than flow:

- the section title is now "Mock Test 1 - Listening Test", the same name as
  the dashboard card that opens it. It was "Practice Test 1 - Listening
  Section". The six part titles are unchanged, because they are shared with
  the internal part level routes.
- the instruction screen notice no longer opens with "Internal prototype."
  It still says answers are held on the screen, that nothing is saved, and
  that the practice score is not an official CELPIP result.

## 8. Routes preserved

These still work by direct URL and still look like internal routes. None
of them changed:

    /dashboard/mock-tests/mock-test-1/listening/part-1
    /dashboard/mock-tests/mock-test-1/listening/part-2
    /dashboard/mock-tests/mock-test-1/listening/part-3
    /dashboard/mock-tests/mock-test-1/listening/part-4
    /dashboard/mock-tests/mock-test-1/listening/part-5
    /dashboard/mock-tests/mock-test-1/listening/part-6
    /dashboard/mock-tests/shell-preview
    /dashboard/mock-tests/instruction-preview

They keep their internal preview headings, their eyebrow badges and their
notices, and they are still not linked from the dashboard. They are the
way to check one part during development.

The dashboard is unchanged and still shows one card, "Mock Test 1 -
Listening Test", pointing at the full route. No individual preview cards
came back.

## 9. What is intentionally not built

Still intentional after this ticket:

- media can still be replayed
- media does not autoplay
- Next does not wait for media to finish
- timers are static, nothing counts down
- no database save for Listening attempts
- no persisted Listening score history
- no Listening attempt review after the visit ends, a reload starts the
  test again
- no full Mock Test 1 assembly across Listening, Reading, Writing and
  Speaking
- no Reading, Writing or Speaking work in this ticket
- no payment and no live classes
- no fullscreen API request and no attempt to block the browser back
  button, tab switching or a reload. The screen is locked visually, not
  proctored, and a proctoring story is its own ticket
- no exit control inside the run. The way out is the "Back to dashboard"
  link on the end of section screen, or the browser back button

## 10. How EXAM-16 Reading should start next

`ExamModeViewport` is section agnostic on purpose. It takes children and a
label and knows nothing about Listening, and the height behaviour that
fills it lives in the shared `examFrame` and `examCanvas` recipes, which
every `ExamShell` screen already uses. Reading gets exam mode for free.

Suggested order for EXAM-16:

1. Build the Reading content files under
   `src/features/exam-engine/mock-tests/mock-test-1/`, one per part, with
   the answer keys in them, the same shape the Listening part files use.
2. Build the Reading screen types the section needs that Listening does
   not, principally a passage beside a question set. `ExamTwoColumnLayout`
   and the `examTwoColumn` recipes are already there for it. The passage
   column will want its own internal scroll, which is the one place
   Reading differs from Listening under the fixed viewport: two scrolling
   regions on one screen rather than one.
3. Build the part level prototype routes first, under
   `/dashboard/mock-tests/mock-test-1/reading/part-N`, unlinked and
   noindex, the same way Listening was built.
4. Assemble the section flow, with the answer keys stripped on the server
   by a Reading equivalent of `withoutListeningSectionAnswerKeys` and the
   marking done in an `actions.ts` beside the route.
5. Only then add `/dashboard/mock-tests/mock-test-1/reading`, rendering the
   flow inside `ExamModeViewport` with no page chrome, exactly as this
   route does now, and add its dashboard card next to the Listening one.

Do not add a second copy of the viewport or a second scroll lock. If
Reading needs something the viewport does not do, change
`ExamModeViewport` so both sections get it.
