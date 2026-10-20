import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";
import { isRecoveryVerifierCookie } from "@/features/platform/auth-redirect";
import { safeInternalPath } from "@/features/platform/security";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const OTP_TYPES = new Set<EmailOtpType>([
  "signup",
  "invite",
  "magiclink",
  "recovery",
  "email_change",
  "email",
]);

function isOtpType(value: string | null): value is EmailOtpType {
  return value !== null && OTP_TYPES.has(value as EmailOtpType);
}

// Handles the redirect from Supabase auth emails: signup confirmation and
// password recovery. Exchanges the code, or a token hash, for a session
// cookie. A recovery link always lands on the new-password page.
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type");
  const jar = await cookies();
  const recovery =
    type === "recovery" ||
    jar.getAll().some((cookie) => isRecoveryVerifierCookie(cookie.name, cookie.value));
  const next = recovery
    ? "/reset-password"
    : (safeInternalPath(searchParams.get("next")) ?? "/dashboard");

  const supabase = await createSupabaseServerClient();

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(`${origin}${next}`);
    console.error("Auth code exchange failed:", error.message);
    if (error.message.toLowerCase().includes("code verifier")) {
      return NextResponse.redirect(`${origin}/forgot-password?error=expired`);
    }
  } else if (tokenHash && isOtpType(type)) {
    const { error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash });
    if (!error) return NextResponse.redirect(`${origin}${next}`);
  }

  const failed =
    type === "recovery" || next === "/reset-password"
      ? "/forgot-password?error=expired"
      : "/login?error=confirmation_failed";
  return NextResponse.redirect(`${origin}${failed}`);
}
