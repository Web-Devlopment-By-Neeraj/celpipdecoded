import { createSign } from "crypto";
import { AMAR_TIME_ZONE, formatDualTime, type BusyInterval } from "@/features/booking/private-session";
import { zonedParts } from "@/features/platform/time";

// Turns on when Amar's Workspace calendar is shared with a service
// account and these three values are set. Until then the app uses only
// its own holds and paid bookings.

export function googleCalendarConfigured(): boolean {
  return Boolean(
    process.env.GOOGLE_CALENDAR_ID &&
      process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL &&
      process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY,
  );
}

type TokenCache = { token: string; expiresAt: number };
let tokenCache: TokenCache | null = null;

function privateKey(): string {
  return (process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY ?? "").replace(/\\n/g, "\n");
}

function base64Url(value: string | Buffer): string {
  return Buffer.from(value).toString("base64url");
}

async function accessToken(): Promise<string | null> {
  if (!googleCalendarConfigured()) return null;
  if (tokenCache && tokenCache.expiresAt > Date.now() + 60_000) return tokenCache.token;

  const now = Math.floor(Date.now() / 1000);
  const header = base64Url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const claims = base64Url(
    JSON.stringify({
      iss: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      scope: "https://www.googleapis.com/auth/calendar",
      aud: "https://oauth2.googleapis.com/token",
      iat: now,
      exp: now + 3600,
    }),
  );
  const unsigned = `${header}.${claims}`;
  const signer = createSign("RSA-SHA256");
  signer.update(unsigned);
  const assertion = `${unsigned}.${signer.sign(privateKey()).toString("base64url")}`;

  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion,
    }),
  });
  const payload = (await response.json()) as { access_token?: string; expires_in?: number };
  if (!response.ok || !payload.access_token) return null;
  tokenCache = {
    token: payload.access_token,
    expiresAt: Date.now() + (payload.expires_in ?? 3600) * 1000,
  };
  return payload.access_token;
}

export async function googleBusy(rangeStart: Date, rangeEnd: Date): Promise<BusyInterval[]> {
  const token = await accessToken();
  const calendarId = process.env.GOOGLE_CALENDAR_ID;
  if (!token || !calendarId) return [];

  const response = await fetch("https://www.googleapis.com/calendar/v3/freeBusy", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      timeMin: rangeStart.toISOString(),
      timeMax: rangeEnd.toISOString(),
      items: [{ id: calendarId }],
    }),
  });
  if (!response.ok) return [];
  const payload = (await response.json()) as {
    calendars?: Record<string, { busy?: { start?: string; end?: string }[] }>;
  };
  const busy = payload.calendars?.[calendarId]?.busy ?? [];
  return busy.flatMap((interval) => {
    if (!interval.start || !interval.end) return [];
    return [{ start: new Date(interval.start), end: new Date(interval.end) }];
  });
}

function amarClock(instant: Date): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: AMAR_TIME_ZONE,
    hour: "numeric",
    minute: "2-digit",
  }).format(instant);
}

function zonedLocalDateTime(instant: Date): string {
  const parts = zonedParts(instant, AMAR_TIME_ZONE);
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${parts.year}-${pad(parts.month)}-${pad(parts.day)}T${pad(parts.hour)}:${pad(parts.minute)}:${pad(parts.second)}`;
}

export async function createGoogleMeeting(input: {
  bookingId: string;
  startsAt: Date;
  endsAt: Date;
  studentEmail: string | null;
}): Promise<{ eventId: string | null; meetUrl: string | null }> {
  const token = await accessToken();
  const calendarId = process.env.GOOGLE_CALENDAR_ID;
  if (!token || !calendarId) return { eventId: null, meetUrl: null };

  const when = formatDualTime(input.startsAt);
  const description = [
    input.studentEmail ? `Student ${input.studentEmail}.` : null,
    `Student time: ${when.toronto}.`,
    `Your time: ${amarClock(input.startsAt)}.`,
    `Booking ${input.bookingId}.`,
  ]
    .filter(Boolean)
    .join(" ");

  const response = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events?conferenceDataVersion=1`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        summary: "CELPIP Decoded 1:1",
        description,
        start: { dateTime: zonedLocalDateTime(input.startsAt), timeZone: AMAR_TIME_ZONE },
        end: { dateTime: zonedLocalDateTime(input.endsAt), timeZone: AMAR_TIME_ZONE },
        conferenceData: {
          createRequest: {
            requestId: input.bookingId,
            conferenceSolutionKey: { type: "hangoutsMeet" },
          },
        },
      }),
    },
  );
  if (!response.ok) return { eventId: null, meetUrl: null };
  const payload = (await response.json()) as {
    id?: string;
    hangoutLink?: string;
    conferenceData?: { entryPoints?: { entryPointType?: string; uri?: string }[] };
  };
  const meet =
    payload.hangoutLink ??
    payload.conferenceData?.entryPoints?.find((point) => point.entryPointType === "video")?.uri ??
    null;
  return { eventId: payload.id ?? null, meetUrl: meet };
}
