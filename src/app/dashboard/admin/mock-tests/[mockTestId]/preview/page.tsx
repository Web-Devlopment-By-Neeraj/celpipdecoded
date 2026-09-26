import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AppButtonLink } from "@/components/app/AppButtonLink";
import { AdminAccessDenied } from "@/components/admin/mock-tests/AdminAccessDenied";
import { AdminPageHeader } from "@/components/admin/mock-tests/AdminPageHeader";
import { MockTestStructurePreview } from "@/components/admin/mock-tests/MockTestStructurePreview";
import { ValidateStructureButton } from "@/components/admin/mock-tests/ValidateStructureButton";
import { getMockTestStructure } from "@/features/admin/mock-test-queries";
import { isUuid } from "@/features/admin/mock-test-types";
import { evaluateMockTestStructure } from "@/features/admin/mock-test-validation";
import { getAdminSession } from "@/lib/admin/require-admin";
import { validateMockTestStructure } from "../../actions";

export const metadata: Metadata = {
  title: "Structure preview - CELPIP Decoded",
  description: "Preview the structure of a practice test in the staff builder.",
  robots: { index: false, follow: false },
};

// Read only view of an authored practice test.
//
// The validation summary is recomputed here rather than read from
// mock_test_validation_issues, so what is on screen is what is true now.
// The stored rows are a cache for the builder list, and the button on
// this page is what refreshes them. A page render does not write.
export default async function MockTestPreviewPage({
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

  const validation = evaluateMockTestStructure(structure);
  const backHref = `/dashboard/admin/mock-tests/${mockTestId}`;

  return (
    <div className="space-y-8">
      <AdminPageHeader
        title="Structure preview"
        description="Every section and part as it stands, with the structure checks this version of the builder can run."
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Mock test builder", href: "/dashboard/admin/mock-tests" },
          { label: structure.test.title, href: backHref },
          { label: "Preview" },
        ]}
        action={
          <AppButtonLink href={backHref} variant="secondary" size="sm">
            Back to editing
          </AppButtonLink>
        }
      >
        <ValidateStructureButton
          mockTestId={mockTestId}
          action={validateMockTestStructure}
          label="Save these results"
        />
      </AdminPageHeader>

      <MockTestStructurePreview
        structure={structure}
        validation={validation}
      />
    </div>
  );
}
