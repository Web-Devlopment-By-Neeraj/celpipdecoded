// Screen order and recording helpers for the Mock Test 1 Speaking section
// (EXAM-27).
//
// The Speaking counterpart of writing-mock-flow.ts. Pure functions over
// SpeakingSectionContent, no React and no side effects, so the flow can
// be built on the server, rendered on the client, and tested on its own
// later.
//
// The order is derived from the content rather than typed out, so a
// section with a different number of tasks needs no edit here. For Mock
// Test 1 it produces 20 screens:
//
//     1  Speaking section intro
//     2  Speaking Task 1
//     3  Task 1 to Task 2 transition
//     4  Speaking Task 2
//   ...  and so on, a transition before every task after the first
//     9  Task 4 to Task 5 transition
//    10  Speaking Task 5 instructions
//    11  Speaking Task 5 choice
//    12  Speaking Task 5 preparation
//    13  Speaking Task 5 recording
//    14  Task 5 to Task 6 transition
//   ...  and so on
//    19  Speaking Task 8
//    20  Speaking section complete
//
// Screens 10, 11 and 12 arrived in SPEAKING-05A. Before them Task 5 was
// drawn like every other task, on one screen, with both camps already
// compared and the choice made for the learner in the content file. The
// official task is four steps and the middle two are the point of it: a
// learner who has not chosen has nothing to persuade anyone of, and a
// learner who chose a second ago has not prepared. They are three extra
// screens on one task and no change at all to the other seven, which is
// what speakingTaskHasChoiceStep decides.
//
// There is no score screen, no review screen and no transcript screen,
// which is the whole shape of this ticket: nothing is transcribed,
// nothing is sent to an AI reviewer, no band is estimated and no audio
// leaves the browser. The section closes on a completion screen that
// reports which tasks were recorded and says the review is next. EXAM-28
// is where a result screen goes, and the note at the foot of
// docs/product/speaking-mock-test-prototype.md says how.
//
// There is no answer key helper here and no withoutSpeakingAnswerKey to
// match the Reading one. A Speaking task has no key: it is judged against
// descriptors rather than compared to a correct option, so there is
// nothing in the content that has to be kept out of the browser. The
// whole section content is safe to hand to the client component.
//
// One thing this file does not do, and it is worth saying because a Blob
// is not a string: it never creates or revokes an object URL. Both are
// browser calls, so they belong in the component that owns the state, and
// this file only ever moves an already made response around a map. See
// SpeakingSectionPrototype.
//
// House style: normal hyphens only, no long hyphens or em dashes.

import type {
  SpeakingChoiceMap,
  SpeakingChoiceSource,
  SpeakingOptionCard,
  SpeakingResponse,
  SpeakingResponseMap,
  SpeakingSectionContent,
  SpeakingSectionScreen,
  SpeakingTaskChoice,
  SpeakingTaskContent,
  SpeakingTaskSummary,
} from "./speaking-mock-types";

// An empty answer. The shape a task starts in and returns to.
//
// A frozen constant rather than a factory, because nothing ever mutates a
// response: setSpeakingResponse replaces the whole entry.
export const EMPTY_SPEAKING_RESPONSE: SpeakingResponse = Object.freeze({
  audioUrl: null,
  audioBlob: null,
  durationSeconds: 0,
  recordedAt: null,
  mimeType: null,
});

// Whether a task runs as four screens rather than one (SPEAKING-05A).
//
// One test, used by the flow builder to decide how many screens a task
// gets and by the section prototype to decide which components to draw,
// so the two can never disagree about which tasks are split. Mock Test 1
// Task 5 carries a choiceStep and returns true; the other seven do not
// and return false.
//
// A step with no options is treated as no step at all. A choice screen
// with nothing on it to choose is a dead end, and refusing to build one
// is cheaper than a screen that has to explain itself.
export function speakingTaskHasChoiceStep(task: SpeakingTaskContent): boolean {
  return (task.choiceStep?.options.length ?? 0) > 0;
}

// Build the screen order for the whole Speaking section.
//
// A transition screen is inserted before every task except the first,
// which is what turns eight recorders into one run. A one task section
// therefore gets no transition screen at all.
//
// A task with a choiceStep gains three screens before its recording
// screen: instructions, choice, preparation. The rule is a property of
// the task rather than of where it sits in the section, so a first task
// with a choiceStep would get them too, and the recording screen keeps
// the "task" kind on both shapes. That is what leaves the transition
// screens, the recordings map and the completion screen counting tasks
// rather than screens.
export function buildSpeakingSectionFlow(
  content: SpeakingSectionContent,
): SpeakingSectionScreen[] {
  const screens: SpeakingSectionScreen[] = [
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

    if (speakingTaskHasChoiceStep(task)) {
      screens.push(
        {
          kind: "task-instructions",
          id: `${task.taskId}-instructions`,
          taskIndex,
        },
        {
          kind: "task-choice",
          id: `${task.taskId}-choice`,
          taskIndex,
        },
        {
          kind: "task-prepare",
          id: `${task.taskId}-prepare`,
          taskIndex,
        },
      );
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

// The recording held for one task, or the empty response when none has
// been made.
//
// Always an object, never undefined, so every caller can read
// response.audioUrl without a guard and a screen cannot half render
// because a task has not been reached yet.
export function getSpeakingResponse(
  responses: SpeakingResponseMap,
  taskId: string,
): SpeakingResponse {
  return responses[taskId] ?? EMPTY_SPEAKING_RESPONSE;
}

// Store a recording, leaving the other tasks alone.
//
// A new object every time, so React sees a changed reference. Keyed by
// task id rather than by screen position, which is what makes a recording
// survive moving forward to the next task and back again: the map is not
// touched by navigation at all.
//
// Recording again replaces the entry. The caller is responsible for
// revoking the object URL this one displaces, because revoking is a
// browser call and this file makes none. See SpeakingSectionPrototype.
export function setSpeakingResponse(
  responses: SpeakingResponseMap,
  taskId: string,
  response: SpeakingResponse,
): SpeakingResponseMap {
  return { ...responses, [taskId]: response };
}

// Whether a task has a recording that can be played.
//
// Both fields are checked rather than one. A response with a blob and no
// URL cannot be played, and a response with a URL and no blob is one
// EXAM-28 could not upload, so a task counts as recorded only when it has
// both.
export function hasSpeakingRecording(
  responses: SpeakingResponseMap,
  taskId: string,
): boolean {
  const response = getSpeakingResponse(responses, taskId);

  return response.audioBlob !== null && response.audioUrl !== null;
}

// How many tasks in the section have a recording.
export function countSpeakingRecordings(
  content: SpeakingSectionContent,
  responses: SpeakingResponseMap,
): number {
  return content.tasks.filter((task) =>
    hasSpeakingRecording(responses, task.taskId),
  ).length;
}

// Every object URL currently held in the map.
//
// Used when the run is thrown away, so the caller can revoke all of them
// in one pass. Returning the list rather than revoking it keeps this file
// free of browser calls.
export function listSpeakingAudioUrls(
  responses: SpeakingResponseMap,
): string[] {
  return Object.values(responses)
    .map((response) => response.audioUrl)
    .filter((url): url is string => url !== null);
}

// The choice held for one task, or undefined when none has been made.
//
// Undefined rather than a stand in, because "nothing chosen yet" is a
// real state with a screen of its own: the choice screen draws no
// selection and the preparation screen is never reached without one.
export function getSpeakingChoice(
  choices: SpeakingChoiceMap,
  taskId: string,
): SpeakingTaskChoice | undefined {
  return choices[taskId];
}

// Store a choice, leaving the other tasks alone.
//
// A new object every time, so React sees a changed reference. Keyed by
// task id for the reason setSpeakingResponse is: navigation never touches
// the map, so walking to the recording screen and back to the choice
// screen finds the same option still selected.
export function setSpeakingChoice(
  choices: SpeakingChoiceMap,
  taskId: string,
  optionId: string,
  source: SpeakingChoiceSource,
): SpeakingChoiceMap {
  return { ...choices, [taskId]: { optionId, source } };
}

// The option the app picks when the learner presses Next with nothing
// chosen.
//
// The first option in the content, every time. Deliberately not random.
//
// A random pick reads as fairer and is worse in every way that matters
// here. It cannot be reasoned about from the screen, it makes a bug
// report ("it changed my camp") impossible to reproduce, and the moment
// anything calls it during render rather than in a handler it re-rolls on
// every re-render and the selection flickers under the learner. A fixed
// first option is stable by construction: the same content produces the
// same automatic choice, and the screens can say plainly that one was
// chosen for you.
//
// It is a pick, not a preference. Nothing in the review, the timing or
// the scoring treats the first camp as the better answer, and the learner
// can go back and change it: an automatic choice is replaced by a user
// choice the moment one is made.
//
// Returns undefined for a task with no options, which is every task but
// Task 5 and is why the caller has to handle it.
export function defaultSpeakingChoiceOptionId(
  task: SpeakingTaskContent,
): string | undefined {
  return task.choiceStep?.options[0]?.id;
}

// The chosen option card itself, rather than its id.
//
// Returns undefined where the task offers no options, where none has been
// chosen, or where a stored id no longer matches any option, which is
// what a content edit between two runs would leave behind. The last case
// is why this is a lookup rather than a cast: a screen that prints the
// chosen camp has to be able to say nothing rather than print an id.
export function getSpeakingChosenOption(
  task: SpeakingTaskContent,
  choices: SpeakingChoiceMap,
): SpeakingOptionCard | undefined {
  const choice = getSpeakingChoice(choices, task.taskId);

  if (!choice) {
    return undefined;
  }

  return task.choiceStep?.options.find(
    (option) => option.id === choice.optionId,
  );
}

// The option the learner is arguing against.
//
// Held on the step rather than worked out from the selection, because in
// Mock Test 1 it is a third camp the sister is proposing and not the
// option that was passed over. A screen asks for it by name so nothing
// has to guess which of the three cards is which.
export function getSpeakingComparisonOption(
  task: SpeakingTaskContent,
): SpeakingOptionCard | undefined {
  return task.choiceStep?.comparison;
}

// What the completion screen reports for one task.
//
// Recorded or not, and how long. No score, no band, no transcript and no
// feedback, because none of those exist yet and a summary type with empty
// fields waiting for them would be an invitation to fill them with
// something invented.
export function summarizeSpeakingTask(
  task: SpeakingTaskContent,
  responses: SpeakingResponseMap,
): SpeakingTaskSummary {
  const response = getSpeakingResponse(responses, task.taskId);

  return {
    taskId: task.taskId,
    taskLabel: task.taskLabel,
    taskTitle: task.taskTitle,
    recorded: hasSpeakingRecording(responses, task.taskId),
    durationSeconds: response.durationSeconds,
    recordedAt: response.recordedAt,
  };
}

// What the completion screen reports for the whole section, in task
// order.
export function summarizeSpeakingSection(
  content: SpeakingSectionContent,
  responses: SpeakingResponseMap,
): SpeakingTaskSummary[] {
  return content.tasks.map((task) => summarizeSpeakingTask(task, responses));
}

// SPEAKING-05A added no gate either, and it is worth saying because it
// added a screen that looks like it should have one.
//
// The Task 5 choice screen moves forward on Next whether or not an option
// has been chosen. Pressing Next with nothing chosen picks one, which is
// what the source screen says happens and is the opposite of holding the
// learner there. The choice window running out picks nothing at all: it
// changes a reading, says so on the screen, and waits.
//
// There is deliberately no areAllSpeakingTasksRecorded here.
//
// Nothing in the Speaking flow blocks Next on a missing recording. The
// ticket asks for missing recordings not to crash the flow, and a gate
// would do worse than crash: it would trap a learner whose microphone is
// broken on a screen they cannot leave. A task with no recording travels
// as the empty response, counts nothing, and is reported as missing on
// the completion screen.
