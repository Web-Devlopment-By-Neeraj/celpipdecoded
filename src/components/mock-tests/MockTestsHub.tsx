import type { ReactNode } from "react";
import Link from "next/link";
import { AppCard } from "@/components/app/AppCard";
import { AppSectionHeader } from "@/components/app/AppSectionHeader";
import { AppStatusBadge } from "@/components/app/AppStatusBadge";
import { cx, focus, text } from "@/features/design/design-tokens";
import { MOCK_TEST_1_HUB_PATH } from "@/features/mock-tests/mock-test-1-routes";
import {
  buildMockTestHub,
  learnerMockPath,
  type LearnerMockTestSummary,
} from "@/features/mock-tests/published-mock-catalog";

export function MockTestsHub({
  mocksUnlocked,
  published,
}: {
  mocksUnlocked: boolean;
  published: LearnerMockTestSummary[];
}) {
  const entries = buildMockTestHub(published);
  return (
    <div className="w-full">
      <AppSectionHeader
        title="Mock tests"
        description="Take a full mock test for the real exam experience, or practice one section at a time at your own pace."
      />

      <div className="mt-6 space-y-5" aria-label="Mock test list">
        <MockTestListCard
          href={MOCK_TEST_1_HUB_PATH}
          title="Mock Test 1"
          description={
            mocksUnlocked
              ? "Open this test, then choose the complete test or one section."
              : "Free. Open this test, then choose the complete test or one section."
          }
          badge={
            mocksUnlocked ? null : (
              <AppStatusBadge tone="success" className="shrink-0">
                Free
              </AppStatusBadge>
            )
          }
        />

        {entries.map((entry) => {
          if (entry.kind === "placeholder") {
            const number = entry.slot;

            return (
              <MockTestListCard
                key={`placeholder-${number}`}
                href={`/dashboard/mock-tests/mock-test-${number}`}
                title={`Mock Test ${number}`}
                description={
                  mocksUnlocked
                    ? "Coming soon."
                    : "Included with Test Sprint. Open this test to see the plan."
                }
                badge={
                  mocksUnlocked ? null : (
                    <AppStatusBadge tone="neutral" className="shrink-0">
                      Locked
                    </AppStatusBadge>
                  )
                }
              />
            );
          }

          const { test } = entry;

          return (
            <MockTestListCard
              key={test.slug}
              href={learnerMockPath(test.slug)}
              title={test.title}
              description={
                mocksUnlocked
                  ? "Open this test, then choose the complete test or one section."
                  : "Included with Test Sprint. Open this test to see the plan."
              }
              badge={
                mocksUnlocked ? null : (
                  <AppStatusBadge tone="neutral" className="shrink-0">
                    Locked
                  </AppStatusBadge>
                )
              }
            />
          );
        })}
      </div>
    </div>
  );
}

function MockTestListCard({
  href,
  title,
  description,
  badge,
}: {
  href: string;
  title: string;
  description: string;
  badge: ReactNode;
}) {
  return (
    <Link href={href} className={cx("block rounded-sm", focus.ring)}>
      <AppCard as="article">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 className={cx(text.heading, "text-xl")}>{title}</h2>
            <p className={cx("mt-2 text-sm leading-6", text.secondary)}>
              {description}
            </p>
          </div>
          {badge}
        </div>
      </AppCard>
    </Link>
  );
}
