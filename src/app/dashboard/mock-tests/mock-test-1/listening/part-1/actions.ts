"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { listListeningQuestions } from "@/features/exam-engine/listening-flow";
import {
  buildListeningReviewRows,
  buildListeningScoreSummary,
} from "@/features/exam-engine/listening-score";
import { listeningPart1 } from "@/features/exam-engine/mock-tests/mock-test-1/listening-part-1";
import type { ListeningMarkedPart } from "@/features/exam-engine/listening-review-types";
import type { ListeningAnswerMap } from "@/features/exam-engine/listening-types";

// Marking for Mock Test 1 Listening Part 1 (EXAM-15A).
//
// Why this file exists at all.
//
// Part 1 was built first, in EXAM-03, when its answer key was a list of
// pending entries with no correctOptionId anywhere in it. Handing the
// content object whole to a client component was safe then, because
// there was nothing in it to leak, and EXAM-04 scored the part in the
// browser for the same reason.
//
// The key was transcribed later. From that point the Part 1 route was
// serializing all eight correct option ids into the page payload, where
// anyone could read them before answering a single question. Parts 2 to 6
// never had that gap: each one strips its key on the server and marks
// server side. This file is Part 1 catching up, and it is the same file
// as ../part-2/actions.ts with the Part 1 content imported.
//
// So the learner's answers stay in local React state, exactly as the
// EXAM-04 prototype held them, and only the finished result crosses back:
// review rows and a practice score summary. The key itself is never
// serialized to the client, in either direction.
//
// The marking is the same pure EXAM-04 helpers the browser used to call.
// Nothing is duplicated and nothing is scored differently, so the Part 1
// review table and the practice score read exactly as they did before.
// The only difference is which side of the boundary the comparison runs
// on.
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

  listListeningQuestions(listeningPart1).forEach((question) => {
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

// Mark a Listening Part 1 attempt and return what the closing screens
// need.
//
// Returns null when there is no session. The route is behind the
// dashboard auth guard, but a page level check does not extend to a
// server action defined for it, so the caller is verified again here.
// Part 1 content is licensed Toronto Academy material and the correct
// answers are part of the reply, so this check is what stands between a
// signed out request and the answer key.
export async function markListeningPartOne(
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
    rows: buildListeningReviewRows(listeningPart1, submitted),
    summary: buildListeningScoreSummary(listeningPart1, submitted),
  };
}
