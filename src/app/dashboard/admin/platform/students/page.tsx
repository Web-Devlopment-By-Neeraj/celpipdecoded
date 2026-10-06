import type { Metadata } from "next";
import Link from "next/link";
import { AdminAccessDenied } from "@/components/admin/mock-tests/AdminAccessDenied";
import { getAdminSession } from "@/lib/admin/require-admin";

export const metadata: Metadata = { title: "Students - CELPIP Decoded", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function StudentsPage() {
  const admin = await getAdminSession();
  if (!admin.ok) return <AdminAccessDenied reason={admin.reason} />;
  return (
    <main className="mx-auto max-w-3xl overflow-x-hidden px-4 py-8">
      <h1 className="font-serif text-3xl font-semibold text-academy-navy">Students</h1>
      <p className="mt-3 text-sm leading-6 text-academy-navy/75">
        This list shows name and email only. Private notes and WhatsApp numbers stay off this screen unless the owner grants that permission to a coach.
      </p>
      <p className="mt-4 text-sm">No student rows are loaded yet.</p>
      <p className="mt-4 text-sm"><Link className="underline" href="/dashboard/admin/platform/settings">Settings</Link></p>
    </main>
  );
}
