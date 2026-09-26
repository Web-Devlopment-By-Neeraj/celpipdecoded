// Types for the Mock Test 1 Writing section prototype (EXAM-25).
//
// The Writing counterpart of reading-section-types.ts. A Writing section
// is two tasks rather than four parts, and a task is answered by typing
// prose rather than by choosing an option, so this is a new shape rather
// than a Reading type with the questions removed.
//
// What a Writing task carries that a Reading part does not:
//
// - a situation to read, which the source prints in a panel headed
//   "Read the following information."
// - a prompt instruction and a list of requirements, which is what the
//   response is judged against later
// - a word target, 150 to 200 words in both Mock Test 1 tasks
// - for Task 2 only, a set of positions to choose between before writing
//
// What it deliberately does not carry: an answer key, a score, a band, or
// anything an AI reviewer would need. Writing is not marked against a key
// and nothing in this ticket marks it at all. EXAM-26 adds the review.
//
// Types only, no runtime values, so this can be imported from a server
// component or a client component without pulling behaviour along with
// it. The same rule reading-types.ts and reading-section-types.ts follow.
// The helpers live in writing-mock-flow.ts and the wording in
// writing-mock-copy.ts.
//
// House style: normal hyphens only, no long hyphens or em dashes.

import type {
  ExamInstruction,
  ExamSectionIntroDetail,
} from "./instruction-screen-types";

// Where a timing figure came from.
//
// The same three values ReadingTimerSource draws, and for the same
// reason: a screen with a clock on it has to be able to say whether the
// number is published, worked out from published numbers, or a working
// stand in. See the timer note in
// docs/product/writing-mock-test-prototype.md.
export type WritingTimerSource = "published" | "derived" | "placeholder";

// The writing window for one task.
//
// Writing is timed per task in the Mock Test 1 source: its Writing
// instructions give 53 minutes for the section and name 27 minutes as the
// point at which the official test moves from Task 1 to Task 2. The
// window travels with the task content for the same reason the Reading
// window travels with the part: there is one number per task and it is a
// property of that task.
export type WritingTaskTimer = {
  seconds: number;
  // When the reading turns amber, and then red.
  warningAtSeconds: number;
  urgentAtSeconds: number;
  source: WritingTimerSource;
  // Where the number came from, or what it stands in for. Printed
  // nowhere: it is here so a reader of the content file does not have to
  // go looking.
  note: string;
};

// The prompt as the source document holds it.
//
// Both Mock Test 1 Writing prompts exist in the source only as Cloudinary
// images, which is what mock-tests/mock-test-1/extracted-links.md records
// and what docs/product/mock-test-1-content-map.md lists as a content gap.
// The text on this task's screens is transcribed from that image, and the
// image itself is kept here so a reader can check the transcription
// against the original.
//
// Referenced, not re-hosted, exactly as the Reading Part 2 brochure is.
export type WritingPromptImage = {
  url: string;
  // What is in the picture, for a reader who cannot see it. The screens
  // do not depend on this: everything in the image is also on the screen
  // as text.
  alt: string;
  width: number;
  height: number;
  caption?: string;
};

// One position a learner can take before writing, on a task that offers a
// choice.
//
// Mock Test 1 Writing Task 2 is the survey task, so it offers two: the
// source prints them as "Option A" and "Option B" with a sentence each.
// label is the bold lead in and text is the sentence, kept apart so the
// screen can weight them the way the source does.
export type WritingTaskOption = {
  id: string;
  label: string;
  text: string;
};

// The word count guidance for a task, for example 150 to 200 words.
//
// Guidance and nothing more. Nothing in this prototype blocks a short
// response, a long one, or an empty one: the count is shown beside the
// editor and the target is shown beside the count.
export type WritingWordTarget = {
  min: number;
  max: number;
};

// One Writing task, as the engine consumes it.
export type WritingTaskContent = {
  // For example "mock-test-1-writing-task-1". Also the key the typed
  // response is held under.
  taskId: string;
  // Position in the section, counting from 1.
  taskNumber: number;
  // The task as a learner names it, for example "Writing Task 1".
  taskLabel: string;
  // Full title for the exam top bar.
  title: string;
  // Short task name from the source, for example "Writing an Email".
  taskTitle: string;

  // There is deliberately no instructions list, no summary and no format
  // label on a task.
  //
  // The Reading part type carries all three because a Reading part opens
  // on its own intro screen. A Writing task has no intro screen: the flow
  // the ticket asks for is intro, Task 1, transition, Task 2, complete,
  // so a learner arrives at a task screen with the source's own
  // instruction lines already in front of them, in the situation panel
  // and the prompt panel below. Fields for a screen that does not exist
  // would have to be filled with something, and the only wording
  // available to fill them with would be invented.

  // The situation panel on the left of the task screen.
  //
  // situationInstruction is the source's own lead line, "Read the
  // following information." situationHeading is the bold line above the
  // paragraphs where the source prints one, which on Mock Test 1 is Task
  // 2's survey name.
  situationInstruction: string;
  situationHeading?: string;
  situationParagraphs: string[];

  // The prompt panel on the right, above the editor.
  //
  // promptInstruction is the source's instruction sentence, and
  // promptRequirements are the bullets under it. Task 2 prints no
  // bullets, so the list is empty there rather than invented.
  promptInstruction: string;
  promptRequirements: string[];

  // The positions to choose between, on a task that offers a choice.
  // Unset on a task that does not, which is Task 1.
  optionInstruction?: string;
  options?: WritingTaskOption[];

  wordTarget: WritingWordTarget;
  // Placeholder inside the empty editor.
  editorPlaceholder?: string;
  timer: WritingTaskTimer;
  // The source image the prompt text was transcribed from.
  promptImage?: WritingPromptImage;
};

// The instruction screen the section opens with (screen type 1).
//
// The Writing counterpart of ReadingSectionInstructionContent, and the
// same shape: there is no Writing instructional video screen in this
// ticket, because no Writing clip is registered in
// instructional-video-assets.ts and nothing is invented to fill the gap.
export type WritingSectionInstructionContent = {
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
  // tasks and the writing time off the content itself, so no total is
  // written down twice.
  introDetails?: ExamSectionIntroDetail[];
};

// One complete Writing section, as the engine consumes it.
export type WritingSectionContent = {
  // For example "mock-test-1".
  testId: string;
  // For example "mock-test-1-writing-section".
  sectionId: string;
  // Top bar title for the screens the section owns rather than a task:
  // the intro, the transition and the completion screen. A task screen
  // keeps its own content.title.
  title: string;
  instructionScreen: WritingSectionInstructionContent;
  tasks: WritingTaskContent[];
};

// The typed responses, keyed by task id.
//
// { taskId: responseText }, which is the second of the two shapes the
// ticket suggests. It is preferred over two named fields because it does
// not have to be widened when a section has a different number of tasks,
// and because every helper over it is then a lookup rather than a branch.
//
// Held in React state for the length of the visit and nowhere else.
// Nothing here is written to a database, to localStorage or to a cookie.
export type WritingResponseMap = Readonly<Record<string, string>>;

// The chosen position on a task that offers one, keyed by task id.
//
// { taskId: optionId }. Separate from the responses rather than folded
// into them, because a choice and an essay are different answers to
// different questions and only one task has both. A task with no choice
// never appears in this map.
export type WritingChoiceMap = Readonly<Record<string, string>>;

// One screen in the Writing section flow.
//
// A discriminated union rather than a screen index, for the same reason
// every other flow in the engine is one: adding a screen kind should be a
// compile error everywhere it matters.
//
// taskIndex points into WritingSectionContent.tasks rather than copying
// the task, so there is one copy of the content and the flow stays cheap
// to build.
export type WritingSectionScreen =
  // 1. Writing section intro.
  | { kind: "section-intro"; id: string }
  // 2 and 5. The tasks, in order, one working screen each.
  | { kind: "task"; id: string; taskIndex: number }
  // 3. Shown before a task that is not the first one. It carries no
  // score, because Writing produces none in this ticket.
  | { kind: "task-transition"; id: string; taskIndex: number }
  // 4. Shown before a task that offers positions to choose between, which
  // in Mock Test 1 is Task 2 and only Task 2 (EXAM-UI-04).
  //
  // It carries the same situation and the same prompt instruction the
  // task screen after it carries, and the positions, and no editor. A
  // task with no options never produces one of these, so Task 1 goes
  // straight from the intro to its editor as it always has.
  | { kind: "task-choice"; id: string; taskIndex: number }
  // 6. Writing section complete.
  | { kind: "section-complete"; id: string };

// Narrowed screen kind, for a component that only handles one of them.
export type WritingTaskScreenRef = Extract<
  WritingSectionScreen,
  { kind: "task" }
>;

// A finished task as the completion screen reports it.
//
// Word counts and nothing else. There is no score, no band and no
// feedback in this ticket, and this type is deliberately the shape of
// what the prototype can honestly say: this task, this many words typed,
// and for Task 2 the position that was chosen.
export type WritingTaskSummary = {
  taskId: string;
  taskLabel: string;
  taskTitle: string;
  wordCount: number;
  // The label and text of the chosen position, on a task that offers one
  // and where a choice was made. Unset otherwise.
  choiceLabel?: string;
  choiceText?: string;
};
