import { NextResponse, type NextRequest } from "next/server";

// Supabase sends a rejected redirect target to the site root as /?code=...
// Move that code to the auth callback before the homepage renders.
export function proxy(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;
  if (pathname === "/auth/callback") return NextResponse.next();

  const expired =
    searchParams.get("error_code") === "otp_expired" ||
    searchParams.get("error") === "access_denied";
  if (expired && pathname !== "/forgot-password") {
    const url = request.nextUrl.clone();
    url.pathname = "/forgot-password";
    url.search = "?error=expired";
    return NextResponse.redirect(url);
  }

  if (!searchParams.get("code") && !searchParams.get("token_hash")) {
    return NextResponse.next();
  }

  const url = request.nextUrl.clone();
  url.pathname = "/auth/callback";
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
