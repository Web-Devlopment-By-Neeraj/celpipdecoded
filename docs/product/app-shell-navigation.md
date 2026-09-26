# App shell and navigation

Ticket: CELPIP-UX-02

Scope: navigation and shell structure only. No dashboard, speaking,
writing, scoring or auth changes were made.

## 1. What navigation was added

Before this ticket the signed in area had a single header row: brand
lockup on the left, email and sign out on the right, no links. Moving
between Dashboard, Speaking and Writing meant using the browser back
button or a card on the dashboard.

Added:

- `src/components/app/AppShell.tsx` - the frame for every protected
  screen, replaces `DashboardShell`
- `src/components/app/AppTopNav.tsx` - sticky top bar, owns the mobile
  drawer state
- `src/components/app/AppSideNav.tsx` - desktop sidebar
- `src/components/app/AppMobileNav.tsx` - mobile drawer
- `src/components/app/AppNavLink.tsx` - one nav link with the shared
  active recipe
- `src/components/app/AppNavIcon.tsx` - inline line icons for the nav
- `src/components/app/AppUserMenu.tsx` - account area, desktop dropdown
  and mobile panel
- `src/components/app/AppBreadcrumbs.tsx` - crumb trail for nested pages
- `src/features/navigation/app-nav-items.ts` - the nav list, the active
  route rule and the breadcrumb builder

`src/app/dashboard/layout.tsx` now renders `AppShell`, so every route
under `/dashboard` gets the navigation without any page being touched.

`AppHeader.tsx` and `DashboardShell.tsx` were removed. They were used
only by the dashboard layout and are fully replaced by `AppShell`.

Styling comes from `src/features/design/design-tokens.ts`, so the active
state and the focus ring are defined once and shared by the sidebar and
the drawer.

## 2. Desktop behavior

At `lg` and above:

- a fixed width sidebar sits on the left, sticky to the viewport, so the
  nav stays put while a long attempt history scrolls
- the sidebar carries the Toronto Academy lockup, the four nav links and
  the practice disclaimer
- the active link is navy with white text and carries `aria-current`
- the top bar keeps the program name on the left and the account menu on
  the right
- the account menu is a button showing the user initial and email, and it
  opens a dropdown with the email and the sign out button
- the content column is capped and centred, and it carries `min-w-0` so
  wide content scrolls inside its own container rather than pushing the
  page sideways

## 3. Mobile behavior

Below `lg`:

- the sidebar is hidden
- the sticky top bar shows the Toronto Academy lockup and a menu button
- the menu button has `aria-label`, `aria-expanded` and `aria-controls`
- opening it fills the screen under the header with the drawer, so no
  tap target competes with page content
- the drawer opens with the account block first: initial, "Signed in",
  the full email, and a full width sign out button
- each nav link is at least 56px tall and shows a supporting line, so
  nothing depends on hover
- tapping a link, pressing Escape, or navigating back closes the drawer
- the page behind the drawer does not scroll while it is open

The drawer stores the route it was opened on rather than a boolean. A
route change closes it during render, which keeps the project lint rule
against setting state inside an effect satisfied.

## 4. Account and sign out behavior

The email comes from the existing server side session check in
`src/app/dashboard/layout.tsx`, which already calls
`supabase.auth.getUser()`. It is passed down as a prop. No new session
lookup, no Supabase call from a client component beyond sign out, and no
change to any auth helper.

If the account has no email the layout falls back to "Signed in", which
is the behavior that was already there.

`SignOutButton` keeps its original sign out call: browser client,
`signOut()`, then push to `/` and refresh. It now renders through
`AppButton` and accepts variant, size and full width props so the same
control fits both the desktop dropdown and the mobile drawer. It is a
real button, so it is reachable and operable by keyboard in both places.

## 5. Routes included

| Item | Destination |
| --- | --- |
| Dashboard | `/dashboard` |
| Speaking Practice | `/dashboard/speaking` |
| Writing Practice | `/dashboard/writing` |
| Live Classes | `/#live-classes` |

Active matching: Dashboard matches exactly, the others match themselves
and anything nested under them. So `/dashboard/writing/attempts/123`
keeps Writing Practice highlighted.

Every route under `/dashboard` inherits the shell through the layout,
including the attempt lists, the task pages, the practice pages and the
result pages.

Live Classes has no route inside the app. The public program page
already has a live classes section, so the nav item links there instead
of creating a placeholder screen. It never takes the active style,
because it leaves the signed in area.

## 6. Routes intentionally not added

- `/dashboard/live-classes` - out of scope, it would need a schedule and
  a booking flow
- account or profile settings - no settings feature exists yet
- billing or subscription - payment is not in scope
- reading and listening modules - not built yet, they appear on the
  dashboard as module cards and do not need a nav slot
- no existing route was renamed, moved or restructured

## 7. How this prepares for dashboard redesign

The dashboard page was not touched. What the redesign now inherits:

- the frame is settled, so a redesign only has to fill the content
  column and does not have to solve navigation at the same time
- `AppShell` provides the page padding and the max width, so pages no
  longer need their own outer container
- breadcrumbs are derived from the path, so any new route under
  `/dashboard` gets a trail for free
- adding a nav item is a single entry in
  `src/features/navigation/app-nav-items.ts`, picked up by the sidebar,
  the drawer and the active state together
- the shell uses the academy design tokens, so the dashboard content can
  move onto the same palette without the frame changing again

## 8. Known follow-up items

- the dashboard content still uses the older cream and ink classes while
  the shell uses the academy tokens. The two warm off whites are close,
  but the content should move onto the tokens in the dashboard redesign
  ticket
- Live Classes points at the public landing section, which takes the
  learner out of the signed in app. Replace it with a real
  `/dashboard/live-classes` route when a schedule exists
- the desktop account dropdown closes on Escape and outside click but
  does not trap or restore focus. Worth revisiting if the menu grows
  past sign out
- the mobile drawer does not trap focus. It sits directly after its
  toggle button in the DOM so Tab reaches it in order, but a full focus
  trap would be better once the drawer holds more controls
- there is no dedicated Live Classes icon, the speaking icon set was
  reused for the module map and a screen icon is used in the nav
- the brand mark in the nav is `public/favicon.png` at 40px. It is sharp
  at that size. The larger logo files stay untouched by this ticket
