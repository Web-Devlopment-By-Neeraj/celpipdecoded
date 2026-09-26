import type { ReactNode } from "react";
import { cx } from "@/features/design/design-tokens";
import { playerReview } from "@/features/exam-engine/mock-test-player-theme";

// The block a review or a result screen is built from (EXAM-UI-02).
//
// Review and result screens are the one place in the player where a
// learner reads rather than answers, and they are also the longest screens
// in the whole test: one Listening review carries 38 rows, one Writing
// review carries two task cards, eight criterion rows, two lists and two
// full rewrites.
//
// Three decisions follow from that.
//
// - **The stack is capped and centred at 768 pixels.** A table of results
//   set on a 1100 pixel measure is a table nobody can follow across a row.
//   The exam window keeps its width, the document inside it does not.
// - **A long list scrolls inside the panel, not the pane.** Pass
//   scroll to keep the panel header and the bottom bar in view while the
//   rows move, which is what makes a 38 row review readable without
//   losing the place.
// - **It is still exam chrome, not a report card.** A hairline border, a
//   tinted header strip, square corners. Nothing here carries a seal, a
//   ribbon or a grade colour, because a practice estimate must never be
//   mistakeable for an official score report.
//
// The panel renders a heading and a meta line side by side, which is what
// a review row count or a score fraction goes in, and a footer for the
// practice-only note that has to stay clear on every result screen.

export type MockTestReviewPanelProps = {
  title?: string;
  // Small right hand reading in the header, for example 31 of 38.
  meta?: string;
  footer?: ReactNode;
  // Pad the body. Set false for a full width table that draws its own.
  padded?: boolean;
  // Give the body its own scrollbar, for a long list of rows.
  scroll?: boolean;
  children: ReactNode;
  className?: string;
};

export function MockTestReviewPanel({
  title,
  meta,
  footer,
  padded = true,
  scroll = false,
  children,
  className,
}: MockTestReviewPanelProps) {
  return (
    <section className={cx(playerReview.panel, className)}>
      {title || meta ? (
        <div className={playerReview.panelHeader}>
          {title ? <h3 className={playerReview.panelTitle}>{title}</h3> : null}
          {meta ? <span className={playerReview.panelMeta}>{meta}</span> : null}
        </div>
      ) : null}

      <div
        className={cx(
          padded ? playerReview.panelBodyPadded : playerReview.panelBody,
          scroll ? playerReview.scroll : "",
        )}
      >
        {children}
      </div>

      {footer ? <div className={playerReview.panelFooter}>{footer}</div> : null}
    </section>
  );
}

// The capped column a review or result screen stacks its panels in.
export function MockTestReviewStack({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={cx(playerReview.stack, className)}>{children}</div>;
}
