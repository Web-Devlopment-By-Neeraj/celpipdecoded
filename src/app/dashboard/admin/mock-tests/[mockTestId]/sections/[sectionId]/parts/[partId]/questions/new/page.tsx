import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AppCard } from "@/components/app/AppCard";
import { AdminAccessDenied } from "@/components/admin/mock-tests/AdminAccessDenied";
import { AdminPageHeader } from "@/components/admin/mock-tests/AdminPageHeader";
import { MockTestQuestionForm } from "@/components/admin/mock-tests/MockTestQuestionForm";
import { getMockTestPartContext } from "@/features/admin/mock-test-queries";
import { listPartMedia } from "@/features/admin/mock-test-media-queries";
import {
  listPartQuestions,
  suggestQuestionPosition,
} from "@/features/admin/mock-test-question-queries";
import {
  SECTION_TYPE_LABELS,
  isUuid,
} from "@/features/admin/mock-test-types";
import { getAdminSession } from "@/lib/admin/require-admin";
import { createMockTestQuestion } from "../../../../../../../actions";

export const metadata: Metadata = {
  title: "Add a question - CELPIP Decoded",
  description: "Add a question to a practice test part in the staff builder.",
  robots: { index: false, follow: false },
};

// Add one question to a part.
//
// The question saves before it has options or an answer key, and lands
// on its own screen where both are added. That order is deliberate: an
// option needs a question id to belong to, so there is nothing to add
// them to until the question exists.
export default async function NewMockTestQuestionPage({
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

  const [questions, media] = await Promise.all([
    listPartQuestions(admin.session, partId),
    listPartMedia(admin.session, partId),
  ]);

  const suggested = suggestQuestionPosition(questions);

  const testHref = `/dashboard/admin/mock-tests/${mockTestId}`;
  const partHref = `${testHref}/sections/${sectionId}/parts/${partId}`;

  return (
    <div className="space-y-8">
      <AdminPageHeader
        title="Add a question"
        description={`Add an objective question to ${context.part.title}, in the ${SECTION_TYPE_LABELS[context.section.section_type]} section.`}
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Mock test builder", href: "/dashboard/admin/mock-tests" },
          { label: context.test.title, href: testHref },
          { label: context.part.title, href: partHref },
          { label: "Add a question" },
        ]}
      />

      <AppCard as="section" ariaLabel="Question details">
        <MockTestQuestionForm
          mode="create"
          mockTestId={mockTestId}
          sectionId={sectionId}
          partId={partId}
          sectionType={context.section.section_type}
          media={media}
          suggestedNumber={suggested.questionNumber}
          suggestedOrder={suggested.displayOrder}
          action={createMockTestQuestion}
          cancelHref={partHref}
        />
      </AppCard>
    </div>
  );
}
