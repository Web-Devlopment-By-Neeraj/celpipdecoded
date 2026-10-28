import Link from "next/link";
import { AppCard } from "@/components/app/AppCard";
import { AppSectionHeader } from "@/components/app/AppSectionHeader";
import { PlanUpgradeButton } from "@/components/pricing/PlanUpgradeButton";
import { cx, focus, text } from "@/features/design/design-tokens";
import { MOCK_TESTS_HUB_PATH } from "@/features/mock-tests/mock-test-1-routes";

const SECTION_LABELS: Record<string, string> = {
  listening: "Listening",
  reading: "Reading",
  writing: "Writing",
  speaking: "Speaking",
};

export function MockTestComingSoon({
  mockNumber,
  section,
  unlocked,
}: {
  mockNumber: number;
  section?: string;
  unlocked: boolean;
}) {
  const sectionLabel = section ? SECTION_LABELS[section] : undefined;
  const title = sectionLabel
    ? `Mock Test ${mockNumber} — ${sectionLabel}`
    : `Mock Test ${mockNumber}`;

  return (
    <div className="w-full">
      <AppSectionHeader
        title={title}
        description={
          unlocked
            ? "This test is on your plan. The questions are not published yet."
            : "This test unlocks with Test Sprint."
        }
        action={
          <Link
            href={MOCK_TESTS_HUB_PATH}
            className={cx(
              "text-sm font-semibold text-brand underline-offset-2 hover:underline",
              focus.ring,
            )}
          >
            All mock tests
          </Link>
        }
      />

      <AppCard as="article" className="mt-6">
        {unlocked ? (
          <p className={cx("text-sm leading-6", text.secondary)}>
            Coming soon. Mock Test {mockNumber}
            {sectionLabel ? ` (${sectionLabel})` : ""} will open here when it
            is ready. Your payment already covers it.
          </p>
        ) : (
          <div>
            <p className={cx("text-sm leading-6", text.secondary)}>
              Mock Test {mockNumber} is included with Test Sprint. Choose a
              plan to unlock it.
            </p>
            <PlanUpgradeButton productCode="sprint" label="Unlock mock tests" />
          </div>
        )}
      </AppCard>
    </div>
  );
}
