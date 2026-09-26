import { Container, Eyebrow } from "./primitives";

const items = [
  {
    title: "AI-supported speaking practice",
    body: "Record timed answers in the browser and receive AI-supported practice feedback after each attempt.",
  },
  {
    title: "Live CELPIP classes",
    body: "Join structured live classes with weekday and weekend options through CELPIP Decoded.",
  },
  {
    title: "Timed practice experience",
    body: "Work with prompts and timing that follow the flow of the CELPIP speaking section.",
  },
  {
    title: "Feedback and progress",
    body: "Review a practice report after each attempt and watch your speaking develop over time.",
  },
  {
    title: "Practice badges",
    body: "Earn badges as you complete attempts and build a steady practice habit.",
  },
  {
    title: "Pathway support",
    body: "Get guidance on your next step as you work toward your CELPIP goal.",
  },
];

export function IncludedSection() {
  return (
    <section id="program" className="scroll-mt-20 bg-cream text-foreground">
      <Container className="py-20 sm:py-28">
        <div className="max-w-2xl">
          <Eyebrow className="text-brand">What is included</Eyebrow>
          <h2 className="mt-5 font-serif text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">
            One program, every part of your CELPIP preparation
          </h2>
          <p className="mt-5 text-lg leading-8 text-foreground/70">
            CELPIP Decoded combines instructor-led strategy with AI-supported
            practice, so you prepare with structure and know what each task is
            asking for.
          </p>
        </div>

        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <div
              key={item.title}
              className="rounded-3xl bg-white p-8 shadow-sm ring-1 ring-foreground/5"
            >
              <h3 className="text-xl font-semibold text-foreground">
                {item.title}
              </h3>
              <p className="mt-3 leading-7 text-foreground/70">{item.body}</p>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
