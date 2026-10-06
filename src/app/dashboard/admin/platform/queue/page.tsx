import type { Metadata } from "next";
import Link from "next/link";
import { AdminAccessDenied } from "@/components/admin/mock-tests/AdminAccessDenied";
import { getAdminSession } from "@/lib/admin/require-admin";

export const metadata: Metadata = { title: "Today - CELPIP Decoded", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function TodayQueuePage() {
  const admin = await getAdminSession();
  if (!admin.ok) return <AdminAccessDenied reason={admin.reason} />;
  return (
    <main className="mx-auto max-w-3xl overflow-x-hidden px-4 py-8">
      <h1 className="font-serif text-3xl font-semibold text-academy-navy">Today</h1>
      <p className="mt-3 text-sm leading-6 text-academy-navy/75">
        New sign-ups, unverified emails, waiting evaluations, and unpaid batch seats will list here once those rows are stored. The queue is empty because nothing is waiting in the database.
      </p>
      <p className="mt-4 text-sm"><Link className="underline" href="/dashboard/admin/platform/settings">Settings</Link></p>
    </main>
  );
}
