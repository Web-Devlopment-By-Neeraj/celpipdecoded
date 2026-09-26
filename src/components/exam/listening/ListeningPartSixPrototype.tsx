"use client";

import { useMemo, useRef, useState } from "react";
import { ExamButton } from "../ExamButton";
import { ExamInstructionRow } from "../ExamInstructionRow";
import { ExamShell } from "../ExamShell";
import { ListeningAnswerReviewScreen } from "./ListeningAnswerReviewScreen";
import { ListeningPartEndScreen } from "./ListeningPartEndScreen";
import { ListeningPartIntroScreen } from "./ListeningPartIntroScreen";
import { ListeningScenarioScreen } from "./ListeningScenarioScreen";
import { ListeningScoreScreen } from "./ListeningScoreScreen";
import { ListeningViewpointsQuestionScreen } from "./ListeningViewpointsQuestionScreen";
import { ListeningViewpointsScreen } from "./ListeningViewpointsScreen";
import { examScreenBody } from "@/features/exam-engine/exam-theme";
import {
  formatListeningScreenPosition,
  listeningCopy,
} from "@/features/exam-engine/listening-copy";
import { listeningPartSixReviewCopy } from "@/features/exam-engine/listening-review-copy";
import type { ListeningMarkedPart } from "@/features/exam-engine/listening-review-types";
import {
  areAllListeningViewpointsQuestionsAnswered,
  buildListeningViewpointsFlow,
  countListeningViewpointsQuestions,
  setListeningViewpointsAnswer,
} from "@/features/exam-engine/listening-viewpoints-flow";
import type {
  ListeningViewpointsAnswerMap,
  ListeningViewpointsPartContent,
} from "@/features/exam-engine/listening-viewpoints-types";
import { getListeningPartScreenTimer } from "@/features/exam-engine/listening-timing";

// Listening Part 6 prototype (EXAM-13, closing screens added by EXAM-14).
//
// The last Listening part, and the only one that completes statements from
// radio options. It is deliberately not merged with the Part 4 or Part 5
// prototypes: Part 4 completes the same kind of statement from a select,
// and Part 5 answers whole questions from radio options over a video. The
// content shapes differ for the same reason. See the header of
// listening-viewpoints-types.ts.
//
// What it does share with Parts 2, 3, 4 and 5 is how the part closes. All
// five keep their answer key on the server and ask for it to be marked, so
// the marking state machine below is the Part 5 one, and the three closing
// screens are the same components with Part 6 wording passed in.
//
// It owns three pieces of state:
//
// - which screen is showing, an index into the flow built by
//   buildListeningViewpointsFlow
// - the answers, as { questionId: optionId }
// - the marking result, once the server has returned one
//
// All three live in local component state. Nothing is written to a
// database and a page reload starts the part again. That is deliberate for
// a prototype and is recorded in
// docs/product/listening-part-6-review-score.md.
//
// Part 6 has one clip and six questions, so the flow is seven screens:
// part intro, scenario, report audio, the question screen, the answer
// review, the practice score, and the end of part screen. It was five in
// EXAM-13, which closed on a single completion screen. The only change
// behind that was dropping the EXAM-13 ending from the
// buildListeningViewpointsFlow call, which now defaults to "review".
//
// Back is enabled throughout, which the official-style flow would not
// allow, so the sequence can be walked through repeatedly during review.
// Answers survive going back and forward because they are keyed by
// question id rather than by screen position, and because this component
// stays mounted across the whole part. Back from the answer review lands
// on the question screen with all six options still selected, which is the
// prototype affordance the ticket asks for.
//
// Next on the question screen is disabled until all six questions have an
// answer. It is not gated on the clip finishing anywhere yet.
//
// Every screen title, statement, option and media URL comes from the
// content object passed in, so this component carries no Mock Test 1 text
// of its own. The answer key is not among them: the route strips it before
// the content reaches this component, and this component never sees a
// correct option until the learner has finished the part and the server
// sends the review rows back.

// The one answering window this part's question screen runs
// (EXAM-15F). Resolved once at module level, because it is a constant
// of the format rather than anything this component decides.
const SCREEN_TIMER = getListeningPartScreenTimer(6);

// Marks an attempt on the server and returns the review rows and the
// practice score. Resolves to null when the caller has no session.
//
// Passed in rather than imported, so this component depends on the shape
// of the result and not on one particular route's action.
export type ListeningPartSixMarkAction = (
  answers: ListeningViewpointsAnswerMap,
) => Promise<ListeningMarkedPart | null>;

// Where the marking request has got to.
//
// "failed" covers both a rejected request and a null reply, which is a
// lost session. Both leave the learner in the same place with the same
// thing to do, so they read as one state and the copy names both causes.
type MarkingState =
  | { status: "idle" }
  | { status: "working" }
  | { status: "ready"; marked: ListeningMarkedPart }
  | { status: "failed" };

export type ListeningPartSixPrototypeProps = {
  content: ListeningViewpointsPartContent;
  markAnswers: ListeningPartSixMarkAction;
};

export function ListeningPartSixPrototype({
  content,
  markAnswers,
}: ListeningPartSixPrototypeProps) {
  // The default "review" ending now, rather than the EXAM-13 single
  // completion screen, which is what turns the last screen into the three
  // closing screens.
  const screens = useMemo(
    () => buildListeningViewpointsFlow(content),
    [content],
  );
  const questionCount = useMemo(
    () => countListeningViewpointsQuestions(content),
    [content],
  );

  const [screenIndex, setScreenIndex] = useState(0);
  const [answers, setAnswers] = useState<ListeningViewpointsAnswerMap>({});
  const [marking, setMarking] = useState<MarkingState>({ status: "idle" });

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

  const screen = screens[screenIndex];
  const totalScreens = screens.length;

  const requestMarking = async (submitted: ListeningViewpointsAnswerMap) => {
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
  // showing without going back to the question screen first, so entering
  // the review is exactly the moment the result is needed and exactly the
  // moment it is known to be current.
  const goNext = () => {
    const nextIndex = Math.min(screenIndex + 1, totalScreens - 1);

    if (screens[nextIndex]?.kind === "answer-review") {
      void requestMarking(answers);
    }

    setScreenIndex(nextIndex);
  };

  const goBack = () => {
    setScreenIndex((current) => Math.max(current - 1, 0));
  };

  const selectAnswer = (questionId: string, optionId: string) => {
    setAnswers((current) =>
      setListeningViewpointsAnswer(current, questionId, optionId),
    );
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
  const metaText = formatListeningScreenPosition(screenIndex + 1, totalScreens);
  const showBack = screenIndex > 0;

  // Stands in for the review and the score while the server is marking,
  // and carries the retry when it could not. Back still works, so a
  // failed check is never a dead end: the learner can walk back to the
  // question screen with every option still selected.
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
                ? listeningCopy.markingFailedHeading
                : listeningCopy.markingHeading
            }
            text={
              failed
                ? listeningCopy.markingFailedText
                : listeningCopy.markingText
            }
          />

          {failed ? (
            <div className={examScreenBody.actions}>
              <ExamButton
                variant="primary"
                size="md"
                onClick={() => void requestMarking(answers)}
              >
                {listeningCopy.markingRetryLabel}
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
      <ListeningPartIntroScreen
        content={content}
        questionCount={questionCount}
        // No sectionCount. Part 6 is one report, not a part built from
        // conversation sections, so the row is left out rather than
        // reading "Sections 1".
        formatLabel="Report audio and dropdown questions"
        metaText={metaText}
        onNext={goNext}
        onBack={goBack}
        showBack={showBack}
      />
    );
  }

  if (screen.kind === "scenario") {
    return (
      <ListeningScenarioScreen
        title={content.title}
        scenario={content.scenario}
        metaText={metaText}
        onNext={goNext}
        onBack={goBack}
        showBack={showBack}
      />
    );
  }

  if (screen.kind === "media") {
    return (
      <ListeningViewpointsScreen
        title={content.title}
        media={content.media}
        instructionText={content.mediaInstruction}
        metaText={metaText}
        onNext={goNext}
        onBack={goBack}
        showBack={showBack}
      />
    );
  }

  if (screen.kind === "questions") {
    return (
      <ListeningViewpointsQuestionScreen
        title={content.title}
        questions={content.questions}
        answers={answers}
        onSelectOption={selectAnswer}
        allAnswered={areAllListeningViewpointsQuestionsAnswered(
          content,
          answers,
        )}
        instructionText={content.questionInstruction}
        // The flow screen id, so the answering window belongs to this
        // screen and is not restarted by any of the six selections made on
        // it (EXAM-15D).
        timerScreenKey={screen.id}
        // The Part 6 screen window from listening-timing.ts, not the
        // 30 second per question default this screen used to fall back to
        // (EXAM-15F). Nothing enforces it on this route: no onTimeExpire
        // is passed, so the reading reaches "Time is up" and the screen
        // stays put, which is what keeps this route usable for
        // development.
        timerSeconds={SCREEN_TIMER.seconds}
        timerWarningAtSeconds={SCREEN_TIMER.warningAtSeconds}
        timerUrgentAtSeconds={SCREEN_TIMER.urgentAtSeconds}
        metaText={metaText}
        onNext={goNext}
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
      <ListeningAnswerReviewScreen
        title={content.title}
        rows={marking.marked.rows}
        explanationImageUrl={content.answerExplanationImageUrl}
        explanationImageAlt={content.answerExplanationImageAlt}
        copy={listeningPartSixReviewCopy}
        metaText={metaText}
        onNext={goNext}
        // Back lands on the viewpoints question screen, which is the
        // prototype affordance the ticket asks for.
        onBack={goBack}
        showBack={showBack}
      />
    );
  }

  if (screen.kind === "score") {
    // Reachable by pressing Back from the end screen, so the result can
    // be missing here even though the review had it, for example after a
    // failed retry. The same screen covers it.
    if (marking.status !== "ready") {
      return renderMarkingScreen();
    }

    return (
      <ListeningScoreScreen
        title={content.title}
        summary={marking.marked.summary}
        copy={listeningPartSixReviewCopy}
        onEndPart={goNext}
        onReviewAnswers={goBack}
        metaText={metaText}
        onBack={goBack}
        showBack={showBack}
      />
    );
  }

  // End of part screen. The last screen in the flow, so there is no Next.
  //
  // The part-complete kind belongs to the EXAM-13 ending, which this flow
  // no longer builds, so it lands here rather than in a branch that could
  // not be reached.
  return (
    <ListeningPartEndScreen
      title={content.title}
      onRestart={restart}
      copy={listeningPartSixReviewCopy}
      metaText={metaText}
      onBack={goBack}
      showBack={showBack}
    />
  );
}
