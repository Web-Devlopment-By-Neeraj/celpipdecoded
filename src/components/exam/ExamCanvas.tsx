import type { ReactNode } from "react";
import { MockTestContentPane } from "./player/MockTestContentPane";

// White exam area between the two grey bars.
//
// **This is now a thin adapter** (EXAM-UI-02). The content area moved to
// src/components/exam/player/MockTestContentPane.tsx, which is where the
// scroll rule for the whole player is decided: the pane scrolls, the
// window does not, and the two bars never move.
//
// The canvas used to draw a grey gutter with a bordered white sheet
// floating inside it. The exam window has its own border now, so a second
// one just inside it read as a box in a box, and the pane is white to its
// edges.
//
// minHeight is gone from the pane. It existed to stop the frame jumping
// between a short screen and a long one, and the window now carries a
// minimum height of its own, so every screen is the same size whatever is
// on it. The prop is kept on this adapter so no caller breaks, and it is
// ignored.

export type ExamCanvasProps = {
  children: ReactNode;
  padded?: boolean;
  // Kept for callers. The exam window sets the minimum height now.
  minHeight?: boolean;
  // Set false to hand the height to the body instead of scrolling here.
  scroll?: boolean;
  className?: string;
};

export function ExamCanvas({
  children,
  padded = true,
  scroll = true,
  className,
}: ExamCanvasProps) {
  return (
    <MockTestContentPane padded={padded} scroll={scroll} className={className}>
      {children}
    </MockTestContentPane>
  );
}
