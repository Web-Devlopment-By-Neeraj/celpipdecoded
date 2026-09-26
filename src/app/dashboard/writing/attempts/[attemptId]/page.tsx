import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { WritingAttemptActions } from "@/components/writing/WritingAttemptActions";
import {
  WritingBadgeDisplayCard,
  type EarnedWritingBadge,
} from "@/components/writing/WritingBadgeDisplayCard";
import { WritingEvaluationErrorCard } from "@/components/writing/WritingEvaluationErrorCard";
import { WritingEvaluationProcessingCard } from "@/components/writing/WritingEvaluationProcessingCard";
import { WritingFeedbackSection } from "@/components/writing/WritingFeedbackSection";
import { WritingNextPracticeActions } from "@/components/writing/WritingNextPracticeActions";
import { WritingResponseReferenceCard } from "@/components/writing/WritingResponseReferenceCard";
import { WritingResultSummaryCard } from "@/components/writing/WritingResultSummaryCard";
import {
  WritingSkillScoreGrid,
  type WritingSkillScore,
} from "@/components/writing/WritingSkillScoreGrid";
import { writingResultCopy } from "@/features/writing/task-copy";
import { isValidTaskId } from "@/features/writing/task-utils";
import { writingHistoryCopy } from "@/features/writing/writing-attempt-history";
import {
  getWritingBadgeForLevel,
  getWritingBadgeLabel,
} from "@/features/writing/writing-level-badges";
import {
  parseStoredWritingFeedback,
  type WritingCategoryFeedback,
} from "@/features/writing/writing-scoring-schema";

export const metadata: Metadata = {
  title: "Your writing feedback - CELPIP Decoded",
  description:
    "Review AI-supported practice feedback for your CELPIP writing attempt.",
};

type ModuleEmbed = {
  slug: string;
};

type TaskEmbed = {
  id: string;
  title: string;
  modules: ModuleEmbed | ModuleEmbed[] | null;
};

type ScoreEmbed = {
  estimated_level: number | null;
  level_label: string | null;
  badge_slug: string | null;
  strengths: unknown;
  improvements: unknown;
  next_steps: unknown;
  writing_feedback: unknown;
  writing_overall_summary: string | null;
  writing_suggested_structure: string | null;
};

type AttemptResultRow = {
  id: string;
  user_id: string;
  status: string;
  response_text: string | null;
  word_count: number | null;
  time_spent_seconds: number | null;
  tasks: TaskEmbed | TaskEmbed[] | null;
  attempt_scores: ScoreEmbed | ScoreEmbed[] | null;
};

// Attempt statuses that mean the last evaluation run did not finish.
const FAILED_STATUSES = ["writing_evaluation_failed"];

// PostgREST returns embeds as an object or an array depending on the
// relationship and schema cache. Normalize both to a single object.
function normalizeEmbed<T>(embed: T | T[] | null): T | null {
  return Array.isArray(embed) ? (embed[0] ?? null) : (embed ?? null);
}

// jsonb list columns arrive as unknown; keep only string items.
function toStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }
  return value.filter((item): item is string => typeof item === "string");
}

// Back links shown above the result, in both the ready and the waiting
// state, so a student can always return to the history or the library.
function WritingResultNav() {
  return (
    <nav
      aria-label="Writing result navigation"
      className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 sm:justify-start"
    >
      <Link
        href="/dashboard/writing/attempts"
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand transition-colors hover:text-brand-dark"
      >
        <span aria-hidden>&larr;</span>
        {writingHistoryCopy.backToHistory}
      </Link>
      <Link
        href="/dashboard/writing"
        className="text-sm font-semibold text-brand transition-colors hover:text-brand-dark"
      >
        {writingHistoryCopy.backToWriting}
      </Link>
    </nav>
  );
}

function toSkill(
  name: string,
  category: WritingCategoryFeedback | undefined,
): WritingSkillScore {
  return {
    name,
    score: category?.score ?? null,
    feedback: category?.feedback ?? null,
    improvement: category?.improvement ?? null,
  };
}

// Result page for one writing attempt: estimated practice level,
// category breakdown, narrative feedback, the original response, and
// next practice actions.
export default async function WritingAttemptResultPage({
  params,
}: {
  params: Promise<{ attemptId: string }>;
}) {
  const { attemptId } = await params;

  // Reject anything that is not a UUID before querying, so a bad URL
  // becomes a 404 instead of a database error.
  if (!isValidTaskId(attemptId)) {
    notFound();
  }

  const supabase = await createSupabaseServerClient();

  // The dashboard layout already checks the session, but layouts do not
  // re-render on client navigation, so the page verifies it again close
  // to the data.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // The session-scoped client enforces RLS, so another user's attempt
  // comes back empty. The explicit owner check below is a second guard.
  const { data: attempt, error } = await supabase
    .from("attempts")
    .select(
      "id, user_id, status, response_text, word_count, time_spent_seconds, tasks(id, title, modules(slug)), attempt_scores(estimated_level, level_label, badge_slug, strengths, improvements, next_steps, writing_feedback, writing_overall_summary, writing_suggested_structure)",
    )
    .eq("id", attemptId)
    .maybeSingle<AttemptResultRow>();

  if (error) {
    throw new Error("Could not load this writing attempt. Please try again.");
  }

  if (!attempt || attempt.user_id !== user.id) {
    notFound();
  }

  const task = normalizeEmbed(attempt.tasks);
  const moduleEmbed = normalizeEmbed(task?.modules ?? null);

  // Only writing attempts render here; a speaking attempt id in this
  // URL is a 404, not an error.
  if (moduleEmbed?.slug !== "celpip-writing") {
    notFound();
  }

  const score = normalizeEmbed(attempt.attempt_scores);
  const feedbackReady = score !== null && score.estimated_level !== null;

  // Feedback not saved yet: show the failed state after a failed run,
  // otherwise the waiting state, with actions to continue practicing.
  if (!feedbackReady) {
    const failed = FAILED_STATUSES.includes(attempt.status);
    return (
      <div className="mx-auto w-full max-w-3xl space-y-5">
        <WritingResultNav />
        <header className="text-center sm:text-left">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand">
            {writingResultCopy.pageBadge}
          </p>
          <h1 className="mt-2 font-serif text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
            {writingResultCopy.pageHeading}
          </h1>
        </header>
        {failed ? (
          <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-ink/5 sm:p-8">
            <WritingEvaluationErrorCard
              message={writingResultCopy.failedText}
            />
            {/* Retry the evaluation without retyping the response, which
                is already saved on the attempt. */}
            <div className="mt-5 flex justify-center sm:justify-start">
              <WritingAttemptActions
                attemptId={attempt.id}
                status={attempt.status}
                variant="button"
              />
            </div>
          </section>
        ) : (
          <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-ink/5 sm:p-8">
            <WritingEvaluationProcessingCard />
            <p className="mx-auto mt-4 max-w-md text-center text-sm leading-6 text-ink/60">
              {writingResultCopy.notReadyText}
            </p>
            <div className="mt-5 flex justify-center">
              <WritingAttemptActions
                attemptId={attempt.id}
                status={attempt.status}
                variant="button"
              />
            </div>
          </section>
        )}
        <WritingBadgeDisplayCard badge={null} />
        <WritingNextPracticeActions taskId={task?.id ?? null} />
      </div>
    );
  }

  const writingFeedback = parseStoredWritingFeedback(score.writing_feedback);
  const estimatedLevel = score.estimated_level ?? 1;

  const badgeLabel =
    (score.badge_slug ? getWritingBadgeLabel(score.badge_slug) : null) ??
    getWritingBadgeForLevel(estimatedLevel).label;

  // Badge details for the practice badge section. The description comes
  // from the shared badge catalog, which is readable by any signed in
  // user under RLS. The title uses the writing label so the wording
  // stays about written communication, and the section still renders if
  // the catalog row is missing.
  let earnedBadge: EarnedWritingBadge | null = null;

  if (score.badge_slug) {
    const { data: badgeRow } = await supabase
      .from("badges")
      .select("title, description")
      .eq("slug", score.badge_slug)
      .maybeSingle<{ title: string; description: string | null }>();

    earnedBadge = {
      title: badgeLabel,
      description: badgeRow?.description ?? null,
      // Selects the badge artwork only, the stored slug is unchanged.
      slug: score.badge_slug,
    };
  }

  const skills: WritingSkillScore[] = [
    toSkill("Task fulfillment", writingFeedback?.task_fulfillment),
    toSkill(
      "Organization and coherence",
      writingFeedback?.organization_coherence,
    ),
    toSkill("Vocabulary", writingFeedback?.vocabulary),
    toSkill(
      "Grammar and sentence control",
      writingFeedback?.grammar_sentence_control,
    ),
    toSkill("Tone and clarity", writingFeedback?.tone_clarity),
  ];

  const strengths = toStringArray(score.strengths);
  const improvements = toStringArray(score.improvements);
  const nextSteps = toStringArray(score.next_steps);

  return (
    <div className="mx-auto w-full max-w-3xl space-y-5">
      <WritingResultNav />
      <header className="text-center sm:text-left">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand">
          {writingResultCopy.pageBadge}
        </p>
        <h1 className="mt-2 font-serif text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
          {writingResultCopy.pageHeading}
        </h1>
        <p className="mt-2 text-sm leading-6 text-ink/70">
          {writingResultCopy.readyText}
        </p>
      </header>

      <WritingResultSummaryCard
        taskTitle={task?.title ?? "CELPIP Writing Practice"}
        estimatedLevel={estimatedLevel}
        levelLabel={score.level_label}
        badgeLabel={badgeLabel}
        overallSummary={score.writing_overall_summary}
        wordCount={attempt.word_count}
        timeSpentSeconds={attempt.time_spent_seconds}
      />

      <WritingBadgeDisplayCard badge={earnedBadge} />

      <WritingSkillScoreGrid skills={skills} />

      <WritingFeedbackSection
        strengths={strengths}
        improvements={improvements}
        suggestedStructure={score.writing_suggested_structure}
        nextSteps={nextSteps}
      />

      {attempt.response_text && (
        <WritingResponseReferenceCard responseText={attempt.response_text} />
      )}

      <WritingNextPracticeActions taskId={task?.id ?? null} />
    </div>
  );
}
