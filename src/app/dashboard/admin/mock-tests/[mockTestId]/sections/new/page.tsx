import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AppCard } from "@/components/app/AppCard";
import { AdminAccessDenied } from "@/components/admin/mock-tests/AdminAccessDenied";
import { AdminPageHeader } from "@/components/admin/mock-tests/AdminPageHeader";
import { MockTestSectionForm } from "@/components/admin/mock-tests/MockTestSectionForm";
import { cx, text } from "@/features/design/design-tokens";
import {
  getMockTestStructure,
} from "@/features/admin/mock-test-queries";
import { isUuid } from "@/features/admin/mock-test-types";
import { getAdminSession } from "@/lib/admin/require-admin";
import { createMockTestSection } from "../../../actions";

export const metadata: Metadata = {
  title: "Add a section - CELPIP Decoded",
  description: "Add a skill section to a practice test in the staff builder.",
  robots: { index: false, follow: false },
};

// Add one skill section to a practice test.
//
// The form needs to know which skills are already taken, because a test
// holds one section per skill, and it suggests the next order number so
// a staff member adding four sections in a row never types one.
export default async function NewMockTestSectionPage({
  params,
}: {
  params: Promise<{ mockTestId: string }>;
}) {
  const { mockTestId } = await params;

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
  const takenSectionTypes = sections.map((section) => section.section_type);
  const allSkillsUsed = takenSectionTypes.length >= 4;

  const suggestedOrder =
    sections.reduce(
      (highest, section) => Math.max(highest, section.section_order),
      0,
    ) + 1;

  const backHref = `/dashboard/admin/mock-tests/${mockTestId}`;

  return (
    <div className="space-y-8">
      <AdminPageHeader
        title="Add a section"
        description={`Add a skill section to ${test.title}.`}
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Mock test builder", href: "/dashboard/admin/mock-tests" },
          { label: test.title, href: backHref },
          { label: "Add a section" },
        ]}
      />

      <AppCard as="section" ariaLabel="Section details">
        {allSkillsUsed ? (
          <p className={cx("text-sm leading-6", text.secondary)}>
            This practice test already has a Listening, Reading, Writing
            and Speaking section. There is nothing left to add.
          </p>
        ) : (
          <MockTestSectionForm
            mode="create"
            mockTestId={mockTestId}
            takenSectionTypes={takenSectionTypes}
            suggestedOrder={suggestedOrder}
            action={createMockTestSection}
            cancelHref={backHref}
          />
        )}
      </AppCard>
    </div>
  );
}
