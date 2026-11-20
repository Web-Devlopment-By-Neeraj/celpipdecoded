import { getSupabaseAdmin } from "@/lib/supabase/admin";
import type {
  MockRunMode,
  MockRunSummary,
  MockRunTimer,
  MockRunView,
  MockSectionDraft,
} from "./mock-run";

// Account store for mock runs.
//
// Service role only. Callers have already checked the signed-in user.
// A missing table, which is the state before migration 020 is applied,
// returns an empty list or a failed save. The test itself still runs.

type RunRow = {
  id: string;
  slug: string;
  mode: string;
  section: string;
  status: string;
  screen_index: number;
  payload: MockSectionDraft | null;
  timer_key: string | null;
  timer_remaining_seconds: number | null;
  timer_saved_at: string | null;
  summary: MockRunSummary | null;
  updated_at: string;
};

function asDraft(payload: MockSectionDraft | null): MockSectionDraft {
  if (!payload || typeof payload !== "object") {
    return { screenIndex: 0 };
  }
  return payload;
}

function asView(row: RunRow): MockRunView {
  return {
    id: row.id,
    slug: row.slug,
    mode: row.mode === "full" ? "full" : "section",
    section: row.section,
    status: row.status === "submitted" ? "submitted" : "in_progress",
    screenIndex: row.screen_index,
    updatedAt: row.updated_at,
    summary:
      row.summary &&
      typeof row.summary.label === "string" &&
      typeof row.summary.detail === "string"
        ? row.summary
        : null,
  };
}

export async function listMockRuns(userId: string): Promise<MockRunView[]> {
  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("learner_mock_runs")
      .select(
        "id, slug, mode, section, status, screen_index, summary, updated_at",
      )
      .eq("user_id", userId)
      .order("updated_at", { ascending: false })
      .limit(40);

    if (error || !data) {
      return [];
    }

    return (data as RunRow[]).map(asView);
  } catch (error) {
    console.error("Mock runs could not be listed.", error);
    return [];
  }
}

export async function loadOpenMockDraft(
  userId: string,
  slug: string,
  mode: MockRunMode,
  section: string,
): Promise<MockSectionDraft | null> {
  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("learner_mock_runs")
      .select(
        "id, slug, mode, section, status, screen_index, payload, timer_key, timer_remaining_seconds, timer_saved_at, summary, updated_at",
      )
      .eq("user_id", userId)
      .eq("slug", slug)
      .eq("mode", mode)
      .eq("section", section)
      .eq("status", "in_progress")
      .maybeSingle();

    if (error || !data) {
      return null;
    }

    const row = data as RunRow;
    const draft = asDraft(row.payload);
    draft.screenIndex = row.screen_index;

    if (
      row.timer_key &&
      typeof row.timer_remaining_seconds === "number" &&
      row.timer_saved_at
    ) {
      draft.timer = {
        screenKey: row.timer_key,
        remainingSeconds: row.timer_remaining_seconds,
        savedAt: new Date(row.timer_saved_at).getTime(),
      };
    }

    return draft;
  } catch (error) {
    console.error("Open mock run could not be loaded.", error);
    return null;
  }
}

export async function saveOpenMockDraft(input: {
  userId: string;
  slug: string;
  mode: MockRunMode;
  section: string;
  draft: MockSectionDraft;
  timer: MockRunTimer | null;
}): Promise<boolean> {
  try {
    const supabase = getSupabaseAdmin();
    const existing = await supabase
      .from("learner_mock_runs")
      .select("id")
      .eq("user_id", input.userId)
      .eq("slug", input.slug)
      .eq("mode", input.mode)
      .eq("section", input.section)
      .eq("status", "in_progress")
      .maybeSingle();

    const row = {
      user_id: input.userId,
      slug: input.slug,
      mode: input.mode,
      section: input.section,
      status: "in_progress",
      screen_index: input.draft.screenIndex,
      payload: input.draft,
      timer_key: input.timer?.screenKey ?? null,
      timer_remaining_seconds: input.timer?.remainingSeconds ?? null,
      timer_saved_at: input.timer
        ? new Date(input.timer.savedAt).toISOString()
        : null,
      updated_at: new Date().toISOString(),
    };

    if (existing.data?.id) {
      const { error } = await supabase
        .from("learner_mock_runs")
        .update(row)
        .eq("id", existing.data.id);
      return !error;
    }

    const { error } = await supabase.from("learner_mock_runs").insert(row);
    return !error;
  } catch (error) {
    console.error("Mock run could not be saved.", error);
    return false;
  }
}

export async function recordMockSectionResult(input: {
  userId: string;
  slug: string;
  mode: MockRunMode;
  section: string;
  screenIndex: number;
  summary: MockRunSummary;
}): Promise<boolean> {
  try {
    const supabase = getSupabaseAdmin();
    const { error } = await supabase.from("learner_mock_runs").insert({
      user_id: input.userId,
      slug: input.slug,
      mode: input.mode,
      section: input.section,
      status: "submitted",
      screen_index: input.screenIndex,
      payload: {},
      summary: input.summary,
      updated_at: new Date().toISOString(),
      submitted_at: new Date().toISOString(),
    });
    return !error;
  } catch (error) {
    console.error("Mock result could not be saved.", error);
    return false;
  }
}
