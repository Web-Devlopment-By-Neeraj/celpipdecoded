import type { Metadata } from "next";
import { PublicShell } from "@/components/site/PublicShell";
import { PlansGrid } from "@/components/site/PlansGrid";
import { brandTitle } from "@/features/brand/brand-copy";

export const metadata: Metadata = {
  title: brandTitle("Plans"),
  description: "Free, Test Sprint, Decoded Course, Live Batch and Private 1:1.",
};

export default function PlansPage() {
  return (
    <PublicShell>
      <article className="mx-auto w-full max-w-6xl px-5 py-10 sm:px-8">
        <h1 className="font-serif text-4xl">Plans and pricing</h1>
        <p className="mt-2 text-sm">Prices in CAD. Sales tax is added where it applies and shown before payment.</p>
        <div className="mt-6">
          <PlansGrid />
        </div>
      </article>
    </PublicShell>
  );
}
