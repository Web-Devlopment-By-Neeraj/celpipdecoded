import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { AppPageShell } from "@/components/app/AppPageShell";
import { ListeningPartFourPrototype } from "@/components/exam/listening/ListeningPartFourPrototype";
import { examCopy } from "@/features/exam-engine/exam-copy";
import { withoutListeningDropdownAnswerKey } from "@/features/exam-engine/listening-dropdown-flow";
import { listeningCopy } from "@/features/exam-engine/listening-copy";
import { listeningPart4 } from "@/features/exam-engine/mock-tests/mock-test-1/listening-part-4";
import { markListeningPartFour } from "./actions";

export const metadata: Metadata = {
  title: "Mock Test 1 Listening Part 4 prototype - CELPIP Decoded",
  description:
    "Internal prototype of Mock Test 1 Listening Part 4, Listening to a News Item.",
  robots: { index: false, follow: false },
};

// Mock Test 1 Listening Part 4 prototype (EXAM-09, closing screens added
// by EXAM-10).
//
// The seven screen sequence for Listening Part 4: the part intro, the
// scenario, the news item clip, one screen holding all five dropdown
// completion questions, the answer review, the practice score, and the
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
// withoutListeningDropdownAnswerKey is the same precaution the Part 2 and
// Part 3 routes take, and for the same reason. Part 4 has a complete,
// confirmed answer key and the prototype is a client component, so
// handing it the content object whole would ship the answers to the
// browser where anyone could read them out of the flight data. The key is
// stripped here, on the server, before the content crosses the boundary.
//
// The marking that goes with that stripping now lives in actions.ts
// beside this file, next to the key, the way markListeningPartThree does
// for Part 3. The learner's answers stay in local React state in the
// browser and only the finished review rows and practice score come back.

export default async function ListeningPartFourPrototypePage() {
  const supabase = await createSupabaseServerClient();

  // The dashboard layout already checks the session, but layouts do not
  // re-render on client navigation, so the page verifies it again.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const learnerContent = withoutListeningDropdownAnswerKey(listeningPart4);

  return (
    <AppPageShell
      title={listeningCopy.part4PreviewTitle}
      eyebrow={examCopy.previewBadge}
      description={listeningCopy.part4PreviewSummary}
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
          official CELPIP score. The news item can be replayed even though the
          instructions say it is heard once, and the timer does not count down
          yet.
        </p>

        <ListeningPartFourPrototype
          content={learnerContent}
          markAnswers={markListeningPartFour}
        />
      </div>
    </AppPageShell>
  );
}
