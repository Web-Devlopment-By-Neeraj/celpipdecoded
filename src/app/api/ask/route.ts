import { NextResponse } from "next/server";
import { askRateLimited, attachmentAllowed, looksLikePdf, validateQuestion } from "@/features/public-site/ask";
import { DEFAULT_SETTINGS } from "@/features/public-site/settings";

const counts = new Map<string, number>();

export async function POST(request: Request) {
  const form = await request.formData();
  const body = String(form.get("body") ?? "");
  const error = validateQuestion(body);
  if (error) return NextResponse.json({ error }, { status: 400 });
  const user = "session";
  const used = counts.get(user) ?? 0;
  if (askRateLimited(used, DEFAULT_SETTINGS.askAmarDailyLimit)) {
    return NextResponse.json({ error: "You can send 5 questions in 24 hours. Your text is still in the form." }, { status: 429 });
  }
  const file = form.get("file");
  if (file instanceof File && file.size > 0) {
    const bytes = new Uint8Array(await file.arrayBuffer());
    const mime = file.type === "application/pdf" || looksLikePdf(bytes) ? "application/pdf" : file.type;
    if (file.name.endsWith(".exe") || (file.type === "application/pdf" && !looksLikePdf(bytes))) {
      return NextResponse.json({ error: "That file is not a PDF." }, { status: 400 });
    }
    const rejected = attachmentAllowed(mime, file.size, DEFAULT_SETTINGS.askAmarAttachmentMaxMb);
    if (rejected) return NextResponse.json({ error: rejected }, { status: 400 });
  }
  counts.set(user, used + 1);
  return NextResponse.redirect(new URL("/dashboard/ask?sent=1", request.url), 303);
}
