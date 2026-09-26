import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AppButtonLink } from "@/components/app/AppButtonLink";
import { AdminAccessDenied } from "@/components/admin/mock-tests/AdminAccessDenied";
import { AdminActionButton } from "@/components/admin/mock-tests/AdminFormFields";
import { AdminPageHeader } from "@/components/admin/mock-tests/AdminPageHeader";
import { MockTestPartContentPreview } from "@/components/admin/mock-tests/MockTestPartContentPreview";
import { evaluatePartContent } from "@/features/admin/mock-test-content-validation";
import { getMockTestPartContext } from "@/features/admin/mock-test-queries";
import { getPartContent } from "@/features/admin/mock-test-question-queries";
import { isUuid } from "@/features/admin/mock-test-types";
import { getAdminSession } from "@/lib/admin/require-admin";
import { validatePartContent } from "../../../../../../actions";

export const metadata: Metadata = {
  title: "Part preview - CELPIP Decoded",
  description: "Staff preview of an authored practice test part.",
  robots: { index: false, follow: false },
};

// The admin preview of one authored part.
//
// It shows the correct answer, which is exactly what a learner preview
// must never do. That is safe here and only here, for three reasons:
// getAdminSession runs before anything is read, mock_test_answer_keys
// has no row level security policy for anon or authenticated at all, and
// no learner route reads any of this content. The students' practice
// tests still run from the existing Mock Test 1 content files, which
// ADMIN-02 does not touch.
//
// The validation summary is recomputed on this render rather than read
// from a stored table, so what is on screen is what is true now.
export default async function MockTestPartPreviewPage({
  params,
}: {
  params: Promise<{ mockTestId: string; sectionId: string; partId: string }>;
}) {
  const { mockTestId, sectionId, partId } = await params;

  if (!isUuid(mockTestId) || !isUuid(sectionId) || !isUuid(partId)) {
    notFound();
  }

  const admin = await getAdminSession();

  if (!admin.ok) {
    return <AdminAccessDenied reason={admin.reason} />;
  }

  const context = await getMockTestPartContext(
    admin.session,
    mockTestId,
    sectionId,
    partId,
  );

  if (!context) {
    notFound();
  }

  const content = await getPartContent(admin.session, partId);
  const validation = evaluatePartContent(content);

  const testHref = `/dashboard/admin/mock-tests/${mockTestId}`;
  const partHref = `${testHref}/sections/${sectionId}/parts/${partId}`;

  return (
    <div className="space-y-8">
      <AdminPageHeader
        title="Part preview"
        description="Everything authored under this part, with the answer keys shown, because this screen is staff only."
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Mock test builder", href: "/dashboard/admin/mock-tests" },
          { label: context.test.title, href: testHref },
          { label: context.part.title, href: partHref },
          { label: "Preview" },
        ]}
        action={
          <AppButtonLink href={partHref} variant="secondary" size="sm">
            Back to editing
          </AppButtonLink>
        }
      >
        <AdminActionButton
          action={validatePartContent}
          fields={{
            mock_test_id: mockTestId,
            section_id: sectionId,
            part_id: partId,
          }}
          label="Run content check"
          loadingLabel="Checking..."
        />
      </AdminPageHeader>

      <MockTestPartContentPreview
        context={context}
        content={content}
        validation={validation}
      />
    </div>
  );
}
