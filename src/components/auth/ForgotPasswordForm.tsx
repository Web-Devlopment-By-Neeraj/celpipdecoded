"use client";

import { useState, type FormEvent } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

// Asks Supabase to email a reset link. The same message is shown whether or
// not the address has an account, so the form does not reveal who signed up.
export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage(null);
    setIsSubmitting(true);

    const redirectTo = `${window.location.origin}/auth/callback`;
    const supabase = createSupabaseBrowserClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo,
    });

    if (error) {
      setErrorMessage(error.message);
      setIsSubmitting(false);
      return;
    }

    setSent(true);
    setIsSubmitting(false);
  }

  if (sent) {
    return (
      <div role="status" className="rounded-2xl bg-cream-soft px-5 py-6 text-center">
        <h2 className="text-lg font-semibold text-ink">Check your email</h2>
        <p className="mt-2 text-sm leading-6 text-ink/70">
          If an account exists for {email.trim()}, a reset link is on its way.
          Open that link on this device and choose a new password.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
      <div>
        <label htmlFor="forgot-email" className="block text-sm font-medium text-ink">
          Email
        </label>
        <input
          id="forgot-email"
          name="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="mt-1.5 block w-full rounded-xl border border-ink/15 bg-white px-4 py-2.5 text-ink shadow-sm outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/30"
          placeholder="you@example.com"
        />
      </div>

      {errorMessage ? (
        <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
          {errorMessage}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={isSubmitting}
        className="inline-flex h-12 w-full items-center justify-center rounded-full bg-brand px-6 text-base font-semibold text-white shadow-lg shadow-brand/20 transition-colors hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting ? "Sending link..." : "Email me a reset link"}
      </button>
    </form>
  );
}
