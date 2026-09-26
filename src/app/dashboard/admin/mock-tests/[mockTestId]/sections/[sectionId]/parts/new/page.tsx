import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AppCard } from "@/components/app/AppCard";
import { AdminAccessDenied } from "@/components/admin/mock-tests/AdminAccessDenied";
import { AdminPageHeader } from "@/components/admin/mock-tests/AdminPageHeader";
import { MockTestPartForm } from "@/components/admin/mock-tests/MockTestPartForm";
import {
  getMockTestSection,
  listSectionParts,
} from "@/features/admin/mock-test-queries";
import {
  SECTION_TYPE_LABELS,
  isUuid,
} from "@/features/admin/mock-test-types";
import { getAdminSession } from "@/lib/admin/require-admin";
import { createMockTestPart } from "../../../../../actions";

export const metadata: Metadata = {
  title: "Add a part - CELPIP Decoded",
  description: "Add a part to a practice test section in the staff builder.",
  robots: { index: false, follow: false },
};

// Add one part inside a section.
//
// The section is loaded scoped to the test in the URL, so a section id
// belonging to a different practice test cannot be reached through this
// route. The section's skill decides which part types the form offers.
export default async function NewMockTestPartPage({
  params,
}: {
  params: Promise<{ mockTestId: string; sectionId: string }>;
}) {
  const { mockTestId, sectionId } = await params;

  if (!isUuid(mockTestId) || !isUuid(sectionId)) {
    notFound();
  }

  const admin = await getAdminSession();

  if (!admin.ok) {
    return <AdminAccessDenied reason={admin.reason} />;
  }

  const section = await getMockTestSection(
    admin.session,
    mockTestId,
    sectionId,
  );

  if (!section) {
    notFound();
  }

  const parts = await listSectionParts(admin.session, sectionId);

  const suggestedOrder =
    parts.reduce((highest, part) => Math.max(highest, part.part_order), 0) + 1;

  const backHref = `/dashboard/admin/mock-tests/${mockTestId}`;

  return (
    <div className="space-y-8">
      <AdminPageHeader
        title="Add a part"
        description={`Add a part to the ${SECTION_TYPE_LABELS[section.section_type]} section.`}
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Mock test builder", href: "/dashboard/admin/mock-tests" },
          { label: "Practice test", href: backHref },
          { label: section.title, href: backHref },
          { label: "Add a part" },
        ]}
      />

      <AppCard as="section" ariaLabel="Part details">
        <MockTestPartForm
          mode="create"
          mockTestId={mockTestId}
          sectionId={sectionId}
          sectionType={section.section_type}
          suggestedOrder={suggestedOrder}
          action={createMockTestPart}
          cancelHref={backHref}
        />
      </AppCard>
    </div>
  );
}
