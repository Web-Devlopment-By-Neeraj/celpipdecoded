"use client";

import { useState, type FormEvent } from "react";
import { Eyebrow } from "./primitives";
import {
  earlyAccessSchema,
  willingnessToPayValues,
  type EarlyAccessInput,
} from "@/lib/validation/earlyAccess";

type Status = "idle" | "submitting" | "success" | "error";

const preparingOptions = [
  "Yes, I am preparing now",
  "I plan to prepare soon",
  "I am only exploring",
  "Not sure yet",
];

const practiceMethodOptions = [
  "Tutor or class",
  "YouTube",
  "Apps",
  "Friends or family",
  "I do not practice speaking yet",
  "Other",
];

const labelClass = "block text-sm font-medium text-foreground/80";
const inputClass =
  "mt-2 block w-full rounded-xl border border-foreground/15 bg-white px-4 py-3 text-sm text-foreground shadow-sm outline-none transition-colors placeholder:text-foreground/40 focus:border-brand focus:ring-2 focus:ring-brand/20";

export function EarlyAccessForm() {
  const [status, setStatus] = useState<Status>("idle");
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage("");

    const formData = new FormData(event.currentTarget);
    const raw: Record<string, string> = {};
    formData.forEach((value, key) => {
      raw[key] = typeof value === "string" ? value : "";
    });

    const parsed = earlyAccessSchema.safeParse(raw);
    if (!parsed.success) {
      setStatus("error");
      setErrorMessage(
        parsed.error.issues[0]?.message ??
          "Please check the form and try again.",
      );
      return;
    }

    setStatus("submitting");

    try {
      const response = await fetch("/api/early-access", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data satisfies EarlyAccessInput),
      });

      const result = (await response.json()) as {
        ok: boolean;
        error?: string;
      };

      if (!response.ok || !result.ok) {
        setStatus("error");
        setErrorMessage(
          result.error ?? "Something went wrong. Please try again shortly.",
        );
        return;
      }

      setStatus("success");
    } catch {
      setStatus("error");
      setErrorMessage(
        "We could not reach the server. Please check your connection and try again.",
      );
    }
  }

  return (
    <section
      id="inquiry"
      className="relative isolate scroll-mt-16 overflow-hidden bg-ink text-cream"
    >
      {/* Soft brand glow behind the form panel. */}
      <div
        aria-hidden
        className="absolute -left-40 top-1/4 -z-10 h-[28rem] w-[28rem] rounded-full bg-brand/15 blur-3xl"
      />

      <div className="relative mx-auto grid w-full max-w-6xl gap-12 px-5 py-20 sm:px-8 sm:py-28 lg:grid-cols-2 lg:gap-16">
        <div className="lg:pt-6">
          <Eyebrow className="text-brand">Program inquiry</Eyebrow>
          <h2 className="mt-5 font-serif text-4xl font-semibold leading-tight tracking-tight text-cream sm:text-5xl">
            Get CELPIP program information
          </h2>
          <p className="mt-6 max-w-md text-lg leading-8 text-cream/75">
            Share your CELPIP goal and our team will use your answers to guide
            the next step.
          </p>
        </div>

        <div>
          {status === "success" ? (
            <div className="rounded-3xl bg-cream p-10 text-center text-foreground shadow-xl">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-brand/15 text-brand">
                <svg
                  className="h-6 w-6"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.704 5.29a1 1 0 010 1.42l-7.5 7.5a1 1 0 01-1.42 0l-3.5-3.5a1 1 0 011.42-1.42l2.79 2.79 6.79-6.79a1 1 0 011.42 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <h3 className="mt-5 font-serif text-2xl font-semibold text-foreground">
                Thank you. Your information has been received.
              </h3>
              <p className="mt-3 text-sm text-foreground/60">
                Our team will review your answers and follow up with the next
                step.
              </p>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              noValidate
              className="rounded-3xl bg-cream p-6 text-foreground shadow-xl sm:p-8"
            >
              <div className="grid gap-6 sm:grid-cols-2">
                <div>
                  <label htmlFor="full_name" className={labelClass}>
                    Your name
                  </label>
                  <input
                    id="full_name"
                    name="full_name"
                    type="text"
                    autoComplete="name"
                    required
                    className={inputClass}
                    placeholder="Jane Doe"
                  />
                </div>

                <div>
                  <label htmlFor="email" className={labelClass}>
                    Email address
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    className={inputClass}
                    placeholder="you@example.com"
                  />
                </div>

                <div>
                  <label htmlFor="preparing_status" className={labelClass}>
                    Are you preparing for CELPIP now?
                  </label>
                  <select
                    id="preparing_status"
                    name="preparing_status"
                    defaultValue=""
                    className={inputClass}
                  >
                    <option value="">Select an option</option>
                    {preparingOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="test_date" className={labelClass}>
                    When is your test?
                  </label>
                  <input
                    id="test_date"
                    name="test_date"
                    type="text"
                    className={inputClass}
                    placeholder="For example, next month or no date yet"
                  />
                </div>
              </div>

              <div className="mt-6">
                <label htmlFor="current_practice_method" className={labelClass}>
                  How are you practicing speaking right now?
                </label>
                <select
                  id="current_practice_method"
                  name="current_practice_method"
                  defaultValue=""
                  className={inputClass}
                >
                  <option value="">Select an option</option>
                  {practiceMethodOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mt-6">
                <label htmlFor="hardest_part" className={labelClass}>
                  What feels hardest in CELPIP speaking?
                </label>
                <textarea
                  id="hardest_part"
                  name="hardest_part"
                  rows={3}
                  className={inputClass}
                  placeholder="For example, timing, confidence, or organizing your answer"
                />
              </div>

              <fieldset className="mt-6">
                <legend className={labelClass}>
                  Would you consider a monthly practice plan around $20/month
                  for AI-supported CELPIP speaking practice?
                </legend>
                <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:gap-6">
                  {willingnessToPayValues.map((option) => (
                    <label
                      key={option}
                      className="flex cursor-pointer items-center gap-2 text-sm text-foreground/80"
                    >
                      <input
                        type="radio"
                        name="willingness_to_pay"
                        value={option}
                        required
                        className="h-4 w-4 border-foreground/30 text-brand focus:ring-brand"
                      />
                      {option}
                    </label>
                  ))}
                </div>
              </fieldset>

              <div className="mt-6">
                <label htmlFor="notes" className={labelClass}>
                  Anything else you want to share?
                </label>
                <textarea
                  id="notes"
                  name="notes"
                  rows={3}
                  className={inputClass}
                  placeholder="Optional"
                />
              </div>

              {status === "error" && errorMessage ? (
                <p
                  role="alert"
                  className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
                >
                  {errorMessage}
                </p>
              ) : null}

              <button
                type="submit"
                disabled={status === "submitting"}
                className="mt-8 inline-flex h-13 w-full items-center justify-center rounded-full bg-brand px-8 py-3.5 text-base font-semibold text-white shadow-sm transition-colors hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-70"
              >
                {status === "submitting"
                  ? "Submitting..."
                  : "Request program information"}
              </button>

              <p className="mt-4 text-center text-xs leading-5 text-foreground/50">
                We will only use your details to contact you about CELPIP
                Decoded.
              </p>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
