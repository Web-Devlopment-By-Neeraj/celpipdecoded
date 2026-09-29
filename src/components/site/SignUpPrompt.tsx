"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import { signupStarted } from "@/features/public-site/analytics";

export type SignUpContext =
  | "header"
  | "hero_demo"
  | "diagnostic"
  | "study_planner"
  | "course_video"
  | "locked_area"
  | "which_answer"
  | "landing"
  | "draws_compare";

const COPY: Record<SignUpContext, { title: string; body: string }> = {
  header: {
    title: "Create your account",
    body: "Sign up to keep your practice in one place.",
  },
  hero_demo: {
    title: "Save your speaking answer and see all your feedback",
    body: "The rest of the feedback unlocks when you sign up. The recording stays with this browser until you do.",
  },
  diagnostic: {
    title: "Save this diagnostic",
    body: "Sign up and we will keep the four scores you entered and the verdict.",
  },
  study_planner: {
    title: "Save this plan",
    body: "Sign up and your test date, target and worry section will pre-fill your intake.",
  },
  course_video: {
    title: "Keep watching",
    body: "Sign up to finish this lesson. Section 1 of each module is included.",
  },
  locked_area: {
    title: "This part is free after sign-up",
    body: "Create an account and this area opens in the same place.",
  },
  which_answer: {
    title: "Try it with your own answer",
    body: "Sign up to record a speaking answer or write one of your own.",
  },
  landing: {
    title: "Start with the free mock",
    body: "Create an account to sit Mock test 1 and use your three free evaluations.",
  },
  draws_compare: {
    title: "Save this comparison",
    body: "Sign up and we will keep the score you entered.",
  },
};

export function SignUpPrompt({
  context,
  presentation,
  items = [],
  area,
}: {
  context: SignUpContext;
  presentation: "inline" | "modal";
  items?: string[];
  area?: string;
}) {
  const copy = COPY[context];
  const titleId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(presentation === "modal");

  useEffect(() => {
    if (presentation !== "modal" || !open) return;
    void fetch("/api/analytics", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ name: "gate_shown", props: { context, area: area ?? "" } }),
    });
    const node = panelRef.current;
    const previous = document.activeElement as HTMLElement | null;
    node?.querySelector<HTMLElement>("a,button")?.focus();
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
        previous?.focus();
      }
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [area, context, open, presentation]);

  if (presentation === "modal" && !open) return null;

  const signup = signupStarted(context === "header" ? "header" : context);

  return (
    <div
      ref={panelRef}
      role={presentation === "modal" ? "dialog" : undefined}
      aria-modal={presentation === "modal" ? true : undefined}
      aria-labelledby={titleId}
      className={
        presentation === "modal"
          ? "fixed inset-x-0 bottom-0 z-50 border-t border-ink/10 bg-white p-5 shadow-2xl sm:inset-auto sm:bottom-auto sm:left-1/2 sm:top-1/2 sm:w-full sm:max-w-md sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-3xl sm:border"
          : "rounded-3xl bg-white p-6 ring-1 ring-ink/10"
      }
    >
      <h2 id={titleId} className="font-serif text-2xl font-semibold text-ink">
        {copy.title}
      </h2>
      <p className="mt-2 text-base leading-7 text-ink/80">{copy.body}</p>
      {items.length > 0 ? (
        <ul className="mt-4 space-y-2 text-sm">
          {items.slice(0, 5).map((item) => (
            <li key={item}>✓ {item}</li>
          ))}
        </ul>
      ) : null}
      <div className="mt-5 flex flex-col gap-3 sm:flex-row">
        <Link
          href={`/signup?source=${signup.props.source}`}
          onClick={() => {
            void fetch("/api/analytics", {
              method: "POST",
              headers: { "content-type": "application/json" },
              body: JSON.stringify(signup),
            });
          }}
          className="inline-flex min-h-11 items-center justify-center rounded-full bg-brand px-5 text-sm font-semibold text-white"
        >
          Sign up
        </Link>
        <Link href="/login" className="inline-flex min-h-11 items-center justify-center rounded-full px-5 text-sm font-semibold text-ink ring-1 ring-ink/15">
          Sign in
        </Link>
        {presentation === "modal" ? (
          <button
            type="button"
            className="inline-flex min-h-11 items-center justify-center rounded-full px-5 text-sm font-semibold"
            onClick={() => {
              void fetch("/api/analytics", {
                method: "POST",
                headers: { "content-type": "application/json" },
                body: JSON.stringify({ name: "gate_dismissed", props: { context } }),
              });
              setOpen(false);
            }}
          >
            Not now
          </button>
        ) : null}
      </div>
    </div>
  );
}
