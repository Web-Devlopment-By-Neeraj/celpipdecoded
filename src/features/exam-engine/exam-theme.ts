// Class recipes for the mock test player screen bodies (EXAM-01,
// re-scoped by EXAM-UI-02).
//
// Same idea as src/features/design/design-tokens.ts: every value is a
// Tailwind class string, and the raw colours stay in src/app/globals.css.
//
// **What is in this file and what is not** (EXAM-UI-02). The player chrome
// moved out, to mock-test-player-theme.ts beside this one: the desk, the
// centred window, the two bars, the content pane, the buttons, the timer
// badge, the split pane and the question panel all live there now. What is
// left here is what a screen body is built from, which is instruction
// rows, media, audio and video, question lists, passages, editors, review
// tables and score cards.
//
// The split is worth keeping. Chrome answers "how wide is the exam window
// and where does the scrollbar go", and there should be exactly one place
// that decides it. Screen recipes answer "what does a Part 5 question look
// like", and there are forty of those.
//
// **Colour.** The recipes are written against the academy-* palette
// tokens, and inside the player those tokens are re-pointed to the neutral
// player ramp by the [data-mock-test-player] rule in globals.css. So a
// recipe reading bg-academy-navy-soft draws in the brand ink tint on an
// internal preview page and in the player grey inside a mock test, without
// the recipe knowing which. That is how the ticket's separation of brand
// UI from exam UI is enforced in one place rather than forty.
//
// **Typography** (EXAM-UI-02). Every size in this file moved up one step:
// body copy from 13 to 15 pixels, secondary copy from 12 to 14, labels and
// captions from 11 to 12, and screen headings to 18. The engine was
// written at toolbar sizes, which was legible on the internal preview
// pages it was built against and too small to sit a two hour test in. The
// brief asks for 15 to 17 body, 16 to 18 for task instructions and 18 to
// 22 for a section title, and that is what these now are.
//
// The exam surface intentionally looks different from the dashboard. It
// uses square corners instead of pill controls, tight chrome, and no
// cards or badges, so it reads as a focused test environment.
//
// House style: normal hyphens only, no long hyphens or em dashes.

import type { ExamTimerState } from "./exam-shell-types";
import type { ListeningReviewStatus } from "./listening-review-types";
import type { ReadingReviewStatus } from "./reading-types";

// Screen heading row, retired by the EXAM-UI-03 reference pass.
//
// examInstruction lived here: the row recipe, the heading and the
// sentence under it, written against the academy tokens. It moved to
// playerInstruction in mock-test-player-theme.ts, beside the rules list
// it introduces, for two reasons.
//
// The circled glyph had already gone that way in EXAM-UI-03, so the mark
// and the line it sits in were being described in two files. And the
// reference pass sets both the lead line and the rules under it in the
// same instruction blue on the same measure, which is one decision and
// should have one owner. See MockTestInstructionList and
// ExamInstructionRow, which both read playerInstruction now.

// Media placeholder.
//
// A flat grey box with a solid rule and a small inert transport strip,
// which is how an audio or video area reads in test software. No player
// is built in this ticket, this is the area a later ticket drops one
// into.
export const examMedia = {
  base: "flex min-w-0 flex-col items-center justify-center gap-2 rounded-sm border border-academy-line bg-academy-navy-soft px-4 py-4 text-center",
  video: "aspect-video justify-center",
  glyph: "text-academy-navy/40",
  label: "text-[15px] font-semibold leading-5 text-academy-navy",
  helper: "max-w-md text-[12px] leading-4 text-academy-navy/60",
  // Inert transport strip: play glyph, track, time. Nothing is seekable.
  transport:
    "mt-1 flex w-full max-w-sm min-w-0 items-center gap-2 rounded-sm border border-academy-line bg-academy-paper px-2 py-1",
  transportButton:
    "flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-academy-navy/40 text-academy-paper",
  track: "h-1 min-w-0 flex-1 overflow-hidden rounded-full bg-academy-navy/12",
  trackFill: "h-full w-1/3 rounded-full bg-academy-navy/35",
  time: "shrink-0 text-[11px] leading-4 tabular-nums text-academy-navy/55",
} as const;

// Real video player, added by EXAM-02 for the instructional video
// screens.
//
// The clip sits in a clean bordered area: a dark stage holding the video
// itself, and a thin caption strip under it carrying the clip title and
// its running time when one is known. The stage is aspect-video and the
// element fills it, so the box keeps its shape on any width and the
// screen never scrolls sideways.
//
// This is the same slot the grey ExamMediaPlaceholder reserves. A screen
// swaps one for the other without changing the layout around it.
export const examVideo = {
  wrap: "min-w-0 overflow-hidden rounded-sm border border-academy-line bg-academy-paper",
  stage: "relative aspect-video w-full min-w-0 bg-academy-navy-dark",
  element: "absolute inset-0 block h-full w-full",
  caption:
    "flex min-w-0 flex-wrap items-center justify-between gap-x-3 gap-y-0.5 border-t border-academy-line px-3 py-1.5",
  captionTitle:
    "min-w-0 truncate text-[12px] font-semibold uppercase tracking-[0.06em] text-academy-navy/70",
  captionMeta: "shrink-0 text-[12px] leading-4 tabular-nums text-academy-navy/55",
  // Shown in place of the stage when the clip cannot load.
  fallback:
    "flex min-w-0 flex-col items-center justify-center gap-1 bg-academy-navy-soft px-4 py-8 text-center",
  fallbackTitle: "text-[15px] font-semibold leading-5 text-academy-navy",
  fallbackText: "max-w-md text-[12px] leading-4 text-academy-navy/60",
  // Shown under the stage when the browser refused to start the clip on
  // its own (EXAM-15F). Same strip the audio player uses, same reason.
  autoplayNotice:
    "min-w-0 border-t border-academy-line bg-academy-navy-soft px-3 py-1.5 text-[12px] leading-4 text-academy-navy",
} as const;

// Section intro block at the top of an instruction screen.
//
// A quiet bordered strip, not a dashboard card: no shadow, no artwork, no
// pill. It states which section the learner is about to start and, when
// they are known, a few facts about it such as the number of parts.
// Quieted by the reference pass. It used to be a filled, bordered card
// with a 17 pixel bold title on it, which is a card on a page rather than
// a line above a set of rules: on the Listening part intro it repeated
// the part name the window title bar was already showing, in the largest
// type on the screen.
//
// It is a ruled strip now. The facts it carries are the same and the
// counts still read, but nothing on it outweighs the instructions under
// it, and it ends in a hairline rather than in a box.
export const examIntroCard = {
  card: "flex min-w-0 flex-col gap-0.5 border-b border-academy-line/70 pb-2.5",
  label: "text-[11px] font-semibold uppercase tracking-[0.08em] text-academy-navy/45",
  title: "text-[15px] font-semibold leading-6 text-academy-navy",
  summary: "text-[15px] leading-6 text-academy-navy/75",
  detailList: "mt-1 flex min-w-0 flex-wrap gap-x-4 gap-y-1",
  detailItem: "flex min-w-0 items-baseline gap-1 text-[12px] leading-4",
  detailLabel: "font-semibold uppercase tracking-[0.06em] text-academy-navy/45",
  detailValue: "tabular-nums text-academy-navy/70",
} as const;

// Shared body scaffolding for the instruction and video screens.
export const examScreenBody = {
  stack: "flex min-w-0 flex-col gap-4",
  // The player column is capped, so a wide screen does not stretch the
  // clip across the full canvas. EXAM-UI-02 took it down a step, from
  // max-w-3xl to max-w-2xl: the stage is 16 by 9, so every pixel of width
  // costs 56 percent of one in height, and at the wider cap the whole
  // video screen was taller than a laptop content pane on its own.
  videoStack: "mx-auto flex w-full min-w-0 max-w-2xl flex-col gap-3",
  actions: "flex min-w-0 flex-wrap items-center gap-3",
  // Quiet note under the list or the player.
  //
  // A line, not a box. The reference pass took the border and the grey
  // fill off it: an instructions screen that ends in a bordered panel
  // reads as a product page with a callout on it, and the practice
  // caveats this carries are a footnote to the rules above rather than a
  // second block competing with them.
  notice: "text-[12px] leading-5 text-academy-navy/60",
  hint: "text-[12px] leading-4 text-academy-navy/60",
} as const;

// Question progress line, for example Question 3 of 8.
export const examProgress = {
  wrap: "flex min-w-0 flex-col gap-1.5",
  label: "text-[12px] font-semibold uppercase tracking-[0.06em] text-academy-navy/70",
  track: "h-1 w-full overflow-hidden rounded-full bg-academy-navy/12",
  fill: "h-full rounded-full bg-academy-blue transition-[width] duration-300",
} as const;

// Native audio player, added by EXAM-03 for the Listening screens.
//
// Same idea as examVideo above: a bordered box holding the player, and a
// thin caption strip under it carrying the clip name and its running time
// when one is known. There is no dark stage, because an audio element has
// no picture, so the control bar sits on the paper background and gets a
// little breathing room around it.
export const examAudio = {
  wrap: "min-w-0 overflow-hidden rounded-sm border border-academy-line bg-academy-paper",
  stage: "min-w-0 bg-academy-navy-soft/35 px-3 py-3",
  element: "block h-10 w-full min-w-0",
  caption:
    "flex min-w-0 flex-wrap items-center justify-between gap-x-3 gap-y-0.5 border-t border-academy-line px-3 py-1.5",
  captionTitle:
    "min-w-0 truncate text-[12px] font-semibold uppercase tracking-[0.06em] text-academy-navy/70",
  captionMeta:
    "shrink-0 text-[12px] leading-4 tabular-nums text-academy-navy/55",
  // Shown in place of the control bar when the clip cannot load.
  fallback:
    "flex min-w-0 flex-col items-center justify-center gap-1 bg-academy-navy-soft px-4 py-6 text-center",
  fallbackTitle: "text-[15px] font-semibold leading-5 text-academy-navy",
  fallbackText: "max-w-md text-[12px] leading-4 text-academy-navy/60",
  // Shown under the controls when the browser refused to start the clip on
  // its own (EXAM-15F). A quiet strip rather than a banner: the controls
  // are right above it and still work, so this is a pointer, not an error.
  autoplayNotice:
    "min-w-0 border-t border-academy-line bg-academy-navy-soft px-3 py-1.5 text-[12px] leading-4 text-academy-navy",
} as const;

// Listening screens (EXAM-03).
//
// The answer side of a question screen is a compact radio list with a
// horizontal rule between rows, matching the reference layout: no card
// per option, no pill, and no icon. The whole row is the click target, so
// a learner never has to hit the small circle itself.
//
// The scenario picture is capped and centred rather than stretched, so a
// wide canvas does not blow the illustration up past its natural size.
//
// The option row recipes moved to playerOption in
// mock-test-player-theme.ts in EXAM-UI-03, with MockTestOptionRow drawing
// them. Three question screens each had their own copy of "what does an
// option look like and what happens on hover", which is how the three
// drifted into three different hover washes. One owner, one answer.
export const examListening = {
  // The answerHeader recipe that used to sit here is gone. The reference
  // pass replaced the small caps question label and the rule under it
  // with playerQuestionHeader in mock-test-player-theme.ts, which sets
  // "Question 3 of 8" as a plain line and draws no rule: the first rule
  // in the answer column is the one above the first option.
  // The scenario picture is drawn by MockTestMediaFrame now (EXAM-UI-02),
  // which caps its height against the viewport so it cannot push the audio
  // controls and the questions after it out of reach. The figure, image
  // and caption recipes that used to live here moved with it, to
  // mock-test-player-theme.ts, where the Reading and Speaking pictures
  // read them too.
  // Column stack on the audio and question screens.
  mediaStack: "mx-auto flex w-full min-w-0 max-w-2xl flex-col gap-3",
  columnStack: "flex min-w-0 flex-col gap-3",
} as const;

// Listening one screen question lists (EXAM-09 and EXAM-11), retired by
// EXAM-UI-03.
//
// examListeningDropdown and examListeningChoice used to live here: one
// block of recipes for the Part 4 and Part 6 completion lists and another
// for the Part 5 radio list. Both are gone.
//
// Part 5 became a drop-down screen in EXAM-UI-03, so all three one screen
// Listening parts are now one control, and that control is
// MockTestDropdownCompletion reading playerDropdown in
// mock-test-player-theme.ts. Two recipe blocks describing the same block,
// strip and select, kept in step by hand, is exactly the drift this
// ticket was raised to fix, so the survivor is the one with a single
// owner. See docs/brand/listening-screen-polish-and-dropdown-fix.md.

// Reading split screen (EXAM-16).
//
// Screen type 8: the passage on the left with its own scrollbar, the
// question panels on the right with theirs. The split itself is
// examTwoColumn above, which already draws the divider and the answer
// side wash, so nothing here repeats it. What is here is what goes
// inside the two columns.
//
// Reading prose runs at leading-6 rather than the leading-5 the rest of
// the exam canvas uses. A Listening screen prints a sentence at a time
// and a Reading screen prints four paragraphs of a letter, and a passage
// set at question density is a passage nobody wants to read.
//
// The passage is a letter, so the salutation and the sign off are their
// own lines rather than being folded into the first and last paragraphs.
export const examReading = {
  // Left column: the passage.
  passage: "flex min-w-0 flex-col gap-3",
  passageHeading: "text-[15px] font-semibold leading-6 text-academy-navy",
  passageParagraph: "text-[15px] leading-7 text-academy-navy/85",
  // Sign off lines sit together with no gap between them, so the name
  // reads as being under the closing rather than as a new paragraph.
  passageSignOff: "flex min-w-0 flex-col",
  passageSignOffLine: "text-[15px] leading-7 text-academy-navy/85",

  // Left column: labelled paragraphs rather than running prose
  // (EXAM-20).
  //
  // Reading Part 3 is answered by naming a paragraph, so the label has to
  // be findable at a glance while scanning. It is drawn as a marker in
  // its own narrow column beside the text rather than run into the first
  // sentence, which keeps the letters in a straight vertical line down
  // the left edge and keeps the paragraph text on one comfortable
  // measure.
  //
  // The gap between sections is the stack's gap, so nothing here draws
  // rules or boxes: a bordered card per paragraph would make five
  // containers out of one article.
  passageSections: "flex min-w-0 flex-col gap-4",
  passageSection: "flex min-w-0 gap-2.5",
  passageSectionLabel:
    "w-4 shrink-0 text-[15px] font-semibold leading-6 tabular-nums text-academy-navy",
  passageSectionBody: "flex min-w-0 flex-col gap-2",

  // Left column: a diagram rather than prose (EXAM-18).
  //
  // Reading Part 2 is answered from a course brochure image, and that
  // picture is drawn by MockTestMediaFrame now (EXAM-UI-02) on its tall
  // setting, so the figure, image and caption recipes that used to be here
  // moved to mock-test-player-theme.ts. Layout shift is still handled on
  // the element rather than in a recipe: the content file carries the
  // picture's intrinsic width and height, the screen puts them on the img,
  // and the browser reserves the right box from the ratio before the file
  // arrives.

  // Right column: header lines above an email response (EXAM-18).
  //
  // The subject and the two addresses, one line each, quieted and ruled
  // off from the message body so they read as an email header rather than
  // as the first paragraph of the message.
  responseHeader:
    "flex min-w-0 flex-col border-b border-academy-line pb-2",
  responseHeaderLine:
    "text-[14px] leading-6 text-academy-navy/70 [overflow-wrap:anywhere]",

  // Right column: one or more question panels stacked.
  panelStack: "flex min-w-0 flex-col gap-5",
  panel: "flex min-w-0 flex-col gap-2",
  panelLabel:
    "text-[12px] font-semibold uppercase tracking-[0.06em] text-academy-navy/55",
  panelInstruction: "text-[14px] leading-6 text-academy-navy/70",

  // The written reply a completion group is answered inside. A plain
  // white box on the blue answer column, so the letter reads as a
  // document sitting on the answer side rather than as more chrome.
  response:
    "flex min-w-0 flex-col gap-3 rounded-sm border border-academy-line bg-academy-paper px-3 py-3",

  // A numbered blank inside the reply.
  //
  // The number stays, because it is what the reply and the review screens
  // point at, and the reply runs at leading-8 so the inline control in
  // each blank clears the line above it.
  //
  // responseBlankFilled is gone (EXAM-UI-05). The reply used to echo a
  // chosen answer back into its own sentence, because the control that
  // set it was in a list under the letter. The control is now in the
  // blank itself, so the echo would be a second copy of the answer beside
  // the thing showing it. responseBlank survives as the fallback for a
  // blank whose question is missing from the group, which no shipped
  // content is in.
  responseBlank: "text-academy-navy/45",
  responseBlankNumber: "font-semibold tabular-nums text-academy-navy/70",
  responseParagraph: "text-[15px] leading-8 text-academy-navy/85",

  // Answered count under the question column, beside Next being
  // unavailable.
  progressNote: "text-[12px] leading-4 text-academy-navy/60",
} as const;

// Reading question list (EXAM-16), retired by EXAM-UI-05.
//
// examReadingQuestion used to live here: the bordered block, the tinted
// statement strip and the native select the Reading drop-down questions
// were answered from. It is gone, and so is the second copy of a control
// the Listening screens already had.
//
// EXAM-UI-05 rebuilt the shared drop-down as a compact inline trigger
// with a floating menu, which is a behaviour change rather than a
// restyle, and two hand-kept copies of that is the drift the ticket was
// raised to stop. The one Reading-only item shape, a numbered blank whose
// sentence lives in the reply above the list, moved into the shared
// control as one branch. Reading now renders
// MockTestDropdownCompletion reading playerDropdown and playerSelect in
// mock-test-player-theme.ts, through the adapter in
// ReadingQuestionList.tsx. See
// docs/brand/objective-question-ui-fidelity-pass.md.

// Listening answer review and practice score screens (EXAM-04).
//
// The review table is result table chrome, not a dashboard list: hairline
// rules, a grey header row, tight rows, and tabular figures in the
// question column. Status is a word in its own column, coloured and
// weighted, with no pill, no dot and no badge, so a long table of them
// stays readable.
//
// The table scrolls inside its own wrapper on a narrow screen, so the
// exam frame never scrolls sideways.
export const examReview = {
  wrap: "min-w-0 overflow-x-auto rounded-sm border border-academy-line",
  table: "w-full min-w-[36rem] border-collapse text-left",
  caption: "sr-only",
  headRow: "bg-academy-navy-soft/55",
  headCell:
    "border-b border-academy-line px-3 py-1.5 text-[12px] font-semibold uppercase tracking-[0.06em] text-academy-navy/65",
  row: "border-b border-academy-line/70 last:border-b-0 align-top",
  cell: "px-3 py-2 text-[15px] leading-6 text-academy-navy/85",
  numberCell:
    "px-3 py-2 text-[15px] leading-6 font-semibold tabular-nums whitespace-nowrap text-academy-navy",
  // Used for a cell with nothing in it yet, for example a correct answer
  // that has not been transcribed.
  emptyCell: "px-3 py-2 text-[15px] leading-6 text-academy-navy/45",
  statusCell: "px-3 py-2 text-[15px] leading-6 font-semibold whitespace-nowrap",
  // Printed question under the question number, for a part that prints
  // its questions (EXAM-10). The number cell is nowrap and tabular, so
  // this resets both and caps its width, otherwise a five word statement
  // would stretch the column across the table.
  statement:
    "mt-0.5 block max-w-[16rem] text-[12px] font-normal leading-4 whitespace-normal normal-nums text-academy-navy/60",
  // Explanation line under a row, when the source gives one.
  explanation: "mt-0.5 block text-[12px] leading-4 text-academy-navy/60",
  // Reference panel holding the answer and explanation sheet.
  referenceStack: "flex min-w-0 flex-col gap-2",
  referenceToggle:
    "cursor-pointer text-[15px] font-semibold leading-5 text-academy-blue underline underline-offset-2",
  referenceFigure: "mt-2 flex w-full min-w-0 flex-col gap-1.5",
  referenceImage:
    "block h-auto max-h-[60vh] w-auto max-w-full min-w-0 rounded-sm border border-academy-line bg-academy-navy-soft/35 object-contain",
  referenceCaption: "text-[12px] leading-4 text-academy-navy/60",
} as const;

// Status colours for the review table.
//
// pending is deliberately the same quiet navy as an unanswered row. It is
// a statement about the answer key, not about the learner, so it must not
// read as a red mark.
export const examReviewStatusTones: Record<ListeningReviewStatus, string> = {
  correct: "text-academy-blue",
  incorrect: "text-academy-red",
  unanswered: "text-academy-navy/55",
  "answer-key-pending": "text-academy-navy/55",
};

// Practice score summary.
//
// A bordered strip of readings on the white canvas, not a dashboard card:
// no shadow, no artwork, no rounded pill. The headline reading is larger
// than the rest, and every reading is tabular so the row does not shift
// as numbers change.
export const examScore = {
  card: "flex min-w-0 flex-col gap-3 rounded-sm border border-academy-line bg-academy-navy-soft/35 px-4 py-3.5",
  grid: "grid min-w-0 grid-cols-2 gap-x-4 gap-y-3 sm:grid-cols-4",
  item: "flex min-w-0 flex-col gap-0.5",
  label: "text-[12px] font-semibold uppercase tracking-[0.06em] text-academy-navy/55",
  value: "text-[16px] font-semibold leading-6 tabular-nums text-academy-navy",
  headlineValue: "text-[22px] font-semibold leading-8 tabular-nums text-academy-navy",
  pendingValue: "text-[16px] font-semibold leading-6 text-academy-navy/45",
  // Pending block shown in place of a score.
  pending:
    "flex min-w-0 flex-col gap-1 rounded-sm border border-academy-line bg-academy-paper px-3 py-2.5",
  pendingHeading: "text-[15px] font-semibold leading-5 text-academy-navy",
  pendingText: "text-[12px] leading-4 text-academy-navy/70",
  // Practice result disclaimer under the readings.
  note: "text-[12px] leading-4 text-academy-navy/60",
} as const;

// Estimated band card on the Listening practice score screen (EXAM-15C).
//
// The same bordered strip as examScore above, on purpose: the estimate is
// one more reading on the same result screen, not a certificate. So there is
// no seal, no ribbon, no coloured band and nothing that could be mistaken
// for an official score report.
//
// The reading itself is the largest thing on the card and the notes under it
// are the smallest, because the notes are what stop the number being read as
// an official result and they have to sit with it rather than somewhere else
// on the screen.
export const examBandCard = {
  card: "flex min-w-0 flex-col gap-1 rounded-sm border border-academy-line bg-academy-navy-soft/35 px-4 py-3.5",
  label:
    "text-[12px] font-semibold uppercase tracking-[0.06em] text-academy-navy/55",
  value: "text-[22px] font-semibold leading-8 text-academy-navy",
  basis: "text-[15px] leading-6 text-academy-navy/85",
  note: "text-[12px] leading-4 text-academy-navy/60",
} as const;

// Full Listening section review and score screens (EXAM-15).
//
// The section review is six part groups stacked in one scroll, and the
// section score is the summary card plus a part breakdown table. Both are
// built from the EXAM-04 recipes above rather than from new chrome: a
// group here is a small heading over an examReview table, and the
// breakdown is an examReview table with three columns.
//
// What is added is only what stacking six tables needs. A group heading
// has to be quiet enough that six of them do not read as six pages, and
// the part label has to be separable from the section name so the two can
// sit on one line at different weights.
export const examSectionReview = {
  // The per part group chrome that used to be here is gone (EXAM-UI-02).
  // Both section reviews draw a part as a MockTestReviewPanel now: a
  // bordered box with a tinted header strip carrying the label and the
  // count, rather than a heading rule with a list running under it. What
  // is left is the score screen breakdown, which is a different block on a
  // different screen.
  //
  // Part breakdown block on the score screen.
  breakdown: "flex min-w-0 flex-col gap-2",
  breakdownTitle:
    "text-[12px] font-semibold uppercase tracking-[0.06em] text-academy-navy/55",
} as const;

// Reading practice score card (EXAM-17).
//
// The same bordered strip of readings examScore draws for Listening, with
// one addition the Reading result needs: a headline row carrying the
// percentage at the top of the card, above the four counts, because the
// Reading score screen has no separate score heading of its own to carry
// it.
//
// It is written out rather than importing examScore, for the reason
// examReadingQuestion gives above: the two cards hold different readings,
// and a token block named for Listening, read by Reading, is a rename
// away from being wrong in both places. What they share is the look, and
// the look is four class strings.
//
// No shadow, no artwork, no pill and no seal. This is a practice result,
// and nothing on it should be mistakeable for an official score report.
export const examReadingScore = {
  card: "flex min-w-0 flex-col gap-3 rounded-sm border border-academy-line bg-academy-navy-soft/35 px-4 py-3.5",
  // Percentage on the left, the sentence saying what it means on the
  // right, with a rule under the pair.
  headline:
    "flex min-w-0 flex-wrap items-baseline gap-x-4 gap-y-1 border-b border-academy-line pb-3",
  headlineBlock: "flex min-w-0 flex-col gap-0.5",
  headlineValue:
    "text-[22px] font-semibold leading-8 tabular-nums text-academy-navy",
  headlineMessage:
    "min-w-0 text-[15px] leading-6 text-academy-navy/85 sm:ml-auto sm:text-right",
  grid: "grid min-w-0 grid-cols-2 gap-x-4 gap-y-3 sm:grid-cols-4",
  item: "flex min-w-0 flex-col gap-0.5",
  label:
    "text-[12px] font-semibold uppercase tracking-[0.06em] text-academy-navy/55",
  value: "text-[16px] font-semibold leading-6 tabular-nums text-academy-navy",
  // The two notes under the readings: what a blank did to the score, and
  // that this is not an official CELPIP result.
  note: "text-[12px] leading-4 text-academy-navy/60",
} as const;

// Reading answer review card (EXAM-17).
//
// One card per question rather than a row in a table, which is where this
// parts company with the Listening review.
//
// A Listening review row is a number and two short options, so four
// columns fit and a table is the right shape for it. A Reading Part 1 row
// is a full sentence stem plus two option texts that are themselves
// sentences, and 11 of those in a four column table would be a wall of
// wrapped prose with a horizontal scrollbar under it. The card keeps the
// question on its own line at full width and puts the two answers side by
// side underneath, so a long stem costs height instead of legibility.
//
// It is the same boxed block examReadingQuestion draws on the question
// screen: a bordered item, a tinted header strip carrying the number and
// the question, and the content in the body under it. A learner reviewing
// question 7 should recognise the box they answered it in.
export const examReadingReview = {
  list: "flex min-w-0 flex-col gap-2",
  card: "min-w-0 overflow-hidden rounded-sm border border-academy-line bg-academy-paper",
  header:
    "flex min-w-0 flex-wrap items-baseline gap-x-3 gap-y-1 border-b border-academy-line bg-academy-navy-soft/60 px-3 py-2",
  number:
    "shrink-0 text-[12px] font-semibold uppercase tracking-[0.06em] tabular-nums text-academy-navy/55",
  question: "min-w-0 flex-1 text-[15px] leading-7 text-academy-navy",
  // Status word at the end of the header strip. A word, not a badge, so a
  // column of 11 of them stays quiet.
  status:
    "ml-auto shrink-0 text-[12px] font-semibold uppercase tracking-[0.06em]",
  // The two answers, stacked on a narrow screen and side by side from the
  // small breakpoint up.
  body: "flex min-w-0 flex-col gap-2 px-3 py-2.5 sm:flex-row sm:gap-4",
  answer: "flex min-w-0 flex-1 flex-col gap-0.5",
  answerLabel:
    "text-[12px] font-semibold uppercase tracking-[0.06em] text-academy-navy/55",
  answerText: "text-[15px] leading-6 text-academy-navy/85",
  // Used for "No answer selected", so a blank reads as empty rather than
  // as something the learner chose.
  answerTextEmpty: "text-[15px] leading-6 text-academy-navy/45",
  // The correct answer is the thing being looked up, so it carries a
  // little more weight than the answer beside it.
  answerTextCorrect:
    "text-[15px] font-semibold leading-5 text-academy-navy",
  // Explanation strip under the answers, when the source gives one. Mock
  // Test 1 Reading publishes none, so this draws nothing there.
  explanation:
    "border-t border-academy-line/70 px-3 py-2 text-[12px] leading-4 text-academy-navy/70",
} as const;

// Status colours for a Reading review card.
//
// blank is the same quiet navy as an unanswered Listening row rather than
// the red an incorrect answer carries. A blank is counted as incorrect in
// the score, which the score screen says out loud, but on the card it is
// a statement about what was left empty and does not need a second red
// mark to make the point.
export const examReadingReviewStatusTones: Record<ReadingReviewStatus, string> =
  {
    correct: "text-academy-blue",
    incorrect: "text-academy-red",
    blank: "text-academy-navy/55",
  };

// Writing task split screen (EXAM-25).
//
// Screen type 9: the situation on the left, and on the right the prompt,
// the positions where the task has them, and the editor. It reuses
// examTwoColumn for the split itself, so a Writing task and a Reading
// part read as the same piece of software.
//
// Three decisions worth stating, because they are what make the screen
// comfortable to write in rather than merely correct:
//
// - **Prose runs at leading-6, like Reading.** The situation is a
//   paragraph a learner reads properly before writing, not a question
//   stem they scan, so it is set at reading density and not at question
//   density.
// - **The editor is the tallest thing on the screen.** A response is 150
//   to 200 words, and an editor that shows two lines of it makes a
//   learner scroll their own writing to reread it. It is resizable
//   vertically as well, because a writer who wants more room should be
//   able to take it.
// - **The word count sits under the editor, not in the top bar.** It
//   belongs with the writing it counts, and the top bar already carries
//   the countdown. Tabular figures keep the row from shifting as the
//   number grows.
export const examWriting = {
  // Left column: the situation to read.
  situation: "flex min-w-0 flex-col gap-3",
  // The instruction line each column opens with, marked with the shared
  // information glyph and ruled off from what it introduces (EXAM-UI-03).
  // Both columns use it, so the two halves of the screen open the same
  // way and neither reads as the heading of the other.
  instructionRow: "border-b border-academy-line pb-2",
  situationInstruction: "text-[15px] font-semibold leading-6 text-academy-navy",
  situationHeading: "text-[15px] font-semibold leading-6 text-academy-navy",
  situationParagraph: "text-[15px] leading-7 text-academy-navy/85",

  // Right column: everything the learner answers with, stacked. The
  // prompt, the positions and the editor are three blocks rather than
  // one, so the gap between them is wider than the gap inside any of
  // them.
  taskColumn: "flex min-w-0 flex-col gap-4",

  // Right column: the prompt above the editor.
  prompt: "flex min-w-0 flex-col gap-2",
  promptInstruction:
    "text-[15px] font-semibold leading-6 text-academy-navy",
  requirementList: "flex min-w-0 list-disc flex-col gap-1 pl-5",
  requirementItem: "text-[15px] leading-7 text-academy-navy/85",

  // Right column: the positions on a task that offers a choice.
  //
  // The whole row is the click target, and the fieldset draws no
  // geometry: preflight has already stripped its border, padding and
  // margin.
  //
  // The two states were painted in EXAM-UI-04 and adopted everywhere in
  // EXAM-UI-05. The pointer leaves a pale green wash as it passes, and a
  // chosen row holds a warm wash with a hairline ring. The two are
  // different hues rather than two strengths of one, because a row under
  // the pointer and a row already chosen have to be told apart at a
  // glance while both are on screen.
  //
  // These rows used to be the only list painted this way, while every
  // graded option row in Listening and Reading had a neutral hover and a
  // green chosen wash. That meant the same gesture painted two different
  // colours depending on which section a learner was in. EXAM-UI-05
  // moved the whole player onto this pair, so the recipes here and
  // playerOption in mock-test-player-theme.ts now describe one thing. The
  // classes stay written out separately because these rows are bordered
  // cards on the Writing answer column and the Listening rows are ruled
  // lines in a list, which is geometry rather than state.
  choice: "flex min-w-0 flex-col gap-1.5",
  choiceFieldset: "w-full min-w-0",
  choiceLegend:
    "mb-1.5 block w-full min-w-0 text-[12px] font-semibold uppercase tracking-[0.06em] text-academy-navy/55",
  choiceList: "flex min-w-0 flex-col gap-1",
  choiceRow:
    "flex min-w-0 cursor-pointer items-start gap-2 rounded-sm border border-academy-line bg-academy-paper px-2.5 py-2 transition-colors hover:border-player-green-line/40 hover:bg-player-green-soft",
  choiceRowSelected:
    "border-player-orange-line/55 bg-player-orange-soft hover:border-player-orange-line/55 hover:bg-player-orange-soft",
  // The dot is the warm chosen colour, so it belongs to the wash under
  // it rather than sitting on it as a second accent (EXAM-UI-05).
  choiceInput:
    "mt-1 h-3.5 w-3.5 shrink-0 accent-player-orange-line focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-academy-blue",
  choiceText: "min-w-0 text-[15px] leading-6 text-academy-navy",
  choiceLabel: "font-semibold",
  choiceHint: "text-[12px] leading-4 text-academy-navy/60",

  // Shown under the positions when Next is pressed with none chosen
  // (EXAM-UI-04). The one validation message in the Writing section, so
  // it is a bordered line rather than a quiet hint: it has to be seen by
  // someone who has just pressed a control and watched nothing happen.
  choiceError:
    "flex min-w-0 items-start gap-2 rounded-sm border border-academy-red/40 bg-academy-red-soft px-2.5 py-2 text-[13px] leading-5 text-academy-red",

  // The chosen position, restated above the response box on the Task 2
  // editor screen (EXAM-UI-04).
  //
  // A reading of what was chosen on the screen before, not a second
  // control. The radios above it stay live, so this never becomes the
  // only way to see or change the choice.
  chosenNote:
    "flex min-w-0 flex-col gap-0.5 rounded-sm border border-player-orange-line/45 bg-player-orange-soft px-2.5 py-2",
  chosenNoteLabel:
    "text-[12px] font-semibold uppercase tracking-[0.06em] text-academy-navy/55",
  chosenNoteText: "min-w-0 text-[14px] leading-6 text-academy-navy",
  chosenNoteOption: "font-semibold",

  // Right column: the editor.
  //
  // The editor's own geometry moved to playerWritingEditor in
  // mock-test-player-theme.ts in EXAM-UI-03, where the field, its label
  // strip and the word count strip are one frame rather than three loose
  // blocks. Nothing is left here for it.

  // Word count row under the editor.
  countRow:
    "flex min-w-0 flex-wrap items-baseline gap-x-3 gap-y-0.5 text-[12px] leading-4",
  countLabel:
    "font-semibold uppercase tracking-[0.06em] text-academy-navy/55",
  countValue: "font-semibold tabular-nums text-academy-navy",
  countTarget: "tabular-nums text-academy-navy/60",

  // Completion screen stack, capped so two short columns of readings do
  // not stretch across a full width canvas.
  completeStack: "mx-auto flex w-full min-w-0 max-w-3xl flex-col gap-4",
  completeHeading: "text-[15px] font-semibold leading-5 text-academy-navy",
} as const;

// Writing AI review and practice estimate (EXAM-26).
//
// The result screen is long, and long is the problem it has to solve. One
// review carries an overall estimate, two task cards, eight criterion
// rows, two lists, up to eight corrections and two full rewrites, and a
// wall of that is a wall whatever colour it is painted.
//
// So the shape is a stack of bordered task cards, each one an internal
// stack of small labelled blocks, built from the same recipes the rest of
// the engine uses: examReview for the criterion table, examScreenBody for
// the actions, examBandCard for the headline reading. What is added below
// is only what a review needs and no screen before it did.
//
// Three decisions worth stating:
//
// - **The estimate is a reading, not a certificate.** The overall level
//   uses the same bordered strip the Listening band card uses, with no
//   seal, no ribbon and no colour, because nothing on a practice estimate
//   should be mistakeable for an official score report.
// - **A rewrite keeps its paragraphs.** Both rewrite blocks are set with
//   whitespace-pre-line, so the model's paragraph breaks survive into the
//   page. A 200 word email rendered as one block would be unreadable and
//   would also be wrong: paragraphing is one of the things being marked.
// - **A correction is a pair, not a sentence.** The learner's words and
//   the stronger version sit in two labelled halves, so a reader can see
//   the change rather than parse a description of it.
export const examWritingReview = {
  // Result screen column, capped so a review does not run the full width
  // of a wide canvas.
  stack: "mx-auto flex w-full min-w-0 max-w-3xl flex-col gap-4",

  // Practice-only disclaimer. Bordered rather than quiet, because it is
  // the sentence that stops the reading above it being taken for an
  // official score, and it has to be seen.
  disclaimer:
    "flex min-w-0 flex-col gap-0.5 rounded-sm border border-academy-line bg-academy-navy-soft/35 px-3 py-2.5",
  disclaimerLabel:
    "text-[12px] font-semibold uppercase tracking-[0.06em] text-academy-navy/55",
  disclaimerText: "text-[14px] leading-6 text-academy-navy/80",

  // One task card.
  cardList: "flex min-w-0 flex-col gap-4",
  card: "min-w-0 overflow-hidden rounded-sm border border-academy-line bg-academy-paper",
  cardHeader:
    "flex min-w-0 flex-wrap items-baseline gap-x-3 gap-y-1 border-b border-academy-line bg-academy-navy-soft/60 px-3 py-2",
  cardTitle: "min-w-0 flex-1 text-[15px] font-semibold leading-5 text-academy-navy",
  cardLevel:
    "ml-auto shrink-0 text-[15px] font-semibold leading-5 text-academy-navy",
  cardLevelLabel:
    "block text-[12px] font-normal uppercase tracking-[0.06em] text-academy-navy/55",
  cardBody: "flex min-w-0 flex-col gap-3.5 px-3 py-3",

  // Word count row at the top of a card body.
  metaRow: "flex min-w-0 flex-wrap items-baseline gap-x-5 gap-y-1",
  metaItem: "flex min-w-0 items-baseline gap-1.5 text-[12px] leading-4",
  metaLabel: "font-semibold uppercase tracking-[0.06em] text-academy-navy/55",
  metaValue: "font-semibold tabular-nums text-academy-navy",
  // Within or outside the word target. A word rather than a badge, and
  // outside is quiet navy rather than red: the target is guidance from
  // the prompt, so missing it is a note, not a mark.
  metaFlag: "text-[12px] font-semibold leading-4 text-academy-navy/70",

  // A labelled block inside a card body.
  section: "flex min-w-0 flex-col gap-1.5",
  sectionTitle:
    "text-[12px] font-semibold uppercase tracking-[0.06em] text-academy-navy/55",
  sectionText: "text-[15px] leading-7 text-academy-navy/85",

  // What worked and what held it back, side by side from the small
  // breakpoint up.
  feedbackSplit: "flex min-w-0 flex-col gap-3 sm:flex-row sm:gap-4",
  feedbackBlock: "flex min-w-0 flex-1 flex-col gap-1",

  // Plain bullet list, for missing prompt points and template warnings.
  list: "flex min-w-0 list-disc flex-col gap-1 pl-5",
  listItem: "text-[15px] leading-7 text-academy-navy/85",

  // Corrections. One bordered row per correction, each holding the two
  // labelled halves and the criterion it belongs to.
  mistakeList: "flex min-w-0 flex-col gap-1.5",
  mistakeRow:
    "flex min-w-0 flex-col gap-1.5 rounded-sm border border-academy-line bg-academy-navy-soft/25 px-2.5 py-2",
  mistakePair: "flex min-w-0 flex-col gap-1.5 sm:flex-row sm:gap-4",
  mistakeHalf: "flex min-w-0 flex-1 flex-col gap-0.5",
  mistakeLabel:
    "text-[12px] font-semibold uppercase tracking-[0.06em] text-academy-navy/55",
  mistakeOriginal: "text-[15px] leading-6 text-academy-navy/70 line-through",
  mistakeCorrection: "text-[15px] font-semibold leading-5 text-academy-navy",
  mistakeCriterion: "text-[12px] leading-4 text-academy-navy/55",

  // A rewrite or a model response. The prose keeps its paragraph breaks.
  rewrite:
    "flex min-w-0 flex-col gap-1.5 rounded-sm border border-academy-line bg-academy-paper px-3 py-2.5",
  rewriteHeader:
    "flex min-w-0 flex-wrap items-baseline gap-x-3 gap-y-0.5 border-b border-academy-line pb-1.5",
  rewriteTitle: "text-[15px] font-semibold leading-5 text-academy-navy",
  rewriteTarget:
    "ml-auto shrink-0 text-[12px] font-semibold uppercase tracking-[0.06em] text-academy-navy/55",
  rewriteIntro: "text-[12px] leading-4 text-academy-navy/60",
  rewriteBody:
    "whitespace-pre-line text-[15px] leading-7 text-academy-navy/85",

  // Shown in place of the criterion table, the corrections and the two
  // rewrites on a task that was left blank.
  insufficient:
    "flex min-w-0 flex-col gap-1 rounded-sm border border-academy-line bg-academy-navy-soft/35 px-3 py-2.5",
  insufficientHeading:
    "text-[15px] font-semibold leading-5 text-academy-navy",
  insufficientText: "text-[14px] leading-6 text-academy-navy/75",

  // Quiet line under the Submit for AI Review button.
  submitStack: "flex min-w-0 flex-col gap-2",
  submitHint: "text-[12px] leading-4 text-academy-navy/60",
} as const;

// Speaking mock test section (EXAM-27).
//
// A Speaking task screen is a split like the Writing one, but the two
// halves hold different things: the prompt and its pictures on the left,
// and on the right the recorder, the preview player and whatever went
// wrong. So it borrows examTwoColumn for the split and adds only what a
// spoken answer needs and no screen before it did.
//
// Four decisions worth stating:
//
// - **The picture is content, not decoration.** On Tasks 3, 4 and 8 the
//   picture is the thing being described, so the figure fills its column
//   and keeps its own aspect ratio, exactly as the Reading Part 2
//   brochure does. It is never hidden at a small width.
// - **The recorder is one block, not a toolbar.** The status line, the
//   controls and the player sit in one bordered panel, so a learner
//   always knows where the recording lives on the screen and never has to
//   hunt for the Stop button.
// - **Recording is announced by a dot, not by red chrome.** A recording
//   panel turns its status dot red and leaves everything else alone. The
//   alternative, washing the panel in red, reads as an error, and
//   recording is the normal case.
// - **An error is a bordered notice with its own control.** A microphone
//   failure has to say what happened and offer the one thing that can
//   help, so it is not a toast and not a red border on the button.
export const examSpeaking = {
  // Left column: the prompt and its pictures.
  prompt: "flex min-w-0 flex-col gap-3",
  // The task line, marked with the shared information glyph and ruled off
  // from the pictures and option cards under it (EXAM-UI-03). Same recipe
  // shape the Writing columns use, so a task line opens the same way in
  // both sections.
  instructionRow: "border-b border-academy-line pb-2",
  // Small caps heading for a block inside the column, for example the
  // line above a picture or the option cards.
  promptLabel:
    "text-[12px] font-semibold uppercase tracking-[0.06em] text-academy-navy/55",
  situationParagraph: "text-[15px] leading-7 text-academy-navy/85",
  // The source's own instruction sentence, which is the task itself.
  promptInstruction: "text-[15px] font-semibold leading-6 text-academy-navy",
  promptParagraph: "text-[15px] leading-7 text-academy-navy/85",
  // The quiet line that says how this screen differs from the source.
  promptNote:
    "rounded-sm border border-academy-line bg-academy-navy-soft/35 px-3 py-2 text-[12px] leading-4 text-academy-navy/70",

  // The either or pair on Task 6. The connector is a small caps lead in
  // above its sentence, which is how the source weights the two.
  alternativeList: "flex min-w-0 flex-col gap-2",
  alternativeLead: "text-[15px] font-semibold leading-5 text-academy-navy",
  alternativeRow:
    "flex min-w-0 flex-col gap-0.5 rounded-sm border border-academy-line bg-academy-paper px-2.5 py-2",
  alternativeConnector:
    "text-[12px] font-semibold uppercase tracking-[0.06em] text-academy-navy/55",
  alternativeText: "text-[15px] leading-7 text-academy-navy/85",

  // A picture the learner speaks about is drawn by MockTestMediaFrame now
  // (EXAM-UI-02): it caps the height against the viewport and letterboxes
  // rather than cropping, so a tall drawing cannot push the recorder or
  // the two clocks out of reach. The screen passes it the 34rem width cap
  // that used to live here, which is the width of the largest picture in
  // the section as the source delivers it.
  //
  // Layout shift is still handled on the element: the content file carries
  // the picture's intrinsic width and height, the screen puts them on the
  // img, and the browser reserves the right box before the file arrives.
  imageFallback:
    "flex min-w-0 flex-col gap-1 rounded-sm border border-academy-line bg-academy-navy-soft/40 px-3 py-4 text-center",
  imageFallbackTitle: "text-[14px] font-semibold leading-5 text-academy-navy",
  imageFallbackText: "text-[12px] leading-4 text-academy-navy/65",

  // Option cards, Task 5. Two across from the small breakpoint up, so the
  // comparison the task asks for is a comparison on screen as well.
  cardGrid: "grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-2",
  card: "flex min-w-0 flex-col gap-2 overflow-hidden rounded-sm border border-academy-line bg-academy-paper p-2.5",
  // The row above the picture, carrying the card's label and, on the
  // choice screen, the radio that selects it (SPEAKING-05A). Drawn only
  // where there is something to put in it, so a card with neither is
  // unchanged.
  cardHeader: "flex min-w-0 items-center gap-2",
  // A card that has been chosen. The warm wash and hairline ring the
  // whole player uses for a selected row (EXAM-UI-05), applied to a card
  // rather than to a line. It is added to card rather than replacing it,
  // so a chosen card and an unchosen one are the same object in two
  // states rather than two shapes.
  cardSelected:
    "border-player-orange-line/55 bg-player-orange-soft ring-1 ring-inset ring-player-orange-line/45",
  // The dot on a choice card, the same warm colour as the wash it turns
  // on.
  cardInput:
    "h-4 w-4 shrink-0 accent-player-orange-line focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-player-blue",
  cardLabel:
    "text-[12px] font-semibold uppercase tracking-[0.06em] text-academy-navy/55",
  cardHeading: "text-[15px] font-semibold leading-5 text-academy-navy",
  cardDetailList: "flex min-w-0 list-disc flex-col gap-0.5 pl-4",
  cardDetailItem: "text-[14px] leading-6 text-academy-navy/85",

  // Right column: the recorder and everything under it.
  //
  // The recorder's own geometry moved to playerRecorder in
  // mock-test-player-theme.ts in EXAM-UI-03, where the microphone mark,
  // the status word and the controls are one centred card rather than
  // five stacked rows. What is left here is the error panel, which sits
  // under the card at full width.
  answerColumn: "flex min-w-0 flex-col gap-4",

  // The preview player. Capped and centred under the recorder card
  // (EXAM-UI-03): a browser audio control stretched across a half screen
  // column is all track and no transport, and the recording it plays is
  // ninety seconds long.
  preview: "mx-auto flex w-full min-w-0 max-w-md flex-col gap-1.5",
  previewLabel:
    "text-[12px] font-semibold uppercase tracking-[0.06em] text-academy-navy/55",
  previewPlayer: "block h-10 w-full min-w-0",
  previewMetaRow:
    "flex min-w-0 flex-wrap items-baseline gap-x-4 gap-y-0.5 text-[12px] leading-4",
  previewMetaLabel:
    "font-semibold uppercase tracking-[0.06em] text-academy-navy/50",
  previewMetaValue: "tabular-nums text-academy-navy/75",
  previewEmpty: "text-[14px] leading-6 text-academy-navy/60",

  // Something went wrong with the microphone.
  error:
    "flex min-w-0 flex-col gap-1.5 rounded-sm border border-academy-red/35 bg-academy-red-soft px-3 py-2.5",
  errorHeading: "text-[15px] font-semibold leading-5 text-academy-navy",
  errorText: "text-[14px] leading-6 text-academy-navy/80",
  errorHint: "text-[12px] leading-4 text-academy-navy/60",

  // The two clocks are drawn by playerTimerCard in
  // mock-test-player-theme.ts from EXAM-UI-03. They came down a step in
  // size and gained a hairline bar that drains with the window, because
  // there are two of them side by side and neither of them is the screen.

  // Transition and completion screen stacks, capped so a short table does
  // not stretch across a full width canvas.
  completeStack: "mx-auto flex w-full min-w-0 max-w-3xl flex-col gap-4",
  completeHeading: "text-[15px] font-semibold leading-5 text-academy-navy",
  completeCount: "text-[15px] leading-6 text-academy-navy/85",
} as const;

// Speaking Task 5, the four screen task (SPEAKING-05A).
//
// Task 5 is a choice, then a plan, then a minute of speech, and each of
// those is its own screen. Three of the four are single column screens
// with a clock on them and a pair of cards under it, which is a shape no
// other Speaking screen has: the other seven tasks are a split, prompt on
// the left and recorder on the right, because on those the learner reads
// and speaks at the same time. Here they read, then decide, then plan,
// then speak, and a split would put half the screen out of use on three
// screens out of four.
//
// So these recipes describe one column, capped a little wider than the
// instructions measure because two option cards with photographs in them
// side by side need the room. The recording screen keeps the section's
// usual split and takes only the card recipes from here.
//
// Nothing here is a new colour. The chosen card is the warm wash the
// whole player has used for a selected row since EXAM-UI-05, and the time
// up line is the expired red the timer badge and the toast already carry,
// so a learner who has seen a window close anywhere else in the test has
// seen this before.
//
// Append only. Nothing in examSpeaking or examSpeakingReview is changed
// by this block.
export const examSpeakingTaskFive = {
  // The body of a single column Task 5 screen. Wider than the
  // instructions measure, narrower than the canvas.
  stack: "mx-auto flex w-full min-w-0 max-w-5xl flex-col gap-4",
  // The situation or the instruction the screen opens with, and the
  // paragraphs under it.
  prompt: "flex min-w-0 flex-col gap-2",
  promptParagraph: "text-[15px] leading-7 text-academy-navy/85",
  promptInstruction: "text-[15px] font-semibold leading-6 text-academy-navy",
  // The source's own line about the automatic choice. A quiet aside
  // under the prompt, not a warning: it is describing something ordinary.
  promptNote:
    "rounded-sm border border-academy-line bg-academy-navy-soft/35 px-3 py-2 text-[12px] leading-4 text-academy-navy/70",

  // The clock. The same flex row the task screens put their pair of
  // cards in, capped because there is only one card in it here: the card
  // recipe carries a 10rem flex basis, which in a row is a width and in a
  // column would be a height, so the row direction is what keeps a card
  // with three short lines in it from drawing 10rem tall.
  timerRow: "flex min-w-0 max-w-xs flex-wrap gap-2",

  // The cards, and the fieldset around them on the choice screen. The
  // fieldset draws no geometry of its own: preflight has already stripped
  // its border, padding and margin.
  fieldset: "w-full min-w-0",
  legend:
    "mb-1.5 block w-full min-w-0 text-[12px] font-semibold uppercase tracking-[0.06em] text-academy-navy/55",
  // The whole card is the click target, which is the pattern every option
  // row in the player follows.
  optionLabel: "block min-w-0 cursor-pointer",
  hint: "text-[12px] leading-4 text-academy-navy/60",

  // Shown under the cards once the window has closed.
  //
  // A bordered line in the expired red rather than a quiet hint, for the
  // reason the Writing choice error is one: it appears at the moment a
  // learner is watching a clock hit zero and expecting something to
  // happen, and the whole content of the message is that nothing did.
  timeUpNote:
    "flex min-w-0 items-start gap-2 rounded-sm border border-academy-red/40 bg-academy-red-soft px-2.5 py-2 text-[13px] leading-5 text-academy-red",

  // The reading of what was chosen, on the preparation and recording
  // screens. The same warm strip the Writing editor restates its position
  // in, so a restated choice looks the same in both sections.
  chosenNote:
    "flex min-w-0 flex-col gap-0.5 rounded-sm border border-player-orange-line/45 bg-player-orange-soft px-2.5 py-2",
  chosenNoteLabel:
    "text-[12px] font-semibold uppercase tracking-[0.06em] text-academy-navy/55",
  chosenNoteText: "min-w-0 text-[14px] leading-6 text-academy-navy",
  chosenNoteOption: "font-semibold",
} as const;

// Speaking AI review and practice estimate (EXAM-28).
//
// The Speaking result screen is the Writing result screen with one more
// block on every card, so this recipe set is built from that one rather
// than beside it.
//
// That is a deliberate reuse and not a shortcut. The two screens are the
// same object: an overall estimate in a bordered strip, a disclaimer
// under it, a stack of bordered task cards, and inside each card a
// criterion table, a corrections list and two rewrites. Drawing them
// from two copies of the same forty recipes would mean a spacing fix
// landing on one screen and not the other, and a learner who runs a
// Writing section and a Speaking section in one sitting would see the
// difference.
//
// What Speaking adds is the transcript block, which Writing has no need
// for because a Writing response is already on the screen the learner
// typed it into. A spoken answer is not visible anywhere until something
// writes it down, so the transcript is part of the result rather than a
// reference beside it, and it is drawn as quoted speech: monospace
// numbers off, paragraph breaks kept, and a quiet note under it saying
// what an automatic transcript can be relied on for.
//
// Three of the Writing recipes are re-pointed rather than reused as they
// stand, and each is renamed to what it holds here:
//
// - the disclaimer strip is used twice on this screen, once for the
//   practice estimate sentence and once for the audio assessment note,
//   so the second gets its own names
// - the insufficient block carries four outcomes here rather than one,
//   so it is named for the status it reports rather than for one of them
//
// Append only. Nothing in examWritingReview, examSpeaking or any
// Listening or Reading recipe is changed by this block.
export const examSpeakingReview = {
  ...examWritingReview,

  // The audio assessment note. The same bordered strip as the practice
  // disclaimer, because it does the same job: it bounds what the reading
  // above it claims, and it has to be seen rather than skimmed past.
  audioNote:
    "flex min-w-0 flex-col gap-0.5 rounded-sm border border-academy-line bg-academy-navy-soft/35 px-3 py-2.5",
  audioNoteLabel:
    "text-[12px] font-semibold uppercase tracking-[0.06em] text-academy-navy/55",
  audioNoteText: "text-[14px] leading-6 text-academy-navy/80",

  // The transcript of one answer.
  //
  // Bordered and inset, so it reads as a quotation of the learner rather
  // than as more of the review's own prose. whitespace-pre-line keeps
  // whatever line breaks the transcription produced, and the text sits a
  // little darker than the surrounding feedback because it is the
  // evidence the rest of the card argues from.
  transcript:
    "flex min-w-0 flex-col gap-1.5 rounded-sm border border-academy-line bg-academy-navy-soft/25 px-3 py-2.5",
  transcriptHeader:
    "flex min-w-0 flex-wrap items-baseline gap-x-3 gap-y-0.5 border-b border-academy-line pb-1.5",
  transcriptTitle: "text-[15px] font-semibold leading-5 text-academy-navy",
  transcriptDuration:
    "ml-auto shrink-0 text-[12px] font-semibold uppercase tracking-[0.06em] tabular-nums text-academy-navy/55",
  transcriptBody:
    "whitespace-pre-line text-[15px] leading-7 text-academy-navy/85",
  transcriptEmpty: "text-[14px] leading-6 text-academy-navy/60",
  transcriptNote: "text-[12px] leading-4 text-academy-navy/55",

  // Shown in place of the criterion table, the corrections and the two
  // rewrites on a task that produced no reviewable speech. One block for
  // all three of those outcomes, with its own heading and sentence for
  // each, which the copy file holds.
  statusBlock:
    "flex min-w-0 flex-col gap-1 rounded-sm border border-academy-line bg-academy-navy-soft/35 px-3 py-2.5",
  statusHeading: "text-[15px] font-semibold leading-5 text-academy-navy",
  statusText: "text-[14px] leading-6 text-academy-navy/75",
} as const;

// Tones for the two Speaking clock readings shown inside the canvas.
//
// The same four states the top bar reading uses, so an amber clock in the
// bar is an amber clock on the card. Kept as its own record rather than
// reusing examTimerStates, because those recipes carry the bar's own text
// size and this one must not.
export const examSpeakingTimerStates: Record<ExamTimerState, string> = {
  normal: "text-academy-navy",
  warning: "text-academy-amber",
  urgent: "text-academy-red",
  expired: "text-academy-red",
  muted: "text-academy-navy/45",
};

// Shared body text tones inside the canvas. Exam copy runs tighter than
// dashboard copy, so these sit a step below the marketing scale.
export const examText = {
  heading: "text-[18px] font-semibold leading-7 text-academy-navy",
  body: "text-[15px] leading-6 text-academy-navy/85",
  muted: "text-[12px] leading-4 text-academy-navy/60",
  bulletList: "space-y-0 text-[15px] leading-6 text-academy-navy/85",
  bulletItem: "border-b border-dotted border-academy-line py-1.5 last:border-b-0",
} as const;
