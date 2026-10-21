"use client";

import { useState } from "react";

export function PlanCheckoutButton({
  productCode,
  offer,
}: {
  productCode: string;
  offer?: string;
}) {
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function startCheckout() {
    setError(null);
    setPending(true);
    try {
      const response = await fetch("/api/app/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productCode, offer }),
      });
      const payload = (await response.json()) as { url?: string; error?: string };
      if (response.status === 401) {
        const next = offer ? `/pricing?offer=${offer}` : "/pricing";
        window.location.href = `/login?next=${encodeURIComponent(next)}`;
        return;
      }
      if (!response.ok || !payload.url) {
        setError(payload.error ?? "Checkout could not start.");
        setPending(false);
        return;
      }
      window.location.href = payload.url;
    } catch {
      setError("Checkout could not start. Check your connection and try again.");
      setPending(false);
    }
  }

  return (
    <div className="mt-4">
      <button
        type="button"
        onClick={() => void startCheckout()}
        disabled={pending}
        className="inline-flex h-11 items-center rounded-full bg-brand px-5 text-sm font-semibold text-white disabled:opacity-60"
      >
        {pending ? "Opening checkout..." : "Pay with card"}
      </button>
      {error ? <p className="mt-2 text-sm text-red-700">{error}</p> : null}
    </div>
  );
}
