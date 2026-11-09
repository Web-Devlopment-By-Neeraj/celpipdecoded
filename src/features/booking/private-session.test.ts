import { describe, expect, it } from "vitest";
import {
  AMAR_TIME_ZONE,
  earliestBookableInstant,
  openSlots,
  settlementForSlot,
  STUDENT_TIME_ZONE,
} from "@/features/booking/private-session";
import { zonedParts } from "@/features/platform/time";

describe("private 1:1 slots", () => {
  it("hides today and tomorrow in Toronto, then opens the day after", () => {
    // Monday 2 Nov 2026, 3:00 PM Toronto (UTC-5 in November).
    const monday = new Date("2026-11-02T20:00:00.000Z");
    const earliest = earliestBookableInstant(monday);
    const day = zonedParts(earliest, STUDENT_TIME_ZONE);
    expect(day.year).toBe(2026);
    expect(day.month).toBe(11);
    expect(day.day).toBe(4);

    const slots = openSlots(monday, []);
    const tuesday = slots.filter((start) => {
      const parts = zonedParts(start, STUDENT_TIME_ZONE);
      return parts.day === 3 && parts.month === 11;
    });
    expect(tuesday).toHaveLength(0);
    expect(slots.length).toBeGreaterThan(0);
    const first = zonedParts(slots[0], STUDENT_TIME_ZONE);
    expect(first.day).toBeGreaterThanOrEqual(4);
  });

  it("removes a time that is already held", () => {
    const monday = new Date("2026-11-02T20:00:00.000Z");
    const open = openSlots(monday, []);
    const taken = open[0];
    const remaining = openSlots(monday, [
      { start: taken, end: new Date(taken.getTime() + 60 * 60 * 1000) },
    ]);
    expect(remaining.some((start) => start.getTime() === taken.getTime())).toBe(false);
  });

  it("keeps using the student's calendar day late at night in Canada", () => {
    // Monday 2 Nov 2026, 11:00 PM Toronto is already Tuesday morning in India.
    const lateMonday = new Date("2026-11-03T04:00:00.000Z");
    const tooSoon = openSlots(lateMonday, []).filter((start) => {
      const parts = zonedParts(start, STUDENT_TIME_ZONE);
      return parts.month === 11 && parts.day < 4;
    });
    expect(tooSoon).toHaveLength(0);
  });

  it("offers Amar's India afternoon on the same Canada calendar day", () => {
    const monday = new Date("2026-11-02T20:00:00.000Z");
    const first = openSlots(monday, [])[0];
    const india = zonedParts(first, AMAR_TIME_ZONE);
    const canada = zonedParts(first, STUDENT_TIME_ZONE);
    expect(india.hour).toBeGreaterThanOrEqual(16);
    expect(india.hour).toBeLessThanOrEqual(21);
    expect(canada.year).toBe(india.year);
    expect(canada.month).toBe(india.month);
    expect(canada.day).toBe(india.day);
  });

  it("keeps a paid student on another time instead of refunding", () => {
    expect(settlementForSlot("mine")).toBe("confirm");
    expect(settlementForSlot("free")).toBe("confirm");
    expect(settlementForSlot("taken")).toBe("needs_slot");
  });
});
