"use client";

import { useMemo, useRef, useState } from "react";
import { ExamButton } from "../ExamButton";
import { ExamInstructionRow } from "../ExamInstructionRow";
import { ExamShell } from "../ExamShell";
import { ListeningAnswerReviewScreen } from "./ListeningAnswerReviewScreen";
import { ListeningAudioScreen } from "./ListeningAudioScreen";
import { ListeningPartEndScreen } from "./ListeningPartEndScreen";
import { ListeningPartIntroScreen } from "./ListeningPartIntroScreen";
import { ListeningQuestionScreen } from "./ListeningQuestionScreen";
import { ListeningScenarioScreen } from "./ListeningScenarioScreen";
import { ListeningScoreScreen } from "./ListeningScoreScreen";
import { examScreenBody } from "@/features/exam-engine/exam-theme";
import {
  buildListeningFlow,
  countListeningQuestions,
  getListeningQuestion,
  resolveListeningQuestionAudio,
  setListeningAnswer,
} from "@/features/exam-engine/listening-flow";
import {
  formatListeningScreenPosition,
  listeningCopy,
} from "@/features/exam-engine/listening-copy";
import { listeningPartTwoReviewCopy } from "@/features/exam-engine/listening-review-copy";
import type { ListeningMarkedPart } from "@/features/exam-engine/listening-review-types";
import type {
  ListeningAnswerMap,
  ListeningPartContent,
} from "@/features/exam-engine/listening-types";

// Listening Part 2 prototype (EXAM-05, closing screens added by EXAM-06).
//
// Same shape as ListeningPartOnePrototype, and still deliberately not
// merged with it. The two parts differ in their screen sequence: Part 1
// has three conversation sections and the section break screens between
// them, and Part 2 has one conversation and no breaks. They mark the same
// way, though. Part 1 scored in the browser until EXAM-15A, and both now
// send the answers to a server action because neither one holds its key.
// See markAnswers below.
//
// It owns three pieces of state:
//
// - which screen is showing, an index into the flow built by
//   buildListeningFlow
// - the answers, as { questionId: optionId }
// - the marking result, once the server has returned one
//
// All three live in local component state. Nothing is written to a
// database and a page reload starts the part again. That is deliberate
// for a prototype and is recorded in
// docs/product/listening-part-2-review-score.md.
//
// Part 2 has one conversation section, so the flow is eleven screens:
// part intro, scenario, conversation, five questions, answer review,
// practice score, end of part. No section break screen appears, because a
// break only sits before a section that is not the first.
//
// Back is enabled throughout, which the official-style flow would not
// allow, so the sequence can be walked through repeatedly during review.
// Answers survive going back and forward because they are keyed by
// question id rather than by screen position.
//
// Next is disabled on a question screen until an option is selected. It
// is not gated on audio finishing anywhere in this ticket.
//
// Every screen title, bullet, option and clip URL comes from the content
// object passed in, so this component carries no Mock Test 1 text. The
// answer key is not among them: the route strips it before the content
// reaches this component, and this component never sees a correct option
// until the learner has finished the part and the server sends the
// review rows back.

// Marks an attempt on the server and returns the review rows and the
// practice score. Resolves to null when the caller has no session.
//
// Passed in rather than imported, so this component depends on the shape
// of the result and not on one particular route's action.
export type ListeningPartTwoMarkAction = (
  answers: ListeningAnswerMap,
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

export type ListeningPartTwoPrototypeProps = {
  content: ListeningPartContent;
  markAnswers: ListeningPartTwoMarkAction;
};

export function ListeningPartTwoPrototype({
  content,
  markAnswers,
}: ListeningPartTwoPrototypeProps) {
  const screens = useMemo(() => buildListeningFlow(content), [content]);
  const questionCount = useMemo(
    () => countListeningQuestions(content),
    [content],
  );

  const [screenIndex, setScreenIndex] = useState(0);
  const [answers, setAnswers] = useState<ListeningAnswerMap>({});
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

  const requestMarking = async (submitted: ListeningAnswerMap) => {
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
  // showing without going back through a question screen first, so
  // entering the review is exactly the moment the result is needed and
  // exactly the moment it is known to be current.
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
    setAnswers((current) => setListeningAnswer(current, questionId, optionId));
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
  // questions with every answer still selected.
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
        sectionCount={content.sections.length}
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

  if (screen.kind === "conversation") {
    const section = content.sections[screen.sectionIndex];

    if (!section) {
      return null;
    }

    return (
      <ListeningAudioScreen
        title={content.title}
        audioSrc={section.conversationAudioUrl}
        // One conversation clip in this part, so the player title carries
        // no section number.
        audioTitle={listeningCopy.conversationPlayerTitle}
        durationLabel={section.durationLabel}
        metaText={metaText}
        onNext={goNext}
        onBack={goBack}
        showBack={showBack}
      />
    );
  }

  if (screen.kind === "question") {
    const question = getListeningQuestion(content, screen);

    if (!question) {
      return null;
    }

    return (
      <ListeningQuestionScreen
        title={content.title}
        question={question}
        audio={resolveListeningQuestionAudio(content, screen)}
        questionNumber={screen.questionNumber}
        questionCount={questionCount}
        selectedOptionId={answers[question.id]}
        onSelectOption={(optionId) => selectAnswer(question.id, optionId)}
        // The flow screen id, so the answering window restarts when the
        // learner moves to another question and not when they change their
        // mind about an option (EXAM-15D).
        timerScreenKey={screen.id}
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
        copy={listeningPartTwoReviewCopy}
        metaText={metaText}
        onNext={goNext}
        // Back lands on Question 5, which is the prototype affordance the
        // ticket asks for.
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
        copy={listeningPartTwoReviewCopy}
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
  // The part-complete kind belongs to the EXAM-05 ending, which this flow
  // no longer builds, so it lands here rather than in a branch that could
  // not be reached.
  return (
    <ListeningPartEndScreen
      title={content.title}
      onRestart={restart}
      copy={listeningPartTwoReviewCopy}
      metaText={metaText}
      onBack={goBack}
      showBack={showBack}
    />
  );
}
