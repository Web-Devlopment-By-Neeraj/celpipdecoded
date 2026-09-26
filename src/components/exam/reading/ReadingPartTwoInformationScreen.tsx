"use client";

import { ExamShell } from "../ExamShell";
import {
  MockTestMediaFrame,
  mockTestMediaImageTallClass,
} from "../player/MockTestMediaFrame";
import { ExamCountdownTimer } from "../timer/ExamCountdownTimer";
import { ReadingPartTwoQuestionPanel } from "./ReadingPartTwoQuestionPanel";
import { ReadingTwoColumnLayout } from "./ReadingTwoColumnLayout";
import { examReading } from "@/features/exam-engine/exam-theme";
import { readingCopy } from "@/features/exam-engine/reading-copy";
import type {
  ReadingAnswerMap,
  ReadingPartContent,
} from "@/features/exam-engine/reading-types";

// The Reading Part 2 split screen (EXAM-18).
//
// Screen type 8 from docs/product/exam-engine-screen-types.md, in its
// diagram variant, and the only working screen this part has:
//
// - grey top bar with a live countdown for the whole part
// - white exam canvas filled edge to edge by one divided work area
// - the course brochure on the left, own scrollbar
// - the email and the three questions on the right, own scrollbar, on the
//   light blue answer wash
// - blue Next in the top bar, Back in the bottom bar
//
// It is a sibling of ReadingCorrespondenceScreen rather than a branch
// inside it. The two share everything structural, ReadingTwoColumnLayout
// and the shell and the timer, and differ in exactly one thing: what the
// left column holds. Reading Part 1's left column is a letter, and this
// one's is a picture with no prose beside it at all, which is a different
// enough thing to render that folding both into one component would mean
// a screen with two mutually exclusive halves and a flag choosing between
// them. ReadingTwoColumnLayout is where the sharing happens, and it
// already anticipated this: its own note says Part 2 is the diagram
// variant and needs nothing from it that Part 1 does not.
//
// The picture is a plain img rather than next/image, for the reason
// ListeningScenarioScreen records: the file is a remote Cloudinary asset,
// so next/image would need an images.remotePatterns entry in
// next.config.ts and would route licensed practice test artwork through
// the Next image optimizer. A plain element keeps both out of scope.
//
// Two things keep the picture behaving inside the exam canvas. Its
// intrinsic width and height go on the element, so the browser reserves
// the right box from the ratio and the question column does not jump when
// the file arrives. And the class recipe sets the width and leaves the
// height automatic, so the brochure fills its column, keeps its shape,
// and scrolls inside the column rather than being squashed to fit or
// pushing the page.
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

export type ReadingPartTwoInformationScreenProps = {
  content: ReadingPartContent;
  answers: ReadingAnswerMap;
  onSelectOption: (questionId: string, optionId: string) => void;
  // What the countdown resets on. Pass the flow screen id, so the window
  // belongs to the screen and no selection made on it starts a new one.
  timerScreenKey?: string;
  // Fired once when the window reaches zero. Nothing passes one in
  // EXAM-18.
  onTimeExpire?: () => void;
  metaText?: string;
  onNext?: () => void;
  onBack?: () => void;
  showBack?: boolean;
};

export function ReadingPartTwoInformationScreen({
  content,
  answers,
  onSelectOption,
  timerScreenKey,
  onTimeExpire,
  metaText,
  onNext,
  onBack,
  showBack = true,
}: ReadingPartTwoInformationScreenProps) {
  const { image } = content.passage;

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
        passageLabel={content.passage.label ?? readingCopy.diagramColumnLabel}
        passage={
          <div className={examReading.passage}>
            {content.passageInstruction ? (
              <p className={examReading.panelInstruction}>
                {content.passageInstruction}
              </p>
            ) : null}

            {/* The shared player media frame (EXAM-UI-02), on its tall
                setting: here the picture is the passage rather than a
                prompt beside one, so it takes a larger share of the
                screen, and the passage column scrolls if the brochure is
                taller than the cap. */}
            {image ? (
              <MockTestMediaFrame caption={image.caption} tall>
                {/* eslint-disable-next-line @next/next/no-img-element --
                    remote Cloudinary asset, see the note at the top of
                    this file. */}
                <img
                  src={image.url}
                  alt={image.alt}
                  width={image.width}
                  height={image.height}
                  className={mockTestMediaImageTallClass}
                  // The diagram is the passage, so it is not deferred:
                  // this screen is unusable until it is on the page.
                  decoding="async"
                />
              </MockTestMediaFrame>
            ) : null}

            {/* Prose beside the diagram, if a part ever has both. Mock
                Test 1 Reading Part 2 has none, so this renders nothing. */}
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
          <ReadingPartTwoQuestionPanel
            content={content}
            answers={answers}
            onSelectOption={onSelectOption}
          />
        }
      />
    </ExamShell>
  );
}
