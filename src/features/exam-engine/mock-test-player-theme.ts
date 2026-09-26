// Class recipes for the Mock Test 1 player chrome (EXAM-UI-02).
//
// Same idea as exam-theme.ts beside this file: every value is a Tailwind
// class string and the raw colours live in src/app/globals.css. What is
// different is the job.
//
// exam-theme.ts holds the recipes a screen body is built from, which is
// question lists, passages, editors, review tables and score cards.
// This file holds the recipes the window around them is built from, which
// is the desk, the frame, the two bars, the content pane, the buttons, the
// timer badge and the split pane.
//
// Why the split matters. The player chrome is the part of the test that a
// learner never reads and always sees, so it has to be the part that
// stops looking like a product. Keeping it in its own file means the
// question of "how wide is the exam window" has exactly one answer, in one
// place, rather than being an emergent property of forty screen recipes.
//
// The palette is the player ramp, not the CELPIP Decoded brand:
//
//   player-desk         the grey the exam window sits on
//   player-chrome       the compact top and bottom bars
//   player-line         the window border and internal rules
//   player-paper        the white content area
//   player-ink          body text
//   player-blue         the primary exam action
//
// Legal note. Nothing here is taken from any official test provider. The
// window is a plain grey and white application frame, there is no official
// logo anywhere in it, the primary action is an ordinary interface blue
// rather than an official blue-red pairing, and no footer carries anyone
// else's copyright line. This is an original practice simulator skin.
//
// House style: normal hyphens only, no long hyphens or em dashes.

import { focus } from "@/features/design/design-tokens";
import type {
  ExamButtonSize,
  ExamButtonVariant,
  ExamPanelScroll,
  ExamPanelTone,
  ExamTimerState,
} from "./exam-shell-types";

// The desk, the centred container, and the exam window itself.
//
// Three levels, and each one is answering a specific complaint from the
// EXAM-UI-02 brief.
//
// **desk** is the grey the window sits on. It grows to fill whatever
// height its parent has, which inside the locked player viewport is the
// browser window and on an ordinary page is nothing at all. That is the
// same deliberately inert height request the old frame made, and it is
// what lets one set of classes serve both places.
//
// **container** is the width cap and the margins. max-w-[1100px] is the
// middle of the 1040 to 1120 band the brief asks for, and it is the whole
// answer to the test feeling stretched: on a wide monitor the window stops
// growing and the desk takes the rest. 40 pixels of desk above and 32
// below, which is the band the brief asks for.
//
// It grows rather than asking for a percentage of the desk, so the height
// chain from the viewport to the content pane is pure flex and nothing in
// it depends on a percentage resolving against a stretched parent.
//
// **window** is the frame. A light grey border, small corners, a hairline
// shadow, and overflow-hidden so the two bars clip the content pane rather
// than the content pane pushing past them. min-h-[34rem] is a floor, not a
// height: on a very short window the desk scrolls instead of the bars
// being crushed.
export const playerFrame = {
  desk: "flex min-h-0 w-full grow flex-col bg-player-desk",
  container:
    "mx-auto flex min-h-0 w-full min-w-0 max-w-[1100px] grow flex-col px-3 py-8 sm:px-4 sm:pt-10 sm:pb-8",
  window:
    "flex min-h-[34rem] w-full min-w-0 grow flex-col overflow-hidden rounded-md border border-player-line bg-player-paper shadow-[0_1px_2px_rgba(15,23,42,0.08)]",
} as const;

// The locked player viewport.
//
// The desk is what fills the browser, so this is the only element on the
// screen with a document level scrollbar, and it only ever uses it when
// the window will not fit. overscroll-none stops a flick past the end
// bouncing the page behind it.
export const playerViewport = {
  overlay:
    "fixed inset-0 z-[100] overflow-y-auto overscroll-none bg-player-desk",
  // h-full, not min-h-full. A minimum height still lets the box grow with
  // its content, which meant the exam window grew with the screen inside
  // it and the content pane never had a reason to scroll: a long screen
  // pushed the bottom bar below the fold instead. A definite height is
  // what makes the pane the thing that gives, which is the whole scroll
  // rule of the player. When the window's own minimum will not fit, it
  // overflows and the desk above takes the scrollbar.
  inner: "flex h-full w-full min-w-0 flex-col",
} as const;

// The two bars.
//
// Compact by intent: the brief asks for 46 to 56 pixels on the top bar and
// 52 to 64 on the bottom, so both carry a min height rather than relying
// on their padding, and both refuse to shrink. A bar that can be squeezed
// is a bar that can hide the Next control on a short window, which is one
// of the navigation problems this ticket exists to fix.
//
// The title is plain text at exam weight. No logo, no wordmark, no product
// name: there is nothing in this bar that says which company built the
// simulator, because a test window does not advertise.
export const playerBar = {
  top: "flex min-h-[3rem] w-full min-w-0 shrink-0 flex-wrap items-center gap-x-3 gap-y-1.5 border-b border-player-line bg-player-chrome px-3 py-2 sm:px-4",
  bottom:
    "flex min-h-[3.5rem] w-full min-w-0 shrink-0 flex-wrap items-center gap-x-3 gap-y-1.5 border-t border-player-line bg-player-chrome px-3 py-2 sm:px-4",
  title:
    "min-w-0 basis-full truncate text-[15px] font-semibold leading-6 text-player-ink sm:basis-auto sm:flex-1",
  meta: "min-w-0 truncate text-[12px] leading-4 text-player-ink/60",
  readings: "flex min-w-0 flex-wrap items-center gap-x-3 gap-y-0.5",
  actions: "flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1.5 sm:ml-auto",
  back: "flex min-w-0 items-center gap-2",
  secondary: "flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1.5 sm:ml-auto",
} as const;

// The white content area between the bars.
//
// One scrolling region, and this is the fix for trapped content. The pane
// grows into whatever height the window has left after the two bars, and
// anything taller scrolls inside it. The bars do not move, so Next and
// Back are reachable from every screen no matter how long a passage, an
// image or a question list turns out to be.
//
// min-h-0 on a flex child is what makes that work at all: without it the
// pane refuses to shrink below its content and pushes the bottom bar off
// the window instead of scrolling.
//
// The old canvas drew a grey gutter with a bordered white sheet floating
// inside it. That is one border too many now that the window itself has
// one, so the pane is simply white to its edges.
//
// fill is for a screen that manages its own internal scrolling, which is
// the reading split pane: the pane stops scrolling and hands the job to
// the two columns, so a learner never scrolls a scrollbar inside a
// scrollbar.
export const playerContent = {
  region:
    "flex min-h-0 min-w-0 grow flex-col overflow-y-auto overscroll-contain bg-player-paper",
  regionFill:
    "flex min-h-0 min-w-0 grow flex-col overflow-y-auto overscroll-contain bg-player-paper lg:overflow-hidden",
  body: "flex min-w-0 shrink-0 grow flex-col",
  bodyFill: "flex min-h-0 min-w-0 grow flex-col",
  padded: "px-4 py-5 sm:px-6 sm:py-6",
} as const;

// Buttons.
//
// Square cornered, compact, uppercase for the two navigation labels. The
// sizes are a step up from the old chrome buttons, which were 24 and 28
// pixels tall and read as toolbar affordances rather than as the two
// controls a learner uses on every screen.
export const playerButtonBase = `inline-flex items-center justify-center gap-2 rounded-sm border text-center font-semibold leading-none transition-colors disabled:cursor-not-allowed disabled:opacity-55 ${focus.ring}`;

export const playerButtonCase = "uppercase tracking-[0.06em]";

export const playerButtonVariants: Record<ExamButtonVariant, string> = {
  primary:
    "border-player-blue bg-player-blue text-white hover:border-player-blue-dark hover:bg-player-blue-dark",
  secondary:
    "border-player-line bg-player-paper text-player-ink hover:bg-player-chrome-soft",
  dark: "border-player-ink bg-player-ink text-white hover:border-black hover:bg-black",
};

export const playerButtonSizes: Record<ExamButtonSize, string> = {
  xs: "h-8 px-3 text-[12px]",
  sm: "h-9 px-4 text-[12px]",
  md: "h-9 px-5 text-[13px]",
};

// Timer badge in the top bar.
//
// A quiet bordered pill rather than the loose line of text the old bar
// carried. The brief asks for a timer that is prominent but not huge, and
// a badge is readable at a glance without taking a size that would set the
// height of the bar around it.
//
// tabular-nums is load bearing: a live countdown pads to 00:30 and every
// digit is the same width, so a second ticking over moves nothing beside
// it.
export const playerTimer = {
  base: "inline-flex min-w-0 items-baseline gap-1.5 whitespace-nowrap rounded-sm border border-player-line bg-player-paper px-2 py-1 text-[13px] leading-4",
  label: "shrink-0 text-[11px] font-semibold uppercase tracking-[0.06em] opacity-70",
  value: "font-semibold tabular-nums",
} as const;

export const playerTimerStates: Record<ExamTimerState, string> = {
  normal: "text-player-ink",
  warning: "border-academy-amber/45 text-academy-amber",
  urgent: "border-academy-red/45 text-academy-red",
  expired: "border-academy-red/45 font-semibold text-academy-red",
  muted: "text-player-ink/55",
};

// The instruction row and the instruction list (EXAM-UI-03).
//
// One block, because the two are the same idea at two sizes: an
// instruction row is the line a screen opens with and the list is the
// rules under it, and the reference layout sets both in the same blue on
// the same measure.
//
// Three decisions the reference pass settled:
//
// - **instruction copy is blue, not ink.** player-blue-ink is a quieter
//   blue than the action blue on the Next control, because this is prose
//   read a line at a time rather than a control to find. It is the one
//   colour on an instructions screen.
// - **the marker is grey, not blue.** A blue bullet in front of blue text
//   reads as a second emphasis on a screen that already has one. Grey
//   marks the row and gets out of the way.
// - **rows are ruled and 16 pixels.** A hairline under each rule keeps a
//   full set of Listening instructions on one screen without white space
//   between them, and 16 with a 28 pixel line is the readable-not-
//   oversized band the brief asks for. Nothing on the screen is set at a
//   marketing size: the largest thing on it is the 17 pixel lead line.
export const playerInstruction = {
  // The information row: the circled glyph, an optional lead line, and
  // the task.
  row: "flex min-w-0 items-start gap-2.5",
  rowHeading: "text-[17px] font-semibold leading-6 text-player-blue-ink",
  rowText: "min-w-0 text-[16px] leading-6 text-player-blue-ink",

  // The rules under it. Indented to sit under the lead line's text
  // rather than under its glyph, the way the reference layout hangs a
  // list off the heading that introduces it.
  list: "flex min-w-0 flex-col pl-7",
  item: "flex min-w-0 items-start gap-3 border-b border-player-line/70 py-3 last:border-b-0",
  marker: "mt-[11px] h-[7px] w-[7px] shrink-0 rounded-full bg-player-ink/30",
  heading: "font-semibold text-player-blue-ink",
  text: "min-w-0 text-[16px] leading-7 text-player-blue-ink",

  // The measure an instructions body is set on. The window is 1100 pixels
  // and a rule drawn the whole way across it reads as a table border
  // rather than as a divider between two sentences, so the body stops at
  // roughly four fifths of the window the way the reference layout does.
  body: "flex w-full min-w-0 max-w-4xl flex-col gap-4",
} as const;

// The circled information glyph (EXAM-UI-03).
//
// One recipe, read by MockTestInfoIcon, so the glyph beside "Listening
// Test Instructions" and the glyph beside "Listen to the question" are
// provably the same mark at the same size. It is a bordered circle with a
// letter i drawn in it, not an icon package: no icon dependency is
// installed for the exam engine, and a two element glyph cannot be
// mistaken for anyone's proprietary asset.
//
// The nudge is a top margin rather than items-center, because the icon
// aligns to the first line of the text beside it and that text can run to
// several lines.
export const playerInfoIcon = {
  base: "flex shrink-0 items-center justify-center rounded-full border border-player-blue font-bold leading-none text-player-blue",
  md: "mt-1 h-[18px] w-[18px] text-[11px]",
  sm: "mt-[3px] h-4 w-4 text-[10px]",
} as const;

// Audio visual card (EXAM-UI-03, restructured in the reference pass).
//
// The block a Listening clip plays inside. Three things stacked, in the
// order a learner meets them: the card, the browser's own control under
// it, and the practice playbar note under that.
//
// **The card is a row, not a column.** A speaker plate on the left, and
// beside it the status word over a wide progress bar. That is the shape
// the reference exam layout uses and it is the shape that reads at a
// glance: the plate says "this screen is audio" and the bar beside it
// says "and it is this far through", without the eye travelling down four
// stacked blocks to find out.
//
// **The native control sits outside the card.** It is a practice aid
// rather than part of the clip display, and putting it outside is what
// lets the note under it say so without the note appearing to describe
// the card as well.
//
// **The bar drives nothing.** Its width comes from the clip's own
// currentTime; seeking, playing and pausing all still happen through the
// native control, so the picture can lag the clip but it can never
// disagree with it.
//
// The elapsed and total time readings that used to sit under the bar are
// gone: the native control prints both, a foot apart, and two clocks
// disagreeing by a frame on the same screen is worse than one.
export const playerAudioVisual = {
  stack:
    "mx-auto flex w-full min-w-0 max-w-[34rem] flex-col items-center gap-3",
  card: "flex w-full min-w-0 items-center gap-4 rounded-sm bg-player-chrome-soft px-5 py-5",
  speaker:
    "flex h-14 w-14 shrink-0 items-center justify-center rounded-sm bg-player-paper text-player-ink/55",
  speakerIcon: "h-7 w-7",
  body: "flex min-w-0 grow flex-col items-center gap-2.5",
  status: "text-[16px] leading-5 text-player-ink",
  title: "max-w-full truncate text-[12px] leading-4 text-player-ink/55",
  track: "h-3.5 w-full min-w-0 overflow-hidden rounded-[2px] bg-player-paper",
  fill: "h-full bg-player-blue transition-[width] duration-200",
  controls: "w-full min-w-0",
  element: "block h-9 w-full min-w-0",
  // The practice playbar note. A ruled box rather than a grey line: it is
  // the one sentence on the screen that is about the simulator rather
  // than about the test, so it is set apart rather than blended in.
  note: "w-full min-w-0 border border-player-ink/85 px-3 py-2 text-center text-[13px] leading-5 text-player-ink",
  // Shown in place of the card body when the clip will not load.
  fallback: "flex min-w-0 grow flex-col items-center gap-1 text-center",
  fallbackTitle: "text-[15px] font-semibold leading-5 text-player-ink",
  fallbackText: "max-w-sm text-[12px] leading-4 text-player-ink/60",
  // Shown under the controls when the browser refused to start the clip.
  notice: "text-center text-[12px] leading-4 text-player-ink",
} as const;

// Option row on a question screen (EXAM-UI-03, repainted EXAM-UI-05).
//
// The fix for the option list the QA pass reported as feeling like a web
// quiz, now carrying the one pair of states every objective control in
// the player uses:
//
// - **hover is a pale green wash**, player-green-soft. It is the lightest
//   tint in the ramp, it never appears anywhere else on a question
//   screen, and it says "the pointer is here" and nothing more.
// - **selected is a warm wash**, player-orange-soft with an orange
//   hairline ring. Warm rather than green, so a row under the pointer and
//   a row already chosen can be told apart at a glance while both are on
//   screen, which is the thing a single hue in two strengths cannot do.
// - **neither state is loud.** Both are pale on purpose. A saturated wash
//   on a test screen reads as feedback about the answer, and a practice
//   test must never say "this one is right" before marking. Nothing here
//   knows the key: these are pointer and choice states, not results.
// - **rows are ruled, not spaced**. A hairline between options is what
//   keeps four options compact enough that a whole question fits above
//   the fold, and it is what an exam layout does.
//
// EXAM-UI-05 flipped the pair. Until this ticket hover was neutral grey
// and chosen was green here, while the Writing Task 2 positions used
// green hover and a warm chosen row, so the same gesture painted two
// different colours depending on which section a learner was in. One pair
// now runs through Listening, Reading, the drop-down menus and Writing.
//
// The whole row is the click target, so nobody has to hit the circle.
// The circle itself is nudged to sit on the centre of the first line of
// its label rather than on the top of it, and its accent is the warm
// chosen colour so the dot belongs to the wash under it.
export const playerOption = {
  list: "flex min-w-0 flex-col divide-y divide-player-line/70",
  row: "flex min-w-0 cursor-pointer items-start gap-3 px-2 py-2 transition-colors hover:bg-player-green-soft",
  // The selected row carries a wash and a hairline ring, not just a wash.
  // The Parts 1 to 3 answer column is itself pale blue, so a pale fill
  // alone can be hard to read there and the only cue left is the radio
  // dot. The ring reads on the tinted column and the fill reads on the
  // white one screen parts, so one recipe works on both surfaces.
  rowSelected:
    "bg-player-orange-soft ring-1 ring-inset ring-player-orange-line/45 hover:bg-player-orange-soft",
  input:
    "mt-[5px] h-4 w-4 shrink-0 accent-player-orange-line focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-player-blue",
  text: "min-w-0 text-[15px] leading-6 text-player-ink",
} as const;

// The answer column header on a question screen (reference pass).
//
// "Question 2 of 8" reads as a sentence in the reference layout, not as a
// small caps field label, so it is set at body size in ink. The uppercase
// column labels that used to sit above each half of the split are gone
// with it: a test window does not caption its own panes.
export const playerQuestionHeader = {
  wrap: "flex min-w-0 flex-col gap-2",
  position: "text-[15px] font-semibold leading-6 text-player-ink",
} as const;

// Drop-down completion list (EXAM-UI-03, rebuilt EXAM-UI-05).
//
// The control every drop-down question in the player is answered with:
// Listening Parts 4, 5 and 6, and all four Reading parts.
//
// **What EXAM-UI-05 changed.** Each item used to be a bordered block: a
// tinted strip carrying the statement, and a full width native select in
// the body under it. Five of those stacked down a screen is five boxes
// where the source material has five sentences, the control sat a line
// below the words it completes, and on the Reading side the same shape
// was written out a second time in exam-theme.ts. The list is now what
// the sentence itself is: a numbered line of prose with a compact
// control sitting inline where the blank falls. Nothing is boxed, nothing
// is full width, and the menu no longer changes the height of anything.
//
// So the recipes below are prose recipes. leading-8 rather than leading-6
// because an inline control is taller than a line of text and the lines
// have to clear it without the paragraph looking loose.
//
// The blank recipe is kept for the one place underscores are still drawn:
// a reply paragraph on the Reading side, where the sentence is printed
// above the list and the control is not in it.
export const playerDropdown = {
  list: "flex min-w-0 flex-col gap-2.5",
  item: "min-w-0",
  statement:
    "min-w-0 text-[15px] leading-8 text-player-ink [overflow-wrap:anywhere]",
  number: "mr-1.5 font-semibold tabular-nums text-player-ink/55",
  // Underscores from the source document, quieted rather than replaced.
  blank: "px-0.5 tracking-tight text-player-ink/45",
  // Answered count under the list.
  note: "text-[12px] leading-4 text-player-ink/60",
} as const;

// The compact drop-down control and its floating menu (EXAM-UI-05).
//
// This is the fix the ticket was raised for. A native select opens a menu
// the page cannot style, cannot keep inside a scrolling pane, and cannot
// draw as the radio list an exam question is: on the Reading screens it
// also stretched the answer column and pushed the passage beside it
// around. The control here is a button and a floating listbox, so:
//
// - **the trigger is compact and inline.** It sits in the sentence where
//   the blank is, capped so a long option cannot stretch the line, and it
//   never changes the height of the row it is in.
// - **the menu floats.** It is positioned in the viewport rather than in
//   the flow, so opening one adds nothing to the page, moves nothing on
//   it, and cannot be clipped by the pane it was opened inside. It flips
//   above the trigger when there is no room below it and it is clamped to
//   the viewport on both axes, so a menu near the right edge or the foot
//   of a Reading column stays on screen.
// - **the rows are the option rows.** Same drawn circle, same pale green
//   pointer wash and same warm chosen wash as playerOption above, so a
//   drop-down question and a radio question answer the same way.
//
// The menu is scrolled rather than allowed to grow: a Reading Part 3
// selector has five options and a Part 1 selector has four, but the cap
// is what keeps a longer set from filling a laptop screen.
//
// visibility is hidden in the recipe and turned on by the component once
// it has measured and placed the menu, so the first paint never shows a
// menu in the wrong corner.
export const playerSelect = {
  wrap: "relative inline-flex min-w-0 max-w-full align-middle",
  trigger:
    `inline-flex h-7 max-w-[16rem] min-w-[6.5rem] cursor-pointer items-center justify-between gap-1.5 rounded-sm border border-player-line bg-player-paper px-2 text-left text-[14px] leading-5 text-player-ink transition-colors hover:border-player-green-line/50 hover:bg-player-green-soft ${focus.ring}`,
  // The chosen value carries the same warm wash the chosen option row
  // does, so a finished question reads as finished at a glance.
  // The border carries most of the weight here. The wash is the same pale
  // warm tint the option rows use, and a pale warm tint on the pale blue
  // Reading answer column is close to invisible on its own.
  triggerSelected:
    "border-player-orange-line/75 bg-player-orange-soft hover:border-player-orange-line/75 hover:bg-player-orange-soft",
  // While the menu is open, whatever the value is.
  triggerOpen: "border-player-blue/60",
  triggerText: "min-w-0 truncate",
  triggerTextEmpty: "text-player-ink/50",
  // Drawn, not imported. A small solid triangle built from borders.
  caret:
    "h-0 w-0 shrink-0 border-x-[4px] border-t-[5px] border-x-transparent border-t-player-ink/55",
  // block, because the menu is a span: it sits inside the sentence the
  // trigger is in, and a div inside a paragraph is markup a browser
  // silently repairs.
  menu:
    "invisible fixed z-50 block min-w-[10rem] overflow-y-auto overscroll-contain rounded-sm border border-player-line bg-player-paper py-1 shadow-[0_10px_28px_rgba(31,41,55,0.18)]",
  option:
    "flex min-w-0 cursor-pointer items-start gap-2.5 px-3 py-1.5 text-[15px] leading-6 text-player-ink transition-colors",
  // The pointer or the arrow keys are on this row.
  optionActive: "bg-player-green-soft",
  optionSelected: "bg-player-orange-soft",
  // A drawn radio circle. The menu rows are listbox options rather than
  // real radios, so the circle is two spans: a ring and, when chosen, a
  // dot inside it.
  radio:
    "mt-[5px] flex h-4 w-4 shrink-0 items-center justify-center rounded-full border border-player-ink/40 bg-player-paper",
  radioSelected: "border-player-orange-line",
  radioDot: "h-2 w-2 rounded-full bg-player-orange-line",
  optionText: "min-w-0",
} as const;

// Media frame: the box an image, an audio player or a video sits in.
//
// The height cap is the fix for the oversized images the brief calls out.
// A scenario drawing served at its intrinsic size could be taller than the
// content pane on a laptop, which pushed the questions under it out of
// sight and made the screen feel bottomless. Capping the picture at a
// share of the viewport and letting it letterbox inside the frame keeps
// the whole screen on one page.
//
// object-contain rather than cover, because a test image is information
// and cropping it would remove some.
export const playerMedia = {
  frame:
    "mx-auto flex w-full min-w-0 max-w-3xl flex-col gap-1.5 overflow-hidden",
  surface:
    "flex min-w-0 items-center justify-center overflow-hidden rounded-sm border border-player-line bg-player-chrome-soft",
  image: "block h-auto max-h-[46vh] w-auto max-w-full object-contain",
  imageTall: "block h-auto max-h-[62vh] w-auto max-w-full object-contain",
  caption: "text-[12px] leading-4 text-player-ink/60",
  audioWrap:
    "mx-auto flex w-full min-w-0 max-w-2xl flex-col gap-1.5 rounded-sm border border-player-line bg-player-chrome-soft px-3 py-2.5",
  audioElement: "block h-10 w-full min-w-0",
} as const;

// Split pane: passage on the left, questions on the right.
//
// The brief asks for each side to scroll on its own, and the fill mode
// below is what delivers it. The grid is one row at the height of the
// content pane, both cells are min-h-0 flex columns, and each cell's body
// takes the scrollbar. So a long passage and a long question list scroll
// past each other independently and neither one moves the bars.
//
// Below the large breakpoint the split stacks and the fill mode is
// dropped, because two short scroll boxes stacked on a phone is worse than
// one page that scrolls.
export const playerSplit = {
  grid: "grid min-w-0 grid-cols-1 divide-y divide-player-line lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:divide-x lg:divide-y-0",
  gridFill: "lg:min-h-0 lg:grow lg:grid-rows-[minmax(0,1fr)]",
  bordered: "overflow-hidden rounded-sm border border-player-line",
  column: "flex min-w-0 flex-col gap-2 p-3 sm:p-4",
  columnFill: "lg:min-h-0 lg:overflow-hidden",
  columnLabel:
    "shrink-0 text-[12px] font-semibold uppercase tracking-[0.06em] text-player-ink/55",
  columnBody: "min-w-0",
  columnBodyFill:
    "min-w-0 lg:min-h-0 lg:grow lg:overflow-y-auto lg:overscroll-contain lg:pr-1",
} as const;

export const playerColumnTones: Record<ExamPanelTone, string> = {
  plain: "bg-player-paper",
  muted: "bg-player-chrome-soft",
  accent: "bg-player-blue-soft",
};

// Fixed scroll heights, kept for the screens that ask for one, plus the
// fill mode the split pane uses.
export const playerScrollHeights: Record<ExamPanelScroll, string> = {
  none: "",
  short: "max-h-64 overflow-y-auto overscroll-contain",
  medium: "max-h-[22rem] overflow-y-auto overscroll-contain",
  tall: "max-h-[30rem] overflow-y-auto overscroll-contain",
};

// Question panel: the bordered box a question set sits in.
export const playerPanel = {
  base: "flex min-w-0 flex-col overflow-hidden rounded-sm border",
  header:
    "shrink-0 border-b border-inherit px-3 py-2 text-[12px] font-semibold uppercase tracking-[0.06em] text-player-ink/65",
  body: "min-w-0 px-3 py-3 text-[15px] leading-6 text-player-ink",
  footer:
    "shrink-0 border-t border-inherit px-3 py-2 text-[12px] leading-4 text-player-ink/65",
} as const;

export const playerPanelTones: Record<ExamPanelTone, string> = {
  plain: "border-player-line bg-player-paper",
  muted: "border-player-line bg-player-chrome-soft",
  accent: "border-player-blue/25 bg-player-blue-soft",
};

// Review panel: the block a review or a result screen is built from.
//
// Capped and centred, because a review is a document to read rather than a
// screen to work on, and a 1100 pixel measure is too wide for one.
export const playerReview = {
  stack: "mx-auto flex w-full min-w-0 max-w-3xl flex-col gap-4",
  heading: "text-[18px] font-semibold leading-7 text-player-ink",
  summary: "text-[15px] leading-6 text-player-ink/80",
  panel:
    "flex min-w-0 flex-col overflow-hidden rounded-sm border border-player-line bg-player-paper",
  panelHeader:
    "flex min-w-0 flex-wrap items-baseline justify-between gap-x-3 gap-y-1 border-b border-player-line bg-player-chrome-soft px-3 py-2",
  panelTitle:
    "text-[12px] font-semibold uppercase tracking-[0.06em] text-player-ink/65",
  panelMeta: "text-[12px] leading-4 tabular-nums text-player-ink/60",
  panelBody: "min-w-0",
  panelBodyPadded: "min-w-0 px-3 py-3",
  panelFooter:
    "border-t border-player-line px-3 py-2 text-[12px] leading-4 text-player-ink/65",
  // Long review lists scroll inside the panel rather than the pane, so
  // the bottom bar stays put on a 38 question Listening review.
  scroll: "max-h-[26rem] overflow-y-auto overscroll-contain",
} as const;

// The Writing editor frame (EXAM-UI-03).
//
// Before this ticket the writing space was three loose blocks stacked in
// the answer column: a small caps label, a bordered textarea, a word count
// row and a hint under it. Four things floating one above the other read
// as a dashboard form, and the count, which is the one reading a writer
// glances at while typing, was the furthest thing from the text.
//
// So it is one frame now: a hairline box with the field inside it and a
// grey meta strip along the bottom carrying the count, the target and the
// hint. The strip is part of the field rather than a paragraph under it,
// which is what makes the count readable without moving the eye off the
// writing, and it is what keeps the block compact enough that the prompt
// above it stays on screen.
//
// The field itself draws no border of its own: the frame owns the edge, so
// there is one rectangle rather than a box inside a box. It is still a
// plain resizable textarea and nothing else.
export const playerWritingEditor = {
  frame:
    "flex min-w-0 flex-col overflow-hidden rounded-sm border border-player-line bg-player-paper",
  label:
    "shrink-0 border-b border-player-line bg-player-chrome-soft px-3 py-1.5 text-[12px] font-semibold uppercase tracking-[0.06em] text-player-ink/60",
  // No border of its own, no ring: the frame is the edge. The focus
  // outline is drawn inset so it reads inside the frame rather than
  // doubling it.
  field:
    "block min-h-[14rem] w-full min-w-0 resize-y border-0 bg-player-paper px-3 py-2.5 text-[15px] leading-7 text-player-ink outline-none placeholder:text-player-ink/40 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-player-blue sm:min-h-[17rem]",
  meta: "flex min-w-0 shrink-0 flex-wrap items-baseline gap-x-3 gap-y-0.5 border-t border-player-line bg-player-chrome-soft px-3 py-1.5 text-[12px] leading-4",
  metaLabel: "font-semibold uppercase tracking-[0.06em] text-player-ink/55",
  metaValue: "font-semibold tabular-nums text-player-ink",
  metaTarget: "tabular-nums text-player-ink/60",
  // Pushed to the right of the strip on a wide column and wrapping under
  // the count on a narrow one.
  metaHint: "min-w-0 text-player-ink/55 sm:ml-auto",
} as const;

// The Speaking recorder frame and the two clocks beside it (EXAM-UI-03).
//
// The recorder is the audio screen's mirror image: the Listening card says
// "a clip is playing, listen to it" and this one says "you are being
// recorded, speak". They are drawn from the same parts on purpose, a mark,
// a status word and a bar, so a learner who has sat the Listening section
// already knows what this screen is telling them.
//
// The mark is a microphone, drawn here from four path commands, the way
// the speaker beside it is. No icon package is installed for the exam
// engine and nothing here is taken from any test provider's interface.
//
// **The bar is the recording window, not a level meter.** It fills as the
// window runs down, so it answers "how much of my time is left" and never
// pretends to show how loud the room is. It is fed the reading the
// recording clock already has rather than a clock of its own.
export const playerRecorder = {
  card: "mx-auto flex w-full min-w-0 max-w-md flex-col items-center gap-2.5 rounded-sm border border-player-line bg-player-chrome-soft px-4 py-4",
  mic: "flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-player-line bg-player-paper text-player-blue",
  micIcon: "h-6 w-6",
  micRecording: "text-academy-red",
  status:
    "text-[12px] font-semibold uppercase tracking-[0.08em] text-player-ink/70",
  hint: "max-w-full text-center text-[13px] leading-5 text-player-ink/70",
  track: "h-1.5 w-full min-w-0 overflow-hidden rounded-full bg-player-ink/12",
  fill: "h-full rounded-full bg-player-blue transition-[width] duration-200",
  fillRecording: "h-full rounded-full bg-academy-red transition-[width] duration-200",
  times:
    "flex w-full min-w-0 items-center justify-between text-[11px] leading-4 tabular-nums text-player-ink/55",
  controls: "flex min-w-0 flex-wrap items-center justify-center gap-2",
  note: "text-center text-[11px] leading-4 text-player-ink/55",
  // Errors and anything else that has to sit under the card body at full
  // width rather than centred with it.
  footer: "w-full min-w-0",
} as const;

// One clock card in the Speaking answer column.
//
// Compact, because there are two of them and neither is the screen. The
// reading is 18 pixels rather than the 20 it was, the note under it is one
// short line, and a hairline bar along the bottom shows the window
// draining so the pair reads at a glance without being read.
export const playerTimerCard = {
  row: "flex min-w-0 flex-wrap gap-2",
  card: "flex min-w-0 flex-1 basis-40 flex-col gap-0.5 overflow-hidden rounded-sm border border-player-line bg-player-paper px-3 py-2",
  label:
    "text-[12px] font-semibold uppercase tracking-[0.06em] text-player-ink/55",
  value: "text-[18px] font-semibold leading-6 tabular-nums",
  note: "text-[11px] leading-4 text-player-ink/55",
  track: "mt-1.5 h-1 w-full min-w-0 overflow-hidden rounded-full bg-player-ink/12",
  fill: "h-full rounded-full bg-player-blue transition-[width] duration-200",
} as const;

// The time up toast (TIMER-01).
//
// A short message that appears when a mock test window reaches zero and
// clears itself a few seconds later. It is the smallest thing that can
// carry the news, because the news is that nothing happened: the screen
// is unchanged, the answers are unchanged, and the learner presses Next
// when they are ready.
//
// Four decisions, and each one is there to keep the toast from behaving
// like a dialog:
//
// - **fixed, and outside the flow.** It is positioned against the
//   viewport rather than placed in the exam window, so appearing and
//   clearing cannot reflow a question list, a passage or an editor by a
//   single pixel. z-[110] puts it over the player viewport, which sits at
//   z-[100].
// - **pointer-events-none.** The toast can never intercept a click. Next,
//   Back, Finish Writing and Submit for AI Review stay reachable through
//   it even in the moment it is drawn over one of them, which matters
//   because the whole point of the message is that the learner is still
//   in charge.
// - **bottom centred, above the bottom bar.** Out of the reading column
//   and away from the top bar, where the expired reading it belongs to is
//   already showing.
// - **no animation.** The player chrome refuses flashing and pulsing
//   everywhere else, and a message about staying calm is a poor place to
//   start.
//
// The red is the expired timer red the badge already uses, so the bar and
// the toast read as one state rather than two.
export const playerTimeUpToast = {
  region: "pointer-events-none fixed inset-x-0 bottom-6 z-[110] flex justify-center px-4",
  toast:
    "pointer-events-none max-w-[26rem] rounded-sm border border-academy-red/45 bg-player-paper px-4 py-2.5 text-center text-[13px] font-semibold leading-5 text-academy-red shadow-[0_8px_24px_rgba(15,23,42,0.16)]",
} as const;
