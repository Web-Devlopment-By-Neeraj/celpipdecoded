// Light and dark theme (DESIGN.md).
//
// The theme is a data-theme attribute on <html>. Light is the default and
// has no attribute; dark sets data-theme="dark". The choice is saved per
// browser under THEME_STORAGE_KEY.
//
// Plain module on purpose: the root layout (a server component) reads the
// boot script from here, and the client toggle reads the same constants.

export type Theme = "light" | "dark";

export const THEME_STORAGE_KEY = "celpip-theme";

// Browser chrome colour for each theme. Matches the sticky headers, so the
// status bar of an installed app runs straight into the page.
export const THEME_COLORS: Record<Theme, string> = {
  light: "#ffffff",
  dark: "#0b1a2b",
};

// Runs before first paint, so a dark-theme visitor never sees a light
// flash. Kept tiny and dependency free because it is inlined in <body>.
export const THEME_BOOT_SCRIPT = `try{var t=localStorage.getItem(${JSON.stringify(
  THEME_STORAGE_KEY,
)});var d=document.documentElement;if(t==="dark"){d.dataset.theme="dark"}else{delete d.dataset.theme}var m=document.querySelector('meta[name="theme-color"]');if(m){m.setAttribute("content",t==="dark"?${JSON.stringify(
  THEME_COLORS.dark,
)}:${JSON.stringify(THEME_COLORS.light)})}}catch(e){}`;
