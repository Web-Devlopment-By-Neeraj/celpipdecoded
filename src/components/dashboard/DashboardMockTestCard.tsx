import { AppButtonLink } from "@/components/app/AppButtonLink";
import { AppCard } from "@/components/app/AppCard";
import { AppSectionHeader } from "@/components/app/AppSectionHeader";
import { cx, text } from "@/features/design/design-tokens";
import { listeningCopy } from "@/features/exam-engine/listening-copy";
import { MockAttemptNote } from "@/components/mock-tests/MockAttemptNote";
import {
  MOCK_TEST_1_HUB_PATH,
  MOCK_TESTS_HUB_PATH,
} from "@/features/mock-tests/mock-test-1-routes";
import {
  mockResultsHref,
  sectionLabel,
  type MockRunView,
} from "@/features/mock-tests/mock-run";
import Link from "next/link";

const DASHBOARD_MOCKS = [
  {
    number: 1,
    href: MOCK_TEST_1_HUB_PATH,
    description: "Full mock or one section. Listening, Reading, Writing, Speaking.",
  },
  {
    number: 2,
    href: "/dashboard/mock-tests/mock-test-2",
    description: "Full mock or one section.",
  },
  {
    number: 3,
    href: "/dashboard/mock-tests/mock-test-3",
    description: "Full mock or one section.",
  },
  {
    number: 4,
    href: "/dashboard/mock-tests/mock-test-4",
    description: "Full mock or one section.",
  },
] as const;

export function DashboardMockTestCard({ runs = [] }: { runs?: MockRunView[] }) {
  const latest = runs.find((run) => run.status === "submitted");

  return (
    <section aria-label={listeningCopy.mockTestsHeading}>
      <AppSectionHeader
        title={listeningCopy.mockTestsHeading}
        description="Choose a mock test, or open the full list."
      />

      {latest ? (
        <p className={cx("mt-4 text-sm leading-6", text.secondary)}>
          Latest result: {sectionLabel(latest.section)}
          {latest.summary ? ` · ${latest.summary.detail}` : ""}.{" "}
          <Link href={mockResultsHref(latest.slug)} className="font-semibold text-academy-navy underline-offset-2 hover:underline">
            See full results
          </Link>
        </p>
      ) : null}

      <div className="mt-3">
        <MockAttemptNote runs={runs} slug="mock-test-1" />
      </div>

      <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2">
        {DASHBOARD_MOCKS.map((mock) => (
          <AppCard
            key={mock.number}
            as="article"
            padding="compact"
            className="flex flex-col"
          >
            <h3 className={cx(text.heading, "text-lg")}>
              Mock Test {mock.number}
            </h3>
            <p className={cx("mt-3 text-sm leading-6", text.secondary)}>
              {mock.description}
            </p>
            <div className="mt-auto pt-5">
              <AppButtonLink href={mock.href} size="md">
                Open Mock Test {mock.number}
              </AppButtonLink>
            </div>
          </AppCard>
        ))}
      </div>

      <div className="mt-5">
        <AppButtonLink href={MOCK_TESTS_HUB_PATH} variant="secondary" size="md">
          Go to all mock tests
        </AppButtonLink>
      </div>
    </section>
  );
}
