import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { ExamModeViewport } from "@/components/exam/ExamModeViewport";
import { ReadingPartFourPrototype } from "@/components/exam/reading/ReadingPartFourPrototype";
import { readingCopy } from "@/features/exam-engine/reading-copy";
import { withoutReadingAnswerKey } from "@/features/exam-engine/reading-flow";
import { readingPart4 } from "@/features/exam-engine/mock-tests/mock-test-1/reading-part-4";
import { markReadingPartFour } from "./actions";

export const metadata: Metadata = {
  title: readingCopy.part4PageTitle,
  description: readingCopy.part4PageDescription,
  robots: { index: false, follow: false },
};

// Mock Test 1 Reading Part 4 prototype (EXAM-22, marking and closing
// screens added by EXAM-23).
//
// The four screen sequence for Reading Part 4: the part intro, the split
// screen holding the website article and all 10 questions, the practice
// score, and the answer review opened from it. EXAM-22 stopped at a
// completion screen; this route now goes as far as the Reading Part 1,
// Part 2 and Part 3 routes beside it.
//
// This route runs in exam mode. It is listed in
// src/features/navigation/exam-mode-routes.ts, so the dashboard shell
// does not render its sidebar, header, breadcrumb trail or footer here,
// and ExamModeViewport gives the frame a fixed, one window tall viewport
// with document scrolling switched off. That is what the ticket's visual
// requirements ask for: a neutral exam background, a fixed top bar, fixed
// bottom navigation, and internal scrolling confined to the article
// column and the question column.
//
// It joins Reading Parts 1, 2 and 3 as an exam mode route for the same
// reason, and with one of its own. A Reading part is a split screen with
// a scrolling passage on one side and a scrolling question column on the
// other, and that screen cannot be judged, or used, inside the dashboard
// content column. Part 4 is the longest of the four: a five paragraph
// article on the left, and on the right five sentence stems plus a reader
// comment with five more blanks in it. Both columns have to scroll on
// their own for the part to be answerable at all.
//
// Because the exam surface carries no preview label, the caveats are said
// where a learner meets them. The part intro screen's notice says answers
// are held on the screen and nothing is saved, and the score screen and
// the answer review both repeat it. The result is named a CELPIP Decoded
// practice score everywhere it appears, and no CELPIP level and no
// estimated Reading band is shown. A band is a reading of the whole
// section and this is one part of four, so there is nothing honest to
// show yet.
//
// The route is not in navigation. It has one link, an Internal preview
// card in the Mock tests section of the dashboard, beside the Part 1,
// Part 2 and Part 3 cards, because an exam mode route carries no preview
// label of its own and pasting the URL was otherwise the only way in. The
// student facing Mock Test 1 card is untouched and still offers Listening
// only. Nothing anywhere offers a Reading test.
//
// The content is licensed Toronto Academy material, so the route sits
// under /dashboard where the layout auth guard covers it, and the page
// verifies the session again close to the content. No API route, no
// service role, and no write. Answers are held in the browser for the
// length of the visit and nothing is saved, to a database, to
// localStorage or to a cookie. The page carries robots noindex.
//
// withoutReadingAnswerKey is the same precaution the Reading Part 1, Part
// 2 and Part 3 routes and every Listening route take, and for the same
// reason. Reading Part 4 has a complete answer key printed in the source
// document and the prototype is a client component, so handing it the
// content object whole would ship 10 answers to the browser where anyone
// could read them out of the flight data. The key is stripped here, on
// the server, before the content crosses the boundary.
//
// markReadingPartFour, in actions.ts beside this file, is where the key
// is read, the way markReadingPartOne, markReadingPartTwo and
// markReadingPartThree read theirs. The prototype holds the learner's
// answers in local state and sends them to the action, and the action
// returns finished review rows and a practice score. So the key crosses
// the boundary in neither direction: not down with the content, and not
// back up inside a result. Nothing is saved, there is no attempt row and
// there is no migration.

export default async function MockTest1ReadingPartFourPage() {
  const supabase = await createSupabaseServerClient();

  // The dashboard layout already checks the session, but layouts do not
  // re-render on client navigation, so the page verifies it again.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const learnerContent = withoutReadingAnswerKey(readingPart4);

  return (
    <ExamModeViewport label={readingCopy.part4ExamRegionLabel}>
      <ReadingPartFourPrototype
        content={learnerContent}
        markAnswers={markReadingPartFour}
      />
    </ExamModeViewport>
  );
}
