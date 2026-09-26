import { NextResponse } from "next/server";
import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { writingPracticeCopy } from "@/features/writing/task-copy";
import {
  countWords,
  MIN_SUBMIT_WORD_COUNT,
} from "@/features/writing/word-count";

// Saves a submitted writing response as a row in public.attempts.
// Auth comes from the caller's session cookies and the insert runs
// with the user's own session client, so RLS guarantees the attempt
// can only be created for the caller. No AI evaluation, no scores,
// no usage events, and no credit deduction happen here.
export const runtime = "nodejs";

const bodySchema = z.object({
  taskId: z.uuid(),
  responseText: z.string().min(1).max(50000),
  wordCount: z.number().int().min(0),
  timeSpentSeconds: z.number().int().min(0),
});

// Upper bound for stored time spent, so a stuck client clock cannot
// write an absurd value. One day in seconds.
const MAX_TIME_SPENT_SECONDS = 86400;

export async function POST(request: Request) {
  let payload: unknown;

  try {
    payload = await request.json();
  } catch {
    return NextResponse.json(
      { ok: false, error: writingPracticeCopy.errors.invalidRequest },
      { status: 400 },
    );
  }

  const parsed = bodySchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: writingPracticeCopy.errors.invalidRequest },
      { status: 400 },
    );
  }

  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      { ok: false, error: writingPracticeCopy.errors.sessionExpired },
      { status: 401 },
    );
  }

  // The word count is recomputed on the server so the stored value
  // always matches the stored text, whatever the client sent.
  const responseText = parsed.data.responseText;
  const wordCount = countWords(responseText);

  if (wordCount < MIN_SUBMIT_WORD_COUNT) {
    return NextResponse.json(
      { ok: false, error: writingPracticeCopy.tooShortMessage },
      { status: 422 },
    );
  }

  // Verify the task exists, is active, and belongs to the writing
  // module, and fetch its writing details in the same query. RLS also
  // limits this select to active tasks.
  const { data: task, error: taskError } = await supabase
    .from("tasks")
    .select(
      "id, module_id, status, modules!inner(slug), writing_task_details(time_seconds, word_min, word_max)",
    )
    .eq("id", parsed.data.taskId)
    .eq("modules.slug", "celpip-writing")
    .eq("status", "active")
    .maybeSingle();

  if (taskError) {
    console.error("Writing attempts route task lookup error:", taskError);
    return NextResponse.json(
      { ok: false, error: writingPracticeCopy.errors.saveFailed },
      { status: 500 },
    );
  }

  if (!task || !task.module_id) {
    return NextResponse.json(
      { ok: false, error: writingPracticeCopy.errors.taskNotFound },
      { status: 404 },
    );
  }

  const timeSpentSeconds = Math.min(
    parsed.data.timeSpentSeconds,
    MAX_TIME_SPENT_SECONDS,
  );

  const submittedAt = new Date().toISOString();

  const { data: attempt, error: insertError } = await supabase
    .from("attempts")
    .insert({
      user_id: user.id,
      module_id: task.module_id,
      task_id: task.id,
      status: "writing_submitted",
      response_text: responseText,
      word_count: wordCount,
      time_spent_seconds: timeSpentSeconds,
      writing_submitted_at: submittedAt,
      submitted_at: submittedAt,
    })
    .select("id")
    .single();

  if (insertError || !attempt) {
    console.error("Writing attempts route insert error:", insertError);
    return NextResponse.json(
      { ok: false, error: writingPracticeCopy.errors.saveFailed },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true, attemptId: attempt.id });
}
