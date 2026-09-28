import { NextResponse } from "next/server";
import { allowanceSnapshot } from "@/features/platform/allowance";
import { requireAppUser } from "@/features/platform/guards";
import { defaultSettings } from "@/features/platform/settings";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const auth = await requireAppUser(request);
  if (!auth.ok) return auth.response;

  const settings = defaultSettings();
  const snapshot = allowanceSnapshot({
    plan: "free",
    limits: {
      freeTotal: settings["eval.free_total"],
      daily: settings["eval.daily"],
      weekly: settings["eval.weekly"],
      monthly: settings["eval.monthly"],
      extraCount: 0,
    },
    events: [],
    reserved: 0,
    waitingCount: 0,
    now: new Date(),
    timeZone: "America/Toronto",
    period: null,
  });

  return NextResponse.json({
    ok: true,
    plan: snapshot.plan,
    leftToday: snapshot.leftToday,
    leftThisWeek: snapshot.leftThisWeek,
    leftThisMonth: snapshot.leftThisMonth,
    leftTotal: snapshot.leftTotal,
    waitingCount: snapshot.waitingCount,
    resetLabel: snapshot.resetLabel,
  });
}
