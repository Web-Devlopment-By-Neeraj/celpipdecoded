// Screen order and answer helpers for the Mock Test 1 Writing section
// (EXAM-25).
//
// The Writing counterpart of reading-section-flow.ts. Pure functions over
// WritingSectionContent, no React and no side effects, so the flow can be
// built on the server, rendered on the client, and tested on its own
// later.
//
// The order is derived from the content rather than typed out, so a
// section with a different number of tasks needs no edit here. For Mock
// Test 1 it produces 6 screens:
//
//    1  Writing section intro
//    2  Writing Task 1, the situation, the prompt and the editor
//    3  Task 1 to Task 2 transition
//    4  Writing Task 2 choice, the survey, the prompt and the two
//       positions, with no editor
//    5  Writing Task 2, the survey, the chosen position and the editor
//    6  Writing section complete
//
// Screen 4 arrived in EXAM-UI-04. Before it, choosing a position and
// writing the response were the same screen, and the choice sat as a
// small radio group above an editor that was already open, which made
// the one decision the task turns on easy to walk past. It is now its
// own step, and it is the only screen in the section that will not let a
// learner move forward: the task cannot be answered before it has been
// read one way round or the other. The rule is in the screen component,
// not here.
//
// There is no score screen and no review screen, which is the whole shape
// of this ticket: nothing is marked, nothing is sent to an AI reviewer,
// and no band is estimated. The section closes on a completion screen
// that reports the two word counts and says the review is next. EXAM-26
// is where a result screen goes, and the note at the foot of
// docs/product/writing-mock-test-prototype.md says how.
//
// There is also no answer key helper here, and no withoutWritingAnswerKey
// to match the Reading one. A Writing task has no key: it is judged
// against descriptors rather than compared to a correct option, so there
// is nothing in the content that has to be kept out of the browser. The
// whole section content is safe to hand to the client component.
//
// House style: normal hyphens only, no long hyphens or em dashes.

import { countWords } from "@/features/writing/word-count";
import type {
  WritingChoiceMap,
  WritingResponseMap,
  WritingSectionContent,
  WritingSectionScreen,
  WritingTaskContent,
  WritingTaskOption,
  WritingTaskSummary,
} from "./writing-mock-types";

// Whether a task asks for a position to be chosen before it is written.
//
// One test, used by the flow builder to decide whether the task gets a
// choice screen and by the screens themselves to decide what to draw, so
// the two can never disagree about which tasks have a choice. Mock Test
// 1 Task 1 has no options and returns false; Task 2 has two and returns
// true.
export function writingTaskHasOptions(task: WritingTaskContent): boolean {
  return (task.options?.length ?? 0) > 0;
}

// Build the screen order for the whole Writing section.
//
// A transition screen is inserted before every task except the first,
// which is what turns two editors into one run. A one task section
// therefore gets no transition screen at all.
//
// A choice screen is inserted before every task that offers positions,
// including a first task if one ever did, because the rule is a property
// of the task and not of where it sits in the section.
export function buildWritingSectionFlow(
  content: WritingSectionContent,
): WritingSectionScreen[] {
  const screens: WritingSectionScreen[] = [
    { kind: "section-intro", id: `${content.sectionId}-intro` },
  ];

  content.tasks.forEach((task, taskIndex) => {
    if (taskIndex > 0) {
      screens.push({
        kind: "task-transition",
        id: `${task.taskId}-transition`,
        taskIndex,
      });
    }

    if (writingTaskHasOptions(task)) {
      screens.push({
        kind: "task-choice",
        id: `${task.taskId}-choice`,
        taskIndex,
      });
    }

    screens.push({
      kind: "task",
      id: `${task.taskId}-screen`,
      taskIndex,
    });
  });

  screens.push({
    kind: "section-complete",
    id: `${content.sectionId}-complete`,
  });

  return screens;
}

// How many words are in a typed response.
//
// The one word count in the app, reused rather than rewritten.
// countWords already trims, splits on runs of whitespace, and returns 0
// for an empty or whitespace only string, which is exactly what the
// ticket asks a word count to do. Importing it also means the mock test
// editor and the standalone Writing Practice editor can never disagree
// about what a word is, which would be a confusing thing for a learner to
// discover.
//
// It is re-exported under a Writing mock name rather than imported
// directly by the components, so the exam engine has one place to change
// if the two ever have to count differently. Nothing about the standalone
// flow is modified by this: word-count.ts is a pure module and is read,
// not edited.
export function countWritingWords(text: string): number {
  return countWords(text);
}

// The response held for one task, or an empty string when none has been
// typed.
//
// Always a string, never undefined, because it is fed straight to a
// controlled textarea and a controlled input that flips to undefined is
// how React components become uncontrolled halfway through a session.
export function getWritingResponse(
  responses: WritingResponseMap,
  taskId: string,
): string {
  return responses[taskId] ?? "";
}

// Store a typed response, leaving the other tasks alone.
//
// A new object every time, so React sees a changed reference. Keyed by
// task id rather than by screen position, which is what makes a response
// survive moving forward to the next task and back again: the map is not
// touched by navigation at all.
export function setWritingResponse(
  responses: WritingResponseMap,
  taskId: string,
  text: string,
): WritingResponseMap {
  return { ...responses, [taskId]: text };
}

// The position chosen for one task, or undefined when none has been
// chosen.
export function getWritingChoice(
  choices: WritingChoiceMap,
  taskId: string,
): string | undefined {
  return choices[taskId];
}

// Store a chosen position, leaving the other tasks alone.
//
// Choosing again replaces the choice and never touches the response, so a
// learner who changes their mind halfway through Task 2 keeps every word
// they have written. That is deliberate: the alternative, clearing the
// response with the choice, would destroy work on a mis-click.
export function setWritingChoice(
  choices: WritingChoiceMap,
  taskId: string,
  optionId: string,
): WritingChoiceMap {
  return { ...choices, [taskId]: optionId };
}

// The chosen position itself, rather than its id.
//
// Returns undefined where the task offers no positions, where none has
// been chosen, or where a stored id no longer matches any option, which
// is what a content edit between two runs would leave behind. The last
// case is why this is a lookup rather than a cast: a screen that restates
// the choice above the editor has to be able to say "nothing chosen"
// rather than print an id.
export function getWritingChosenOption(
  task: WritingTaskContent,
  choices: WritingChoiceMap,
): WritingTaskOption | undefined {
  const chosenOptionId = getWritingChoice(choices, task.taskId);

  if (!chosenOptionId) {
    return undefined;
  }

  return task.options?.find((option) => option.id === chosenOptionId);
}

// The word count for one task's response.
export function countWritingTaskWords(
  responses: WritingResponseMap,
  taskId: string,
): number {
  return countWritingWords(getWritingResponse(responses, taskId));
}

// Whether a response is within its task's word target.
//
// Guidance only. Nothing reads this to block anything: it is here so the
// count beside the editor can say where the response sits, and so the
// completion screen can do the same.
export function isWithinWritingWordTarget(
  task: WritingTaskContent,
  wordCount: number,
): boolean {
  return wordCount >= task.wordTarget.min && wordCount <= task.wordTarget.max;
}

// What the completion screen reports for one task.
//
// Word count, and the chosen position where the task offers one and a
// choice was made. No score, no band and no feedback, because none of
// those exist yet and a summary type with empty fields waiting for them
// would be an invitation to fill them with something invented.
export function summarizeWritingTask(
  task: WritingTaskContent,
  responses: WritingResponseMap,
  choices: WritingChoiceMap,
): WritingTaskSummary {
  const chosenOptionId = getWritingChoice(choices, task.taskId);
  const chosenOption = task.options?.find(
    (option) => option.id === chosenOptionId,
  );

  return {
    taskId: task.taskId,
    taskLabel: task.taskLabel,
    taskTitle: task.taskTitle,
    wordCount: countWritingTaskWords(responses, task.taskId),
    choiceLabel: chosenOption?.label,
    choiceText: chosenOption?.text,
  };
}

// What the completion screen reports for the whole section, in task
// order.
export function summarizeWritingSection(
  content: WritingSectionContent,
  responses: WritingResponseMap,
  choices: WritingChoiceMap,
): WritingTaskSummary[] {
  return content.tasks.map((task) =>
    summarizeWritingTask(task, responses, choices),
  );
}

// The total writing allowance for the section, in seconds.
//
// Summed from the task windows rather than written down, so the intro
// card and the two countdowns cannot disagree. For Mock Test 1 the sum is
// the 53 minutes the source document publishes for the Writing Test,
// which is the check that the two task windows are right.
export function sumWritingSectionSeconds(
  content: WritingSectionContent,
): number {
  return content.tasks.reduce((total, task) => total + task.timer.seconds, 0);
}

// There is deliberately no areAllWritingTasksAnswered here.
//
// Nothing in the Writing flow blocks Next on an empty response. The
// ticket asks for empty responses to be allowed, and a gate would trap a
// learner on a screen they cannot leave. An empty response travels as an
// empty string, counts 0 words, and is reported as 0 words on the
// completion screen.
//
// EXAM-UI-04 added exactly one gate and it is not that one. The Task 2
// choice screen will not move forward until a position has been chosen,
// because the response that follows is judged against the position and a
// run with no position is a run with nothing to judge the response
// against. It is still not a gate on writing: the editor after it accepts
// an empty response, and the completion screen still reports 0 words
// without complaint.
