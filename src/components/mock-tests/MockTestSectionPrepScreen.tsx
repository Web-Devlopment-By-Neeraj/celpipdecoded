"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ExamButton } from "@/components/exam/ExamButton";
import { ExamInstructionRow } from "@/components/exam/ExamInstructionRow";
import { ExamShell } from "@/components/exam/ExamShell";
import { examScreenBody } from "@/features/exam-engine/exam-theme";
import { MOCK_TEST_FULL_PREP_SECONDS } from "@/features/mock-tests/mock-test-flow";

export type MockTestSectionPrepScreenProps = {
  title: string;
  completedSectionLabel: string;
  nextSectionLabel: string;
  nextHref: string;
  prepSeconds?: number;
  metaText?: string;
  exitHref?: string;
};

export function MockTestSectionPrepScreen({
  title,
  completedSectionLabel,
  nextSectionLabel,
  nextHref,
  prepSeconds = MOCK_TEST_FULL_PREP_SECONDS,
  metaText,
  exitHref,
}: MockTestSectionPrepScreenProps) {
  const router = useRouter();
  const [secondsLeft, setSecondsLeft] = useState(prepSeconds);

  useEffect(() => {
    if (secondsLeft <= 0) {
      router.push(nextHref);
      return;
    }
    const timer = window.setTimeout(() => {
      setSecondsLeft((value) => value - 1);
    }, 1000);
    return () => window.clearTimeout(timer);
  }, [secondsLeft, nextHref, router]);

  return (
    <ExamShell
      title={title}
      metaText={metaText}
      showNext={false}
      showBack={Boolean(exitHref)}
      backHref={exitHref}
      backLabel="Back to mock test"
    >
      <div className={examScreenBody.stack}>
        <ExamInstructionRow
          heading={`${completedSectionLabel} complete`}
          text={`Prepare for ${nextSectionLabel}. You can move on now or wait for the countdown.`}
        />

        <p className={examScreenBody.hint}>
          Next section in{" "}
          <span className="font-semibold tabular-nums">{secondsLeft}</span>s
        </p>

        <div className={examScreenBody.actions}>
          <ExamButton variant="primary" size="md" href={nextHref}>
            Move to next section
          </ExamButton>
        </div>
      </div>
    </ExamShell>
  );
}
