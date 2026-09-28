import { describe, expect, it } from "vitest";
import { addMonths, nextZonedMidnight, startOfZonedDay, zonedParts } from "./time";
import { applySettingChange, costCents, createSettingsCache, defaultSettings } from "./settings";
import {
  can,
  canStartMock,
  grantEntitlement,
  isEntitlementActive,
  revokePurchase,
} from "./entitlements";
import { authorizeAction, permissionsFor, redactStudentRecord } from "./roles";
import { runJob } from "./jobs";
import {
  applyWrongCode,
  canResend,
  createRateLimiter,
  ownsResource,
  safeInternalPath,
  SESSION_COOKIE,
  sessionCookieIsHostOnly,
  signMediaPath,
  verifyMediaPath,
  verifyStripeSignature,
} from "./security";

describe("time zones", () => {
  it("resets the day at each student's local midnight", () => {
    const now = new Date("2026-09-29T18:31:00.000Z");
    const kolkata = zonedParts(now, "Asia/Kolkata");
    const vancouver = zonedParts(now, "America/Vancouver");
    expect(kolkata.day).toBe(30);
    expect(vancouver.day).toBe(29);
    expect(startOfZonedDay(now, "Asia/Kolkata").toISOString()).not.toBe(
      startOfZonedDay(now, "America/Vancouver").toISOString(),
    );
    expect(nextZonedMidnight(now, "Asia/Kolkata").getTime()).toBeGreaterThan(now.getTime());
  });

  it("adds calendar months without drifting the day", () => {
    expect(addMonths(new Date("2026-01-31T00:00:00.000Z"), 1).getUTCDate()).toBe(28);
  });
});

describe("settings", () => {
  it("seeds every registry default and audits a change", () => {
    const current = defaultSettings();
    expect(current["eval.free_total"]).toBe(3);
    expect(current["writing.word_min"]).toBe(150);
    const { next, audit } = applySettingChange(current, "eval.daily", 5, "owner", new Date("2026-09-29T00:00:00Z"));
    expect(next["eval.daily"]).toBe(5);
    expect(audit.oldValue).toBe(10);
    expect(audit.newValue).toBe(5);
    expect(audit.updatedBy).toBe("owner");
  });

  it("serves a cached value until 60 seconds have passed", () => {
    let now = 0;
    const cache = createSettingsCache(() => now);
    const first = defaultSettings();
    const second = { ...first, "eval.daily": 5 };
    let source = first;
    expect(cache.read(() => source)["eval.daily"]).toBe(10);
    source = second;
    now = 30_000;
    expect(cache.read(() => source)["eval.daily"]).toBe(10);
    now = 60_000;
    expect(cache.read(() => source)["eval.daily"]).toBe(5);
  });

  it("prices an evaluation from the settings price table", () => {
    const cents = costCents(
      { inputTokens: 1000, outputTokens: 500, audioSeconds: 90 },
      { inputTokenCents: 0.001, outputTokenCents: 0.002, audioSecondCents: 0.1 },
    );
    expect(cents).toBe(Math.round(1 + 1 + 9));
  });
});

describe("entitlements", () => {
  const now = new Date("2026-09-29T12:00:00Z");

  it("denies an expired entitlement", () => {
    const [sprint] = grantEntitlement(
      { id: "p1", userId: "u", productCode: "sprint", method: "card", periodEnd: new Date("2026-09-01T00:00:00Z") },
      new Date("2026-08-01T00:00:00Z"),
    );
    expect(isEntitlementActive(sprint, now)).toBe(false);
    expect(can([sprint], "all_mocks", now)).toBe(false);
    expect(can([sprint], "mock_test_1", now)).toBe(true);
  });

  it("creates a lifetime course and a 3 month sprint from one purchase", () => {
    const granted = grantEntitlement(
      { id: "course-1", userId: "u", productCode: "course", method: "card", includedSprintMonths: 3 },
      now,
    );
    expect(granted.map((item) => item.productCode).sort()).toEqual(["course", "sprint"]);
    expect(granted.every((item) => item.sourcePurchaseId === "course-1")).toBe(true);
    expect(granted.find((item) => item.productCode === "course")?.endsAt).toBeNull();
    const revoked = revokePurchase(granted, "course-1", now);
    expect(revoked.every((item) => item.revokedAt)).toBe(true);
    expect(can(revoked, "course_videos", now)).toBe(false);
  });

  it("lets a free account start only mock test 1", () => {
    expect(canStartMock("mock-test-1", [], now)).toBe(true);
    expect(canStartMock("mock-test-2", [], now)).toBe(false);
  });
});

describe("roles", () => {
  it("hides notes and WhatsApp from a coach", () => {
    const coach = { userId: "c", role: "coach" as const, permissions: permissionsFor("coach") };
    const record = redactStudentRecord(
      { userId: "s", email: "s@example.com", whatsappE164: "+14165550100", notesBody: "private" },
      coach,
    );
    expect(record.notesBody).toBeNull();
    expect(record.whatsappE164).toBeNull();
    expect(authorizeAction(coach, "calibration")).toEqual({ ok: false, status: 403 });
    expect(authorizeAction(coach, "answer_questions").ok).toBe(true);
  });
});

describe("jobs", () => {
  it("dead-letters a job after the retry budget", async () => {
    const job = {
      id: "j1",
      type: "eval",
      payload: {},
      attempts: 2,
      status: "pending" as const,
      runAt: new Date(),
    };
    const result = await runJob(job, async () => {
      throw new Error("provider down");
    }, { maxAttempts: 3, now: new Date() });
    expect(result.job.status).toBe("dead");
    expect(result.deadLetter?.error).toBe("provider down");
  });
});

describe("security", () => {
  it("keeps the session cookie host-only", () => {
    expect(SESSION_COOKIE.httpOnly).toBe(true);
    expect(SESSION_COOKIE.sameSite).toBe("lax");
    expect(sessionCookieIsHostOnly(SESSION_COOKIE)).toBe(true);
    expect(safeInternalPath("/crs?total=1")).toBe("/crs?total=1");
    expect(safeInternalPath("//evil.example")).toBeNull();
  });

  it("rate limits the 11th sign-in and invalidates a code after 5 misses", () => {
    let now = 0;
    const limiter = createRateLimiter(() => now);
    for (let attempt = 0; attempt < 10; attempt += 1) {
      expect(limiter.hit("ip", 10, 15 * 60 * 1000).ok).toBe(true);
    }
    expect(limiter.hit("ip", 10, 15 * 60 * 1000).ok).toBe(false);
    now = 15 * 60 * 1000;
    expect(limiter.hit("ip", 10, 15 * 60 * 1000).ok).toBe(true);

    let code = { wrongAttempts: 0, invalidated: false, resendCount: 0, lastResendAt: null as Date | null };
    for (let attempt = 0; attempt < 5; attempt += 1) code = applyWrongCode(code, 5);
    expect(code.invalidated).toBe(true);
    expect(canResend({ ...code, invalidated: false, lastResendAt: new Date(0), resendCount: 0 }, new Date(30_000), 60, 5).ok).toBe(false);
  });

  it("rejects a bad webhook signature and an expired media url", () => {
    const now = new Date("2026-09-29T12:00:00Z");
    const body = "{\"ok\":true}";
    const timestamp = Math.floor(now.getTime() / 1000);
    expect(verifyStripeSignature(body, `t=${timestamp},v1=deadbeef`, "secret", now)).toBe(false);
    const token = signMediaPath("audio/a.webm", new Date(now.getTime() - 1000), "secret");
    expect(verifyMediaPath(token, "secret", now).ok).toBe(false);
    const fresh = signMediaPath("audio/a.webm", new Date(now.getTime() + 60_000), "secret");
    expect(verifyMediaPath(fresh, "secret", now)).toEqual({ ok: true, path: "audio/a.webm" });
    expect(ownsResource("student-a", "student-b")).toBe(false);
    expect(ownsResource("student-a", "student-a")).toBe(true);
  });
});
