export const ASK_CATEGORIES = [
  { id: "celpip", label: "CELPIP preparation" },
  { id: "immigration", label: "An immigration question" },
  { id: "account", label: "Account and payment" },
] as const;

export type AskCategory = (typeof ASK_CATEGORIES)[number]["id"];

export const IMMIGRATION_NOTICE =
  "Amar is a CELPIP coach, not a licensed immigration consultant or lawyer. He will answer what is within his knowledge. If you need a licensed professional, he can connect you with one, but only if you ask.";

export function validateQuestion(body: string): string | null {
  const length = body.trim().length;
  if (length < 10) return "Write at least 10 characters.";
  if (length > 5000) return "Keep the question under 5,000 characters.";
  return null;
}

export function replyPromise(hours: number): string {
  return `Amar usually replies within ${hours} hours.`;
}

export function askRateLimited(questionsInWindow: number, limit: number): boolean {
  return questionsInWindow >= limit;
}

const ALLOWED = new Set([
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain",
  "image/jpeg",
  "image/png",
]);

export function attachmentAllowed(mime: string, bytes: number, maxMb: number): string | null {
  if (!ALLOWED.has(mime)) {
    return "Attach a PDF, DOCX, TXT, JPG or PNG.";
  }
  if (bytes > maxMb * 1024 * 1024) {
    return `Attachment must be ${maxMb} MB or smaller.`;
  }
  return null;
}

export function looksLikePdf(bytes: Uint8Array): boolean {
  return bytes.length >= 4 && bytes[0] === 0x25 && bytes[1] === 0x50 && bytes[2] === 0x44 && bytes[3] === 0x46;
}
