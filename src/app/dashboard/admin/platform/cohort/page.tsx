import type { Metadata } from "next";
import { AdminAccessDenied } from "@/components/admin/mock-tests/AdminAccessDenied";
import { getAdminSession } from "@/lib/admin/require-admin";
import { cohortCsv, cohortReport } from "@/features/platform/cohort";
import { defaultSettings } from "@/features/platform/settings";

export const metadata: Metadata = {
  title: "What works - CELPIP Decoded",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function CohortPage() {
  const admin = await getAdminSession();
  if (!admin.ok) return <AdminAccessDenied reason={admin.reason} />;
  const rows = cohortReport([], {}, defaultSettings()["cohort.min_n"]);

  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="font-serif text-3xl font-semibold text-academy-navy">What works</h1>
      <p className="mt-2 text-sm leading-6 text-academy-navy/75">
        Which mini-course moves which skill. Rows with fewer than {defaultSettings()["cohort.min_n"]} proved prescriptions stay grey. Student names are not on this report.
      </p>
      <div className="mt-6 overflow-x-auto rounded-2xl ring-1 ring-academy-line">
        <table className="min-w-[40rem] text-left text-sm">
          <thead className="bg-academy-navy-soft">
            <tr>
              <th className="px-3 py-2">Mini-course</th>
              <th className="px-3 py-2">Skill</th>
              <th className="px-3 py-2">Sent</th>
              <th className="px-3 py-2">Mean change</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td className="px-3 py-4 text-academy-navy/70" colSpan={4}>No prescriptions yet.</td>
              </tr>
            ) : rows.map((row) => (
              <tr key={`${row.miniCourseId}-${row.skillTag}`} className={row.tooFew ? "text-academy-navy/40" : ""}>
                <td className="px-3 py-2">{row.miniCourseId}</td>
                <td className="px-3 py-2">{row.skillTag}</td>
                <td className="px-3 py-2">{row.sent}</td>
                <td className="px-3 py-2">{row.tooFew ? "Too few to judge" : row.meanChange}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <pre className="mt-4 overflow-x-auto text-xs">{cohortCsv(rows)}</pre>
    </main>
  );
}
