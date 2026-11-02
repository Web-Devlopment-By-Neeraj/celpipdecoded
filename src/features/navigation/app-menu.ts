// Opens the mobile More sheet from anywhere in the signed in shell, for
// example the avatar in the top bar. AppMobileTabBar owns the sheet and
// listens for this event.

export const APP_MENU_EVENT = "celpip-open-app-menu";

export function requestAppMenu() {
  window.dispatchEvent(new Event(APP_MENU_EVENT));
}
