// Which signed in routes run in exam mode (EXAM-15F, second QA pass).
//
// An exam mode route is a route that must fill the browser window with a
// test and show nothing else: no dashboard sidebar, no account pill, no
// breadcrumb trail, no footer, and none of the warm page background the
// rest of the signed in product uses.
//
// EXAM-15B covered the dashboard with a fixed overlay instead of teaching
// the shared shell about exam routes, deliberately, to keep test engine
// rules out of the frame every signed in screen uses. A browser test found
// the weakness in that approach: an overlay only ever covers chrome, so
// the chrome is still mounted, still focusable, still read by a screen
// reader, and one CSS change anywhere up the tree that creates a
// containing block turns the overlay back into a box inside the dashboard
// content column. The route is exam mode or it is not, so the shell asks
// this module and renders accordingly, and the overlay's job shrinks to
// owning the viewport rather than hiding a page.
//
// This list holds routes, not prefixes, and matching is exact. That is the
// point: /dashboard/mock-tests/mock-test-1/listening is the test a learner
// sits, and the six Listening part routes under it are internal
// development routes that keep their dashboard chrome, their preview
// headings and their prototype notices. Adding one of them here would
// silently turn a development route into something that looks like a real
// test.
//
// The Reading Part 1 route is the exception, added by EXAM-16, and it is
// an exception on purpose. A Reading part is a split screen with a
// scrolling passage on one side and a scrolling question column on the
// other, and that screen cannot be judged, or used, inside the dashboard
// content column. Its ticket asks for a locked exam surface with no
// sidebar and no preview label, so it gets one. What the Listening part
// routes say in a preview notice, it says on the screens themselves: the
// part intro and the completion screen both state that nothing is saved
// and no score is produced.
//
// EXAM-18 added the Reading Part 2 route on the same reasoning, and with
// one more reason of its own: Part 2's left column is a tall course
// brochure image, and a diagram that has to be read to answer eight
// questions cannot be squeezed into a dashboard content column.
//
// EXAM-20 added the Reading Part 3 route, again on the same reasoning and
// again with one more reason of its own: Part 3 is answered by scanning
// back and forth between five lettered paragraphs on the left and nine
// statements on the right, so both columns have to be on screen at once
// for the part to be answerable at all.
//
// EXAM-22 added the Reading Part 4 route, which completes the four. Its
// own reason is length: a five paragraph article on the left, and on the
// right five sentence stems and a reader comment holding five more
// blanks. Both columns have to scroll independently, which is exactly
// what a dashboard content column cannot give them.
//
// EXAM-24 added the full Reading section route, which is the Reading twin
// of the full Listening route at the top of the list. It is the run a
// learner sits rather than a part a developer checks, so it needs the
// locked exam surface at least as much as the four part routes do: it
// carries the same two scrolling columns for four parts running, and its
// score and review screens must not sit inside a dashboard content column
// with a breadcrumb trail above them.
//
// The four part routes stay listed beside it. They are unchanged by that
// ticket and are still the way to check one part on its own.
//
// EXAM-25 added the Writing section route. It needs the locked surface
// for a reason of its own: the screen is a situation to read on one side
// and a writing area on the other, and an editor a learner spends 27
// minutes in cannot sit in a dashboard content column with a sidebar
// beside it and a footer under it. Its own ticket asks for no preview
// label on the exam surface, so what the Listening part routes say in a
// preview notice it says on the screens themselves: the intro notice, the
// hint under the editor and the completion screen all state that nothing
// is saved and nothing is scored.
//
// EXAM-27 added the Speaking section route, which completes the four
// sections. It needs the locked surface for a reason none of the others
// have: a learner on a Speaking task screen is talking out loud into a
// microphone against a countdown, and every piece of dashboard chrome on
// that screen is something to look at instead of the picture they are
// describing. Its two clocks and its Stop recording button also have to
// stay on screen while the prompt column scrolls, which is what the
// locked viewport gives and a dashboard content column does not.
//
// Its own ticket asks for no preview label on the exam surface, so what
// the Listening part routes say in a preview notice it says on the
// screens themselves: the intro notice, the line under every recorder and
// the completion screen all state that nothing is saved, nothing is
// uploaded and nothing is scored.
//
// A trailing slash is tolerated because a typed URL can carry one. Query
// strings and hashes never reach usePathname, so they need no handling.
//
// House style: normal hyphens only, no long hyphens or em dashes.

export const EXAM_MODE_ROUTES: readonly string[] = [
  "/dashboard/mock-tests/mock-test-1/listening",
  "/dashboard/mock-tests/mock-test-1/reading",
  "/dashboard/mock-tests/mock-test-1/reading/part-1",
  "/dashboard/mock-tests/mock-test-1/reading/part-2",
  "/dashboard/mock-tests/mock-test-1/reading/part-3",
  "/dashboard/mock-tests/mock-test-1/reading/part-4",
  "/dashboard/mock-tests/mock-test-1/writing",
  "/dashboard/mock-tests/mock-test-1/speaking",
];

// Whether a pathname is one of the exam mode routes.
//
// Pure, and takes the pathname rather than reading it, so the shell can
// call it during a server render and a test can call it with a string.
export function isExamModeRoute(pathname: string): boolean {
  const normalised =
    pathname.length > 1 ? pathname.replace(/\/+$/, "") : pathname;

  return EXAM_MODE_ROUTES.includes(normalised);
}
