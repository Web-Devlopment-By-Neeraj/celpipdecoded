"use client";

import { ExamShell } from "../ExamShell";
import { ExamCountdownTimer } from "../timer/ExamCountdownTimer";
import { ReadingPartFourQuestionPanel } from "./ReadingPartFourQuestionPanel";
import { ReadingTwoColumnLayout } from "./ReadingTwoColumnLayout";
import { examReading } from "@/features/exam-engine/exam-theme";
import { readingCopy } from "@/features/exam-engine/reading-copy";
import type {
  ReadingAnswerMap,
  ReadingPartContent,
} from "@/features/exam-engine/reading-types";

// The Reading Part 4 split screen (EXAM-22).
//
// Screen type 8 from docs/product/exam-engine-screen-types.md, in its
// viewpoints variant, and the only working screen this part has:
//
// - grey top bar with a live countdown for the whole part
// - white exam canvas filled edge to edge by one divided work area
// - the website article on the left, own scrollbar
// - the five sentence stems and the reader comment on the right, own
//   scrollbar, on the light blue answer wash
// - blue Next in the top bar, Back in the bottom bar
//
// It is a sibling of ReadingCorrespondenceScreen,
// ReadingPartTwoInformationScreen and ReadingPartThreeInformationScreen
// rather than a branch inside any of them. The four share everything
// structural, ReadingTwoColumnLayout and the shell and the timer, and
// differ in exactly one thing: what the left column holds. Part 1's is a
// letter, Part 2's is a picture, Part 3's is a set of labelled paragraphs
// whose labels are the answers, and this one's is a website article in
// which several people give their views on one proposal.
//
// The left column here is the closest of the four to Part 1's, running
// prose in paragraphs, and it is still drawn here rather than borrowed
// from that screen. ReadingCorrespondenceScreen draws a letter: it owns
// the salutation and the sign off lines, it owns its own question column,
// and it labels the column "Reading passage". An article has no
// salutation and no sign off, and the column is labelled "Article"
// because the panel on the right is prose too and a learner has to be
// told which of the two "passage" would mean. Reusing that screen would
// mean growing it a set of options for a part it was not written for,
// which is the branch the four sibling screens exist to avoid.
//
// The sections branch is not here at all: nothing in this part is
// answered by naming a paragraph, so the article is
// content.passage.paragraphs and nothing else.
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
// Next is never gated on the answers. A learner may leave any question
// blank and still leave the screen, which is the EXAM-17 rule this part
// inherits rather than rediscovers: a screen that holds Next until every
// question is answered traps a learner who cannot answer one of them.
//
// A client component, because choosing an option is an event handler. It
// holds no state: the answers are owned by the prototype above it, so
// leaving the screen and coming back shows what was chosen before.

export type ReadingPartFourInformationScreenProps = {
  content: ReadingPartContent;
  answers: ReadingAnswerMap;
  onSelectOption: (questionId: string, optionId: string) => void;
  // What the countdown resets on. Pass the flow screen id, so the window
  // belongs to the screen and no selection made on it starts a new one.
  timerScreenKey?: string;
  // Fired once when the window reaches zero. Nothing passes one in
  // EXAM-22.
  onTimeExpire?: () => void;
  metaText?: string;
  onNext?: () => void;
  onBack?: () => void;
  showBack?: boolean;
};

export function ReadingPartFourInformationScreen({
  content,
  answers,
  onSelectOption,
  timerScreenKey,
  onTimeExpire,
  metaText,
  onNext,
  onBack,
  showBack = true,
}: ReadingPartFourInformationScreenProps) {
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
        passageLabel={content.passage.label ?? readingCopy.articleColumnLabel}
        passage={
          <div className={examReading.passage}>
            {content.passageInstruction ? (
              <p className={examReading.panelInstruction}>
                {content.passageInstruction}
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
          </div>
        }
        questions={
          <ReadingPartFourQuestionPanel
            content={content}
            answers={answers}
            onSelectOption={onSelectOption}
          />
        }
      />
    </ExamShell>
  );
}
