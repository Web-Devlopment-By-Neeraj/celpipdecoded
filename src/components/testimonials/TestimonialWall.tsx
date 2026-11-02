"use client";

import Link from "next/link";
import { useState } from "react";
import { cx } from "@/features/design/design-tokens";
import {
  RESULT_FILTERS,
  TESTIMONIALS,
  filterTestimonials,
  type ResultFilter,
} from "@/features/testimonials/testimonials";
import { TestimonialCard } from "./TestimonialCard";

// The wall of results, with filter chips.
//
// On the home page it shows a few cards and links to /results. On a phone
// it can turn into a swipe row (mobileCarousel), so the section stays
// short and the next section is one scroll away.

export function TestimonialWall({
  limit,
  excludeIds = [],
  moreHref,
  mobileCarousel = false,
  className,
}: {
  limit?: number;
  excludeIds?: readonly string[];
  moreHref?: string;
  mobileCarousel?: boolean;
  className?: string;
}) {
  const [filter, setFilter] = useState<ResultFilter>("all");
  const [expanded, setExpanded] = useState(false);

  const pool = TESTIMONIALS.filter((t) => !excludeIds.includes(t.id));
  const matching = filterTestimonials(filter === "all" ? pool : TESTIMONIALS, filter);
  const capped = limit !== undefined && !expanded;
  const shown = capped ? matching.slice(0, limit) : matching;
  const hidden = matching.length - shown.length;

  return (
    <div className={className}>
      <div
        role="group"
        aria-label="Filter results"
        className="-mx-5 flex gap-2 overflow-x-auto px-5 pb-1 [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:px-0"
      >
        {RESULT_FILTERS.map((option) => {
          const selected = option.id === filter;
          return (
            <button
              key={option.id}
              type="button"
              aria-pressed={selected}
              onClick={() => {
                setFilter(option.id);
                setExpanded(false);
              }}
              className={cx(
                "inline-flex h-10 shrink-0 items-center rounded-full px-4 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand",
                selected
                  ? "bg-academy-navy text-white"
                  : "bg-white text-ink/75 ring-1 ring-ink/15 hover:bg-academy-navy-soft hover:text-ink",
              )}
            >
              {option.label}
            </button>
          );
        })}
      </div>

      <p aria-live="polite" className="sr-only">
        {matching.length} results
      </p>

      <ul
        className={cx(
          "mt-6",
          mobileCarousel
            ? "-mx-5 flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-2 [scrollbar-width:none] sm:mx-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0 sm:pb-0 lg:grid-cols-3"
            : "grid gap-4 sm:grid-cols-2 lg:grid-cols-3",
        )}
      >
        {shown.map((testimonial) => (
          <li
            key={testimonial.id}
            className={cx(
              mobileCarousel && "w-[85%] shrink-0 snap-start sm:w-auto",
            )}
          >
            <TestimonialCard testimonial={testimonial} />
          </li>
        ))}
      </ul>

      {hidden > 0 || moreHref ? (
        <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          {hidden > 0 && !moreHref ? (
            <button
              type="button"
              onClick={() => setExpanded(true)}
              className="inline-flex h-12 items-center justify-center rounded-full bg-white px-6 text-sm font-semibold text-ink ring-1 ring-ink/15 transition-colors hover:bg-academy-navy-soft"
            >
              Show {hidden} more
            </button>
          ) : null}
          {moreHref ? (
            <Link
              href={moreHref}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-academy-navy px-6 text-sm font-semibold text-white transition-opacity hover:opacity-90"
            >
              See all {TESTIMONIALS.length} results
              <span aria-hidden>→</span>
            </Link>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
