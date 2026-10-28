"use client";

import { PlanUpgradeDialog } from "@/components/pricing/PlanUpgradeDialog";
import { cx } from "@/features/design/design-tokens";
import { MOCK_TEST_1_SECTION_BUTTONS } from "@/features/mock-tests/mock-test-section-buttons";
import {
  MockTestPracticeButtonRow,
  mockTestRowButtonClass,
} from "@/components/mock-tests/MockTestPracticeButtonRow";
import { useState } from "react";

/** Same row as Mock Test 1. Every button opens the Test Sprint upgrade dialog. */
export function MockTestLockedPracticeButtons({
  productCode = "sprint",
}: {
  productCode?: string;
}) {
  const [open, setOpen] = useState(false);
  const [dialogKey, setDialogKey] = useState(0);

  function openUpgrade() {
    setDialogKey((value) => value + 1);
    setOpen(true);
  }

  return (
    <>
      <MockTestPracticeButtonRow
        fullMock={
          <button
            type="button"
            onClick={openUpgrade}
            className={cx(
              mockTestRowButtonClass,
              "bg-academy-navy text-white shadow-sm hover:bg-academy-navy-dark",
            )}
          >
            Full mock test
          </button>
        }
        sections={MOCK_TEST_1_SECTION_BUTTONS.map((section) => (
          <button
            key={section.key}
            type="button"
            onClick={openUpgrade}
            className={cx(mockTestRowButtonClass, section.buttonClassName)}
            aria-label={`${section.label}. Unlock with a plan`}
          >
            {section.label}
          </button>
        ))}
      />

      <PlanUpgradeDialog
        key={dialogKey}
        open={open}
        productCode={productCode}
        onClose={() => setOpen(false)}
      />
    </>
  );
}
