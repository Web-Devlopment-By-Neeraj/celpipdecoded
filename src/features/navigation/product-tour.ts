// Steps for the signed-in product tour.
//
// Each step points at a data-tour marker already in the shell. A step
// whose marker is hidden, for example the sidebar on a phone, is skipped.

export const PRODUCT_TOUR_EVENT = "celpip-start-product-tour";
export const PRODUCT_TOUR_SEEN_KEY = "celpip-product-tour-seen";

export type ProductTourStep = {
  id: string;
  title: string;
  body: string;
};

export const PRODUCT_TOUR_STEPS: readonly ProductTourStep[] = [
  {
    id: "app-menu",
    title: "The menu",
    body: "On a phone, speaking, writing, live classes, and your account are in this menu.",
  },
  {
    id: "nav-dashboard",
    title: "Your practice home",
    body: "The dashboard holds your progress, the next practice to try, and the mock tests.",
  },
  {
    id: "nav-speaking",
    title: "Speaking practice",
    body: "Open timed speaking tasks here, record an answer, and come back for the feedback report.",
  },
  {
    id: "nav-writing",
    title: "Writing practice",
    body: "Writing tasks use a timer and a word count. Finished responses get a practice estimate.",
  },
  {
    id: "nav-live",
    title: "Live classes",
    body: "This opens class times on the public page. You stay signed in, so the header shows Dashboard instead of Sign in.",
  },
  {
    id: "account",
    title: "Your account",
    body: "This menu shows the email you are signed in with, and it is where you sign out.",
  },
  {
    id: "tour-button",
    title: "Replay this tour",
    body: "Take a tour stays in the bar, so you can walk through these steps again whenever you want.",
  },
  {
    id: "assistant",
    title: "Ask Alex",
    body: "The assistant in the corner can answer in chat or out loud. Recent messages stay in the thread.",
  },
];

export function requestProductTour() {
  window.dispatchEvent(new Event(PRODUCT_TOUR_EVENT));
}
