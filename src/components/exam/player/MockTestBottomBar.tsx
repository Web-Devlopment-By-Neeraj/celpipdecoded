import type { ReactNode } from "react";
import { cx } from "@/features/design/design-tokens";
import { MockTestButton } from "./MockTestButton";
import { playerBar } from "@/features/exam-engine/mock-test-player-theme";
import { examCopy } from "@/features/exam-engine/exam-copy";

// Compact grey navigation bar at the foot of the player window
// (EXAM-UI-02).
//
// Back on the left, anything else pushed to the right. Around 56 pixels
// tall, which is the middle of the band the brief asks for.
//
// Two properties matter more than how it looks.
//
// **It never scrolls away.** The bar is a shrink-0 flex item in a window
// with a real height, and the content pane above it takes every pixel of
// overflow, so Back is in the same place on a one line transition screen
// and on a 38 question review. That is the trapped navigation problem the
// ticket was raised for.
//
// **It carries no copyright line.** A test provider's footer text is
// their text, so the player does not print one. Practice-only wording that
// a learner needs to read is said on the screen that needs it, inside the
// content pane, not in permanent chrome.

export type MockTestBottomBarProps = {
  showBack?: boolean;
  backLabel?: string;
  backHref?: string;
  onBack?: () => void;
  backDisabled?: boolean;

  // Action opposite Back, for example Check answers or Finish.
  secondaryAction?: ReactNode;
  // Anything else on the right, beside the secondary action.
  children?: ReactNode;
  className?: string;
};

export function MockTestBottomBar({
  showBack = true,
  backLabel = examCopy.backLabel,
  backHref,
  onBack,
  backDisabled = false,
  secondaryAction,
  children,
  className,
}: MockTestBottomBarProps) {
  return (
    <footer className={cx(playerBar.bottom, className)}>
      <div className={playerBar.back}>
        {showBack ? (
          <MockTestButton
            variant="secondary"
            size="sm"
            href={backHref}
            onClick={onBack}
            disabled={backDisabled}
            ariaLabel={examCopy.backAriaLabel}
          >
            {backLabel}
          </MockTestButton>
        ) : null}
      </div>

      <div className={playerBar.secondary}>
        {secondaryAction}
        {children}
      </div>
    </footer>
  );
}
