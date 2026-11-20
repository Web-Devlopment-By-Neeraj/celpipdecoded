import Link from "next/link";
import { brandCopy } from "@/features/brand/brand-copy";
import { Container, Eyebrow } from "./primitives";

const options = [
  {
    name: "Free",
    price: "$0",
    priceNote: "forever",
    features: [
      "Mock Test 1",
      "2 AI evaluations",
      "CRS calculator and free tools",
    ],
    cta: { label: "Start free", href: "/signup" },
    featured: false,
  },
  {
    name: "Test Sprint",
    price: "$49",
    priceNote: "per month",
    features: [
      "All 20+ mock tests",
      "AI feedback on Writing and Speaking",
      "Cancel any time",
    ],
    cta: { label: "See plans", href: "/pricing" },
    featured: true,
  },
  {
    name: "Decoded Course",
    price: "$199",
    priceNote: "one time",
    features: [
      "All modules in English and Hindi",
      "3 months of Test Sprint included",
      "Prices in CAD",
    ],
    cta: { label: "See the course", href: "/pricing" },
    featured: false,
  },
];

export function ProgramOptionsSection() {
  return (
    <section id="pricing" className="bg-white text-foreground">
      <Container className="py-16 sm:py-24">
        <div className="max-w-2xl">
          <Eyebrow className="text-brand">Program options</Eyebrow>
          <h2 className="mt-3 font-serif text-3xl font-bold leading-tight tracking-tight sm:text-4xl lg:text-5xl">
            Choose how you prepare
          </h2>
          <p className="mt-5 text-lg leading-8 text-foreground/70">
            Start free, practice with Test Sprint, or get the Decoded Course.
            Prices are in CAD.
          </p>
        </div>

        <div className="mt-14 grid gap-5 lg:grid-cols-3">
          {options.map((option) => (
            <div
              key={option.name}
              className={`flex flex-col rounded-2xl p-6 ring-1 sm:p-8 ${
                option.featured
                  ? "bg-navy-panel text-white shadow-xl shadow-brand-ink/20 ring-white/10 lg:-my-3 lg:py-11"
                  : "bg-cream text-foreground ring-ink/10"
              }`}
            >
              <h3
                className={`text-xs font-semibold uppercase tracking-[0.2em] ${
                  option.featured ? "text-brand-mint" : "text-brand"
                }`}
              >
                {option.name}
              </h3>

              <p className="mt-5">
                <span className="font-serif text-4xl font-bold">
                  {option.price}
                </span>{" "}
                <span
                  className={
                    option.featured ? "text-white/65" : "text-foreground/60"
                  }
                >
                  {option.priceNote}
                </span>
              </p>

              <ul
                className={`mt-6 flex flex-col gap-3 text-sm leading-6 ${
                  option.featured ? "text-white/80" : "text-foreground/75"
                }`}
              >
                {option.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3">
                    <span
                      aria-hidden
                      className={`mt-2 h-1.5 w-1.5 shrink-0 rounded-full ${
                        option.featured ? "bg-brand-mint" : "bg-brand"
                      }`}
                    />
                    {feature}
                  </li>
                ))}
              </ul>

              <div className="mt-8 pt-2 lg:mt-auto">
                {option.cta.href.startsWith("#") ? (
                  <a
                    href={option.cta.href}
                    className={`inline-flex h-12 w-full items-center justify-center rounded-full text-sm font-semibold transition-colors ${
                      option.featured
                        ? "bg-brand text-white hover:bg-brand-dark"
                        : "bg-white text-foreground ring-1 ring-ink/15 hover:bg-academy-navy-soft"
                    }`}
                  >
                    {option.cta.label}
                  </a>
                ) : (
                  <Link
                    href={option.cta.href}
                    className={`inline-flex h-12 w-full items-center justify-center rounded-full text-sm font-semibold transition-colors ${
                      option.featured
                        ? "bg-brand text-white hover:bg-brand-dark"
                        : "bg-white text-foreground ring-1 ring-ink/15 hover:bg-academy-navy-soft"
                    }`}
                  >
                    {option.cta.label}
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>

        <p className="mt-10 max-w-2xl text-sm leading-6 text-foreground/60">
          {brandCopy.practiceEstimateLine}
        </p>
      </Container>
    </section>
  );
}
