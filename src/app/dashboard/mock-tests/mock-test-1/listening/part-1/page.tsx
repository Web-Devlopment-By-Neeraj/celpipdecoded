import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { AppPageShell } from "@/components/app/AppPageShell";
import { ListeningPartOnePrototype } from "@/components/exam/listening/ListeningPartOnePrototype";
import { examCopy } from "@/features/exam-engine/exam-copy";
import { withoutListeningAnswerKey } from "@/features/exam-engine/listening-flow";
import { listeningCopy } from "@/features/exam-engine/listening-copy";
import { listeningPart1 } from "@/features/exam-engine/mock-tests/mock-test-1/listening-part-1";
import { markListeningPartOne } from "./actions";

export const metadata: Metadata = {
  title: "Mock Test 1 Listening Part 1 prototype - CELPIP Decoded",
  description:
    "Internal prototype of Mock Test 1 Listening Part 1, Listening to Problem Solving.",
  robots: { index: false, follow: false },
};

// Mock Test 1 Listening Part 1 prototype (EXAM-03, closing screens from
// EXAM-04, answer key stripped by EXAM-15A).
//
// The first practice test screen built on real content rather than
// placeholder text. It runs the eighteen screen sequence for Listening
// Part 1: the part intro, the scenario, three conversation clips, eight
// question screens, two section breaks, then the answer review, the
// practice score, and the end of part screen.
//
// This is an internal route. It is no longer linked from the dashboard,
// which shows one card for the full Listening section instead, and it
// stays reachable by typing the URL so a single part can be checked
// during development. Answers are held in the browser for the length of
// the visit and nothing is saved. The standing notice above the frame
// says so, and the page carries robots noindex.
//
// The content is licensed Toronto Academy material and the clips are
// served from Cloudinary, so the route sits under /dashboard where the
// layout auth guard covers it, and the page verifies the session again
// close to the content. No API route, no service role, and no write.
//
// withoutListeningAnswerKey is the EXAM-15A fix, and it is the same
// precaution Parts 2 to 6 have taken since EXAM-05. When this route was
// built the Part 1 key was a list of pending entries with no correct
// option in it, so handing the content object whole to a client
// component leaked nothing. The key was transcribed afterwards, and from
// that point the page payload carried all eight correct option ids to
// the browser before a learner had answered anything. The key is now
// stripped here, on the server, before the content crosses the boundary.
//
// The marking that goes with that stripping lives in actions.ts beside
// this file, next to the key. The prototype still holds the answers in
// local React state and still saves nothing, and only the finished review
// rows and practice score come back. The key is the only thing that stays
// behind, and it stays behind in both directions.

export default async function ListeningPartOnePrototypePage() {
  const supabase = await createSupabaseServerClient();

  // The dashboard layout already checks the session, but layouts do not
  // re-render on client navigation, so the page verifies it again.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const learnerContent = withoutListeningAnswerKey(listeningPart1);

  return (
    <AppPageShell
      title={listeningCopy.previewTitle}
      eyebrow={examCopy.previewBadge}
      description={listeningCopy.previewSummary}
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

        <ListeningPartOnePrototype
          content={learnerContent}
          markAnswers={markListeningPartOne}
        />
      </div>
    </AppPageShell>
  );
}
