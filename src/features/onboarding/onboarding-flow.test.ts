import { describe, expect, it } from "vitest";
import {
  buildFirstStepRecommendation,
  firstNameFromFullName,
  questionKeysForLearner,
  uiStepsForLearner,
} from "@/features/onboarding/onboarding-flow";

describe("onboarding flow", () => {
  it("skips repeat-taker questions for first-time test takers", () => {
    const keys = questionKeysForLearner({ taken_celpip_before: "first_time" });
    expect(keys).not.toContain("times_taken");
    expect(keys).not.toContain("last_test_date");
    expect(keys).not.toContain("last_scores");
    expect(keys).toContain("target_clb");
  });

  it("includes repeat-taker questions when they have taken CELPIP before", () => {
    const keys = questionKeysForLearner({ taken_celpip_before: "repeat" });
    expect(keys).toContain("times_taken");
    expect(keys).toContain("last_scores");
  });

  it("builds finish card for test within 7 days", () => {
    const rec = buildFirstStepRecommendation({
      taken_celpip_before: "first_time",
      next_test: { range: "within_7_days" },
    });
    expect(rec.message).toContain("few days");
    expect(rec.href).toContain("/dashboard/speaking");
  });

  it("uses first name from full name", () => {
    expect(firstNameFromFullName("Amardeep Sihag")).toBe("Amardeep");
    expect(firstNameFromFullName("")).toBe("there");
  });

  it("welcome and finish wrap question steps", () => {
    const steps = uiStepsForLearner({ taken_celpip_before: "first_time" });
    expect(steps[0]).toBe("welcome");
    expect(steps.at(-1)).toBe("finish");
  });
});
