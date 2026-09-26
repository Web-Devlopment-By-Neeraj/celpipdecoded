"use client";

import { Fragment, useMemo, useRef, useState } from "react";
import { ExamButton } from "../ExamButton";
import { ExamInstructionRow } from "../ExamInstructionRow";
import { ExamShell } from "../ExamShell";
import {
  MockTestTimeUpToast,
  useMockTestTimeUpToast,
} from "../player/MockTestTimeUpToast";
import { ReadingCorrespondenceScreen } from "./ReadingCorrespondenceScreen";
import { ReadingPartFourInformationScreen } from "./ReadingPartFourInformationScreen";
import { ReadingPartIntroScreen } from "./ReadingPartIntroScreen";
import { ReadingPartThreeInformationScreen } from "./ReadingPartThreeInformationScreen";
import { ReadingPartTwoInformationScreen } from "./ReadingPartTwoInformationScreen";
import { ReadingSectionIntroScreen } from "./ReadingSectionIntroScreen";
import { ReadingSectionReviewScreen } from "./ReadingSectionReviewScreen";
import { ReadingSectionScoreScreen } from "./ReadingSectionScoreScreen";
import { ReadingSectionTransitionScreen } from "./ReadingSectionTransitionScreen";
import { examScreenBody } from "@/features/exam-engine/exam-theme";
import {
  formatReadingSectionMeta,
  formatReadingSectionPartMeta,
  readingSectionCopy,
} from "@/features/exam-engine/reading-copy";
import {
  buildReadingSectionFlow,
  countReadingSectionPartQuestions,
  setReadingSectionAnswer,
} from "@/features/exam-engine/reading-section-flow";
import type { ReadingSectionCopy } from "@/features/exam-engine/reading-copy";
import type {
  ReadingSectionAnswerMap,
  ReadingSectionContent,
  ReadingSectionMarkedResult,
  ReadingSectionPartScreenRef,
} from "@/features/exam-engine/reading-section-types";

// Full Reading section prototype (EXAM-24).
//
// The whole Reading section as one run: the section intro, Parts 1 to 4
// back to back with a short transition between them, then one practice
// score over all the section's questions with the part breakdown and the
// estimated Reading band, and one answer review opened from it.
//
// It replaces nothing. The four part level prototypes still exist and
// their routes are unchanged, and this component renders the same screen
// components they do, with the same content objects. What it does not
// render is their closing screens: inside the full section a part hands
// straight over to the next one, so no part level review and no part
// level score appears anywhere in this flow. That rule is enforced one
// level down, in buildReadingSectionFlow, rather than by this component
// remembering not to draw them.
//
// It owns three pieces of state:
//
// - which screen is showing, an index into the flow built by
//   buildReadingSectionFlow
// - the answers for all four parts, as one { questionId: optionId } map
// - the marking request, idle, working, ready or failed
//
// All three live in local component state. Nothing is written to a
// database, to localStorage or to a cookie, and a page reload starts the
// section again. That is deliberate for a prototype and is recorded in
// docs/product/full-reading-section-flow-band-score.md.
//
// One answer map carries every answer because the question ids are unique
// across the four Mock Test 1 content files, reading-part-1-q1 through
// reading-part-4-q10, so no part prefix and no nesting is needed. It is
// the same { questionId: optionId } shape each part prototype already
// held, which is what lets every existing Reading helper read it
// unchanged. Answers survive going back and forward, and across a part
// boundary in either direction, because they are keyed by question id
// rather than by screen position and because this component stays mounted
// for the whole section. Restart clears them all and returns to the
// section intro.
//
// Blanks are allowed throughout and nothing is gated on them. A learner
// can finish the section with any number of questions unanswered, which
// is the EXAM-17 rule this section inherits: a blank travels as a missing
// key in the answer map, the server marks it as incorrect, and the review
// row for it says "No answer selected" while still showing the correct
// option.
//
// Timing is the part level behaviour, unchanged (EXAM-24 scope). Each
// part carries its own window, keyed to its own working screen: the
// countdown runs, reaches "Time is up" in red, and stops, with every
// answer still selected. Nothing auto-submits and nothing advances by
// itself, so a learner whose window closes keeps their answers and
// continues by hand. There is no section wide clock. Strict full Reading
// timing is left for a later polish ticket and is written up as such.
//
// TIMER-01 added an expiry handler, and it changes none of the above. All
// it does is raise the shared time up message for a few seconds, so the
// learner is told in a sentence what the red reading only implies.
//
// Back is enabled throughout, which the official-style flow would not
// allow, so the sequence can be walked through repeatedly during review.
// This is the prototype behaviour the four Reading part routes already
// have, and it is deliberately not the forward only rule the full
// Listening run enforces: that rule belongs with strict timing, and both
// are the next Reading ticket. The only navigation out of the exam
// surface is the dashboard button on the score screen.
//
// Marking is requested once, on the move onto the score screen, and the
// result is held so that walking back into a part, changing an answer and
// finishing again re-marks rather than showing a stale score. A request
// id guards against an older reply landing after a newer one, which is
// the pattern all four part prototypes use. A failed request leaves the
// answers untouched and offers a retry, because the answers are the only
// copy there is.
//
// Every screen title, question, option and instruction line comes from
// the section content object passed in, so this component carries no Mock
// Test 1 text of its own. The answer keys are not among them: the route
// strips all four before the content reaches this component, and this
// component never sees a correct option until the learner has finished
// Part 4 and the server sends the review rows back.
//
// House style: normal hyphens only, no long hyphens or em dashes.

// Marks a whole section attempt on the server and returns the per part
// review rows, the section totals and the estimated band. Resolves to
// null when the caller has no session.
//
// Passed in rather than imported, so this component depends on the shape
// of the result and not on one particular route's action.
export type ReadingSectionMarkAction = (
  answers: ReadingSectionAnswerMap,
) => Promise<ReadingSectionMarkedResult | null>;

// Where the marking request has got to.
//
// "failed" covers both a rejected request and a null reply, which is a
// lost session. Both leave the learner in the same place with the same
// thing to do, so they read as one state and the copy names both causes.
type MarkingState =
  | { status: "idle" }
  | { status: "working" }
  | { status: "ready"; marked: ReadingSectionMarkedResult }
  | { status: "failed" };

export type ReadingSectionPrototypeProps = {
  content: ReadingSectionContent;
  markAnswers: ReadingSectionMarkAction;
  copy?: ReadingSectionCopy;
  // Where Return to dashboard goes from the score screen.
  dashboardHref?: string;
};

export function ReadingSectionPrototype({
  content,
  markAnswers,
  copy = readingSectionCopy,
  dashboardHref,
}: ReadingSectionPrototypeProps) {
  const screens = useMemo(() => buildReadingSectionFlow(content), [content]);

  const [screenIndex, setScreenIndex] = useState(0);
  const [answers, setAnswers] = useState<ReadingSectionAnswerMap>({});
  const [marking, setMarking] = useState<MarkingState>({ status: "idle" });

  // The one time up message for the whole run (TIMER-01). See
  // MockTestTimeUpToast for why it belongs to the section rather than to a
  // screen.
  const { toastKey, showTimeUp, dismissTimeUp } = useMockTestTimeUpToast();

  // Which marking request is the current one. A learner can leave the
  // score, change an answer and come back faster than a reply arrives,
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
  const totalParts = content.parts.length;

  const requestMarking = async (submitted: ReadingSectionAnswerMap) => {
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

  // Moving onto the score screen is what submits the section. Doing it
  // here rather than in an effect keeps the request tied to the click
  // that caused it, and re-marks if the learner goes back into a part,
  // changes an answer and finishes again.
  const goNext = () => {
    const nextIndex = Math.min(screenIndex + 1, totalScreens - 1);

    if (screens[nextIndex]?.kind === "section-score") {
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
      setReadingSectionAnswer(current, questionId, optionId),
    );
  };

  // Start the section again from the first screen with an empty answer
  // map and no result. Every answer goes, because they are all in that
  // one map. Nothing was saved, so there is nothing else to clear. The
  // request id moves on so a reply still in flight cannot land on the
  // fresh run.
  const restart = () => {
    markingRequestId.current += 1;
    dismissTimeUp();
    setScreenIndex(0);
    setAnswers({});
    setMarking({ status: "idle" });
  };

  // Back is hidden on the first screen only, because there is nothing
  // behind it inside the section.
  const showBack = screenIndex > 0;

  // Stands in for the score and the review while the request is in
  // flight, and reports a failure with a retry when it is not. Back stays
  // available in both states, so a learner is never stuck on it, and the
  // answers are still held either way.
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
  // The dispatch is on the screen kind first and, for the working screen,
  // on the part's taskScreen second. The four working screens take
  // identical props, so the branch chooses a component and passes the
  // same eight things to it. Each is the component the matching part
  // route already renders, so a part looks the same in both routes.
  //
  // The three navigation props are written out on every screen below
  // rather than collected into one object and spread, the way the four
  // part prototypes pass them: gathering handlers into a plain object
  // during render is what react-hooks/refs flags, because goNext reads
  // the marking request ref.
  const renderPartScreen = (screenRef: ReadingSectionPartScreenRef) => {
    const part = content.parts[screenRef.partIndex];

    if (!part) {
      return null;
    }

    const partScreen = screenRef.screen;
    const metaText = formatReadingSectionPartMeta(
      part.partNumber,
      totalParts,
      screenIndex + 1,
      totalScreens,
    );

    if (partScreen.kind === "part-intro") {
      return (
        <ReadingPartIntroScreen
          content={part.content}
          questionCount={countReadingSectionPartQuestions(part)}
          formatLabel={part.formatLabel}
          // The section notice, not the part one. The part wording says
          // "Internal prototype." and promises a score at the end of the
          // part, and neither is true on this surface.
          noticeText={copy.partIntroNotice}
          metaText={metaText}
          onNext={goNext}
          onBack={goBack}
          showBack={showBack}
        />
      );
    }

    // The working screen. Every one of the four takes the same props, and
    // the timer key is the flow screen id so the part window belongs to
    // the screen and is not restarted by a selection made on it.
    //
    // onTimeExpire raises the time up message and does nothing else
    // (TIMER-01). Nothing auto-submits and nothing advances when a window
    // closes: the reading reaches "Time is up" in red, the passage and
    // every answer on the screen stay exactly where they are, and the
    // learner continues by hand.
    const taskProps = {
      content: part.content,
      answers,
      onSelectOption: selectAnswer,
      timerScreenKey: partScreen.id,
      onTimeExpire: showTimeUp,
      metaText,
      onNext: goNext,
      onBack: goBack,
      showBack,
    };

    if (partScreen.kind === "correspondence") {
      return <ReadingCorrespondenceScreen {...taskProps} />;
    }

    if (partScreen.kind === "diagram") {
      return <ReadingPartTwoInformationScreen {...taskProps} />;
    }

    if (partScreen.kind === "information") {
      return <ReadingPartThreeInformationScreen {...taskProps} />;
    }

    return <ReadingPartFourInformationScreen {...taskProps} />;
  };

  if (!screen) {
    return null;
  }

  // The screen at the current position.
  //
  // Wrapped in a function so the whole flow can be given one key below.
  // Everything after the part branch belongs to the section rather than
  // to a part, so it carries the section title and the section meta line.
  const renderCurrentScreen = () => {
    if (screen.kind === "part") {
      return renderPartScreen(screen);
    }

    const metaText = formatReadingSectionMeta(screenIndex + 1, totalScreens);

    if (screen.kind === "section-intro") {
      return (
        <ReadingSectionIntroScreen
          content={content}
          copy={copy}
          metaText={metaText}
          onNext={goNext}
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
        <ReadingSectionTransitionScreen
          title={content.title}
          completedPartLabel={completedPart.partLabel}
          nextPartLabel={nextPart.partLabel}
          copy={copy}
          metaText={metaText}
          onNext={goNext}
          onBack={goBack}
          showBack={showBack}
        />
      );
    }

    if (screen.kind === "section-score") {
      if (marking.status !== "ready") {
        return renderMarkingScreen(metaText);
      }

      return (
        <ReadingSectionScoreScreen
          title={content.title}
          summary={marking.marked.summary}
          parts={marking.marked.parts}
          estimatedBand={marking.marked.estimatedBand}
          copy={copy}
          // Next is hidden on this screen, so Review answers is what
          // moves the flow forward onto the review.
          onReviewAnswers={goNext}
          onRestart={restart}
          dashboardHref={dashboardHref}
          metaText={metaText}
          onBack={goBack}
          showBack={showBack}
        />
      );
    }

    // Full Reading answer review. The last screen in the flow, so there
    // is no Next, and Back returns to the score.
    if (marking.status !== "ready") {
      return renderMarkingScreen(metaText);
    }

    return (
      <ReadingSectionReviewScreen
        title={content.title}
        parts={marking.marked.parts}
        copy={copy}
        metaText={metaText}
        onBack={goBack}
        showBack={showBack}
      />
    );
  };

  // One keyed fragment around the whole flow, and the reason it is here
  // is the exam canvas, which is the reason the Listening section
  // prototype has one too.
  //
  // Inside the locked viewport the canvas is the only region that
  // scrolls, and it is the same DOM element on every screen, so its
  // scroll offset would otherwise carry over: pressing Next at the bottom
  // of the Part 4 question column would land on the score already
  // scrolled halfway down it. Keying on the screen id remounts the frame
  // when the screen changes, so every screen opens at the top of the
  // canvas.
  //
  // A fragment rather than a wrapper element, because the exam frame
  // fills its parent by height and an extra div in the chain would have
  // to be taught the same flex rules.
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
