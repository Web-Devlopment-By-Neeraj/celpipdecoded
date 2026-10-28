import { describe, expect, it } from "vitest";
import { getGreetingName } from "@/features/dashboard/dashboard-copy";

describe("getGreetingName", () => {
  it("uses the first name saved at signup", () => {
    expect(
      getGreetingName("sahildangibusiness@example.com", "Sahil Dangi"),
    ).toBe("Sahil");
  });

  it("falls back to the email only when no saved name exists", () => {
    expect(getGreetingName("sahil.dangi@example.com", null)).toBe("Sahil");
    expect(getGreetingName("sahildangibusiness@example.com", "  ")).toBe(
      "Sahildangibusiness",
    );
  });
});
