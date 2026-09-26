import { ListeningAnswerReviewTable } from "./ListeningAnswerReviewTable";
import {
  MockTestReviewPanel,
  MockTestReviewStack,
} from "../player/MockTestReviewPanel";
import { buildListeningReviewCopy } from "@/features/exam-engine/listening-review-copy";
import { formatListeningSectionAnswered } from "@/features/exam-engine/listening-section-copy";
import type { ListeningSectionPartResult } from "@/features/exam-engine/listening-section-types";

// The whole section answer review: six parts, 38 questions, one list.
//
// One block per part, in part order, each carrying that part's label and
// title, the count answered, and the part's own answer review table.
//
// **EXAM-UI-02 rebuilt the blocks on the shared player review panel.** A
// part used to be a heading rule with a table under it, which meant six
// headings and six tables ran into one another as a single unbroken
// column: the longest screen in the whole test, and the one where losing
// your place costs the most. The panel gives each part a bordered box and
// a tinted header strip carrying the label and the count, so a reader can
// see where one part ends and the next begins while scrolling past.
//
// The stack is capped and centred by the panel's own column, because a
// results table set on the full 1100 pixel width of the exam window is a
// table nobody can follow across a row.
//
// The tables are unpadded inside their panels: an answer review table
// draws its own rules to its own edges, and a padded body would inset them
// from the border that is already there.
//
// Nothing about marking, scoring or the review rows themselves is touched
// here. This component is handed finished rows and it lays them out.
//
// House style: normal hyphens only, no long hyphens or em dashes.

export type ListeningSectionReviewTableProps = {
  parts: ListeningSectionPartResult[];
};

export function ListeningSectionReviewTable({
  parts,
}: ListeningSectionReviewTableProps) {
  return (
    <MockTestReviewStack>
      {parts.map((part) => (
        <MockTestReviewPanel
          key={part.partNumber}
          title={`${part.partLabel} - ${part.partTitle}`}
          meta={formatListeningSectionAnswered(
            part.summary.answeredCount,
            part.summary.totalQuestions,
          )}
          padded={false}
        >
          <ListeningAnswerReviewTable
            rows={part.rows}
            copy={buildListeningReviewCopy({ partLabel: part.partLabel })}
          />
        </MockTestReviewPanel>
      ))}
    </MockTestReviewStack>
  );
}
