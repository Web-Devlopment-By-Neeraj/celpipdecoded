"use client";

import { cx } from "@/features/design/design-tokens";
import { playerOption } from "@/features/exam-engine/mock-test-player-theme";

// One answer option on a mock test question screen (EXAM-UI-03).
//
// A radio, its label, and the two states a row can be in. It exists so
// that "what does an option look like, and what happens when I point at
// one" has a single answer across every question screen in the player,
// rather than three lists each writing their own label element.
//
// The EXAM-UI-03 brief asked for one behaviour change and this component
// is where it lives:
//
// - **hover is neutral grey**, never a saturated colour. An option the
//   pointer is passing over must not read like an option that has been
//   chosen, and a coloured hover on a test screen reads as feedback about
//   the answer, which a practice test must never give before marking.
// - **selected is a controlled pale blue**, the same quiet tint the split
//   screen answer column uses, so a choice is legible at a glance without
//   shouting.
// - **rows are ruled and compact.** The rule comes from the list wrapper
//   below, so options sit close enough that a four option question fits
//   on the screen with its question.
//
// The whole row is the click target, because it is a label wrapping its
// own input, so a learner never has to hit the circle itself. The circle
// is nudged down to sit on the centre of the first line of its label.
//
// This component knows nothing about answers. It is told whether it is
// selected and it reports a click; the answer map lives in the prototype
// that owns the flow, which is what makes a choice survive moving back
// and forward through the test.

export type MockTestOptionListProps = {
  children: React.ReactNode;
  className?: string;
};

// The ruled wrapper a run of options sits in.
export function MockTestOptionList({
  children,
  className,
}: MockTestOptionListProps) {
  return <div className={cx(playerOption.list, className)}>{children}</div>;
}

export type MockTestOptionRowProps = {
  // Radio group name. Every option answering one question shares it, and
  // no two questions on a screen may share one.
  name: string;
  value: string;
  label: string;
  selected: boolean;
  onSelect: () => void;
  className?: string;
};

export function MockTestOptionRow({
  name,
  value,
  label,
  selected,
  onSelect,
  className,
}: MockTestOptionRowProps) {
  return (
    <label
      className={cx(
        playerOption.row,
        selected ? playerOption.rowSelected : "",
        className,
      )}
    >
      <input
        type="radio"
        name={name}
        value={value}
        checked={selected}
        onChange={onSelect}
        className={playerOption.input}
      />
      <span className={playerOption.text}>{label}</span>
    </label>
  );
}
