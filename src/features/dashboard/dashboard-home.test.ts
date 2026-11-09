import { describe, expect, it } from "vitest";
import {
  describeEvaluations,
  describeTargetClb,
  describeTestCountdown,
  SPRINT_DAILY_ALLOWANCE,
} from "@/features/dashboard/dashboard-home";
import { EMPTY_USAGE_ACCESS_SUMMARY } from "@/features/usage/access-types";

describe("dashboard home snapshot", () => {
  it("counts whole days until an exact test date", () => {
    const countdown = describeTestCountdown(
      { range: "two_to_four_weeks", exactDate: "2026-11-13" },
      new Date("2026-11-03T16:00:00.000Z"),
    );
    expect(countdown.headline).toBe("10 days left");
  });

  it("uses the sign-up range when there is no exact date", () => {
    const countdown = describeTestCountdown(
      { range: "not_booked", exactDate: null },
      new Date("2026-11-03T16:00:00.000Z"),
    );
    expect(countdown.headline).toBe("Not booked yet");
  });

  it("names the target CLB from the sign-up answer", () => {
    expect(describeTargetClb("clb_9")).toBe("CLB 9");
    expect(describeTargetClb(undefined)).toBe("Not set yet");
  });

  it("shows today and this month only for a Test Sprint account", () => {
    const sprint = describeEvaluations({
      summary: {
        ...EMPTY_USAGE_ACCESS_SUMMARY,
        planCode: "sprint",
        monthlyAttemptsRemaining: 32,
        monthlyAttemptLimit: 40,
      },
      usedToday: 2,
    });
    expect(sprint).toMatchObject({
      kind: "sprint",
      leftToday: SPRINT_DAILY_ALLOWANCE - 2,
      leftThisMonth: 32,
    });

    const free = describeEvaluations({
      summary: {
        ...EMPTY_USAGE_ACCESS_SUMMARY,
        freeSpeakingRemaining: 1,
        freeWritingRemaining: 0,
      },
      usedToday: 0,
    });
    expect(free).toEqual({ kind: "free", speakingLeft: 1, writingLeft: 0 });
  });
});
