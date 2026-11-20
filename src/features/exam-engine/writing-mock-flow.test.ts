import { describe, expect, it } from "vitest";
import { mockTest1WritingSection } from "./mock-tests/mock-test-1/writing-section";
import { buildWritingSectionFlow } from "./writing-mock-flow";

describe("buildWritingSectionFlow", () => {
  it("keeps Writing Task 2 on one screen with the editor", () => {
    const kinds = buildWritingSectionFlow(mockTest1WritingSection).map(
      (screen) => screen.kind,
    );

    expect(kinds).not.toContain("task-choice");
    expect(kinds.filter((kind) => kind === "task")).toEqual(["task", "task"]);
  });
});
