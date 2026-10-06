import { describe, expect, it } from "vitest";
import {
  ANALYTICS_EVENTS,
  QUESTION_TYPE_LABELS,
  formatCad,
  refundDecision,
  renewalReminderEmail,
  seatReservedEmail,
} from "./pack-surface";

describe("pack surface", () => {
  it("keeps question labels and analytics names free of the forbidden phrase", () => {
    const blob = [...QUESTION_TYPE_LABELS, ...ANALYTICS_EVENTS].join(" ");
    expect(blob.toLowerCase()).not.toContain("your celpip score");
    expect(QUESTION_TYPE_LABELS.length).toBeGreaterThan(8);
    expect(ANALYTICS_EVENTS).toContain("crs_calculated");
  });

  it("moves a seat only when the student cancels early enough", () => {
    expect(refundDecision(72, 48)).toBe("move_to_next_block");
    expect(refundDecision(24, 48)).toBe("no_refund");
  });

  it("states that a reserved seat is not charged yet", () => {
    const email = seatReservedEmail("October batch");
    expect(email.subject).toContain("October batch");
    expect(email.body).toContain("Nothing is charged yet");
    expect(renewalReminderEmail("Test Sprint", "4 Oct 2026").body).toContain("practice");
    expect(renewalReminderEmail("Test Sprint", "4 Oct 2026").body.toLowerCase()).not.toContain(
      "your celpip score",
    );
  });

  it("formats prices in CAD from integer cents", () => {
    expect(formatCad(4900)).toBe("$49.00 CAD");
    expect(formatCad(19900)).toBe("$199.00 CAD");
  });
});
