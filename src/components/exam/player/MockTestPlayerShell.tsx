import type { ReactNode } from "react";
import { cx } from "@/features/design/design-tokens";
import { MockTestBottomBar } from "./MockTestBottomBar";
import { MockTestContentPane } from "./MockTestContentPane";
import { MockTestTopBar } from "./MockTestTopBar";
import { playerFrame } from "@/features/exam-engine/mock-test-player-theme";
import type {
  ExamTimerReading,
  ExamTimerState,
} from "@/features/exam-engine/exam-shell-types";

// The exam window every mock test screen sits inside (EXAM-UI-02).
//
// It composes the compact grey top bar, the white content pane and the
// compact grey bottom bar, and it is the only place that knows about the
// title, the timer and the navigation controls. A screen type renders its
// body and nothing else.
//
// **What changed, and why.** The frame this replaces was painted edge to
// edge across the browser window: inside the locked viewport it dropped
// its width cap, its border and its rounded corners so the test filled the
// screen. On a wide monitor that drew a question list two and a half
// thousand pixels wide with the answer on one side of the desk and the
// question on the other, which is what the client reported as stretched
// and as not feeling like an exam application at all.
//
// A real computer based test is a window. So the frame is a window again:
//
// - a grey desk fills the browser
// - the window is centred on it and capped at 1100 pixels, the middle of
//   the 1040 to 1120 band the brief asks for
// - 40 pixels of desk above it and 32 below, so it reads as an
//   application on a desktop rather than as a page with a header
// - a light grey border and small corners, so it has an edge
//
// **Height.** All three levels ask for the height of their parent, and
// that request is deliberately inert on an ordinary page: a grow on a
// column whose parent sizes to its content resolves to nothing, which is
// what happens on the six internal Listening part routes and the four
// Reading ones, where this shell is one panel inside the dashboard content
// column. It only bites inside the locked player viewport (ExamModeViewport), and there it makes
// the window exactly as tall as the desk allows, so the two bars stay put
// and the content pane takes the rest. One set of classes covers both, so
// no screen has to know which of the two places it is in.
//
// The window carries a min height rather than a fixed one, so on a very
// short browser the desk scrolls instead of the bars being crushed.
//
// **Timers.** The shell owns no clock. It is handed either a formatted
// value or a component that formats its own, and renders whichever it gets
// in the same strip:
//
// - timerLabel, timerValue and timerState for one fixed reading
// - timers for a list, which is the Speaking pair of preparation and
//   recording, and which wins when it is set
// - timerSlot for a live component such as ExamCountdownTimer
//
// **Navigation** takes either an href or a handler. Use an href where the
// next screen is a route, and a handler where the sequence is held in
// client state.

export type MockTestPlayerShellProps = {
  title: string;

  // Single timer reading.
  timerLabel?: string;
  timerValue?: string;
  timerState?: ExamTimerState;
  // Two or more readings. Overrides the single reading props above.
  timers?: ExamTimerReading[];
  // A live timer component, rendered beside any fixed readings.
  timerSlot?: ReactNode;
  // Small note in the top bar beside the timers.
  metaText?: string;

  showNext?: boolean;
  nextLabel?: string;
  nextHref?: string;
  onNext?: () => void;
  nextDisabled?: boolean;

  showBack?: boolean;
  backLabel?: string;
  backHref?: string;
  onBack?: () => void;
  backDisabled?: boolean;

  // Optional action on the right of the bottom bar, opposite Back.
  secondaryAction?: ReactNode;
  // Extra content in the bottom bar, beside the secondary action.
  bottomContent?: ReactNode;
  // Hide the bottom bar entirely, for a screen with no controls at all.
  showBottomBar?: boolean;

  // Screen body.
  children: ReactNode;
  // Set false when the body manages its own edges.
  padded?: boolean;
  // Set false when the body scrolls its own regions, for example a split
  // pane whose two columns each take a scrollbar.
  scrollContent?: boolean;
  className?: string;
};

export function MockTestPlayerShell({
  title,
  timerLabel,
  timerValue,
  timerState = "normal",
  timers,
  timerSlot,
  metaText,
  showNext = true,
  nextLabel,
  nextHref,
  onNext,
  nextDisabled = false,
  showBack = true,
  backLabel,
  backHref,
  onBack,
  backDisabled = false,
  secondaryAction,
  bottomContent,
  showBottomBar = true,
  children,
  padded = true,
  scrollContent = true,
  className,
}: MockTestPlayerShellProps) {
  const readings: ExamTimerReading[] =
    timers ??
    (timerValue
      ? [{ label: timerLabel, value: timerValue, state: timerState }]
      : []);

  return (
    <div className={cx(playerFrame.desk, className)}>
      {/* data-mock-test-player is the hook the player skin rules in
          globals.css hang off. Inside it the academy palette is
          re-pointed at the neutral player ramp, so every exam screen
          recipe draws in grey, white and exam blue rather than in the
          CELPIP Decoded ink navy and emerald teal. Nothing outside this
          element is affected, so the dashboard the learner came from and
          the report they go back to keep the brand. */}
      <div data-mock-test-player="true" className={playerFrame.container}>
        <section className={playerFrame.window} aria-label={title}>
          <MockTestTopBar
            title={title}
            timers={readings}
            timerSlot={timerSlot}
            metaText={metaText}
            showNext={showNext}
            nextLabel={nextLabel}
            nextHref={nextHref}
            onNext={onNext}
            nextDisabled={nextDisabled}
          />

          <MockTestContentPane padded={padded} scroll={scrollContent}>
            {children}
          </MockTestContentPane>

          {showBottomBar ? (
            <MockTestBottomBar
              showBack={showBack}
              backLabel={backLabel}
              backHref={backHref}
              onBack={onBack}
              backDisabled={backDisabled}
              secondaryAction={secondaryAction}
            >
              {bottomContent}
            </MockTestBottomBar>
          ) : null}
        </section>
      </div>
    </div>
  );
}
