import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { ExamModeViewport } from "@/components/exam/ExamModeViewport";
import { WritingSectionPrototype } from "@/components/exam/writing/WritingSectionPrototype";
import { writingMockCopy } from "@/features/exam-engine/writing-mock-copy";
import { mockTest1WritingSection } from "@/features/exam-engine/mock-tests/mock-test-1/writing-section";
import { evaluateWritingMockTest } from "./actions";

export const metadata: Metadata = {
  title: writingMockCopy.pageTitle,
  description: writingMockCopy.pageDescription,
  robots: { index: false, follow: false },
};

// Mock Test 1 Writing test (EXAM-25, extended by EXAM-26).
//
// The Writing section as one run: the section instructions, Task 1 with
// its email prompt and editor, a short transition, Task 2 with its survey
// prompt, its two positions and its editor, and a completion screen
// reporting the two word counts and offering the AI review.
//
// This route runs in exam mode. It is listed in
// src/features/navigation/exam-mode-routes.ts, so the dashboard shell
// does not render its sidebar, header, breadcrumb trail or footer here,
// and ExamModeViewport gives the frame a fixed, one window tall viewport
// with document scrolling switched off. That is what the ticket's visual
// requirements ask for: a neutral exam background, no dashboard chrome,
// no internal preview label on the exam surface, a fixed top bar, fixed
// bottom navigation, and internal scrolling confined to the situation
// column.
//
// Because the exam surface carries no preview label, the caveats are said
// where a learner meets them. The section intro notice says the writing
// is held on the screen and that the review is a practice estimate rather
// than an official CELPIP score, the editor hint says the writing is not
// saved and that sending it for review is a choice made at the end, and
// the result screen carries the practice disclaimer directly under the
// estimated level.
//
// What this route does not do, and this is the shape of the ticket rather
// than an omission:
//
// - it writes nothing. No attempt row, no migration, no Supabase write
//   and no usage event. The responses live in React state in the browser
//   for the length of the visit, and so does the review that comes back
// - it produces no official result. The estimate is a CELPIP Decoded
//   practice estimate produced by AI-supported feedback, and every screen
//   that shows it says so
// - it does not touch the standalone Writing Practice evaluator. That
//   pipeline has its own prompt, its own schema and its own database
//   writes, none of which are imported, modified or reused here
//
// EXAM-26 added actions.ts beside this file, which EXAM-25 deliberately
// did not have. Its reason is different from the Listening and Reading
// actions next door: those exist to keep answer keys off the client, and
// Writing has no key. This one exists to keep OPENAI_API_KEY and
// OPENAI_WRITING_MODEL off the client. The two responses cross to the
// server, the model call is made there, and a validated review crosses
// back. No key, no model name and no prompt reaches the browser.
//
// The content is licensed Toronto Academy material, so the route sits
// under /dashboard where the layout auth guard covers it, and the page
// verifies the session again close to the content. The server action
// verifies it a third time, because a page level check does not extend to
// an action and an action is reachable by direct POST. No API route, no
// service role, and no write. The page carries robots noindex.

export default async function MockTest1WritingSectionPage() {
  const supabase = await createSupabaseServerClient();

  // The dashboard layout already checks the session, but layouts do not
  // re-render on client navigation, so the page verifies it again.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // The content is handed over whole. There is no
  // withoutWritingAnswerKeys step to match the Reading route's, because a
  // Writing task has no answer key: nothing in this content object is
  // something a learner could be given an unfair advantage by reading.
  return (
    <ExamModeViewport label={writingMockCopy.examRegionLabel}>
      <WritingSectionPrototype
        content={mockTest1WritingSection}
        // evaluateWritingMockTest, in actions.ts beside this file, is
        // where the OpenAI call happens. Passing the action rather than
        // importing it inside the component keeps the component
        // renderable without a server behind it.
        evaluateResponses={evaluateWritingMockTest}
      />
    </ExamModeViewport>
  );
}
