import { cx } from "@/features/design/design-tokens";
import {
  PROOF_LABELS,
  isClb9AllFour,
  testimonialHighlight,
  type Testimonial,
} from "@/features/testimonials/testimonials";
import { ScoreRow } from "./ScoreRing";
import { StudentAvatar } from "./StudentAvatar";

// One result on the wall: who, what kind of proof they shared, their own
// words, and the four CLB scores.

export function TestimonialCard({
  testimonial,
  className,
}: {
  testimonial: Testimonial;
  className?: string;
}) {
  const highlight = testimonialHighlight(testimonial);

  return (
    <article
      className={cx(
        "flex h-full flex-col rounded-2xl bg-white p-5 shadow-sm ring-1 ring-ink/10",
        className,
      )}
    >
      <header className="flex items-center gap-3">
        <StudentAvatar name={testimonial.name} />
        <div className="min-w-0">
          <h3 className="truncate text-base font-bold tracking-tight text-ink">
            {testimonial.name}
          </h3>
          <p className="truncate text-xs font-medium text-ink/55">
            {PROOF_LABELS[testimonial.proof]}
          </p>
        </div>
        {isClb9AllFour(testimonial) ? (
          <span className="ml-auto shrink-0 rounded-full bg-academy-blue-soft px-2.5 py-1 text-[0.6875rem] font-bold text-academy-blue">
            CLB 9+
          </span>
        ) : null}
      </header>

      <blockquote className="mt-4 flex-1 text-[0.9375rem] leading-7 text-ink/80">
        <p>&ldquo;{testimonial.quote}&rdquo;</p>
      </blockquote>

      {highlight ? (
        <p className="mt-3 text-xs font-semibold text-brand">{highlight}</p>
      ) : null}

      <ScoreRow
        scores={testimonial.scores}
        size="sm"
        className="mt-4 border-t border-ink/10 pt-4"
      />
    </article>
  );
}
