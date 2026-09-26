import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AppButtonLink } from "@/components/app/AppButtonLink";
import { AdminAccessDenied } from "@/components/admin/mock-tests/AdminAccessDenied";
import { AdminPageHeader } from "@/components/admin/mock-tests/AdminPageHeader";
import { MockTestPartDetail } from "@/components/admin/mock-tests/MockTestPartDetail";
import { evaluatePartContent } from "@/features/admin/mock-test-content-validation";
import { getMockTestPartContext } from "@/features/admin/mock-test-queries";
import { getPartContent } from "@/features/admin/mock-test-question-queries";
import {
  SECTION_TYPE_LABELS,
  isUuid,
} from "@/features/admin/mock-test-types";
import { getAdminSession } from "@/lib/admin/require-admin";
import {
  deleteMockTestMediaAsset,
  updateMockTestMediaAsset,
  validatePartContent,
} from "../../../../../actions";

export const metadata: Metadata = {
  title: "Part content - CELPIP Decoded",
  description: "Edit the questions and media links of a practice test part.",
  robots: { index: false, follow: false },
};

// ADMIN-02: the working screen for one part.
//
// Three ids in the URL, and all three are checked. isUuid rejects a
// malformed one before it reaches the database, and
// getMockTestPartContext refuses a part that does not sit under the
// section and test named above it, so a mismatched URL is a 404 rather
// than the wrong part's content.
//
// The admin check runs here rather than in a layout, because a layout
// does not re-render on client navigation and an authorization check has
// to sit next to the data it protects.
export default async function AdminMockTestPartPage({
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
        title={context.part.title}
        description={`Add the media links and questions for this ${SECTION_TYPE_LABELS[context.section.section_type]} part. Nothing authored here is visible to a student.`}
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Mock test builder", href: "/dashboard/admin/mock-tests" },
          { label: context.test.title, href: testHref },
          { label: context.section.title, href: testHref },
          { label: context.part.title },
        ]}
        action={
          <>
            <AppButtonLink
              href={`${partHref}/preview`}
              variant="secondary"
              size="sm"
            >
              Preview part
            </AppButtonLink>
            <AppButtonLink href={`${partHref}/questions/new`} size="sm">
              Add question
            </AppButtonLink>
          </>
        }
      />

      <MockTestPartDetail
        context={context}
        content={content}
        validation={validation}
        partHref={partHref}
        updateMediaAction={updateMockTestMediaAsset}
        deleteMediaAction={deleteMockTestMediaAsset}
        validateAction={validatePartContent}
      />
    </div>
  );
}
