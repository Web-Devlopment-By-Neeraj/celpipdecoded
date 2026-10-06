import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Refunds - CELPIP Decoded",
  description: "When a class seat can move and when a purchase can be refunded.",
};

export default function RefundsPage() {
  return (
    <main className="min-h-screen overflow-x-hidden bg-cream px-4 py-10 text-ink">
      <article className="mx-auto max-w-2xl space-y-4 text-sm leading-6">
        <h1 className="font-serif text-3xl font-semibold">Refunds</h1>
        <p>This page is original wording. A lawyer still needs to review it. The hours below are the starting admin settings.</p>
        <p>A live-batch seat reserved with a card is not charged until the batch is confirmed. If you cancel at least 48 hours before the start, the seat moves to the next block. Inside that window the seat is not refunded.</p>
        <p>A full refund of a course purchase removes the course and the included sprint. A partial refund is recorded and does not remove access.</p>
      </article>
    </main>
  );
}
