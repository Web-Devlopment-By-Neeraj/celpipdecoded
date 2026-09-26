import type { ReactNode } from "react";
import { ExamInstructionList } from "./ExamInstructionList";
import { ExamInstructionRow } from "./ExamInstructionRow";
import { ExamShell } from "./ExamShell";
import { examCopy } from "@/features/exam-engine/exam-copy";
import { examScreenBody } from "@/features/exam-engine/exam-theme";
import { playerInstruction } from "@/features/exam-engine/mock-test-player-theme";
import type {
  ExamTimerReading,
  ExamTimerState,
} from "@/features/exam-engine/exam-shell-types";
import type { ExamInstruction } from "@/features/exam-engine/instruction-screen-types";

// Instructional text screen (EXAM-02).
//
// Screen type 1 in docs/product/exam-engine-screen-types.md, used for the
// section instructions and for every part heading screen.
//
// The body is compact by design: an information row, a bulleted list, an
// optional quiet notice, and nothing else. No marketing card, no artwork,
// no badge. The EXAM-01 shell owns the title bar, the timer slot, and the
// Next and Back controls.
//
// A timer is optional and almost always absent. Instruction screens carry
// no countdown in the reference layouts, but the props are here so a
// timed instruction screen does not need a second component.
//
// Pass children to add anything the list cannot express, for example a
// section intro card or a table. It renders under the notice.
//
// This component holds no state, so it works inside a server component
// that only navigates through hrefs, and inside a client component that
// passes onNext and onBack handlers.

export type ExamInstructionScreenProps = {
  // Top bar title, for example
  // "CELPIP Decoded practice test - Listening test instructions".
  title: string;
  // Sentence under the instructions heading.
  subtitle?: string;
  // Overrides the bold "Instructions:" lead line.
  heading?: string;
  instructions?: ExamInstruction[];
  // Quiet note under the list, for example the practice estimate
  // disclaimer.
  noticeText?: string;
  // Small note in the top bar beside the timer slot.
  metaText?: string;
  // Block above the instructions, normally an ExamSectionIntroCard.
  intro?: ReactNode;

  // Timer, optional. Single reading, or a list for the speaking pair.
  timerLabel?: string;
  timerValue?: string;
  timerState?: ExamTimerState;
  timers?: ExamTimerReading[];

  showNext?: boolean;
  nextLabel?: string;
  nextHref?: string;
  onNext?: () => void;
  nextDisabled?: boolean;

  showBack?: boolean;
  backLabel?: string;
  backHref?: string;
  onBack?: () => void;

  // Optional action on the right of the bottom bar.
  secondaryAction?: ReactNode;
  // "Continue when you are ready", shown under the body. Off by default
  // since the reference pass: the Next control is in the top bar of every
  // screen in the test, so a line telling a learner it is there is the
  // sort of hand holding that stops a test window reading as one.
  showContinueHint?: boolean;
  children?: ReactNode;
  className?: string;
};

export function ExamInstructionScreen({
  title,
  subtitle,
  heading = examCopy.instructionsHeading,
  instructions = [],
  noticeText,
  metaText,
  intro,
  timerLabel,
  timerValue,
  timerState,
  timers,
  showNext = true,
  nextLabel,
  nextHref,
  onNext,
  nextDisabled = false,
  showBack = true,
  backLabel,
  backHref,
  onBack,
  secondaryAction,
  showContinueHint = false,
  children,
  className,
}: ExamInstructionScreenProps) {
  const showHint = showContinueHint && showNext;

  return (
    <ExamShell
      title={title}
      metaText={metaText}
      timerLabel={timerLabel}
      timerValue={timerValue}
      timerState={timerState}
      timers={timers}
      showNext={showNext}
      nextLabel={nextLabel}
      nextHref={nextHref}
      onNext={onNext}
      nextDisabled={nextDisabled}
      showBack={showBack}
      backLabel={backLabel}
      backHref={backHref}
      onBack={onBack}
      secondaryAction={secondaryAction}
      className={className}
    >
      {/* Capped rather than run to the full width of the window. An
          instructions screen is prose with rules under it, and a rule
          drawn across 1100 pixels reads as a table border (reference
          pass). */}
      <div className={playerInstruction.body}>
        {intro}

        {heading || subtitle ? (
          <ExamInstructionRow heading={heading} text={subtitle} />
        ) : null}

        <ExamInstructionList items={instructions} />

        {noticeText ? (
          <p className={examScreenBody.notice}>{noticeText}</p>
        ) : null}

        {children}

        {showHint ? (
          <p className={examScreenBody.hint}>
            {examCopy.continueWhenReadyLabel}
          </p>
        ) : null}
      </div>
    </ExamShell>
  );
}
