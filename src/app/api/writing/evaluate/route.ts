import { NextResponse } from "next/server";
import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { generateWritingFeedback } from "@/features/writing/generate-writing-feedback";
import { writingEvaluationCopy } from "@/features/writing/task-copy";

// Prepares AI practice feedback for a saved writing attempt. Auth
// comes from the caller's session cookies; ownership of the attempt
// and its module are verified server side before any AI work happens.
// No usage events are created and no credits are deducted here.
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
      { ok: false, error: writingEvaluationCopy.errors.invalidRequest },
      { status: 400 },
    );
  }

  const parsed = bodySchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: writingEvaluationCopy.errors.invalidRequest },
      { status: 400 },
    );
  }

  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      { ok: false, error: writingEvaluationCopy.errors.sessionExpired },
      { status: 401 },
    );
  }

  try {
    const result = await generateWritingFeedback({
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
    console.error("Writing evaluate route error:", err);
    return NextResponse.json(
      { ok: false, error: writingEvaluationCopy.errors.requestFailed },
      { status: 500 },
    );
  }
}
