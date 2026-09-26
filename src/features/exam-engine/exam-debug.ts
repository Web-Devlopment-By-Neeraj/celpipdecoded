// Development switches for the mock test player (EXAM-UI-03).
//
// One flag so far, and it exists because a development affordance had
// leaked into the learner flow.
//
// The Listening part level answer review carried an "Answer key
// reference" panel with a "Show the answer and explanation sheet"
// disclosure under the results table. That is a staff control: it opens
// the published answer sheet for the whole part, which is the source a
// reviewer checks a key against and is not something a learner sitting a
// practice test should be handed. The part routes it appears on are
// reachable from a typed URL by anyone signed in, so "it is an internal
// route" was never a control.
//
// So it is off unless it is asked for. NEXT_PUBLIC_SHOW_EXAM_ANSWER_KEY
// set to the string "true" turns it back on, and nothing else does. Any
// other value, an empty value, and the variable being absent all mean
// hidden, which is what a normal local run and every deployment get
// without anybody configuring anything.
//
// **Why NEXT_PUBLIC.** The review screen is a client component, so the
// flag has to survive into the browser bundle, and only NEXT_PUBLIC_
// variables do. Next inlines it at build time, so this reads as a
// constant rather than a lookup and a production build with the variable
// unset has no path to the panel at all.
//
// **What this is not.** It is not a security boundary and nothing here
// pretends otherwise. It hides a link to an image; it does not decide who
// may see an answer. The real protection is unchanged and lives on the
// server: every route strips its answer key before the content crosses to
// the browser, and marking happens in a server action beside the key. A
// learner cannot read an answer out of the page whether this flag is on
// or off. See docs/brand/listening-screen-polish-and-dropdown-fix.md.
//
// House style: normal hyphens only, no long hyphens or em dashes.

export const SHOW_EXAM_ANSWER_KEY_REFERENCE =
  process.env.NEXT_PUBLIC_SHOW_EXAM_ANSWER_KEY === "true";
