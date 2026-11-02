"use client";

import { ExamCountdownTimer } from "./ExamCountdownTimer";

const INSTRUCTION_SECONDS = 30;

export function ExamInstructionCountdown({
  screenKey,
  onExpire,
}: {
  screenKey: string;
  onExpire?: () => void;
}) {
  return (
    <ExamCountdownTimer
      screenKey={screenKey}
      durationSeconds={INSTRUCTION_SECONDS}
      onExpire={onExpire}
    />
  );
}
