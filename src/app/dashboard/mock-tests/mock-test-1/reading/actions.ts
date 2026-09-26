"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  buildReadingSectionResult,
} from "@/features/exam-engine/reading-section-score";
import { sanitizeReadingSectionAnswers } from "@/features/exam-engine/reading-section-flow";
import { mockTest1ReadingSection } from "@/features/exam-engine/mock-tests/mock-test-1/reading-section";
import type {
  ReadingSectionAnswerMap,
  ReadingSectionMarkedResult,
} from "@/features/exam-engine/reading-section-types";

// Marking for the full Mock Test 1 Reading section (EXAM-24).
//
// The four Reading part actions, done once for the whole section. Same
// reasoning, and it is worth restating rather than cross referencing,
// because the reasoning is the only thing keeping the answer keys off the
// page.
//
// All four Reading parts have complete, confirmed answer keys printed in
// the source document. The route strips every one of them with
// withoutReadingSectionAnswerKeys before the content reaches the browser,
// because a client component receives its props as serialized data and a
// key sent that way is readable in the page payload before a learner has
// answered anything. reading-flow.ts records the consequence next to
// withoutReadingAnswerKey: a screen that marks answers has to do the
// comparison where the keys live. This is that comparison.
//
// So the learner's answers stay in local React state, exactly as each
// part prototype held its own, and only the finished result crosses back:
// the per part review rows and counts, the section totals, and the
// estimated Reading band. The keys themselves are never serialized to the
// client, in either direction, and mockTest1ReadingSection is imported
// here rather than passed in, so nothing the browser sends can influence
// which key an answer is marked against.
//
// The marking is the same EXAM-17 scoring rules Parts 1 to 4 use, reached
// through the same buildReadingReviewRows, so a question marked here and
// the same question marked by its part level action get the same answer
// from the same code, including the wording a part chooses for a question
// that prints no stem. See reading-section-review.ts.
//
// The estimated band is added here and nowhere else. It comes from the
// chart in
// public/Overview and Scoring Descriptors/2. Reading/Reading - Scoring.pdf
// and is null unless the attempt is out of the 38 that chart is drawn
// for, which is what keeps a part level score from ever being handed one.
// See reading-band-score.ts.
//
// No database write, no Supabase migration, no attempt row, and no
// persistence of any kind. The Supabase client here is used for one
// thing: reading the caller's session.
//
// House style: normal hyphens only, no long hyphens or em dashes.

// Mark a full Reading section attempt and return what the closing screens
// need.
//
// Takes the answer map the prototype holds, { questionId: optionId }, and
// returns the per part review rows, the per part counts that make up the
// breakdown, the section totals and the estimated band. A question the
// map does not mention is a blank: it does not block the finish, it
// counts as incorrect, and its row still shows the correct answer.
//
// Returns null when there is no session. The route is behind the
// dashboard auth guard, but a page level check does not extend to a
// server action defined for it, so the caller is verified again here. The
// Reading content is licensed Toronto Academy material and the correct
// answers for the whole section are part of the reply, so this check is
// what stands between a signed out request and the section answer key.
//
// Deterministic and local to the mock content: the same answers always
// produce the same result, nothing is read from a database, and nothing
// is written anywhere.
export async function markReadingSection(
  answers: ReadingSectionAnswerMap,
): Promise<ReadingSectionMarkedResult | null> {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  // A server action is reachable by direct POST, so the submitted map is
  // untrusted input even though the only caller is our own prototype.
  const submitted = sanitizeReadingSectionAnswers(
    mockTest1ReadingSection,
    answers,
  );

  return buildReadingSectionResult(mockTest1ReadingSection, submitted);
}
