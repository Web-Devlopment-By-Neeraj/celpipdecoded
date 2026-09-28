import type { Metadata } from "next";
import { AdminAccessDenied } from "@/components/admin/mock-tests/AdminAccessDenied";
import { getAdminSession } from "@/lib/admin/require-admin";
import { batchClassEvents } from "@/features/platform/calendar";

export const metadata: Metadata = {
  title: "Calendar - CELPIP Decoded",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function CalendarAdminPage() {
  const admin = await getAdminSession();
  if (!admin.ok) return <AdminAccessDenied reason={admin.reason} />;
  const events = batchClassEvents(new Date(), "https://zoom.example/pending");

  return (
    <main className="mx-auto max-w-3xl overflow-x-hidden px-4 py-8">
      <h1 className="font-serif text-3xl font-semibold text-academy-navy">Calendar</h1>
      <p className="mt-2 text-sm leading-6 text-academy-navy/75">
        Move or cancel a session from this screen. A change made only in Google Calendar or Zoom does not email the student. The nightly check flags those mismatches.
      </p>
      <ol className="mt-6 space-y-2 text-sm">
        {events.map((event) => (
          <li key={event.calendarEventId} className="rounded-2xl bg-white px-3 py-3 ring-1 ring-academy-line">
            {new Intl.DateTimeFormat("en-CA", {
              timeZone: "America/Toronto",
              weekday: "short",
              month: "short",
              day: "numeric",
              hour: "numeric",
              minute: "2-digit",
              timeZoneName: "short",
            }).format(event.startsAt)}
          </li>
        ))}
      </ol>
    </main>
  );
}
