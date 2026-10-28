import { AppCard } from "@/components/app/AppCard";
import { AppSectionHeader } from "@/components/app/AppSectionHeader";
import { AppStatusBadge } from "@/components/app/AppStatusBadge";
import { MockTest1PracticeButtons } from "@/components/mock-tests/MockTest1PracticeButtons";
import { cx, focus, text } from "@/features/design/design-tokens";
import { MOCK_TESTS_HUB_PATH } from "@/features/mock-tests/mock-test-1-routes";
import Link from "next/link";

export function MockTest1Hub() {
  return (
    <div className="w-full">
      <AppSectionHeader
        title="Mock Test 1"
        description="Your free mock test. Full run first, or practice one section."
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
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className={cx(text.heading, "text-xl")}>Choose how to practice</h2>
            <p className={cx("mt-2 text-sm leading-6", text.secondary)}>
              Full mock runs all four skills in order. Section buttons open
              Listening, Reading, Writing, or Speaking only.
            </p>
          </div>
          <AppStatusBadge tone="success" className="shrink-0">
            Free
          </AppStatusBadge>
        </div>
        <div className="mt-6">
          <MockTest1PracticeButtons />
        </div>
      </AppCard>
    </div>
  );
}
