// Server side question, option and answer key reads for the ADMIN-02
// editor.
//
// Every function takes an AdminSession, for the same structural reason
// mock-test-queries.ts does: there is no way to produce an AdminSession
// except by passing the allow list check in
// src/lib/admin/require-admin.ts.
//
// ANSWER KEYS. This module reads mock_test_answer_keys, which is the one
// table in the project where a mistake hands a learner the answers. Two
// rules hold it in place:
//
//   1. Row level security grants that table no policy for anon or
//      authenticated at all, so the service role client here is the only
//      route to it.
//   2. Nothing that calls this module is learner facing. ADMIN-02 builds
//      no learner route, and the admin preview that renders a key is
//      behind requireAdmin. When a dynamic learner runner is built, it
//      gets its own read that never touches getPartContent, rather than
//      a flag on this one, because a flag is a thing somebody can pass
//      wrong.
//
// This module is server only. Nothing here may be imported from a file
// marked "use client".
//
// House style: normal hyphens only, straight quotes only.

import { getSupabaseAdmin } from "@/lib/supabase/admin";
import type { AdminSession } from "@/lib/admin/require-admin";
import { reportAdminReadError } from "./admin-supabase-error";
import type {
  MockTestAnswerKeyRow,
  MockTestOptionRow,
  MockTestPartContent,
  MockTestQuestionRow,
  MockTestQuestionWithContent,
} from "./mock-test-content-types";
import { listPartMedia } from "./mock-test-media-queries";

export const QUESTION_COLUMNS =
  "id, mock_test_id, section_id, part_id, question_type, question_number, prompt, instruction, passage_text, stem, helper_text, media_asset_id, points, display_order, is_required, status";

export const OPTION_COLUMNS =
  "id, question_id, option_label, option_text, display_order";

const ANSWER_KEY_COLUMNS =
  "id, question_id, correct_option_id, correct_text, explanation, points";

function adminClient(session: AdminSession) {
  if (!session.userId) {
    throw new Error("Admin session is missing a user id.");
  }

  return getSupabaseAdmin();
}

// Everything authored under one part: questions with their options and
// answer keys, plus the media links on the part.
//
// Three reads and a join in memory rather than one nested PostgREST
// select. The nested form would put answer key columns inside the
// question rows of a single response, and keeping the key read as its
// own statement is what makes it obvious, at the call site, that a key
// was fetched at all.
export async function getPartContent(
  session: AdminSession,
  partId: string,
): Promise<MockTestPartContent> {
  const questions = await listPartQuestions(session, partId);
  const media = await listPartMedia(session, partId);

  if (questions.length === 0) {
    return { questions: [], media };
  }

  const questionIds = questions.map((question) => question.id);
  const supabase = adminClient(session);

  const [optionsResult, keysResult] = await Promise.all([
    supabase
      .from("mock_test_options")
      .select(OPTION_COLUMNS)
      .in("question_id", questionIds),
    supabase
      .from("mock_test_answer_keys")
      .select(ANSWER_KEY_COLUMNS)
      .in("question_id", questionIds),
  ]);

  if (optionsResult.error) {
    throw reportAdminReadError(
      "getPartContent:options",
      optionsResult.error,
      "The answer options for that part could not be loaded.",
      { id: partId },
    );
  }

  if (keysResult.error) {
    throw reportAdminReadError(
      "getPartContent:answerKeys",
      keysResult.error,
      "The answer keys for that part could not be loaded.",
      { id: partId },
    );
  }

  const options = (optionsResult.data ?? []) as MockTestOptionRow[];
  const keys = (keysResult.data ?? []) as MockTestAnswerKeyRow[];

  const withContent: MockTestQuestionWithContent[] = questions.map(
    (question) => ({
      ...question,
      options: options
        .filter((option) => option.question_id === question.id)
        .sort(compareOptionOrder),
      // The first match rather than a strict single, because the unique
      // index on question_id is skipped by the migration when a legacy
      // table already holds two keys for one question. The editor
      // overwrites in place, so a second row can only be pre-existing.
      answerKey: keys.find((key) => key.question_id === question.id) ?? null,
    }),
  );

  return { questions: withContent, media };
}

// The questions of one part with nothing attached, used where the
// options and the key are not needed, for example to suggest the next
// question number on the add form.
export async function listPartQuestions(
  session: AdminSession,
  partId: string,
): Promise<MockTestQuestionRow[]> {
  const supabase = adminClient(session);

  const { data, error } = await supabase
    .from("mock_test_questions")
    .select(QUESTION_COLUMNS)
    .eq("part_id", partId);

  if (error) {
    throw reportAdminReadError(
      "listPartQuestions",
      error,
      "The questions in that part could not be loaded.",
      { id: partId },
    );
  }

  return ((data ?? []) as MockTestQuestionRow[]).sort(compareQuestionOrder);
}

// One question with its options and its answer key, scoped to the part
// in the URL so a question id from another part cannot be edited through
// this route. Returns null when it does not exist, so a page can call
// notFound instead of rendering an empty form.
export async function getQuestionWithContent(
  session: AdminSession,
  partId: string,
  questionId: string,
): Promise<MockTestQuestionWithContent | null> {
  const supabase = adminClient(session);

  const { data, error } = await supabase
    .from("mock_test_questions")
    .select(QUESTION_COLUMNS)
    .eq("id", questionId)
    .eq("part_id", partId)
    .maybeSingle();

  if (error) {
    throw reportAdminReadError(
      "getQuestionWithContent",
      error,
      "That question could not be loaded.",
      { id: questionId },
    );
  }

  if (!data) {
    return null;
  }

  const question = data as MockTestQuestionRow;

  const [optionsResult, keyResult] = await Promise.all([
    supabase
      .from("mock_test_options")
      .select(OPTION_COLUMNS)
      .eq("question_id", questionId),
    supabase
      .from("mock_test_answer_keys")
      .select(ANSWER_KEY_COLUMNS)
      .eq("question_id", questionId)
      .limit(1),
  ]);

  if (optionsResult.error) {
    throw reportAdminReadError(
      "getQuestionWithContent:options",
      optionsResult.error,
      "The answer options for that question could not be loaded.",
      { id: questionId },
    );
  }

  if (keyResult.error) {
    throw reportAdminReadError(
      "getQuestionWithContent:answerKey",
      keyResult.error,
      "The answer key for that question could not be loaded.",
      { id: questionId },
    );
  }

  const keys = (keyResult.data ?? []) as MockTestAnswerKeyRow[];

  return {
    ...question,
    options: ((optionsResult.data ?? []) as MockTestOptionRow[]).sort(
      compareOptionOrder,
    ),
    answerKey: keys[0] ?? null,
  };
}

// The number and order to prefill on the add question form. Both run
// from 1 upward, so a part with four questions suggests 5.
export function suggestQuestionPosition(existing: MockTestQuestionRow[]): {
  questionNumber: number;
  displayOrder: number;
} {
  const highestNumber = existing.reduce(
    (highest, question) => Math.max(highest, question.question_number),
    0,
  );

  const highestOrder = existing.reduce(
    (highest, question) => Math.max(highest, question.display_order),
    0,
  );

  return {
    questionNumber: highestNumber + 1,
    displayOrder: Math.max(highestOrder + 1, highestNumber + 1),
  };
}

// Sorting falls back to the question number when two questions claim the
// same display order, which is a state the validator reports rather than
// the database refuses.
function compareQuestionOrder(
  a: MockTestQuestionRow,
  b: MockTestQuestionRow,
): number {
  if (a.display_order !== b.display_order) {
    return a.display_order - b.display_order;
  }

  return a.question_number - b.question_number;
}

function compareOptionOrder(
  a: MockTestOptionRow,
  b: MockTestOptionRow,
): number {
  if (a.display_order !== b.display_order) {
    return a.display_order - b.display_order;
  }

  return a.option_label.localeCompare(b.option_label);
}
