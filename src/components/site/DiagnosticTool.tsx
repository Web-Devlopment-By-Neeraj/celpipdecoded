"use client";

import { useMemo, useState } from "react";
import {
  diagnoseScores,
  DIAGNOSTIC_MODULES,
  validateDiagnosticScores,
  type DiagnosticModule,
  type DiagnosticScores,
} from "@/features/public-site/diagnostic";
import { SignUpPrompt } from "./SignUpPrompt";

const EMPTY: DiagnosticScores = {
  Listening: null,
  Reading: null,
  Writing: null,
  Speaking: null,
};

export function DiagnosticTool({ initial }: { initial?: Partial<DiagnosticScores> }) {
  const [scores, setScores] = useState<DiagnosticScores>({ ...EMPTY, ...initial });
  const [submitted, setSubmitted] = useState(false);
  const errors = useMemo(() => (submitted ? validateDiagnosticScores(scores) : []), [scores, submitted]);
  const verdict = submitted && errors.length === 0 ? diagnoseScores(scores) : null;

  function update(field: DiagnosticModule, value: string) {
    setScores((current) => ({
      ...current,
      [field]: value === "" ? null : Number(value),
    }));
  }

  return (
    <form
      className="rounded-3xl bg-white p-5 ring-1 ring-ink/10"
      onSubmit={(event) => {
        event.preventDefault();
        setSubmitted(true);
        const nextErrors = validateDiagnosticScores(scores);
        if (nextErrors.length > 0) return;
        const next = diagnoseScores(scores);
        void fetch("/api/analytics", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            name: "diagnostic_completed",
            props: {
              weak_module: next?.allEqual ? "tie_all" : (next?.weakModules[0] ?? ""),
              tie: Boolean(next?.tie),
            },
          }),
        });
      }}
    >
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {DIAGNOSTIC_MODULES.map((field) => (
          <label key={field} className="text-sm font-semibold">
            {field}
            <input
              className="mt-1 min-h-11 w-full rounded-xl border border-ink/15 px-3 text-base"
              inputMode="numeric"
              value={scores[field] ?? ""}
              onChange={(event) => update(field, event.target.value)}
            />
            {errors.find((error) => error.field === field) ? (
              <span className="mt-1 block font-normal text-red-800">
                {errors.find((error) => error.field === field)?.message}
              </span>
            ) : null}
          </label>
        ))}
      </div>
      <button type="submit" className="mt-4 min-h-11 rounded-full bg-brand px-5 text-sm font-semibold text-white">
        See the verdict
      </button>
      {verdict ? (
        <div className="mt-4" aria-live="polite">
          <h3 className="font-serif text-2xl">{verdict.headline}</h3>
          <p className="mt-2 text-base leading-7">{verdict.explanation}</p>
          <a href="/book" className="mt-4 inline-flex min-h-11 items-center rounded-full bg-ink px-4 text-sm font-semibold text-cream">
            Book a free strategy call
          </a>
          <div className="mt-4">
            <SignUpPrompt
              context="diagnostic"
              presentation="inline"
              items={DIAGNOSTIC_MODULES.map((field) => `${field} ${scores[field]}`)}
            />
          </div>
        </div>
      ) : null}
    </form>
  );
}
