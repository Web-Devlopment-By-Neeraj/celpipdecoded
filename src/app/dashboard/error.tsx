"use client";

import Link from "next/link";

// Error boundary for dashboard pages. Renders inside the dashboard layout,
// so the header and sign out button stay visible.

const FALLBACK_MESSAGE = "We could not load your dashboard. Please try again.";

// Production builds replace a server exception with a digest paragraph.
// That text is not useful on the page, so the learner sees the fallback.
function visibleErrorMessage(message: string | undefined): string {
  if (!message) return FALLBACK_MESSAGE;
  if (
    message.includes("Server Components render") ||
    message.includes("digest property")
  ) {
    return FALLBACK_MESSAGE;
  }
  return message;
}

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
        {visibleErrorMessage(error.message)}
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
