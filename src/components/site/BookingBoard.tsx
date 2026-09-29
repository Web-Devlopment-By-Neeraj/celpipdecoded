"use client";

import { useState } from "react";
import { SignUpPrompt } from "./SignUpPrompt";
import { BATCH_CURRICULUM, canReschedule, formatZonedRange } from "@/features/public-site/booking";
import { DEFAULT_SETTINGS } from "@/features/public-site/settings";

const SLOT = "2026-10-14T23:00:00.000Z";
const SLOT_END = "2026-10-14T23:15:00.000Z";

export function BookingBoard({ signedIn }: { signedIn: boolean }) {
  const [booked, setBooked] = useState(false);
  const [zone, setZone] = useState("America/Toronto");
  const zoned = formatZonedRange(SLOT, SLOT_END, zone);
  const oneToOne = formatZonedRange("2026-10-14T23:00:00.000Z", "2026-10-15T00:00:00.000Z", zone);
  const allowed = canReschedule("2026-10-16T23:00:00.000Z", new Date(), DEFAULT_SETTINGS.oneToOneRescheduleNoticeHours);

  if (!signedIn) {
    return <SignUpPrompt context="landing" presentation="inline" items={["Free 15-minute strategy call"]} />;
  }

  return (
    <div className="mt-6 space-y-8">
      <label className="block text-sm font-semibold">
        Timezone
        <select className="mt-1 min-h-11 w-full rounded-xl border border-ink/15 px-3 text-base" value={zone} onChange={(event) => setZone(event.target.value)}>
          <option value="America/Toronto">Toronto</option>
          <option value="America/Edmonton">Calgary</option>
          <option value="America/Vancouver">Vancouver</option>
          <option value="Asia/Kolkata">Kolkata</option>
        </select>
      </label>
      <section>
        <h2 className="font-serif text-2xl">Free strategy call</h2>
        <p className="mt-2 text-sm">Times shown in {zoned.zoneName}. Change this in account settings.</p>
        <button
          type="button"
          disabled={booked}
          className="mt-3 min-h-11 rounded-full bg-brand px-4 text-sm font-semibold text-white disabled:opacity-50"
          onClick={() => setBooked(true)}
        >
          {zoned.local}
        </button>
        {booked ? <p className="mt-3">Booked. A second strategy call stays blocked while this one is upcoming. Join on Zoom appears here when the link is ready.</p> : null}
      </section>
      <section>
        <h2 className="font-serif text-2xl">Private 1:1</h2>
        <p className="mt-2 text-sm">{oneToOne.local}. Also shown as {oneToOne.eastern}.</p>
        <p className="mt-2 text-sm">$49 per hour. Not refunded. Free reschedule with {DEFAULT_SETTINGS.oneToOneRescheduleNoticeHours} hours notice. A missed session counts as used.</p>
        <p className="mt-2 text-sm">{allowed ? "Reschedule is open for a session outside the notice window." : "Reschedule is closed inside the notice window."}</p>
      </section>
      <section>
        <h2 className="font-serif text-2xl">Live batch</h2>
        <p className="mt-2 text-sm">Your card is saved, not charged. You pay $99 only if this batch runs. It runs when {DEFAULT_SETTINGS.batchMinToRun} students reserve.</p>
        <ol className="mt-3 space-y-1 text-sm">
          {BATCH_CURRICULUM.map((item) => (
            <li key={`${item.week}-${item.day}`}>Week {item.week} {item.day}: {item.topic}. 7:30 PM Eastern.</li>
          ))}
        </ol>
        <p className="mt-3 text-sm">Seats left: 6 of {DEFAULT_SETTINGS.batchSeatCap}. Needs {DEFAULT_SETTINGS.batchMinToRun} to run.</p>
      </section>
    </div>
  );
}
