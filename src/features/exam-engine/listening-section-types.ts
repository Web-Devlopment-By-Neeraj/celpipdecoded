// Types for the full Listening section flow (EXAM-15).
//
// Parts 1 to 6 already exist, each with its own content shape, its own
// screen union and its own prototype. This file is the layer above them:
// it describes one Listening section as an ordered list of parts, and it
// describes the screen sequence that walks a learner through all six of
// them in a single run.
//
// It deliberately adds no fifth content shape. A part here is one of the
// four existing shapes plus the few facts the section needs about it:
// which part number it is, how a learner names it, and what the intro card
// should say about its format. The content objects themselves are
// untouched, so the part level prototype routes and this route read the
// same files.
//
// Types only, no runtime values, so this can be imported from a server
// component or a client component without pulling behaviour along with it.
// Same rule the four sibling listening type files follow. The helpers live
// in listening-section-flow.ts and listening-section-score.ts.
//
// House style: normal hyphens only, no long hyphens or em dashes.

import type {
  ExamInstruction,
  ExamInstructionalVideoAsset,
  ExamSectionIntroDetail,
} from "./instruction-screen-types";
import type { ListeningDropdownPartContent } from "./listening-dropdown-types";
import type {
  ListeningReviewRow,
  ListeningScoreSummary,
} from "./listening-review-types";
import type { ListeningPartContent } from "./listening-types";
import type { ListeningVideoPartContent } from "./listening-video-types";
import type { ListeningViewpointsPartContent } from "./listening-viewpoints-types";

// What the section needs to know about a part, beside its content.
type ListeningSectionPartBase = {
  // Position in the section, counting from 1.
  partNumber: number;
  // The part as a learner names it, for example "Listening Part 3". Not
  // taken from the content object: partTitle there is the section name,
  // "Listening for Information", and title is the full practice test
  // heading. Neither is the label wanted here.
  partLabel: string;
  // What the learner will be given, for the intro card Format row, for
  // example "News audio and dropdown questions".
  formatLabel: string;
};

// One part of the section: its kind, its content, and its labels.
//
// A discriminated union rather than a kind field beside a widened content
// field, so reading part.content after checking part.kind gives the right
// content type with no cast anywhere in the flow or the prototype.
//
// kind decides which flow builder produces the part's screens, which
// question screen draws them, and which marking adapter checks them. It
// names one of the four content shapes that already exist rather than
// introducing a fifth:
//
// - "sections"   ListeningPartContent, Parts 1 to 3
// - "dropdown"   ListeningDropdownPartContent, Part 4
// - "video"      ListeningVideoPartContent, Part 5
// - "viewpoints" ListeningViewpointsPartContent, Part 6
export type ListeningSectionPart =
  | (ListeningSectionPartBase & {
      kind: "sections";
      content: ListeningPartContent;
    })
  | (ListeningSectionPartBase & {
      kind: "dropdown";
      content: ListeningDropdownPartContent;
    })
  | (ListeningSectionPartBase & {
      kind: "video";
      content: ListeningVideoPartContent;
    })
  | (ListeningSectionPartBase & {
      kind: "viewpoints";
      content: ListeningViewpointsPartContent;
    });

// The instruction text screen the section opens with (screen type 1).
export type ListeningSectionInstructionContent = {
  // Top bar title.
  title: string;
  // Heading beside the information glyph, for example
  // "Listening Test Instructions" (EXAM-UI-03). The screen falls back to
  // the generic "Instructions:" lead when a section does not name one.
  heading?: string;
  // Sentence under the instructions heading.
  subtitle?: string;
  instructions: ExamInstruction[];
  // Quiet note under the list.
  noticeText?: string;
  // Intro card above the instructions.
  introTitle: string;
  introSummary: string;
  introDetails: ExamSectionIntroDetail[];
};

// The instructional video screen that follows the instructions (screen
// type 2).
export type ListeningSectionVideoContent = {
  // Top bar title.
  title: string;
  // The clip, taken from the EXAM-02 registry rather than a path typed
  // into the content file.
  video: ExamInstructionalVideoAsset;
  // Sentence above the player.
  description: string;
  // Quiet line under the player.
  helperText?: string;
};

// One complete Listening section, as the engine consumes it.
export type ListeningSectionContent = {
  // For example "mock-test-1".
  testId: string;
  // For example "listening-section".
  sectionId: string;
  // Top bar title for the screens the section owns rather than a part:
  // the transitions, the review, the score and the end screen. A part
  // screen keeps its own part title.
  title: string;
  instructionScreen: ListeningSectionInstructionContent;
  videoScreen: ListeningSectionVideoContent;
  parts: ListeningSectionPart[];
};

// Answers held while a learner works through the whole section.
//
// One map for all six parts, keyed by question id and valued by the
// selected option id, which is the { questionId: selectedOptionId } shape
// every part already uses. The ids are unique across the six Mock Test 1
// content files, so a single map needs no part prefix and no nesting.
//
// Nothing here is written to a database, to localStorage, or to a cookie.
export type ListeningSectionAnswerMap = Readonly<Record<string, string>>;

// One screen belonging to a part, inside the section flow.
//
// This is the union of every non closing screen the four part flows
// produce, written out once rather than composed from the four unions.
// Each of the four is structurally assignable to it, which is what lets
// buildListeningSectionFlow drop a part's screens straight in, and it
// means the prototype dispatches on one flat set of kinds instead of four
// overlapping ones.
//
// The closing kinds are deliberately absent. answer-review, score,
// part-end and part-complete never appear inside the section flow: the
// whole point of this ticket is that a part hands straight over to the
// next one, and the section closes once at the end. A part flow is asked
// for its "complete" ending and its final screen is dropped, so those
// kinds cannot reach here even by accident.
export type ListeningSectionPartScreen =
  | { kind: "part-intro"; id: string }
  | { kind: "scenario"; id: string }
  // Parts 1 to 3: a conversation clip, the breaks between clips, and one
  // question per screen.
  | { kind: "conversation"; id: string; sectionIndex: number }
  | { kind: "section-break"; id: string; sectionIndex: number }
  | {
      kind: "question";
      id: string;
      sectionIndex: number;
      questionIndex: number;
      // Position inside the part, counting from 1.
      questionNumber: number;
    }
  // Parts 4 and 6: one audio clip. Part 5: one video.
  | { kind: "media"; id: string }
  | { kind: "video"; id: string }
  // Parts 4, 5 and 6: every question in the part on one screen.
  | { kind: "questions"; id: string };

// One screen in the full Listening section flow.
//
// A discriminated union rather than a screen index, for the same reason
// the four part unions are: adding a screen kind should be a compile error
// everywhere it matters.
//
// partIndex points into ListeningSectionContent.parts rather than copying
// the part, so there is one copy of the content and the flow stays cheap
// to build.
export type ListeningSectionScreen =
  // 1. Listening instruction text screen.
  | { kind: "section-instructions"; id: string }
  // 2. Listening instructional video screen.
  | { kind: "section-video"; id: string }
  // 3 to 8. The six parts, in order.
  | {
      kind: "part";
      id: string;
      partIndex: number;
      screen: ListeningSectionPartScreen;
    }
  // Shown before a part that is not the first one. It carries no score.
  | { kind: "part-transition"; id: string; partIndex: number }
  // 9. Full Listening answer review, grouped by part.
  | { kind: "section-review"; id: string }
  // 10. Full Listening practice score, with the part breakdown.
  | { kind: "section-score"; id: string }
  // 11. End of Listening section.
  | { kind: "section-end"; id: string };

// Narrowed screen kind, for a component that only handles one of them.
export type ListeningSectionPartScreenRef = Extract<
  ListeningSectionScreen,
  { kind: "part" }
>;

// The marked result for one part, inside the section result.
//
// The rows and the summary are exactly what the part level review and
// score screens already consume, so the section review renders one
// existing table per part rather than a new row shape.
export type ListeningSectionPartResult = {
  partNumber: number;
  partLabel: string;
  // Section name from the content object, for example "Listening for
  // Information". Shown beside the part label as the group heading.
  partTitle: string;
  rows: ListeningReviewRow[];
  summary: ListeningScoreSummary;
};

// A marked Listening section: everything the review and score screens
// need, and nothing else.
//
// This exists for the same reason ListeningMarkedPart does. The answer
// keys stay on the server and only the finished result crosses back: the
// review rows for questions the learner has now finished, the per part
// counts, and the section totals. Neither half carries the key itself, so
// nothing here lets a caller work out an answer it was not given.
export type ListeningSectionMarkedResult = {
  parts: ListeningSectionPartResult[];
  // Totals across all six parts, for example 38 questions.
  summary: ListeningScoreSummary;
};
