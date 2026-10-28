"use client";

import { PlanUpgradeButton } from "@/components/pricing/PlanUpgradeButton";
import { buttonBase, buttonSizes, cx } from "@/features/design/design-tokens";

/** Locked mock: same label as a real full mock, opens plan upgrade dialog. */
export function MockTestLockedFullMockButton({
  productCode = "sprint",
}: {
  productCode?: string;
}) {
  return (
    <PlanUpgradeButton
      productCode={productCode}
      label="Full mock test"
      withTopMargin={false}
      className={cx(
        buttonBase,
        buttonSizes.md,
        "w-full justify-center bg-academy-navy text-white hover:bg-academy-navy-dark",
      )}
    />
  );
}
