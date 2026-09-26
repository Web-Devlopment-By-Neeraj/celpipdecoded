import Link from "next/link";
import { brandCopy } from "@/features/brand/brand-copy";
import { Container, Eyebrow } from "./primitives";

const options = [
  {
    name: "AI practice preview",
    price: "Free preview",
    priceNote: "to begin",
    features: [
      "1 free scored speaking attempt planned",
      "Practice report after submission",
      "Upgrade options coming soon",
    ],
    cta: { label: "Start free trial", href: "/signup" },
    featured: false,
  },
  {
    name: "Live CELPIP classes",
    price: "$299",
    priceNote: "per month",
    features: [
      "Weekday and weekend options",
      "Morning and evening availability",
      "Schedule confirmation required",
    ],
    cta: { label: "Request class schedule", href: "#inquiry" },
    featured: true,
  },
  {
    name: "AI practice packages",
    price: "From $5",
    priceNote: "per package",
    features: [
      "Starter pack: $5 for 5 scored attempts",
      "Practice pack: $10 for 12 scored attempts",
      "Monthly practice plan: $20/month for up to 40 scored attempts",
    ],
    cta: { label: "Start speaking practice", href: "/signup" },
    featured: false,
  },
];

export function ProgramOptionsSection() {
  return (
    <section id="pricing" className="scroll-mt-20 bg-brand text-white">
      <Container className="py-20 sm:py-28">
        <div className="max-w-2xl">
          <Eyebrow className="text-white/80">Program options</Eyebrow>
          <h2 className="mt-5 font-serif text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">
            Choose how you prepare
          </h2>
          <p className="mt-5 text-lg leading-8 text-white/85">
            Combine live CELPIP classes with AI-supported speaking practice, or
            start with the option that fits your goal today.
          </p>
        </div>

        <div className="mt-14 grid gap-5 lg:grid-cols-3">
          {options.map((option) => (
            <div
              key={option.name}
              className={`flex flex-col rounded-3xl p-8 ring-1 backdrop-blur-sm ${
                option.featured
                  ? "bg-white text-foreground ring-white shadow-xl"
                  : "bg-white/10 text-white ring-white/20"
              }`}
            >
              <h3
                className={`text-xs font-semibold uppercase tracking-[0.2em] ${
                  option.featured ? "text-brand" : "text-white/70"
                }`}
              >
                {option.name}
              </h3>

              <p className="mt-5">
                <span className="font-serif text-4xl font-semibold">
                  {option.price}
                </span>{" "}
                <span
                  className={
                    option.featured ? "text-foreground/60" : "text-white/70"
                  }
                >
                  {option.priceNote}
                </span>
              </p>

              <ul
                className={`mt-6 flex flex-col gap-3 text-sm leading-6 ${
                  option.featured ? "text-foreground/75" : "text-white/85"
                }`}
              >
                {option.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3">
                    <span
                      aria-hidden
                      className={`mt-2 h-1.5 w-1.5 shrink-0 rounded-full ${
                        option.featured ? "bg-brand" : "bg-white/70"
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
                        : "bg-white/15 text-white ring-1 ring-white/30 hover:bg-white/25"
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
                        : "bg-white/15 text-white ring-1 ring-white/30 hover:bg-white/25"
                    }`}
                  >
                    {option.cta.label}
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>

        <p className="mt-10 max-w-2xl text-sm leading-6 text-white/80">
          {brandCopy.practiceEstimateLine}
        </p>
      </Container>
    </section>
  );
}
