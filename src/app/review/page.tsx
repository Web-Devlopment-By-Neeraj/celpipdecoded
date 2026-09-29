import type { Metadata } from "next";
import { PublicShell } from "@/components/site/PublicShell";
import { ReviewForm } from "@/components/site/ReviewForm";
import { brandTitle } from "@/features/brand/brand-copy";

export const metadata: Metadata = {
  title: brandTitle("Review"),
  description: "Share an official result with CELPIP Decoded.",
  robots: { index: false, follow: false },
};

export default function ReviewPage() {
  return (
    <PublicShell>
      <article className="mx-auto w-full max-w-xl px-5 py-10 sm:px-8">
        <h1 className="font-serif text-4xl">Share your result</h1>
        <ReviewForm requireEmail />
      </article>
    </PublicShell>
  );
}
