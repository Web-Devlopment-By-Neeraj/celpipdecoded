import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AppButtonLink } from "@/components/app/AppButtonLink";
import { AppCard } from "@/components/app/AppCard";
import { AdminAccessDenied } from "@/components/admin/mock-tests/AdminAccessDenied";
import { AdminDeleteForm } from "@/components/admin/mock-tests/AdminFormFields";
import { AdminPageHeader } from "@/components/admin/mock-tests/AdminPageHeader";
import { MockTestAnswerKeyEditor } from "@/components/admin/mock-tests/MockTestAnswerKeyEditor";
import { MockTestOptionEditor } from "@/components/admin/mock-tests/MockTestOptionEditor";
import { MockTestQuestionForm } from "@/components/admin/mock-tests/MockTestQuestionForm";
import { cx, text } from "@/features/design/design-tokens";
import { getMockTestPartContext } from "@/features/admin/mock-test-queries";
import { listPartMedia } from "@/features/admin/mock-test-media-queries";
import { getQuestionWithContent } from "@/features/admin/mock-test-question-queries";
import { isUuid } from "@/features/admin/mock-test-types";
import { getAdminSession } from "@/lib/admin/require-admin";
import {
  createMockTestOption,
  deleteMockTestAnswerKey,
  deleteMockTestOption,
  deleteMockTestQuestion,
  setMockTestAnswerKey,
  updateMockTestAnswerKey,
  updateMockTestOption,
  updateMockTestQuestion,
} from "../../../../../../../actions";

export const metadata: Metadata = {
  title: "Edit question - CELPIP Decoded",
  description: "Edit a practice test question, its options and its answer key.",
  robots: { index: false, follow: false },
};

// One question, with the three editors it needs on one screen: the
// question fields, the options, and the answer key.
//
// Three panels rather than three routes, because they only make sense
// together. Choosing a correct option means reading the options, and
// reading the options means seeing the prompt they answer.
//
// ADMIN ONLY. This screen shows which option is correct. That is safe
// only because getAdminSession runs before anything is read, RLS grants
// mock_test_answer_keys no policy for anon or authenticated at all, and
// no learner route reads this content.
export default async function AdminMockTestQuestionPage({
  params,
}: {
  params: Promise<{
    mockTestId: string;
    sectionId: string;
    partId: string;
    questionId: string;
  }>;
}) {
  const { mockTestId, sectionId, partId, questionId } = await params;

  if (
    !isUuid(mockTestId) ||
    !isUuid(sectionId) ||
    !isUuid(partId) ||
    !isUuid(questionId)
  ) {
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

  // Scoped to the part in the URL, so a question id from another part
  // cannot be edited through this route.
  const question = await getQuestionWithContent(
    admin.session,
    partId,
    questionId,
  );

  if (!question) {
    notFound();
  }

  const media = await listPartMedia(admin.session, partId);

  const testHref = `/dashboard/admin/mock-tests/${mockTestId}`;
  const partHref = `${testHref}/sections/${sectionId}/parts/${partId}`;

  return (
    <div className="space-y-8">
      <AdminPageHeader
        title={`Question ${question.question_number}`}
        description="Edit the wording, the answer options and the answer key. The answer key is staff only and no student route reads it."
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Mock test builder", href: "/dashboard/admin/mock-tests" },
          { label: context.test.title, href: testHref },
          { label: context.part.title, href: partHref },
          { label: `Question ${question.question_number}` },
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
            <AppButtonLink href={partHref} variant="ghost" size="sm">
              Back to the part
            </AppButtonLink>
          </>
        }
      />

      <AppCard as="section" ariaLabel="Question details">
        <h2 className={cx(text.heading, "text-lg")}>Question</h2>
        <div className="mt-6">
          <MockTestQuestionForm
            mode="edit"
            mockTestId={mockTestId}
            sectionId={sectionId}
            partId={partId}
            sectionType={context.section.section_type}
            question={question}
            media={media}
            action={updateMockTestQuestion}
          />
        </div>
      </AppCard>

      <AppCard as="section" ariaLabel="Answer options">
        <h2 className={cx(text.heading, "text-lg")}>Answer options</h2>
        <p className={cx("mt-2 max-w-2xl text-sm leading-6", text.secondary)}>
          An objective question needs at least two options, and normally
          four. No option carries the right answer: that lives in the
          answer key below, so the options can be read without the answer
          coming with them.
        </p>

        <div className="mt-6">
          <MockTestOptionEditor
            mockTestId={mockTestId}
            sectionId={sectionId}
            partId={partId}
            questionId={question.id}
            options={question.options}
            createAction={createMockTestOption}
            updateAction={updateMockTestOption}
            deleteAction={deleteMockTestOption}
          />
        </div>
      </AppCard>

      <AppCard as="section" ariaLabel="Answer key">
        <h2 className={cx(text.heading, "text-lg")}>Answer key</h2>
        <p className={cx("mt-2 max-w-2xl text-sm leading-6", text.secondary)}>
          Staff only. This is the one screen in the builder that records a
          right answer, and nothing a student can reach reads it.
        </p>

        <div className="mt-6">
          <MockTestAnswerKeyEditor
            mockTestId={mockTestId}
            sectionId={sectionId}
            partId={partId}
            questionId={question.id}
            options={question.options}
            answerKey={question.answerKey}
            questionPoints={question.points}
            setAction={setMockTestAnswerKey}
            updateAction={updateMockTestAnswerKey}
            deleteAction={deleteMockTestAnswerKey}
          />
        </div>
      </AppCard>

      <AppCard as="section" ariaLabel="Remove this question" variant="subtle">
        <h2 className={cx(text.heading, "text-base")}>Remove this question</h2>
        <p className={cx("mt-2 max-w-2xl text-sm leading-6", text.secondary)}>
          Removing a question also removes its options and its answer key.
          The other questions in this part keep their numbers, so check the
          numbering afterwards.
        </p>

        <div className="mt-4">
          <AdminDeleteForm
            action={deleteMockTestQuestion}
            fields={{
              mock_test_id: mockTestId,
              section_id: sectionId,
              part_id: partId,
              question_id: question.id,
            }}
            label="Remove question"
            confirmLabel="Confirm remove question"
            warning="This cannot be undone."
          />
        </div>
      </AppCard>
    </div>
  );
}
