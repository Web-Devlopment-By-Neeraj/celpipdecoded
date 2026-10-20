"use client";

import { useEffect, useState, useSyncExternalStore, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

type Arrival = "pending" | "yes" | "no";

function subscribeArrival() {
  return () => undefined;
}

function readArrival(): Arrival {
  const hash = new URLSearchParams(window.location.hash.replace(/^#/, ""));
  const search = new URLSearchParams(window.location.search);
  const arriving =
    hash.get("type") === "recovery" ||
    hash.has("access_token") ||
    search.has("code") ||
    search.get("type") === "recovery";
  return arriving ? "yes" : "no";
}

// Sets a new password after the email link has created a recovery session.
export function ResetPasswordForm({ ready }: { ready: boolean }) {
  const router = useRouter();
  const arrival = useSyncExternalStore(subscribeArrival, readArrival, () => "pending" as Arrival);
  const [sessionReady, setSessionReady] = useState(false);
  const [gaveUp, setGaveUp] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (arrival !== "yes") return;
    const supabase = createSupabaseBrowserClient();
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (
        session &&
        (event === "PASSWORD_RECOVERY" || event === "SIGNED_IN" || event === "INITIAL_SESSION")
      ) {
        setSessionReady(true);
      }
    });
    const timer = window.setTimeout(() => setGaveUp(true), 4000);
    return () => {
      window.clearTimeout(timer);
      subscription.unsubscribe();
    };
  }, [arrival]);

  const showForm = ready || sessionReady;
  const showChecking = !showForm && !gaveUp && arrival !== "no";

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage(null);

    if (password.length < 8) {
      setErrorMessage("Password must be at least 8 characters long.");
      return;
    }
    if (password !== confirmPassword) {
      setErrorMessage("Those passwords do not match.");
      return;
    }

    setIsSubmitting(true);
    const supabase = createSupabaseBrowserClient();
    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      setErrorMessage(error.message);
      setIsSubmitting(false);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  if (showChecking) {
    return <p className="text-sm text-ink/70">Opening your reset link...</p>;
  }

  if (!showForm) {
    return (
      <div role="alert" className="space-y-4 text-center">
        <p className="text-sm leading-6 text-ink/70">
          This reset link is invalid or has expired. Request a new one. Each link works only once.
        </p>
        <Link
          href="/forgot-password"
          className="inline-flex h-12 w-full items-center justify-center rounded-full bg-brand px-6 text-base font-semibold text-white"
        >
          Request a new link
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
      <div>
        <label htmlFor="reset-password" className="block text-sm font-medium text-ink">
          New password
        </label>
        <input
          id="reset-password"
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

      <div>
        <label htmlFor="reset-confirm" className="block text-sm font-medium text-ink">
          Confirm new password
        </label>
        <input
          id="reset-confirm"
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          value={confirmPassword}
          onChange={(event) => setConfirmPassword(event.target.value)}
          className="mt-1.5 block w-full rounded-xl border border-ink/15 bg-white px-4 py-2.5 text-ink shadow-sm outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/30"
          placeholder="Repeat the new password"
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
        {isSubmitting ? "Saving..." : "Save new password"}
      </button>
    </form>
  );
}
