import type { Metadata } from "next";
import { AppButtonLink } from "@/components/app/AppButtonLink";
import { AppCard } from "@/components/app/AppCard";
import { AdminAccessDenied } from "@/components/admin/mock-tests/AdminAccessDenied";
import { AdminMockTestList } from "@/components/admin/mock-tests/AdminMockTestList";
import { AdminPageHeader } from "@/components/admin/mock-tests/AdminPageHeader";
import { cx, text } from "@/features/design/design-tokens";
import { listMockTests } from "@/features/admin/mock-test-queries";
import { getAdminSession } from "@/lib/admin/require-admin";

export const metadata: Metadata = {
  title: "Mock test builder - CELPIP Decoded",
  description: "Staff tool for building CELPIP practice tests.",
  robots: { index: false, follow: false },
};

// ADMIN-01: the mock test builder home screen.
//
// The dashboard layout already requires a session. This page requires
// more than that: the signed in email has to be on the ADMIN_EMAILS
// allow list. The check runs here rather than in a layout, because a
// layout does not re-render on client navigation and an authorization
// check has to sit next to the data it protects.
export default async function AdminMockTestsPage() {
  const admin = await getAdminSession();

  if (!admin.ok) {
    return <AdminAccessDenied reason={admin.reason} />;
  }

  const mockTests = await listMockTests(admin.session);

  return (
    <div className="space-y-8">
      <AdminPageHeader
        title="Mock test builder"
        description="Build CELPIP practice tests: sections, parts and timing. Everything here is staff only, and nothing built here is visible to students yet."
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Mock test builder" },
        ]}
        action={
          <AppButtonLink href="/dashboard/admin/mock-tests/new" size="sm">
            New practice test
          </AppButtonLink>
        }
      />

      <AdminMockTestList
        mockTests={mockTests}
        newHref="/dashboard/admin/mock-tests/new"
      />

      <AppCard variant="subtle" as="section" ariaLabel="What this builder does">
        <h2 className={cx(text.heading, "text-base")}>
          What this version of the builder does
        </h2>
        <ul
          className={cx(
            "mt-3 list-disc space-y-1.5 pl-5 text-sm leading-6",
            text.secondary,
          )}
        >
          <li>
            Create a practice test draft, and edit its title, slug,
            description, version, status and internal notes.
          </li>
          <li>
            Add Listening, Reading, Writing and Speaking sections, and add
            parts inside them with basic timing values.
          </li>
          <li>
            Preview the structure and run the structure checks.
          </li>
        </ul>

        <h2 className={cx(text.heading, "mt-6 text-base")}>
          What it does not do yet
        </h2>
        <ul
          className={cx(
            "mt-3 list-disc space-y-1.5 pl-5 text-sm leading-6",
            text.secondary,
          )}
        >
          <li>
            Questions, answer options and answer keys. Those arrive in
            ADMIN-02.
          </li>
          <li>Media links, timer rules, scoring rules and AI rubrics.</li>
          <li>
            Publishing. A practice test built here cannot reach a student,
            and the student dashboard still runs the existing Mock Test 1
            from its content files.
          </li>
        </ul>
      </AppCard>
    </div>
  );
}
