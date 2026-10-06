import type { Metadata } from "next";
import Link from "next/link";
import { AdminAccessDenied } from "@/components/admin/mock-tests/AdminAccessDenied";
import { getAdminSession } from "@/lib/admin/require-admin";
import { costCents, defaultSettings } from "@/features/platform/settings";

export const metadata: Metadata = { title: "AI cost - CELPIP Decoded", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function CostsPage() {
  const admin = await getAdminSession();
  if (!admin.ok) return <AdminAccessDenied reason={admin.reason} />;
  const sample = costCents(
    { inputTokens: 2000, outputTokens: 800, audioSeconds: 0 },
    defaultSettings()["ai.price_table"],
  );
  return (
    <main className="mx-auto max-w-3xl overflow-x-hidden px-4 py-8">
      <h1 className="font-serif text-3xl font-semibold text-academy-navy">AI cost</h1>
      <p className="mt-3 text-sm leading-6 text-academy-navy/75">
        A sample writing-sized call at the current price table is {sample} cents. Completed evaluations will add their own rows here when they are stored. Calibration cost is included in the total and kept out of a student average.
      </p>
      <p className="mt-4 text-sm"><Link className="underline" href="/dashboard/admin/platform/settings">Settings</Link></p>
    </main>
  );
}
