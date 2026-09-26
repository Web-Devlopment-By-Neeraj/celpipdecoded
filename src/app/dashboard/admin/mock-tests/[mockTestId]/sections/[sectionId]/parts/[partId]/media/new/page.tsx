import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AppCard } from "@/components/app/AppCard";
import { AdminAccessDenied } from "@/components/admin/mock-tests/AdminAccessDenied";
import { AdminPageHeader } from "@/components/admin/mock-tests/AdminPageHeader";
import { MockTestMediaForm } from "@/components/admin/mock-tests/MockTestMediaForm";
import { getMockTestPartContext } from "@/features/admin/mock-test-queries";
import {
  listPartMedia,
  suggestMediaOrder,
} from "@/features/admin/mock-test-media-queries";
import { isUuid } from "@/features/admin/mock-test-types";
import { getAdminSession } from "@/lib/admin/require-admin";
import { createMockTestMediaAsset } from "../../../../../../../actions";

export const metadata: Metadata = {
  title: "Add a media link - CELPIP Decoded",
  description: "Add a media link to a practice test part in the staff builder.",
  robots: { index: false, follow: false },
};

// Add one media link to a part.
//
// A link, never an upload. ADMIN-02 does not build file upload, so this
// screen takes a URL that already resolves somewhere, which is how all
// 46 Mock Test 1 assets already work.
export default async function NewMockTestMediaPage({
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

  const media = await listPartMedia(admin.session, partId);

  const testHref = `/dashboard/admin/mock-tests/${mockTestId}`;
  const partHref = `${testHref}/sections/${sectionId}/parts/${partId}`;

  return (
    <div className="space-y-8">
      <AdminPageHeader
        title="Add a media link"
        description={`Paste the URL of an audio, video or image asset for ${context.part.title}.`}
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Mock test builder", href: "/dashboard/admin/mock-tests" },
          { label: context.test.title, href: testHref },
          { label: context.part.title, href: partHref },
          { label: "Add a media link" },
        ]}
      />

      <AppCard as="section" ariaLabel="Media link details">
        <MockTestMediaForm
          mode="create"
          mockTestId={mockTestId}
          sectionId={sectionId}
          partId={partId}
          suggestedOrder={suggestMediaOrder(media)}
          action={createMockTestMediaAsset}
          cancelHref={partHref}
        />
      </AppCard>
    </div>
  );
}
