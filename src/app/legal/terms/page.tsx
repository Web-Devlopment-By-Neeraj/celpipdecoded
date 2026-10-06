import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms - CELPIP Decoded",
  description: "Terms for using CELPIP Decoded practice tools.",
};

export default function TermsPage() {
  return (
    <main className="min-h-screen overflow-x-hidden bg-cream px-4 py-10 text-ink">
      <article className="mx-auto max-w-2xl space-y-4 text-sm leading-6">
        <h1 className="font-serif text-3xl font-semibold">Terms</h1>
        <p>This page is original wording. A lawyer still needs to review it.</p>
        <p>CELPIP Decoded is a practice product. Levels shown here are practice estimates. They are not official results, and the product does not give immigration advice.</p>
        <p>You need a verified email before an evaluation or a mock that spends the free allowance. Paid access starts only after the payment provider confirms the purchase.</p>
        <p>
          <Link className="underline" href="/legal/refunds">Refunds</Link>
        </p>
      </article>
    </main>
  );
}
