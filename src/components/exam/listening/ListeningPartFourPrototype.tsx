"use client";

import { useMemo, useRef, useState } from "react";
import { ExamButton } from "../ExamButton";
import { ExamInstructionRow } from "../ExamInstructionRow";
import { ExamShell } from "../ExamShell";
import { ListeningAnswerReviewScreen } from "./ListeningAnswerReviewScreen";
import { ListeningAudioScreen } from "./ListeningAudioScreen";
import { ListeningDropdownQuestionScreen } from "./ListeningDropdownQuestionScreen";
import { ListeningPartEndScreen } from "./ListeningPartEndScreen";
import { ListeningPartIntroScreen } from "./ListeningPartIntroScreen";
import { ListeningScenarioScreen } from "./ListeningScenarioScreen";
import { ListeningScoreScreen } from "./ListeningScoreScreen";
import { examScreenBody } from "@/features/exam-engine/exam-theme";
import {
  areAllListeningDropdownQuestionsAnswered,
  buildListeningDropdownFlow,
  countListeningDropdownQuestions,
  setListeningDropdownAnswer,
} from "@/features/exam-engine/listening-dropdown-flow";
import {
  formatListeningScreenPosition,
  listeningCopy,
} from "@/features/exam-engine/listening-copy";
import { listeningPartFourReviewCopy } from "@/features/exam-engine/listening-review-copy";
import type {
  ListeningDropdownAnswerMap,
  ListeningDropdownPartContent,
} from "@/features/exam-engine/listening-dropdown-types";
import type { ListeningMarkedPart } from "@/features/exam-engine/listening-review-types";
import { getListeningPartScreenTimer } from "@/features/exam-engine/listening-timing";

// Listening Part 4 prototype (EXAM-09, closing screens added by EXAM-10).
//
// The first dropdown completion part. It is deliberately not merged with
// the Parts 1 to 3 prototypes: those walk one question per screen and
// gate Next on that one answer, and this one shows every question at once
// and gates Next on the whole set. The content shapes differ for the same
// reason. See the header of listening-dropdown-types.ts.
//
// What it does share with Part 2 and Part 3 is how the part closes. All
// three keep their answer key on the server and ask for it to be marked,
// so the marking state machine below is the Part 3 one, and the three
// closing screens are the same components with Part 4 wording passed in.
//
// It owns three pieces of state:
//
// - which screen is showing, an index into the flow built by
//   buildListeningDropdownFlow
// - the answers, as { questionId: optionId }
// - the marking result, once the server has returned one
//
// All three live in local component state. Nothing is written to a
// database and a page reload starts the part again. That is deliberate
// for a prototype and is recorded in
// docs/product/listening-part-4-review-score.md.
//
// Part 4 has one news item and five questions, so the flow is seven
// screens: part intro, scenario, news audio, the question screen, the
// answer review, the practice score, and the end of part screen. It was
// five in EXAM-09, which closed on a single completion screen. The only
// change behind that was dropping the EXAM-09 ending from the
// buildListeningDropdownFlow call, which now defaults to "review".
//
// Back is enabled throughout, which the official-style flow would not
// allow, so the sequence can be walked through repeatedly during review.
// Answers survive going back and forward because they are keyed by
// question id rather than by screen position, and because this component
// stays mounted across the whole part. Back from the answer review lands
// on the question screen with all five dropdowns still set, which is the
// prototype affordance the ticket asks for.
//
// Next on the question screen is disabled until all five dropdowns have
// an answer. It is not gated on audio finishing anywhere yet.
//
// Every screen title, statement, option and clip URL comes from the
// content object passed in, so this component carries no Mock Test 1
// text. The answer key is not among them: the route strips it before the
// content reaches this component, and this component never sees a correct
// option until the learner has finished the part and the server sends the
// review rows back.

// The one answering window this part's question screen runs
// (EXAM-15F). Resolved once at module level, because it is a constant
// of the format rather than anything this component decides.
const SCREEN_TIMER = getListeningPartScreenTimer(4);

// Marks an attempt on the server and returns the review rows and the
// practice score. Resolves to null when the caller has no session.
//
// Passed in rather than imported, so this component depends on the shape
// of the result and not on one particular route's action.
export type ListeningPartFourMarkAction = (
  answers: ListeningDropdownAnswerMap,
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

export type ListeningPartFourPrototypeProps = {
  content: ListeningDropdownPartContent;
  markAnswers: ListeningPartFourMarkAction;
};

export function ListeningPartFourPrototype({
  content,
  markAnswers,
}: ListeningPartFourPrototypeProps) {
  // The default "review" ending now, rather than the EXAM-09 single
  // completion screen, which is what turns the last screen into the three
  // closing screens.
  const screens = useMemo(
    () => buildListeningDropdownFlow(content),
    [content],
  );
  const questionCount = useMemo(
    () => countListeningDropdownQuestions(content),
    [content],
  );

  const [screenIndex, setScreenIndex] = useState(0);
  const [answers, setAnswers] = useState<ListeningDropdownAnswerMap>({});
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

  const requestMarking = async (submitted: ListeningDropdownAnswerMap) => {
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
      setListeningDropdownAnswer(current, questionId, optionId),
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
  // question screen with every dropdown still set.
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
        // No sectionCount. Part 4 is one news item, not a part built from
        // conversation sections, so the row is left out rather than
        // reading "Sections 1".
        formatLabel="News audio and dropdown questions"
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
      <ListeningAudioScreen
        title={content.title}
        audioSrc={content.media.url}
        audioTitle={content.media.title}
        durationLabel={content.media.durationLabel}
        instructionText={
          content.mediaInstruction ?? listeningCopy.newsItemInstruction
        }
        metaText={metaText}
        onNext={goNext}
        onBack={goBack}
        showBack={showBack}
      />
    );
  }

  if (screen.kind === "questions") {
    return (
      <ListeningDropdownQuestionScreen
        title={content.title}
        questions={content.questions}
        answers={answers}
        onSelectOption={selectAnswer}
        allAnswered={areAllListeningDropdownQuestionsAnswered(content, answers)}
        instructionText={content.questionInstruction}
        // The flow screen id, so the answering window belongs to this
        // screen and is not restarted by any of the five selections made
        // on it (EXAM-15D).
        timerScreenKey={screen.id}
        // The Part 4 screen window from listening-timing.ts, not the
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
        copy={listeningPartFourReviewCopy}
        metaText={metaText}
        onNext={goNext}
        // Back lands on the dropdown question screen, which is the
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
        copy={listeningPartFourReviewCopy}
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
  // The part-complete kind belongs to the EXAM-09 ending, which this flow
  // no longer builds, so it lands here rather than in a branch that could
  // not be reached.
  return (
    <ListeningPartEndScreen
      title={content.title}
      onRestart={restart}
      copy={listeningPartFourReviewCopy}
      metaText={metaText}
      onBack={goBack}
      showBack={showBack}
    />
  );
}
