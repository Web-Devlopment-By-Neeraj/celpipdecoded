import { zonedDateTimeToUtc, zonedParts, startOfZonedDay } from "@/features/platform/time";

// Students book in Canada. Amar's open hours are his clock in India.
// Instants are UTC. Labels are formatted at the edge.

export const STUDENT_TIME_ZONE = "America/Toronto";
export const AMAR_TIME_ZONE = "Asia/Kolkata";

// On Monday the first visible day is Wednesday. Today and the next
// Toronto calendar day stay hidden so a Canada evening, which is already
// the next morning in India, cannot be booked overnight.
export const LEAD_DAYS = 2;

export const SESSION_MINUTES = 60;
export const HOLD_MINUTES = 15;
export const CHECKOUT_HOLD_MINUTES = 30;

// 4:00 PM to 10:00 PM India. The last session starts at 9:00 PM and ends
// at 10:00 PM. In Eastern time that is about 6:30 AM to 12:30 PM, or an
// hour later while Canada is on daylight time.
export const AMAR_FIRST_HOUR = 16;
export const AMAR_LAST_START_HOUR = 21;
export const HORIZON_DAYS = 21;

export type BusyInterval = { start: Date; end: Date };

export type Settlement = "confirm" | "needs_slot";

export function addCalendarDays(
  year: number,
  month: number,
  day: number,
  days: number,
  timeZone: string,
  hour = 0,
  minute = 0,
): Date {
  return zonedDateTimeToUtc(year, month, day + days, hour, minute, 0, timeZone);
}

export function earliestBookableInstant(now: Date): Date {
  const today = zonedParts(startOfZonedDay(now, STUDENT_TIME_ZONE), STUDENT_TIME_ZONE);
  return addCalendarDays(today.year, today.month, today.day, LEAD_DAYS, STUDENT_TIME_ZONE);
}

export function sessionEnd(start: Date): Date {
  return new Date(start.getTime() + SESSION_MINUTES * 60 * 1000);
}

export function overlaps(start: Date, end: Date, busy: BusyInterval[]): boolean {
  return busy.some(
    (interval) =>
      start.getTime() < interval.end.getTime() && end.getTime() > interval.start.getTime(),
  );
}

export function amarSlotStarts(now: Date): Date[] {
  const earliest = earliestBookableInstant(now);
  const origin = zonedParts(now, AMAR_TIME_ZONE);
  const starts: Date[] = [];

  for (let offset = -1; offset <= HORIZON_DAYS + LEAD_DAYS; offset += 1) {
    for (let hour = AMAR_FIRST_HOUR; hour <= AMAR_LAST_START_HOUR; hour += 1) {
      const start = addCalendarDays(
        origin.year,
        origin.month,
        origin.day,
        offset,
        AMAR_TIME_ZONE,
        hour,
      );
      if (start.getTime() < earliest.getTime()) continue;
      const studentDay = zonedParts(start, STUDENT_TIME_ZONE);
      const earliestDay = zonedParts(earliest, STUDENT_TIME_ZONE);
      const studentNumber = studentDay.year * 10000 + studentDay.month * 100 + studentDay.day;
      const earliestNumber =
        earliestDay.year * 10000 + earliestDay.month * 100 + earliestDay.day;
      if (studentNumber < earliestNumber) continue;
      starts.push(start);
    }
  }

  return starts.sort((a, b) => a.getTime() - b.getTime());
}

export function openSlots(now: Date, busy: BusyInterval[]): Date[] {
  return amarSlotStarts(now).filter((start) => !overlaps(start, sessionEnd(start), busy));
}

// A paid student keeps the time when it is still theirs or still free.
// If another student already owns it, the payment becomes a credit for a
// different time. There is no refund branch.
export function settlementForSlot(owner: "mine" | "free" | "taken"): Settlement {
  return owner === "taken" ? "needs_slot" : "confirm";
}

export function formatDualTime(start: Date): {
  dayKey: string;
  dayLabel: string;
  toronto: string;
  india: string;
} {
  const day = zonedParts(start, STUDENT_TIME_ZONE);
  const dayKey = `${day.year}-${String(day.month).padStart(2, "0")}-${String(day.day).padStart(2, "0")}`;
  const dayLabel = new Intl.DateTimeFormat("en-CA", {
    timeZone: STUDENT_TIME_ZONE,
    weekday: "long",
    month: "long",
    day: "numeric",
  }).format(start);
  const toronto = new Intl.DateTimeFormat("en-CA", {
    timeZone: STUDENT_TIME_ZONE,
    hour: "numeric",
    minute: "2-digit",
    timeZoneName: "short",
  }).format(start);
  const india = new Intl.DateTimeFormat("en-CA", {
    timeZone: AMAR_TIME_ZONE,
    hour: "numeric",
    minute: "2-digit",
    timeZoneName: "short",
  }).format(start);
  return { dayKey, dayLabel, toronto, india };
}
