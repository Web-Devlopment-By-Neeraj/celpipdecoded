// Semantic design tokens for the signed in CELPIP app.
//
// Every value here is a Tailwind class string, not a raw colour. The raw
// colours live in src/app/globals.css as academy-* theme variables, so a
// palette change happens in one place and flows through these tokens.
//
// Rules:
// - components import from here instead of hardcoding brand classes
// - the landing page keeps its own warm editorial palette, it is not
//   covered by these tokens
// - brand direction (DESIGN.md): ink navy for structure and text, one
//   emerald primary action colour, white cards on a warm off-white page,
//   and red only for errors and destructive actions

// Page and surface backgrounds.
export const surface = {
  page: "bg-academy-paper-warm",
  card: "bg-academy-paper",
  cardSubtle: "bg-academy-navy-soft/50",
  brand: "bg-academy-navy",
  brandSoft: "bg-academy-navy-soft",
  accent: "bg-academy-blue",
  accentSoft: "bg-academy-blue-soft",
  danger: "bg-academy-red",
  dangerSoft: "bg-academy-red-soft",
} as const;

// Text colours. Primary is the reading colour, secondary is supporting
// copy, muted is for notes and captions.
export const text = {
  primary: "text-academy-navy",
  secondary: "text-academy-navy/75",
  muted: "text-academy-navy/55",
  onBrand: "text-white",
  accent: "text-academy-blue",
  danger: "text-academy-red",
  heading: "font-serif font-bold tracking-tight text-academy-navy",
  eyebrow:
    "text-xs font-semibold uppercase tracking-[0.2em] text-academy-blue",
} as const;

// Borders, dividers and rings.
export const border = {
  default: "border border-academy-line",
  subtle: "border border-academy-navy/10",
  strong: "border border-academy-navy/25",
  divider: "border-t border-academy-line",
  ring: "ring-1 ring-academy-navy/5",
} as const;

// Elevation. The app stays flat and calm, so shadows are soft.
export const shadow = {
  card: "shadow-sm",
  raised: "shadow-md",
  none: "shadow-none",
} as const;

// Corner radii. Cards are 16px, large feature panels and dialogs 24px,
// controls are pill shaped.
export const radius = {
  card: "rounded-2xl",
  feature: "rounded-3xl",
  panel: "rounded-2xl",
  control: "rounded-full",
  chip: "rounded-full",
  tile: "rounded-xl",
} as const;

// Focus treatment. Applied to every interactive component so keyboard
// users get the same visible target everywhere.
export const focus = {
  ring: "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-academy-blue focus-visible:ring-offset-2 focus-visible:ring-offset-academy-paper",
} as const;

// Layout rhythm shared by the page shell and section headers.
export const layout = {
  maxWidth: "mx-auto w-full max-w-6xl",
  maxWidthNarrow: "mx-auto w-full max-w-3xl",
  pagePadding: "px-5 sm:px-8",
  sectionGap: "space-y-8",
  cardPadding: "p-6 sm:p-8",
  cardPaddingCompact: "p-5",
} as const;

// Full card recipes, so a card looks the same wherever it is used.
export const cardStyles = {
  default: `${radius.card} ${surface.card} ${shadow.card} ${border.ring}`,
  highlighted: `${radius.card} bg-academy-blue-soft/60 ${shadow.card} ring-1 ring-academy-blue/35`,
  subtle: `${radius.card} ${surface.cardSubtle} ${border.subtle}`,
  danger: `${radius.card} ${surface.dangerSoft} ring-1 ring-academy-red/20`,
} as const;

export type CardVariant = keyof typeof cardStyles;

// Button recipes. Primary is the one emerald action colour used on the
// public site and in the app alike, secondary is a white outline, ghost
// is text only, and danger is reserved for destructive actions.
export const buttonBase = `inline-flex items-center justify-center gap-2 ${radius.control} font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${focus.ring}`;

export const buttonVariants = {
  primary:
    "bg-brand text-white shadow-sm shadow-brand/20 hover:bg-brand-dark disabled:hover:bg-brand",
  secondary:
    "bg-academy-paper text-academy-navy ring-1 ring-academy-navy/15 hover:bg-academy-navy-soft",
  ghost:
    "bg-transparent text-academy-navy hover:bg-academy-navy-soft/70",
  danger:
    "bg-academy-red text-white hover:bg-academy-red/90 disabled:hover:bg-academy-red",
} as const;

export type ButtonVariant = keyof typeof buttonVariants;

// Sizes keep a comfortable tap target on mobile, the smallest control is
// still 36px tall.
export const buttonSizes = {
  sm: "h-9 px-4 text-xs",
  md: "h-11 px-6 text-sm",
  lg: "h-12 px-7 text-base",
} as const;

export type ButtonSize = keyof typeof buttonSizes;

// Progress bar track and fill.
export const progress = {
  track: "w-full overflow-hidden rounded-full bg-academy-navy/10",
  fill: "h-full rounded-full bg-brand transition-[width] duration-500",
  fillAccent: "h-full rounded-full bg-academy-blue transition-[width] duration-500",
} as const;

// Small helper so components can merge an optional className without
// pulling in a class name dependency.
export function cx(...values: Array<string | false | null | undefined>): string {
  return values.filter(Boolean).join(" ");
}
