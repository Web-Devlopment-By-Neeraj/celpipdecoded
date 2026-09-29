import type { Metadata } from "next";
import Link from "next/link";
import { PublicShell } from "@/components/site/PublicShell";
import { DrawsBoard } from "@/components/site/DrawsBoard";
import { SEED_DRAWS } from "@/features/public-site/seed";
import { filtersFromSearch, lastUpdated } from "@/features/public-site/draws";
import { DEFAULT_SETTINGS } from "@/features/public-site/settings";
import { brandTitle } from "@/features/brand/brand-copy";

export const metadata: Metadata = {
  title: brandTitle("Express Entry draws"),
  description: "Recent Express Entry invitation rounds, with a comparison against a CRS score you already have.",
};

export default async function DrawsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (typeof value === "string") query.set(key, value);
  }
  const filters = filtersFromSearch(query);
  const score = query.get("score");

  return (
    <PublicShell>
      <article className="mx-auto w-full max-w-6xl px-5 py-10 sm:px-8">
        <h1 className="font-serif text-4xl">Express Entry draws</h1>
        <p className="mt-3 max-w-3xl text-base leading-7">
          This list is kept by CELPIP Decoded from public invitation rounds. It is general information, not immigration advice, and it does not predict an invitation. Check the official Government of Canada page.
        </p>
        <p className="mt-3 text-sm">
          <a className="underline" href={DEFAULT_SETTINGS.irccRoundsUrl}>Official IRCC rounds of invitations</a>
          {" · "}Last updated {lastUpdated(SEED_DRAWS)?.slice(0, 10)}
        </p>
        <DrawsBoard draws={SEED_DRAWS} filters={filters} score={score ? Number(score) : null} compareCount={DEFAULT_SETTINGS.drawsCompareCount} />
        <p className="mt-6 text-sm">
          <Link className="underline" href="/tools/crs">Back to the CRS calculator</Link>
        </p>
      </article>
    </PublicShell>
  );
}
