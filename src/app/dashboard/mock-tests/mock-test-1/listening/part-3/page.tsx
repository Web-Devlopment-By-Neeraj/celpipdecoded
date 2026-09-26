import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { AppPageShell } from "@/components/app/AppPageShell";
import { ListeningPartThreePrototype } from "@/components/exam/listening/ListeningPartThreePrototype";
import { examCopy } from "@/features/exam-engine/exam-copy";
import { withoutListeningAnswerKey } from "@/features/exam-engine/listening-flow";
import { listeningCopy } from "@/features/exam-engine/listening-copy";
import { listeningPart3 } from "@/features/exam-engine/mock-tests/mock-test-1/listening-part-3";
import { markListeningPartThree } from "./actions";

export const metadata: Metadata = {
  title: "Mock Test 1 Listening Part 3 prototype - CELPIP Decoded",
  description:
    "Internal prototype of Mock Test 1 Listening Part 3, Listening for Information.",
  robots: { index: false, follow: false },
};

// Mock Test 1 Listening Part 3 prototype (EXAM-07, closing screens added
// by EXAM-08).
//
// The twelve screen sequence for Listening Part 3: the part intro, the
// scenario, one conversation clip, six question screens, then the answer
// review, the practice score and the end of part screen.
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
// withoutListeningAnswerKey is the same precaution the Part 2 route
// takes, and for the same reason. Part 3 has a complete, confirmed answer
// key and the prototype is a client component, so handing it the content
// object whole would ship the answers to the browser where anyone could
// read them out of the flight data. The key is stripped here, on the
// server, before the content crosses the boundary.
//
// EXAM-08 kept that. The answer review and the practice score need the
// key, so they are worked out where the key is: markListeningPartThree in
// ./actions.ts runs the EXAM-04 scoring helpers on the server and returns
// the finished rows and summary. The prototype still holds the answers in
// local React state and still saves nothing. The key is the only thing
// that stays behind, and it stays behind in both directions.

export default async function ListeningPartThreePrototypePage() {
  const supabase = await createSupabaseServerClient();

  // The dashboard layout already checks the session, but layouts do not
  // re-render on client navigation, so the page verifies it again.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const learnerContent = withoutListeningAnswerKey(listeningPart3);

  return (
    <AppPageShell
      title={listeningCopy.part3PreviewTitle}
      eyebrow={examCopy.previewBadge}
      description={listeningCopy.part3PreviewSummary}
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
          official CELPIP score. Audio can be replayed, the timer does not count
          down yet, and Question 1 has no recording yet.
        </p>

        <ListeningPartThreePrototype
          content={learnerContent}
          markAnswers={markListeningPartThree}
        />
      </div>
    </AppPageShell>
  );
}
