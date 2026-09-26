"use client";

import { ExamShell } from "../ExamShell";
import { ExamCountdownTimer } from "../timer/ExamCountdownTimer";
import { ReadingPartThreeQuestionPanel } from "./ReadingPartThreeQuestionPanel";
import { ReadingTwoColumnLayout } from "./ReadingTwoColumnLayout";
import { examReading } from "@/features/exam-engine/exam-theme";
import { readingCopy } from "@/features/exam-engine/reading-copy";
import type {
  ReadingAnswerMap,
  ReadingPartContent,
} from "@/features/exam-engine/reading-types";

// The Reading Part 3 split screen (EXAM-20).
//
// Screen type 8 from docs/product/exam-engine-screen-types.md, in its
// information variant, and the only working screen this part has:
//
// - grey top bar with a live countdown for the whole part
// - white exam canvas filled edge to edge by one divided work area
// - the lettered paragraphs A to E on the left, own scrollbar
// - the nine statements on the right, own scrollbar, on the light blue
//   answer wash
// - blue Next in the top bar, Back in the bottom bar
//
// It is a sibling of ReadingCorrespondenceScreen and
// ReadingPartTwoInformationScreen rather than a branch inside either. The
// three share everything structural, ReadingTwoColumnLayout and the shell
// and the timer, and differ in exactly one thing: what the left column
// holds. Part 1's is a letter, Part 2's is a picture, and this one's is a
// set of labelled paragraphs whose labels are the answers.
//
// That last point is why the left column is drawn here rather than
// borrowed. In Parts 1 and 2 the passage is read; in Part 3 it is
// scanned, and a learner has to be able to find paragraph C without
// reading B and D to get there. So each section prints its letter as a
// marker in its own narrow column, which keeps the five letters in a
// straight line down the left edge, and the paragraph text keeps one
// comfortable measure beside them. Running "C." into the first sentence
// would be faithful to how the document types it and useless to scan.
//
// Paragraph E is drawn with the other four because the source document
// prints it in the same lettered run and because a learner choosing E has
// to be able to read what it means. It is a choice rather than a
// paragraph, which its own sentence says plainly, so the screen does not
// dress it as anything else.
//
// The prose branch under the sections is there for a part that has both
// labelled sections and unlabelled paragraphs. Mock Test 1 Reading Part 3
// has none of the latter, so it renders nothing.
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
// Next is never gated on the answers. A learner may leave any statement
// blank and still leave the screen, which is the EXAM-17 rule this part
// inherits rather than rediscovers: a screen that holds Next until every
// question is answered traps a learner who cannot answer one of them.
//
// A client component, because choosing an option is an event handler. It
// holds no state: the answers are owned by the prototype above it, so
// leaving the screen and coming back shows what was chosen before.

export type ReadingPartThreeInformationScreenProps = {
  content: ReadingPartContent;
  answers: ReadingAnswerMap;
  onSelectOption: (questionId: string, optionId: string) => void;
  // What the countdown resets on. Pass the flow screen id, so the window
  // belongs to the screen and no selection made on it starts a new one.
  timerScreenKey?: string;
  // Fired once when the window reaches zero. Nothing passes one in
  // EXAM-20.
  onTimeExpire?: () => void;
  metaText?: string;
  onNext?: () => void;
  onBack?: () => void;
  showBack?: boolean;
};

export function ReadingPartThreeInformationScreen({
  content,
  answers,
  onSelectOption,
  timerScreenKey,
  onTimeExpire,
  metaText,
  onNext,
  onBack,
  showBack = true,
}: ReadingPartThreeInformationScreenProps) {
  const sections = content.passage.sections ?? [];

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
        passageLabel={
          content.passage.label ?? readingCopy.informationColumnLabel
        }
        passage={
          <div className={examReading.passage}>
            {content.passageInstruction ? (
              <p className={examReading.panelInstruction}>
                {content.passageInstruction}
              </p>
            ) : null}

            {sections.length > 0 ? (
              <div className={examReading.passageSections}>
                {sections.map((section) => (
                  <div key={section.label} className={examReading.passageSection}>
                    {/* The letter is content, not decoration: it is what
                        the statements on the right are answered with. It
                        is a heading for the paragraphs beside it, so it
                        is marked up as one rather than as a loose span. */}
                    <h3 className={examReading.passageSectionLabel}>
                      {section.label}
                    </h3>

                    <div className={examReading.passageSectionBody}>
                      {section.paragraphs.map((paragraph, index) => (
                        <p
                          // Paragraphs have no ids of their own and never
                          // reorder, so the index is the stable key here.
                          key={`${content.sectionId}-${section.label}-${index}`}
                          className={examReading.passageParagraph}
                        >
                          {paragraph}
                        </p>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : null}

            {/* Unlabelled prose beside the sections, if a part ever has
                both. Mock Test 1 Reading Part 3 has none, so this renders
                nothing. */}
            {content.passage.paragraphs.map((paragraph, index) => (
              <p
                key={`${content.sectionId}-paragraph-${index}`}
                className={examReading.passageParagraph}
              >
                {paragraph}
              </p>
            ))}
          </div>
        }
        questions={
          <ReadingPartThreeQuestionPanel
            content={content}
            answers={answers}
            onSelectOption={onSelectOption}
          />
        }
      />
    </ExamShell>
  );
}
