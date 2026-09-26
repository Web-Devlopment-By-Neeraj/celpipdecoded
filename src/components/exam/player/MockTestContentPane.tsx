import type { ReactNode } from "react";
import { cx } from "@/features/design/design-tokens";
import { playerContent } from "@/features/exam-engine/mock-test-player-theme";

// The white content area between the two bars (EXAM-UI-02).
//
// This is where the scroll behaviour the ticket asks for is decided, so it
// is worth being explicit about the rule:
//
//   **the pane scrolls, the window does not.**
//
// The pane is the flex child that grows into whatever height is left after
// the top and bottom bars have taken theirs, and min-h-0 is what allows it
// to shrink below its own content. Without that one class a long screen
// pushes the bottom bar off the window instead of scrolling, which is
// exactly the trapped content the brief describes. With it, a 38 question
// review scrolls between two bars that never move.
//
// Two modes:
//
// - **scroll**, the default, gives the pane the scrollbar. Every single
//   column screen uses it: instructions, part intros, audio and image
//   prompts, question lists, completion screens, reviews and results.
// - **fill**, set by passing scroll={false}, hands the height to the body
//   and takes no scrollbar of its own. The reading and writing split panes
//   use it, because there each column scrolls separately and a scrollbar
//   around two scrollbars is one too many.
//
// overscroll-contain keeps a flick that runs past the end of the pane from
// chaining out to the desk behind it, so the window stays still.
//
// The old canvas drew a grey gutter with a bordered white sheet inside it.
// The window now has its own border, so a second one just inside it read
// as a box in a box. The pane is white to its edges.

export type MockTestContentPaneProps = {
  children: ReactNode;
  // Set false when the body manages its own edges, for example a split
  // pane that runs to the window border.
  padded?: boolean;
  // Set false to hand the height to the body instead of scrolling here.
  scroll?: boolean;
  className?: string;
};

export function MockTestContentPane({
  children,
  padded = true,
  scroll = true,
  className,
}: MockTestContentPaneProps) {
  return (
    <div className={scroll ? playerContent.region : playerContent.regionFill}>
      <div
        className={cx(
          scroll ? playerContent.body : playerContent.bodyFill,
          padded ? playerContent.padded : "",
          className,
        )}
      >
        {children}
      </div>
    </div>
  );
}
