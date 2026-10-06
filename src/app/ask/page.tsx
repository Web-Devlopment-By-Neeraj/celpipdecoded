import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Ask Amar - CELPIP Decoded",
  description: "Ask a practice question. An AI assistant can answer help articles. Amar answers the rest.",
};

export default function AskPage() {
  return (
    <main className="min-h-screen overflow-x-hidden bg-cream px-4 py-10 text-ink">
      <div className="mx-auto max-w-xl">
        <h1 className="font-serif text-3xl font-semibold">Ask Amar</h1>
        <p className="mt-3 text-sm leading-6">
          The corner button is an AI assistant. It answers from help articles. Questions about immigration, refunds, or your account go to Amar. Sign in so the question is attached to you.
        </p>
        <Link href="/signup?next=/ask" className="mt-6 inline-flex h-11 items-center rounded-full bg-brand px-5 text-sm font-semibold text-white">
          Sign in to ask
        </Link>
      </div>
    </main>
  );
}
