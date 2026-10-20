// The password-reset email stores a PKCE verifier ending in "/recovery".
// Supabase sometimes returns that link to the site root, so the cookie is
// the signal that the code belongs on the new-password page.

export function isRecoveryVerifierCookie(name: string, value: string): boolean {
  if (!name.includes("code-verifier")) return false;
  return decodeVerifierCookie(value).includes("/recovery");
}

function decodeVerifierCookie(value: string): string {
  if (!value.startsWith("base64-")) return value;
  try {
    return Buffer.from(value.slice("base64-".length), "base64url").toString("utf8");
  } catch {
    return value;
  }
}
