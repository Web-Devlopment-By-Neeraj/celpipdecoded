"use client";

import { useCallback, useEffect, useState } from "react";
import {
  PRODUCT_TOUR_EVENT,
  PRODUCT_TOUR_SEEN_KEY,
  PRODUCT_TOUR_STEPS,
} from "@/features/navigation/product-tour";

type Box = { top: number; left: number; width: number; height: number };

function visibleTarget(id: string): HTMLElement | null {
  const nodes = document.querySelectorAll<HTMLElement>(`[data-tour="${id}"]`);
  for (const node of nodes) {
    const rect = node.getBoundingClientRect();
    if (rect.width > 0 && rect.height > 0) return node;
  }
  return null;
}

function nextVisibleIndex(from: number, direction: 1 | -1): number | null {
  for (let index = from; index >= 0 && index < PRODUCT_TOUR_STEPS.length; index += direction) {
    if (visibleTarget(PRODUCT_TOUR_STEPS[index].id)) return index;
  }
  return null;
}

export function ProductTour() {
  const [active, setActive] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [box, setBox] = useState<Box | null>(null);

  const measure = useCallback((index: number) => {
    const step = PRODUCT_TOUR_STEPS[index];
    const target = step ? visibleTarget(step.id) : null;
    if (!target) {
      setBox(null);
      return;
    }
    target.scrollIntoView({ block: "nearest", inline: "nearest" });
    const rect = target.getBoundingClientRect();
    setBox({
      top: rect.top,
      left: rect.left,
      width: rect.width,
      height: rect.height,
    });
  }, []);

  const close = useCallback((markSeen: boolean) => {
    setActive(false);
    setBox(null);
    if (markSeen) window.localStorage.setItem(PRODUCT_TOUR_SEEN_KEY, "1");
  }, []);

  const go = useCallback(
    (from: number, direction: 1 | -1) => {
      const index = nextVisibleIndex(from, direction);
      if (index === null) {
        close(true);
        return;
      }
      setStepIndex(index);
      measure(index);
    },
    [close, measure],
  );

  const start = useCallback(() => {
    const index = nextVisibleIndex(0, 1);
    if (index === null) return;
    setStepIndex(index);
    setActive(true);
    measure(index);
  }, [measure]);

  useEffect(() => {
    if (window.localStorage.getItem(PRODUCT_TOUR_SEEN_KEY) === "1") return;
    const timer = window.setTimeout(start, 700);
    return () => window.clearTimeout(timer);
  }, [start]);

  useEffect(() => {
    function onRequest() {
      start();
    }
    window.addEventListener(PRODUCT_TOUR_EVENT, onRequest);
    return () => window.removeEventListener(PRODUCT_TOUR_EVENT, onRequest);
  }, [start]);

  useEffect(() => {
    if (!active) return;
    function onLayout() {
      measure(stepIndex);
    }
    window.addEventListener("resize", onLayout);
    window.addEventListener("scroll", onLayout, true);
    return () => {
      window.removeEventListener("resize", onLayout);
      window.removeEventListener("scroll", onLayout, true);
    };
  }, [active, measure, stepIndex]);

  if (!active) return null;

  const step = PRODUCT_TOUR_STEPS[stepIndex];
  if (!step) return null;

  const placeBelow = box ? box.top < window.innerHeight * 0.55 : true;

  return (
    <div className="fixed inset-0 z-[70]">
      <button
        type="button"
        aria-label="Close tour"
        className="absolute inset-0 bg-ink/50"
        onClick={() => close(true)}
      />
      {box ? (
        <div
          aria-hidden
          className="pointer-events-none absolute rounded-2xl ring-2 ring-white"
          style={{
            top: box.top - 6,
            left: box.left - 6,
            width: box.width + 12,
            height: box.height + 12,
          }}
        />
      ) : null}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="product-tour-title"
        className="absolute z-[71] w-[min(22rem,calc(100vw-2rem))] rounded-3xl bg-white p-5 shadow-xl"
        style={
          box
            ? {
                top: placeBelow ? box.top + box.height + 16 : undefined,
                bottom: placeBelow ? undefined : window.innerHeight - box.top + 16,
                left: Math.min(Math.max(16, box.left), window.innerWidth - 368),
              }
            : { left: 16, bottom: 16 }
        }
      >
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-ink/50">
          {stepIndex + 1} of {PRODUCT_TOUR_STEPS.length}
        </p>
        <h2 id="product-tour-title" className="mt-2 font-serif text-xl font-semibold text-ink">
          {step.title}
        </h2>
        <p className="mt-2 text-sm leading-6 text-ink/75">{step.body}</p>
        <div className="mt-5 flex items-center justify-between gap-3">
          <button type="button" className="text-sm font-semibold text-ink/60" onClick={() => close(true)}>
            Skip
          </button>
          <div className="flex gap-2">
            <button
              type="button"
              className="h-10 rounded-full px-4 text-sm font-semibold text-ink ring-1 ring-ink/15"
              onClick={() => go(stepIndex - 1, -1)}
              disabled={nextVisibleIndex(stepIndex - 1, -1) === null}
            >
              Back
            </button>
            <button
              type="button"
              className="h-10 rounded-full bg-brand px-4 text-sm font-semibold text-white"
              onClick={() => go(stepIndex + 1, 1)}
            >
              {nextVisibleIndex(stepIndex + 1, 1) === null ? "Done" : "Next"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
