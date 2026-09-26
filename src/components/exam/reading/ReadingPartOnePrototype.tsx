"use client";

import { useMemo, useRef, useState } from "react";
import { ExamButton } from "../ExamButton";
import { ExamInstructionRow } from "../ExamInstructionRow";
import { ExamShell } from "../ExamShell";
import { ReadingCorrespondenceScreen } from "./ReadingCorrespondenceScreen";
import { ReadingPartCompleteScreen } from "./ReadingPartCompleteScreen";
import { ReadingPartIntroScreen } from "./ReadingPartIntroScreen";
import { ReadingPartOneReviewScreen } from "./ReadingPartOneReviewScreen";
import { ReadingPartOneScoreScreen } from "./ReadingPartOneScoreScreen";
import { examScreenBody } from "@/features/exam-engine/exam-theme";
import {
  formatReadingCompletionMessage,
  formatReadingScreenPosition,
  readingCopy,
} from "@/features/exam-engine/reading-copy";
import {
  buildReadingFlow,
  countAnsweredReadingQuestions,
  countReadingQuestions,
  setReadingAnswer,
} from "@/features/exam-engine/reading-flow";
import type {
  ReadingAnswerMap,
  ReadingMarkedPart,
  ReadingPartContent,
} from "@/features/exam-engine/reading-types";

// Reading Part 1 prototype (EXAM-16, marking and closing screens added by
// EXAM-17).
//
// The first Reading part built, and the first screen in the engine that
// is a split screen rather than a sequence of media and question screens.
// It follows the Listening prototypes in how it is put together and not
// in what it assumes: there is no clip to play, no scenario screen, no
// section to break between, and the whole part is answered on one screen.
//
// It owns three pieces of state:
//
// - which screen is showing, an index into the flow built by
//   buildReadingFlow
// - the answers, as { questionId: optionId }
// - the marking result, once the server has returned one
//
// All three live in local component state. Nothing is written to a
// database, to localStorage or to a cookie, and a page reload starts the
// part again. That is deliberate for a prototype and is recorded in
// docs/product/reading-part-1-review-score.md.
//
// The marking state machine is the one the Listening prototypes use, and
// it is here for the same reason. Reading Part 1 has a complete answer key
// and the route strips it before the content reaches this component, so
// this component cannot mark anything itself and must not be able to: it
// sends the answers to markReadingPartOne, which does the comparison
// where the key lives, and receives finished review rows back.
//
// The flow is four screens: the part intro, the split screen, the
// practice score, and the answer review. It was three in EXAM-16, which
// closed on a completion screen. The only change behind that was dropping
// the EXAM-16 ending from the buildReadingFlow call, which now defaults
// to "score". The completion screen is still rendered for a part that
// asks for { ending: "complete" }, so the branch below is not dead.
//
// The score comes before the review, which is the reverse of the
// Listening order. A Reading part is answered on one screen, so a learner
// pressing Next has just worked through all 11 questions and wants the
// result; the review is the thing they open from it, and the score screen
// makes that the primary action.
//
// Back is enabled throughout, which the official-style flow would not
// allow, so the sequence can be walked through repeatedly during review.
// Answers survive going back and forward because they are keyed by
// question id rather than by screen position, and because this component
// stays mounted across the whole part. Back from the score lands on the
// split screen with all 11 selections still in place.
//
// Nothing gates Next on the split screen. A learner can finish the part
// with any number of questions left blank, which is what the EXAM-17 fix
// changed: Next used to be held disabled until all 11 had an answer, and
// a learner stuck on one question could not reach their score at all.
// A blank travels as a missing key in the answer map, is counted as a
// blank by the server, is counted as incorrect in the score, and shows
// "No answer selected" against the correct answer in the review.
//
// The timer does not gate Next either and does not move it: the countdown
// runs, reaches "Time is up", and stops, with every answer still
// selected. Nothing auto-submits, which is what the ticket asks for at
// this stage.
//
// Every screen title, passage paragraph, question, option and instruction
// line comes from the content object passed in, so this component carries
// no Mock Test 1 text of its own. The answer key is not among them: the
// route strips it before the content reaches this component, and this
// component never sees a correct option until the learner has finished
// the part and the server sends the review rows back.

// Marks an attempt on the server and returns the review rows and the
// practice score. Resolves to null when the caller has no session.
//
// Passed in rather than imported, so this component depends on the shape
// of the result and not on one particular route's action.
export type ReadingPartOneMarkAction = (
  answers: ReadingAnswerMap,
) => Promise<ReadingMarkedPart | null>;

// Where the marking request has got to.
//
// "failed" covers both a rejected request and a null reply, which is a
// lost session. Both leave the learner in the same place with the same
// thing to do, so they read as one state and the copy names both causes.
type MarkingState =
  | { status: "idle" }
  | { status: "working" }
  | { status: "ready"; marked: ReadingMarkedPart }
  | { status: "failed" };

export type ReadingPartOnePrototypeProps = {
  content: ReadingPartContent;
  markAnswers: ReadingPartOneMarkAction;
  // Where Back to dashboard goes from the closing screens.
  dashboardHref?: string;
};

export function ReadingPartOnePrototype({
  content,
  markAnswers,
  dashboardHref,
}: ReadingPartOnePrototypeProps) {
  // The default "score" ending now, rather than the EXAM-16 single
  // completion screen, which is what turns the last screen into the two
  // closing screens.
  const screens = useMemo(() => buildReadingFlow(content), [content]);
  const questionCount = useMemo(
    () => countReadingQuestions(content),
    [content],
  );

  const [screenIndex, setScreenIndex] = useState(0);
  const [answers, setAnswers] = useState<ReadingAnswerMap>({});
  const [marking, setMarking] = useState<MarkingState>({ status: "idle" });

  // Which marking request is the current one. A learner can leave the
  // score screen, change an answer and come back faster than a reply
  // arrives, and the older reply would then overwrite the newer one with
  // a score for answers they have already changed. Every request takes a
  // number and a reply is dropped unless its number is still the latest.
  //
  // A ref rather than state on purpose: nothing renders from it, and
  // bumping it must take effect immediately rather than at the next
  // render.
  const markingRequestId = useRef(0);

  const screen = screens[screenIndex];
  const totalScreens = screens.length;

  const requestMarking = async (submitted: ReadingAnswerMap) => {
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

  // Marking is kicked off from the handler that walks onto the score
  // screen, not from an effect. Answers cannot change while the score is
  // showing without going back to the split screen first, so arriving at
  // the score is exactly the moment the result is needed and exactly the
  // moment it is known to be current.
  const goNext = () => {
    const nextIndex = Math.min(screenIndex + 1, totalScreens - 1);

    if (screens[nextIndex]?.kind === "score") {
      void requestMarking(answers);
    }

    setScreenIndex(nextIndex);
  };

  const goBack = () => {
    setScreenIndex((current) => Math.max(current - 1, 0));
  };

  const selectAnswer = (questionId: string, optionId: string) => {
    setAnswers((current) => setReadingAnswer(current, questionId, optionId));
  };

  // Start the part again from the first screen with an empty answer map
  // and no result. Nothing was saved, so there is nothing else to clear.
  // The request id moves on so a reply still in flight cannot land on the
  // fresh run.
  const restart = () => {
    markingRequestId.current += 1;
    setScreenIndex(0);
    setAnswers({});
    setMarking({ status: "idle" });
  };

  // Shared chrome props. Back is hidden on the first screen only, because
  // there is nothing behind it inside the part.
  const metaText = formatReadingScreenPosition(screenIndex + 1, totalScreens);
  const showBack = screenIndex > 0;

  // Stands in for the score and the review while the server is marking,
  // and carries the retry when it could not. Back still works, so a
  // failed check is never a dead end: the learner can walk back to the
  // split screen with every answer still selected.
  const renderMarkingScreen = () => {
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
              failed
                ? readingCopy.markingFailedHeading
                : readingCopy.markingHeading
            }
            text={failed ? readingCopy.markingFailedText : readingCopy.markingText}
          />

          {failed ? (
            <div className={examScreenBody.actions}>
              <ExamButton
                variant="primary"
                size="md"
                onClick={() => void requestMarking(answers)}
              >
                {readingCopy.markingRetryLabel}
              </ExamButton>
            </div>
          ) : null}
        </div>
      </ExamShell>
    );
  };

  if (!screen) {
    return null;
  }

  if (screen.kind === "part-intro") {
    return (
      <ReadingPartIntroScreen
        content={content}
        questionCount={questionCount}
        metaText={metaText}
        onNext={goNext}
        onBack={goBack}
        showBack={showBack}
      />
    );
  }

  if (screen.kind === "correspondence") {
    return (
      <ReadingCorrespondenceScreen
        content={content}
        answers={answers}
        onSelectOption={selectAnswer}
        // The flow screen id, so the part window belongs to this screen
        // and is not restarted by any of the 11 selections made on it.
        timerScreenKey={screen.id}
        // No onTimeExpire. Nothing auto-submits and nothing advances in
        // this prototype, which is what the ticket asks for: the reading
        // reaches "Time is up", the answers stay put, and the learner
        // finishes the part by hand.
        metaText={metaText}
        onNext={goNext}
        onBack={goBack}
        showBack={showBack}
      />
    );
  }

  if (screen.kind === "score") {
    if (marking.status !== "ready") {
      return renderMarkingScreen();
    }

    return (
      <ReadingPartOneScoreScreen
        title={content.title}
        summary={marking.marked.summary}
        onReviewAnswers={goNext}
        onRestart={restart}
        dashboardHref={dashboardHref}
        metaText={metaText}
        // Back lands on the split screen with every answer still
        // selected, which is the prototype affordance the ticket asks
        // for.
        onBack={goBack}
        showBack={showBack}
      />
    );
  }

  if (screen.kind === "answer-review") {
    // Reachable by pressing Next on the score screen, so the result is
    // normally in hand here. It can still be missing after a restart that
    // left the index behind, and the same screen covers it.
    if (marking.status !== "ready") {
      return renderMarkingScreen();
    }

    return (
      <ReadingPartOneReviewScreen
        title={content.title}
        rows={marking.marked.rows}
        summary={marking.marked.summary}
        metaText={metaText}
        onBack={goBack}
        showBack={showBack}
      />
    );
  }

  // Completion screen. Only reached by a part built with the EXAM-16
  // ending, which this route does not ask for, and it is the last screen
  // in that flow so there is no Next.
  return (
    <ReadingPartCompleteScreen
      title={content.title}
      heading={readingCopy.partCompleteHeading}
      message={formatReadingCompletionMessage(
        countAnsweredReadingQuestions(content, answers),
        questionCount,
      )}
      dashboardHref={dashboardHref}
      onRestart={restart}
      metaText={metaText}
      onBack={goBack}
      showBack={showBack}
    />
  );
}
