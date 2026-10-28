import { AppCard } from "@/components/app/AppCard";
import { AppSectionHeader } from "@/components/app/AppSectionHeader";
import { AppStatusBadge } from "@/components/app/AppStatusBadge";
import { MockTest1PracticeButtons } from "@/components/mock-tests/MockTest1PracticeButtons";
import { MockTestLockedPracticeButtons } from "@/components/mock-tests/MockTestLockedPracticeButtons";
import { MockTestUnlockedPracticeButtons } from "@/components/mock-tests/MockTestUnlockedPracticeButtons";
import { cx, text } from "@/features/design/design-tokens";

const EXTRA_MOCKS = [2, 3, 4, 5] as const;

export function MockTestsHub({ mocksUnlocked }: { mocksUnlocked: boolean }) {
  return (
    <div className="w-full">
      <AppSectionHeader
        title="Mock tests"
        description={
          mocksUnlocked
            ? "Sit a full mock or practice one section at a time."
            : "Sit a full mock or practice one section at a time. Mock Test 1 is free."
        }
      />

      <div className="mt-6 space-y-5" aria-label="Mock test list">
        <AppCard as="article">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <h2 className={cx(text.heading, "text-xl")}>Mock Test 1</h2>
              <p className={cx("mt-2 text-sm leading-6", text.secondary)}>
                {mocksUnlocked
                  ? "Full mock first, then any single section."
                  : "Free. Full mock first, then any single section."}
              </p>
            </div>
            {mocksUnlocked ? null : (
              <AppStatusBadge tone="success" className="shrink-0">
                Free
              </AppStatusBadge>
            )}
          </div>

          <div className="mt-6">
            <MockTest1PracticeButtons />
          </div>
        </AppCard>

        {EXTRA_MOCKS.map((number) => (
          <AppCard key={number} as="article">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <h2 className={cx(text.heading, "text-xl")}>
                  Mock Test {number}
                </h2>
                <p className={cx("mt-2 text-sm leading-6", text.secondary)}>
                  {mocksUnlocked
                    ? "Included with your Test Sprint. Content is coming soon."
                    : "Included with Test Sprint. Tap any option to see the plan and pay."}
                </p>
              </div>
              {mocksUnlocked ? null : (
                <AppStatusBadge tone="neutral" className="shrink-0">
                  Locked
                </AppStatusBadge>
              )}
            </div>

            <div className="mt-6">
              {mocksUnlocked ? (
                <MockTestUnlockedPracticeButtons mockNumber={number} />
              ) : (
                <MockTestLockedPracticeButtons productCode="sprint" />
              )}
            </div>
          </AppCard>
        ))}
      </div>
    </div>
  );
}
