"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  buildListeningSectionResult,
  sanitizeListeningSectionAnswers,
} from "@/features/exam-engine/listening-section-score";
import { mockTest1ListeningSection } from "@/features/exam-engine/mock-tests/mock-test-1/full-listening-section";
import type { ListeningSectionAnswerMap, ListeningSectionMarkedResult } from "@/features/exam-engine/listening-section-types";

// Marking for the full Mock Test 1 Listening section (EXAM-15).
//
// The six part actions, done once for the whole section. Same reasoning,
// and it is worth restating rather than cross referencing, because the
// reasoning is the only thing keeping the answer keys off the page.
//
// All six Listening parts have complete, confirmed answer keys. The route
// strips every one of them with withoutListeningSectionAnswerKeys before
// the content reaches the browser, because a client component receives its
// props as serialized data and a key sent that way is readable in the page
// payload before a learner has answered anything.
// listening-section-flow.ts records the consequence next to that helper: a
// screen that marks answers has to do the comparison where the keys live.
// This is that comparison.
//
// So the learner's 38 answers stay in local React state, exactly as each
// part prototype held its own, and only the finished result crosses back:
// the per part review rows and counts, and the section totals. The keys
// themselves are never serialized to the client, in either direction.
//
// The marking is the same EXAM-04 scoring rules Parts 1 to 6 use, reached
// through the same four adapters, so a question marked here and the same
// question marked by its part level action get the same answer from the
// same code. See listening-section-score.ts.
//
// No database write, no Supabase migration, no attempt row, and no
// persistence of any kind. The Supabase client here is used for one thing:
// reading the caller's session.
//
// House style: normal hyphens only, no long hyphens or em dashes.

// Mark a full Listening section attempt and return what the closing
// screens need.
//
// Returns null when there is no session. The route is behind the dashboard
// auth guard, but a page level check does not extend to a server action
// defined for it, so the caller is verified again here. The Listening
// content is licensed Toronto Academy material and the correct answers for
// all 38 questions are part of the reply, so this check is what stands
// between a signed out request and the whole section answer key.
export async function markListeningSection(
  answers: ListeningSectionAnswerMap,
): Promise<ListeningSectionMarkedResult | null> {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  // A server action is reachable by direct POST, so the submitted map is
  // untrusted input even though the only caller is our own prototype.
  const submitted = sanitizeListeningSectionAnswers(
    mockTest1ListeningSection,
    answers,
  );

  return buildListeningSectionResult(mockTest1ListeningSection, submitted);
}
