"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

// Account creation form. Uses the browser Supabase client only.
// full_name is stored in user metadata so the database trigger can copy it
// into public.profiles.
export function SignupForm() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [needsConfirmation, setNeedsConfirmation] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage(null);

    if (fullName.trim().length < 2) {
      setErrorMessage("Please enter your full name.");
      return;
    }
    if (password.length < 8) {
      setErrorMessage("Password must be at least 8 characters long.");
      return;
    }

    setIsSubmitting(true);

    const appUrl =
      process.env.NEXT_PUBLIC_APP_URL ?? window.location.origin;

    const supabase = createSupabaseBrowserClient();
    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: {
          full_name: fullName.trim(),
        },
        emailRedirectTo: `${appUrl}/auth/callback`,
      },
    });

    if (error) {
      setErrorMessage(error.message);
      setIsSubmitting(false);
      return;
    }

    // When email confirmation is enabled, signUp returns a user but no
    // session. Show a friendly message instead of redirecting.
    if (!data.session) {
      setNeedsConfirmation(true);
      setIsSubmitting(false);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  if (needsConfirmation) {
    return (
      <div
        role="status"
        className="rounded-2xl bg-cream-soft px-5 py-6 text-center"
      >
        <h2 className="text-lg font-semibold text-ink">Check your email</h2>
        <p className="mt-2 text-sm leading-6 text-ink/70">
          We sent a confirmation link to {email.trim()}. Click the link to
          activate your account, then sign in.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
      <div>
        <label
          htmlFor="signup-full-name"
          className="block text-sm font-medium text-ink"
        >
          Full name
        </label>
        <input
          id="signup-full-name"
          name="full_name"
          type="text"
          autoComplete="name"
          required
          value={fullName}
          onChange={(event) => setFullName(event.target.value)}
          className="mt-1.5 block w-full rounded-xl border border-ink/15 bg-white px-4 py-2.5 text-ink shadow-sm outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/30"
          placeholder="Your full name"
        />
      </div>

      <div>
        <label
          htmlFor="signup-email"
          className="block text-sm font-medium text-ink"
        >
          Email
        </label>
        <input
          id="signup-email"
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

      <div>
        <label
          htmlFor="signup-password"
          className="block text-sm font-medium text-ink"
        >
          Password
        </label>
        <input
          id="signup-password"
          name="password"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className="mt-1.5 block w-full rounded-xl border border-ink/15 bg-white px-4 py-2.5 text-ink shadow-sm outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/30"
          placeholder="At least 8 characters"
        />
      </div>

      {errorMessage ? (
        <p
          role="alert"
          className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {errorMessage}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={isSubmitting}
        className="inline-flex h-12 w-full items-center justify-center rounded-full bg-brand px-6 text-base font-semibold text-white shadow-lg shadow-brand/20 transition-colors hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting ? "Creating account..." : "Create account"}
      </button>
    </form>
  );
}
