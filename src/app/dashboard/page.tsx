import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { DashboardAccessSummary } from "@/components/dashboard/DashboardAccessSummary";
import { DashboardBadgePreview } from "@/components/dashboard/DashboardBadgePreview";
import { DashboardHero } from "@/components/dashboard/DashboardHero";
import { DashboardMockTestCard } from "@/components/dashboard/DashboardMockTestCard";
import { DashboardModuleGrid } from "@/components/dashboard/DashboardModuleGrid";
import { DashboardProgressOverview } from "@/components/dashboard/DashboardProgressOverview";
import { DashboardRecentFeedback } from "@/components/dashboard/DashboardRecentFeedback";
import { DashboardRecommendedPractice } from "@/components/dashboard/DashboardRecommendedPractice";
import {
  DASHBOARD_MODULE_SLUGS,
  dashboardCopy,
} from "@/features/dashboard/dashboard-copy";
import { getDashboardRecommendation } from "@/features/dashboard/dashboard-recommendations";
import {
  buildDashboardSummaryFromRows,
  DASHBOARD_ATTEMPT_LIMIT,
  DASHBOARD_ATTEMPT_SELECT,
  DASHBOARD_HISTORY_STATUSES,
  type DashboardAttemptRow,
} from "@/features/dashboard/dashboard-summary";
import type { DashboardBadgeItem } from "@/features/dashboard/dashboard-types";
import { getUsageAccessSummary } from "@/features/usage/get-usage-access-summary";

export const metadata: Metadata = {
  title: "Dashboard - CELPIP Decoded",
  description:
    "Your CELPIP practice home: recommended practice, progress, recent feedback, and practice badges.",
};

// How many earned badges the preview shows before it stops. The badge
// catalog is small, so this is a display cap rather than paging.
const BADGE_PREVIEW_LIMIT = 8;

type BadgeEmbed = {
  slug: string;
  title: string;
  description: string | null;
};

type UserBadgeRow = {
  id: string;
  earned_at: string | null;
  badges: BadgeEmbed | BadgeEmbed[] | null;
};

type ModuleRow = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  status: string;
  sort_order: number;
};

// Used when the modules table cannot be read, so Speaking and Writing
// stay reachable from the dashboard instead of an empty catalog.
const FALLBACK_MODULES: ModuleRow[] = [
  {
    id: "celpip-speaking",
    slug: "celpip-speaking",
    title: "CELPIP Speaking Practice",
    description:
      "Practice CELPIP speaking tasks with timed prompts and AI feedback.",
    status: "active",
    sort_order: 1,
  },
  {
    id: "celpip-writing",
    slug: "celpip-writing",
    title: "CELPIP Writing Practice",
    description: "Practice CELPIP writing tasks with guided feedback.",
    status: "active",
    sort_order: 2,
  },
  {
    id: "celpip-reading",
    slug: "celpip-reading",
    title: "CELPIP Reading Practice",
    description: "Practice CELPIP reading comprehension.",
    status: "coming_soon",
    sort_order: 3,
  },
  {
    id: "celpip-listening",
    slug: "celpip-listening",
    title: "CELPIP Listening Practice",
    description: "Practice CELPIP listening comprehension.",
    status: "coming_soon",
    sort_order: 4,
  },
];

// PostgREST returns embeds as an object or an array depending on the
// relationship and schema cache. Normalize both to a single object.
function firstEmbed<T>(embed: T | T[] | null): T | null {
  return Array.isArray(embed) ? (embed[0] ?? null) : (embed ?? null);
}

// CELPIP-UX-03: the learner home screen. Everything on this page is
// derived from stored attempts, scores and badges. There is no AI call
// here, no write, and no live class or payment feature.
export default async function DashboardPage() {
  const supabase = await createSupabaseServerClient();

  // The dashboard layout already checks the session, but layouts do not
  // re-render on client navigation, so the page verifies it again close
  // to the data. getUser validates against Supabase instead of trusting
  // cookies.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // The session-scoped client enforces RLS on attempts and user_badges,
  // so only this learner's rows come back. The explicit user_id filters
  // are a second guard.
  let modulesResult: {
    data: ModuleRow[] | null;
    error: { message: string } | null;
  } = { data: [], error: null };
  let attemptsResult: {
    data: DashboardAttemptRow[] | null;
    error: { message: string } | null;
  } = { data: [], error: null };
  let badgesResult: {
    data: UserBadgeRow[] | null;
    error: { message: string } | null;
  } = { data: [], error: null };
  let savedFullName =
    typeof user.user_metadata?.full_name === "string"
      ? user.user_metadata.full_name
      : null;

  try {
    const [modulesQuery, attemptsQuery, badgesQuery, profileQuery] =
      await Promise.all([
      supabase
        .from("modules")
        .select("id, slug, title, description, status, sort_order")
        .in("slug", [...DASHBOARD_MODULE_SLUGS])
        .order("sort_order", { ascending: true }),
      supabase
        .from("attempts")
        .select(DASHBOARD_ATTEMPT_SELECT)
        .eq("user_id", user.id)
        .in("status", [...DASHBOARD_HISTORY_STATUSES])
        .order("created_at", { ascending: false })
        .limit(DASHBOARD_ATTEMPT_LIMIT),
      supabase
        .from("user_badges")
        .select("id, earned_at, badges(slug, title, description)")
        .eq("user_id", user.id)
        .order("earned_at", { ascending: false })
        .limit(BADGE_PREVIEW_LIMIT),
      supabase
        .from("profiles")
        .select("full_name")
        .eq("id", user.id)
        .maybeSingle<{ full_name: string | null }>(),
    ]);

    modulesResult = {
      data: (modulesQuery.data ?? []) as ModuleRow[],
      error: modulesQuery.error,
    };
    attemptsResult = {
      data: (attemptsQuery.data ?? []) as unknown as DashboardAttemptRow[],
      error: attemptsQuery.error,
    };
    badgesResult = {
      data: (badgesQuery.data ?? []) as unknown as UserBadgeRow[],
      error: badgesQuery.error,
    };
    if (profileQuery.data?.full_name) {
      savedFullName = profileQuery.data.full_name;
    }
  } catch (err) {
    console.error("Dashboard data request failed:", err);
    modulesResult = { data: [], error: { message: "request failed" } };
    attemptsResult = { data: [], error: { message: "request failed" } };
  }

  // A failed read used to throw, which production replaces with the
  // generic Server Components message and hides the whole dashboard.
  // Keep the page and say that saved practice did not load.
  const practiceDataFailed = Boolean(
    modulesResult.error || attemptsResult.error,
  );

  if (modulesResult.error) {
    console.error(
      "Dashboard modules query failed:",
      modulesResult.error.message,
    );
  }

  if (attemptsResult.error) {
    console.error(
      "Dashboard attempts query failed:",
      attemptsResult.error.message,
    );
  }

  const moduleList = modulesResult.error
    ? FALLBACK_MODULES
    : ((modulesResult.data ?? []) as ModuleRow[]);

  const summary = buildDashboardSummaryFromRows(
    attemptsResult.error ? [] : (attemptsResult.data ?? []),
  );

  const recommendation = getDashboardRecommendation(summary);

  // A failed badge read hides the badges rather than blocking the page,
  // so the rest of the dashboard still renders.
  const badges: DashboardBadgeItem[] = (
    badgesResult.error ? [] : (badgesResult.data ?? [])
  ).map((row) => {
    const badge = firstEmbed(row.badges);

    return {
      id: row.id,
      slug: badge?.slug ?? null,
      title: badge?.title ?? "Practice badge",
      description: badge?.description ?? null,
      earnedAt: row.earned_at,
    };
  });

  // USAGE-01: remaining AI feedback access. Read on the server with the
  // service role, so no key reaches the browser. When the read fails the
  // access card falls back to its safe placeholder.
  const accessResult = await getUsageAccessSummary(user.id);

  return (
    <>
      {practiceDataFailed ? (
        <p
          role="status"
          className="mb-6 rounded-2xl bg-white px-4 py-3 text-sm leading-6 text-foreground/70 shadow-sm ring-1 ring-foreground/5"
        >
          {dashboardCopy.practiceDataNotice}
        </p>
      ) : null}

      <DashboardHero
        userEmail={user.email ?? null}
        fullName={savedFullName}
        hasPractice={summary.hasAnyPractice}
        continueHref={recommendation.href}
        continueLabel={recommendation.ctaLabel}
      />

      <div className="mt-8 grid grid-cols-1 gap-5 lg:grid-cols-2">
        <DashboardAccessSummary
          summary={accessResult.ok ? accessResult.summary : null}
        />
        <DashboardRecommendedPractice recommendation={recommendation} />
      </div>

      <div className="mt-10">
        <DashboardProgressOverview
          speaking={summary.speaking}
          writing={summary.writing}
          totalFeedbackReports={summary.totalFeedbackReports}
        />
      </div>

      <div className="mt-10">
        <DashboardRecentFeedback items={summary.recentFeedback} />
      </div>

      <div className="mt-10">
        <DashboardBadgePreview badges={badges} />
      </div>

      <div className="mt-10">
        <DashboardModuleGrid
          modules={moduleList}
          reportCounts={{
            speaking: summary.speaking.feedbackReports,
            writing: summary.writing.feedbackReports,
          }}
        />
      </div>

      {/* EXAM-15A: the Mock Test 1 Listening test entry point. This block
          used to be the internal preview link list, which carried one
          card per exam engine ticket. The internal routes still work, but
          they are no longer linked from the dashboard. */}
      <div className="mt-10">
        <DashboardMockTestCard />
      </div>
    </>
  );
}
