import { NextResponse } from "next/server";
import { earlyAccessSchema } from "@/lib/validation/earlyAccess";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export const runtime = "nodejs";

export async function POST(request: Request) {
  let payload: unknown;

  try {
    payload = await request.json();
  } catch {
    return NextResponse.json(
      { ok: false, error: "Invalid request body." },
      { status: 400 },
    );
  }

  const parsed = earlyAccessSchema.safeParse(payload);

  if (!parsed.success) {
    const firstIssue = parsed.error.issues[0];
    return NextResponse.json(
      {
        ok: false,
        error: firstIssue?.message ?? "Please check the form and try again.",
      },
      { status: 400 },
    );
  }

  const data = parsed.data;

  // Normalise optional empty strings to null so the database stays clean.
  const toNull = (value: string | undefined) =>
    value && value.trim().length > 0 ? value.trim() : null;

  try {
    const supabase = getSupabaseAdmin();

    const { error } = await supabase.from("early_access_leads").insert({
      full_name: data.full_name,
      email: data.email,
      preparing_status: toNull(data.preparing_status),
      test_date: toNull(data.test_date),
      current_practice_method: toNull(data.current_practice_method),
      hardest_part: toNull(data.hardest_part),
      willingness_to_pay: data.willingness_to_pay,
      notes: toNull(data.notes),
    });

    if (error) {
      console.error("Supabase insert failed:", error.message);
      return NextResponse.json(
        {
          ok: false,
          error: "We could not save your response. Please try again shortly.",
        },
        { status: 500 },
      );
    }
  } catch (err) {
    console.error("Early access route error:", err);
    return NextResponse.json(
      {
        ok: false,
        error: "Something went wrong on our side. Please try again shortly.",
      },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true });
}
