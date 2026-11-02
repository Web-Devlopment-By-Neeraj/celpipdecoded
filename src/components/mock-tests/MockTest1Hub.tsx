import { AppSectionHeader } from "@/components/app/AppSectionHeader";
import { AppStatusBadge } from "@/components/app/AppStatusBadge";
import { MockTest1PracticeButtons } from "@/components/mock-tests/MockTest1PracticeButtons";
import { MockTestDetails } from "@/components/mock-tests/MockTestDetails";
import { cx, focus } from "@/features/design/design-tokens";
import { MOCK_TESTS_HUB_PATH } from "@/features/mock-tests/mock-test-1-routes";
import Link from "next/link";

export function MockTest1Hub() {
  return (
    <div className="w-full">
      <AppSectionHeader
        title="Mock Test 1"
        description="All four sections · about 2 hours 40 minutes"
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

      <MockTestDetails
        badge={
          <AppStatusBadge tone="success" className="shrink-0">
            Free
          </AppStatusBadge>
        }
        start={<MockTest1PracticeButtons />}
      />
    </div>
  );
}
