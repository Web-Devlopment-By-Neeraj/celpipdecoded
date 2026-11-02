"use client";

import { ExamInstructionRow } from "../ExamInstructionRow";
import { ExamShell } from "../ExamShell";
import { ExamCountdownTimer } from "../timer/ExamCountdownTimer";
import { examScreenBody } from "@/features/exam-engine/exam-theme";
import { listeningCopy } from "@/features/exam-engine/listening-copy";

const PREPARATION_PAUSE_SECONDS = 10;

export type ListeningSectionBreakScreenProps = {
  title: string;
  message: string;
  sectionLabel?: string;
  screenKey: string;
  metaText?: string;
  onTimeExpire?: () => void;
  onNext?: () => void;
  onBack?: () => void;
  showBack?: boolean;
};

export function ListeningSectionBreakScreen({
  title,
  message,
  sectionLabel,
  screenKey,
  metaText,
  onTimeExpire,
  onNext,
  onBack,
  showBack = true,
}: ListeningSectionBreakScreenProps) {
  return (
    <ExamShell
      title={title}
      metaText={metaText}
      timerSlot={
        <ExamCountdownTimer
          screenKey={screenKey}
          durationSeconds={PREPARATION_PAUSE_SECONDS}
          onExpire={onTimeExpire}
        />
      }
      onNext={onNext}
      onBack={onBack}
      showBack={showBack}
    >
      <div className={examScreenBody.stack}>
        <ExamInstructionRow
          heading={sectionLabel ?? listeningCopy.sectionBreakHeading}
          text={message}
        />
      </div>
    </ExamShell>
  );
}
