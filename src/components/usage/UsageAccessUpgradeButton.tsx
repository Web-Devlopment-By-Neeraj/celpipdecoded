"use client";

import { PlanUpgradeButton } from "@/components/pricing/PlanUpgradeButton";

export function UsageAccessUpgradeButton() {
  return (
    <PlanUpgradeButton
      productCode="sprint"
      label="Choose a plan"
      withTopMargin={false}
      className="mt-4 inline-flex h-10 items-center rounded-full bg-brand px-4 text-sm font-semibold text-white"
    />
  );
}
