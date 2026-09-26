import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { ExamModeViewport } from "@/components/exam/ExamModeViewport";
import { ListeningSectionPrototype } from "@/components/exam/listening/ListeningSectionPrototype";
import { listeningCopy } from "@/features/exam-engine/listening-copy";
import { withoutListeningSectionAnswerKeys } from "@/features/exam-engine/listening-section-flow";
import { mockTest1ListeningSection } from "@/features/exam-engine/mock-tests/mock-test-1/full-listening-section";
import { markListeningSection } from "./actions";

export const metadata: Metadata = {
  title: "Mock Test 1 listening test - CELPIP Decoded",
  description:
    "The complete Mock Test 1 Listening test, Parts 1 to 6 in one run, with an answer review and a practice score at the end.",
  robots: { index: false, follow: false },
};

// Mock Test 1 Listening test (EXAM-15, exam mode added by EXAM-15B).
//
// The six Listening parts assembled into one complete run: the Listening
// instructions, the Listening instructional video, Parts 1 to 6 back to
// back with a short transition between them, then one answer review over
// all 38 questions, one practice score with the part breakdown, and the
// end of section screen.
//
// EXAM-15B turned this route into a test screen. It used to render inside
// AppPageShell, which gave it a breadcrumb trail, an INTERNAL PREVIEW
// eyebrow, a page heading, a description paragraph and a dashed preview
// notice above the exam frame, and the whole thing scrolled like an
// article. None of that belongs on a test a learner sits, so the page now
// renders nothing but the exam: ExamModeViewport covers the dashboard
// with a fixed, one viewport tall overlay and locks document scrolling,
// and the section flow fills it. See
// docs/product/full-listening-exam-mode-shell.md.
//
// The caveats the preview notice used to carry did not disappear with it.
// They are said where a learner meets them: the instruction screen notice
// says answers are held on the screen and nothing is saved, and the review
// and score screens say the result is a CELPIP Decoded practice result
// and not an official CELPIP score. No CELPIP level is shown anywhere.
//
// The six part level routes under this one are unchanged and still work
// from a typed URL. They remain the internal way to check a single part,
// they still show their own review and score, and they still look like
// internal routes. This one does not: inside the full test a part hands
// straight over to the next, and the only result appears at the end.
//
// Answers are held in the browser for the length of the visit and nothing
// is saved, to a database, to localStorage or to a cookie. The page
// carries robots noindex.
//
// The content is licensed Toronto Academy material and the clips are
// served from Cloudinary, so the route sits under /dashboard where the
// layout auth guard covers it, and the page verifies the session again
// close to the content. No API route, no service role, and no write.
//
// withoutListeningSectionAnswerKeys is the same precaution the Part 2 to
// Part 6 routes take, applied to all six parts at once, and for the same
// reason. Every Listening part has a complete, confirmed answer key and
// the prototype is a client component, so handing it the content whole
// would ship 38 answers to the browser where anyone could read them out of
// the flight data. The keys are stripped here, on the server, before the
// content crosses the boundary.
//
// The marking that goes with that stripping lives in actions.ts beside
// this file, next to the keys, the way markListeningPartSix does for Part
// 6. The learner's answers stay in local React state in the browser and
// only the finished review rows and practice score come back.

export default async function MockTest1ListeningSectionPage() {
  const supabase = await createSupabaseServerClient();

  // The dashboard layout already checks the session, but layouts do not
  // re-render on client navigation, so the page verifies it again.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const learnerContent = withoutListeningSectionAnswerKeys(
    mockTest1ListeningSection,
  );

  return (
    <ExamModeViewport label={listeningCopy.fullSectionCardTitle}>
      <ListeningSectionPrototype
        content={learnerContent}
        markAnswers={markListeningSection}
      />
    </ExamModeViewport>
  );
}
