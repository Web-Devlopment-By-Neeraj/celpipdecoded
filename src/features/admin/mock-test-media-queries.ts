// Server side media reads for the ADMIN-02 editor.
//
// Every function takes an AdminSession, for the same structural reason
// mock-test-queries.ts does: there is no way to produce an AdminSession
// except by passing the allow list check in
// src/lib/admin/require-admin.ts, so the authorization step becomes an
// argument a future caller cannot drop and still compile.
//
// The service role client is used deliberately. Row level security on
// mock_test_media_assets denies anon and authenticated outright, because
// admin membership is an environment variable that a Postgres policy
// cannot read. See the RLS note in
// supabase/migrations/014_mock_test_question_answer_media_editor.sql.
//
// This module is server only. The service role key must never reach a
// client component, so nothing here may be imported from a file marked
// "use client".
//
// House style: normal hyphens only, straight quotes only.

import { getSupabaseAdmin } from "@/lib/supabase/admin";
import type { AdminSession } from "@/lib/admin/require-admin";
import { reportAdminReadError } from "./admin-supabase-error";
import type { MockTestMediaAssetRow } from "./mock-test-content-types";

// internal_notes is included here on purpose and only here. The media
// list and the media edit form are both admin screens behind
// requireAdmin, and the notes are what a staff member wrote to a
// colleague about the clip. No learner route reads this module.
export const MEDIA_COLUMNS =
  "id, mock_test_id, section_id, part_id, media_type, url, title, alt_text, transcript, internal_notes, display_order";

function adminClient(session: AdminSession) {
  if (!session.userId) {
    throw new Error("Admin session is missing a user id.");
  }

  return getSupabaseAdmin();
}

// Every media link on one part, in display order.
export async function listPartMedia(
  session: AdminSession,
  partId: string,
): Promise<MockTestMediaAssetRow[]> {
  const supabase = adminClient(session);

  const { data, error } = await supabase
    .from("mock_test_media_assets")
    .select(MEDIA_COLUMNS)
    .eq("part_id", partId);

  if (error) {
    throw reportAdminReadError(
      "listPartMedia",
      error,
      "The media links for that part could not be loaded.",
      { id: partId },
    );
  }

  return ((data ?? []) as MockTestMediaAssetRow[]).sort(compareMediaOrder);
}

// One media link, scoped to the part in the URL so an asset id from
// another part cannot be edited through this route.
export async function getPartMediaAsset(
  session: AdminSession,
  partId: string,
  mediaAssetId: string,
): Promise<MockTestMediaAssetRow | null> {
  const supabase = adminClient(session);

  const { data, error } = await supabase
    .from("mock_test_media_assets")
    .select(MEDIA_COLUMNS)
    .eq("id", mediaAssetId)
    .eq("part_id", partId)
    .maybeSingle();

  if (error) {
    throw reportAdminReadError(
      "getPartMediaAsset",
      error,
      "That media link could not be loaded.",
      { id: mediaAssetId },
    );
  }

  return (data as MockTestMediaAssetRow | null) ?? null;
}

// The order number to prefill on the add media form.
export function suggestMediaOrder(existing: MockTestMediaAssetRow[]): number {
  return (
    existing.reduce(
      (highest, asset) => Math.max(highest, asset.display_order),
      0,
    ) + 1
  );
}

// Sorting falls back to the title when two assets claim the same order,
// which is a state the validator does not even report, because media
// order only decides the sequence on one screen.
function compareMediaOrder(
  a: MockTestMediaAssetRow,
  b: MockTestMediaAssetRow,
): number {
  if (a.display_order !== b.display_order) {
    return a.display_order - b.display_order;
  }

  return (a.title ?? "").localeCompare(b.title ?? "");
}
