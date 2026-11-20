import Image from "next/image";
import { Container, Eyebrow } from "./primitives";

const scheduleDetails = [
  "8 classes over two weeks",
  "One hour each",
  "On Google Meet",
  "Dates and times shared when you book",
];

export function LiveClassesSection() {
  return (
    <section
      id="live-classes"
      className="bg-cream-soft text-foreground"
    >
      <Container className="py-16 sm:py-24">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center lg:gap-16">
          <div className="relative aspect-[3/2] overflow-hidden rounded-3xl shadow-xl shadow-black/10 ring-1 ring-ink/10">
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
            <h2 className="mt-3 font-serif text-3xl font-bold leading-tight tracking-tight sm:text-4xl lg:text-5xl">
              Learn live with structured support
            </h2>
            <p className="mt-5 text-lg leading-8 text-foreground/70">
              Eight live classes over two weeks, one hour each, on Google Meet.
              Class dates and times are shared when you book.
            </p>

            <ul className="mt-8 grid gap-3 sm:grid-cols-2">
              {scheduleDetails.map((detail) => (
                <li
                  key={detail}
                  className="flex items-center gap-3 rounded-2xl bg-white px-4 py-3 text-sm font-medium text-foreground/80 shadow-sm ring-1 ring-ink/10"
                >
                  <span
                    aria-hidden
                    className="h-1.5 w-1.5 shrink-0 rounded-full bg-brand"
                  />
                  {detail}
                </li>
              ))}
            </ul>

            <div className="mt-8 flex flex-wrap items-center justify-between gap-x-6 gap-y-4">
              <p className="text-lg text-foreground/80">
                <span className="font-serif text-3xl font-bold text-foreground">
                  $99
                </span>{" "}
                per 2 weeks
              </p>

              <a
                href="/book"
                className="inline-flex h-13 items-center justify-center rounded-full bg-brand px-8 text-base font-semibold text-white shadow-lg shadow-brand/20 transition-colors hover:bg-brand-dark"
              >
                Join the next batch
              </a>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
