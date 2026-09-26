import type { ReactNode } from "react";
import { MockTestSplitPane } from "../player/MockTestSplitPane";
import { readingCopy } from "@/features/exam-engine/reading-copy";
import type { ExamPanelScroll } from "@/features/exam-engine/exam-shell-types";

// The Reading split screen: the passage on the left, the questions on the
// right.
//
// Every Reading screen that shows a passage and a question set together
// renders this rather than reaching for the split directly, so the column
// labels, the tones and the scroll behaviour are decided once for the
// whole section.
//
// **EXAM-UI-02 changed how the two columns scroll.** They used to carry a
// fixed maximum height, 28rem each, which is a number that was right on
// exactly one screen size. On a 1366 by 768 laptop it left the columns
// scrolling inside a window that had spare room under them, and on a tall
// monitor it left a band of empty white below both. Worse, the passage and
// the questions scrolled to different depths than the pane they sat in, so
// a learner could be scrolling the wrong thing.
//
// Fill mode replaces it. From the large breakpoint up the split takes the
// height of the content pane and each column hands its scrollbar to its
// own body, so the passage and the question list scroll past each other
// independently, both column labels stay pinned, and the bottom bar never
// moves. Below that breakpoint the split stacks and the pane scrolls
// normally, because two short scroll boxes stacked on a phone is a worse
// screen than one page that scrolls.
//
// The passageScroll and questionsScroll props are kept for a caller that
// turns fill off, which is what the internal part routes want: there the
// frame sits inside the dashboard content column with no window height to
// fill, so a fixed height is the only thing that can bound a column.

export type ReadingTwoColumnLayoutProps = {
  passage: ReactNode;
  questions: ReactNode;
  passageLabel?: string;
  questionsLabel?: string;
  // Used when fill is false, or below the large breakpoint.
  passageScroll?: ExamPanelScroll;
  questionsScroll?: ExamPanelScroll;
  // Give each column the height of the content pane and its own
  // scrollbar. On by default: every full section screen wants it.
  fill?: boolean;
  className?: string;
};

export function ReadingTwoColumnLayout({
  passage,
  questions,
  passageLabel = readingCopy.passageColumnLabel,
  questionsLabel = readingCopy.questionsColumnLabel,
  passageScroll = "tall",
  questionsScroll = "tall",
  fill = true,
  className,
}: ReadingTwoColumnLayoutProps) {
  return (
    <MockTestSplitPane
      left={passage}
      right={questions}
      leftLabel={passageLabel}
      rightLabel={questionsLabel}
      leftScroll={passageScroll}
      rightScroll={questionsScroll}
      fill={fill}
      bordered={false}
      className={className}
    />
  );
}
