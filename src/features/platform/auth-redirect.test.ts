import { describe, expect, it } from "vitest";
import { isRecoveryVerifierCookie } from "./auth-redirect";

describe("recovery verifier cookie", () => {
  it("recognises a reset verifier and ignores a normal one", () => {
    const encoded =
      "base64-" + Buffer.from(JSON.stringify("verifier-value/recovery"), "utf8").toString("base64url");
    expect(isRecoveryVerifierCookie("sb-ref-auth-token-code-verifier", encoded)).toBe(true);
    expect(isRecoveryVerifierCookie("sb-ref-auth-token-code-verifier", "plain-verifier")).toBe(false);
    expect(isRecoveryVerifierCookie("sb-ref-auth-token", encoded)).toBe(false);
  });
});
