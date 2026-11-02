import type { Metadata } from "next";
import Link from "next/link";
import { BeforeAfterSpotlight } from "@/components/testimonials/BeforeAfterSpotlight";
import { ResultsStatsStrip } from "@/components/testimonials/ResultsStatsStrip";
import { TestimonialWall } from "@/components/testimonials/TestimonialWall";
import { brandCopy } from "@/features/brand/brand-copy";
import {
  RESULTS_HEADLINE,
  TESTIMONIALS,
  resultsStats,
} from "@/features/testimonials/testimonials";

export const metadata: Metadata = {
  title: "Student results - CELPIP Decoded",
  description:
    "CELPIP scores and words from students coached by CELPIP Decoded, with before and after results across Listening, Reading, Writing and Speaking.",
};

export default function ResultsPage() {
  return (
    <main className="overflow-x-hidden bg-cream text-ink">
      <section className="relative isolate overflow-hidden">
        <div
          aria-hidden
          className="absolute -right-32 -top-40 -z-10 h-[28rem] w-[28rem] rounded-full bg-brand-teal/15 blur-3xl"
        />
        <div className="mx-auto w-full max-w-6xl px-5 pb-10 pt-10 sm:px-8 sm:pb-12">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand">
            Student results
          </p>
          <h1 className="mt-3 max-w-3xl font-serif text-4xl font-extrabold leading-[1.05] tracking-tight text-ink sm:text-5xl">
            {RESULTS_HEADLINE}
          </h1>
          <p className="mt-4 max-w-2xl text-lg leading-8 text-ink/70">
            Real scores shared by students who followed the method, in their
            own words. Filter by what matters to you: a CLB 9 in every skill,
            a big jump in one, or a first attempt.
          </p>

          <ResultsStatsStrip stats={resultsStats(TESTIMONIALS)} className="mt-10" />
        </div>
      </section>

      <div className="mx-auto w-full max-w-6xl px-5 pb-16 sm:px-8 sm:pb-24">
        <BeforeAfterSpotlight />

        <h2 className="mt-14 font-serif text-2xl font-bold tracking-tight text-ink sm:text-3xl">
          Every result
        </h2>
        <TestimonialWall className="mt-5" />

        <div className="mt-14 flex flex-col items-start gap-5 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-ink/10 sm:flex-row sm:items-center sm:justify-between sm:p-8">
          <div>
            <p className="text-lg font-bold tracking-tight text-ink">
              Your score could be next.
            </p>
            <p className="mt-1 text-sm leading-6 text-ink/65">
              Start a free trial and practise in the real CELPIP format,
              with feedback after every attempt.
            </p>
          </div>
          <Link
            href="/signup"
            className="inline-flex h-12 w-full shrink-0 items-center justify-center rounded-full bg-brand px-6 text-sm font-semibold text-white shadow-sm shadow-brand/25 transition-colors hover:bg-brand-dark sm:w-auto"
          >
            Start free trial
          </Link>
        </div>

        <p className="mt-8 max-w-3xl text-xs leading-5 text-ink/50">
          Scores are shown as students reported them. Results vary from
          student to student. {brandCopy.practiceEstimateLine}
        </p>
      </div>
    </main>
  );
}
