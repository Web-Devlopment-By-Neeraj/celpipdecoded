import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";

function walk(dir: string): string[] {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return walk(full);
    return entry.name.endsWith(".ts") || entry.name.endsWith(".tsx") ? [full] : [];
  }).filter((file) => !file.endsWith(".test.ts"));
}

describe("app routes", () => {
  it("requires a signed-in user on every /api/app route", () => {
    const files = walk("src/app/api/app").filter((file) => file.endsWith("route.ts"));
    expect(files.length).toBeGreaterThan(5);
    for (const file of files) {
      expect(fs.readFileSync(file, "utf8")).toContain("requireAppUser");
    }
  });

  it("does not print the forbidden score phrase in platform UI copy", () => {
    const files = [
      ...walk("src/features/platform"),
      ...walk("src/app/crs"),
      ...walk("src/app/draws"),
      ...walk("src/components/platform"),
    ];
    const forbidden = /your celpip score/i;
    for (const file of files) {
      expect(fs.readFileSync(file, "utf8")).not.toMatch(forbidden);
    }
  });
});
