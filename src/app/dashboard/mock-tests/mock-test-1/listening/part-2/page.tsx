import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { AppPageShell } from "@/components/app/AppPageShell";
import { ListeningPartTwoPrototype } from "@/components/exam/listening/ListeningPartTwoPrototype";
import { examCopy } from "@/features/exam-engine/exam-copy";
import { withoutListeningAnswerKey } from "@/features/exam-engine/listening-flow";
import { listeningCopy } from "@/features/exam-engine/listening-copy";
import { listeningPart2 } from "@/features/exam-engine/mock-tests/mock-test-1/listening-part-2";
import { markListeningPartTwo } from "./actions";

export const metadata: Metadata = {
  title: "Mock Test 1 Listening Part 2 prototype - CELPIP Decoded",
  description:
    "Internal prototype of Mock Test 1 Listening Part 2, Listening to a Daily Life Conversation.",
  robots: { index: false, follow: false },
};

// Mock Test 1 Listening Part 2 prototype (EXAM-05, closing screens added
// by EXAM-06).
//
// The eleven screen sequence for Listening Part 2: the part intro, the
// scenario, one telephone conversation clip, five question screens, then
// the answer review, the practice score and the end of part screen.
//
// This is an internal preview. Answers are held in the browser for the
// length of the visit and nothing is saved. The standing notice above the
// frame says so, and the page carries robots noindex.
//
// The content is licensed Toronto Academy material and the clips are
// served from Cloudinary, so the route sits under /dashboard where the
// layout auth guard covers it, and the page verifies the session again
// close to the content. No API route, no service role, and no write.
//
// One difference from the Part 1 route, and it is the important one.
// Part 2 has a complete, confirmed answer key, and the prototype is a
// client component, so handing it the content object whole would ship the
// answers to the browser where anyone could read them out of the flight
// data. withoutListeningAnswerKey strips the key here, on the server,
// before the content crosses the boundary.
//
// EXAM-06 kept that. The answer review and the practice score need the
// key, so they are worked out where the key is: markListeningPartTwo in
// ./actions.ts runs the EXAM-04 scoring helpers on the server and returns
// the finished rows and summary. The prototype still holds the answers in
// local React state and still saves nothing. The key is the only thing
// that stays behind, and it stays behind in both directions.
//
// Part 1 did not do any of this for several tickets, because its key was
// untranscribed when it was built and there was nothing to leak. Once the
// key landed, the same reasoning applied to it and it was still shipping
// the key to the browser. EXAM-15A moved it across, so all six parts now
// strip on the server and mark on the server.

export default async function ListeningPartTwoPrototypePage() {
  const supabase = await createSupabaseServerClient();

  // The dashboard layout already checks the session, but layouts do not
  // re-render on client navigation, so the page verifies it again.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const learnerContent = withoutListeningAnswerKey(listeningPart2);

  return (
    <AppPageShell
      title={listeningCopy.part2PreviewTitle}
      eyebrow={examCopy.previewBadge}
      description={listeningCopy.part2PreviewSummary}
    >
      <div className="space-y-6">
        {/* Standing notice, so the page is unmistakable even to someone
            who lands on it from a shared link. */}
        <p className="rounded-md border border-dashed border-academy-navy/30 bg-academy-navy-soft/40 px-4 py-3 text-sm leading-6 text-academy-navy/80">
          <span className="font-semibold text-academy-navy">
            {examCopy.previewBadge}:
          </span>{" "}
          this is a CELPIP Decoded practice prototype, not the official CELPIP
          test. Your answers stay on this page and nothing is saved. The answer
          review and the practice score run for this visit only and are not an
          official CELPIP score. Audio can be replayed and the timer does not
          count down yet.
        </p>

        <ListeningPartTwoPrototype
          content={learnerContent}
          markAnswers={markListeningPartTwo}
        />
      </div>
    </AppPageShell>
  );
}
