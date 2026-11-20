import { describe, expect, it } from "vitest";
import { mockResultsHref, mockSectionHref, mockSlugFromHub } from "./mock-run";

describe("mock run links", () => {
  it("builds the same section path a CSV test and Mock Test 1 use", () => {
    expect(mockSectionHref("mock-test-1", "reading", "section")).toBe(
      "/dashboard/mock-tests/mock-test-1/reading",
    );
    expect(mockSectionHref("mock-test-2", "listening", "full")).toBe(
      "/dashboard/mock-tests/mock-test-2/listening?flow=full",
    );
    expect(mockResultsHref("mock-test-1")).toBe(
      "/dashboard/mock-tests/mock-test-1/results",
    );
    expect(mockSlugFromHub("/dashboard/mock-tests/mock-test-4")).toBe(
      "mock-test-4",
    );
  });
});
