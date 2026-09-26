import Link from "next/link";
import { Container, Eyebrow } from "./primitives";

const features = [
  {
    title: "Timed prompts",
    body: "Practice with the pacing and pressure of the CELPIP speaking section.",
  },
  {
    title: "In-browser recording",
    body: "Record your answers directly in the browser with no extra software.",
  },
  {
    title: "Transcript reference",
    body: "See a transcript of your answer so you can review exactly what you said.",
  },
  {
    title: "Skill-based feedback",
    body: "Get AI-supported practice feedback on clarity, structure, vocabulary, and task response.",
  },
  {
    title: "Estimated practice level",
    body: "Receive an estimated practice level with each practice report. It is a preparation guide, not an official CELPIP score.",
  },
];

export function AiPracticeSection() {
  return (
    <section id="ai-practice" className="scroll-mt-20 bg-ink text-cream">
      <Container className="py-20 sm:py-28">
        <div className="grid gap-14 lg:grid-cols-2 lg:gap-20">
          <div>
            <Eyebrow className="text-brand">
              AI-supported speaking practice
            </Eyebrow>
            <h2 className="mt-5 font-serif text-4xl font-semibold leading-tight tracking-tight text-cream sm:text-5xl">
              Practice speaking anytime, as part of the program
            </h2>
            <p className="mt-5 max-w-md text-lg leading-8 text-cream/75">
              The practice app is one part of CELPIP Decoded.
              Use it between live classes to keep your speaking sharp and to
              track what to improve next.
            </p>

            <div className="mt-9">
              <Link
                href="/signup"
                className="inline-flex h-13 items-center justify-center rounded-full bg-brand px-8 text-base font-semibold text-white shadow-lg shadow-brand/20 transition-colors hover:bg-brand-dark"
              >
                Start speaking practice
              </Link>
            </div>
          </div>

          <div className="flex flex-col divide-y divide-cream/10">
            {features.map((feature, index) => (
              <div
                key={feature.title}
                className={index === 0 ? "pb-7" : "py-7 last:pb-0"}
              >
                <h3 className="text-lg font-semibold text-cream">
                  {feature.title}
                </h3>
                <p className="mt-2 leading-7 text-cream/70">{feature.body}</p>
              </div>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
