import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { ExamModeViewport } from "@/components/exam/ExamModeViewport";
import { SpeakingSectionPrototype } from "@/components/exam/speaking/SpeakingSectionPrototype";
import { speakingMockCopy } from "@/features/exam-engine/speaking-mock-copy";
import { mockTest1SpeakingSection } from "@/features/exam-engine/mock-tests/mock-test-1/speaking-section";

export const metadata: Metadata = {
  title: speakingMockCopy.pageTitle,
  description: speakingMockCopy.pageDescription,
  robots: { index: false, follow: false },
};

// Mock Test 1 Speaking test (EXAM-27, extended by EXAM-28).
//
// The Speaking section as one run: the section instructions, eight task
// screens with their prompts, pictures, preparation countdown, recording
// countdown and browser recorder, a short transition before each task
// after the first, and a completion screen reporting which tasks were
// recorded and offering the AI review.
//
// This route runs in exam mode. It is listed in
// src/features/navigation/exam-mode-routes.ts, so the dashboard shell
// does not render its sidebar, header, breadcrumb trail or footer here,
// and ExamModeViewport gives the frame a fixed, one window tall viewport
// with document scrolling switched off. That is what the ticket's visual
// requirements ask for: a neutral exam background, no dashboard chrome,
// no internal preview label on the exam surface, a fixed top bar, fixed
// bottom navigation, and internal scrolling confined to the prompt
// column.
//
// Because the exam surface carries no preview label, the caveats are said
// where a learner meets them. The section intro notice says the review is
// a practice estimate rather than an official CELPIP score and that
// nothing is saved, the line under every recorder says the audio stays in
// the browser tab until the learner chooses to send it, the hint under
// Submit for AI Review says exactly what leaves the page, and the result
// screen carries the practice disclaimer and the audio assessment note
// directly under the estimated level.
//
// There is deliberately no actions.ts beside this file, and its absence
// is a decision rather than an omission. EXAM-28 needed a server, and it
// got an API route instead:
//
//   src/app/api/mock-tests/mock-test-1/speaking/evaluate/route.ts
//
// A Next.js server action posts its arguments with a body size limit
// that defaults to 1 MB, and a Speaking submission is up to eight audio
// recordings at once. An action would fail on a complete attempt and
// succeed on a partial one, which is the worst of the two behaviours, so
// the audio goes to a route handler as FormData. The route's own header
// note sets out the guards it does at the door in exchange for being a
// public URL. The Writing route keeps its server action, which is right
// for it: its whole input is two strings.
//
// What this route still does not do:
//
// - it writes nothing. No attempt row, no migration, no Supabase write
//   and no usage event. The recordings and the review that comes back
//   live in React state in the browser for the length of the visit
// - it stores no audio. A recording crosses to the server once, for the
//   length of one review request, and is released when that request
//   ends. No Supabase Storage bucket is touched and no file is written
// - it produces no official result. The estimate is a CELPIP Decoded
//   practice estimate produced by AI-supported feedback from a
//   transcription of the recordings, and every screen that shows it says
//   so
// - it does not touch the standalone Speaking Practice pipeline. That
//   flow has its own recorder, its own upload, its own transcription and
//   its own scoring prompt, none of which are imported or modified here.
//   The only thing shared with it is the pure feature detection and mime
//   type helpers in src/features/speaking/audio-utils.ts, which are read
//   and not edited
//
// The content is licensed Toronto Academy material, so the route sits
// under /dashboard where the layout auth guard covers it, and the page
// verifies the session again close to the content. The API route
// verifies it a third time, because a page level check does not extend
// to an endpoint outside the dashboard tree and that endpoint is
// reachable by direct POST. Without that check, an unauthenticated
// request could spend a transcription call. No service role, and no
// write. The page carries robots noindex.

export default async function MockTest1SpeakingSectionPage() {
  const supabase = await createSupabaseServerClient();

  // The dashboard layout already checks the session, but layouts do not
  // re-render on client navigation, so the page verifies it again.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // The content is handed over whole. There is no answer key stripping
  // step to match the Reading route's, because a Speaking task has no
  // answer key: nothing in this content object is something a learner
  // could be given an unfair advantage by reading.
  return (
    <ExamModeViewport label={speakingMockCopy.examRegionLabel}>
      <SpeakingSectionPrototype content={mockTest1SpeakingSection} />
    </ExamModeViewport>
  );
}
