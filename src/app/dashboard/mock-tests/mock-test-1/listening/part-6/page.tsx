import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { AppPageShell } from "@/components/app/AppPageShell";
import { ListeningPartSixPrototype } from "@/components/exam/listening/ListeningPartSixPrototype";
import { examCopy } from "@/features/exam-engine/exam-copy";
import { listeningCopy } from "@/features/exam-engine/listening-copy";
import { withoutListeningViewpointsAnswerKey } from "@/features/exam-engine/listening-viewpoints-flow";
import { listeningPart6 } from "@/features/exam-engine/mock-tests/mock-test-1/listening-part-6";
import { markListeningPartSix } from "./actions";

export const metadata: Metadata = {
  title: "Mock Test 1 Listening Part 6 prototype - CELPIP Decoded",
  description:
    "Internal prototype of Mock Test 1 Listening Part 6, Listening for Viewpoints.",
  robots: { index: false, follow: false },
};

// Mock Test 1 Listening Part 6 prototype (EXAM-13, closing screens added
// by EXAM-14).
//
// The seven screen sequence for Listening Part 6: the part intro, the
// scenario, the community development report audio, one screen holding all
// six viewpoints questions, the answer review, the practice score, and the
// end of part screen.
//
// This is an internal preview. Answers are held in the browser for the
// length of the visit and nothing is saved. The standing notice above the
// frame says so, and the page carries robots noindex.
//
// The content is licensed Toronto Academy material and the clip is served
// from Cloudinary, so the route sits under /dashboard where the layout
// auth guard covers it, and the page verifies the session again close to
// the content. No API route, no service role, and no write.
//
// withoutListeningViewpointsAnswerKey is the same precaution the Part 2 to
// Part 5 routes take, and for the same reason. Part 6 has a complete,
// confirmed answer key and the prototype is a client component, so handing
// it the content object whole would ship the answers to the browser where
// anyone could read them out of the flight data. The key is stripped here,
// on the server, before the content crosses the boundary.
//
// The marking that goes with that stripping lives in actions.ts beside
// this file, next to the key, the way markListeningPartFive does for Part
// 5. The learner's answers stay in local React state in the browser and
// only the finished review rows and practice score come back.

export default async function ListeningPartSixPrototypePage() {
  const supabase = await createSupabaseServerClient();

  // The dashboard layout already checks the session, but layouts do not
  // re-render on client navigation, so the page verifies it again.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const learnerContent = withoutListeningViewpointsAnswerKey(listeningPart6);

  return (
    <AppPageShell
      title={listeningCopy.part6PreviewTitle}
      eyebrow={examCopy.previewBadge}
      description={listeningCopy.part6PreviewSummary}
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
          official CELPIP score. The report can be replayed and Next does not
          wait for it to finish, and the timer does not count down yet.
        </p>

        <ListeningPartSixPrototype
          content={learnerContent}
          markAnswers={markListeningPartSix}
        />
      </div>
    </AppPageShell>
  );
}
