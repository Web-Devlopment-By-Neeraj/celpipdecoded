"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { markReadingPart } from "@/features/exam-engine/reading-score";
import { listReadingQuestions } from "@/features/exam-engine/reading-flow";
import { readingPart3 } from "@/features/exam-engine/mock-tests/mock-test-1/reading-part-3";
import type {
  ReadingAnswerMap,
  ReadingMarkedPart,
} from "@/features/exam-engine/reading-types";

// Marking for Mock Test 1 Reading Part 3 (EXAM-21).
//
// The Reading Part 1 and Part 2 actions beside it, pointed at Part 3
// content. The reasoning is restated here rather than cross referenced,
// because the reasoning is the only thing keeping the answer key off the
// page.
//
// Reading Part 3 has a complete, confirmed answer key printed in the
// source document, nine letters running C D B E A E E A D. EXAM-20
// stripped it on the server with withoutReadingAnswerKey before the
// content reached the browser, because a client component receives its
// props as serialized data and a key sent that way is readable in the
// page payload before a learner has answered anything. reading-flow.ts
// records the consequence next to that helper: a screen that marks
// answers has to do the comparison where the key lives. This is that
// comparison, and it is the piece EXAM-20 said the next ticket would add.
//
// So the learner's answers stay in local React state, exactly as the
// EXAM-20 prototype held them, and only the finished result crosses back:
// review rows carrying the correct paragraph for statements they have now
// finished, and a practice score summary. The key itself is never
// serialized to the client in either direction, and readingPart3 is
// imported here rather than passed in, so nothing the browser sends can
// influence which key an answer is marked against.
//
// No database write, no Supabase migration, no attempt row, and no
// persistence of any kind. The Supabase client here is used for one
// thing: reading the caller's session.
//
// This action passes no ReadingReviewOptions, which is the one way it is
// shorter than the Part 2 action beside it. Part 2 has to name the body
// of text its unstemmed blanks sit in, because questions 1 to 5 there
// print no stem of their own. Every one of Part 3's nine questions is a
// whole statement carrying its own text, so formatReadingQuestionText
// prints the statement itself and there is no blank to name.
//
// House style: normal hyphens only, no long hyphens or em dashes.

// Keep only answers that name a real question in this part and a real
// option on that question.
//
// A server action is reachable by direct POST, so the argument is
// untrusted input even though the only caller is our own prototype. This
// discards anything unrecognized rather than rejecting the whole
// submission, so a stale answer left over from a content edit costs the
// learner one row instead of the entire result. A discarded answer is
// marked as a blank, which is the honest reading of "we cannot tell what
// was chosen".
//
// It matters a little more here than in the two parts before it. Reading
// Part 3 answers every statement from the same five letters, so an id
// that names paragraph C on the wrong question is a shape a careless
// caller could easily produce. Checking the option against the question
// it was sent for, rather than against the five labels, is what stops one
// being credited to another.
function sanitizeAnswers(answers: unknown): ReadingAnswerMap {
  const clean: Record<string, string> = {};

  if (!answers || typeof answers !== "object") {
    return clean;
  }

  const submitted = answers as Record<string, unknown>;

  listReadingQuestions(readingPart3).forEach((question) => {
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

// Mark a Reading Part 3 attempt and return what the closing screens need.
//
// Takes the answer map the prototype holds, { questionId: optionId }, and
// returns the review rows and the practice score summary counted from
// them. A question the map does not mention is a blank: it does not block
// the finish, it counts as incorrect, and its row still shows the correct
// answer.
//
// Returns null when there is no session. The route is behind the
// dashboard auth guard, but a page level check does not extend to a
// server action defined for it, so the caller is verified again here.
// Reading Part 3 content is licensed Toronto Academy material and the
// correct answers are part of the reply, so this check is what stands
// between a signed out request and the answer key.
//
// Deterministic and local to the mock content: the same answers always
// produce the same result, nothing is read from a database, and nothing
// is written anywhere.
export async function markReadingPartThree(
  answers: ReadingAnswerMap,
): Promise<ReadingMarkedPart | null> {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  return markReadingPart(readingPart3, sanitizeAnswers(answers));
}
