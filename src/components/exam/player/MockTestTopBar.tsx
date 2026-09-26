import type { ReactNode } from "react";
import { cx } from "@/features/design/design-tokens";
import { MockTestButton } from "./MockTestButton";
import { MockTestTimerBadge } from "./MockTestTimerBadge";
import { playerBar } from "@/features/exam-engine/mock-test-player-theme";
import { examCopy } from "@/features/exam-engine/exam-copy";
import type { ExamTimerReading } from "@/features/exam-engine/exam-shell-types";

// Compact grey title bar at the top of the player window (EXAM-UI-02).
//
// It carries the screen title on the left, then the timer readings, an
// optional note and the Next control on the right. Around 48 pixels tall,
// which is the middle of the band the brief asks for, and it refuses to
// shrink, so Next stays reachable on a short window.
//
// **There is no logo in this bar, by design.** No wordmark, no product
// name, no brand colour. A learner sitting a practice test should see a
// testing application, and everything that says who built it belongs on
// the dashboard they came from. That is also the legal position: nothing
// in this bar is taken from any official test provider.
//
// Two ways to pass a clock, both inherited unchanged from the bar this
// replaces:
//
// - timers, a list of formatted readings, which is how Speaking shows a
//   preparation reading beside a recording reading
// - timerSlot, a live component that owns its own clock, which is what
//   every timed Listening, Reading and Writing screen passes
//
// Both render in the same strip, so a screen can show one of each.

export type MockTestTopBarProps = {
  title: string;
  timers?: ExamTimerReading[];
  timerSlot?: ReactNode;
  metaText?: string;

  showNext?: boolean;
  nextLabel?: string;
  nextHref?: string;
  onNext?: () => void;
  nextDisabled?: boolean;

  // Extra controls, dropped in before Next.
  children?: ReactNode;
  className?: string;
};

export function MockTestTopBar({
  title,
  timers,
  timerSlot,
  metaText,
  showNext = true,
  nextLabel = examCopy.nextLabel,
  nextHref,
  onNext,
  nextDisabled = false,
  children,
  className,
}: MockTestTopBarProps) {
  const readings = timers ?? [];

  return (
    <header className={cx(playerBar.top, className)}>
      <h2 className={playerBar.title} title={title}>
        {title}
      </h2>

      <div className={playerBar.actions}>
        {readings.length > 0 || timerSlot ? (
          <div className={playerBar.readings}>
            {readings.map((reading, index) => (
              <MockTestTimerBadge
                key={`${reading.label ?? "timer"}-${index}`}
                label={reading.label}
                value={reading.value}
                state={reading.state}
              />
            ))}

            {timerSlot}
          </div>
        ) : null}

        {metaText ? <span className={playerBar.meta}>{metaText}</span> : null}

        {children}

        {showNext ? (
          <MockTestButton
            variant="primary"
            size="xs"
            href={nextHref}
            onClick={onNext}
            disabled={nextDisabled}
            ariaLabel={examCopy.nextAriaLabel}
          >
            {nextLabel}
          </MockTestButton>
        ) : null}
      </div>
    </header>
  );
}
