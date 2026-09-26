"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { listListeningQuestions } from "@/features/exam-engine/listening-flow";
import {
  buildListeningReviewRows,
  buildListeningScoreSummary,
} from "@/features/exam-engine/listening-score";
import { listeningPart2 } from "@/features/exam-engine/mock-tests/mock-test-1/listening-part-2";
import type { ListeningMarkedPart } from "@/features/exam-engine/listening-review-types";
import type { ListeningAnswerMap } from "@/features/exam-engine/listening-types";

// Marking for Mock Test 1 Listening Part 2 (EXAM-06).
//
// Why this file exists at all.
//
// Part 2 has a complete answer key. EXAM-05 stripped it on the server
// with withoutListeningAnswerKey before the content reached the browser,
// because a client component receives its props as serialized data and a
// key sent that way is readable in the page payload before a learner has
// answered anything. listening-flow.ts records the consequence next to
// that helper: a screen that marks answers has to do the comparison
// where the key lives. This is that comparison.
//
// So the learner's answers stay in local React state, exactly as the
// EXAM-05 prototype held them, and only the finished result crosses back:
// review rows and a practice score summary. The key itself is never
// serialized to the client, in either direction.
//
// The marking is the same pure EXAM-04 helpers Part 1 calls in the
// browser. Nothing is duplicated and nothing is scored differently. The
// only difference is which side of the boundary it runs on.
//
// No database write, no Supabase migration, no attempt row, and no
// persistence of any kind. The Supabase client here is used for one
// thing: reading the caller's session.
//
// House style: normal hyphens only, no long hyphens or em dashes.

// Keep only answers that name a real question in this part and a real
// option on that question.
//
// A server action is reachable by direct POST, so the argument is
// untrusted input even though the only caller is our own prototype. This
// discards anything unrecognized rather than rejecting the whole
// submission, so a stale answer left over from a content edit costs the
// learner one row instead of the entire result.
function sanitizeAnswers(answers: unknown): ListeningAnswerMap {
  const clean: Record<string, string> = {};

  if (!answers || typeof answers !== "object") {
    return clean;
  }

  const submitted = answers as Record<string, unknown>;

  listListeningQuestions(listeningPart2).forEach((question) => {
    const selectedOptionId = submitted[question.id];

    if (
      typeof selectedOptionId === "string" &&
      question.options.some((option) => option.id === selectedOptionId)
    ) {
      clean[question.id] = selectedOptionId;
    }
  });

  return clean;
}

// Mark a Listening Part 2 attempt and return what the closing screens
// need.
//
// Returns null when there is no session. The route is behind the
// dashboard auth guard, but a page level check does not extend to a
// server action defined for it, so the caller is verified again here.
// Part 2 content is licensed Toronto Academy material and the correct
// answers are part of the reply, so this check is what stands between a
// signed out request and the answer key.
export async function markListeningPartTwo(
  answers: ListeningAnswerMap,
): Promise<ListeningMarkedPart | null> {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const submitted = sanitizeAnswers(answers);

  return {
    rows: buildListeningReviewRows(listeningPart2, submitted),
    summary: buildListeningScoreSummary(listeningPart2, submitted),
  };
}
