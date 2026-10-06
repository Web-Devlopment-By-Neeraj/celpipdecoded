import type { Metadata } from "next";
import Link from "next/link";
import { formatCad } from "@/features/platform/pack-surface";
import { DEFAULT_PRODUCTS } from "@/features/platform/payments";

export const metadata: Metadata = {
  title: "Pricing - CELPIP Decoded",
  description: "Practice plans in Canadian dollars. Prices can be changed by an admin without a new deploy.",
};

export default function PricingPage() {
  return (
    <main className="min-h-screen overflow-x-hidden bg-cream px-4 py-10 text-ink">
      <div className="mx-auto max-w-3xl">
        <h1 className="font-serif text-3xl font-semibold">Plans</h1>
        <p className="mt-3 text-sm leading-6">
          Prices below are the starting amounts in admin settings. A purchase does not unlock access until the payment provider confirms it.
        </p>
        <ul className="mt-8 space-y-4">
          {DEFAULT_PRODUCTS.filter((product) => product.active).map((product) => (
            <li key={product.code} className="rounded-3xl bg-white p-5 ring-1 ring-ink/10">
              <h2 className="text-lg font-semibold">{product.name}</h2>
              <p className="mt-1 text-sm">{formatCad(product.priceCents)}</p>
              <Link href={`/signup?next=${encodeURIComponent("/pricing")}`} className="mt-4 inline-flex h-11 items-center rounded-full bg-brand px-5 text-sm font-semibold text-white">
                Create an account
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}
