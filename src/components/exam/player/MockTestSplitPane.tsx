import type { ReactNode } from "react";
import { cx } from "@/features/design/design-tokens";
import {
  playerColumnTones,
  playerScrollHeights,
  playerSplit,
} from "@/features/exam-engine/mock-test-player-theme";
import type {
  ExamPanelScroll,
  ExamPanelTone,
} from "@/features/exam-engine/exam-shell-types";

// The two column work area: source material left, answers right
// (EXAM-UI-02).
//
// Reading uses it for a passage and its questions, Writing for a situation
// and the editor, Speaking for a prompt and the recorder.
//
// **Scrolling is the whole point of this component.** The brief asks for
// each side to scroll on its own, and fill mode is what delivers it: the
// grid takes the height of the content pane, both cells are min-h-0 flex
// columns, and each cell hands its scrollbar to its own body. So a four
// paragraph letter and a ten question list scroll past each other
// independently, the column labels stay pinned at the top of their side,
// and neither one can move the bars.
//
// Fill mode is a large breakpoint rule only. Below it the split stacks and
// both columns scroll with the pane, because two short scroll boxes
// stacked on a phone is a worse screen than one page that scrolls.
//
// Without fill mode the columns fall back to the fixed scroll heights,
// which is what a screen wants when it sits inside the dashboard content
// column on an internal part route and there is no window height to fill.
//
// The grid draws its own divider rather than leaving a gap between two
// blocks, so the split reads as one divided work area. On a narrow screen
// the rule turns horizontal.

export type MockTestSplitPaneProps = {
  left: ReactNode;
  right: ReactNode;
  leftLabel?: string;
  rightLabel?: string;
  // Used when fill is false, or below the large breakpoint.
  leftScroll?: ExamPanelScroll;
  rightScroll?: ExamPanelScroll;
  leftTone?: ExamPanelTone;
  rightTone?: ExamPanelTone;
  // Give each column the height of the pane and its own scrollbar.
  fill?: boolean;
  bordered?: boolean;
  className?: string;
};

export function MockTestSplitPane({
  left,
  right,
  leftLabel,
  rightLabel,
  leftScroll = "none",
  rightScroll = "none",
  leftTone = "plain",
  rightTone = "accent",
  fill = false,
  bordered = true,
  className,
}: MockTestSplitPaneProps) {
  const columnBody = fill
    ? playerSplit.columnBodyFill
    : playerSplit.columnBody;

  return (
    <div
      className={cx(
        playerSplit.grid,
        fill ? playerSplit.gridFill : "",
        bordered ? playerSplit.bordered : "",
        className,
      )}
    >
      <div
        className={cx(
          playerSplit.column,
          playerColumnTones[leftTone],
          fill ? playerSplit.columnFill : "",
        )}
      >
        {leftLabel ? (
          <p className={playerSplit.columnLabel}>{leftLabel}</p>
        ) : null}

        <div
          className={cx(
            columnBody,
            fill ? "" : playerScrollHeights[leftScroll],
          )}
        >
          {left}
        </div>
      </div>

      <div
        className={cx(
          playerSplit.column,
          playerColumnTones[rightTone],
          fill ? playerSplit.columnFill : "",
        )}
      >
        {rightLabel ? (
          <p className={playerSplit.columnLabel}>{rightLabel}</p>
        ) : null}

        <div
          className={cx(
            columnBody,
            fill ? "" : playerScrollHeights[rightScroll],
          )}
        >
          {right}
        </div>
      </div>
    </div>
  );
}
