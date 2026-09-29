import type { Metadata } from "next";
import { PublicShell } from "@/components/site/PublicShell";
import { BookingBoard } from "@/components/site/BookingBoard";
import { brandTitle } from "@/features/brand/brand-copy";
import { readSiteUser } from "@/features/public-site/session";

export const metadata: Metadata = {
  title: brandTitle("Book a call"),
  description: "Book a free 15-minute strategy call, a private hour, or a live batch seat.",
};

export default async function BookPage() {
  const user = await readSiteUser();
  return (
    <PublicShell>
      <article className="mx-auto w-full max-w-3xl px-5 py-10 sm:px-8">
        <h1 className="font-serif text-4xl">Live classes and bookings</h1>
        <BookingBoard signedIn={Boolean(user)} />
      </article>
    </PublicShell>
  );
}
