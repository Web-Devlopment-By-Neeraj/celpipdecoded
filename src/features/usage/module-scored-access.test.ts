import { describe, expect, it } from "vitest";
import { EMPTY_USAGE_ACCESS_SUMMARY } from "@/features/usage/access-types";
import { remainingScoredAttemptsForModule } from "@/features/usage/module-scored-access";
import {
  SPEAKING_MODULE_SLUG,
  WRITING_MODULE_SLUG,
} from "@/features/usage/ai-usage-types";

describe("remainingScoredAttemptsForModule", () => {
  it("uses speaking free bucket only for speaking", () => {
    const summary = {
      ...EMPTY_USAGE_ACCESS_SUMMARY,
      accessStatus: "active" as const,
      freeSpeakingRemaining: 1,
      freeWritingRemaining: 0,
      monthlyAttemptsRemaining: 0,
      paidAttemptsRemaining: 0,
    };
    expect(
      remainingScoredAttemptsForModule(summary, SPEAKING_MODULE_SLUG),
    ).toBe(1);
    expect(
      remainingScoredAttemptsForModule(summary, WRITING_MODULE_SLUG),
    ).toBe(0);
  });
});
