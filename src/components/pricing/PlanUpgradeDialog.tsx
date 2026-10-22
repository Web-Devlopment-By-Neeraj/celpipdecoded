"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getPlanUpgradeContent } from "@/features/pricing/plan-upgrade-copy";
import {
  loginNextPathForCheckout,
  startPlanCheckout,
} from "@/features/pricing/start-plan-checkout";

type Step = "benefits" | "later-offer";

export function PlanUpgradeDialog({
  open,
  productCode,
  offer,
  onClose,
}: {
  open: boolean;
  productCode: string;
  offer?: string;
  onClose: () => void;
}) {
  const content = getPlanUpgradeContent(productCode);
  const [step, setStep] = useState<Step>("benefits");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    if (!open) return;
    setStep("benefits");
    setError(null);
    setPending(false);
  }, [open, productCode]);

  useEffect(() => {
    if (!open) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open || !content) return null;

  async function pay(offerCode?: string) {
    setError(null);
    setPending(true);
    try {
      const result = await startPlanCheckout({
        productCode,
        offer: offerCode ?? offer,
      });
      if (result.ok) {
        window.location.href = result.url;
        return;
      }
      if (result.needsLogin) {
        window.location.href = loginNextPathForCheckout(productCode, offerCode ?? offer);
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
    <div
      className="fixed inset-0 z-[90] flex items-end justify-center bg-ink/50 px-4 py-8 sm:items-center"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="plan-upgrade-title"
        className="w-full max-w-md rounded-3xl bg-white p-6 text-ink shadow-xl"
        onClick={(event) => event.stopPropagation()}
      >
        {step === "benefits" ? (
          <>
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand">
                  Before you pay
                </p>
                <h2
                  id="plan-upgrade-title"
                  className="mt-1 font-serif text-2xl font-semibold"
                >
                  {content.headline}
                </h2>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-ink/60 hover:bg-ink/5 hover:text-ink"
                aria-label="Close"
              >
                ×
              </button>
            </div>

            <p className="mt-3 text-sm leading-6 text-ink/70">{content.intro}</p>

            <p className="mt-4 text-2xl font-semibold tabular-nums">
              {content.priceLabel}
              <span className="ml-2 text-sm font-normal text-ink/60">CAD</span>
            </p>
            <p className="mt-1 text-xs leading-5 text-ink/55">{content.billingNote}</p>

            <ul className="mt-5 space-y-2.5 text-sm leading-6 text-ink/85">
              {content.benefits.map((item) => (
                <li key={item} className="flex gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>

            {error ? (
              <p role="alert" className="mt-4 text-sm text-red-700">
                {error}
              </p>
            ) : null}

            <div className="mt-6 flex flex-col gap-2">
              <button
                type="button"
                disabled={pending}
                onClick={() => void pay()}
                className="inline-flex h-11 items-center justify-center rounded-full bg-brand text-sm font-semibold text-white disabled:opacity-60"
              >
                {pending ? "Opening checkout..." : "Pay with card"}
              </button>
              <button
                type="button"
                disabled={pending}
                onClick={() => setStep("later-offer")}
                className="inline-flex h-11 items-center justify-center rounded-full border border-ink/15 text-sm font-semibold"
              >
                Maybe later
              </button>
              <Link
                href="/pricing"
                className="text-center text-sm font-medium text-brand hover:text-brand-dark"
              >
                Compare all plans
              </Link>
            </div>
          </>
        ) : (
          <>
            <h2 className="font-serif text-2xl font-semibold">15% off today</h2>
            <p className="mt-2 text-sm leading-6 text-ink/70">
              Not ready to pay full price? Take 15% off {content.name} when you
              checkout now. The discount is applied automatically.
            </p>
            <div className="mt-5 flex flex-col gap-2">
              <button
                type="button"
                disabled={pending}
                onClick={() => void pay("leave15")}
                className="inline-flex h-11 items-center justify-center rounded-full bg-brand text-sm font-semibold text-white disabled:opacity-60"
              >
                {pending ? "Opening checkout..." : "Pay with 15% off"}
              </button>
              <Link
                href="/pricing?offer=leave15"
                className="inline-flex h-11 items-center justify-center rounded-full border border-ink/15 text-sm font-semibold"
              >
                See all plans with discount
              </Link>
              <button
                type="button"
                onClick={onClose}
                className="text-sm font-medium text-ink/60 hover:text-ink"
              >
                Close
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
