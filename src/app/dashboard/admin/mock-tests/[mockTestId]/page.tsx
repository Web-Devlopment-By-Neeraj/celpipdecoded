import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AppButtonLink } from "@/components/app/AppButtonLink";
import { AppCard } from "@/components/app/AppCard";
import { AppStatusBadge } from "@/components/app/AppStatusBadge";
import { AdminAccessDenied } from "@/components/admin/mock-tests/AdminAccessDenied";
import { AdminPageHeader } from "@/components/admin/mock-tests/AdminPageHeader";
import { MockTestForm } from "@/components/admin/mock-tests/MockTestForm";
import { MockTestSectionList } from "@/components/admin/mock-tests/MockTestSectionList";
import { ValidateStructureButton } from "@/components/admin/mock-tests/ValidateStructureButton";
import { cx, text } from "@/features/design/design-tokens";
import { getMockTestStructure } from "@/features/admin/mock-test-queries";
import {
  MOCK_TEST_STATUS_LABELS,
  MOCK_TEST_STATUS_TONES,
  isUuid,
} from "@/features/admin/mock-test-types";
import { getAdminSession } from "@/lib/admin/require-admin";
import {
  updateMockTest,
  updateMockTestPart,
  updateMockTestSection,
  validateMockTestStructure,
} from "../actions";

export const metadata: Metadata = {
  title: "Edit practice test - CELPIP Decoded",
  description: "Edit a practice test in the staff builder.",
  robots: { index: false, follow: false },
};

// Edit one practice test: its details, its sections, and the parts
// inside each section.
//
// Sections and parts are edited in place through disclosures rather than
// on their own routes. Adding is a route, because an add form starts
// empty and benefits from a screen of its own. Editing is not, because
// the thing being edited is already on screen.
export default async function AdminMockTestDetailPage({
  params,
}: {
  params: Promise<{ mockTestId: string }>;
}) {
  const { mockTestId } = await params;

  // A route parameter is untrusted. Reject anything that is not a uuid
  // before it reaches the database, so a bad URL is a 404 rather than a
  // Postgres type error on screen.
  if (!isUuid(mockTestId)) {
    notFound();
  }

  const admin = await getAdminSession();

  if (!admin.ok) {
    return <AdminAccessDenied reason={admin.reason} />;
  }

  const structure = await getMockTestStructure(admin.session, mockTestId);

  if (!structure) {
    notFound();
  }

  const { test, sections } = structure;
  const addSectionHref = `/dashboard/admin/mock-tests/${mockTestId}/sections/new`;
  const allSkillsUsed = sections.length >= 4;

  return (
    <div className="space-y-8">
      <AdminPageHeader
        title={test.title}
        description="Edit the basic details, then build the structure section by section."
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Mock test builder", href: "/dashboard/admin/mock-tests" },
          { label: test.title },
        ]}
        action={
          <>
            <AppButtonLink
              href={`/dashboard/admin/mock-tests/${mockTestId}/preview`}
              variant="secondary"
              size="sm"
            >
              Preview structure
            </AppButtonLink>
            {allSkillsUsed ? null : (
              <AppButtonLink href={addSectionHref} size="sm">
                Add section
              </AppButtonLink>
            )}
          </>
        }
      >
        <div className="flex flex-wrap items-center gap-3">
          <AppStatusBadge tone={MOCK_TEST_STATUS_TONES[test.status]} withDot>
            {MOCK_TEST_STATUS_LABELS[test.status]}
          </AppStatusBadge>
          <span className={cx("font-mono text-xs", text.muted)}>
            {test.slug} - v{test.version}
          </span>
        </div>
      </AdminPageHeader>

      <AppCard as="section" ariaLabel="Practice test details">
        <h2 className={cx(text.heading, "text-lg")}>Details</h2>
        <p className={cx("mt-2 max-w-2xl text-sm leading-6", text.secondary)}>
          Moving a practice test out of draft runs the structure checks
          first, and is refused while any problem is open. Publishing is
          not available in this version of the builder.
        </p>

        <div className="mt-6">
          <MockTestForm
            mode="edit"
            mockTest={test}
            action={updateMockTest}
            cancelHref="/dashboard/admin/mock-tests"
          />
        </div>
      </AppCard>

      <section aria-label="Sections" className="space-y-5">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className={cx(text.heading, "text-lg")}>Sections and parts</h2>
            <p className={cx("mt-1 text-sm leading-6", text.secondary)}>
              {allSkillsUsed
                ? "All four skills are on this practice test."
                : "A practice test normally has Listening, Reading, Writing and Speaking."}
            </p>
          </div>

          <ValidateStructureButton
            mockTestId={mockTestId}
            action={validateMockTestStructure}
          />
        </div>

        <MockTestSectionList
          mockTestId={mockTestId}
          sections={sections}
          addSectionHref={addSectionHref}
          updateSectionAction={updateMockTestSection}
          updatePartAction={updateMockTestPart}
        />
      </section>
    </div>
  );
}
