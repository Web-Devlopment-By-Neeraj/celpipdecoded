"use client";

import { Fragment, useMemo, useRef, useState } from "react";
import {
  MockTestTimeUpToast,
  useMockTestTimeUpToast,
} from "../player/MockTestTimeUpToast";
import { WritingEvaluationErrorScreen } from "./WritingEvaluationErrorScreen";
import { WritingEvaluationProcessingScreen } from "./WritingEvaluationProcessingScreen";
import { WritingSectionCompleteScreen } from "./WritingSectionCompleteScreen";
import { WritingSectionIntroScreen } from "./WritingSectionIntroScreen";
import { WritingSectionResultScreen } from "./WritingSectionResultScreen";
import { WritingTaskScreen } from "./WritingTaskScreen";
import { WritingTaskTransitionScreen } from "./WritingTaskTransitionScreen";
import { WritingTaskTwoChoiceScreen } from "./WritingTaskTwoChoiceScreen";
import { WritingTaskTwoEditorScreen } from "./WritingTaskTwoEditorScreen";
import {
  formatWritingSectionMeta,
  formatWritingTaskMeta,
  writingMockCopy,
} from "@/features/exam-engine/writing-mock-copy";
import {
  buildWritingSectionFlow,
  countWritingTaskWords,
  getWritingChoice,
  getWritingResponse,
  setWritingChoice,
  setWritingResponse,
  summarizeWritingSection,
  writingTaskHasOptions,
} from "@/features/exam-engine/writing-mock-flow";
import type { WritingMockCopy } from "@/features/exam-engine/writing-mock-copy";
import type {
  WritingMockEvaluation,
  WritingMockEvaluationInput,
  WritingMockEvaluationOutcome,
} from "@/features/exam-engine/writing-mock-evaluation-types";
import type {
  WritingChoiceMap,
  WritingResponseMap,
  WritingSectionContent,
} from "@/features/exam-engine/writing-mock-types";

// Mock Test 1 Writing section (EXAM-25, extended by EXAM-26).
//
// The whole Writing section as one run: the section intro, Task 1, a
// short transition, the Task 2 choice screen, Task 2, and a completion
// screen. Six screens, built by buildWritingSectionFlow from the content
// rather than typed out here.
//
// EXAM-UI-04 added the fifth of those and split Task 2 across two
// screens. Choosing a position and writing the response used to be one
// screen with a radio group above an open editor; they are now a decision
// screen and a writing screen. The section still owns both answers, and
// owns them in the same two maps as before, so the split is a change to
// what is drawn and not to what is held: the position chosen on the
// choice screen is the same value the editor screen reads, and the AI
// review at the end receives exactly the responses it always did.
//
// It owns three pieces of state and nothing else:
//
// - the responses, as one { taskId: text } map
// - the chosen positions, as one { taskId: optionId } map
// - the review, as one small state machine
//
// All three live in local component state. Nothing is written to a
// database, to localStorage or to a cookie, no Supabase client is
// imported here, and a page reload starts the section again. The one
// thing that leaves the browser is the pair of responses, when the
// learner presses Submit for AI Review, and what comes back is held in
// the same state as everything else and saved nowhere.
//
// EXAM-26 added the review, and it did not add a screen to the flow. The
// completion screen is still the last of them, and the review states
// are drawn in its place while a review is in flight, has failed, or has
// come back. Adding a sixth flow screen would have renumbered every
// screen in the section ("Screen 1 of 6" on the intro), for a screen that
// only some runs ever reach.
//
// Why responses survive navigation. They are keyed by task id rather than
// by screen position, and this component stays mounted for the whole
// section, so moving to the transition and back, or to Task 2 and back to
// Task 1, does not touch the map at all. The task screen below is
// remounted by that navigation and the text is not, which is the whole
// reason the state lives here rather than inside the editor.
//
// Why the two maps are separate. A choice and an essay are different
// answers to different questions, and only Task 2 has both. Keeping them
// apart means changing a position cannot disturb a response, which
// matters: a learner who clicks the other option halfway through Task 2
// keeps every word they have written.
//
// Why a changed response clears a finished review. The review is a
// judgement of two particular pieces of text, so the moment either of
// them changes it is a judgement of writing that no longer exists.
// Leaving it on screen would let a learner edit Task 2, walk forward, and
// read a level that was estimated from the paragraph they just deleted.
// Editing therefore returns the completion screen to its unreviewed
// state, with the Submit for AI Review button live again.
//
// What this component deliberately does not do:
//
// - it does not mark anything against an answer key. Writing has none,
//   which is why the server action beside this flow reviews rather than
//   marks
// - it does not construct an OpenAI client, read an environment variable
//   or hold a prompt. It calls one server action and renders what comes
//   back
// - it does not gate Next on an empty response. A learner can walk the
//   whole section without typing a word and reach a completion screen
//   that says 0 words, twice, which is the honest reading of what they
//   did. The one gate anywhere in the section is on the Task 2 choice
//   screen, which holds until a position has been chosen, and it lives in
//   that screen rather than here. See the note at the top of
//   WritingTaskTwoChoiceScreen.tsx for why writing is ungated and a
//   position is not
// - it does not act on a timer reaching zero. Both task screens are
//   handed showTimeUp as their onTimeExpire (TIMER-01), so a closed
//   window shows "Time is up" in red and raises the toast for a few
//   seconds. Nothing submits, nothing advances, and nothing is erased:
//   the response text is held in this component's state, above the screen
//   key, so a closing window cannot reach it. Finish Writing and Submit
//   for AI Review behave exactly as they did before the window closed
//
// Back is enabled throughout, which the official-style flow would not
// allow, so the sequence can be walked through repeatedly during review.
// This is the prototype behaviour the Reading routes already have.
// Strict Writing timing, with a forward only run, is a later ticket.
//
// Every screen title, instruction, prompt and option comes from the
// content object passed in, so this component carries no Mock Test 1 text
// of its own.
//
// House style: normal hyphens only, no long hyphens or em dashes.

// Sends both responses for AI review and returns the practice estimate.
//
// Passed in rather than imported, so this component depends on the shape
// of the outcome and not on one particular route's action. It is the same
// arrangement ReadingSectionPrototype uses for its marking action, and
// for the same reason: the component stays renderable without a server.
export type WritingSectionEvaluateAction = (
  input: WritingMockEvaluationInput,
) => Promise<WritingMockEvaluationOutcome>;

// Where the review has got to.
//
// "failed" carries our own message rather than a provider's. The server
// never returns provider text, so there is none to carry.
type ReviewState =
  | { status: "idle" }
  | { status: "working" }
  | { status: "ready"; evaluation: WritingMockEvaluation }
  | { status: "failed"; message?: string };

export type WritingSectionPrototypeProps = {
  content: WritingSectionContent;
  // Omit to run the section with no review at all, which leaves the
  // completion screen exactly as EXAM-25 shipped it.
  evaluateResponses?: WritingSectionEvaluateAction;
  copy?: WritingMockCopy;
  // Where Return to dashboard goes from the completion and result
  // screens.
  dashboardHref?: string;
};

export function WritingSectionPrototype({
  content,
  evaluateResponses,
  copy = writingMockCopy,
  dashboardHref,
}: WritingSectionPrototypeProps) {
  const screens = useMemo(() => buildWritingSectionFlow(content), [content]);

  const [screenIndex, setScreenIndex] = useState(0);
  const [responses, setResponses] = useState<WritingResponseMap>({});
  const [choices, setChoices] = useState<WritingChoiceMap>({});
  const [review, setReview] = useState<ReviewState>({ status: "idle" });

  // The one time up message for the whole section (TIMER-01). See
  // MockTestTimeUpToast for why it belongs here rather than to a screen.
  const { toastKey, showTimeUp, dismissTimeUp } = useMockTestTimeUpToast();

  // Which review request is the current one.
  //
  // A learner can submit, go back, change a paragraph and submit again
  // faster than the first reply arrives, and the older reply would then
  // land on writing they have already changed. Every request takes a
  // number and a reply is dropped unless its number is still the latest.
  //
  // A ref rather than state, for the reason ReadingSectionPrototype gives
  // for its own: nothing renders from it, and bumping it has to take
  // effect immediately rather than at the next render.
  const reviewRequestId = useRef(0);

  const screen = screens[screenIndex];
  const totalScreens = screens.length;
  const totalTasks = content.tasks.length;

  const goNext = () => {
    // A time up message belongs to the screen it was raised on, so moving
    // takes it away rather than carrying it onto the next one (TIMER-01).
    dismissTimeUp();
    setScreenIndex((current) => Math.min(current + 1, totalScreens - 1));
  };

  const goBack = () => {
    dismissTimeUp();
    setScreenIndex((current) => Math.max(current - 1, 0));
  };

  const changeResponse = (taskId: string, text: string) => {
    setResponses((current) => setWritingResponse(current, taskId, text));

    // A review of the previous text is not a review of this one. Any
    // reply still in flight is dropped as well, so it cannot arrive after
    // the edit and re-open a result for writing that has changed.
    reviewRequestId.current += 1;
    setReview({ status: "idle" });
  };

  const chooseOption = (taskId: string, optionId: string) => {
    setChoices((current) => setWritingChoice(current, taskId, optionId));
  };

  // Send both responses for review.
  //
  // The input is the two response texts, positionally, which is the whole
  // contract: the task ids, the prompts, the requirements and the word
  // targets are held by the server and are neither sent nor accepted from
  // here. Two tasks is what a CELPIP Writing section has, and a section
  // with fewer sends an empty string for the task it does not have, which
  // the server reads as blank.
  const requestReview = async () => {
    if (!evaluateResponses) {
      return;
    }

    reviewRequestId.current += 1;
    const requestId = reviewRequestId.current;

    setReview({ status: "working" });

    const input: WritingMockEvaluationInput = {
      task1Response: content.tasks[0]
        ? getWritingResponse(responses, content.tasks[0].taskId)
        : "",
      task2Response: content.tasks[1]
        ? getWritingResponse(responses, content.tasks[1].taskId)
        : "",
    };

    try {
      const outcome = await evaluateResponses(input);

      if (reviewRequestId.current !== requestId) {
        return;
      }

      setReview(
        outcome.ok
          ? { status: "ready", evaluation: outcome.evaluation }
          : { status: "failed", message: outcome.message },
      );
    } catch {
      if (reviewRequestId.current !== requestId) {
        return;
      }

      setReview({ status: "failed" });
    }
  };

  // Start the section again from the first screen with nothing typed,
  // nothing chosen and no review. All three go, because everything the
  // run produced is in them. Nothing was saved, so there is nothing else
  // to clear. The request id moves on so a reply still in flight cannot
  // land on the fresh run.
  const restart = () => {
    reviewRequestId.current += 1;
    dismissTimeUp();
    setScreenIndex(0);
    setResponses({});
    setChoices({});
    setReview({ status: "idle" });
  };

  // Leave the review and go back to the completion screen with the
  // writing still held. Used by the error screen, so a failed review is
  // never a dead end.
  const dismissReview = () => {
    reviewRequestId.current += 1;
    setReview({ status: "idle" });
  };

  // Back is hidden on the first screen only, because there is nothing
  // behind it inside the section.
  const showBack = screenIndex > 0;

  if (!screen) {
    return null;
  }

  // The screen at the current position.
  //
  // Wrapped in a function so the whole flow can be given one key below.
  const renderCurrentScreen = () => {
    if (screen.kind === "task-choice") {
      const task = content.tasks[screen.taskIndex];

      if (!task) {
        return null;
      }

      return (
        <WritingTaskTwoChoiceScreen
          task={task}
          selectedOptionId={getWritingChoice(choices, task.taskId)}
          onSelectOption={(optionId) => chooseOption(task.taskId, optionId)}
          // The task id rather than the flow screen id, so the choice
          // screen and the editor after it read one Task 2 window rather
          // than two different ones.
          timerScreenKey={task.taskId}
          copy={copy}
          metaText={formatWritingTaskMeta(
            task.taskNumber,
            totalTasks,
            screenIndex + 1,
            totalScreens,
          )}
          onNext={goNext}
          onBack={goBack}
          showBack={showBack}
        />
      );
    }

    if (screen.kind === "task") {
      const task = content.tasks[screen.taskIndex];

      if (!task) {
        return null;
      }

      // The last task closes the section, so its forward control says
      // so. Every other task keeps the shell's own Next.
      const taskNextLabel =
        screen.taskIndex === totalTasks - 1
          ? copy.finishWritingLabel
          : undefined;

      const taskMetaText = formatWritingTaskMeta(
        task.taskNumber,
        totalTasks,
        screenIndex + 1,
        totalScreens,
      );

      // A task that offers positions was decided on the screen before
      // this one, so it gets the editor screen that restates the choice
      // rather than the one that asks for it (EXAM-UI-04). A task with no
      // positions, which in Mock Test 1 is Task 1, is unchanged.
      if (writingTaskHasOptions(task)) {
        return (
          <WritingTaskTwoEditorScreen
            task={task}
            response={getWritingResponse(responses, task.taskId)}
            onChangeResponse={(text) => changeResponse(task.taskId, text)}
            choices={choices}
            onSelectOption={(optionId) => chooseOption(task.taskId, optionId)}
            timerScreenKey={task.taskId}
            // The window closing raises the time up message and does
            // nothing else. The typed response is untouched (TIMER-01).
            onTimeExpire={showTimeUp}
            copy={copy}
            nextLabel={taskNextLabel}
            metaText={taskMetaText}
            onNext={goNext}
            onBack={goBack}
            showBack={showBack}
          />
        );
      }

      return (
        <WritingTaskScreen
          task={task}
          response={getWritingResponse(responses, task.taskId)}
          onChangeResponse={(text) => changeResponse(task.taskId, text)}
          // The flow screen id, so the window belongs to the screen and
          // typing does not restart it.
          timerScreenKey={screen.id}
          // The window closing raises the time up message and does
          // nothing else. The typed response is untouched (TIMER-01).
          onTimeExpire={showTimeUp}
          copy={copy}
          nextLabel={taskNextLabel}
          metaText={taskMetaText}
          onNext={goNext}
          onBack={goBack}
          showBack={showBack}
        />
      );
    }

    const metaText = formatWritingSectionMeta(screenIndex + 1, totalScreens);

    if (screen.kind === "section-intro") {
      return (
        <WritingSectionIntroScreen
          content={content}
          copy={copy}
          metaText={metaText}
          onNext={goNext}
          onBack={goBack}
          showBack={showBack}
        />
      );
    }

    if (screen.kind === "task-transition") {
      const nextTask = content.tasks[screen.taskIndex];
      const completedTask = content.tasks[screen.taskIndex - 1];

      if (!nextTask || !completedTask) {
        return null;
      }

      return (
        <WritingTaskTransitionScreen
          title={content.title}
          completedTaskLabel={completedTask.taskLabel}
          nextTaskLabel={nextTask.taskLabel}
          completedWordCount={countWritingTaskWords(
            responses,
            completedTask.taskId,
          )}
          copy={copy}
          metaText={metaText}
          onNext={goNext}
          onBack={goBack}
          showBack={showBack}
        />
      );
    }

    // The completion screen, and the three review states drawn in its
    // place. The last screen in the flow, so there is no Next, and Back
    // returns to Task 2 with every word still there in all four states.
    if (review.status === "working") {
      return (
        <WritingEvaluationProcessingScreen
          title={content.title}
          copy={copy}
          metaText={metaText}
          onBack={goBack}
          showBack={showBack}
        />
      );
    }

    if (review.status === "failed") {
      return (
        <WritingEvaluationErrorScreen
          title={content.title}
          message={review.message}
          onRetry={() => void requestReview()}
          onBackToResponses={dismissReview}
          dashboardHref={dashboardHref}
          copy={copy}
          metaText={metaText}
          onBack={goBack}
          showBack={showBack}
        />
      );
    }

    if (review.status === "ready") {
      return (
        <WritingSectionResultScreen
          title={content.title}
          evaluation={review.evaluation}
          tasks={content.tasks}
          onRestart={restart}
          dashboardHref={dashboardHref}
          copy={copy}
          metaText={metaText}
          onBack={goBack}
          showBack={showBack}
        />
      );
    }

    return (
      <WritingSectionCompleteScreen
        title={content.title}
        tasks={summarizeWritingSection(content, responses, choices)}
        dashboardHref={dashboardHref}
        onRestart={restart}
        // The review block is drawn only where an action was passed, so
        // a run with no server behind it shows no control that cannot
        // work.
        onRequestReview={
          evaluateResponses ? () => void requestReview() : undefined
        }
        copy={copy}
        metaText={metaText}
        onBack={goBack}
        showBack={showBack}
      />
    );
  };

  // One keyed fragment around the whole flow, for the reason the Reading
  // and Listening section prototypes have one.
  //
  // Inside the locked viewport the exam canvas is the only region that
  // scrolls, and it is the same DOM element on every screen, so its
  // scroll offset would otherwise carry over: pressing Next at the bottom
  // of a task would land on the next screen already scrolled halfway down
  // it. Keying on the screen id remounts the frame when the screen
  // changes, so every screen opens at the top of the canvas.
  //
  // It does not disturb the responses. They are held in this component's
  // state, which is above the key, so remounting the frame below rebuilds
  // the screen and leaves every word where it was.
  //
  // The review status is part of the key as well, because the four review
  // states share one flow screen. Without it, moving from the completion
  // screen to a result four times as long would leave the canvas scrolled
  // to wherever the shorter screen had been left.
  //
  // The toast sits outside that key (TIMER-01). Inside it, a change of
  // screen would remount the message and start its few seconds again on a
  // screen it does not belong to.
  return (
    <Fragment>
      <Fragment key={screen.id + "-" + review.status}>
        {renderCurrentScreen()}
      </Fragment>

      <MockTestTimeUpToast toastKey={toastKey} />
    </Fragment>
  );
}
