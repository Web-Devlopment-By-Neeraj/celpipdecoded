import type { Metadata } from "next";
import { AdminAccessDenied } from "@/components/admin/mock-tests/AdminAccessDenied";
import { getAdminSession } from "@/lib/admin/require-admin";
import { authorizeAction, permissionsFor } from "@/features/platform/roles";
import { summarizeBatch } from "@/features/platform/calibration";
import { defaultSettings } from "@/features/platform/settings";

export const metadata: Metadata = {
  title: "Calibration - CELPIP Decoded",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function CalibrationPage() {
  const admin = await getAdminSession();
  if (!admin.ok) return <AdminAccessDenied reason={admin.reason} />;
  const access = authorizeAction(
    { userId: admin.session.userId, role: "owner", permissions: permissionsFor("owner") },
    "calibration",
  );
  if (!access.ok) return <AdminAccessDenied reason="not_admin" />;

  const summary = summarizeBatch(
    [{ id: "sample-1", label: "Writing task 1, known 7", knownLevel: 7, retiredAt: null }],
    [],
    "none",
    defaultSettings()["calibration.generous_alert"],
  );

  return (
    <main className="mx-auto max-w-3xl overflow-x-hidden px-4 py-8">
      <h1 className="font-serif text-3xl font-semibold text-academy-navy">Calibration</h1>
      <p className="mt-2 text-sm leading-6 text-academy-navy/75">
        Sample answers with known levels. A run uses the same evaluator as a student and does not spend a student&apos;s allowance. Mean signed error above {defaultSettings()["calibration.generous_alert"]} is marked drifting generous.
      </p>
      <p className="mt-4 text-sm">Active samples in this empty batch: {summary.rows.length}. Add writing text or a speaking recording from the admin tools once the calibration tables are migrated.</p>
    </main>
  );
}
