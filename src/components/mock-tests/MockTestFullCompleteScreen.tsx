"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { ExamButton } from "@/components/exam/ExamButton";
import { ExamInstructionRow } from "@/components/exam/ExamInstructionRow";
import { ExamShell } from "@/components/exam/ExamShell";
import { PlanUpgradeDialog } from "@/components/pricing/PlanUpgradeDialog";
import { examScreenBody, examText } from "@/features/exam-engine/exam-theme";
import { MOCK_TEST_1_HUB_PATH } from "@/features/mock-tests/mock-test-1-routes";
import {
  markMockTestFullRunComplete,
  readMockTestFullResults,
  type MockTestFullSectionResult,
} from "@/features/mock-tests/mock-test-flow";

const EMPTY_SECTIONS: MockTestFullSectionResult[] = [];
let sectionSnapshot: MockTestFullSectionResult[] = EMPTY_SECTIONS;

function subscribeToFullResults() {
  return () => {};
}

function readFullResultSections(): MockTestFullSectionResult[] {
  const next = readMockTestFullResults().sections;
  if (
    next.length === sectionSnapshot.length &&
    next.every(
      (row, index) =>
        row.label === sectionSnapshot[index]?.label &&
        row.detail === sectionSnapshot[index]?.detail,
    )
  ) {
    return sectionSnapshot;
  }
  sectionSnapshot = next;
  return sectionSnapshot;
}

export type MockTestFullCompleteScreenProps = {
  title: string;
  metaText?: string;
  exitHref?: string;
};

export function MockTestFullCompleteScreen({
  title,
  metaText,
  exitHref = MOCK_TEST_1_HUB_PATH,
}: MockTestFullCompleteScreenProps) {
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const sections = useSyncExternalStore(
    subscribeToFullResults,
    readFullResultSections,
    () => EMPTY_SECTIONS,
  );

  useEffect(() => {
    markMockTestFullRunComplete();
  }, []);

  return (
    <>
      <ExamShell
        title={title}
        metaText={metaText}
        showNext={false}
        showBack
        backHref={exitHref}
        backLabel="Back to mock test"
      >
        <div className={examScreenBody.stack}>
          <ExamInstructionRow
            heading="Mock Test 1 complete"
            text="You finished all four sections in one run. Section results from this visit are summarized below."
          />

          {sections.length > 0 ? (
            <ul className={examText.muted}>
              {sections.map((row) => (
                <li key={row.label} className="text-sm leading-6">
                  <span className="font-semibold text-foreground">
                    {row.label}
                  </span>
                  {row.detail ? ` — ${row.detail}` : null}
                </li>
              ))}
            </ul>
          ) : (
            <p className={examScreenBody.hint}>
              Section summaries appear here when scoring data is available
              from each skill.
            </p>
          )}

          <div className={examScreenBody.actions}>
            <ExamButton variant="primary" size="md" href={exitHref}>
              Back to Mock Test 1
            </ExamButton>
            <ExamButton
              variant="secondary"
              size="md"
              uppercase={false}
              onClick={() => setUpgradeOpen(true)}
            >
              Move to next mock test
            </ExamButton>
          </div>

          <p className={examScreenBody.notice}>
            Mock Test 2 and later tests require a paid plan. Practice scores
            are estimates, not official CELPIP results.
          </p>
        </div>
      </ExamShell>

      <PlanUpgradeDialog
        open={upgradeOpen}
        productCode="sprint"
        onClose={() => setUpgradeOpen(false)}
      />
    </>
  );
}
