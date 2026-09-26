// Shared types for the CELPIP-style practice test engine shell (EXAM-01).
//
// This file holds types only, no runtime values, so it can be imported
// from a server component or a client component without pulling any
// behaviour along with it.
//
// The shell is the frame every exam screen sits inside: a grey title bar,
// a white canvas, and a grey footer bar. Screen types described in
// docs/product/exam-engine-screen-types.md declare what they need through
// these types, and the frame renders the chrome.
//
// House style: normal hyphens only, no long hyphens or em dashes.

// Tone of a timer reading.
//
// The frame still owns no clock: it is handed a formatted value and a
// tone, and a caller decides both. What changed in EXAM-15D is that there
// is now a shared clock to hand it one, useExamCountdown, and its phases
// map onto these tones through examTimerStatusTones.
//
// - normal: plenty of time left
// - warning: the answer window is closing, amber
// - urgent: the last few seconds of the window, red
// - expired: the window has run out, red, and the value reads
//   "Time is up" rather than a number
// - muted: a fixed label rather than a live value, for example a window
//   that has not started yet
//
// urgent was added by EXAM-15D. warning was red before it and is amber
// now, so the two steps of notice are distinguishable rather than the
// warning arriving at full strength.
export type ExamTimerState =
  | "normal"
  | "warning"
  | "urgent"
  | "expired"
  | "muted";

// One timer reading in the top bar, for example
// { label: "Time remaining", value: "9 minutes" }.
//
// The top bar accepts a list because Speaking shows two readings side by
// side, preparation and recording.
export type ExamTimerReading = {
  label?: string;
  value: string;
  state?: ExamTimerState;
};

// Exam chrome button styles. These are deliberately separate from the
// pill shaped buttons in src/features/design/design-tokens.ts, because
// the exam frame is a test engine surface and not a marketing surface.
export type ExamButtonVariant = "primary" | "secondary" | "dark";

// Chrome controls are small. xs is the compact Next in the top bar, sm is
// a bar control such as Back, md is an action inside the canvas.
export type ExamButtonSize = "xs" | "sm" | "md";

// Placeholder media kinds the shell can reserve space for. No player is
// built in this ticket.
export type ExamMediaKind = "audio" | "video" | "image";

// Panel background tone. Question panels sit on a pale tint so the two
// halves of a split screen read as separate panes.
//
// The same three tones also set the background of a split screen column,
// which is how the answer side gets its light blue wash.
export type ExamPanelTone = "plain" | "muted" | "accent";

// Fixed scroll heights for a panel or a column. A panel that scrolls
// keeps its own scrollbar so the page itself never scrolls sideways.
export type ExamPanelScroll = "none" | "short" | "medium" | "tall";

// Question position inside a part, for example question 3 of 8.
export type ExamProgressReading = {
  current: number;
  total: number;
  label?: string;
};

// The layout families the shell supports today. Every screen type in
// docs/product/exam-engine-screen-types.md maps onto one of them.
//
// - single: one column of content inside the canvas
// - two-column: content on the left, answers on the right, stacked on
//   mobile
// - media: a single column built around a media placeholder
export type ExamScreenLayout = "single" | "two-column" | "media";
