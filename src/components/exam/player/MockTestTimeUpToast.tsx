"use client";

import { useEffect, useRef, useState } from "react";
import { examCopy } from "@/features/exam-engine/exam-copy";
import { playerTimeUpToast } from "@/features/exam-engine/mock-test-player-theme";

// The time up message on a mock test route (TIMER-01).
//
// What this replaces
// ------------------
//
// The full Listening run used to hand goNext to every question screen as
// its expiry callback, so a window reaching zero moved the test on by
// itself. A learner still reading the last option, or still deciding, lost
// the screen without touching anything. That is the behaviour this ticket
// removes, and this component is what stands in its place.
//
// Nothing here navigates, submits, stops a recorder or clears an answer.
// It says one sentence and clears itself. The expired reading in the top
// bar, and the red it is drawn in, are unchanged and are still the durable
// signal: the toast is the sentence that reading cannot fit.
//
// Why the message lives at the section level
// ------------------------------------------
//
// Each of the four section prototypes owns one of these, not each screen.
// A screen mounts and unmounts as the run moves, and a message that
// belongs to a screen would be torn down mid-sentence by the very Next
// press it is telling the learner they are free to make. The prototype is
// mounted for the whole section, so the toast outlives any one screen and
// the run keeps exactly one of them.
//
// How it avoids repeating itself
// ------------------------------
//
// useExamCountdown already fires its callback once per window, holding the
// deadline it reported in a ref, so a re-render at zero, a re-render from
// a selection, and every tick after zero produce nothing. On top of that,
// showTimeUp here mints a new key rather than setting a flag, so two
// windows closing in turn are two mounts and never two toasts at once, and
// a screen that redraws while the toast is up does not restart its clock.
//
// The countdown fires the callback from an effect, so this is state set
// during an effect rather than from a click. That is the same path
// onTimeExpire always took, and it is the only path available: a window
// closing is not an interaction.
//
// House style: normal hyphens only, no long hyphens or em dashes.

// How long the message stays. Inside the three to five second band the
// ticket asks for, and long enough to read a ten word sentence twice.
export const MOCK_TEST_TIME_UP_TOAST_MS = 4000;

export type MockTestTimeUpToastController = {
  // Which message is showing, or 0 for none. Hand it straight to
  // MockTestTimeUpToast.
  toastKey: number;
  // Report that a window reached zero. Safe to call again: the visible
  // message is replaced rather than joined by a second one.
  showTimeUp: () => void;
  // Take the message away early. The prototypes call this when the learner
  // moves screen, so a message about the screen they just left does not
  // follow them onto the next one.
  dismissTimeUp: () => void;
};

export function useMockTestTimeUpToast(): MockTestTimeUpToastController {
  // 0 means nothing is showing. Any other value is the identity of the
  // message currently up, and is what remounts the toast so a second
  // window closing gets its own full few seconds rather than inheriting
  // what was left of the first one's.
  const [toastKey, setToastKey] = useState(0);

  // The next identity to hand out. A ref rather than a counter derived
  // from state, so dismissing back to 0 does not reissue a key that has
  // already been used.
  const nextToastKey = useRef(0);

  // Plain functions rather than useCallback, for the reason useExamCountdown
  // gives for its own start: the React Compiler memoizes them, and wrapping
  // them by hand made it give up on the hook instead.
  const showTimeUp = () => {
    nextToastKey.current += 1;
    setToastKey(nextToastKey.current);
  };

  const dismissTimeUp = () => {
    setToastKey(0);
  };

  return { toastKey, showTimeUp, dismissTimeUp };
}

export type MockTestTimeUpToastProps = {
  // From useMockTestTimeUpToast. 0 draws nothing.
  toastKey: number;
  // The sentence. Defaults to the one string every section uses.
  text?: string;
};

// Keying the inner component on the message identity is what gives each
// closing window its own countdown to disappearing, and it is why a
// re-render of the section cannot extend or restart the one that is up.
export function MockTestTimeUpToast({
  toastKey,
  text = examCopy.timeUpToastText,
}: MockTestTimeUpToastProps) {
  if (toastKey === 0) {
    return null;
  }

  return <MockTestTimeUpToastWindow key={toastKey} text={text} />;
}

function MockTestTimeUpToastWindow({ text }: { text: string }) {
  // Hiding is owned here rather than pushed back to the section, and the
  // effect has no dependencies at all, which is the point. A callback prop
  // would change identity on every render of a section that re-renders
  // whenever an option is picked, and the effect would then clear and
  // reschedule the timeout each time, leaving a message that never quite
  // runs out. One mount, one timeout.
  const [isDone, setIsDone] = useState(false);

  useEffect(() => {
    const id = window.setTimeout(() => {
      setIsDone(true);
    }, MOCK_TEST_TIME_UP_TOAST_MS);

    // Cleared on unmount as well as on the way to a new message, so
    // leaving the section, or the learner pressing Next, cannot leave a
    // timeout behind pointing at a component that is gone.
    return () => window.clearTimeout(id);
  }, []);

  if (isDone) {
    return null;
  }

  return (
    <div className={playerTimeUpToast.region}>
      {/* Polite, and it says its piece exactly once: the region is mounted
          with the message already in it and is taken away whole, so
          nothing here can chatter the way a live countdown would. */}
      <p role="status" aria-live="polite" className={playerTimeUpToast.toast}>
        {text}
      </p>
    </div>
  );
}
