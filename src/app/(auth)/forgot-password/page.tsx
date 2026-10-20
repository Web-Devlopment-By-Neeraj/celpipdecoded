import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { BrandDisclaimer } from "@/components/brand/BrandDisclaimer";
import { CelpipDecodedLogo } from "@/components/brand/CelpipDecodedLogo";
import { ForgotPasswordForm } from "@/components/auth/ForgotPasswordForm";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Forgot password - CELPIP Decoded",
  description: "Email yourself a link to choose a new CELPIP Decoded password.",
};

export default async function ForgotPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const expired = (await searchParams).error === "expired";
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) redirect("/dashboard");

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-cream px-5 py-12">
      <div className="w-full max-w-md">
        <div className="text-center">
          <Link href="/" className="inline-flex justify-center">
            <CelpipDecodedLogo size="lg" />
          </Link>
          <h1 className="mt-4 font-serif text-3xl font-semibold tracking-tight text-ink">
            Forgot your password?
          </h1>
          <p className="mt-2 text-sm leading-6 text-ink/70">
            Enter the email on your account. We will send a link to choose a new password.
          </p>
        </div>

        <div className="mt-8 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-ink/5 sm:p-8">
          {expired ? (
            <p role="alert" className="mb-5 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
              That reset link is invalid or has expired. Request a new one below.
            </p>
          ) : null}
          <ForgotPasswordForm />
        </div>

        <p className="mt-6 text-center text-sm text-ink/70">
          Remember it?{" "}
          <Link href="/login" className="font-semibold text-brand transition-colors hover:text-brand-dark">
            Sign in
          </Link>
        </p>
        <BrandDisclaimer className="mt-8 text-center" />
      </div>
    </main>
  );
}
