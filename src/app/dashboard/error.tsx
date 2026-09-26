"use client";

import Link from "next/link";

// Error boundary for dashboard pages. Renders inside the dashboard layout,
// so the header and sign out button stay visible.
export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="mx-auto w-full max-w-md rounded-3xl bg-white p-8 text-center shadow-sm ring-1 ring-ink/5">
      <h1 className="font-serif text-2xl font-semibold tracking-tight text-ink">
        Something went wrong
      </h1>
      <p className="mt-3 text-sm leading-6 text-ink/70">
        {error.message ||
          "We could not load your dashboard. Please try again."}
      </p>
      <div className="mt-6 flex flex-col items-center gap-3">
        <button
          type="button"
          onClick={reset}
          className="inline-flex h-11 items-center justify-center rounded-full bg-brand px-6 text-sm font-semibold text-white shadow-lg shadow-brand/20 transition-colors hover:bg-brand-dark"
        >
          Try again
        </button>
        <Link
          href="/"
          className="text-sm font-semibold text-brand transition-colors hover:text-brand-dark"
        >
          Back to home
        </Link>
      </div>
    </div>
  );
}
