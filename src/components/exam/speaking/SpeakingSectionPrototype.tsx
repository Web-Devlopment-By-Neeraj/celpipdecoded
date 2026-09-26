"use client";

import { Fragment, useMemo, useRef, useState } from "react";
import {
  MockTestTimeUpToast,
  useMockTestTimeUpToast,
} from "../player/MockTestTimeUpToast";
import { SpeakingEvaluationErrorScreen } from "./SpeakingEvaluationErrorScreen";
import { SpeakingEvaluationProcessingScreen } from "./SpeakingEvaluationProcessingScreen";
import { SpeakingSectionCompleteScreen } from "./SpeakingSectionCompleteScreen";
import { SpeakingSectionIntroScreen } from "./SpeakingSectionIntroScreen";
import { SpeakingSectionResultScreen } from "./SpeakingSectionResultScreen";
import { SpeakingTaskFiveChoiceScreen } from "./SpeakingTaskFiveChoiceScreen";
import { SpeakingTaskFiveInstructionsScreen } from "./SpeakingTaskFiveInstructionsScreen";
import { SpeakingTaskFivePreparationScreen } from "./SpeakingTaskFivePreparationScreen";
import { SpeakingTaskFiveRecordingScreen } from "./SpeakingTaskFiveRecordingScreen";
import { SpeakingTaskScreen } from "./SpeakingTaskScreen";
import { SpeakingTaskTransitionScreen } from "./SpeakingTaskTransitionScreen";
import {
  formatSpeakingSectionMeta,
  formatSpeakingTaskMeta,
  speakingMockCopy,
} from "@/features/exam-engine/speaking-mock-copy";
import {
  buildSpeakingSectionFlow,
  defaultSpeakingChoiceOptionId,
  getSpeakingChoice,
  getSpeakingChosenOption,
  getSpeakingResponse,
  listSpeakingAudioUrls,
  setSpeakingChoice,
  setSpeakingResponse,
  speakingTaskHasChoiceStep,
  summarizeSpeakingSection,
} from "@/features/exam-engine/speaking-mock-flow";
import { submitSpeakingMockReview } from "@/features/exam-engine/submit-speaking-mock-review";
import type { SpeakingMockRecording } from "./useSpeakingMockRecorder";
import type { SpeakingMockCopy } from "@/features/exam-engine/speaking-mock-copy";
import type {
  SpeakingMockEvaluation,
  SpeakingMockEvaluationErrorCode,
} from "@/features/exam-engine/speaking-mock-evaluation-types";
import type {
  SpeakingChoiceMap,
  SpeakingResponseMap,
  SpeakingSectionContent,
  SpeakingTaskContent,
} from "@/features/exam-engine/speaking-mock-types";

// Mock Test 1 Speaking section (EXAM-27, extended by EXAM-28).
//
// The whole Speaking section as one run: the section intro, eight tasks,
// a short transition before each task after the first, and a completion
// screen. Twenty screens, built by buildSpeakingSectionFlow from the
// content rather than typed out here.
//
// Twenty rather than seventeen because Task 5 is four screens rather than
// one (SPEAKING-05A). See the Task 5 note below.
//
// It owns four pieces of state and nothing else:
//
// - which screen is showing
// - the recordings, as one { taskId: SpeakingResponse } map
// - the Task 5 choices, as one { taskId: SpeakingTaskChoice } map
//   (SPEAKING-05A)
// - the review, as one small state machine
//
// All four live in local component state. Nothing is written to a
// database, to localStorage or to a cookie, and a page reload starts the
// section again with nothing recorded. The one thing that leaves the
// browser is the audio, when the learner presses Submit for AI Review,
// and what comes back is held in the same state as everything else and
// saved nowhere.
//
// EXAM-28 added the review, and it did not add a screen to the flow. The
// completion screen is still the last screen in the flow, and the review
// states are drawn in its place while a review is in flight, has failed,
// or has come back. Adding an eighteenth flow screen would have
// renumbered every screen in the section ("Screen 1 of 21" on the
// intro), for a screen that only some runs ever reach. It is the
// arrangement WritingSectionPrototype already uses.
//
// Why the review is a fetch and not a server action. Its Writing
// counterpart is passed a server action from its page, because a Writing
// submission is two strings. A Speaking submission is up to eight audio
// recordings at once, which is past the body size limit a server action
// carries, so the submission goes to an API route as FormData instead.
// The header note on that route says the rest. The consequence here is
// that this component calls submitSpeakingMockReview rather than being
// handed an action, and that the call cannot be swapped out by the page.
//
// Why a changed recording clears a finished review. The review is a
// judgement of eight particular recordings, so the moment any of them
// changes it is a judgement of audio that no longer exists. Leaving it
// on screen would let a learner re-record Task 3, walk forward, and read
// a level that was estimated from the take they just replaced.
// Re-recording therefore returns the completion screen to its unreviewed
// state, with the Submit for AI Review button live again.
//
// Task 5, which is four screens rather than one (SPEAKING-05A)
// -----------------------------------------------------------
//
// Task 5 asks the learner to choose between two summer camps and then
// persuade a family member that they chose well, so it runs as an
// instructions screen, a choice screen, a preparation screen and a
// recording screen. The flow builder produces those three extra screens
// for any task carrying a choiceStep, which in Mock Test 1 is Task 5
// alone, and this component draws them. The other seven tasks are
// untouched and still get the single SpeakingTaskScreen they always had.
//
// The choice lives here rather than on the choice screen, for the reason
// the recordings do: the screen is unmounted the moment Next is pressed,
// and a value held on it would go with it. Held here it survives walking
// forward to the recording screen and back, and the preparation and
// recording screens read the same value the choice screen wrote rather
// than keeping a copy of their own in step with it.
//
// The automatic choice is made in the Next handler, chooseAndAdvance
// below, and made once. Two rules keep it from becoming the flicker the
// ticket warns about: it never runs during render, so a re-render cannot
// re-roll it, and it never overwrites a choice that already exists, so
// walking back to the choice screen and forward again does not pick a
// second time. What it picks is the first option, every time. The long
// note on defaultSpeakingChoiceOptionId says why a fixed pick beats a
// random one here.
//
// Why the choice survives navigation. They are keyed by task id rather
// than by screen position, and this component stays mounted for the whole
// section, so moving to the transition and back, or to Task 8 and back to
// Task 3, does not touch the map at all. The task screen below is
// remounted by that navigation and the audio is not, which is the whole
// reason the state lives here rather than inside the recorder.
//
// The object URLs, which are the one piece of housekeeping
// -------------------------------------------------------
//
// A recording arrives as a Blob. A Blob cannot be put in an audio element
// directly, so URL.createObjectURL turns it into a blob: URL that
// resolves inside this document. That URL is a handle the browser holds
// open until it is revoked or the document goes away, so this component
// revokes every one it displaces:
//
// - recording again over a take revokes the take it replaced, in the same
//   handler that creates the new one
// - restarting the section revokes every URL in the map before clearing
//   it
//
// The URL is created in an event handler rather than during render or in
// an effect, which is deliberate. Creating one during render would leak a
// handle on every re-render, and this project's lint rules refuse both a
// browser call in a hook body and a state push from an effect. An event
// handler is where both the creation and the revoke belong, and it is
// also the only place that knows which URL is being displaced.
//
// Leaving the page needs no cleanup of its own, because a blob: URL is
// scoped to the document that made it and the browser reclaims all of
// them when that document goes away. What is handled here is the case the
// browser cannot see: a URL displaced while the page stays open.
//
// What this component deliberately does not do:
//
// - it does not transcribe, score or estimate anything itself. It sends
//   the recordings to one endpoint and renders what comes back. No
//   prompt, no model name, no API key and no scoring rule exists in the
//   browser bundle
// - it does not store audio anywhere. The recordings cross to the server
//   once, for the length of one review request, and are never written to
//   Supabase Storage, a database, localStorage or a cookie
// - it does not gate Next on a missing recording. A learner can walk the
//   whole section without recording a word and reach a completion screen
//   that says 0 of 8 tasks recorded, which is the honest reading of what
//   they did
// - it does not act on a timer reaching zero. Every clock is given an
//   expiry handler (TIMER-01), and all it does is raise the shared time
//   up message for a few seconds. A closed window shows "Time is up" in
//   red and nothing else happens: no recording is stopped, no task is
//   advanced, no take is erased, no option is chosen, and Submit for AI
//   Review is unchanged. The Task 5 choice window is the sharpest case
//   and it behaves the same way: the window closing selects nothing, and
//   the cards stay live for a learner who was still deciding
//
// Back is enabled throughout, which the official-style flow would not
// allow, so the sequence can be walked through repeatedly during review.
// This is the prototype behaviour the Reading and Writing routes already
// have. Strict Speaking timing, with a forward only run, is a later
// ticket.
//
// Every screen title, instruction, prompt and picture comes from the
// content object passed in, so this component carries no Mock Test 1 text
// of its own.
//
// House style: normal hyphens only, no long hyphens or em dashes.

// Where the review has got to.
//
// "failed" carries our own message and our own code, never a provider's.
// The server never returns provider text, so there is none to carry. The
// code reaches the error screen for one decision only: whether a retry
// is worth offering.
type ReviewState =
  | { status: "idle" }
  | { status: "working" }
  | { status: "ready"; evaluation: SpeakingMockEvaluation }
  | { status: "failed"; message?: string; code?: SpeakingMockEvaluationErrorCode };

export type SpeakingSectionPrototypeProps = {
  content: SpeakingSectionContent;
  copy?: SpeakingMockCopy;
  // Where Return to dashboard goes from the completion and result
  // screens.
  dashboardHref?: string;
  // Set false to run the section with no review at all, which leaves the
  // completion screen without the Submit for AI Review control. Used
  // where the flow is being walked through without a server behind it.
  enableReview?: boolean;
};

export function SpeakingSectionPrototype({
  content,
  copy = speakingMockCopy,
  dashboardHref,
  enableReview = true,
}: SpeakingSectionPrototypeProps) {
  const screens = useMemo(() => buildSpeakingSectionFlow(content), [content]);

  const [screenIndex, setScreenIndex] = useState(0);
  const [responses, setResponses] = useState<SpeakingResponseMap>({});
  // The Task 5 choices, and what would be the other tasks' if any of them
  // ever offered one (SPEAKING-05A).
  const [choices, setChoices] = useState<SpeakingChoiceMap>({});
  const [review, setReview] = useState<ReviewState>({ status: "idle" });

  // The one time up message for the whole section (TIMER-01). See
  // MockTestTimeUpToast for why it belongs here rather than to a screen.
  const { toastKey, showTimeUp, dismissTimeUp } = useMockTestTimeUpToast();

  // Which review request is the current one.
  //
  // A learner can submit, go back, re-record a task and submit again
  // faster than the first reply arrives, and the older reply would then
  // land on recordings they have already replaced. Every request takes a
  // number and a reply is dropped unless its number is still the latest.
  //
  // A ref rather than state, for the reason WritingSectionPrototype
  // gives for its own: nothing renders from it, and bumping it has to
  // take effect immediately rather than at the next render.
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

  // Store a finished take, replacing whatever the task held before.
  //
  // The object URL is made here, in a handler, and the displaced one is
  // revoked in the same breath. Reading the previous URL out of the
  // updater argument rather than out of the render's copy of the map is
  // what makes that safe under React's batching: the updater always sees
  // the current map, so two takes finishing back to back cannot leave one
  // URL unrevoked.
  const storeRecording = (taskId: string, recording: SpeakingMockRecording) => {
    const audioUrl = URL.createObjectURL(recording.blob);

    setResponses((current) => {
      const previousUrl = getSpeakingResponse(current, taskId).audioUrl;

      if (previousUrl) {
        URL.revokeObjectURL(previousUrl);
      }

      return setSpeakingResponse(current, taskId, {
        audioUrl,
        audioBlob: recording.blob,
        durationSeconds: recording.durationSeconds,
        recordedAt: new Date().toISOString(),
        mimeType: recording.mimeType,
      });
    });

    // A review of the previous takes is not a review of these. Any reply
    // still in flight is dropped as well, so it cannot arrive after the
    // re-record and re-open a result for audio that has been replaced.
    reviewRequestId.current += 1;
    setReview({ status: "idle" });
  };

  // Record the option the learner picked on a choice screen.
  //
  // Always a user choice: this is only ever reached from a click on a
  // card, and it replaces an automatic pick made on a previous visit as
  // well as an earlier user one. A learner who came back to change their
  // mind has chosen, whatever happened the first time through.
  //
  // It does not clear the review. A finished review is a judgement of the
  // recordings and not of the camp, and the recording it judged is still
  // exactly the recording that was made. Re-recording Task 5 clears it,
  // through storeRecording above, which is the change that actually
  // invalidates it.
  const chooseOption = (taskId: string, optionId: string) => {
    setChoices((current) => setSpeakingChoice(current, taskId, optionId, "user"));
  };

  // Leave a choice screen, choosing for the learner if they did not.
  //
  // The source screen says the computer chooses if you do not, and this
  // is where it does. Three things about it are deliberate:
  //
  // - it runs in the Next handler, so it happens once, on a press, and
  //   never during a render. Nothing here can re-roll under the learner
  // - it never overwrites an existing entry, so walking back to the
  //   choice screen and pressing Next again keeps the option that is
  //   already there rather than picking a second time
  // - it marks the entry "system", so the preparation screen can say
  //   plainly that nobody chose this and that going back is still
  //   possible
  //
  // A task with no options gets no entry at all, and the screens after it
  // draw no chosen card. That case cannot arise from the flow, which
  // builds a choice screen only where there are options to choose
  // between, and is handled rather than asserted.
  const chooseAndAdvance = (task: SpeakingTaskContent) => {
    const fallbackOptionId = defaultSpeakingChoiceOptionId(task);

    if (fallbackOptionId) {
      setChoices((current) =>
        current[task.taskId]
          ? current
          : setSpeakingChoice(current, task.taskId, fallbackOptionId, "system"),
      );
    }

    goNext();
  };

  // Send the recordings for review.
  //
  // The whole map goes, and the helper decides what that means on the
  // wire: one audio part per task that has a blob, and one metadata
  // entry per task either way. The task ids, prompts, pictures and
  // recording windows are held by the server and are neither sent nor
  // accepted from here.
  //
  // A section with nothing recorded is submitted like any other. What
  // comes back is a structured no-response result built with no provider
  // call at all, which is a more useful thing to show than a disabled
  // button.
  const requestReview = async () => {
    reviewRequestId.current += 1;
    const requestId = reviewRequestId.current;

    setReview({ status: "working" });

    try {
      const outcome = await submitSpeakingMockReview(content, responses);

      if (reviewRequestId.current !== requestId) {
        return;
      }

      setReview(
        outcome.ok
          ? { status: "ready", evaluation: outcome.evaluation }
          : {
              status: "failed",
              message: outcome.message,
              code: outcome.code,
            },
      );
    } catch {
      if (reviewRequestId.current !== requestId) {
        return;
      }

      setReview({ status: "failed" });
    }
  };

  // Start the section again from the first screen with nothing recorded
  // and no review.
  //
  // Every object URL goes first, because the map is about to stop being
  // the only reference to them. Nothing was saved, so there is nothing
  // else to clear. The request id moves on so a reply still in flight
  // cannot land on the fresh run and show a review of recordings that
  // have just been thrown away.
  const restart = () => {
    dismissTimeUp();

    setResponses((current) => {
      listSpeakingAudioUrls(current).forEach((url) => {
        URL.revokeObjectURL(url);
      });

      return {};
    });

    // The choices go with the recordings. A fresh run of Task 5 is a
    // fresh choice, and leaving the old one behind would open the choice
    // screen with a camp already picked and no way to tell whether the
    // learner had picked it.
    setChoices({});

    reviewRequestId.current += 1;
    setReview({ status: "idle" });
    setScreenIndex(0);
  };

  // Leave the review and go back to the completion screen with the
  // recordings still held. Used by the error screen, so a failed review
  // is never a dead end.
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
    // The three screens a task with a choiceStep gets before its
    // recording screen (SPEAKING-05A). Mock Test 1 produces one of each,
    // all for Task 5.
    if (
      screen.kind === "task-instructions" ||
      screen.kind === "task-choice" ||
      screen.kind === "task-prepare"
    ) {
      const task = content.tasks[screen.taskIndex];

      if (!task) {
        return null;
      }

      const taskMetaText = formatSpeakingTaskMeta(
        task.taskNumber,
        totalTasks,
        screenIndex + 1,
        totalScreens,
      );

      if (screen.kind === "task-instructions") {
        return (
          <SpeakingTaskFiveInstructionsScreen
            task={task}
            copy={copy}
            metaText={taskMetaText}
            onNext={goNext}
            onBack={goBack}
            showBack={showBack}
          />
        );
      }

      if (screen.kind === "task-choice") {
        return (
          <SpeakingTaskFiveChoiceScreen
            task={task}
            selectedOptionId={getSpeakingChoice(choices, task.taskId)?.optionId}
            onSelectOption={(optionId) => chooseOption(task.taskId, optionId)}
            // The flow screen id, so the choice window belongs to the
            // screen and picking a card does not restart it.
            timerScreenKey={screen.id}
            // The window closing raises the time up message and does
            // nothing else (TIMER-01). It selects nothing.
            onTimeExpire={showTimeUp}
            copy={copy}
            metaText={taskMetaText}
            // Next chooses for the learner where they did not choose, and
            // then moves. It never holds the screen.
            onNext={() => chooseAndAdvance(task)}
            onBack={goBack}
            showBack={showBack}
          />
        );
      }

      const choice = getSpeakingChoice(choices, task.taskId);

      return (
        <SpeakingTaskFivePreparationScreen
          task={task}
          chosenOption={getSpeakingChosenOption(task, choices)}
          choiceSource={choice?.source}
          timerScreenKey={screen.id}
          onTimeExpire={showTimeUp}
          copy={copy}
          metaText={taskMetaText}
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

      const taskMetaText = formatSpeakingTaskMeta(
        task.taskNumber,
        totalTasks,
        screenIndex + 1,
        totalScreens,
      );

      // The last task closes the section, so its forward control says so.
      // Every other task keeps the shell's own Next.
      const taskNextLabel =
        screen.taskIndex === totalTasks - 1
          ? copy.finishSpeakingLabel
          : undefined;

      // Task 5's recording screen is its own component, because the three
      // screens before it have already run the preparation window and
      // settled which camp is being argued for.
      if (speakingTaskHasChoiceStep(task)) {
        return (
          <SpeakingTaskFiveRecordingScreen
            task={task}
            chosenOption={getSpeakingChosenOption(task, choices)}
            response={getSpeakingResponse(responses, task.taskId)}
            onRecorded={(recording) => storeRecording(task.taskId, recording)}
            // The recording window closing raises the time up message and
            // does nothing else. It does not stop the take and it does
            // not advance to Task 6 (TIMER-01).
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
        <SpeakingTaskScreen
          task={task}
          response={getSpeakingResponse(responses, task.taskId)}
          onRecorded={(recording) => storeRecording(task.taskId, recording)}
          // The flow screen id, so the preparation window belongs to the
          // screen and a re-render does not restart it.
          timerScreenKey={screen.id}
          // Either window closing raises the time up message and does
          // nothing else (TIMER-01).
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

    const metaText = formatSpeakingSectionMeta(screenIndex + 1, totalScreens);

    if (screen.kind === "section-intro") {
      return (
        <SpeakingSectionIntroScreen
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

      const completedResponse = getSpeakingResponse(
        responses,
        completedTask.taskId,
      );

      return (
        <SpeakingTaskTransitionScreen
          title={content.title}
          completedTaskLabel={completedTask.taskLabel}
          nextTaskLabel={nextTask.taskLabel}
          completedRecorded={
            completedResponse.audioUrl !== null &&
            completedResponse.audioBlob !== null
          }
          completedDurationSeconds={completedResponse.durationSeconds}
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
    // returns to Task 8 with every recording still playable in all four
    // states.
    if (review.status === "working") {
      return (
        <SpeakingEvaluationProcessingScreen
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
        <SpeakingEvaluationErrorScreen
          title={content.title}
          message={review.message}
          code={review.code}
          onRetry={() => void requestReview()}
          onBackToRecordings={dismissReview}
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
        <SpeakingSectionResultScreen
          title={content.title}
          evaluation={review.evaluation}
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
      <SpeakingSectionCompleteScreen
        title={content.title}
        tasks={summarizeSpeakingSection(content, responses)}
        dashboardHref={dashboardHref}
        onRestart={restart}
        // The review block is drawn only where the review is enabled, so
        // a run with no server behind it shows no control that cannot
        // work.
        onRequestReview={enableReview ? () => void requestReview() : undefined}
        copy={copy}
        metaText={metaText}
        onBack={goBack}
        showBack={showBack}
      />
    );
  };

  // One keyed fragment around the whole flow, for the reason the Reading,
  // Listening and Writing section prototypes have one.
  //
  // Inside the locked viewport the exam canvas is the only region that
  // scrolls, and it is the same DOM element on every screen, so its
  // scroll offset would otherwise carry over: pressing Next at the bottom
  // of a task would land on the next screen already scrolled halfway down
  // it. Keying on the screen id remounts the frame when the screen
  // changes, so every screen opens at the top of the canvas.
  //
  // It does not disturb the recordings. They are held in this component's
  // state, which is above the key, so remounting the frame below rebuilds
  // the screen and leaves every take where it was.
  //
  // It does end a take in progress, and that is correct. The remount
  // unmounts the recorder, whose cleanup stops the MediaRecorder and
  // releases the microphone, and whose mount guard drops the abandoned
  // audio rather than writing it into a task the learner has left.
  //
  // The review status is part of the key as well, because the four
  // review states share one flow screen. Without it, moving from the
  // completion screen to a result many times as long would leave the
  // canvas scrolled to wherever the shorter screen had been left.
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
