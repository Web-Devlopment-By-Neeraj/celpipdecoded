// Security primitives shared by routes: same-origin checks, signed URLs,
// rate limits, verification codes, and ownership checks.

import { createHmac, timingSafeEqual } from "node:crypto";

export const SESSION_COOKIE = {
  httpOnly: true,
  secure: true,
  sameSite: "lax" as const,
  path: "/",
};

export function sessionCookieIsHostOnly(
  cookie: { domain?: string } & Record<string, unknown>,
): boolean {
  return cookie.domain === undefined;
}

export function safeInternalPath(value: string | null | undefined): string | null {
  if (!value) return null;
  if (!value.startsWith("/")) return null;
  if (value.startsWith("//")) return null;
  if (value.includes("\\") || value.includes("://")) return null;
  return value;
}

export function assertSameOrigin(request: {
  headers: { get(name: string): string | null };
}): boolean {
  const origin = request.headers.get("origin");
  if (!origin) return true;
  const host = request.headers.get("host");
  if (!host) return false;
  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}

export type RateDecision = {
  ok: boolean;
  retryAfterSeconds: number;
};

export function createRateLimiter(clock: () => number) {
  const hits = new Map<string, number[]>();

  return {
    hit(key: string, limit: number, windowMs: number): RateDecision {
      const now = clock();
      const recent = (hits.get(key) ?? []).filter((at) => now - at < windowMs);
      if (recent.length >= limit) {
        const oldest = recent[0] ?? now;
        const retryAfterSeconds = Math.max(
          1,
          Math.ceil((windowMs - (now - oldest)) / 1000),
        );
        hits.set(key, recent);
        return { ok: false, retryAfterSeconds };
      }
      recent.push(now);
      hits.set(key, recent);
      return { ok: true, retryAfterSeconds: 0 };
    },
  };
}

export function rateLimitMessage(retryAfterSeconds: number): string {
  const minutes = Math.max(1, Math.ceil(retryAfterSeconds / 60));
  return `Too many attempts. Please wait ${minutes} minutes and try again.`;
}

export type VerificationState = {
  wrongAttempts: number;
  invalidated: boolean;
  resendCount: number;
  lastResendAt: Date | null;
};

export function applyWrongCode(
  state: VerificationState,
  maxAttempts: number,
): VerificationState {
  const wrongAttempts = state.wrongAttempts + 1;
  return {
    ...state,
    wrongAttempts,
    invalidated: wrongAttempts >= maxAttempts,
  };
}

export function canResend(
  state: VerificationState,
  now: Date,
  minSeconds: number,
  maxPerHour: number,
): { ok: true } | { ok: false; reason: "too_soon" | "hourly_cap" | "invalidated" } {
  if (state.invalidated) return { ok: false, reason: "invalidated" };
  if (state.resendCount >= maxPerHour) return { ok: false, reason: "hourly_cap" };
  if (state.lastResendAt) {
    const elapsed = now.getTime() - state.lastResendAt.getTime();
    if (elapsed < minSeconds * 1000) return { ok: false, reason: "too_soon" };
  }
  return { ok: true };
}

export function signPayload(payload: string, secret: string): string {
  return createHmac("sha256", secret).update(payload).digest("hex");
}

export function verifyStripeSignature(
  rawBody: string,
  header: string | null,
  secret: string,
  now: Date,
  toleranceSeconds = 300,
): boolean {
  if (!header) return false;
  const parts = Object.fromEntries(
    header.split(",").map((piece) => {
      const [key, value] = piece.split("=");
      return [key, value];
    }),
  );
  const timestamp = parts.t;
  const signature = parts.v1;
  if (!timestamp || !signature) return false;
  const age = Math.abs(now.getTime() / 1000 - Number(timestamp));
  if (!Number.isFinite(age) || age > toleranceSeconds) return false;
  const expected = signPayload(`${timestamp}.${rawBody}`, secret);
  const a = Buffer.from(expected);
  const b = Buffer.from(signature);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export function signMediaPath(
  path: string,
  expiresAt: Date,
  secret: string,
): string {
  const payload = `${path}.${expiresAt.getTime()}`;
  return `${payload}.${signPayload(payload, secret)}`;
}

export function verifyMediaPath(
  token: string,
  secret: string,
  now: Date,
): { ok: true; path: string } | { ok: false } {
  const match = token.match(/^(.*)\.(\d+)\.([a-f0-9]+)$/);
  if (!match) return { ok: false };
  const path = match[1];
  const expiresAt = Number(match[2]);
  const signature = match[3];
  if (!path || !signature) return { ok: false };
  if (now.getTime() > expiresAt) return { ok: false };
  const expected = signPayload(`${path}.${expiresAt}`, secret);
  const a = Buffer.from(expected);
  const b = Buffer.from(signature);
  if (a.length !== b.length) return { ok: false };
  if (!timingSafeEqual(a, b)) return { ok: false };
  return { ok: true, path };
}

export function ownsResource(
  resourceUserId: string,
  callerUserId: string | null,
): boolean {
  return Boolean(callerUserId) && resourceUserId === callerUserId;
}

export const SECURITY_HEADERS: Record<string, string> = {
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "X-Frame-Options": "SAMEORIGIN",
  "Permissions-Policy": "camera=(), microphone=(self), geolocation=()",
};
