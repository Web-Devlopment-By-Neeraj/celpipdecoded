import { NextResponse } from "next/server";
import { releaseUnderfilled, type BatchState } from "@/features/platform/batches";
import { releaseUnpaidHolds } from "@/features/platform/calendar";
import { defaultSettings } from "@/features/platform/settings";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const secret = process.env.CRON_SECRET;
  const header = request.headers.get("authorization");
  if (!secret || header !== `Bearer ${secret}`) {
    return NextResponse.json({ ok: false, error: "Unauthorized." }, { status: 401 });
  }

  const settings = defaultSettings();
  const released = releaseUnderfilled(
    {
      batches: [],
      seats: [],
      charges: [],
      emails: [],
      events: [],
      refundTasks: [],
      processedWebhooks: new Set(),
    } satisfies BatchState,
    new Date(),
    settings["batch.release_days_before"],
    null,
  );
  const holds = releaseUnpaidHolds([], new Date());

  return NextResponse.json({
    ok: true,
    releasedBatches: released.batches.length,
    releasedHolds: holds.length,
  });
}
