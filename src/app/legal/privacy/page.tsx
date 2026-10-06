import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy - CELPIP Decoded",
  description: "How CELPIP Decoded handles account data, recordings, and practice answers.",
};

export default function PrivacyPage() {
  return (
    <main className="min-h-screen overflow-x-hidden bg-cream px-4 py-10 text-ink">
      <article className="mx-auto max-w-2xl space-y-4 text-sm leading-6">
        <h1 className="font-serif text-3xl font-semibold">Privacy</h1>
        <p>This page is original wording for the product. A lawyer still needs to review it before it is treated as the final policy.</p>
        <p>We store the name and email you use to sign in, your practice answers, and speaking recordings you submit. Recordings stay in a private bucket.</p>
        <p>We do not sell personal information. Payment card numbers are handled by the payment provider and do not come to this app.</p>
        <p>Database backups are kept for 35 days. Audio past the retention window is not part of the long-term copy.</p>
        <p>
          <Link className="underline" href="/legal/terms">Terms</Link>
        </p>
      </article>
    </main>
  );
}
