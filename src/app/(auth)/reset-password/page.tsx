import type { Metadata } from "next";
import Link from "next/link";
import { BrandDisclaimer } from "@/components/brand/BrandDisclaimer";
import { CelpipDecodedLogo } from "@/components/brand/CelpipDecodedLogo";
import { ResetPasswordForm } from "@/components/auth/ResetPasswordForm";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Reset password - CELPIP Decoded",
  description: "Choose a new password for your CELPIP Decoded account.",
};

export default async function ResetPasswordPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-cream px-5 py-12">
      <div className="w-full max-w-md">
        <div className="text-center">
          <Link href="/" className="inline-flex justify-center">
            <CelpipDecodedLogo size="lg" />
          </Link>
          <h1 className="mt-4 font-serif text-3xl font-semibold tracking-tight text-ink">
            Choose a new password
          </h1>
          <p className="mt-2 text-sm leading-6 text-ink/70">
            Use at least 8 characters. You will be signed in after it is saved.
          </p>
        </div>

        <div className="mt-8 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-ink/5 sm:p-8">
          <ResetPasswordForm ready={Boolean(user)} />
        </div>
        <BrandDisclaimer className="mt-8 text-center" />
      </div>
    </main>
  );
}
