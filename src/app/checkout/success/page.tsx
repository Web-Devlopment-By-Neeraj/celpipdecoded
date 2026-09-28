import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Payment received - CELPIP Decoded",
  robots: { index: false, follow: false },
};

export default function CheckoutSuccessPage() {
  return (
    <main className="min-h-screen overflow-x-hidden bg-cream px-4 py-16 text-ink">
      <div className="mx-auto max-w-lg rounded-3xl bg-white p-6 shadow-sm ring-1 ring-ink/5">
        <h1 className="font-serif text-3xl font-semibold">Payment received. Setting up your access.</h1>
        <p className="mt-3 text-sm leading-6">
          This page does not unlock anything by itself. Access appears after the payment provider confirms the payment to our server.
        </p>
        <p className="mt-3 text-sm leading-6">
          This is taking longer than usual? Your payment is safe. Access will appear shortly. Contact us via Ask Amar if it is not there within 10 minutes.
        </p>
        <Link href="/dashboard" className="mt-6 inline-flex h-11 items-center rounded-full bg-brand px-5 text-sm font-semibold text-white">
          Go to the dashboard
        </Link>
      </div>
    </main>
  );
}
