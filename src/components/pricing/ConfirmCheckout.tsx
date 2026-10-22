"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export function ConfirmCheckout({ sessionId }: { sessionId: string | null }) {
  const [message, setMessage] = useState(
    sessionId ? "Confirming your payment..." : "No payment reference was included.",
  );
  const [ready, setReady] = useState(!sessionId);

  useEffect(() => {
    if (!sessionId) return;
    let cancelled = false;

    async function confirm() {
      try {
        const response = await fetch("/api/app/checkout/confirm", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sessionId }),
        });
        const payload = (await response.json()) as { error?: string; alreadyGranted?: boolean };
        if (cancelled) return;
        if (!response.ok) {
          setMessage(payload.error ?? "The payment could not be applied to your account.");
        } else if (payload.alreadyGranted) {
          setMessage("This payment is already on your account.");
        } else {
          setMessage("Payment received. Your plan is now on your account.");
        }
      } catch {
        if (!cancelled) setMessage("The payment could not be confirmed. Refresh this page.");
      } finally {
        if (!cancelled) setReady(true);
      }
    }

    void confirm();
    return () => {
      cancelled = true;
    };
  }, [sessionId]);

  return (
    <>
      <p className="mt-3 text-sm leading-6">{message}</p>
      {ready ? (
        <Link href="/dashboard" className="mt-6 inline-flex h-11 items-center rounded-full bg-brand px-5 text-sm font-semibold text-white">
          Go to the dashboard
        </Link>
      ) : null}
    </>
  );
}
