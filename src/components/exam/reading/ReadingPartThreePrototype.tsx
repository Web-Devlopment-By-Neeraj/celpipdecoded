"use client";

import { useMemo, useRef, useState } from "react";
import { ExamButton } from "../ExamButton";
import { ExamInstructionRow } from "../ExamInstructionRow";
import { ExamShell } from "../ExamShell";
import { ReadingPartCompleteScreen } from "./ReadingPartCompleteScreen";
import { ReadingPartThreeInformationScreen } from "./ReadingPartThreeInformationScreen";
import { ReadingPartThreeIntroScreen } from "./ReadingPartThreeIntroScreen";
import { ReadingPartThreeReviewScreen } from "./ReadingPartThreeReviewScreen";
import { ReadingPartThreeScoreScreen } from "./ReadingPartThreeScoreScreen";
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

// Reading Part 3 prototype (EXAM-20, marking and closing screens added by
// EXAM-21).
//
// The third Reading part built, and the first one answered by naming a
// paragraph rather than by completing a sentence. It follows the shape
// ReadingPartOnePrototype set and ReadingPartTwoPrototype followed, and
// as of this ticket it goes as far: the part now closes on a practice
// score with an answer review behind it.
//
// It owns three pieces of state:
//
// - which screen is showing, an index into the flow built by
//   buildReadingFlow
// - the answers, as { questionId: optionId }
// - the marking request, idle, working, ready or failed
//
// All three live in local component state. Nothing is written to a
// database, to localStorage or to a cookie, and a page reload starts the
// part again. That is deliberate for a prototype and is recorded in
// docs/product/reading-part-3-review-score.md.
//
// The answers never leave this component except as the argument to the
// marking action, and the answer key never arrives in it. The route
// strips the key on the server before the content crosses the boundary,
// so this component holds content with no correct answers in it and could
// not mark an attempt if it tried. markAnswers does the comparison on the
// server, where the key lives, and returns finished rows.
//
// The flow is four screens: the part intro, the information split holding
// all 9 statements, the practice score, and the answer review opened from
// it. That is buildReadingFlow's default ending, together with the
// information working screen asked for through
// { taskScreen: "information" }. EXAM-20 asked for the completion ending
// by name, because the score and the review did not exist then; dropping
// that option is the whole change to the flow. The completion screen
// branch is kept below for the same reason the Part 1 and Part 2
// prototypes keep theirs: the flow builder can still be asked for that
// ending, and a component that renders a flow should render every screen
// the flow can contain.
//
// Marking is requested once, on the move onto the score screen, and the
// result is held so that walking back to the statements and forward again
// re-marks rather than showing a stale score. A request id guards against
// an older reply landing after a newer one, which is the pattern the Part
// 1 and Part 2 prototypes use. A failed request leaves the answers
// untouched and offers a retry, because the answers are the only copy
// there is.
//
// Back is enabled throughout, which the official-style flow would not
// allow, so the sequence can be walked through repeatedly during review.
// Answers survive going back and forward because they are keyed by
// question id rather than by screen position, and because this component
// stays mounted across the whole part. Back from the score screen lands
// on the split screen with all 9 selections still in place.
//
// Nothing gates Next on the split screen. A learner can finish the part
// with any number of statements left blank, which is the EXAM-17 rule
// this part inherits: a blank travels as a missing key in the answer map,
// the server marks it as incorrect, and the review row for it says "No
// answer selected" while still showing the correct paragraph.
//
// The timer does not gate Next either and does not move it: the countdown
// runs, reaches "Time is up", and stops, with every answer still
// selected. Nothing auto-submits, which is what the ticket asks for at
// this stage.
//
// Every screen title, statement, option and instruction line comes from
// the content object passed in, so this component carries no Mock Test 1
// text of its own. The answer key is not among them, and the correct
// paragraphs only appear once the server has sent back review rows for a
// part the learner has finished.
//
// House style: normal hyphens only, no long hyphens or em dashes.

// The server action in actions.ts beside the route. Typed as a plain
// async function so this component knows nothing about how the marking is
// done, only that answers go in and a marked part or null comes back.
// null means the caller had no session.
export type ReadingPartThreeMarkAction = (
  answers: ReadingAnswerMap,
) => Promise<ReadingMarkedPart | null>;

type MarkingState =
  | { status: "idle" }
  | { status: "working" }
  | { status: "ready"; marked: ReadingMarkedPart }
  | { status: "failed" };

export type ReadingPartThreePrototypeProps = {
  content: ReadingPartContent;
  markAnswers: ReadingPartThreeMarkAction;
  // Where Back to dashboard goes from the score and completion screens.
  dashboardHref?: string;
};

export function ReadingPartThreePrototype({
  content,
  markAnswers,
  dashboardHref,
}: ReadingPartThreePrototypeProps) {
  // The information working screen, and the default ending: intro,
  // questions, score, review.
  const screens = useMemo(
    () => buildReadingFlow(content, { taskScreen: "information" }),
    [content],
  );
  const questionCount = useMemo(
    () => countReadingQuestions(content),
    [content],
  );

  const [screenIndex, setScreenIndex] = useState(0);
  const [answers, setAnswers] = useState<ReadingAnswerMap>({});
  const [marking, setMarking] = useState<MarkingState>({ status: "idle" });

  // Bumped for every marking request and for a restart, so a reply that
  // arrives after the learner has moved on is dropped rather than
  // overwriting a newer result.
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

  // Moving onto the score screen is what submits the part. Doing it here
  // rather than in an effect keeps the request tied to the click that
  // caused it, and re-marks if the learner goes back, changes an answer
  // and finishes again.
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

  // Stands in for the score and the review while the request is in
  // flight, and reports a failure with a retry when it is not. Back stays
  // available in both states, so a learner is never stuck on it, and the
  // answers are still held either way.
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
            text={
              failed ? readingCopy.markingFailedText : readingCopy.markingText
            }
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
      <ReadingPartThreeIntroScreen
        content={content}
        questionCount={questionCount}
        metaText={metaText}
        onNext={goNext}
        onBack={goBack}
        showBack={showBack}
      />
    );
  }

  if (screen.kind === "information") {
    return (
      <ReadingPartThreeInformationScreen
        content={content}
        answers={answers}
        onSelectOption={selectAnswer}
        // The flow screen id, so the part window belongs to this screen
        // and is not restarted by any of the 9 selections made on it.
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
      <ReadingPartThreeScoreScreen
        title={content.title}
        summary={marking.marked.summary}
        // Next is hidden on this screen, so Review answers is what moves
        // the flow forward onto the review.
        onReviewAnswers={goNext}
        onRestart={restart}
        dashboardHref={dashboardHref}
        metaText={metaText}
        onBack={goBack}
        showBack={showBack}
      />
    );
  }

  if (screen.kind === "answer-review") {
    if (marking.status !== "ready") {
      return renderMarkingScreen();
    }

    return (
      <ReadingPartThreeReviewScreen
        title={content.title}
        rows={marking.marked.rows}
        summary={marking.marked.summary}
        metaText={metaText}
        onBack={goBack}
        showBack={showBack}
      />
    );
  }

  // Completion screen. Only reachable through buildReadingFlow's other
  // ending, which this route does not ask for, and it is the last screen
  // in that flow, so there is no Next.
  return (
    <ReadingPartCompleteScreen
      title={content.title}
      heading={readingCopy.partThreeCompleteHeading}
      message={formatReadingCompletionMessage(
        countAnsweredReadingQuestions(content, answers),
        questionCount,
      )}
      restartLabel={readingCopy.partThreeRestartLabel}
      dashboardHref={dashboardHref}
      onRestart={restart}
      metaText={metaText}
      onBack={goBack}
      showBack={showBack}
    />
  );
}
