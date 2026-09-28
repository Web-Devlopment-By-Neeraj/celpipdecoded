// Timezone helpers for allowances, batch release, and calendar events.
//
// Day and week boundaries are computed in an IANA zone, never from the
// server's local zone. Week starts Monday 00:00 local, including across
// a daylight-saving change.

export type ZonedParts = {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
  // 0 Sunday through 6 Saturday.
  weekday: number;
};

const WEEKDAY: Record<string, number> = {
  Sun: 0,
  Mon: 1,
  Tue: 2,
  Wed: 3,
  Thu: 4,
  Fri: 5,
  Sat: 6,
};

export function zonedParts(instant: Date, timeZone: string): ZonedParts {
  const formatted = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hourCycle: "h23",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    weekday: "short",
  }).formatToParts(instant);

  const read = (type: Intl.DateTimeFormatPartTypes) =>
    formatted.find((part) => part.type === type)?.value ?? "";

  let hour = Number(read("hour"));
  if (hour === 24) hour = 0;

  return {
    year: Number(read("year")),
    month: Number(read("month")),
    day: Number(read("day")),
    hour,
    minute: Number(read("minute")),
    second: Number(read("second")),
    weekday: WEEKDAY[read("weekday")] ?? 0,
  };
}

// Milliseconds to add to a UTC instant to reach the wall clock in `timeZone`.
export function timeZoneOffsetMs(instant: Date, timeZone: string): number {
  const parts = zonedParts(instant, timeZone);
  const asUtc = Date.UTC(
    parts.year,
    parts.month - 1,
    parts.day,
    parts.hour,
    parts.minute,
    parts.second,
  );
  return asUtc - instant.getTime();
}

export function zonedDateTimeToUtc(
  year: number,
  month: number,
  day: number,
  hour: number,
  minute: number,
  second: number,
  timeZone: string,
): Date {
  const utcGuess = Date.UTC(year, month - 1, day, hour, minute, second);
  let instant = utcGuess;
  for (let pass = 0; pass < 3; pass += 1) {
    const offset = timeZoneOffsetMs(new Date(instant), timeZone);
    instant = utcGuess - offset;
  }
  return new Date(instant);
}

export function startOfZonedDay(instant: Date, timeZone: string): Date {
  const parts = zonedParts(instant, timeZone);
  return zonedDateTimeToUtc(
    parts.year,
    parts.month,
    parts.day,
    0,
    0,
    0,
    timeZone,
  );
}

export function nextZonedMidnight(instant: Date, timeZone: string): Date {
  const start = startOfZonedDay(instant, timeZone);
  const parts = zonedParts(start, timeZone);
  const cursor = new Date(Date.UTC(parts.year, parts.month - 1, parts.day));
  cursor.setUTCDate(cursor.getUTCDate() + 1);
  return zonedDateTimeToUtc(
    cursor.getUTCFullYear(),
    cursor.getUTCMonth() + 1,
    cursor.getUTCDate(),
    0,
    0,
    0,
    timeZone,
  );
}

export function startOfZonedWeek(instant: Date, timeZone: string): Date {
  const parts = zonedParts(instant, timeZone);
  const daysSinceMonday = (parts.weekday + 6) % 7;
  const cursor = new Date(Date.UTC(parts.year, parts.month - 1, parts.day));
  cursor.setUTCDate(cursor.getUTCDate() - daysSinceMonday);
  return zonedDateTimeToUtc(
    cursor.getUTCFullYear(),
    cursor.getUTCMonth() + 1,
    cursor.getUTCDate(),
    0,
    0,
    0,
    timeZone,
  );
}

export function nextZonedMonday(instant: Date, timeZone: string): Date {
  const start = startOfZonedWeek(instant, timeZone);
  const parts = zonedParts(start, timeZone);
  const cursor = new Date(Date.UTC(parts.year, parts.month - 1, parts.day));
  cursor.setUTCDate(cursor.getUTCDate() + 7);
  return zonedDateTimeToUtc(
    cursor.getUTCFullYear(),
    cursor.getUTCMonth() + 1,
    cursor.getUTCDate(),
    0,
    0,
    0,
    timeZone,
  );
}

export function addMonths(instant: Date, months: number): Date {
  const day = instant.getUTCDate();
  const shifted = new Date(instant.getTime());
  shifted.setUTCDate(1);
  shifted.setUTCMonth(shifted.getUTCMonth() + months);
  const lastDay = new Date(
    Date.UTC(shifted.getUTCFullYear(), shifted.getUTCMonth() + 1, 0),
  ).getUTCDate();
  shifted.setUTCDate(Math.min(day, lastDay));
  shifted.setUTCHours(
    instant.getUTCHours(),
    instant.getUTCMinutes(),
    instant.getUTCSeconds(),
    instant.getUTCMilliseconds(),
  );
  return shifted;
}

export function formatZoned(
  instant: Date,
  timeZone: string,
  options?: Intl.DateTimeFormatOptions,
): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone,
    hour: "numeric",
    minute: "2-digit",
    hourCycle: "h12",
    ...options,
  }).format(instant);
}

export function timeZoneName(instant: Date, timeZone: string): string {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    timeZoneName: "long",
  }).formatToParts(instant);
  return parts.find((part) => part.type === "timeZoneName")?.value ?? timeZone;
}
