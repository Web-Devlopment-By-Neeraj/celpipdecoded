import Link from "next/link";
import { BrandPromiseTagline } from "@/components/brand/BrandPromiseTagline";
import { ScoreRow } from "@/components/testimonials/ScoreRing";
import { StudentAvatar } from "@/components/testimonials/StudentAvatar";
import { brandCopy } from "@/features/brand/brand-copy";
import { MOCK_TEST_1_HUB_PATH } from "@/features/mock-tests/mock-test-1-routes";
import {
  RESULTS_HEADLINE,
  SKILL_LABELS,
  TESTIMONIALS,
  biggestJump,
  testimonialById,
} from "@/features/testimonials/testimonials";
import { Container } from "./primitives";

// Public hero (BRAND-01, Build Pack hero).
//
// The three headline lines come straight from the brand brief: the
// promise, the reason, and the instructor's own credibility line. The
// instructor "I" line is used here and on the public surfaces only, not
// inside the signed in app.
//
// Light hero on the warm off-white, as in the client mockup, with proof
// right under the buttons: a row of student initials and the results
// claim, linking to the results section below. The navy panel beside it
// is the program card with one featured before and after result. No
// photography and no other brand's artwork.

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

const avatarNames = TESTIMONIALS.slice(4, 9).map((t) => t.name);
const featured = testimonialById("smriti");

function CheckIcon() {
  return (
    <svg
      viewBox="0 0 20 20"
      className="mt-0.5 h-5 w-5 shrink-0 text-brand-mint"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="10" cy="10" r="8" strokeOpacity="0.35" />
      <path d="M6.5 10.2l2.3 2.3 4.7-5" />
    </svg>
  );
}

export function ProgramHeroSection({ signedIn = false }: { signedIn?: boolean }) {
  const featuredJump = featured ? biggestJump(featured) : undefined;

  return (
    <section className="relative isolate overflow-hidden bg-cream">
      <div
        aria-hidden
        className="absolute -right-32 -top-40 -z-10 h-[28rem] w-[28rem] rounded-full bg-brand-teal/15 blur-3xl sm:h-[36rem] sm:w-[36rem]"
      />
      <div
        aria-hidden
        className="absolute -bottom-48 -left-40 -z-10 h-[26rem] w-[26rem] rounded-full bg-brand-ink/10 blur-3xl"
      />

      <Container className="grid gap-12 pb-16 pt-10 sm:pb-20 sm:pt-16 lg:grid-cols-[1.08fr_0.92fr] lg:items-center lg:gap-14 lg:py-24">
        <div>
          <BrandPromiseTagline tone="brand" className="mb-4 sm:mb-5" />

          <h1 className="font-serif tracking-tight text-balance">
            <span className="block text-[2.5rem] font-extrabold leading-[1.04] text-ink sm:text-5xl lg:text-6xl">
              {brandCopy.heroHeadline}
            </span>{" "}
            <span className="mt-3 block max-w-xl text-[1.625rem] font-bold leading-[1.18] text-brand sm:mt-4 sm:text-[2rem] lg:text-[2.375rem]">
              {brandCopy.heroHeadlineAnswer}
            </span>
          </h1>

          <p className="mt-7 max-w-2xl border-l-4 border-brand pl-4 sm:mt-8 text-base font-medium leading-7 text-ink/80 sm:text-lg sm:leading-8">
            {brandCopy.instructorLine}
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:mt-10 sm:flex-row sm:items-center sm:gap-4">
            <Link
              href={signedIn ? "/dashboard" : "/signup"}
              className="inline-flex h-13 items-center justify-center rounded-full bg-brand px-7 text-base font-semibold text-white shadow-lg shadow-brand/25 transition-colors hover:bg-brand-dark"
            >
              {signedIn ? "Go to dashboard" : "Start free trial"}
            </Link>
            <Link
              href={signedIn ? MOCK_TEST_1_HUB_PATH : `/signup?next=${encodeURIComponent(MOCK_TEST_1_HUB_PATH)}`}
              className="inline-flex h-13 items-center justify-center rounded-full bg-white px-7 text-base font-semibold text-ink ring-1 ring-ink/15 transition-colors hover:bg-academy-navy-soft"
            >
              Start mock test
            </Link>
          </div>

          <a
            href="#results"
            className="group mt-8 inline-flex items-center gap-3 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
          >
            <span className="flex -space-x-2.5">
              {avatarNames.map((name) => (
                <StudentAvatar
                  key={name}
                  name={name}
                  className="h-9 w-9 ring-2 ring-background"
                />
              ))}
            </span>
            <span className="text-sm leading-5 text-ink/70">
              <span className="block font-bold text-ink">{RESULTS_HEADLINE}</span>
              <span className="font-semibold text-brand group-hover:underline">
                See their scores
              </span>
            </span>
          </a>
        </div>

        <div className="relative mx-auto w-full max-w-md lg:max-w-none">
          <div className="rounded-3xl bg-navy-panel p-6 text-white shadow-2xl shadow-brand-ink/20 ring-1 ring-white/10 sm:p-9">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-mint">
              {brandCopy.instructorLabel}
            </p>
            <p className="mt-2 text-lg font-semibold leading-7 text-white">
              {brandCopy.instructorCredential}
            </p>

            <ul className="mt-6 space-y-4">
              {proofPoints.map((point) => (
                <li key={point.label} className="flex gap-3">
                  <CheckIcon />
                  <div>
                    <p className="text-base font-semibold text-white">
                      {point.label}
                    </p>
                    <p className="mt-0.5 text-sm leading-6 text-white/65">
                      {point.detail}
                    </p>
                  </div>
                </li>
              ))}
            </ul>

            {featured ? (
              <figure className="mt-7 rounded-2xl bg-white/5 p-4 ring-1 ring-white/10 sm:p-5">
                <div className="flex items-center justify-between gap-3">
                  <figcaption className="flex items-center gap-2.5">
                    <StudentAvatar name={featured.name} className="h-8 w-8 text-xs" />
                    <span className="text-sm font-semibold text-white">
                      {featured.name}
                    </span>
                  </figcaption>
                  {featuredJump ? (
                    <span className="rounded-full bg-brand px-2.5 py-1 text-xs font-bold text-white">
                      {SKILL_LABELS[featuredJump.skill]} {featuredJump.from} → {featuredJump.to}
                    </span>
                  ) : null}
                </div>
                <blockquote className="mt-3 text-sm leading-6 text-white/80">
                  <p>&ldquo;{featured.quote}&rdquo;</p>
                </blockquote>
                <ScoreRow scores={featured.scores} size="sm" tone="onDark" className="mt-4" />
              </figure>
            ) : null}
          </div>
        </div>
      </Container>
    </section>
  );
}
