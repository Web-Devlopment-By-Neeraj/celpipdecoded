# Exam engine screen shell (EXAM-01)

The shared screen frame for the Toronto Academy CELPIP-style practice
test engine.

Ticket: `docs/tickets/EXAM-01-screen-shell.md`

Companion documents:

- `docs/product/exam-engine-reference-audit.md` - reference audit
- `docs/product/exam-engine-screen-types.md` - the 16 screen types
- `docs/product/exam-engine-ticket-sequence.md` - build order
- `docs/product/mock-test-1-content-map.md` - Mock Test 1 content map

House style: normal hyphens only, no long hyphens or em dashes.

Status: built, then recalibrated once after review. Section 8 records what
the review changed and why.

---

## 1. Purpose

Every one of the 16 screen types sits inside the same frame: a grey title
bar, a white exam canvas, and a grey footer bar. Building any section
before the frame means building the frame three times.

This ticket builds the frame and nothing else. It ships no practice test
content, no media playback, no answer state, and no scoring. A later
ticket renders a screen body into the canvas and the frame keeps the
chrome consistent around it.

The shell is deliberately not the dashboard. The dashboard is a
marketing-adjacent surface with rounded cards, badges and pill buttons.
The exam surface is a focused practice test environment: restrained grey
bars, a white canvas, square cornered blue actions, and no decoration.

Product wording rules from the reference audit apply to everything the
shell renders: this is a Toronto Academy practice test engine offering
CELPIP-style practice, and practice estimates are not official CELPIP
scores. No official screenshot, logo, or wordmark enters the product.

---

## 2. Components created

Feature layer, `src/features/exam-engine/`:

| File | What it holds |
| --- | --- |
| `exam-shell-types.ts` | Types only. Timer state and reading, button variant and size, media kind, panel tone, scroll height, progress reading, layout family. |
| `exam-theme.ts` | Tailwind class recipes for the exam chrome, built from the existing academy palette. No new colour token was added. |
| `exam-copy.ts` | Learner facing wording and the two formatting helpers. Reuses `PRACTICE_ESTIMATE_DISCLAIMER` from `src/features/dashboard/dashboard-copy.ts` rather than writing new wording. |

Components, `src/components/exam/`:

| Component | Role |
| --- | --- |
| `ExamShell` | The frame. Composes the top bar, canvas, and bottom bar, and owns the title, timers, and navigation controls. |
| `ExamTopBar` | Grey title bar: title on the left, timer readings and optional meta text, blue Next on the far right. |
| `ExamBottomBar` | Grey footer bar: secondary actions on the left, Back on the right. |
| `ExamButton` | Exam chrome button. Variants primary, secondary, dark, plus a disabled state. Renders a link when `href` is set. |
| `ExamTimerDisplay` | One timer reading. States normal, warning, expired, muted. Displays a value, owns no clock. |
| `ExamInstructionRow` | Circled information glyph, optional bold heading, instruction text. No icon dependency. |
| `ExamCanvas` | The white exam area. Optional padding and a minimum height so the frame does not jump between screens. |
| `ExamTwoColumnLayout` | Split screen. Left content, right answers, optional column labels, per column scrolling, mobile stack. |
| `ExamPanel` | Bordered region with an optional header and footer, three tones, and four scroll heights. |
| `ExamMediaPlaceholder` | Reserved area for audio, video, or an image, with an inline glyph and a static non seekable track. Placeholder only. |
| `ExamProgressIndicator` | Question N of M, with a quiet progress bar. |
| `ExamShellPreviewLink` | Temporary dashboard card linking to the preview route. Not part of the exam surface. Delete it with the preview. |

Route, optional and created:

- `src/app/dashboard/mock-tests/shell-preview/page.tsx`

---

## 3. Supported screen layouts

The shell supports three layout families. Every screen type in
`docs/product/exam-engine-screen-types.md` maps onto one of them.

| Family | Built from | Screen types it serves |
| --- | --- | --- |
| `single` | `ExamShell` plus `ExamInstructionRow`, `ExamPanel` | 1 instructional text, 3 listening context, 7 dropdown questions, 13 answer review, 14 score summary, 15 end of section, 16 performance standards |
| `two-column` | `ExamShell` plus `ExamTwoColumnLayout` and `ExamPanel` | 6 listening radio questions, 8 reading split screen, 9 writing task, 12 speaking option choice |
| `media` | `ExamShell` plus `ExamMediaPlaceholder` | 2 instructional video, 4 listening audio intro, 5 listening video intro, 10 speaking preparation, 11 speaking recording |

Frame contract:

| Slot | Behaviour |
| --- | --- |
| Title | Always present. Reads `Toronto Academy practice test 1 - Listening Part 1`, never the official test wording. Truncates on a narrow screen. |
| Timer | Absent, one reading, or a list. Speaking passes the pair of preparation and recording. |
| Next | Top right, blue, primary, size xs. Accepts `nextHref` for a route or `onNext` for client held sequence state. `nextDisabled` covers a blocking media clip. |
| Back | Bottom left, secondary style, size sm. The corner diagonally opposite Next, so a mis-click cannot lose an answer. |
| Secondary | Optional, bottom right, for example a study mode review control. |

---

## 4. Visual rules

- Bars are grey, the canvas is white, actions are blue, the answer side
  of a split screen is light blue. Grey comes from `academy-navy-soft`,
  rules from `academy-line`, the canvas from `academy-paper`, the primary
  action from `academy-blue`, the answer wash from `academy-blue-soft`,
  and timer urgency from `academy-red`.
- No new colour token was added to `src/app/globals.css` and no new
  variant was added to `src/features/design/design-tokens.ts`. The exam
  recipes live in `exam-theme.ts` and consume the existing palette.
- Square corners inside the exam surface. Pill controls belong to the
  dashboard.
- Chrome is a strip, not a header. Both bars are a single small line of
  content with `py-1.5`, and the canvas takes the height they give up.
- Controls in the chrome are small: Next is `xs`, Back is `sm`, and `md`
  is reserved for an action inside the canvas.
- The canvas is two elements: a grey gutter and a bordered white sheet
  inside it. The border is what makes it read as a document the engine is
  displaying rather than as page background running behind the bars.
- The timer is bar text, not a chip. No background, no ring, no box.
  State is colour and weight only: navy while there is time, red as the
  window closes, red and bold at zero, soft grey for a fixed label.
- Exam type runs a step below the dashboard scale. Body and instruction
  copy is 13px on a 20px line, chrome and labels are 11px.
- No cards, no badges, no shadows, including on the frame.
- Uppercase labels on the chrome controls, Next and Back. An action
  inside the canvas can opt out with `uppercase={false}`.
- Instruction glyph is a bordered span holding the letter i, with a
  screen reader label. No icon package was installed.
- A split screen draws its own divider rather than leaving a gap between
  two blocks, and washes the answer column light blue.
- A media placeholder is a flat grey box with a solid rule and a small
  inert transport strip. Dashed outlines read as empty upload targets.
- Mobile: the title takes its own row and the controls wrap beneath it.
  Split columns stack, the divider turns horizontal, and every scrolling
  region keeps its own scrollbar, so no screen scrolls sideways.
- Long content scrolls inside a panel, never the frame.
- Do not stack two blues. A panel inside an already tinted answer column
  should be `plain`, or left out.

---

## 5. Preview route behaviour

`/dashboard/mock-tests/shell-preview` renders four samples:

1. Instruction screen, no timer, meta text, Next only.
2. Two column reading layout, single timer, unpadded canvas so the split
   fills it, both columns scrolling, with a secondary footer action.
3. Listening question layout, warning timer, audio placeholder on the
   left and a progress indicator with the question list on the light blue
   right column.
4. Speaking preparation layout, the preparation and recording timer pair,
   an image placeholder, and a static preparation panel.

How it is marked:

- Page title is `Practice test shell preview` under an
  `Internal preview` eyebrow, both from `examCopy`.
- A standing notice above the samples repeats `Internal preview` and
  states that nothing on the page is a practice test or is scored, so a
  screenshot of one sample cannot be mistaken for the product.
- A temporary dashboard card, `ExamShellPreviewLink`, links to the route
  from the bottom of `/dashboard`. It is styled as an internal note, not
  as a practice module: dashed rule, no artwork, and the words
  `Internal preview` first.

Rules the page follows:

- Placeholder text written for the preview only. No Mock Test 1 content.
- No official screenshot, no CELPIP logo, no official wording.
- The sample radio lists store nothing. Answer state arrives later.
- The Next and Back controls link between the samples on the page, so
  nothing navigates away.
- The route sits under `/dashboard`, so the dashboard layout auth guard
  covers it, and the page verifies the session again. It carries
  `robots: { index: false, follow: false }` and is still absent from
  navigation. The dashboard card is the only link to it.

---

## 6. What was intentionally not built

- No countdown. `ExamTimerDisplay` renders a value and a state. The clock
  belongs to the flow tickets.
- No screen sequence runner and no answer state. Navigation is per screen
  through an href or a handler.
- No media playback. `ExamMediaPlaceholder` reserves the area and nothing
  more.
- No question components. Radio lists, dropdown blanks, editors and
  recorders belong to EXAM-03, EXAM-05, EXAM-07 and EXAM-08.
- No scoring, no answer review table, no score summary.
- No Mock Test 1 content and no Cloudinary asset reference.
- No change to the existing Speaking or Writing flows, their AI routes,
  their prompts, or their schemas.
- No Supabase migration, no API route change, no auth change.
- No navigation entry. Turning the Reading and Listening dashboard cards
  on stays with EXAM-06. The one dashboard change is the temporary
  preview card, which is a review aid and not a product surface.
- No new dependency and no new design token.

---

## 7. How EXAM-02 and EXAM-03 should use it

Both tickets render a screen body and let the shell own the chrome.

**EXAM-02, instructional video screen (type 2).**

- Wrap the screen in `ExamShell` with a title, no timer, and
  `showBack={false}` on the first screen of a sequence.
- Replace `ExamMediaPlaceholder kind="video"` with the real player in the
  same slot. Keep the surrounding layout.
- The skip control goes in the canvas under the player, as an
  `ExamButton variant="secondary" uppercase={false}`.
- Media gating uses `nextDisabled` on the shell. Set it true while the
  clip is blocking and false on end or on skip. That means the screen is
  a client component, which is why no shell component carries
  `"use client"`: they are shared components that work in either context.
- The routing rule that skips the overview video for a single section
  entry is a route decision, not a shell prop.

**EXAM-03, Listening Part 1 prototype (types 3, 4, 6).**

- Context screen: `ExamShell` plus `ExamInstructionRow`, single family.
- Audio intro screen: `ExamShell` plus the media family, with
  `nextDisabled` held true until the clip finishes, matching the play
  once rule.
- Question screen: `ExamShell` plus `ExamTwoColumnLayout`, the audio
  panel on the left and an `ExamPanel tone="accent"` on the right holding
  `ExamProgressIndicator` and the radio list.
- Timers: pass `timerLabel={examCopy.timeRemainingLabel}` with the
  formatted value, and switch `timerState` to `warning` as the answer
  window closes and `expired` at zero. The ticket owns the clock, the
  shell renders the reading.
- Part 1 interleaves audio and questions, so the sequence lives in the
  ticket. The shell takes `onNext` and `onBack` handlers for a sequence
  held in client state.

Rules for both, and for every later ticket:

- Add copy to `exam-copy.ts`, not into a component.
- Add class recipes to `exam-theme.ts`, not into a component, and consume
  the existing palette rather than adding a colour.
- Do not fork `src/features/design/` or `src/components/app/`.
- Normal hyphens only.

---

## 8. Review pass: calibrating away from the app look

The first build was correct against the ticket and still wrong in the
room. It read as a modern web app that happened to contain a test:
generous bars, a chip shaped timer, floating panels with gaps between
them, and a dashed media box. Test software reads differently. Its chrome
is thin and unglamorous, its canvas is a bordered sheet, and its controls
are small because they are used a few times per screen and are not the
point of the screen.

This pass changed the calibration only. No behaviour, no props removed,
no screen content, and no new colour.

| Feedback | Change |
| --- | --- |
| Tighter grey top bar | Bar padding down to `py-1.5`, title down to 13px, readings and controls on one line. |
| Smaller blue Next | New `xs` button size, `h-6`, used by the top bar. `sm` for Back, `md` left for in canvas actions. Buttons squared off to `rounded-sm`. |
| Timer inside the bar, not card-like | `ExamTimerDisplay` lost its background, ring and rounding. It is bar text now, and state is carried by colour and weight. |
| Bordered white exam canvas | `ExamCanvas` renders a grey gutter with a bordered white sheet inside it, instead of one flat white block. |
| Grey bottom bar with Back | Back moved from bottom right to bottom left, sized `sm`. Secondary actions moved to the right. Bottom bar tightened to match the top. |
| Compact instruction text | Instruction rows and body copy dropped to 13px on a 20px line, chrome and labels to 11px, glyph to 16px. |
| Clearer two column split | The layout draws its own outer rule and divider through `divide-x`, rather than relying on a gap and a single left border. `bordered={false}` drops the outer rule when the split fills an unpadded canvas. |
| Light blue answer panel | Column tones added. `ExamTwoColumnLayout` washes the right column `accent` by default, so the answer side is light blue without an extra panel inside it. |
| Media placeholder as a grey box | Dashed outline replaced with a solid rule on a solid grey fill, plus an inert transport strip of play glyph, track and time. Not interactive, not seekable. |
| Findable preview | `ExamShellPreviewLink` added to the dashboard, and the route now says `Internal preview` in the eyebrow, the title, and a standing notice. |

Consequences worth knowing before the next ticket:

- `ExamPanel tone="accent"` inside a default two column right hand side
  is now blue on blue. Use `plain`, or drop the panel, as the preview
  samples do.
- Back is bottom left. Any screen that hard codes a Back position in its
  own body should follow, not fight it.
- The frame no longer carries a shadow, so an exam screen embedded in a
  padded dashboard page needs no extra separation.
- `ExamShellPreviewLink` and its call in `src/app/dashboard/page.tsx` are
  temporary. Delete both when the real practice test entry points ship in
  EXAM-06.
