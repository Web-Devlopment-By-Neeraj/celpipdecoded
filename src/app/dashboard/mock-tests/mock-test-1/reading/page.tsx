import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { ExamModeViewport } from "@/components/exam/ExamModeViewport";
import { ReadingSectionPrototype } from "@/components/exam/reading/ReadingSectionPrototype";
import { readingSectionCopy } from "@/features/exam-engine/reading-copy";
import { withoutReadingSectionAnswerKeys } from "@/features/exam-engine/reading-section-flow";
import { mockTest1ReadingSection } from "@/features/exam-engine/mock-tests/mock-test-1/reading-section";
import { markReadingSection } from "./actions";

export const metadata: Metadata = {
  title: readingSectionCopy.pageTitle,
  description: readingSectionCopy.pageDescription,
  robots: { index: false, follow: false },
};

// Mock Test 1 Reading test (EXAM-24).
//
// The four Reading parts assembled into one complete run: the Reading
// section instructions, Parts 1 to 4 back to back with a short transition
// between them, then one practice score over the whole section with the
// part breakdown and the estimated Reading band, and one answer review
// opened from it.
//
// This route runs in exam mode. It is listed in
// src/features/navigation/exam-mode-routes.ts, so the dashboard shell
// does not render its sidebar, header, breadcrumb trail or footer here,
// and ExamModeViewport gives the frame a fixed, one window tall viewport
// with document scrolling switched off. That is what the ticket's visual
// requirements ask for: a neutral exam background, no dashboard chrome,
// no internal preview label on the exam surface, a fixed top bar, fixed
// bottom navigation, and internal scrolling confined to the passage
// column, the question column and the review list.
//
// The four part level routes under this one are unchanged and still work.
// They remain the internal way to check a single part, they still show
// their own part level review and score, and they still show no estimated
// band, because a band is a reading of the whole section and one part is
// not a section. This route is the only place a band appears.
//
// Because the exam surface carries no preview label, the caveats are said
// where a learner meets them. The section intro notice says answers are
// held on the screen and nothing is saved, the score screen names the
// result a CELPIP Decoded practice score and the band a practice
// estimate, and the review repeats that nothing is saved and no
// explanations are written.
//
// The route is not in the main navigation. It has one link, an internal
// preview card in the Mock tests section of the dashboard, beside the
// four Reading part cards and the Listening test card. Nothing anywhere
// claims that a full all-skills Mock Test 1 exists: two sections of four
// are built.
//
// The content is licensed Toronto Academy material, so the route sits
// under /dashboard where the layout auth guard covers it, and the page
// verifies the session again close to the content. No API route, no
// service role, and no write. Answers are held in the browser for the
// length of the visit and nothing is saved, to a database, to
// localStorage or to a cookie. The page carries robots noindex.
//
// withoutReadingSectionAnswerKeys is the same precaution the four Reading
// part routes take, applied to all four parts at once, and for the same
// reason. Every Reading part has a complete answer key printed in the
// source document and the prototype is a client component, so handing it
// the content whole would ship the whole section's answers to the browser
// where anyone could read them out of the flight data. The keys are
// stripped here, on the server, before the content crosses the boundary.
//
// markReadingSection, in actions.ts beside this file, is where the keys
// are read, the way the four part actions read theirs. The prototype
// holds the learner's answers in local state and sends them to the
// action, and the action returns finished review rows, a practice score
// and an estimated band. So the keys cross the boundary in neither
// direction: not down with the content, and not back up inside a result.
// Nothing is saved, there is no attempt row and there is no migration.

export default async function MockTest1ReadingSectionPage() {
  const supabase = await createSupabaseServerClient();

  // The dashboard layout already checks the session, but layouts do not
  // re-render on client navigation, so the page verifies it again.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const learnerContent = withoutReadingSectionAnswerKeys(
    mockTest1ReadingSection,
  );

  return (
    <ExamModeViewport label={readingSectionCopy.examRegionLabel}>
      <ReadingSectionPrototype
        content={learnerContent}
        markAnswers={markReadingSection}
      />
    </ExamModeViewport>
  );
}
