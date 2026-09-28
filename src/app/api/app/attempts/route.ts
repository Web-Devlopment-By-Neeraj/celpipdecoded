import { NextResponse } from "next/server";
import { canStartMock } from "@/features/platform/entitlements";
import { requireAppUser } from "@/features/platform/guards";
import { buildScript, defaultPartTimings } from "@/features/platform/player";
import { sectionNeedsNotice } from "@/features/platform/allowance";

export const runtime = "nodejs";

const listening = {
  conversations: [
    { id: "c1", questionCount: 3, audioSeconds: 45 },
    { id: "c2", questionCount: 3, audioSeconds: 45 },
    { id: "c3", questionCount: 2, audioSeconds: 45 },
  ],
  part2: { audioSeconds: 60, questions: 5 },
  part3: { audioSeconds: 60, questions: 6 },
  part4: { audioSeconds: 70, questions: 5 },
  part5: { videoSeconds: 80, questions: 8 },
  part6: { audioSeconds: 60, questions: 6 },
  introVideoSeconds: 30,
  instructionVideoSeconds: 20,
};

export async function POST(request: Request) {
  const auth = await requireAppUser(request);
  if (!auth.ok) return auth.response;

  const body = (await request.json().catch(() => null)) as {
    mockTestId?: string;
    scope?: "full" | "listening" | "reading" | "writing" | "speaking";
    mode?: "practice" | "test";
  } | null;

  const mockTestId = body?.mockTestId ?? "";
  const scope = body?.scope ?? "full";
  const mode = body?.mode ?? "practice";

  if (!canStartMock(mockTestId, [], new Date())) {
    return NextResponse.json(
      { ok: false, error: "This practice test is locked." },
      { status: 403 },
    );
  }

  const script = buildScript({
    scope,
    mode,
    timings: defaultPartTimings(),
    listening,
  });

  const notice =
    scope === "speaking" || scope === "full"
      ? sectionNeedsNotice(8, 3)
      : scope === "writing"
        ? sectionNeedsNotice(2, 3)
        : null;

  return NextResponse.json({
    ok: true,
    attempt: {
      userId: auth.user.id,
      mockTestId,
      scope,
      mode,
      screenStartedAt: new Date().toISOString(),
      script,
      notice,
    },
  });
}
