import { NextResponse } from "next/server";
import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { generateSpeakingFeedback } from "@/features/speaking/generate-speaking-feedback";
import { feedbackCopy } from "@/features/speaking/practice-flow";

// Prepares AI practice feedback for an uploaded speaking attempt.
// Transcribes the audio in the backend when needed, then scores the
// transcript. Auth comes from the caller's session cookies; ownership
// of the attempt is verified server side before any work happens.
export const runtime = "nodejs";

const bodySchema = z.object({
  attemptId: z.uuid(),
});

export async function POST(request: Request) {
  let payload: unknown;

  try {
    payload = await request.json();
  } catch {
    return NextResponse.json(
      { ok: false, error: feedbackCopy.errors.invalidRequest },
      { status: 400 },
    );
  }

  const parsed = bodySchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: feedbackCopy.errors.invalidRequest },
      { status: 400 },
    );
  }

  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      { ok: false, error: feedbackCopy.errors.sessionExpired },
      { status: 401 },
    );
  }

  try {
    const result = await generateSpeakingFeedback({
      attemptId: parsed.data.attemptId,
      userId: user.id,
    });

    if (!result.ok) {
      // code is present only for a blocked scored attempt, where the
      // status is 402 and the client shows the access message.
      return NextResponse.json(
        { ok: false, error: result.message, ...(result.code ? { code: result.code } : {}) },
        { status: result.status },
      );
    }

    return NextResponse.json({
      ok: true,
      attemptId: result.attemptId,
      resultPath: result.resultPath,
    });
  } catch (err) {
    console.error("Feedback route error:", err);
    return NextResponse.json(
      { ok: false, error: feedbackCopy.errors.requestFailed },
      { status: 500 },
    );
  }
}
