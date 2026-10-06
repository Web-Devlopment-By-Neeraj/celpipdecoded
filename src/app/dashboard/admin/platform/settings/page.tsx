import type { Metadata } from "next";
import Link from "next/link";
import { AdminAccessDenied } from "@/components/admin/mock-tests/AdminAccessDenied";
import { getAdminSession } from "@/lib/admin/require-admin";
import { defaultSettings, SETTINGS } from "@/features/platform/settings";

export const metadata: Metadata = {
  title: "Settings - CELPIP Decoded",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const admin = await getAdminSession();
  if (!admin.ok) return <AdminAccessDenied reason={admin.reason} />;
  const values = defaultSettings();

  return (
    <main className="mx-auto max-w-3xl overflow-x-hidden px-4 py-8">
      <h1 className="font-serif text-3xl font-semibold text-academy-navy">Settings</h1>
      <p className="mt-2 text-sm leading-6 text-academy-navy/75">
        Developer view of every limit the app reads at runtime. Changing a row in the settings table takes effect within 60 seconds. This screen is not the student-facing settings page.
      </p>
      <ul className="mt-4 flex flex-wrap gap-3 text-sm">
        <li><Link className="underline" href="/dashboard/admin/platform/calibration">Calibration</Link></li>
        <li><Link className="underline" href="/dashboard/admin/platform/cohort">What works</Link></li>
        <li><Link className="underline" href="/dashboard/admin/platform/calendar">Calendar</Link></li>
        <li><Link className="underline" href="/dashboard/admin/platform/queue">Today</Link></li>
        <li><Link className="underline" href="/dashboard/admin/platform/students">Students</Link></li>
        <li><Link className="underline" href="/dashboard/admin/platform/inbox">Ask Amar</Link></li>
        <li><Link className="underline" href="/dashboard/admin/platform/reviews">Reviews</Link></li>
        <li><Link className="underline" href="/dashboard/admin/platform/costs">AI cost</Link></li>
      </ul>
      <div className="mt-6 space-y-3">
        {(Object.keys(SETTINGS) as Array<keyof typeof SETTINGS>).map((key) => (
          <article key={key} className="rounded-2xl bg-white p-4 ring-1 ring-academy-line">
            <h2 className="text-sm font-semibold text-academy-navy">{key}</h2>
            <p className="mt-1 text-sm text-academy-navy/70">{SETTINGS[key].description}</p>
            <p className="mt-2 text-sm">Starting value: {JSON.stringify(values[key])}</p>
          </article>
        ))}
      </div>
    </main>
  );
}
