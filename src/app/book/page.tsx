import type { Metadata } from "next";
import Link from "next/link";
import { PlanUpgradeButton } from "@/components/pricing/PlanUpgradeButton";

export const metadata: Metadata = {
  title: "Book a session - CELPIP Decoded",
  description: "Join a 2-week live batch or book one hour with Amar.",
};

export default function BookPage() {
  return (
    <main className="min-h-screen overflow-x-hidden bg-cream px-4 py-10 text-ink">
      <div className="mx-auto max-w-xl">
        <h1 className="font-serif text-3xl font-bold">Book</h1>
        <p className="mt-3 text-sm leading-6">
          A live batch is 8 classes over two weeks, one hour each, on Google Meet. Dates and times are shared when you book. A 1:1 is one hour with Amar, and it starts by choosing a time.
        </p>
        <p className="mt-3 text-sm leading-6">
          To move or cancel, contact Amar. A change made only in Google Calendar does not email you.
        </p>
        <div className="mt-6 space-y-4">
          <div>
            <h2 className="text-lg font-semibold">Live batch</h2>
            <PlanUpgradeButton productCode="batch" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">Do 1:1 with Amar</h2>
            <p className="mt-2 text-sm leading-6">
              Choose an open time first. The payment is tied to that time, and the time is yours only after the card payment is confirmed.
            </p>
            <Link href="/dashboard/live-classes" className="mt-3 inline-flex h-11 items-center rounded-full bg-brand px-5 text-sm font-semibold text-white">
              Choose a time
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
