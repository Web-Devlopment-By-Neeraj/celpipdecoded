import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import { Readable } from "node:stream";
import { NextResponse } from "next/server";
import { requireAppUser } from "@/features/platform/guards";
import { contentTypeForFileName, isStorageKey } from "@/features/courses/catalog";
import { findLesson } from "@/features/courses/library";
import { parseByteRange } from "@/features/courses/media";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Params = { params: Promise<{ courseSlug: string; lessonId: string }> };

// Streams one lesson. The file is read from disk in the requested byte
// range so a long video can seek without loading the whole file.
// Open-ended ranges are capped so a single response cannot be a gigabyte.
async function handle(request: Request, params: Params["params"]): Promise<Response> {
  const auth = await requireAppUser(request, { allowUnconfirmed: true });
  if (!auth.ok) return auth.response;

  const { courseSlug, lessonId } = await params;
  if (!isStorageKey(courseSlug) || !isStorageKey(lessonId)) {
    return NextResponse.json({ ok: false, error: "Unknown lesson." }, { status: 404 });
  }

  const found = await findLesson(courseSlug, lessonId);
  if (!found) {
    return NextResponse.json({ ok: false, error: "Unknown lesson." }, { status: 404 });
  }

  // Signed-in learners can open the stream. The player stops a preview at
  // the preview length. The bytes are not cut here: some videos keep their
  // index at the end of the file, and a player needs that index to start.

  let size = 0;
  try {
    size = (await stat(found.lesson.absolutePath)).size;
  } catch {
    return NextResponse.json({ ok: false, error: "This lesson file is missing." }, { status: 404 });
  }

  const range = parseByteRange(request.headers.get("range"), size);
  if (range === "unsatisfiable") {
    return new Response(null, {
      status: 416,
      headers: { "Content-Range": `bytes */${size}` },
    });
  }

  const partial = range != null;
  const start = partial ? range.start : 0;
  const end = partial ? range.end : size - 1;
  const contentType = contentTypeForFileName(found.lesson.fileName);

  const headers = new Headers({
    "Content-Type": contentType,
    "Accept-Ranges": "bytes",
    "Content-Length": String(end - start + 1),
    "Cache-Control": "private, no-store",
    "Content-Disposition": "inline",
    "X-Content-Type-Options": "nosniff",
  });

  if (partial) {
    headers.set("Content-Range", `bytes ${start}-${end}/${size}`);
  }

  if (request.method === "HEAD") {
    return new Response(null, { status: partial ? 206 : 200, headers });
  }

  const nodeStream = createReadStream(found.lesson.absolutePath, { start, end });
  const webStream = Readable.toWeb(nodeStream) as ReadableStream<Uint8Array>;
  return new Response(webStream, { status: partial ? 206 : 200, headers });
}

export async function GET(request: Request, context: Params) {
  return handle(request, context.params);
}

export async function HEAD(request: Request, context: Params) {
  return handle(request, context.params);
}
