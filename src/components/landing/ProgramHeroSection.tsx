import Link from "next/link";
import { CelpipDecodedLogo } from "@/components/brand/CelpipDecodedLogo";
import { brandCopy } from "@/features/brand/brand-copy";
import { Container, Eyebrow } from "./primitives";

// Public hero (BRAND-01).
//
// The three headline lines come straight from the brand brief: the
// promise, the reason, and the instructor's own credibility line. The
// instructor "I" line is used here and on the public surfaces only, not
// inside the signed in app.
//
// The panel beside the copy used to be a photo collage of another
// school's banners. It is now a brand panel drawn from the same bracket
// mark as the logo, so no other brand's artwork appears on the page.

const proofPoints = [
  {
    label: "Real-format mock tests",
    detail: "Listening, Reading, Writing and Speaking, run the way CELPIP runs.",
  },
  {
    label: "AI-supported feedback",
    detail: "A practice estimate and the specific fixes after every attempt.",
  },
  {
    label: brandCopy.communityName,
    detail: "Practise alongside other candidates working the same method.",
  },
];

export function ProgramHeroSection() {
  return (
    <section className="relative isolate overflow-hidden bg-ink text-cream">
      {/* Soft brand glow behind the panel side. */}
      <div
        aria-hidden
        className="absolute -right-40 top-1/3 -z-10 h-[32rem] w-[32rem] rounded-full bg-brand-teal/20 blur-3xl"
      />

      <Container className="grid gap-14 py-16 sm:py-20 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-16 lg:py-28">
        <div>
          <Eyebrow className="text-brand-teal">{brandCopy.name}</Eyebrow>

          <h1 className="mt-6 font-serif text-4xl font-semibold leading-[1.05] tracking-tight text-cream sm:text-5xl lg:text-6xl">
            {brandCopy.heroHeadline}
          </h1>

          <p className="mt-6 max-w-xl text-lg leading-8 text-cream/80">
            {brandCopy.heroSupport}
          </p>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
            <Link
              href="/signup"
              className="inline-flex h-13 items-center justify-center rounded-full bg-brand px-7 text-base font-semibold text-white shadow-lg shadow-brand/20 transition-colors hover:bg-brand-dark"
            >
              Start free trial
            </Link>
            <Link
              href="/dashboard"
              className="inline-flex h-13 items-center justify-center rounded-full px-7 text-base font-semibold text-cream ring-1 ring-cream/30 transition-colors hover:bg-cream/10"
            >
              Start mock test
            </Link>
          </div>

          <p className="mt-8 max-w-md text-sm leading-6 text-cream/60">
            {brandCopy.instructorLine}
          </p>
        </div>

        {/* Brand panel. No photography, no other brand's marks. */}
        <div className="relative mx-auto w-full max-w-md lg:max-w-none">
          <div className="rounded-3xl bg-cream/5 p-8 ring-1 ring-cream/15 backdrop-blur-sm sm:p-10">
            <CelpipDecodedLogo tone="reversed" size="lg" />

            <p className="mt-6 text-sm font-semibold uppercase tracking-[0.2em] text-brand-teal">
              {brandCopy.instructorLabel}
            </p>
            <p className="mt-2 text-lg leading-7 text-cream/85">
              {brandCopy.instructorCredential}
            </p>

            <ul className="mt-8 flex flex-col divide-y divide-cream/10">
              {proofPoints.map((point) => (
                <li key={point.label} className="py-4 first:pt-0 last:pb-0">
                  <p className="text-base font-semibold text-cream">
                    {point.label}
                  </p>
                  <p className="mt-1 text-sm leading-6 text-cream/65">
                    {point.detail}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Container>
    </section>
  );
}
