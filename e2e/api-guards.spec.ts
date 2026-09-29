import { expect, test } from "@playwright/test";

test.describe("server guards", () => {
  test("paid app routes reject a signed-out caller", async ({ request }) => {
    const paths = [
      "/api/app/allowance",
      "/api/app/attempts",
      "/api/app/checkout",
      "/api/app/assistant",
    ];
    for (const path of paths) {
      const response = await request.fetch(path, {
        method: path.endsWith("allowance") ? "GET" : "POST",
        headers: { "content-type": "application/json" },
        data: path.endsWith("allowance") ? undefined : {},
      });
      expect(response.status(), path).toBe(401);
    }
  });

  test("cron rejects a missing secret and accepts the configured one", async ({ request }) => {
    const denied = await request.post("/api/cron/tick");
    expect(denied.status()).toBe(401);

    const allowed = await request.post("/api/cron/tick", {
      headers: { authorization: "Bearer cron-e2e-secret" },
    });
    expect(allowed.status()).toBe(200);
    const body = (await allowed.json()) as { ok: boolean };
    expect(body.ok).toBe(true);
  });

  test("the payment webhook rejects an invalid signature", async ({ request }) => {
    const response = await request.post("/api/webhooks/payments", {
      data: JSON.stringify({ id: "evt_e2e", type: "checkout.session.completed" }),
      headers: {
        "content-type": "application/json",
        "stripe-signature": "t=1,v1=deadbeef",
      },
    });
    expect(response.status()).toBe(400);
  });

  test("security headers are present on a public page", async ({ request }) => {
    const response = await request.get("/crs");
    const headers = response.headers();
    expect(headers["x-content-type-options"]).toBe("nosniff");
    expect(headers["x-frame-options"]).toBe("SAMEORIGIN");
    expect(headers["referrer-policy"]).toBe("strict-origin-when-cross-origin");
    expect(headers["permissions-policy"]).toContain("microphone=(self)");
  });
});
