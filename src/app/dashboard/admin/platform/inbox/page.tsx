import type { Metadata } from "next";
import Link from "next/link";
import { AdminAccessDenied } from "@/components/admin/mock-tests/AdminAccessDenied";
import { getAdminSession } from "@/lib/admin/require-admin";

export const metadata: Metadata = { title: "Ask Amar inbox - CELPIP Decoded", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function InboxPage() {
  const admin = await getAdminSession();
  if (!admin.ok) return <AdminAccessDenied reason={admin.reason} />;
  return (
    <main className="mx-auto max-w-3xl overflow-x-hidden px-4 py-8">
      <h1 className="font-serif text-3xl font-semibold text-academy-navy">Ask Amar</h1>
      <p className="mt-3 text-sm leading-6 text-academy-navy/75">
        Questions the assistant hands over land here. A reply can be saved as a help article. The inbox is empty until a signed-in student asks something the assistant cannot answer.
      </p>
      <p className="mt-4 text-sm"><Link className="underline" href="/dashboard/admin/platform/settings">Settings</Link></p>
    </main>
  );
}
