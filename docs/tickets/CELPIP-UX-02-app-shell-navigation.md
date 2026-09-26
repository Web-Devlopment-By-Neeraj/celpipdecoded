# CELPIP-UX-02 - Responsive App Shell and Navigation

## Goal

Create a responsive signed-in app shell and navigation system for the Toronto Academy of Education CELPIP app.

The audit found that the signed-in header has weak navigation, mobile users cannot clearly confirm their account, and learners do not have a clean way to move between Dashboard, Speaking, Writing, Live Classes, and account actions.

This ticket should improve navigation only.

Do not redesign the learner dashboard.
Do not change speaking logic.
Do not change writing logic.
Do not change AI scoring logic.
Do not change authentication logic.
Do not change Supabase schema.
Do not create migrations.
Do not build payment.
Do not build usage limits.
Do not delete assets.
Do not install new dependencies.

## Product

Toronto Academy of Education CELPIP Preparation Program

## Context

Completed before this ticket:

- Speaking practice
- Writing practice
- Speaking history and progress
- Writing history and progress
- Asset optimization
- Badge and icon normalization
- Design-system foundation

Use the design-system components created in CELPIP-UX-01 where appropriate.

Use:

- AppPageShell
- AppCard
- AppButton
- AppButtonLink
- AppStatusBadge
- AppAssetImage
- design tokens
- module asset map where useful

## App shell requirements

Create or update a reusable signed-in app shell.

Suggested files:

src/components/app/AppShell.tsx
src/components/app/AppTopNav.tsx
src/components/app/AppSideNav.tsx
src/components/app/AppMobileNav.tsx
src/components/app/AppNavLink.tsx
src/components/app/AppUserMenu.tsx
src/components/app/AppBreadcrumbs.tsx

Update the protected dashboard layout where appropriate.

Likely file to inspect:

src/app/dashboard/layout.tsx

Do not restructure routes unless clearly necessary.

## Navigation items

Signed-in navigation should include:

1. Dashboard

- href: /dashboard

2. Speaking Practice

- href: /dashboard/speaking

3. Writing Practice

- href: /dashboard/writing

4. Live Classes

Use the safest available destination:

- If /dashboard/live-classes exists, link there
- If only a public live-class section exists, link to the best current public section
- If no route exists, show as Coming soon or Request schedule without creating a new full feature

5. Account action

- Show signed-in user email where available
- Show sign out action using the existing sign out pattern
- Do not rewrite auth logic

## Desktop UX

Desktop should have:

- clear top area or sidebar
- Toronto Academy brand presence
- visible navigation links
- active route highlighting
- user email or account indicator
- sign out action
- consistent page container spacing
- no horizontal overflow

Preferred layout:

- sidebar or top navigation for desktop
- mobile bottom or drawer navigation for mobile

Use the existing app structure before deciding.

## Mobile UX

Mobile should have:

- clear app header
- visible Toronto Academy branding
- menu button or compact navigation
- current account email visible in the menu
- easy tap targets
- no hidden account identity issue
- no horizontal overflow
- active route state
- sign out action

Do not rely on hover.

## Active route styling

Active nav item should be visually clear.

Examples:

- navy background with white text
- soft blue background with navy text
- left border or pill indicator

Use the design-system tokens.

Do not duplicate random Tailwind styles across files.

## Account menu

Use the existing authenticated user data.

Show:

- user email if available
- signed-in status
- sign out button or link

Do not expose secrets.
Do not call service role from client components.
Do not create new auth tables.
Do not change login or signup logic.

## Logo and branding

Use existing branding assets safely.

Prefer current logo files already used by the app.

Do not replace logos in this ticket.
Do not convert logos in this ticket.
Do not move logos in this ticket.

If logo quality is poor, document it in the ticket summary only.

## Page shell adoption

Use the new app shell for signed-in routes under:

- /dashboard
- /dashboard/speaking
- /dashboard/writing
- /dashboard/speaking/attempts
- /dashboard/writing/attempts
- result pages under attempts if already inside dashboard layout

Do not manually wrap every page if dashboard layout can handle it centrally.

## Do not redesign content

The following should not be redesigned in this ticket:

- dashboard content
- speaking task cards
- writing task cards
- result pages
- history tables
- landing page

Only navigation and shell structure should improve.

Small spacing adjustments are allowed only when needed to make the shell work.

## Accessibility requirements

- nav landmarks should be clear
- menu button should have aria-label
- active link should use aria-current where appropriate
- keyboard focus should be visible
- tap targets should be comfortable on mobile
- sign out control should be reachable by keyboard
- images should have meaningful alt text or decorative empty alt when appropriate

## Security requirements

- Do not read .env.local
- Do not print secrets
- Do not expose Supabase service role key
- Do not expose OpenAI keys
- Do not touch API routes
- Do not change auth helpers unless a tiny import path fix is required
- Do not change RLS or migrations

## Manual Supabase steps

None.

Do not create migrations.

## Documentation

Create:

docs/product/app-shell-navigation.md

Include:

1. What navigation was added
2. Desktop behavior
3. Mobile behavior
4. Account and sign out behavior
5. Routes included
6. Routes intentionally not added
7. How this prepares for dashboard redesign
8. Known follow-up items

## Important UI copy rule

Do not use long hyphens or em dashes anywhere in UI copy, docs, comments, or prompts. Use normal hyphens only.

## Done criteria

- signed-in app shell exists
- desktop navigation works
- mobile navigation works
- user email is visible in account/menu area where available
- sign out still works
- active route state works
- dashboard route still works
- speaking routes still work
- writing routes still work
- no full dashboard redesign is done
- no speaking/writing logic changes
- no AI logic changes
- no Supabase migration is created
- no dependency is installed
- no assets are deleted
- docs/product/app-shell-navigation.md exists
- npm run lint passes
- npm run build passes
