import { BeforeAfterSpotlight } from "@/components/testimonials/BeforeAfterSpotlight";
import { ResultsStatsStrip } from "@/components/testimonials/ResultsStatsStrip";
import { TestimonialWall } from "@/components/testimonials/TestimonialWall";
import {
  RESULTS_HEADLINE,
  SPOTLIGHT_IDS,
  TESTIMONIALS,
  resultsStats,
} from "@/features/testimonials/testimonials";
import { Container, Eyebrow } from "./primitives";

// Student results, straight after the hero (Build Pack, results wall).
//
// Proof first: the headline claim, the numbers the cards back up, the
// before and after stories, then a short wall that links to /results.

export function ResultsSection() {
  return (
    <section
      id="results"
      aria-labelledby="results-title"
      className="bg-white py-16 sm:py-24"
    >
      <Container>
        <div className="max-w-3xl">
          <Eyebrow className="text-brand">Real student results</Eyebrow>
          <h2
            id="results-title"
            className="mt-3 font-serif text-3xl font-bold tracking-tight text-ink sm:text-4xl lg:text-5xl"
          >
            {RESULTS_HEADLINE}
          </h2>
          <p className="mt-4 text-lg leading-8 text-ink/70">
            Scores and words shared by students who followed the method.
            Every card shows the four CELPIP skills on the CLB scale.
          </p>
        </div>

        <ResultsStatsStrip stats={resultsStats(TESTIMONIALS)} className="mt-10" />

        <BeforeAfterSpotlight className="mt-8" />

        <TestimonialWall
          limit={6}
          excludeIds={SPOTLIGHT_IDS}
          moreHref="/results"
          mobileCarousel
          className="mt-12"
        />
      </Container>
    </section>
  );
}
