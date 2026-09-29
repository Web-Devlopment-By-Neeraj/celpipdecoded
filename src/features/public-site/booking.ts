export type ZonedTime = {
  local: string;
  zoneName: string;
  eastern: string;
};

export function formatZonedRange(
  startIso: string,
  endIso: string,
  timeZone: string,
): ZonedTime {
  const start = new Date(startIso);
  const end = new Date(endIso);
  const local = `${formatDate(start, timeZone)}, ${formatTime(start, timeZone)}-${formatTime(end, timeZone)} ${zoneName(start, timeZone)}`;
  const eastern = `${formatTime(start, "America/Toronto")}-${formatTime(end, "America/Toronto")} Eastern`;
  return { local, zoneName: zoneName(start, timeZone), eastern };
}

export function canReschedule(startsAtIso: string, now: Date, noticeHours: number): boolean {
  return Date.parse(startsAtIso) - now.getTime() >= noticeHours * 3_600_000;
}

export function rescheduleBlockReason(noticeHours: number): string {
  return `Reschedule is available until ${noticeHours} hours before the session.`;
}

function formatDate(date: Date, timeZone: string): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone,
    weekday: "short",
    day: "numeric",
    month: "short",
  }).format(date);
}

function formatTime(date: Date, timeZone: string): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone,
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

function zoneName(date: Date, timeZone: string): string {
  const part = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    timeZoneName: "long",
  })
    .formatToParts(date)
    .find((item) => item.type === "timeZoneName");
  return part?.value ?? timeZone;
}

export const BATCH_CURRICULUM = [
  { week: 1, day: "Monday", topic: "Listening Parts 1, 2, 3 and 4" },
  { week: 1, day: "Tuesday", topic: "Listening Parts 5 and 6" },
  { week: 1, day: "Thursday", topic: "Reading Parts 1 and 2" },
  { week: 1, day: "Friday", topic: "Reading Parts 3 and 4" },
  { week: 2, day: "Monday", topic: "Writing Task 1" },
  { week: 2, day: "Tuesday", topic: "Writing Task 2" },
  { week: 2, day: "Thursday", topic: "Speaking Tasks 1, 2, 3 and 4" },
  { week: 2, day: "Friday", topic: "Speaking Tasks 5, 6, 7 and 8" },
] as const;
