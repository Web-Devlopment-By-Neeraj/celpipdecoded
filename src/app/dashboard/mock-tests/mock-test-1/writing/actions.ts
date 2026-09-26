"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { evaluateWritingMockSection } from "@/features/exam-engine/evaluate-writing-mock-test";
import { mockTest1WritingSection } from "@/features/exam-engine/mock-tests/mock-test-1/writing-section";
import { writingMockCopy } from "@/features/exam-engine/writing-mock-copy";
import type {
  WritingMockEvaluationInput,
  WritingMockEvaluationOutcome,
} from "@/features/exam-engine/writing-mock-evaluation-types";

// AI review for the Mock Test 1 Writing section (EXAM-26).
//
// EXAM-25 shipped this route with no actions.ts at all, and the note at
// the top of page.tsx said why: Writing has no answer key, so there was
// nothing to mark and nothing that had to be marked where the keys live.
// This ticket gives the route a reason to have one, and it is a different
// reason from the Listening and Reading actions beside it.
//
// Those two exist to keep answer keys off the client. This one exists to
// keep a secret off the client. The review needs OPENAI_API_KEY and
// OPENAI_WRITING_MODEL, and the only safe place for either is a server
// process, so the two responses cross to the server, the call is made
// there, and a validated result crosses back. No API key, no model name
// and no prompt ever reaches the browser.
//
// What crosses in each direction:
//
//   client to server   two response strings, and nothing else
//   server to client   an estimated level, per task feedback, criterion
//                      levels, corrections, two rewrites and a fixed
//                      practice disclaimer
//
// The Writing prompts, requirements, word targets and task ids are not
// sent by the browser and are not accepted from it. They are read here
// from mockTest1WritingSection, so nothing a caller sends can change
// which prompt a response is judged against.
//
// No database write, no Supabase migration, no attempt row, and no
// persistence of any kind. The Supabase client here is used for one
// thing: reading the caller's session. The review is returned to the
// screen that asked for it and is not stored anywhere.
//
// House style: normal hyphens only, no long hyphens or em dashes.

// Review a Mock Test 1 Writing attempt and return the practice estimate.
//
// Takes the two typed responses, task 1 then task 2, which is the whole
// input. Returns a discriminated outcome rather than throwing, because an
// error thrown inside a server action reaches the client as an opaque
// digest and the error screen would have nothing to say.
//
// Empty responses are normal input rather than an error. One blank task
// comes back as a structured insufficient-response card beside a real
// review of the other, and two blank tasks come back as a structured
// no-response result with no AI call made at all. Neither crashes and
// neither invents a level.
//
// The session is checked here even though the route sits behind the
// dashboard layout auth guard, because a page level check does not extend
// to a server action defined for it and an action is reachable by direct
// POST. Without this check, an unauthenticated request could spend an
// OpenAI call.
export async function evaluateWritingMockTest(
  input: WritingMockEvaluationInput,
): Promise<WritingMockEvaluationOutcome> {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      ok: false,
      code: "unauthenticated",
      message: writingMockCopy.reviewFailedText,
    };
  }

  return evaluateWritingMockSection(mockTest1WritingSection, input);
}
