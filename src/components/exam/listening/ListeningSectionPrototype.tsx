"use client";

import { Fragment, useMemo, useRef, useState } from "react";
import { ExamButton } from "../ExamButton";
import { ExamInstructionRow } from "../ExamInstructionRow";
import { ExamShell } from "../ExamShell";
import {
  MockTestTimeUpToast,
  useMockTestTimeUpToast,
} from "../player/MockTestTimeUpToast";
import { ListeningAudioScreen } from "./ListeningAudioScreen";
import { ListeningDropdownQuestionScreen } from "./ListeningDropdownQuestionScreen";
import { ListeningPartIntroScreen } from "./ListeningPartIntroScreen";
import { ListeningQuestionScreen } from "./ListeningQuestionScreen";
import { ListeningScenarioScreen } from "./ListeningScenarioScreen";
import { ListeningSectionBreakScreen } from "./ListeningSectionBreakScreen";
import { ListeningSectionEndScreen } from "./ListeningSectionEndScreen";
import { ListeningSectionInstructionScreen } from "./ListeningSectionInstructionScreen";
import { ListeningSectionPartTransitionScreen } from "./ListeningSectionPartTransitionScreen";
import { ListeningSectionReviewScreen } from "./ListeningSectionReviewScreen";
import { ListeningSectionScoreScreen } from "./ListeningSectionScoreScreen";
import { ListeningSectionVideoScreen } from "./ListeningSectionVideoScreen";
import { ListeningVideoQuestionScreen } from "./ListeningVideoQuestionScreen";
import { ListeningVideoScreen } from "./ListeningVideoScreen";
import { ListeningViewpointsQuestionScreen } from "./ListeningViewpointsQuestionScreen";
import { ListeningViewpointsScreen } from "./ListeningViewpointsScreen";
import { examScreenBody } from "@/features/exam-engine/exam-theme";
import {
  getListeningQuestion,
  resolveListeningQuestionAudio,
} from "@/features/exam-engine/listening-flow";
import {
  formatListeningSectionBreak,
  formatListeningSectionLabel,
  listeningCopy,
} from "@/features/exam-engine/listening-copy";
import {
  areAllListeningSectionPartQuestionsAnswered,
  buildListeningSectionFlow,
  countAnsweredListeningSectionQuestions,
  countListeningSectionPartQuestions,
  countListeningSectionQuestions,
  setListeningSectionAnswer,
} from "@/features/exam-engine/listening-section-flow";
import {
  formatListeningSectionMeta,
  formatListeningSectionPartMeta,
  listeningSectionCopy,
} from "@/features/exam-engine/listening-section-copy";
import {
  LISTENING_QUESTION_TIMER,
  getListeningPartScreenTimer,
} from "@/features/exam-engine/listening-timing";
import type { ListeningSectionCopy } from "@/features/exam-engine/listening-section-copy";
import type {
  ListeningSectionAnswerMap,
  ListeningSectionContent,
  ListeningSectionMarkedResult,
  ListeningSectionPartScreenRef,
} from "@/features/exam-engine/listening-section-types";

// Full Listening section prototype (EXAM-15).
//
// The whole Listening section as one run: the section instructions, the
// Listening instructional video, Parts 1 to 6 back to back, then one
// answer review, one practice score, and the end of section screen.
//
// It replaces nothing. The six part level prototypes still exist and their
// routes are unchanged, and this component renders the same screen
// components they do, with the same content objects. What it does not
// render is their closing screens: inside the full section a part hands
// straight over to the next one, so no part level review, no part level
// score and no part level end screen appears anywhere in this flow. That
// rule is enforced one level down, in buildListeningSectionFlow, rather
// than by this component remembering not to draw them.
//
// It owns three pieces of state:
//
// - which screen is showing, an index into the flow built by
//   buildListeningSectionFlow
// - the answers for all six parts, as one { questionId: optionId } map
// - the marking result, once the server has returned one
//
// All three live in local component state. Nothing is written to a
// database, to localStorage or to a cookie, and a page reload starts the
// section again. That is deliberate for a prototype and is recorded in
// docs/product/full-listening-section-flow.md.
//
// One answer map carries all 38 answers because the question ids are
// unique across the six Mock Test 1 content files, so no part prefix and
// no nesting is needed. Answers survive going back and forward, and across
// a part boundary in either direction, because they are keyed by question
// id rather than by screen position and because this component stays
// mounted for the whole section. Restart clears all 38 and returns to the
// instruction screen.
//
// Strict exam behaviour (EXAM-15F). This component is where the full run
// stops being a walkthrough and starts behaving like a test, and it is the
// only place that changed: the six individual part routes render the same
// screens with none of the rules below, so they stay usable for
// development. See docs/product/listening-format-strict-timing-polish.md.
//
// Three rules, all of them props passed down rather than behaviour built
// into a screen:
//
// - **Forward only.** Back is hidden from the first screen of the run to
//   the last question screen of Part 6. A learner cannot return to a
//   previous question or a previous part, which is the published rule. The
//   two closing screens keep Back, because it is what moves between the
//   score and the review and neither of them is answerable.
// - **A window that closes says so and stops there (TIMER-01).** Every
//   question screen is handed showTimeUp as its onTimeExpire, so reaching
//   zero turns the reading red, prints "Time is up" and raises the toast
//   below for a few seconds. Nothing else happens: no advance, no submit,
//   no modal, no alert, no sound, no flashing, no scroll and no focus
//   move. The answer map is not touched, so a question answered before its
//   window closed keeps its answer and a question left blank stays blank.
//   The learner presses Next when they are ready.
//
//   This is what TIMER-01 changed. Until then the same prop was goNext, so
//   a closing window advanced the run by itself and took the screen away
//   from a learner who was still reading it. Auto-advance is gone from
//   this file, and it was the only file in the engine that had it.
// - **Next never waits for an answer.** requireAnswer and
//   requireAllAnswered are false throughout the run. Leaving a question
//   blank and taking the zero is what the official test allows, and a
//   forward only run should not be able to trap a learner behind a gate.
//
// Timer durations come from listening-timing.ts, which is also where the
// working behind them is written down. Parts 1 to 3 keep the published 30
// seconds per question. Parts 4, 5 and 6 answer their whole question set
// on one screen, so each gets one window sized for that set, 3.5, 4 and 5
// minutes, with wider amber and red thresholds to match. Those three are
// derived from the published per-part allowance minus the clip, and are
// labelled as derived where they are defined.
//
// Media is asked to start on its own. The learner reached the screen by
// pressing Next, which is the user gesture a browser autoplay policy looks
// for, so the instructional video, every conversation and news clip, the
// Part 5 discussion video, the Part 6 report and each Parts 1 to 3
// question clip all attempt to play as their screen opens. A browser that
// refuses leaves the controls alone and the player prints a line saying to
// press play. No clip is muted to get around a policy and no clip is
// downloaded.
//
// Every screen title, question, option and media URL comes from the
// section content object passed in, so this component carries no Mock Test
// 1 text of its own. The answer keys are not among them: the route strips
// all six before the content reaches this component, and this component
// never sees a correct option until the learner has finished Part 6 and
// the server sends the review rows back.

// Marks a whole section attempt on the server and returns the per part
// review rows and the practice score. Resolves to null when the caller has
// no session.
//
// Passed in rather than imported, so this component depends on the shape
// of the result and not on one particular route's action.
export type ListeningSectionMarkAction = (
  answers: ListeningSectionAnswerMap,
) => Promise<ListeningSectionMarkedResult | null>;

// Where the marking request has got to.
//
// "failed" covers both a rejected request and a null reply, which is a
// lost session. Both leave the learner in the same place with the same
// thing to do, so they read as one state and the copy names both causes.
type MarkingState =
  | { status: "idle" }
  | { status: "working" }
  | { status: "ready"; marked: ListeningSectionMarkedResult }
  | { status: "failed" };

export type ListeningSectionPrototypeProps = {
  content: ListeningSectionContent;
  markAnswers: ListeningSectionMarkAction;
  copy?: ListeningSectionCopy;
};

export function ListeningSectionPrototype({
  content,
  markAnswers,
  copy = listeningSectionCopy,
}: ListeningSectionPrototypeProps) {
  const screens = useMemo(() => buildListeningSectionFlow(content), [content]);
  const totalQuestions = useMemo(
    () => countListeningSectionQuestions(content),
    [content],
  );

  const [screenIndex, setScreenIndex] = useState(0);
  const [answers, setAnswers] = useState<ListeningSectionAnswerMap>({});
  const [marking, setMarking] = useState<MarkingState>({ status: "idle" });

  // The one time up message for the whole run (TIMER-01). It lives here
  // rather than on a screen because a screen is unmounted by the very Next
  // press the message is telling the learner they are free to make.
  const { toastKey, showTimeUp, dismissTimeUp } = useMockTestTimeUpToast();

  // Which marking request is the current one. A learner can leave the
  // review, change an answer and come back faster than a reply arrives,
  // and the older reply would then overwrite the newer one with a score
  // for answers they have already changed. Every request takes a number
  // and a reply is dropped unless its number is still the latest.
  //
  // A ref rather than state on purpose: nothing renders from it, and
  // bumping it must take effect immediately rather than at the next
  // render.
  const markingRequestId = useRef(0);

  const answeredCount = useMemo(
    () => countAnsweredListeningSectionQuestions(content, answers),
    [content, answers],
  );

  const screen = screens[screenIndex];
  const totalScreens = screens.length;
  const totalParts = content.parts.length;

  const requestMarking = async (submitted: ListeningSectionAnswerMap) => {
    markingRequestId.current += 1;
    const requestId = markingRequestId.current;

    setMarking({ status: "working" });

    try {
      const marked = await markAnswers(submitted);

      if (markingRequestId.current !== requestId) {
        return;
      }

      setMarking(marked ? { status: "ready", marked } : { status: "failed" });
    } catch {
      if (markingRequestId.current !== requestId) {
        return;
      }

      setMarking({ status: "failed" });
    }
  };

  // Marking is kicked off from the handler that walks onto the review
  // screen, not from an effect. Answers cannot change while the review is
  // showing without going back into Part 6 first, so entering the review
  // is exactly the moment the result is needed and exactly the moment it
  // is known to be current.
  const goNext = () => {
    const nextIndex = Math.min(screenIndex + 1, totalScreens - 1);

    if (screens[nextIndex]?.kind === "section-review") {
      void requestMarking(answers);
    }

    // A time up message belongs to the screen it was raised on, so moving
    // takes it away rather than carrying it onto the next one (TIMER-01).
    dismissTimeUp();
    setScreenIndex(nextIndex);
  };

  const goBack = () => {
    dismissTimeUp();
    setScreenIndex((current) => Math.max(current - 1, 0));
  };

  const selectAnswer = (questionId: string, optionId: string) => {
    setAnswers((current) =>
      setListeningSectionAnswer(current, questionId, optionId),
    );
  };

  // Start the section again from the first screen with an empty answer map
  // and no result. All 38 answers go, because they are all in that one
  // map. Nothing was saved, so there is nothing else to clear. The request
  // id moves on so a reply still in flight cannot land on the fresh run.
  const restart = () => {
    markingRequestId.current += 1;
    dismissTimeUp();
    setScreenIndex(0);
    setAnswers({});
    setMarking({ status: "idle" });
  };

  // Shared chrome props.
  //
  // Back is hidden for the whole of the test itself (EXAM-15F). The
  // official rule is that a learner cannot return to a previous part, and
  // the same holds within a part: a question that has been left is left.
  // So rather than clamping Back to the current part and then having to
  // explain why it sometimes does nothing, the run is forward only from
  // the section instructions to the last question screen of Part 6.
  //
  // Forward only is unchanged by TIMER-01. What changed is who moves the
  // run forward: a closing window used to do it, and now only Next does.
  //
  // The two screens that keep it are the practice score and the end of
  // section screen, and neither is answerable. Back on the score returns to
  // the answer review, which is the same move the score screen's own
  // "Review answers" control makes, and Back on the end screen returns to
  // the score. The answer review itself does not get Back, because behind
  // it is Part 6 with the correct answers now on display.
  //
  // The marking screen therefore has no Back either. Its recovery is the
  // retry control it already carries, which re-sends the answers this
  // component is still holding.
  const showBack =
    screen?.kind === "section-score" || screen?.kind === "section-end";

  // Stands in for the review and the score while the server is marking,
  // and carries the retry when it could not. The retry is the whole
  // recovery now (EXAM-15F): the run is forward only, so a failed check
  // cannot be answered by walking back into Part 6. It does not need to be.
  // This component is still holding all 38 answers, so pressing retry
  // sends exactly what the first attempt sent.
  const renderMarkingScreen = (metaText: string) => {
    const failed = marking.status === "failed";

    return (
      <ExamShell
        title={content.title}
        metaText={metaText}
        showNext={false}
        onBack={goBack}
        showBack={showBack}
      >
        <div className={examScreenBody.stack}>
          <ExamInstructionRow
            heading={
              failed ? copy.markingFailedHeading : copy.markingHeading
            }
            text={failed ? copy.markingFailedText : copy.markingText}
          />

          {failed ? (
            <div className={examScreenBody.actions}>
              <ExamButton
                variant="primary"
                size="md"
                onClick={() => void requestMarking(answers)}
              >
                {copy.markingRetryLabel}
              </ExamButton>
            </div>
          ) : null}
        </div>
      </ExamShell>
    );
  };

  // One screen belonging to a part.
  //
  // The dispatch is on the screen kind first and the part kind second,
  // because the section flow union is flat: two parts built from different
  // content shapes can both contribute a "media" screen, and only the part
  // says which player belongs on it. Both discriminants are checked, so a
  // combination that cannot occur returns null instead of rendering a
  // screen against the wrong content.
  const renderPartScreen = (screenRef: ListeningSectionPartScreenRef) => {
    const part = content.parts[screenRef.partIndex];

    if (!part) {
      return null;
    }

    const partScreen = screenRef.screen;
    const questionCount = countListeningSectionPartQuestions(part);
    const metaText = formatListeningSectionPartMeta(
      part.partNumber,
      totalParts,
      screenIndex + 1,
      totalScreens,
    );

    // The three navigation props are written out on every screen below
    // rather than collected into one object and spread. Gathering handlers
    // into a plain object during render is what react-hooks/refs flags,
    // because goNext reads the marking request ref, and the part
    // prototypes pass the same three props the same way.

    if (partScreen.kind === "part-intro") {
      return (
        <ListeningPartIntroScreen
          content={part.content}
          questionCount={questionCount}
          // Only a part built from conversation sections gets the Sections
          // row. The other three are one clip or one video, so the row is
          // left out rather than reading "Sections 1".
          sectionCount={
            part.kind === "sections" ? part.content.sections.length : undefined
          }
          formatLabel={part.formatLabel}
          metaText={metaText}
          onNext={goNext}
          onBack={goBack}
          showBack={showBack}
        />
      );
    }

    if (partScreen.kind === "scenario") {
      return (
        <ListeningScenarioScreen
          title={part.content.title}
          scenario={part.content.scenario}
          metaText={metaText}
          onNext={goNext}
          onBack={goBack}
          showBack={showBack}
        />
      );
    }

    if (partScreen.kind === "section-break") {
      if (part.kind !== "sections") {
        return null;
      }

      return (
        <ListeningSectionBreakScreen
          title={part.content.title}
          message={formatListeningSectionBreak(partScreen.sectionIndex)}
          sectionLabel={formatListeningSectionLabel(
            partScreen.sectionIndex,
            part.content.sections.length,
          )}
          metaText={metaText}
          onNext={goNext}
          onBack={goBack}
          showBack={showBack}
        />
      );
    }

    if (partScreen.kind === "conversation") {
      if (part.kind !== "sections") {
        return null;
      }

      const conversationSection =
        part.content.sections[partScreen.sectionIndex];

      if (!conversationSection) {
        return null;
      }

      return (
        <ListeningAudioScreen
          title={part.content.title}
          audioSrc={conversationSection.conversationAudioUrl}
          audioTitle={`${listeningCopy.conversationPlayerTitle} ${
            partScreen.sectionIndex + 1
          }`}
          durationLabel={conversationSection.durationLabel}
          sectionLabel={formatListeningSectionLabel(
            partScreen.sectionIndex,
            part.content.sections.length,
          )}
          autoPlayMedia
          metaText={metaText}
          onNext={goNext}
          onBack={goBack}
          showBack={showBack}
        />
      );
    }

    if (partScreen.kind === "question") {
      if (part.kind !== "sections") {
        return null;
      }

      const question = getListeningQuestion(part.content, partScreen);

      if (!question) {
        return null;
      }

      return (
        <ListeningQuestionScreen
          title={part.content.title}
          question={question}
          // Resolved from the part content, not decided here, so a
          // question behaves the same in this run as it does in its own
          // part route. Every Parts 1 to 3 question has its own clip, so
          // this resolves to that clip on every question screen.
          audio={resolveListeningQuestionAudio(part.content, partScreen)}
          questionNumber={partScreen.questionNumber}
          questionCount={questionCount}
          selectedOptionId={answers[question.id]}
          onSelectOption={(optionId) => selectAnswer(question.id, optionId)}
          // A blank is a legal answer in the full run and marks as
          // incorrect, so Next does not wait for one (EXAM-15F).
          requireAnswer={false}
          // The question is spoken in this part, so the clip is the
          // question. It starts with the screen (EXAM-15F).
          autoPlayAudio
          // The flow screen id, so the answering window restarts when the
          // learner moves to another question and not when they change
          // their mind about an option (EXAM-15D).
          timerScreenKey={partScreen.id}
          timerSeconds={LISTENING_QUESTION_TIMER.seconds}
          timerWarningAtSeconds={LISTENING_QUESTION_TIMER.warningAtSeconds}
          timerUrgentAtSeconds={LISTENING_QUESTION_TIMER.urgentAtSeconds}
          // 30 seconds up turns the reading red and raises the time up
          // message. The question stays on screen with its answer, and
          // Next stays the learner's to press (TIMER-01).
          onTimeExpire={showTimeUp}
          metaText={metaText}
          onNext={goNext}
          onBack={goBack}
          showBack={showBack}
        />
      );
    }

    if (partScreen.kind === "media") {
      if (part.kind === "dropdown") {
        return (
          <ListeningAudioScreen
            title={part.content.title}
            audioSrc={part.content.media.url}
            audioTitle={part.content.media.title}
            durationLabel={part.content.media.durationLabel}
            instructionText={
              part.content.mediaInstruction ?? listeningCopy.newsItemInstruction
            }
            autoPlayMedia
            metaText={metaText}
          onNext={goNext}
          onBack={goBack}
          showBack={showBack}
          />
        );
      }

      if (part.kind === "viewpoints") {
        return (
          <ListeningViewpointsScreen
            title={part.content.title}
            media={part.content.media}
            instructionText={part.content.mediaInstruction}
            autoPlayMedia
            metaText={metaText}
          onNext={goNext}
          onBack={goBack}
          showBack={showBack}
          />
        );
      }

      return null;
    }

    if (partScreen.kind === "video") {
      if (part.kind !== "video") {
        return null;
      }

      return (
        <ListeningVideoScreen
          title={part.content.title}
          videoSrc={part.content.media.url}
          videoTitle={part.content.media.title}
          durationLabel={part.content.media.durationLabel}
          posterSrc={part.content.media.posterUrl}
          instructionText={
            part.content.mediaInstruction ?? listeningCopy.discussionInstruction
          }
          autoPlayMedia
          metaText={metaText}
          onNext={goNext}
          onBack={goBack}
          showBack={showBack}
        />
      );
    }

    // Every question in the part on one screen, for Parts 4, 5 and 6.
    //
    // One window for the whole screen, sized for the whole question set
    // rather than for one question (EXAM-15F). The three durations and the
    // working behind each of them are in listening-timing.ts.
    const allAnswered = areAllListeningSectionPartQuestionsAnswered(
      part,
      answers,
    );
    const screenTimer = getListeningPartScreenTimer(part.partNumber);

    if (part.kind === "dropdown") {
      return (
        <ListeningDropdownQuestionScreen
          title={part.content.title}
          questions={part.content.questions}
          answers={answers}
          onSelectOption={selectAnswer}
          allAnswered={allAnswered}
          // A blank is a legal answer in the full run and marks as
          // incorrect, so Next does not wait for the form to be finished
          // (EXAM-15F).
          requireAllAnswered={false}
          instructionText={part.content.questionInstruction}
          // The flow screen id, so the answering window belongs to this
          // screen and is not restarted by the selections made on it
          // (EXAM-15D).
          timerScreenKey={partScreen.id}
          timerSeconds={screenTimer.seconds}
          timerWarningAtSeconds={screenTimer.warningAtSeconds}
          timerUrgentAtSeconds={screenTimer.urgentAtSeconds}
          // The screen window closing turns the reading red and raises
          // the time up message. Every selection on the screen is kept and
          // the run waits for Next (TIMER-01).
          onTimeExpire={showTimeUp}
          metaText={metaText}
          onNext={goNext}
          onBack={goBack}
          showBack={showBack}
        />
      );
    }

    if (part.kind === "video") {
      return (
        <ListeningVideoQuestionScreen
          title={part.content.title}
          questions={part.content.questions}
          answers={answers}
          onSelectOption={selectAnswer}
          allAnswered={allAnswered}
          // A blank is a legal answer in the full run and marks as
          // incorrect, so Next does not wait for the form to be finished
          // (EXAM-15F).
          requireAllAnswered={false}
          instructionText={part.content.questionInstruction}
          // The flow screen id, so the answering window belongs to this
          // screen and is not restarted by the selections made on it
          // (EXAM-15D).
          timerScreenKey={partScreen.id}
          timerSeconds={screenTimer.seconds}
          timerWarningAtSeconds={screenTimer.warningAtSeconds}
          timerUrgentAtSeconds={screenTimer.urgentAtSeconds}
          // The screen window closing turns the reading red and raises
          // the time up message. Every selection on the screen is kept and
          // the run waits for Next (TIMER-01).
          onTimeExpire={showTimeUp}
          metaText={metaText}
          onNext={goNext}
          onBack={goBack}
          showBack={showBack}
        />
      );
    }

    if (part.kind === "viewpoints") {
      return (
        <ListeningViewpointsQuestionScreen
          title={part.content.title}
          questions={part.content.questions}
          answers={answers}
          onSelectOption={selectAnswer}
          allAnswered={allAnswered}
          // A blank is a legal answer in the full run and marks as
          // incorrect, so Next does not wait for the form to be finished
          // (EXAM-15F).
          requireAllAnswered={false}
          instructionText={part.content.questionInstruction}
          // The flow screen id, so the answering window belongs to this
          // screen and is not restarted by the selections made on it
          // (EXAM-15D).
          timerScreenKey={partScreen.id}
          timerSeconds={screenTimer.seconds}
          timerWarningAtSeconds={screenTimer.warningAtSeconds}
          timerUrgentAtSeconds={screenTimer.urgentAtSeconds}
          // The screen window closing turns the reading red and raises
          // the time up message. Every selection on the screen is kept and
          // the run waits for Next (TIMER-01).
          onTimeExpire={showTimeUp}
          metaText={metaText}
          onNext={goNext}
          onBack={goBack}
          showBack={showBack}
        />
      );
    }

    return null;
  };

  if (!screen) {
    return null;
  }

  // The screen at the current position.
  //
  // Wrapped in a function so the whole flow can be given one key below.
  // Everything after the part branch belongs to the section rather than to
  // a part, so it carries the section title and the section meta line.
  const renderCurrentScreen = () => {
    if (screen.kind === "part") {
      return renderPartScreen(screen);
    }

    const metaText = formatListeningSectionMeta(screenIndex + 1, totalScreens);

    const sectionProgress = {
      totalParts,
      totalQuestions,
      answeredCount,
      copy,
    };

    if (screen.kind === "section-instructions") {
      return (
        <ListeningSectionInstructionScreen
          content={content.instructionScreen}
          metaText={metaText}
          onNext={goNext}
          onBack={goBack}
          showBack={showBack}
        />
      );
    }

    if (screen.kind === "section-video") {
      return (
        <ListeningSectionVideoScreen
          content={content.videoScreen}
          {...sectionProgress}
          metaText={metaText}
          onNext={goNext}
          // Skip goes exactly where Next goes. Nothing here is gated on the
          // clip, so the control is a shortcut past the player rather than a
          // second path through the flow.
          onSkip={goNext}
          onBack={goBack}
          showBack={showBack}
        />
      );
    }

    if (screen.kind === "part-transition") {
      const nextPart = content.parts[screen.partIndex];
      const completedPart = content.parts[screen.partIndex - 1];

      if (!nextPart || !completedPart) {
        return null;
      }

      return (
        <ListeningSectionPartTransitionScreen
          title={content.title}
          completedPartLabel={completedPart.partLabel}
          nextPartLabel={nextPart.partLabel}
          nextPartNumber={nextPart.partNumber}
          {...sectionProgress}
          metaText={metaText}
          onNext={goNext}
          onBack={goBack}
          showBack={showBack}
        />
      );
    }

    if (screen.kind === "section-review") {
      if (marking.status !== "ready") {
        return renderMarkingScreen(metaText);
      }

      return (
        <ListeningSectionReviewScreen
          title={content.title}
          parts={marking.marked.parts}
          {...sectionProgress}
          metaText={metaText}
          onNext={goNext}
          // showBack is false here (EXAM-15F). Behind the review is the
          // last question screen of Part 6, and the review has just put the
          // correct answers on the screen, so returning to it is the one
          // move the run must not offer. The handler stays wired so the
          // screen keeps one navigation contract with every other screen.
          onBack={goBack}
          showBack={showBack}
        />
      );
    }

    if (screen.kind === "section-score") {
      // Reachable by pressing Back from the end screen, so the result can
      // be missing here even though the review had it, for example after a
      // failed retry. The same screen covers it.
      if (marking.status !== "ready") {
        return renderMarkingScreen(metaText);
      }

      return (
        <ListeningSectionScoreScreen
          title={content.title}
          summary={marking.marked.summary}
          parts={marking.marked.parts}
          copy={copy}
          onEndSection={goNext}
          onReviewAnswers={goBack}
          metaText={metaText}
          onBack={goBack}
          showBack={showBack}
        />
      );
    }

    // End of Listening section screen. The last screen in the flow, so
    // there is no Next.
    return (
      <ListeningSectionEndScreen
        title={content.title}
        onRestart={restart}
        copy={copy}
        metaText={metaText}
        onBack={goBack}
        showBack={showBack}
      />
    );
  };

  // One keyed fragment around the whole flow, and the reason it is here is
  // the exam canvas (EXAM-15C).
  //
  // Inside the locked viewport the canvas is the only region that scrolls,
  // and it is the same DOM element on every screen, so its scroll offset
  // used to carry over: pressing Next at the bottom of the Part 5 question
  // list landed on the next screen already scrolled halfway down it. Keying
  // on the screen id remounts the frame when the screen changes, so every
  // screen opens at the top of the canvas.
  //
  // The second thing it buys is media. A question screen that follows
  // another question screen used to reuse the same audio element with a new
  // src, which leaves a browser free to keep playing the old clip. A
  // remount tears the player down with the screen it belonged to.
  //
  // A fragment rather than a wrapper element, because the exam frame fills
  // its parent by height and an extra div in the chain would have to be
  // taught the same flex rules.
  // The toast sits outside the keyed fragment on purpose (TIMER-01).
  // Inside it, a change of screen would remount the message and start its
  // few seconds again on a screen it does not belong to.
  return (
    <Fragment>
      <Fragment key={screen.id}>{renderCurrentScreen()}</Fragment>

      <MockTestTimeUpToast toastKey={toastKey} />
    </Fragment>
  );
}
