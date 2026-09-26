import type { ReactNode } from "react";
import { cx } from "@/features/design/design-tokens";
import {
  playerPanel,
  playerPanelTones,
  playerScrollHeights,
} from "@/features/exam-engine/mock-test-player-theme";
import type {
  ExamPanelScroll,
  ExamPanelTone,
} from "@/features/exam-engine/exam-shell-types";

// The bordered box a question set, a passage or an answer area sits in
// (EXAM-UI-02).
//
// A panel is chrome around content, so it stays quiet: a hairline border,
// small corners, an optional tinted header strip carrying a small caps
// label, and an optional footer for a note such as an answered count.
// No shadow, no card, no pill.
//
// Border colour lives on the tone and the header and footer rules inherit
// it, so an accent panel is bordered blue and a plain panel is bordered
// grey without either rule fighting the other.
//
// A panel that scrolls keeps its own scrollbar, so a long question list
// inside a short column cannot push the page sideways or move the bars.

export type MockTestQuestionPanelProps = {
  title?: string;
  tone?: ExamPanelTone;
  scroll?: ExamPanelScroll;
  footer?: ReactNode;
  padded?: boolean;
  children: ReactNode;
  className?: string;
};

export function MockTestQuestionPanel({
  title,
  tone = "plain",
  scroll = "none",
  footer,
  padded = true,
  children,
  className,
}: MockTestQuestionPanelProps) {
  return (
    <div className={cx(playerPanel.base, playerPanelTones[tone], className)}>
      {title ? <div className={playerPanel.header}>{title}</div> : null}

      <div
        className={cx(
          padded ? playerPanel.body : "min-w-0",
          playerScrollHeights[scroll],
        )}
      >
        {children}
      </div>

      {footer ? <div className={playerPanel.footer}>{footer}</div> : null}
    </div>
  );
}
