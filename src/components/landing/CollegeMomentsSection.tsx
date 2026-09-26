import { brandCopy } from "@/features/brand/brand-copy";
import { Container, Eyebrow } from "./primitives";

// The Codebreakers community section (BRAND-01).
//
// This used to be a photo grid of another school's class scenes and
// banners, which cannot stay on a CELPIP Decoded page. It is now a plain
// community section that names the community from the brand brief and
// says what belonging to it involves. No photography, no other brand's
// marks, and nothing here claims a CELPIP affiliation.

const habits = [
  {
    title: "Decode the question first",
    body: "Every task is read for what the marker is looking for before a single word is written or spoken.",
  },
  {
    title: "Practise in the real format",
    body: "Timed, in the browser, in the order CELPIP uses, so test day is not the first time it feels like this.",
  },
  {
    title: "Fix one thing at a time",
    body: "Each practice report names the specific habit to work on next, rather than a general grade.",
  },
  {
    title: "Keep the streak small",
    body: "Short, regular sessions beat one long session the weekend before the test.",
  },
];

export function CollegeMomentsSection() {
  return (
    <section className="overflow-hidden bg-cream text-foreground">
      <Container className="py-20 sm:py-28">
        <div className="max-w-2xl">
          <Eyebrow className="text-brand">{brandCopy.communityName}</Eyebrow>
          <h2 className="mt-5 font-serif text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">
            A community that decodes the test together
          </h2>
          <p className="mt-5 text-lg leading-8 text-foreground/70">
            {brandCopy.communityLine}
          </p>
        </div>

        <div className="mt-14 grid gap-5 sm:grid-cols-2">
          {habits.map((habit) => (
            <div
              key={habit.title}
              className="rounded-3xl bg-white p-8 shadow-sm ring-1 ring-foreground/5"
            >
              <h3 className="text-xl font-semibold text-foreground">
                {habit.title}
              </h3>
              <p className="mt-3 leading-7 text-foreground/70">{habit.body}</p>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
