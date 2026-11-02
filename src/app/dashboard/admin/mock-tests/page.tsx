import type { Metadata } from "next";
import { AppCard } from "@/components/app/AppCard";
import { AdminAccessDenied } from "@/components/admin/mock-tests/AdminAccessDenied";
import { AdminMockTestList } from "@/components/admin/mock-tests/AdminMockTestList";
import { AdminPageHeader } from "@/components/admin/mock-tests/AdminPageHeader";
import { MockTestUploadForm } from "@/components/admin/mock-tests/MockTestUploadForm";
import { cx, text } from "@/features/design/design-tokens";
import { listMockTests } from "@/features/admin/mock-test-queries";
import { getAdminSession } from "@/lib/admin/require-admin";

export const metadata: Metadata = {
  title: "Mock test builder - CELPIP Decoded",
  description: "Staff tool for uploading CELPIP practice tests.",
  robots: { index: false, follow: false },
};

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
        description="Upload a content file, check the list, then press Publish. Students with Test Sprint open it from Mock tests, in the same exam screens as Mock Test 1."
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Mock test builder" },
        ]}
      />

      <MockTestUploadForm />

      <AdminMockTestList mockTests={mockTests} />

      <AppCard variant="subtle" as="section" ariaLabel="What the file contains">
        <h2 className={cx(text.heading, "text-base")}>What you put in the file</h2>
        <ul
          className={cx(
            "mt-3 list-disc space-y-1.5 pl-5 text-sm leading-6",
            text.secondary,
          )}
        >
          <li>
            The passage, the conversation, the task, the picture link, the
            audio link, the questions and the correct letter.
          </li>
          <li>
            Rows marked example are a guide. They are not saved.
          </li>
          <li>
            The instruction videos and the repeated part instructions stay
            in the app. A picture task uses the same instruction on every
            test. Only the picture changes.
          </li>
          <li>
            A clean file is a draft. Publish is a separate button. The slug
            mock-test-1 is reserved for the built-in free test.
          </li>
        </ul>
      </AppCard>
    </div>
  );
}
