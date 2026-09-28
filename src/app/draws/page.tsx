import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Express Entry draws - CELPIP Decoded",
  description: "Compare a CRS estimate with the idea of a recent draw. This page does not predict an invitation.",
};

export default async function DrawsPage({
  searchParams,
}: {
  searchParams: Promise<{ total?: string }>;
}) {
  const { total } = await searchParams;
  return (
    <main className="min-h-screen overflow-x-hidden bg-cream px-4 py-10 text-ink">
      <div className="mx-auto max-w-2xl">
        <h1 className="font-serif text-3xl font-semibold">Recent draws</h1>
        <p className="mt-3 text-sm leading-6">
          {total ? `Your calculator estimate was ${total}. ` : ""}
          Draw scores change, and this page does not predict an invitation to apply. Compare the number with the official draw history.
        </p>
        <p className="mt-4 text-sm">
          <a className="font-semibold text-brand underline" href="https://www.canada.ca/en/immigration-refugees-citizenship/corporate/mandate/policies-operational-instructions-agreements/ministerial-instructions/express-entry-rounds.html">
            Official Express Entry rounds
          </a>
        </p>
        <p className="mt-6 text-sm">
          <Link className="font-semibold text-brand underline" href="/crs">Back to the calculator</Link>
        </p>
      </div>
    </main>
  );
}
