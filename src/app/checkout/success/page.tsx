import type { Metadata } from "next";
import { ConfirmCheckout } from "@/components/pricing/ConfirmCheckout";

export const metadata: Metadata = {
  title: "Payment received - CELPIP Decoded",
  robots: { index: false, follow: false },
};

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>;
}) {
  const sessionId = (await searchParams).session_id ?? null;

  return (
    <main className="min-h-screen overflow-x-hidden bg-cream px-4 py-16 text-ink">
      <div className="mx-auto max-w-lg rounded-3xl bg-white p-6 shadow-sm ring-1 ring-ink/5">
        <h1 className="font-serif text-3xl font-semibold">Payment received. Setting up your access.</h1>
        {sessionId ? (
          <ConfirmCheckout sessionId={sessionId} />
        ) : (
          <p className="mt-3 text-sm leading-6">
            This page does not unlock anything by itself. Access appears after Stripe confirms a paid checkout.
          </p>
        )}
      </div>
    </main>
  );
}
