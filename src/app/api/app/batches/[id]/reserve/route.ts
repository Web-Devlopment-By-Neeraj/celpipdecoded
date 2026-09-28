import { NextResponse } from "next/server";
import { requireAppUser } from "@/features/platform/guards";
import { reserveSeat, type BatchState } from "@/features/platform/batches";
import { defaultSettings } from "@/features/platform/settings";

export const runtime = "nodejs";

type Params = { params: Promise<{ id: string }> };

export async function POST(request: Request, { params }: Params) {
  const auth = await requireAppUser(request);
  if (!auth.ok) return auth.response;
  const { id } = await params;
  const settings = defaultSettings();
  const state: BatchState = {
    batches: [
      {
        id,
        startsOn: new Date(Date.now() + 14 * 86400000),
        seatCap: settings["batch.seat_cap"],
        minToRun: settings["batch.min_to_run"],
        status: "open",
        zoomLink: "",
      },
    ],
    seats: [],
    charges: [],
    emails: [],
    events: [],
    refundTasks: [],
    processedWebhooks: new Set(),
  };
  const reserved = reserveSeat(state, {
    batchId: id,
    userId: auth.user.id,
    webhookId: `setup-${auth.user.id}-${id}`,
    seatId: `seat-${auth.user.id}`,
  });
  if (reserved.error) {
    return NextResponse.json({ ok: false, error: reserved.error }, { status: 409 });
  }
  return NextResponse.json({
    ok: true,
    message: "You pay only if the batch runs. Your card is saved, not charged.",
    events: reserved.state.events,
  });
}
