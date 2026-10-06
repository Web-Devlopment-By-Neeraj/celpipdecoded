import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Book a session - CELPIP Decoded",
  description: "Reserve a class seat or a private session. A reserved seat is not charged until the batch is confirmed.",
};

export default function BookPage() {
  return (
    <main className="min-h-screen overflow-x-hidden bg-cream px-4 py-10 text-ink">
      <div className="mx-auto max-w-xl">
        <h1 className="font-serif text-3xl font-semibold">Book</h1>
        <p className="mt-3 text-sm leading-6">
          Live batches meet Monday, Tuesday, Thursday, and Friday at 7:30 PM Eastern. A card reservation does not charge you until enough students join. Private sessions are paid when you book.
        </p>
        <p className="mt-3 text-sm leading-6">
          Move or cancel a session from the admin calendar. Changing it only in Google Calendar or Zoom does not email the student.
        </p>
        <Link href="/signup?next=/book" className="mt-6 inline-flex h-11 items-center rounded-full bg-brand px-5 text-sm font-semibold text-white">
          Sign in to reserve
        </Link>
      </div>
    </main>
  );
}
