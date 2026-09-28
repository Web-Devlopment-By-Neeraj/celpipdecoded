// Class times stay on the wall clock in America/Toronto, including the
// week daylight saving ends. Google Calendar is the source of truth for
// busy time. Student email is sent only when the change starts here.

import { zonedDateTimeToUtc, zonedParts } from "./time";

const CLASS_DAYS = [1, 2, 4, 5];

export type ClassEvent = {
  startsAt: Date;
  endsAt: Date;
  calendarEventId: string;
  zoomJoinUrl: string;
};

export function batchClassEvents(startsOn: Date, zoomLink: string): ClassEvent[] {
  const first = zonedParts(startsOn, "America/Toronto");
  const cursor = new Date(Date.UTC(first.year, first.month - 1, first.day));
  const events: ClassEvent[] = [];
  while (events.length < 8) {
    const weekday = cursor.getUTCDay();
    if (CLASS_DAYS.includes(weekday)) {
      const start = zonedDateTimeToUtc(
        cursor.getUTCFullYear(),
        cursor.getUTCMonth() + 1,
        cursor.getUTCDate(),
        19,
        30,
        0,
        "America/Toronto",
      );
      const end = zonedDateTimeToUtc(
        cursor.getUTCFullYear(),
        cursor.getUTCMonth() + 1,
        cursor.getUTCDate(),
        20,
        30,
        0,
        "America/Toronto",
      );
      events.push({
        startsAt: start,
        endsAt: end,
        calendarEventId: `cal-${events.length + 1}`,
        zoomJoinUrl: zoomLink,
      });
    }
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }
  return events;
}

export type BusyInterval = { start: Date; end: Date };

export type Slot = { start: Date; end: Date };

export function bookableSlots(
  slots: Slot[],
  busy: BusyInterval[],
  blockedDates: string[],
  timeZone: string,
): Slot[] {
  return slots.filter((slot) => {
    const parts = zonedParts(slot.start, timeZone);
    const date = `${parts.year}-${String(parts.month).padStart(2, "0")}-${String(parts.day).padStart(2, "0")}`;
    if (blockedDates.includes(date)) return false;
    return !busy.some(
      (interval) =>
        slot.start.getTime() < interval.end.getTime() &&
        slot.end.getTime() > interval.start.getTime(),
    );
  });
}

export type Booking = {
  id: string;
  externalRef: string;
  userId: string | null;
  kind: "strategy" | "private" | "batch_class";
  startsAt: Date;
  zoomJoinUrl: string;
  status: "held" | "confirmed" | "cancelled";
  heldUntil: Date | null;
};

export function upsertBooking(bookings: Booking[], incoming: Booking): Booking[] {
  const index = bookings.findIndex((booking) => booking.externalRef === incoming.externalRef);
  if (index === -1) return [...bookings, incoming];
  const next = [...bookings];
  next[index] = { ...next[index], ...incoming, id: next[index].id };
  return next;
}

export function releaseUnpaidHolds(bookings: Booking[], now: Date): Booking[] {
  return bookings.map((booking) =>
    booking.status === "held" && booking.heldUntil && booking.heldUntil.getTime() <= now.getTime()
      ? { ...booking, status: "cancelled" }
      : booking,
  );
}

export type CalendarSnapshot = {
  eventId: string;
  startsAt: Date;
};

export function reconciliationMismatches(
  bookings: Booking[],
  calendar: CalendarSnapshot[],
): string[] {
  const mismatches: string[] = [];
  for (const booking of bookings) {
    if (booking.status === "cancelled") continue;
    const event = calendar.find((item) => item.eventId === booking.externalRef);
    if (!event) {
      mismatches.push(booking.id);
      continue;
    }
    if (event.startsAt.getTime() !== booking.startsAt.getTime()) {
      mismatches.push(booking.id);
    }
  }
  return mismatches;
}

export function rescheduleCopy(
  startsAt: Date,
  studentTimeZone: string,
): string {
  const eastern = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Toronto",
    hour: "numeric",
    minute: "2-digit",
    hourCycle: "h12",
    timeZoneName: "short",
  }).format(startsAt);
  const local = new Intl.DateTimeFormat("en-CA", {
    timeZone: studentTimeZone,
    hour: "numeric",
    minute: "2-digit",
    hourCycle: "h12",
    timeZoneName: "short",
  }).format(startsAt);
  return `${eastern} (${local} for you)`;
}
