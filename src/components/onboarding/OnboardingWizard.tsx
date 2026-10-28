"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { INSTRUCTOR_NAME } from "@/features/brand/brand-copy";
import {
  buildFirstStepRecommendation,
  nextUiStep,
  previousUiStep,
  progressIndex,
  type IntakeAnswerMap,
  type OnboardingUiStep,
  uiStepsForLearner,
} from "@/features/onboarding/onboarding-flow";
import {
  MARKETING_CONSENT_LABEL,
  NEXT_TEST_OPTIONS,
  QUESTION_META,
  REFERRAL_SOURCE_OPTIONS,
  SCORE_LEVELS,
  SECTION_OPTIONS,
  TARGET_CLB_OPTIONS,
  TIMES_TAKEN_OPTIONS,
  WHY_NOW_OPTIONS,
  type OnboardingQuestionKey,
} from "@/features/onboarding/onboarding-questions";

type LoadState = {
  answers: IntakeAnswerMap;
  currentStep: OnboardingUiStep;
  firstName: string;
  completed: boolean;
};

async function postAnswer(
  questionKey: OnboardingQuestionKey,
  answer: unknown,
  currentStep: OnboardingUiStep,
) {
  const response = await fetch("/api/onboarding/answer", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ questionKey, answer, currentStep }),
  });
  const payload = await response.json();
  if (!response.ok || !payload.ok) {
    throw new Error(payload.error ?? "Could not save your answer.");
  }
  return payload as {
    nextStep: OnboardingUiStep | null;
    answers: IntakeAnswerMap;
  };
}

function ProgressBar({ index, total }: { index: number; total: number }) {
  const pct = total > 0 ? Math.round((index / total) * 100) : 0;
  return (
    <div className="mb-8">
      <div className="mb-2 flex justify-between text-xs font-medium text-ink/55">
        <span>
          Question {index} of {total}
        </span>
        <span>{pct}%</span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-ink/10">
        <div
          className="h-full rounded-full bg-brand transition-all duration-300"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

function ChoiceButton({
  label,
  onClick,
  selected,
  disabled,
}: {
  label: string;
  onClick: () => void;
  selected?: boolean;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`w-full rounded-2xl border px-4 py-3.5 text-left text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${
        selected
          ? "border-brand bg-brand/10 text-ink"
          : "border-ink/12 bg-white text-ink hover:border-brand/40 hover:bg-brand/5"
      }`}
    >
      {label}
    </button>
  );
}

export function OnboardingWizard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [answers, setAnswers] = useState<IntakeAnswerMap>({});
  const [step, setStep] = useState<OnboardingUiStep>("welcome");
  const [firstName, setFirstName] = useState("there");
  const [saving, setSaving] = useState(false);

  const steps = useMemo(() => uiStepsForLearner(answers), [answers]);
  const progress = progressIndex(steps, step);
  const firstStepRec = useMemo(
    () => buildFirstStepRecommendation(answers),
    [answers],
  );

  // Mark intake complete on the finish screen so dashboard/mock links work
  // (avoids 307 redirect back to /onboarding when opening the mock hub).
  useEffect(() => {
    if (step !== "finish") return;
    let cancelled = false;
    (async () => {
      try {
        await fetch("/api/onboarding/complete", { method: "POST" });
      } catch {
        // Finish screen still shows; user can retry via Go to dashboard.
      }
      if (!cancelled) router.refresh();
    })();
    return () => {
      cancelled = true;
    };
  }, [step, router]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const response = await fetch("/api/onboarding");
        const payload = await response.json();
        if (!response.ok || !payload.ok) {
          throw new Error(payload.error ?? "Could not load onboarding.");
        }
        if (cancelled) return;
        if (payload.completed) {
          router.replace("/dashboard");
          return;
        }
        const state: LoadState = {
          answers: payload.answers ?? {},
          currentStep: payload.currentStep ?? "welcome",
          firstName: payload.firstName ?? "there",
          completed: false,
        };
        setAnswers(state.answers);
        setStep(state.currentStep);
        setFirstName(state.firstName);
      } catch (loadError) {
        if (!cancelled) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Could not load onboarding.",
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [router]);

  const advance = useCallback(
    async (questionKey: OnboardingQuestionKey, answer: unknown) => {
      setSaving(true);
      setError(null);
      try {
        const result = await postAnswer(questionKey, answer, step);
        setAnswers(result.answers);
        const mergedSteps = uiStepsForLearner(result.answers);
        const next =
          result.nextStep ??
          nextUiStep(mergedSteps, step) ??
          ("finish" as const);
        setStep(next);
      } catch (saveError) {
        setError(
          saveError instanceof Error
            ? saveError.message
            : "Could not save your answer.",
        );
      } finally {
        setSaving(false);
      }
    },
    [step],
  );

  async function finishOnboarding() {
    setSaving(true);
    setError(null);
    try {
      const response = await fetch("/api/onboarding/complete", {
        method: "POST",
      });
      const payload = await response.json();
      if (!response.ok || !payload.ok) {
        throw new Error(payload.error ?? "Could not finish onboarding.");
      }
      router.push("/dashboard");
      router.refresh();
    } catch (finishError) {
      setError(
        finishError instanceof Error
          ? finishError.message
          : "Could not finish onboarding.",
      );
    } finally {
      setSaving(false);
    }
  }

  function goBack() {
    const prev = previousUiStep(steps, step);
    if (prev) setStep(prev);
  }

  if (loading) {
    return (
      <p className="text-center text-sm text-ink/60" role="status">
        Loading your questions…
      </p>
    );
  }

  if (error && step === "welcome" && Object.keys(answers).length === 0) {
    return (
      <div className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
        {error}
        <p className="mt-2 text-xs text-red-600/90">
          If this persists, ask your admin to apply database migration{" "}
          <code className="font-mono">017_learner_onboarding_intake.sql</code>.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-lg">
      {step !== "welcome" && step !== "finish" ? (
        <ProgressBar index={progress.index} total={progress.total} />
      ) : null}

      {error ? (
        <p
          role="alert"
          className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {error}
        </p>
      ) : null}

      {step !== "welcome" && step !== "finish" ? (
        <button
          type="button"
          onClick={goBack}
          disabled={saving}
          className="mb-4 text-sm font-semibold text-brand hover:text-brand-dark disabled:opacity-50"
        >
          ← Back
        </button>
      ) : null}

      {step === "welcome" ? (
        <div className="text-center">
          <div
            className="mx-auto flex h-20 w-20 items-center justify-center rounded-full border-2 border-brand/25 bg-brand/10 text-2xl font-semibold text-brand-teal-deep"
            aria-hidden
          >
            {INSTRUCTOR_NAME.charAt(0)}
          </div>
          <h1 className="mt-6 font-serif text-2xl font-semibold text-ink sm:text-3xl">
            Let&apos;s build your study plan
          </h1>
          <p className="mt-3 text-sm leading-6 text-ink/70">
            A few quick questions, about a minute. Your answers decide where you
            start and what {INSTRUCTOR_NAME} keeps an eye on for you.
          </p>
          <p className="mt-2 text-xs text-ink/50">
            You can change any answer later in your account.
          </p>
          <button
            type="button"
            disabled={saving}
            onClick={() => setStep("whatsapp")}
            className="mt-8 inline-flex h-12 min-w-[10rem] items-center justify-center rounded-full bg-brand px-8 text-base font-semibold text-white shadow-lg shadow-brand/20 hover:bg-brand-dark disabled:opacity-60"
          >
            Start
          </button>
        </div>
      ) : null}

      {step === "whatsapp" ? (
        <QuestionShell meta={QUESTION_META.whatsapp}>
          <WhatsAppStep
            disabled={saving}
            onSubmit={(value) => void advance("whatsapp", value)}
          />
        </QuestionShell>
      ) : null}

      {step === "instagram" ? (
        <QuestionShell meta={QUESTION_META.instagram}>
          <InstagramStep
            disabled={saving}
            onSubmit={(value) => void advance("instagram", value)}
          />
        </QuestionShell>
      ) : null}

      {step === "taken_celpip_before" ? (
        <QuestionShell meta={QUESTION_META.taken_celpip_before}>
          <div className="flex flex-col gap-3">
            <ChoiceButton
              label="Yes, I've taken it before"
              disabled={saving}
              onClick={() => void advance("taken_celpip_before", "repeat")}
            />
            <ChoiceButton
              label="No, this will be my first time"
              disabled={saving}
              onClick={() => void advance("taken_celpip_before", "first_time")}
            />
          </div>
        </QuestionShell>
      ) : null}

      {step === "times_taken" ? (
        <QuestionShell meta={QUESTION_META.times_taken}>
          <div className="flex flex-col gap-3">
            {TIMES_TAKEN_OPTIONS.map((opt) => (
              <ChoiceButton
                key={opt.value}
                label={opt.label}
                disabled={saving}
                onClick={() => void advance("times_taken", opt.value)}
              />
            ))}
          </div>
        </QuestionShell>
      ) : null}

      {step === "last_test_date" ? (
        <QuestionShell meta={QUESTION_META.last_test_date}>
          <DateStep
            disabled={saving}
            onSubmit={(value) => void advance("last_test_date", value)}
          />
        </QuestionShell>
      ) : null}

      {step === "last_scores" ? (
        <QuestionShell meta={QUESTION_META.last_scores}>
          <LastScoresStep
            disabled={saving}
            onSubmit={(value) => void advance("last_scores", value)}
          />
        </QuestionShell>
      ) : null}

      {step === "target_clb" ? (
        <QuestionShell meta={QUESTION_META.target_clb}>
          <div className="flex flex-col gap-3">
            {TARGET_CLB_OPTIONS.map((opt) => (
              <ChoiceButton
                key={opt.value}
                label={opt.label}
                disabled={saving}
                onClick={() => void advance("target_clb", opt.value)}
              />
            ))}
          </div>
        </QuestionShell>
      ) : null}

      {step === "why_now" ? (
        <QuestionShell meta={QUESTION_META.why_now}>
          <div className="flex flex-col gap-3">
            {WHY_NOW_OPTIONS.map((opt) => (
              <ChoiceButton
                key={opt.value}
                label={opt.label}
                disabled={saving}
                onClick={() => void advance("why_now", opt.value)}
              />
            ))}
          </div>
        </QuestionShell>
      ) : null}

      {step === "referral_source" ? (
        <QuestionShell meta={QUESTION_META.referral_source}>
          <div className="flex flex-col gap-3">
            {REFERRAL_SOURCE_OPTIONS.map((opt) => (
              <ChoiceButton
                key={opt.value}
                label={opt.label}
                disabled={saving}
                onClick={() => void advance("referral_source", opt.value)}
              />
            ))}
          </div>
        </QuestionShell>
      ) : null}

      {step === "weakest_sections" ? (
        <QuestionShell meta={QUESTION_META.weakest_sections}>
          <WeakestSectionsStep
            disabled={saving}
            onSubmit={(value) => void advance("weakest_sections", value)}
          />
        </QuestionShell>
      ) : null}

      {step === "next_test" ? (
        <QuestionShell meta={QUESTION_META.next_test}>
          <NextTestStep
            disabled={saving}
            onSubmit={(value) => void advance("next_test", value)}
          />
        </QuestionShell>
      ) : null}

      {step === "marketing_consent" ? (
        <QuestionShell meta={QUESTION_META.marketing_consent}>
          <MarketingConsentStep
            disabled={saving}
            onFinish={(value) => void advance("marketing_consent", value)}
          />
        </QuestionShell>
      ) : null}

      {step === "finish" ? (
        <div>
          <h1 className="font-serif text-2xl font-semibold text-ink sm:text-3xl">
            You&apos;re all set, {firstName}.
          </h1>
          <div className="mt-6 rounded-2xl border border-brand/20 bg-brand/5 p-5">
            <p className="text-sm leading-7 text-ink/85">{firstStepRec.message}</p>
            <Link
              href={firstStepRec.href}
              className="mt-4 inline-flex text-sm font-semibold text-brand hover:text-brand-dark"
            >
              {firstStepRec.cta} →
            </Link>
          </div>
          <button
            type="button"
            disabled={saving}
            onClick={() => void finishOnboarding()}
            className="mt-8 inline-flex h-12 w-full items-center justify-center rounded-full bg-brand px-6 text-base font-semibold text-white shadow-lg shadow-brand/20 hover:bg-brand-dark disabled:opacity-60"
          >
            Go to my dashboard
          </button>
        </div>
      ) : null}
    </div>
  );
}

function QuestionShell({
  meta,
  children,
}: {
  meta: { title: string; subtitle: string };
  children: React.ReactNode;
}) {
  return (
    <div>
      <h1 className="font-serif text-2xl font-semibold text-ink">{meta.title}</h1>
      {meta.subtitle ? (
        <p className="mt-2 text-sm leading-6 text-ink/65">{meta.subtitle}</p>
      ) : null}
      <div className="mt-6">{children}</div>
    </div>
  );
}

function WhatsAppStep({
  disabled,
  onSubmit,
}: {
  disabled: boolean;
  onSubmit: (value: { countryCode: string; number: string }) => void;
}) {
  const [countryCode, setCountryCode] = useState("+1");
  const [number, setNumber] = useState("");

  return (
    <form
      className="flex flex-col gap-4"
      onSubmit={(event) => {
        event.preventDefault();
        const digits = number.replace(/\D/g, "");
        if (digits.length < 7) return;
        onSubmit({ countryCode, number: digits });
      }}
    >
      <div className="flex gap-2">
        <select
          value={countryCode}
          onChange={(e) => setCountryCode(e.target.value)}
          className="w-24 rounded-xl border border-ink/15 bg-white px-2 py-2.5 text-sm"
        >
          <option value="+1">+1</option>
          <option value="+91">+91</option>
          <option value="+44">+44</option>
          <option value="+61">+61</option>
        </select>
        <input
          type="tel"
          inputMode="tel"
          required
          value={number}
          onChange={(e) => setNumber(e.target.value)}
          placeholder="Phone number"
          className="min-w-0 flex-1 rounded-xl border border-ink/15 bg-white px-4 py-2.5 text-sm"
        />
      </div>
      <button
        type="submit"
        disabled={disabled}
        className="inline-flex h-11 items-center justify-center rounded-full bg-brand px-6 text-sm font-semibold text-white hover:bg-brand-dark disabled:opacity-60"
      >
        OK
      </button>
    </form>
  );
}

function InstagramStep({
  disabled,
  onSubmit,
}: {
  disabled: boolean;
  onSubmit: (value: { handle: string | null; skipped: boolean }) => void;
}) {
  const [handle, setHandle] = useState("");

  return (
    <div className="flex flex-col gap-3">
      <input
        type="text"
        value={handle}
        onChange={(e) => setHandle(e.target.value)}
        placeholder="@yourname"
        className="rounded-xl border border-ink/15 bg-white px-4 py-2.5 text-sm"
        onKeyDown={(e) => {
          if (e.key === "Enter" && handle.trim()) {
            onSubmit({ handle: handle.trim(), skipped: false });
          }
        }}
      />
      <div className="flex gap-3">
        <button
          type="button"
          disabled={disabled || !handle.trim()}
          onClick={() => onSubmit({ handle: handle.trim(), skipped: false })}
          className="inline-flex h-11 flex-1 items-center justify-center rounded-full bg-brand text-sm font-semibold text-white hover:bg-brand-dark disabled:opacity-60"
        >
          OK
        </button>
        <button
          type="button"
          disabled={disabled}
          onClick={() => onSubmit({ handle: null, skipped: true })}
          className="inline-flex h-11 flex-1 items-center justify-center rounded-full border border-ink/15 text-sm font-semibold text-ink/80 hover:bg-ink/5"
        >
          Skip
        </button>
      </div>
    </div>
  );
}

function DateStep({
  disabled,
  onSubmit,
}: {
  disabled: boolean;
  onSubmit: (value: string) => void;
}) {
  const [date, setDate] = useState("");

  return (
    <form
      className="flex flex-col gap-4"
      onSubmit={(e) => {
        e.preventDefault();
        if (date) onSubmit(date);
      }}
    >
      <input
        type="date"
        required
        value={date}
        onChange={(e) => setDate(e.target.value)}
        className="rounded-xl border border-ink/15 bg-white px-4 py-2.5 text-sm"
      />
      <button
        type="submit"
        disabled={disabled}
        className="inline-flex h-11 items-center justify-center rounded-full bg-brand text-sm font-semibold text-white hover:bg-brand-dark disabled:opacity-60"
      >
        OK
      </button>
    </form>
  );
}

function LastScoresStep({
  disabled,
  onSubmit,
}: {
  disabled: boolean;
  onSubmit: (value: {
    dontRemember?: boolean;
    listening: number | null;
    reading: number | null;
    writing: number | null;
    speaking: number | null;
  }) => void;
}) {
  const [dontRemember, setDontRemember] = useState(false);
  const [scores, setScores] = useState({
    listening: "",
    reading: "",
    writing: "",
    speaking: "",
  });

  return (
    <form
      className="flex flex-col gap-4"
      onSubmit={(e) => {
        e.preventDefault();
        if (dontRemember) {
          onSubmit({ dontRemember: true, listening: null, reading: null, writing: null, speaking: null });
          return;
        }
        onSubmit({
          listening: Number(scores.listening),
          reading: Number(scores.reading),
          writing: Number(scores.writing),
          speaking: Number(scores.speaking),
        });
      }}
    >
      {(["listening", "reading", "writing", "speaking"] as const).map((key) => (
        <label key={key} className="block text-sm">
          <span className="font-medium capitalize text-ink">{key}</span>
          <select
            required={!dontRemember}
            disabled={dontRemember}
            value={scores[key]}
            onChange={(e) =>
              setScores((prev) => ({ ...prev, [key]: e.target.value }))
            }
            className="mt-1 block w-full rounded-xl border border-ink/15 bg-white px-3 py-2 text-sm disabled:opacity-50"
          >
            <option value="">Select</option>
            {SCORE_LEVELS.map((level) => (
              <option key={level} value={level}>
                {level}
              </option>
            ))}
          </select>
        </label>
      ))}
      <label className="flex items-center gap-2 text-sm text-ink/80">
        <input
          type="checkbox"
          checked={dontRemember}
          onChange={(e) => setDontRemember(e.target.checked)}
        />
        I don&apos;t remember
      </label>
      <button
        type="submit"
        disabled={disabled}
        className="inline-flex h-11 items-center justify-center rounded-full bg-brand text-sm font-semibold text-white hover:bg-brand-dark disabled:opacity-60"
      >
        OK
      </button>
    </form>
  );
}

function WeakestSectionsStep({
  disabled,
  onSubmit,
}: {
  disabled: boolean;
  onSubmit: (value: string[]) => void;
}) {
  const [picked, setPicked] = useState<string[]>([]);

  function toggle(value: string) {
    setPicked((prev) => {
      if (prev.includes(value)) return prev.filter((v) => v !== value);
      if (prev.length >= 2) return prev;
      return [...prev, value];
    });
  }

  return (
    <div className="flex flex-col gap-3">
      {SECTION_OPTIONS.map((opt) => (
        <ChoiceButton
          key={opt.value}
          label={opt.label}
          selected={picked.includes(opt.value)}
          onClick={() => toggle(opt.value)}
        />
      ))}
      <button
        type="button"
        disabled={disabled || picked.length === 0}
        onClick={() => onSubmit(picked)}
        className="mt-2 inline-flex h-11 items-center justify-center rounded-full bg-brand text-sm font-semibold text-white hover:bg-brand-dark disabled:opacity-60"
      >
        Continue
      </button>
    </div>
  );
}

function NextTestStep({
  disabled,
  onSubmit,
}: {
  disabled: boolean;
  onSubmit: (value: { range: string; exactDate: string | null }) => void;
}) {
  const [range, setRange] = useState<string | null>(null);
  const [exactDate, setExactDate] = useState("");

  return (
    <div className="flex flex-col gap-3">
      {NEXT_TEST_OPTIONS.map((opt) => (
        <ChoiceButton
          key={opt.value}
          label={opt.label}
          selected={range === opt.value}
          onClick={() => setRange(opt.value)}
        />
      ))}
      {range && range !== "not_booked" ? (
        <label className="mt-2 block text-sm text-ink/70">
          Add the exact date (optional)
          <input
            type="date"
            value={exactDate}
            onChange={(e) => setExactDate(e.target.value)}
            className="mt-1 block w-full rounded-xl border border-ink/15 bg-white px-3 py-2 text-sm"
          />
        </label>
      ) : null}
      <button
        type="button"
        disabled={disabled || !range}
        onClick={() =>
          range &&
          onSubmit({
            range,
            exactDate: exactDate || null,
          })
        }
        className="mt-2 inline-flex h-11 items-center justify-center rounded-full bg-brand text-sm font-semibold text-white hover:bg-brand-dark disabled:opacity-60"
      >
        Continue
      </button>
    </div>
  );
}

function MarketingConsentStep({
  disabled,
  onFinish,
}: {
  disabled: boolean;
  onFinish: (value: {
    accepted: boolean;
    label: string;
    recordedAt: string;
  }) => void;
}) {
  const [accepted, setAccepted] = useState(false);

  return (
    <div>
      <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-ink/12 bg-white p-4">
        <input
          type="checkbox"
          className="mt-1"
          checked={accepted}
          onChange={(e) => setAccepted(e.target.checked)}
        />
        <span className="text-sm leading-6 text-ink/85">{MARKETING_CONSENT_LABEL}</span>
      </label>
      <button
        type="button"
        disabled={disabled}
        onClick={() =>
          onFinish({
            accepted,
            label: MARKETING_CONSENT_LABEL,
            recordedAt: new Date().toISOString(),
          })
        }
        className="mt-6 inline-flex h-12 w-full items-center justify-center rounded-full bg-brand text-base font-semibold text-white hover:bg-brand-dark disabled:opacity-60"
      >
        Finish
      </button>
    </div>
  );
}
