import type { Metadata } from "next";
import Link from "next/link";
import { BrandDisclaimer } from "@/components/brand/BrandDisclaimer";
import { CelpipDecodedLogo } from "@/components/brand/CelpipDecodedLogo";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { LoginForm } from "@/components/auth/LoginForm";
import { safeInternalPath } from "@/features/platform/security";

export const metadata: Metadata = {
  title: "Sign in - CELPIP Decoded",
  description:
    "Sign in to your CELPIP Decoded account.",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>;
}) {
  const params = await searchParams;
  const nextPath = safeInternalPath(params.next) ?? "/dashboard";
  const linkFailed = params.error === "confirmation_failed";
  // Already signed in users go straight to the dashboard.
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    // A signed-in visit to Sign in opens the app, not the public home.
    redirect(nextPath === "/" || nextPath.startsWith("/#") ? "/dashboard" : nextPath);
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-cream px-5 py-12">
      <div className="w-full max-w-md">
        <div className="text-center">
          <Link href="/" className="inline-flex justify-center">
            <CelpipDecodedLogo size="lg" />
          </Link>
          <h1 className="mt-4 font-serif text-3xl font-semibold tracking-tight text-ink">
            Welcome back
          </h1>
          <p className="mt-2 text-sm leading-6 text-ink/70">
            Sign in to continue your CELPIP practice.
          </p>
        </div>

        <div className="mt-8 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-ink/5 sm:p-8">
          {linkFailed ? (
            <p role="alert" className="mb-5 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
              That email link is invalid or has expired. Request a new one from Forgot password.
            </p>
          ) : null}
          <LoginForm nextPath={nextPath} />
        </div>

        <p className="mt-6 text-center text-sm text-ink/70">
          New here?{" "}
          <Link
            href="/signup"
            className="font-semibold text-brand transition-colors hover:text-brand-dark"
          >
            Create an account
          </Link>
        </p>
        <BrandDisclaimer className="mt-8 text-center" />
      </div>
    </main>
  );
}
