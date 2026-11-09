import { NextResponse } from "next/server";
import { requireAppUser } from "@/features/platform/guards";
import { rateLimitMessage } from "@/features/platform/security";
import { isStorageKey } from "@/features/courses/catalog";
import { findLesson } from "@/features/courses/library";
import {
  addComment,
  commentRateDecision,
  deleteOwnComment,
  listComments,
} from "@/features/courses/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function toClient(
  comments: Awaited<ReturnType<typeof listComments>>,
  userId: string,
) {
  return comments.map((comment) => ({
    id: comment.id,
    authorLabel: comment.authorLabel,
    body: comment.body,
    createdAt: comment.createdAt,
    mine: comment.userId === userId,
  }));
}

export async function GET(request: Request) {
  const auth = await requireAppUser(request, { allowUnconfirmed: true });
  if (!auth.ok) return auth.response;

  const url = new URL(request.url);
  const courseSlug = url.searchParams.get("course") ?? "";
  const lessonId = url.searchParams.get("lesson") ?? "";
  if (!isStorageKey(courseSlug) || !isStorageKey(lessonId)) {
    return NextResponse.json({ ok: false, error: "Unknown lesson." }, { status: 404 });
  }
  if (!(await findLesson(courseSlug, lessonId))) {
    return NextResponse.json({ ok: false, error: "Unknown lesson." }, { status: 404 });
  }

  try {
    const comments = await listComments(courseSlug, lessonId);
    return NextResponse.json({ ok: true, comments: toClient(comments, auth.user.id) });
  } catch {
    return NextResponse.json({ ok: false, error: "Comments could not be loaded." }, { status: 503 });
  }
}

export async function POST(request: Request) {
  const auth = await requireAppUser(request, { allowUnconfirmed: true });
  if (!auth.ok) return auth.response;

  const limit = commentRateDecision(auth.user.id);
  if (!limit.ok) {
    return NextResponse.json(
      { ok: false, error: rateLimitMessage(limit.retryAfterSeconds) },
      { status: 429 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Write a comment first." }, { status: 400 });
  }
  if (!body || typeof body !== "object") {
    return NextResponse.json({ ok: false, error: "Write a comment first." }, { status: 400 });
  }

  const record = body as Record<string, unknown>;
  const courseSlug = typeof record.courseSlug === "string" ? record.courseSlug : "";
  const lessonId = typeof record.lessonId === "string" ? record.lessonId : "";
  if (!isStorageKey(courseSlug) || !isStorageKey(lessonId)) {
    return NextResponse.json({ ok: false, error: "Unknown lesson." }, { status: 404 });
  }
  if (!(await findLesson(courseSlug, lessonId))) {
    return NextResponse.json({ ok: false, error: "Unknown lesson." }, { status: 404 });
  }

  try {
    const comment = await addComment({
      userId: auth.user.id,
      email: auth.user.email,
      courseSlug,
      lessonId,
      body: record.body,
    });
    return NextResponse.json({
      ok: true,
      comment: {
        id: comment.id,
        authorLabel: comment.authorLabel,
        body: comment.body,
        createdAt: comment.createdAt,
        mine: true,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Comment could not be posted.";
    const status = message.startsWith("Write a comment") ? 400 : 503;
    return NextResponse.json({ ok: false, error: message }, { status });
  }
}

export async function DELETE(request: Request) {
  const auth = await requireAppUser(request, { allowUnconfirmed: true });
  if (!auth.ok) return auth.response;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Unknown comment." }, { status: 400 });
  }
  if (!body || typeof body !== "object") {
    return NextResponse.json({ ok: false, error: "Unknown comment." }, { status: 400 });
  }
  const record = body as Record<string, unknown>;
  const courseSlug = typeof record.courseSlug === "string" ? record.courseSlug : "";
  const lessonId = typeof record.lessonId === "string" ? record.lessonId : "";
  const commentId = typeof record.commentId === "string" ? record.commentId : "";

  try {
    const result = await deleteOwnComment({
      userId: auth.user.id,
      courseSlug,
      lessonId,
      commentId,
    });
    if (result === "forbidden") {
      return NextResponse.json({ ok: false, error: "You can only remove your own comment." }, { status: 403 });
    }
    if (result === "missing") {
      return NextResponse.json({ ok: false, error: "That comment is already gone." }, { status: 404 });
    }
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false, error: "Comment could not be removed." }, { status: 503 });
  }
}
