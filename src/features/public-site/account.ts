export function codeExpired(sentAtMs: number, nowMs: number, ttlMinutes: number): boolean {
  return nowMs - sentAtMs > ttlMinutes * 60_000;
}

export function canResendCode(sentAtMs: number, nowMs: number, waitSeconds: number): boolean {
  return nowMs - sentAtMs >= waitSeconds * 1000;
}

export function validWhatsapp(value: string): boolean {
  return /^\+[1-9]\d{7,14}$/.test(value);
}

export function exportLinkExpired(createdAtMs: number, nowMs: number, ttlDays: number): boolean {
  return nowMs - createdAtMs > ttlDays * 86_400_000;
}

export function deletionConfirmed(codeOk: boolean, typed: string): boolean {
  return codeOk && typed === "DELETE";
}

export const MARKETING_CONSENT =
  "Send me news about new batches and offers on WhatsApp and email.";

export const WHATSAPP_LINE =
  "Your WhatsApp number stays with CELPIP Decoded. Amar uses it to remind you before your test and check in after it. It is never sold, and never shared without your permission.";
