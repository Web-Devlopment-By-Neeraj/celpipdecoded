"use client";

import { ExamShell } from "../ExamShell";
import { ExamCountdownTimer } from "../timer/ExamCountdownTimer";
import { ReadingQuestionPanel } from "./ReadingQuestionPanel";
import { ReadingTwoColumnLayout } from "./ReadingTwoColumnLayout";
import { examReading } from "@/features/exam-engine/exam-theme";
import {
  formatReadingAnsweredCount,
  readingCopy,
} from "@/features/exam-engine/reading-copy";
import { listReadingQuestions } from "@/features/exam-engine/reading-flow";
import type {
  ReadingAnswerMap,
  ReadingPartContent,
} from "@/features/exam-engine/reading-types";

// The Reading split screen (EXAM-16).
//
// Screen type 8 from docs/product/exam-engine-screen-types.md, and the
// only working screen a Reading part has:
//
// - grey top bar with a live countdown for the whole part
// - white exam canvas filled edge to edge by one divided work area
// - passage on the left, own scrollbar
// - question panels on the right, own scrollbar, on the light blue answer
//   wash
// - blue Next in the top bar, Back in the bottom bar
//
// The canvas is unpadded and the split draws no outer rule of its own, so
// the canvas border is the only rule around the work area and the divider
// runs the full height between the two columns. That is the same
// arrangement the answer review table uses, and it is why the split reads
// as one screen rather than as a card floating on a white page.
//
// The timer belongs to the part rather than to any question on it.
// Reading is timed per part in every source we hold, which
// docs/product/celpip-exam-rules-research.md section 11 records, so the
// window is keyed to the flow screen id and answering a question does not
// restart it.
//
// What happens at zero is the caller's decision, and no caller moves
// anywhere (TIMER-01). The reading becomes "Time is up" in red and the
// screen stays put with every answer still selected. Nothing is
// submitted, nothing is cleared, and nothing advances. onTimeExpire is a
// notification: the section run passes one and uses it to raise the
// shared time up message for a few seconds.
//
// A client component, because choosing an option is an event handler. It
// holds no state: the answers are owned by the prototype above it, so
// leaving the screen and coming back shows what was chosen before.
//
// Next is never gated on the answers (EXAM-17 fix). A learner may leave
// any question blank and still leave the screen, which is how the real
// test behaves and how the full Listening route already behaves: nothing
// there blocks on an unanswered question either.
//
// The screen used to take allAnswered and requireAllAnswered and hold
// Next disabled until all 11 questions were answered, which trapped a
// learner who could not answer one of them on the last screen of the
// part with no way forward. Both props are gone rather than defaulted
// off, so the gate cannot come back by a caller forgetting to opt out.
//
// The count under the panels still says how many are answered, and the
// hint beside it says plainly that a blank is counted as incorrect, so
// leaving one is an informed choice rather than an accident. Marking
// treats a blank as incorrect, which buildReadingReviewRows and
// summarizeReadingReviewRows do without any help from this screen.

export type ReadingCorrespondenceScreenProps = {
  content: ReadingPartContent;
  answers: ReadingAnswerMap;
  onSelectOption: (questionId: string, optionId: string) => void;
  // What the countdown resets on. Pass the flow screen id, so the window
  // belongs to the screen and no selection made on it starts a new one.
  timerScreenKey?: string;
  // Fired once when the window reaches zero. Nothing passes one in
  // EXAM-16.
  onTimeExpire?: () => void;
  metaText?: string;
  onNext?: () => void;
  onBack?: () => void;
  showBack?: boolean;
};

export function ReadingCorrespondenceScreen({
  content,
  answers,
  onSelectOption,
  timerScreenKey,
  onTimeExpire,
  metaText,
  onNext,
  onBack,
  showBack = true,
}: ReadingCorrespondenceScreenProps) {
  const questions = listReadingQuestions(content);
  const answeredCount = questions.filter((question) =>
    Boolean(answers[question.id]),
  ).length;

  return (
    <ExamShell
      title={content.title}
      timerSlot={
        <ExamCountdownTimer
          // Keyed on the screen, because the whole part is answered
          // inside one window.
          screenKey={timerScreenKey ?? content.sectionId}
          durationSeconds={content.timer.seconds}
          warningAtSeconds={content.timer.warningAtSeconds}
          urgentAtSeconds={content.timer.urgentAtSeconds}
          label={readingCopy.partTimerLabel}
          onExpire={onTimeExpire}
        />
      }
      metaText={metaText}
      onNext={onNext}
      onBack={onBack}
      showBack={showBack}
      // The split manages its own edges and fills the canvas.
      padded={false}
      // The split pane gives each column its own scrollbar, so the
      // content pane takes none of its own (EXAM-UI-02).
      scrollContent={false}
    >
      <ReadingTwoColumnLayout
        passageLabel={content.passage.label ?? readingCopy.passageColumnLabel}
        passage={
          <div className={examReading.passage}>
            {content.passageInstruction ? (
              <p className={examReading.panelInstruction}>
                {content.passageInstruction}
              </p>
            ) : null}

            {content.passage.heading ? (
              <p className={examReading.passageHeading}>
                {content.passage.heading}
              </p>
            ) : null}

            {content.passage.paragraphs.map((paragraph, index) => (
              <p
                // Paragraphs have no ids of their own and never reorder,
                // so the index is the stable key here.
                key={`${content.sectionId}-paragraph-${index}`}
                className={examReading.passageParagraph}
              >
                {paragraph}
              </p>
            ))}

            {content.passage.signOff ? (
              <div className={examReading.passageSignOff}>
                {content.passage.signOff.map((line) => (
                  <span key={line} className={examReading.passageSignOffLine}>
                    {line}
                  </span>
                ))}
              </div>
            ) : null}
          </div>
        }
        questions={
          <div className={examReading.panelStack}>
            {content.questionGroups.map((group) => (
              <ReadingQuestionPanel
                key={group.id}
                group={group}
                answers={answers}
                onSelectOption={onSelectOption}
              />
            ))}

            <p className={examReading.progressNote}>
              {formatReadingAnsweredCount(answeredCount, questions.length)}
              {answeredCount < questions.length
                ? ` ${readingCopy.blanksAllowedHint}`
                : null}
            </p>
          </div>
        }
      />
    </ExamShell>
  );
}
