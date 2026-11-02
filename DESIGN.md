# CELPIP Decoded design guide

The rules every screen follows, so the public site, the signed in app and
the mobile PWA look like one product. If something new doesn't fit here,
update this guide first, then build it.

The source of truth in code:

| What | Where |
| --- | --- |
| Colour variables, dark theme, motion | `src/app/globals.css` |
| App class recipes (cards, buttons, text, focus) | `src/features/design/design-tokens.ts` |
| Theme switch and boot script | `src/components/theme/ThemeToggle.tsx`, `src/features/theme/theme.ts` |
| Navigation model (sidebar, tab bar, More sheet) | `src/features/navigation/app-nav-items.ts` |
| Mobile tab bar | `src/components/app/MobileTabBar.tsx` |

The client Build Pack (v3.1) is a reference for the mood and colours. It is
not a spec to copy pixel for pixel.

---

## 1. Principles

1. **Calm, not loud.** Learners come here stressed about a test. Use warm
   off-white surfaces, plenty of space and one strong action per screen.
2. **Proof before promise.** Real scores, real words, numbers computed from
   data. No invented ratings, no unverifiable claims.
3. **One action colour.** Emerald means "do this next", everywhere. Navy
   is for structure and text. Red only means error or destructive.
4. **Mobile first.** Most learners use the installed PWA on a phone. Design
   at 390px first, then scale up.
5. **The mock test is sacred.** The test player has its own neutral skin
   and is never restyled by brand, theme or navigation changes (see 10).

---

## 2. Colour

### Brand palette (light theme)

| Token | Hex | Use |
| --- | --- | --- |
| `brand-ink` / `ink` / `academy-navy` | `#12314F` | Headings, body text, structure |
| `brand-ink-deep` / `ink-soft` | `#0C2338` | Footer, deepest navy |
| `navy-panel` | `#12314F` | The one dark surface in light mode: app sidebar, hero card, results spotlight, featured price card |
| `brand` (teal deep) | `#0A7A54` | **Primary buttons**, active nav, eyebrows, links |
| `brand-dark` | `#085C40` | Primary hover |
| `brand-teal` | `#0E9F6E` | Rules, dots, glows (not behind white text, only 3.4:1) |
| `brand-mint` | `#5AD3A4` | Accent text and icons **on navy** |
| `brand-teal-soft` / `academy-blue-soft` | `#E4F5EE` | Soft success / selected tints |
| `cream` / `background` | `#F4F1EA` | Page background (warm off-white) |
| `cream-soft` | `#EAE5D9` | Alternate section band |
| `white` / `academy-paper` | `#FFFFFF` | Cards, sheets, header |
| `academy-line` | `#DFE4EC` | Hairlines and card borders |
| `academy-red` | `#B3261E` | Errors, destructive actions only |
| `academy-amber` | `#A1591A` | Timer warnings |

### Score colours (CLB rings, practice levels)

| Token | Light | Dark | Band |
| --- | --- | --- | --- |
| `score-high` | `#0E9F6E` | `#34C08F` | CLB 9 and up |
| `score-mid` | `#D6952C` | `#E9AD4C` | CLB 7 to 8 |
| `score-low` | `#CF4436` | `#EF6B5F` | Below 7 |

Use them only for scores, never as decoration.

### Rules

- Never use the official CELPIP blue and red pairing, or competitor purple.
- Teal on navy must be `brand-mint`, not `brand` (contrast).
- Text on emerald is always white. Text on navy is white or `white/55+`.
- Tints use opacity steps of the same token (`ink/10`, `ink/65`), not new hexes.

---

## 3. Typography

One humanist sans (Inter, `--font-brand-sans`). `font-serif` maps to the
same family, so existing heading classes keep working.

| Role | Classes |
| --- | --- |
| Hero H1 | `text-[2.5rem] sm:text-5xl lg:text-6xl font-extrabold leading-[1.04] tracking-tight` |
| Page H1 | `text-3xl sm:text-4xl font-bold tracking-tight` |
| Section H2 | `text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight tracking-tight` |
| Card / block H3 | `text-lg sm:text-xl font-bold tracking-tight` |
| App heading token | `text.heading` = `font-serif font-bold tracking-tight text-academy-navy` |
| Eyebrow | `text-xs font-semibold uppercase tracking-[0.2em] text-brand` (on navy: `text-brand-mint`) |
| Lead paragraph | `text-lg leading-8 text-ink/70` |
| Body | `text-base leading-7 text-ink/75` |
| Caption / legal | `text-xs leading-5 text-ink/50` |
| Numbers | add `tabular-nums` |

Headings are **bold**, never semibold. Use sentence case everywhere
("Start free trial", not "Start Free Trial"). House style: normal hyphens,
no em dashes.

---

## 4. Spacing and layout

- Page width: `max-w-6xl` (public), `max-w-5xl` (app content). Side padding `px-5 sm:px-8`.
- Section rhythm (public): `py-16 sm:py-24`. Eyebrow then `mt-3` H2, `mt-4/5` lead, `mt-10+` content.
- Card padding: `p-6 sm:p-8` (compact: `p-5`). Grid gaps: `gap-4` cards, `gap-5` feature tiles.
- Alternate section backgrounds so each band reads separately:
  cream, white, cream, cream-soft, navy (`bg-ink`), cream, white, navy, footer.
- Nothing scrolls sideways at 375px. Horizontal lists (filter chips,
  testimonial cards) scroll inside their own row with `-mx-5 px-5`.
- Public page tops: the first line of content starts `pt-10` (40px) under
  the header on every page, aligned with the header logo.
- In-page links: `html` carries `scroll-padding-top` equal to the sticky
  header (plus its border and the notch inset), so every `#section` lands
  flush under the header. Do not add `scroll-mt-*` to sections; it stacks.
  Anything that opens from the header (menus) floats over the page and
  never pushes it down.

---

## 5. Shape and elevation

| Element | Radius |
| --- | --- |
| Cards, list rows, stat strips | `rounded-2xl` (`radius.card`) |
| Feature panels, dialogs, bottom sheets, hero card | `rounded-3xl` (`radius.feature`) |
| Buttons, chips, tabs, avatars | `rounded-full` |
| Inputs, small tiles, icon badges | `rounded-xl` |

Shadows stay soft: cards `shadow-sm` plus `ring-1 ring-ink/10`; floating
things (sheet, assistant, featured card) `shadow-xl`/`shadow-2xl` with a
navy tint (`shadow-brand-ink/15`). No hard black shadows.

---

## 6. Components

### Buttons (`buttonVariants` in design-tokens)

| Variant | Look | When |
| --- | --- | --- |
| Primary | `bg-brand text-white hover:bg-brand-dark`, pill | The one main action on a screen |
| Secondary | white, `ring-1 ring-ink/15`, `hover:bg-academy-navy-soft` | Second action |
| Ghost | text only | Tertiary, in-line |
| Danger | `bg-academy-red` | Delete, cancel plan |

Heights: `h-9` small, `h-11` default, `h-12/13` hero and forms. On phones,
stacked hero buttons are full width. Minimum tap target 40px, 44px preferred.

### Cards

`cardStyles.default` = white, `rounded-2xl`, `shadow-sm`, hairline ring.
Highlighted cards use the soft emerald tint with an emerald ring.
A navy card (`bg-navy-panel text-white`) is for one hero element per
page, not a whole grid.

### Forms

Inputs `rounded-xl border border-ink/15 bg-white px-3 py-2`, label above
(`text-sm font-medium`), error text `text-academy-red` with a red-50 alert
box. Never rely on placeholder text as the label.

### Navigation

- **Desktop app:** navy sidebar (`AppSideNav`) with the plain logo in a
  row the same height as the top bar, so both share one centre line.
  Grouped "Practice" and "Learn with Amar". Active item: emerald pill. Top
  bar: program line, theme switch, Take a tour, account menu.
- **Logo and promise line:** the public header and the footer use the
  lockup with Decode · Practice · Succeed under the wordmark
  (`CelpipDecodedLogo showPromiseBelow`, small muted caps). Phones under
  380px (410px when signed out, because Get started also sits in the bar)
  get the plain logo. The hero shows the line on its own above the
  headline in eyebrow green (`BrandPromiseTagline tone="brand"`). The app
  sidebar and app top bar use the plain logo.
- **One way back:** a page that has its own "← Back to …" link does not also
  show the breadcrumb (`AppBreadcrumbs` skips `/dashboard/writing` and
  `/dashboard/speaking`).
- **Phone app:** slim top bar (logo, theme switch, avatar) plus the bottom
  tab bar: Home, Mocks, Speaking, Writing, More. More opens a bottom sheet
  with account, sign out, Courses, Live classes, theme switch and tour.
- **Public site:** light translucent header (`LandingHeader`) with five
  links, theme switch, Sign in, Get started. Phones get the public tab bar:
  Home, Results, CRS, Pricing, Sign in (or Dashboard). Every public page
  gets the header and footer through `PublicPageFrame`.

### Testimonials and scores

- `ScoreRing`: ring fills out of 12 in the score colour, number in the
  middle, skill label under it. Always the four skills in CELPIP order:
  Listening, Reading, Writing, Speaking.
- `TestimonialCard`: initial avatar, name, proof type, quote, highlight
  line ("First attempt", "Reading 6 → 10"), four small rings.
- Stats under a results headline are computed from the data
  (`resultsStats`), never typed.
- Only publish a testimonial with the student's written consent.

### Icons

Inline SVG line icons, `stroke-width 1.6 to 1.8`, round caps, `h-5 w-5`
(tab bar `h-[1.375rem]`), coloured by `currentColor`. No icon fonts, no
emoji in UI.

---

## 7. Mobile and PWA

- `viewport-fit=cover`; sticky headers pad with `env(safe-area-inset-top)`,
  tab bars and sheets with `env(safe-area-inset-bottom)`.
- Any fixed bottom bar must carry `data-mobile-tab-bar`. `globals.css`
  then pads the page under it and lifts `[data-assistant-bubble]` above it.
- Bottom sheets: `rounded-t-3xl`, grab handle, max `88dvh`, scroll inside,
  backdrop closes, Escape closes, body scroll locked, focus moves in.
- Use `dvh` not `vh` for full height on phones.
- Tap highlight is off; give every control a visible pressed or hover state instead.
- Below `sm` hide secondary labels, not primary actions.

---

## 8. Dark mode

Turned on by `data-theme="dark"` on `<html>`. The boot script in
`layout.tsx` sets it before first paint from `localStorage["celpip-theme"]`,
so there is no flash. All theme switches share one store and stay in sync.

| Role | Dark value |
| --- | --- |
| Page | `#0B1A2B` |
| Card / sheet (`bg-white`, `academy-paper`) | `#11263B` |
| Raised band (`cream-soft`) | `#102438` |
| Navy panel / `bg-ink` | `#0F2338` |
| Solid navy fill (`bg-academy-navy`) | `#2A4B6B` |
| Lines | `#24405A` |
| Text (`ink`, `academy-navy`, `foreground`) | `#E8EDF3` |
| Accent text (`text-brand`, `academy-blue`) | `#4FD1A1` |

How it works: text variables flip to light so every `ink/NN` opacity step
keeps its hierarchy. Solid surface utilities get explicit dark values in
`@layer utilities`.

Rules when writing new UI:

- Use the tokens above (`bg-white`, `bg-cream`, `text-ink`, `academy-*`).
  Raw hexes and `bg-slate-*` won't adapt.
- **Hover fills must be variable based:** `hover:bg-academy-navy-soft`,
  not `hover:bg-cream` or `hover:bg-white` (those stay light in dark).
- **Solid navy buttons and chips use `bg-academy-navy`**, not `bg-ink`
  (`bg-ink` is almost the page colour in dark).
- Rings around avatars use `ring-background`, not `ring-cream`.
- Shadows: `shadow-brand-ink/NN` or `shadow-black/NN`, not `shadow-ink`.
- Content on the navy panel uses `text-white/*` and `brand-mint`; it is
  dark in both themes.
- Check every new screen in both themes before merging.

---

## 9. Motion

`motion-safe:animate-sheet-up` for bottom sheets, `motion-safe:animate-fade-up`
for panels and tab content. Colour transitions on hover. Nothing bounces,
nothing autoplays, everything respects reduced motion.

---

## 10. The mock test player (do not touch)

The test screens are a neutral practice simulator, deliberately not branded.

- They use only the `player-*` and `academy-exam-*` tokens.
- `ExamModeViewport` carries `data-theme-scope="light"`, and the player root
  carries `data-mock-test-player`. Inside either, dark mode is switched off
  and every override is excluded.
- Exam routes (`exam-mode-routes.ts`) render with no shell, so no sidebar,
  top bar, tab bar or footer. Tab bars also hide whenever a test is on the page.
- Style sweeps and token changes must exclude `src/components/exam/**`,
  `src/components/mock-tests/**` and `src/app/dashboard/mock-tests/**`.
- Navigation buttons: Back and Next appear once, together, in the top bar
  (`MockTestTopBar`). Phone: a full-width row under the title and timer,
  Back left, Next right. Desktop: a pair at the top right. The bottom bar
  never repeats Back and only renders for a screen's extra action.

---

## 11. Do and don't

| Do | Don't |
| --- | --- |
| One emerald primary per screen | Navy primary in one place, green in another |
| `rounded-2xl` cards, pill buttons | Mix 8px, 16px and 24px cards on one page |
| Bold headings, sentence case | Semibold headings, Title Case buttons |
| Mint accents on navy | Deep teal text on navy |
| Real, consented, computed proof | Star ratings or numbers nobody can back up |
| Test at 375px and in dark mode | Ship desktop-only layouts |
| Leave the mock player alone | Restyle anything inside a test |

---

## 12. Audit summary (November 2026)

What was inconsistent, and what changed:

1. **Two primary colours.** App buttons were navy, public buttons green.
   Now one emerald primary everywhere.
2. **Mixed radii.** Cards ranged from `rounded-xl` to `rounded-3xl`. Now
   cards are `rounded-2xl`, feature panels and dialogs `rounded-3xl`.
3. **Heading weight.** Headings were semibold in the app, bold on the
   site. Now bold everywhere.
4. **Dead-end public pages.** CRS, draws, pricing, legal and others had
   no header or footer. They now share the site header, footer and tab bar.
5. **Dark hero.** The navy hero clashed with the client's light direction
   and looked broken in dark mode. It is now light, with a navy proof card.
6. **Loud pricing band.** The full green section is now a light section
   with a navy featured card.
7. **No mobile navigation.** Phones had a hamburger drawer only. Now a
   bottom tab bar plus a More sheet, in the app and on the public site.
8. **Assistant overlap.** The floating assistant now sits above the tab bar
   and collapses to an icon on phones.
9. **Dark mode disabled.** It is re-enabled with variable-based theming
   that keeps the mock test player light.
10. **No social proof.** The home page now has a results section and there
    is a `/results` page.

Open items (content, not design) are tracked in `docs/qa/manual-tracker.md`.
