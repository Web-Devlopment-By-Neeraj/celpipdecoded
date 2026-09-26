// Types for the instruction and instructional video screens (EXAM-02).
//
// Screen types 1 and 2 in docs/product/exam-engine-screen-types.md: the
// instructional text screen that opens every section and part, and the
// instructional video screen that follows the section instructions.
//
// This file holds types only, no runtime values, so it can be imported
// from a server component or a client component without pulling any
// behaviour along with it. The same rule the EXAM-01 shell types follow.
//
// House style: normal hyphens only, no long hyphens or em dashes.

// The five instruction and video groups the practice test engine has.
//
// overview is the whole test walkthrough shown once at the start of a
// full practice test. The other four are the section groups, and each one
// has its own instruction screen and its own instructional video.
export type ExamSectionKey =
  | "overview"
  | "listening"
  | "reading"
  | "writing"
  | "speaking";

// One line in an instruction list.
//
// A plain string is the common case, one idea per bullet. The object form
// adds a bold lead in for a bullet that needs one, for example
// { heading: "Timing", text: "Each part has its own time limit." }.
export type ExamInstruction = string | { heading?: string; text: string };

// One fact in the section intro card, for example
// { label: "Parts", value: "6" }.
export type ExamSectionIntroDetail = {
  label: string;
  value: string;
};

// A local or remote instructional video the engine can play.
//
// src is the raw public path, exactly as the file sits on disk, because
// that is what a reader can match against the file system. The player
// makes it URL safe, so a file name containing spaces still loads. See
// resolveExamMediaSrc in instructional-video-assets.ts.
//
// poster and durationLabel are optional because neither exists for the
// current local files. An invented running time would be wrong on screen,
// so an unset value shows nothing rather than a guess.
export type ExamInstructionalVideoAsset = {
  section: ExamSectionKey;
  // Learner facing name of the clip, for example
  // "Listening instructional video".
  title: string;
  // Raw public path, for example
  // "/assets/instructional-thumbnails/2. Listening Instructional Video.mp4".
  src: string;
  // Still image shown before playback starts.
  poster?: string;
  // Running time as text, for example "4:12". Display only.
  durationLabel?: string;
  // One or two sentences describing what the clip covers.
  description: string;
};

// Data shape for an instructional text screen.
//
// EXAM-02 renders screens from props. This type exists so the later flow
// tickets can declare a section as data and hand it to
// ExamInstructionScreen without inventing a second shape.
export type ExamInstructionScreenContent = {
  id: string;
  section: ExamSectionKey;
  // Title for the top bar, for example
  // "CELPIP Decoded practice test - Listening test instructions".
  title: string;
  // Sentence under the instructions heading.
  subtitle?: string;
  instructions: ExamInstruction[];
  // Quiet note under the list, for example the practice estimate
  // disclaimer.
  noticeText?: string;
};

// Data shape for an instructional video screen.
export type ExamVideoScreenContent = {
  id: string;
  section: ExamSectionKey;
  // Title for the top bar.
  title: string;
  // The clip itself.
  video: ExamInstructionalVideoAsset;
  // Sentence above the player.
  description?: string;
  // Quiet line under the player.
  helperText?: string;
  // Whether the learner may move on without watching. The routing rule
  // that skips the overview video for a single section entry is a route
  // decision, not a screen prop.
  allowSkip?: boolean;
};
