import Link from "next/link";
import { AppButtonLink } from "@/components/app/AppButtonLink";
import { AppCard } from "@/components/app/AppCard";
import { AppStatusBadge } from "@/components/app/AppStatusBadge";
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
  newHref: string;
};

export function AdminMockTestList({
  mockTests,
  newHref,
}: AdminMockTestListProps) {
  if (mockTests.length === 0) {
    return (
      <AppCard variant="subtle" ariaLabel="No practice tests yet" as="section">
        <h2 className={cx(text.heading, "text-lg")}>No practice tests yet</h2>
        <p className={cx("mt-2 max-w-xl text-sm leading-6", text.secondary)}>
          Create a draft to start building. A draft is invisible to
          students, and stays that way: nothing built here reaches the
          student dashboard in this version of the builder.
        </p>
        <div className="mt-5">
          <AppButtonLink href={newHref} size="sm">
            Create a practice test
          </AppButtonLink>
        </div>
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
                Checks
              </th>
              <th scope="col" className={headerCell}>
                Updated
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
                  <Link
                    href={`/dashboard/admin/mock-tests/${mockTest.id}`}
                    className={cx(
                      "font-semibold underline underline-offset-2 hover:no-underline",
                      text.accent,
                    )}
                  >
                    {mockTest.title}
                  </Link>
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

                <td className={bodyCell}>
                  <ChecksCell
                    errorCount={mockTest.openErrorCount}
                    warningCount={mockTest.openWarningCount}
                  />
                </td>

                <td className={cx(bodyCell, text.muted)}>
                  {formatDate(mockTest.updated_at)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AppCard>
  );
}

// The stored issue counts, which are only as fresh as the last run of
// the structure check. The wording says so rather than implying the row
// is live.
function ChecksCell({
  errorCount,
  warningCount,
}: {
  errorCount: number;
  warningCount: number;
}) {
  if (errorCount === 0 && warningCount === 0) {
    return <span className={text.muted}>Not checked</span>;
  }

  return (
    <span className="flex flex-wrap items-center gap-2">
      {errorCount > 0 ? (
        <AppStatusBadge tone="error">
          {errorCount} to fix
        </AppStatusBadge>
      ) : null}
      {warningCount > 0 ? (
        <AppStatusBadge tone="warning">
          {warningCount} warning{warningCount === 1 ? "" : "s"}
        </AppStatusBadge>
      ) : null}
    </span>
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
