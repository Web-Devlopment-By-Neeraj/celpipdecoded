"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  buildListeningVideoReviewRows,
  buildListeningVideoScoreSummary,
} from "@/features/exam-engine/listening-score";
import { listeningPart5 } from "@/features/exam-engine/mock-tests/mock-test-1/listening-part-5";
import type { ListeningMarkedPart } from "@/features/exam-engine/listening-review-types";
import type { ListeningVideoAnswerMap } from "@/features/exam-engine/listening-video-types";

// Marking for Mock Test 1 Listening Part 5 (EXAM-12).
//
// The Part 4 action, pointed at Part 5 content and at the video marking
// helpers. Same reasoning, and it is worth restating rather than cross
// referencing, because the reasoning is the only thing keeping the answer
// key off the page.
//
// Part 5 has a complete, confirmed answer key. EXAM-11 stripped it on the
// server with withoutListeningVideoAnswerKey before the content reached
// the browser, because a client component receives its props as
// serialized data and a key sent that way is readable in the page payload
// before a learner has answered anything. listening-video-flow.ts records
// the consequence next to that helper: a screen that marks answers has to
// do the comparison where the key lives. This is that comparison.
//
// So the learner's answers stay in local React state, exactly as the
// EXAM-11 prototype held them, and only the finished result crosses back:
// review rows and a practice score summary. The key itself is never
// serialized to the client, in either direction.
//
// The marking is the same EXAM-04 scoring rules Parts 1 to 4 use. Part 5
// questions are printed questions answered from radio groups rather than
// dropdown completions, which changes the shape of the content and
// nothing about how an answer is checked, so the three share one internal
// core in listening-score.ts. Nothing is duplicated and nothing is scored
// differently.
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
function sanitizeAnswers(answers: unknown): ListeningVideoAnswerMap {
  const clean: Record<string, string> = {};

  if (!answers || typeof answers !== "object") {
    return clean;
  }

  const submitted = answers as Record<string, unknown>;

  listeningPart5.questions.forEach((question) => {
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

// Mark a Listening Part 5 attempt and return what the closing screens
// need.
//
// Returns null when there is no session. The route is behind the
// dashboard auth guard, but a page level check does not extend to a
// server action defined for it, so the caller is verified again here.
// Part 5 content is licensed Toronto Academy material and the correct
// answers are part of the reply, so this check is what stands between a
// signed out request and the answer key.
export async function markListeningPartFive(
  answers: ListeningVideoAnswerMap,
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
    rows: buildListeningVideoReviewRows(listeningPart5, submitted),
    summary: buildListeningVideoScoreSummary(listeningPart5, submitted),
  };
}
