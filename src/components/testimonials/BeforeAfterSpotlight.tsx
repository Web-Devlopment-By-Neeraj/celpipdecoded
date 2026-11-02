"use client";

import { useId, useRef, useState, type KeyboardEvent } from "react";
import { cx } from "@/features/design/design-tokens";
import {
  PROOF_LABELS,
  SKILL_LABELS,
  SPOTLIGHT_IDS,
  biggestJump,
  testimonialById,
  type Testimonial,
} from "@/features/testimonials/testimonials";
import { ScoreRow } from "./ScoreRing";

// Before and after stories, on the navy panel (DESIGN.md).
//
// The tabs are a real tablist: arrow keys move between students, and the
// panel is labelled by the selected tab. A student with a full earlier
// result shows both score rows; one who shared a single skill shows that
// jump large, with the current scores under it.

const spotlight: Testimonial[] = SPOTLIGHT_IDS.map((id) => testimonialById(id)).filter(
  (testimonial): testimonial is Testimonial => testimonial !== undefined,
);

export function BeforeAfterSpotlight({ className }: { className?: string }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const baseId = useId();

  if (spotlight.length === 0) return null;

  const active = spotlight[activeIndex];
  const jump = biggestJump(active);

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const step =
      event.key === "ArrowRight" ? 1 : event.key === "ArrowLeft" ? -1 : 0;
    if (step === 0) return;
    event.preventDefault();
    const next = (activeIndex + step + spotlight.length) % spotlight.length;
    setActiveIndex(next);
    tabRefs.current[next]?.focus();
  }

  return (
    <section
      aria-label="Before and after"
      className={cx(
        "relative isolate overflow-hidden rounded-3xl bg-navy-panel p-6 text-white shadow-xl shadow-brand-ink/15 ring-1 ring-white/10 sm:p-8 lg:p-10",
        className,
      )}
    >
      <div
        aria-hidden
        className="absolute -right-24 -top-24 -z-10 h-72 w-72 rounded-full bg-brand-teal/25 blur-3xl"
      />

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-mint">
          Before and after
        </p>
        <div
          role="tablist"
          aria-label="Student stories"
          onKeyDown={onKeyDown}
          className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 [scrollbar-width:none]"
        >
          {spotlight.map((testimonial, index) => {
            const selected = index === activeIndex;
            return (
              <button
                key={testimonial.id}
                ref={(node) => {
                  tabRefs.current[index] = node;
                }}
                type="button"
                role="tab"
                id={`${baseId}-tab-${testimonial.id}`}
                aria-selected={selected}
                aria-controls={`${baseId}-panel`}
                tabIndex={selected ? 0 : -1}
                onClick={() => setActiveIndex(index)}
                className={cx(
                  "inline-flex h-10 shrink-0 items-center rounded-full px-4 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-mint",
                  selected
                    ? "bg-brand text-white shadow-sm shadow-black/20"
                    : "bg-white/10 text-white/75 hover:bg-white/15 hover:text-white",
                )}
              >
                {testimonial.name}
              </button>
            );
          })}
        </div>
      </div>

      <div
        key={active.id}
        id={`${baseId}-panel`}
        role="tabpanel"
        aria-labelledby={`${baseId}-tab-${active.id}`}
        className="mt-8 grid gap-8 motion-safe:animate-fade-up lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:gap-12"
      >
        <figure>
          <blockquote className="text-xl font-semibold leading-8 tracking-tight text-white sm:text-2xl sm:leading-10">
            <p>&ldquo;{active.quote}&rdquo;</p>
          </blockquote>
          <figcaption className="mt-5 text-sm text-white/65">
            <span className="font-semibold text-white">{active.name}</span>
            <span aria-hidden> · </span>
            {PROOF_LABELS[active.proof]}
          </figcaption>
        </figure>

        <div className="rounded-2xl bg-white/5 p-5 ring-1 ring-white/10 sm:p-6">
          {active.before ? (
            <div className="space-y-5">
              <div>
                <p className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-white/50">
                  Before
                </p>
                <ScoreRow scores={active.before} tone="onDark" muted />
              </div>
              <div className="h-px bg-white/10" />
              <div>
                <p className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-brand-mint">
                  After
                </p>
                <ScoreRow scores={active.scores} tone="onDark" />
              </div>
            </div>
          ) : (
            <div className="space-y-5">
              {jump ? (
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-white/50">
                      {SKILL_LABELS[jump.skill]}
                    </p>
                    <p className="mt-2 flex items-baseline gap-3 font-extrabold tabular-nums tracking-tight">
                      <span className="text-3xl text-white/45 sm:text-4xl">
                        {jump.from}
                      </span>
                      <span aria-hidden className="text-2xl text-white/40">
                        →
                      </span>
                      <span className="text-5xl text-white sm:text-6xl">
                        {jump.to}
                      </span>
                    </p>
                  </div>
                  <span className="rounded-full bg-brand px-3 py-1.5 text-sm font-bold text-white">
                    +{jump.to - jump.from}
                  </span>
                </div>
              ) : null}
              <div className="h-px bg-white/10" />
              <div>
                <p className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-brand-mint">
                  Final scores
                </p>
                <ScoreRow scores={active.scores} tone="onDark" />
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
