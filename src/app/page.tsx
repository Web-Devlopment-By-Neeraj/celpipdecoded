import type { Metadata } from "next";
import Link from "next/link";
import { PublicShell } from "@/components/site/PublicShell";
import { HeroLauncher } from "@/components/site/HeroLauncher";
import { DiagnosticTool } from "@/components/site/DiagnosticTool";
import { WhichAnswer, StudyPlannerForm } from "@/components/site/LandingInteractive";
import { SignUpPrompt } from "@/components/site/SignUpPrompt";
import { ScoreRing } from "@/components/site/ScoreRing";
import { AppPreview } from "@/components/site/AppPreview";
import { PlansGrid } from "@/components/site/PlansGrid";
import { LanguageSwitch } from "@/components/site/LanguageSwitch";
import { COURSE_HEADING, COURSE_SUBHEAD, courseLessons } from "@/features/public-site/courses";
import { computeResultStats, publicTestimonials, skillValue } from "@/features/public-site/results";
import { FAQ_ENTRIES, SEED_TESTIMONIALS } from "@/features/public-site/seed";
import { faqJsonLd } from "@/features/public-site/seo";
import { DEFAULT_SETTINGS } from "@/features/public-site/settings";
import { brandCopy } from "@/features/brand/brand-copy";

export const metadata: Metadata = {
  title: brandCopy.rootTitle,
  description: brandCopy.metaDescription,
};

const HERO_PROMPT =
  "You are calling a repair shop about a leaking kitchen tap. Give the address, say when someone is home, and ask for the earliest visit.";

export default function HomePage() {
  const stats = computeResultStats(SEED_TESTIMONIALS);
  const cards = publicTestimonials(SEED_TESTIMONIALS);
  const lessons = courseLessons();
  const faq = faqJsonLd(FAQ_ENTRIES);

  return (
    <PublicShell>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faq) }} />
      <section id="hero" className="mx-auto w-full max-w-6xl px-5 py-12 sm:px-8">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand">{brandCopy.tagline}</p>
        <h1 className="mt-3 max-w-3xl font-serif text-4xl font-semibold tracking-tight sm:text-6xl">
          {brandCopy.heroHeadline}
        </h1>
        <p className="mt-4 max-w-2xl text-lg leading-8">{brandCopy.heroSupport}</p>
        <p className="mt-6 max-w-2xl text-base leading-7">{HERO_PROMPT}</p>
        <div className="mt-6">
          <HeroLauncher
            prepSeconds={DEFAULT_SETTINGS.speakingTask1PrepSeconds}
            recordSeconds={DEFAULT_SETTINGS.speakingTask1RecordSeconds}
            prompt={HERO_PROMPT}
          />
        </div>
      </section>

      <section id="proof" className="bg-ink text-cream">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-3 px-5 py-8 sm:px-8 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="font-serif text-3xl">100+ students coached to CLB 9+</h2>
            <p className="mt-2 text-base">{stats.verifiedShown} verified results shown here</p>
          </div>
          <Link href="#results" className="text-sm font-semibold underline">
            See the results
          </Link>
        </div>
      </section>

      <section id="free-tools" className="mx-auto w-full max-w-6xl scroll-mt-20 px-5 py-12 sm:px-8">
        <h2 className="font-serif text-3xl">CRS calculator</h2>
        <p className="mt-3 max-w-2xl text-base leading-7">
          Enter a CRS score you already have, then compare it with recent draws. This is general information, not immigration advice. The official Government of Canada tool is the authority for a new calculation.
        </p>
        <Link href="/tools/crs" className="mt-4 inline-flex min-h-11 items-center rounded-full bg-ink px-4 text-sm font-semibold text-cream">
          Open the CRS calculator
        </Link>
      </section>

      <section id="which-answer" className="bg-white">
        <div className="mx-auto w-full max-w-6xl px-5 py-12 sm:px-8">
          <h2 className="font-serif text-3xl">Which answer scores higher</h2>
          <div className="mt-6">
            <WhichAnswer />
          </div>
        </div>
      </section>

      <section id="diagnostic" className="mx-auto w-full max-w-6xl scroll-mt-20 px-5 py-12 sm:px-8">
        <h2 className="font-serif text-3xl">Which module is costing you points</h2>
        <p className="mt-3 max-w-2xl text-base leading-7">
          Enter the four scores you already have. No account is required.
        </p>
        <div className="mt-6">
          <DiagnosticTool />
        </div>
      </section>

      <section id="courses" className="bg-white">
        <div className="mx-auto w-full max-w-6xl px-5 py-12 sm:px-8">
          <h2 className="font-serif text-3xl">{COURSE_HEADING}</h2>
          <p className="mt-3 max-w-3xl text-base leading-7">{COURSE_SUBHEAD}</p>
          <div className="mt-6">
            <LanguageSwitch />
          </div>
          <ul className="mt-6 grid gap-3 sm:grid-cols-2">
            {lessons.map((lesson) => (
              <li key={lesson.id} className="rounded-2xl bg-cream p-4">
                <p className="font-semibold">{lesson.titles.en}</p>
                <p className="text-sm text-ink/70">{lesson.module} · {Math.round(lesson.durationSec / 60)} min</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section id="the-app" className="mx-auto w-full max-w-6xl scroll-mt-20 px-5 py-12 sm:px-8">
        <h2 className="font-serif text-3xl">The app</h2>
        <p className="mt-3 max-w-2xl text-base leading-7">
          This is the same app students use. Locked areas stay visible, with a real preview.
        </p>
        <div className="mt-6">
          <AppPreview />
        </div>
      </section>

      <section id="study-planner" className="bg-white">
        <div className="mx-auto w-full max-w-6xl px-5 py-12 sm:px-8">
          <h2 className="font-serif text-3xl">Study planner</h2>
          <div className="mt-6 max-w-xl">
            <StudyPlannerForm />
          </div>
        </div>
      </section>

      <section id="plans" className="mx-auto w-full max-w-6xl scroll-mt-20 px-5 py-12 sm:px-8">
        <h2 className="font-serif text-3xl">Plans and pricing</h2>
        <p className="mt-2 text-sm">Prices in CAD. Sales tax is added where it applies and shown before payment.</p>
        <div className="mt-6">
          <PlansGrid />
        </div>
        <p className="mt-4 text-sm">
          <Link className="underline" href="/refund">Refund Policy</Link>
        </p>
      </section>

      <section id="results" className="bg-white">
        <div className="mx-auto w-full max-w-6xl px-5 py-12 sm:px-8">
          <h2 className="font-serif text-3xl">100+ students coached to CLB 9+</h2>
          <p className="mt-2 text-base">verified results shown here</p>
          <dl className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4">
            <Stat label="Verified results shown" value={String(stats.verifiedShown)} />
            <Stat label="CLB 9+ in all four" value={String(stats.clb9AllFour)} />
            <Stat label="Students with a perfect 12" value={String(stats.perfect12s)} />
            <Stat
              label="Biggest jump"
              value={stats.biggestJump ? `+${stats.biggestJump.gain} in ${stats.biggestJump.skill}` : "None yet"}
            />
          </dl>
          <ul className="mt-8 grid gap-4 md:grid-cols-2">
            {cards.map((card) => (
              <li key={card.id} className="rounded-3xl bg-cream p-4">
                <p className="font-semibold">{card.firstName}</p>
                <p className="text-sm">{card.proofType}{card.coveredProof ? " · Verified" : ""}</p>
                <div className="mt-3 flex gap-2">
                  <ScoreRing label="L" score={skillValue(card, "Listening")} />
                  <ScoreRing label="R" score={skillValue(card, "Reading")} />
                  <ScoreRing label="W" score={skillValue(card, "Writing")} />
                  <ScoreRing label="S" score={skillValue(card, "Speaking")} />
                </div>
                <p className="mt-3 text-sm leading-6">{card.quote}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section id="about" className="mx-auto w-full max-w-6xl scroll-mt-20 px-5 py-12 sm:px-8">
        <h2 className="font-serif text-3xl">About Amar</h2>
        <p className="mt-4 max-w-2xl text-base leading-7">
          Amar is a CELPIP coach. He maxed his own CELPIP for his permanent residence application and has coached over 100 students to CLB 9 or higher. Most students have an answer-shape problem, not an English problem.
        </p>
        <Link href="/book" className="mt-4 inline-flex min-h-11 items-center rounded-full bg-ink px-4 text-sm font-semibold text-cream">
          Book a free 15-minute strategy call
        </Link>
      </section>

      <section id="faq" className="bg-white">
        <div className="mx-auto w-full max-w-6xl px-5 py-12 sm:px-8">
          <h2 className="font-serif text-3xl">Questions and answers</h2>
          <div className="mt-6 space-y-3">
            {FAQ_ENTRIES.map((entry) => (
              <details key={entry.id} className="rounded-2xl bg-cream p-4">
                <summary className="cursor-pointer text-base font-semibold">{entry.question}</summary>
                <p className="mt-2 text-base leading-7">{entry.answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section id="signup" className="mx-auto w-full max-w-6xl px-5 py-12 sm:px-8">
        <SignUpPrompt context="landing" presentation="inline" />
      </section>
    </PublicShell>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-cream p-4">
      <dt className="text-sm">{label}</dt>
      <dd className="mt-1 font-serif text-2xl">{value}</dd>
    </div>
  );
}
