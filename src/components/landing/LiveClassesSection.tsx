import Image from "next/image";
import { Container, Eyebrow } from "./primitives";

const scheduleDetails = [
  "Weekday classes",
  "Tuesday and Thursday options",
  "Weekend classes",
  "Morning and evening availability",
];

export function LiveClassesSection() {
  return (
    <section
      id="live-classes"
      className="scroll-mt-20 bg-cream-soft text-foreground"
    >
      <Container className="py-20 sm:py-28">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center lg:gap-16">
          <div className="relative aspect-[3/2] overflow-hidden rounded-3xl shadow-xl shadow-black/10 ring-1 ring-foreground/5">
            <Image
              src="/onlineclass.jpg"
              alt="A student joining a live online class on a laptop"
              fill
              sizes="(max-width: 1024px) 100vw, 560px"
              className="object-cover"
            />
          </div>

          <div>
            <Eyebrow className="text-brand">Live CELPIP classes</Eyebrow>
            <h2 className="mt-5 font-serif text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">
              Learn live with structured support
            </h2>
            <p className="mt-5 text-lg leading-8 text-foreground/70">
              Live CELPIP classes are available through CELPIP Decoded for
              students who want structured support alongside the AI practice
              tool.
            </p>

            <ul className="mt-8 grid gap-3 sm:grid-cols-2">
              {scheduleDetails.map((detail) => (
                <li
                  key={detail}
                  className="flex items-center gap-3 rounded-2xl bg-white px-4 py-3 text-sm font-medium text-foreground/80 shadow-sm ring-1 ring-foreground/5"
                >
                  <span
                    aria-hidden
                    className="h-1.5 w-1.5 shrink-0 rounded-full bg-brand"
                  />
                  {detail}
                </li>
              ))}
            </ul>

            <p className="mt-8 text-lg text-foreground/80">
              <span className="font-serif text-3xl font-semibold text-foreground">
                $299
              </span>{" "}
              per month
            </p>

            <div className="mt-8">
              <a
                href="#inquiry"
                className="inline-flex h-13 items-center justify-center rounded-full bg-brand px-8 text-base font-semibold text-white shadow-lg shadow-brand/20 transition-colors hover:bg-brand-dark"
              >
                Request class schedule
              </a>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
