import { AppCard } from "@/components/app/AppCard";
import { AppStatusBadge } from "@/components/app/AppStatusBadge";
import { MockTestPublishButton } from "@/components/admin/mock-tests/MockTestPublishButton";
import { cx, text } from "@/features/design/design-tokens";
import {
  MOCK_TEST_STATUS_LABELS,
  MOCK_TEST_STATUS_TONES,
} from "@/features/admin/mock-test-types";
import type { MockTestListItem } from "@/features/admin/mock-test-queries";

// The builder home screen: every practice test with its structure counts
// and its open validation issues.
//
// A server component. It renders rows it was handed and reads nothing,
// so the authorization check stays on the page that loads the data.

export type AdminMockTestListProps = {
  mockTests: MockTestListItem[];
};

export function AdminMockTestList({ mockTests }: AdminMockTestListProps) {
  if (mockTests.length === 0) {
    return (
      <AppCard variant="subtle" ariaLabel="No practice tests yet" as="section">
        <h2 className={cx(text.heading, "text-lg")}>No practice tests yet</h2>
        <p className={cx("mt-2 max-w-xl text-sm leading-6", text.secondary)}>
          Upload a content file to save a draft. Students cannot see a
          draft. Press Publish, with a slug such as mock-test-2, when you
          have looked at it.
        </p>
      </AppCard>
    );
  }

  return (
    <AppCard padding="none" as="section" ariaLabel="Practice tests">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[46rem] border-collapse text-left text-sm">
          <caption className="sr-only">
            Practice tests in the admin builder, most recently updated
            first.
          </caption>
          <thead>
            <tr className="border-b border-academy-line">
              <th scope="col" className={headerCell}>
                Title
              </th>
              <th scope="col" className={headerCell}>
                Status
              </th>
              <th scope="col" className={cx(headerCell, "text-right")}>
                Sections
              </th>
              <th scope="col" className={cx(headerCell, "text-right")}>
                Parts
              </th>
              <th scope="col" className={headerCell}>
                Updated
              </th>
              <th scope="col" className={headerCell}>
                Students
              </th>
            </tr>
          </thead>
          <tbody>
            {mockTests.map((mockTest) => (
              <tr
                key={mockTest.id}
                className="border-b border-academy-line/60 last:border-0"
              >
                <td className={bodyCell}>
                  <p className={cx("font-semibold", text.heading)}>{mockTest.title}</p>
                  <p className={cx("mt-1 font-mono text-xs", text.muted)}>
                    {mockTest.slug} - v{mockTest.version}
                  </p>
                </td>

                <td className={bodyCell}>
                  <AppStatusBadge
                    tone={MOCK_TEST_STATUS_TONES[mockTest.status]}
                    withDot
                  >
                    {MOCK_TEST_STATUS_LABELS[mockTest.status]}
                  </AppStatusBadge>
                </td>

                <td className={cx(bodyCell, "text-right tabular-nums")}>
                  {mockTest.sectionCount}
                </td>

                <td className={cx(bodyCell, "text-right tabular-nums")}>
                  {mockTest.partCount}
                </td>

                <td className={cx(bodyCell, text.muted)}>
                  {formatDate(mockTest.updated_at)}
                </td>
                <td className={bodyCell}>
                  <MockTestPublishButton id={mockTest.id} status={mockTest.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AppCard>
  );
}

const headerCell =
  "px-5 py-3 text-xs font-semibold uppercase tracking-wide text-academy-navy/60";

const bodyCell = "px-5 py-4 align-top";

// Fixed locale and time zone so the server and the browser render the
// same string and hydration does not warn.
function formatDate(value: string): string {
  return new Date(value).toLocaleDateString("en-CA", {
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}
