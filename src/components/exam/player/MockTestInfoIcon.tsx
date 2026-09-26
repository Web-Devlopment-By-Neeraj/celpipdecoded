import { cx } from "@/features/design/design-tokens";
import { playerInfoIcon } from "@/features/exam-engine/mock-test-player-theme";
import { examCopy } from "@/features/exam-engine/exam-copy";

// The circled information glyph the player marks an instruction with
// (EXAM-UI-03).
//
// It appears beside the heading on an instructions screen, beside the
// task line on a media screen, and beside the question instruction on a
// question screen, and until this ticket each of those drew its own span.
// One component means the glyph is provably the same mark in all three
// places and can be resized in one edit.
//
// **It is drawn, not imported.** A bordered circle with a letter i in it,
// built from two elements and a class recipe. No icon package is
// installed for the exam engine, and nothing here is taken from any test
// provider's interface: a circled i is the oldest information mark there
// is and this one is our own geometry.
//
// The glyph is decorative, so it is hidden from assistive technology and
// the word "Information" is read in its place. A screen reader that
// announced the letter i on its own would be reading noise.

export type MockTestInfoIconProps = {
  // md sits beside an 18 pixel screen heading, sm beside body copy.
  size?: "md" | "sm";
  className?: string;
};

export function MockTestInfoIcon({
  size = "md",
  className,
}: MockTestInfoIconProps) {
  return (
    <>
      <span
        className={cx(playerInfoIcon.base, playerInfoIcon[size], className)}
        aria-hidden="true"
      >
        i
      </span>
      <span className="sr-only">{examCopy.infoIconLabel}</span>
    </>
  );
}
