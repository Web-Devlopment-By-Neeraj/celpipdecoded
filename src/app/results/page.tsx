import type { Metadata } from "next";
import { PublicShell } from "@/components/site/PublicShell";
import { ScoreRing } from "@/components/site/ScoreRing";
import { brandTitle } from "@/features/brand/brand-copy";
import { computeResultStats, publicTestimonials, skillValue } from "@/features/public-site/results";
import { SEED_TESTIMONIALS } from "@/features/public-site/seed";

export const metadata: Metadata = {
  title: brandTitle("Results"),
  description: "Verified student-reported results. These are not practice estimates from the platform.",
};

export default function ResultsPage() {
  const stats = computeResultStats(SEED_TESTIMONIALS);
  const cards = publicTestimonials(SEED_TESTIMONIALS);
  return (
    <PublicShell>
      <article className="mx-auto w-full max-w-6xl px-5 py-10 sm:px-8">
        <h1 className="font-serif text-4xl">100+ students coached to CLB 9+</h1>
        <p className="mt-2">verified results shown here</p>
        <p className="mt-4 text-base">{stats.verifiedShown} published results. {stats.clb9AllFour} reached CLB 9 or higher in all four.</p>
        <ul className="mt-8 grid gap-4 md:grid-cols-2">
          {cards.map((card) => (
            <li key={card.id} className="rounded-3xl bg-white p-4 ring-1 ring-ink/10">
              <p className="font-semibold">{card.firstName}{card.coveredProof ? " · Verified" : ""}</p>
              <div className="mt-3 flex gap-2">
                <ScoreRing label="L" score={skillValue(card, "Listening")} />
                <ScoreRing label="R" score={skillValue(card, "Reading")} />
                <ScoreRing label="W" score={skillValue(card, "Writing")} />
                <ScoreRing label="S" score={skillValue(card, "Speaking")} />
              </div>
              <p className="mt-3 text-sm">{card.quote}</p>
            </li>
          ))}
        </ul>
      </article>
    </PublicShell>
  );
}
