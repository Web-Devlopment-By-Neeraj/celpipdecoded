import type { Metadata } from "next";
import Link from "next/link";
import { CelpipDecodedLogo } from "@/components/brand/CelpipDecodedLogo";
import { PricingPlansGrid } from "@/components/pricing/PricingPlanCard";
import { brandCopy } from "@/features/brand/brand-copy";

export const metadata: Metadata = {
  title: "Pricing - CELPIP Decoded",
  description:
    "Practice plans in Canadian dollars. Choose Test Sprint, Decoded Course, live batch, or private 1:1.",
};

export default async function PricingPage({
  searchParams,
}: {
  searchParams: Promise<{ offer?: string }>;
}) {
  const offer = (await searchParams).offer === "leave15" ? "leave15" : undefined;

  return (
    <main className="min-h-screen overflow-x-hidden bg-cream text-ink">
      <div className="border-b border-ink/10 bg-white/80 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 sm:px-8">
          <Link href="/" className="flex items-center gap-3">
            <CelpipDecodedLogo size="md" />
          </Link>
          <Link
            href="/login"
            className="text-sm font-semibold text-ink/75 hover:text-ink"
          >
            Sign in
          </Link>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-5 py-12 sm:px-8 sm:py-16">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand">
            Plans and pricing
          </p>
          <h1 className="mt-4 font-serif text-4xl font-semibold tracking-tight sm:text-5xl">
            Choose how you practice
          </h1>
          <p className="mt-4 text-base leading-7 text-ink/70">
            Every plan uses secure card checkout in Canadian dollars. Access
            unlocks after payment confirms. AI feedback is a practice estimate,
            not an official CELPIP score.
          </p>
        </div>

        {offer ? (
          <p
            role="status"
            className="mt-8 max-w-2xl rounded-2xl border border-brand/25 bg-brand/10 px-5 py-4 text-sm font-medium leading-6 text-ink"
          >
            Your 15% discount is ready. It applies when you choose a plan and
            pay with card.
          </p>
        ) : null}

        <div className="mt-10">
          <PricingPlansGrid offer={offer} />
        </div>

        <p className="mt-10 max-w-3xl text-xs leading-5 text-ink/50">
          {brandCopy.practiceEstimateLine} Need live class options? See the{" "}
          <Link href="/book" className="font-medium text-brand hover:text-brand-dark">
            book page
          </Link>{" "}
          or the program section on the{" "}
          <Link href="/#program" className="font-medium text-brand hover:text-brand-dark">
            home page
          </Link>
          .
        </p>
      </div>
    </main>
  );
}
