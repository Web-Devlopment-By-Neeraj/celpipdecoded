import { NextResponse } from "next/server";
import { requireAppUser } from "@/features/platform/guards";
import { clampPosition, isStorageKey } from "@/features/courses/catalog";
import { findLesson } from "@/features/courses/library";
import { saveLessonProgress } from "@/features/courses/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const auth = await requireAppUser(request, { allowUnconfirmed: true });
  if (!auth.ok) return auth.response;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid progress." }, { status: 400 });
  }

  if (!body || typeof body !== "object") {
    return NextResponse.json({ ok: false, error: "Invalid progress." }, { status: 400 });
  }

  const record = body as Record<string, unknown>;
  const courseSlug = typeof record.courseSlug === "string" ? record.courseSlug : "";
  const lessonId = typeof record.lessonId === "string" ? record.lessonId : "";
  const positionSeconds = clampPosition(record.positionSeconds);
  const completed = record.completed === true;
  const clearCompletion = record.clearCompletion === true;

  if (!isStorageKey(courseSlug) || !isStorageKey(lessonId) || positionSeconds == null) {
    return NextResponse.json({ ok: false, error: "Invalid progress." }, { status: 400 });
  }

  const found = await findLesson(courseSlug, lessonId);
  if (!found) {
    return NextResponse.json({ ok: false, error: "Unknown lesson." }, { status: 404 });
  }

  try {
    await saveLessonProgress({
      userId: auth.user.id,
      courseSlug,
      lessonId,
      positionSeconds,
      completed,
      clearCompletion,
    });
  } catch {
    return NextResponse.json({ ok: false, error: "Progress could not be saved." }, { status: 503 });
  }

  return NextResponse.json({ ok: true });
}
