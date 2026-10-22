"use client";

import { useState } from "react";
import {
  loginNextPathForCheckout,
  startPlanCheckout,
} from "@/features/pricing/start-plan-checkout";

/** Starts checkout immediately. Prefer PlanUpgradeButton when the learner should see what the plan includes first. */
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
      const result = await startPlanCheckout({ productCode, offer });
      if (result.ok) {
        window.location.href = result.url;
        return;
      }
      if (result.needsLogin) {
        window.location.href = loginNextPathForCheckout(productCode, offer);
        return;
      }
      setError(result.error);
      setPending(false);
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
