import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  BadgeDisplayCard,
  type EarnedBadge,
} from "@/components/speaking/BadgeDisplayCard";
import { FeedbackProcessingCard } from "@/components/speaking/FeedbackProcessingCard";
import { FeedbackSection } from "@/components/speaking/FeedbackSection";
import { NextPracticeActions } from "@/components/speaking/NextPracticeActions";
import { ResultSummaryCard } from "@/components/speaking/ResultSummaryCard";
import {
  SkillScoreGrid,
  type SkillScore,
} from "@/components/speaking/SkillScoreGrid";
import { TranscriptReferenceCard } from "@/components/speaking/TranscriptReferenceCard";
import {
  getBadgeForLevel,
  getBadgeLabel,
} from "@/features/speaking/level-badges";
import { resultCopy } from "@/features/speaking/practice-flow";
import {
  parseStoredScoringResponse,
  type CategoryFeedback,
} from "@/features/speaking/scoring-schema";
import { isValidTaskId } from "@/features/speaking/task-utils";

export const metadata: Metadata = {
  title: "Your speaking feedback - CELPIP Decoded",
  description:
    "Review AI-supported practice feedback for your CELPIP speaking attempt.",
};

type TaskEmbed = {
  id: string;
  title: string;
};

type ScoreEmbed = {
  estimated_level: number | null;
  level_label: string | null;
  badge_slug: string | null;
  content_coherence_score: number | null;
  vocabulary_score: number | null;
  listenability_score: number | null;
  task_fulfillment_score: number | null;
  strengths: unknown;
  improvements: unknown;
  next_steps: unknown;
  raw_ai_response: unknown;
};

type AttemptResultRow = {
  id: string;
  user_id: string;
  status: string;
  transcript: string | null;
  tasks: TaskEmbed | TaskEmbed[] | null;
  attempt_scores: ScoreEmbed | ScoreEmbed[] | null;
};

// Attempt statuses that mean the last feedback run did not finish.
const FAILED_STATUSES = ["transcription_failed", "scoring_failed"];

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

function toSkill(
  name: string,
  columnScore: number | null,
  category: CategoryFeedback | undefined,
): SkillScore {
  return {
    name,
    score: category?.score ?? columnScore,
    feedback: category?.feedback ?? null,
    improvement: category?.improvement ?? null,
  };
}

// Result page for one speaking attempt: estimated practice level,
// category breakdown, narrative feedback, transcript reference, and
// next practice actions.
export default async function SpeakingAttemptResultPage({
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
      "id, user_id, status, transcript, tasks(id, title), attempt_scores(estimated_level, level_label, badge_slug, content_coherence_score, vocabulary_score, listenability_score, task_fulfillment_score, strengths, improvements, next_steps, raw_ai_response)",
    )
    .eq("id", attemptId)
    .maybeSingle<AttemptResultRow>();

  if (error) {
    throw new Error("Could not load this practice attempt. Please try again.");
  }

  if (!attempt || attempt.user_id !== user.id) {
    notFound();
  }

  const task = normalizeEmbed(attempt.tasks);
  const score = normalizeEmbed(attempt.attempt_scores);
  const feedbackReady = score !== null && score.estimated_level !== null;

  // Feedback not saved yet: show the failed state after a failed run,
  // otherwise the waiting state, with actions to continue practicing.
  if (!feedbackReady) {
    const failed = FAILED_STATUSES.includes(attempt.status);
    return (
      <div className="mx-auto w-full max-w-3xl space-y-5">
        <header className="text-center sm:text-left">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand">
            {resultCopy.pageBadge}
          </p>
          <h1 className="mt-2 font-serif text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
            {resultCopy.pageHeading}
          </h1>
        </header>
        {failed ? (
          <section
            aria-label={resultCopy.failedHeading}
            className="rounded-3xl bg-white p-6 text-center shadow-sm ring-1 ring-ink/5 sm:p-8"
          >
            <h2 className="font-serif text-xl font-semibold tracking-tight text-ink">
              {resultCopy.failedHeading}
            </h2>
            <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-ink/70">
              {resultCopy.failedText}
            </p>
          </section>
        ) : (
          <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-ink/5 sm:p-8">
            <FeedbackProcessingCard />
            <p className="mx-auto mt-4 max-w-md text-center text-sm leading-6 text-ink/60">
              {resultCopy.notReadyText}
            </p>
          </section>
        )}
        <NextPracticeActions taskId={task?.id ?? null} />
      </div>
    );
  }

  const parsedAi = parseStoredScoringResponse(score.raw_ai_response);
  const estimatedLevel = score.estimated_level ?? 1;

  const badgeLabel =
    (score.badge_slug ? getBadgeLabel(score.badge_slug) : null) ??
    getBadgeForLevel(estimatedLevel).label;

  // Badge catalog details for the practice badge section. Readable by
  // any signed in user under RLS. Falls back to the local label when
  // the catalog row is missing so the section still renders.
  let earnedBadge: EarnedBadge | null = null;

  if (score.badge_slug) {
    const { data: badgeRow } = await supabase
      .from("badges")
      .select("title, description")
      .eq("slug", score.badge_slug)
      .maybeSingle<{ title: string; description: string | null }>();

    earnedBadge = {
      title: badgeRow?.title ?? badgeLabel,
      description: badgeRow?.description ?? null,
      // Selects the badge artwork only, the stored slug is unchanged.
      slug: score.badge_slug,
    };
  }

  const skills: SkillScore[] = [
    toSkill(
      "Content and coherence",
      score.content_coherence_score,
      parsedAi?.content_coherence,
    ),
    toSkill("Vocabulary", score.vocabulary_score, parsedAi?.vocabulary),
    toSkill("Listenability", score.listenability_score, parsedAi?.listenability),
    toSkill(
      "Task fulfillment",
      score.task_fulfillment_score,
      parsedAi?.task_fulfillment,
    ),
  ];

  const strengths = toStringArray(score.strengths);
  const improvements = toStringArray(score.improvements);
  const nextSteps = toStringArray(score.next_steps);

  return (
    <div className="mx-auto w-full max-w-3xl space-y-5">
      <header className="text-center sm:text-left">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand">
          {resultCopy.pageBadge}
        </p>
        <h1 className="mt-2 font-serif text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
          {resultCopy.pageHeading}
        </h1>
        <p className="mt-2 text-sm leading-6 text-ink/70">
          {resultCopy.readyText}
        </p>
      </header>

      <ResultSummaryCard
        taskTitle={task?.title ?? "CELPIP Speaking Practice"}
        estimatedLevel={estimatedLevel}
        levelLabel={score.level_label}
        badgeLabel={badgeLabel}
        overallSummary={parsedAi?.overall_summary ?? null}
      />

      <BadgeDisplayCard badge={earnedBadge} />

      <SkillScoreGrid skills={skills} />

      <FeedbackSection
        strengths={strengths}
        improvements={improvements}
        nextSteps={nextSteps}
      />

      {attempt.transcript && (
        <TranscriptReferenceCard transcript={attempt.transcript} />
      )}

      <NextPracticeActions taskId={task?.id ?? null} />
    </div>
  );
}
