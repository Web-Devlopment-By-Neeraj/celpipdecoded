// Types for the full Reading section flow and its estimated band
// (EXAM-24).
//
// Reading Parts 1 to 4 already exist, each with its own content object,
// its own working screen and its own prototype route. This file is the
// layer above them: it describes one Reading section as an ordered list
// of parts, and it describes the screen sequence that walks a learner
// through all four of them in a single run.
//
// It adds no fifth content shape. Unlike Listening, whose six parts are
// built from four different content types, every Reading part is a
// ReadingPartContent, so a section part here is that same object plus the
// few facts the section needs about it: which part number it is, how a
// learner names it, what its intro card should say about its format,
// which working screen answers it, and what a question with no stem of
// its own should be called in the review. Those five were previously
// typed into the four prototype components and the four server actions,
// which is why they are collected here rather than added to the content
// files.
//
// Types only, no runtime values, so this can be imported from a server
// component or a client component without pulling behaviour along with
// it. Same rule reading-types.ts and the five Listening type files
// follow. The helpers live in reading-section-flow.ts,
// reading-section-review.ts, reading-section-score.ts and
// reading-band-score.ts.
//
// House style: normal hyphens only, no long hyphens or em dashes.

import type {
  ExamInstruction,
  ExamSectionIntroDetail,
} from "./instruction-screen-types";
import type { ReadingTaskScreen } from "./reading-flow";
import type {
  ReadingPartContent,
  ReadingReviewRow,
  ReadingScoreSummary,
} from "./reading-types";

// One part of the section: its content, and the labels and choices the
// section makes about it.
//
// A plain object rather than a discriminated union, which is where the
// Reading section parts company with ListeningSectionPart. Listening had
// to switch on a kind to know which content type it held; every Reading
// part holds the same type, so a kind would discriminate nothing and
// taskScreen is a plain field naming which of the four split screens
// draws it.
export type ReadingSectionPart = {
  // Position in the section, counting from 1.
  partNumber: number;
  // The part as a learner names it, for example "Reading Part 3". Not
  // taken from the content object: partTitle there is the CELPIP part
  // name, "Reading for Information", and title is the full practice test
  // heading. Neither is the label wanted here.
  partLabel: string;
  // What the learner will be given, for the intro card Format row, for
  // example "Labelled paragraphs and paragraph matching".
  formatLabel: string;
  // Which working screen answers the part. The same option the part level
  // prototype passes to buildReadingFlow, so the section and the part
  // route draw the same screen.
  taskScreen: ReadingTaskScreen;
  // What to call a question that prints no stem of its own, in the
  // review. Part 1's blanks sit in a written reply, Part 2's in an email
  // and Part 4's in a reader comment, so the honest line differs per
  // part. Unset on a part whose questions all carry their own text, which
  // is Part 3.
  blankQuestionText?: string;
  content: ReadingPartContent;
};

// The instruction screen the section opens with (screen type 1).
//
// The Reading counterpart of ListeningSectionInstructionContent, minus
// the video fields: the Reading section has no instructional video screen
// in this ticket, because no Reading instructional clip is registered in
// instructional-video-assets.ts and nothing is invented to fill one.
export type ReadingSectionInstructionContent = {
  // Top bar title.
  title: string;
  // Sentence under the instructions heading.
  subtitle?: string;
  instructions: ExamInstruction[];
  // Quiet note under the list.
  noticeText?: string;
  // Intro card above the instructions.
  introTitle: string;
  introSummary: string;
  // Optional fixed detail rows. When unset the intro screen counts the
  // parts, the questions and the time off the content itself, which is
  // what the ticket asks for: no hardcoded total.
  introDetails?: ExamSectionIntroDetail[];
};

// One complete Reading section, as the engine consumes it.
export type ReadingSectionContent = {
  // For example "mock-test-1".
  testId: string;
  // For example "mock-test-1-reading-section".
  sectionId: string;
  // Top bar title for the screens the section owns rather than a part:
  // the intro, the transitions, the score and the review. A part screen
  // keeps its own content.title.
  title: string;
  instructionScreen: ReadingSectionInstructionContent;
  parts: ReadingSectionPart[];
};

// Answers held while a learner works through the whole Reading section.
//
// One map for all four parts, keyed by question id and valued by the
// selected option id, which is the { questionId: selectedOptionId } shape
// every Reading part already uses. The ids are unique across the four
// Mock Test 1 content files, reading-part-1-q1 through
// reading-part-4-q10, so a single flat map needs no part prefix and no
// nesting. That is the smallest safe shape the ticket asks for, and it is
// what lets every existing part helper read the section map unchanged.
//
// Nothing here is written to a database, to localStorage or to a cookie.
export type ReadingSectionAnswerMap = Readonly<Record<string, string>>;

// One screen belonging to a part, inside the section flow.
//
// The non closing half of ReadingScreen, written out once. Each member is
// structurally assignable from that union, which is what lets
// buildReadingSectionFlow drop a part's screens straight in.
//
// The closing kinds are deliberately absent. score, answer-review and
// part-complete never appear inside the section flow: the whole point of
// this ticket is that a part hands straight over to the next one, and the
// section closes once at the end.
export type ReadingSectionPartScreen =
  | { kind: "part-intro"; id: string }
  | { kind: "correspondence"; id: string }
  | { kind: "diagram"; id: string }
  | { kind: "information"; id: string }
  | { kind: "viewpoints"; id: string };

// One screen in the full Reading section flow.
//
// A discriminated union rather than a screen index, for the same reason
// every other flow in the engine is one: adding a screen kind should be a
// compile error everywhere it matters.
//
// partIndex points into ReadingSectionContent.parts rather than copying
// the part, so there is one copy of the content and the flow stays cheap
// to build.
export type ReadingSectionScreen =
  // 1. Reading section intro.
  | { kind: "section-intro"; id: string }
  // 2 to 9. The four parts, in order, each an intro and a split screen.
  | {
      kind: "part";
      id: string;
      partIndex: number;
      screen: ReadingSectionPartScreen;
    }
  // Shown before a part that is not the first one. It carries no score.
  | { kind: "part-transition"; id: string; partIndex: number }
  // 10. Full Reading practice score, with the part breakdown and the
  // estimated band.
  | { kind: "section-score"; id: string }
  // 11. Full Reading answer review, grouped by part, opened from the
  // score.
  | { kind: "section-review"; id: string };

// Narrowed screen kind, for a component that only handles one of them.
export type ReadingSectionPartScreenRef = Extract<
  ReadingSectionScreen,
  { kind: "part" }
>;

// The marked result for one part, inside the section result.
//
// The rows and the summary are exactly what the part level review and
// score screens already consume, so the section review renders one
// existing card list per part rather than a new row shape.
//
// partId is content.sectionId, for example "reading-part-3". It is the
// stable key the breakdown table and the review groups are drawn from,
// and it is what the ticket asks a breakdown row to carry.
export type ReadingSectionPartResult = {
  partId: string;
  partNumber: number;
  partLabel: string;
  // CELPIP part name from the content object, for example "Reading for
  // Information". Shown beside the part label as the group heading.
  partTitle: string;
  rows: ReadingReviewRow[];
  summary: ReadingScoreSummary;
};

// One row of the Reading score chart in the program materials.
//
// level is the label exactly as the chart prints it, which is why it is a
// string and not a number: the chart's top row is "10-12" and its bottom
// row is "M-2", neither of which is a single level.
//
// minCorrect and maxCorrect are inclusive. The rows in the source chart
// overlap at their edges, so a raw score can sit in two of them, and that
// is a property of the chart rather than a transcription mistake. See the
// note on the chart in reading-band-score.ts.
export type ReadingBandChartRow = {
  level: string;
  minCorrect: number;
  maxCorrect: number;
};

// An estimated band for one full Reading attempt.
//
// levels holds every chart level whose range contains the raw score,
// highest first, so an overlap is carried rather than resolved by picking
// one side of it. label is the display string built from those levels.
//
// descriptor is optional and unset today. The program materials carry a
// raw score chart for Reading but no per level Reading descriptor text,
// so there is nothing to print and nothing is invented. It is here so the
// ticket that adds real descriptors has somewhere to put them.
export type ReadingBandEstimate = {
  correctCount: number;
  totalQuestions: number;
  levels: string[];
  label: string;
  descriptor?: string;
};

// A marked Reading section: everything the score and review screens need,
// and nothing else.
//
// This exists for the same reason ReadingMarkedPart does. The answer keys
// stay on the server and only the finished result crosses back: the
// review rows for questions the learner has now finished, the per part
// counts, the section totals and the estimated band. Neither half carries
// a key itself, so nothing here lets a caller work out an answer it was
// not given.
//
// estimatedBand is null whenever the local scoring chart does not cover
// the attempt, and every caller has to handle that. Nothing is
// extrapolated and no band table is invented. See reading-band-score.ts.
export type ReadingSectionMarkedResult = {
  parts: ReadingSectionPartResult[];
  // Totals across all four parts, for example 38 questions.
  summary: ReadingScoreSummary;
  estimatedBand: ReadingBandEstimate | null;
};
