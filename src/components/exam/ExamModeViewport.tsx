"use client";

import { useEffect } from "react";
import type { ReactNode } from "react";
import { playerViewport } from "@/features/exam-engine/mock-test-player-theme";

// The desk the mock test player window sits on (EXAM-15B, rebuilt by
// EXAM-UI-02).
//
// A test screen is not a web page. It does not scroll with the document,
// it has no breadcrumbs above it, and nothing belonging to the surrounding
// application is visible while it is open. The four Mock Test 1 routes
// live under /dashboard so the layout auth guard covers them, and the
// dashboard shell checks the route and does not render its sidebar,
// header, breadcrumb trail or footer on an exam route at all. See
// src/features/navigation/exam-mode-routes.ts and AppShellFrame.
//
// What this component owns is the desk:
//
// - it is fixed and one window tall, which is what gives the player shell
//   inside it a real height to fill, which is in turn what pins the top
//   and bottom bars while the content pane between them scrolls
// - it is painted the player grey, so the exam window reads as an
//   application sitting on a desktop
// - document scrolling is switched off while it is mounted, so a trackpad
//   flick or a space bar press cannot drag the exam up the screen
//
// **What changed in EXAM-UI-02.** The desk used to be overflow-hidden and
// the window inside it was painted edge to edge: the exam mode rules in
// globals.css lifted the frame's width cap and stripped its border, so on
// a wide monitor a question list was drawn across the whole screen. That
// is what the client reported as stretched, and it is fixed on the shell
// rather than here, by the shell keeping its cap and its border
// everywhere.
//
// The one change that belongs here is overflow-y-auto in place of
// overflow-hidden. The window carries a minimum height, so on a browser
// too short to hold it, the desk now scrolls rather than clipping the
// bottom bar off the screen. On any normal laptop there is nothing to
// scroll, so this costs nothing and only ever helps.
//
// overscroll-none stays. A flick that runs past the end of the content
// pane must not chain out and rubber band the page behind the exam.
//
// The scroll lock is written on the elements themselves rather than
// through a class, and the previous inline values are put back on unmount,
// so leaving the exam by any route, the end of section link, the browser
// back button or a client navigation, returns the document to whatever it
// had before. Nothing else on the page is touched.
//
// This component has no opinion about which test is inside it, so
// Listening, Reading, Writing and Speaking all use it unchanged.

export type ExamModeViewportProps = {
  // The player window to show. Normally one section flow component, which
  // renders its own shell per screen.
  children: ReactNode;
  // Names the exam region for assistive technology, for example
  // "Mock Test 1 - Listening Test".
  label: string;
};

export function ExamModeViewport({ children, label }: ExamModeViewportProps) {
  useEffect(() => {
    const root = document.documentElement;
    const { body } = document;

    const previousRootOverflow = root.style.overflow;
    const previousBodyOverflow = body.style.overflow;
    const previousRootOverscroll = root.style.overscrollBehavior;
    const previousBodyOverscroll = body.style.overscrollBehavior;

    root.style.overflow = "hidden";
    body.style.overflow = "hidden";
    // overflow hidden stops the document scrolling, and this stops the
    // bounce. A trackpad flick or a touch drag that runs past the end of
    // the content pane can still rubber band the document on macOS and on
    // mobile Safari, which flashes a strip of the dashboard behind the
    // exam. Refusing the chain here means the only thing that moves on
    // screen is the pane, and only while it has somewhere to go.
    root.style.overscrollBehavior = "none";
    body.style.overscrollBehavior = "none";

    return () => {
      root.style.overflow = previousRootOverflow;
      body.style.overflow = previousBodyOverflow;
      root.style.overscrollBehavior = previousRootOverscroll;
      body.style.overscrollBehavior = previousBodyOverscroll;
    };
  }, []);

  return (
    <div
      className={playerViewport.overlay}
      role="region"
      aria-label={label}
    >
      <div className={playerViewport.inner}>{children}</div>
    </div>
  );
}
