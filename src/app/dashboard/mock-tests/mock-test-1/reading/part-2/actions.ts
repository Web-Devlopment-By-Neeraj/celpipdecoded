"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { markReadingPart } from "@/features/exam-engine/reading-score";
import { readingReviewCopy } from "@/features/exam-engine/reading-copy";
import { listReadingQuestions } from "@/features/exam-engine/reading-flow";
import { readingPart2 } from "@/features/exam-engine/mock-tests/mock-test-1/reading-part-2";
import type {
  ReadingAnswerMap,
  ReadingMarkedPart,
} from "@/features/exam-engine/reading-types";

// Marking for Mock Test 1 Reading Part 2 (EXAM-19).
//
// The Reading Part 1 action beside it, pointed at Part 2 content. The
// reasoning is restated here rather than cross referenced, because the
// reasoning is the only thing keeping the answer key off the page.
//
// Reading Part 2 has a complete, confirmed answer key printed in the
// source document. EXAM-18 stripped it on the server with
// withoutReadingAnswerKey before the content reached the browser, because
// a client component receives its props as serialized data and a key sent
// that way is readable in the page payload before a learner has answered
// anything. reading-flow.ts records the consequence next to that helper:
// a screen that marks answers has to do the comparison where the key
// lives. This is that comparison, and it is the piece EXAM-18 said the
// next ticket would add.
//
// So the learner's answers stay in local React state, exactly as the
// EXAM-18 prototype held them, and only the finished result crosses back:
// review rows carrying the correct option for questions they have now
// finished, and a practice score summary. The key itself is never
// serialized to the client in either direction, and readingPart2 is
// imported here rather than passed in, so nothing the browser sends can
// influence which key an answer is marked against.
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
// learner one row instead of the entire result. A discarded answer is
// marked as a blank, which is the honest reading of "we cannot tell what
// was chosen".
function sanitizeAnswers(answers: unknown): ReadingAnswerMap {
  const clean: Record<string, string> = {};

  if (!answers || typeof answers !== "object") {
    return clean;
  }

  const submitted = answers as Record<string, unknown>;

  listReadingQuestions(readingPart2).forEach((question) => {
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

// Mark a Reading Part 2 attempt and return what the closing screens need.
//
// Takes the answer map the prototype holds, { questionId: optionId }, and
// returns the review rows and the practice score summary counted from
// them. A question the map does not mention is a blank: it does not block
// the finish, it counts as incorrect, and its row still shows the correct
// answer.
//
// The blankQuestionText option is the one thing that differs from Part 1.
// Questions 1 to 5 print no stem of their own because the sentence each
// completes is in the email on the right, so the review names the blank
// instead of inventing a sentence the source does not have. Part 1 says
// "written response" for the same reason; Part 2 says email, because that
// is what a learner is looking at.
//
// Returns null when there is no session. The route is behind the
// dashboard auth guard, but a page level check does not extend to a
// server action defined for it, so the caller is verified again here.
// Reading Part 2 content is licensed Toronto Academy material and the
// correct answers are part of the reply, so this check is what stands
// between a signed out request and the answer key.
//
// Deterministic and local to the mock content: the same answers always
// produce the same result, nothing is read from a database, and nothing
// is written anywhere.
export async function markReadingPartTwo(
  answers: ReadingAnswerMap,
): Promise<ReadingMarkedPart | null> {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  return markReadingPart(readingPart2, sanitizeAnswers(answers), {
    blankQuestionText: readingReviewCopy.emailBlankQuestionText,
  });
}
