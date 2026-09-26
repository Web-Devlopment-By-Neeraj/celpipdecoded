import type { Metadata } from "next";
import { AppCard } from "@/components/app/AppCard";
import { AdminAccessDenied } from "@/components/admin/mock-tests/AdminAccessDenied";
import { AdminPageHeader } from "@/components/admin/mock-tests/AdminPageHeader";
import { MockTestForm } from "@/components/admin/mock-tests/MockTestForm";
import { getAdminSession } from "@/lib/admin/require-admin";
import { createMockTest } from "../actions";

export const metadata: Metadata = {
  title: "New practice test - CELPIP Decoded",
  description: "Create a practice test draft in the staff builder.",
  robots: { index: false, follow: false },
};

// Create a practice test draft.
//
// The form has no status field. A new test is always a draft, so there
// is no path from this screen to anything a student could open.
export default async function NewMockTestPage() {
  const admin = await getAdminSession();

  if (!admin.ok) {
    return <AdminAccessDenied reason={admin.reason} />;
  }

  return (
    <div className="space-y-8">
      <AdminPageHeader
        title="New practice test"
        description="Give the test a title and a slug. Sections and parts come next, and the test stays a draft until its structure is complete."
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Mock test builder", href: "/dashboard/admin/mock-tests" },
          { label: "New" },
        ]}
      />

      <AppCard as="section" ariaLabel="Practice test details">
        <MockTestForm
          mode="create"
          action={createMockTest}
          cancelHref="/dashboard/admin/mock-tests"
        />
      </AppCard>
    </div>
  );
}
