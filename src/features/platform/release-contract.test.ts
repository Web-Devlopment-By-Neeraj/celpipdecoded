import { readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const root = fileURLToPath(new URL("../../..", import.meta.url));

function read(relativePath: string) {
  return readFileSync(join(root, relativePath), "utf8");
}

describe("release contract", () => {
  it("documents Vercel and Supabase deploy from the README", () => {
    const readme = read("README.md");
    expect(readme).toContain("scripts/deploy.sh");
    expect(readme).toContain("Vercel");
    expect(readme).toContain("Supabase");
    expect(readme).toContain("ADMIN_EMAILS");
  });

  it("keeps production deploys on main and behind a pull request", () => {
    const deploy = read("scripts/deploy.sh");
    const workflow = read(".github/workflows/deploy.yml");
    const hook = read(".husky/pre-commit");

    expect(deploy).toContain('branch" != "main"');
    expect(deploy).toContain("--skip-git-guard is only available in GitHub Actions");
    expect(workflow).toContain("This commit on main is not part of a pull request");
    expect(workflow).toContain("bash scripts/deploy.sh production");
    expect(hook).toContain('"$branch" = "main"');
  });

  it("runs lint, typecheck, and tests before a local deploy", () => {
    const deploy = read("scripts/deploy.sh");
    expect(deploy).toContain("npm run lint");
    expect(deploy).toContain("npm run typecheck");
    expect(deploy).toContain("npm test");
  });

  it("keeps a remaining-work note for every Neeraj task", () => {
    const remaining = read("docs/remaining.md");
    for (let index = 1; index <= 18; index += 1) {
      expect(remaining).toContain(`N${String(index).padStart(2, "0")}`);
    }
    expect(remaining).toContain("npm run test:e2e");
  });

  it("lists every Neeraj, Avinash, and Sahil task in the e2e checklist", () => {
    const checklist = read("docs/e2e-checklist.md");
    expect(checklist).toContain("npm run test:e2e");
    for (let index = 1; index <= 18; index += 1) {
      expect(checklist).toContain(`N${String(index).padStart(2, "0")}`);
    }
    for (let index = 1; index <= 30; index += 1) {
      expect(checklist).toContain(`A${String(index).padStart(2, "0")}`);
    }
    for (let index = 1; index <= 34; index += 1) {
      expect(checklist).toContain(`S${String(index).padStart(2, "0")}`);
    }
  });
});
