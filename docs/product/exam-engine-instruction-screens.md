# Exam engine instruction and video screens (EXAM-02)

Screen types 1 and 2 for the Toronto Academy CELPIP-style practice test
engine: the instructional text screen and the instructional video screen.

Ticket: `docs/tickets/EXAM-02-instruction-video-screens.md`

Companion documents:

- `docs/product/exam-engine-screen-shell.md` - the EXAM-01 shell these
  screens sit inside
- `docs/product/exam-engine-screen-types.md` - the 16 screen types
- `docs/product/exam-engine-reference-audit.md` - reference audit
- `docs/product/mock-test-1-content-map.md` - Mock Test 1 content map

House style: normal hyphens only, no long hyphens or em dashes.

Status: built. Reusable screens and an internal preview route only. No
Mock Test 1 flow is connected.

---

## 1. Components created

Feature layer, `src/features/exam-engine/`:

| File | What it holds |
| --- | --- |
| `instruction-screen-types.ts` | Types only. Section key, instruction line, section intro detail, instructional video asset, and the two screen content shapes the flow tickets can declare a section with. |
| `instructional-video-assets.ts` | The five instructional videos, keyed by section, plus the lookup helpers and `resolveExamMediaSrc`. |

Components, `src/components/exam/`:

| Component | Role |
| --- | --- |
| `ExamInstructionScreen` | Screen type 1. Instruction row, bulleted list, optional notice, optional intro block, optional children, inside `ExamShell`. |
| `ExamVideoScreen` | Screen type 2. Instruction row, player in a bordered area, optional skip control, inside `ExamShell`. |
| `ExamVideoPlayer` | Native HTML video in a clean bordered area, with a caption strip and a fallback message. The only exam component that holds state, so the only one marked `"use client"`. |
| `ExamInstructionList` | The bulleted instruction list. One idea per line, faint rule between lines, optional bold lead in per line. |
| `ExamSectionIntroCard` | Quiet bordered strip naming the section, with optional label and value pairs. Not a dashboard card. |

Files changed rather than created:

| File | Change |
| --- | --- |
| `src/features/exam-engine/exam-theme.ts` | Added `examVideo`, `examIntroCard`, and `examScreenBody` recipes. No new colour token, no new design token variant. |
| `src/features/exam-engine/exam-copy.ts` | Added the instructional video wording, the fallback wording, and the instruction preview page wording. |
| `src/components/exam/ExamShellPreviewLink.tsx` | Now renders both internal preview links instead of one. The exported name is unchanged, so the dashboard page keeps its single import. |
| `src/app/dashboard/page.tsx` | Comment only, so it names both previews. |

No new dependency was installed. The player is native HTML video and the
glyph work stays inline, exactly as in EXAM-01.

---

## 2. Video asset map

`src/features/exam-engine/instructional-video-assets.ts` exports
`INSTRUCTIONAL_VIDEO_ASSETS`, a `Record<ExamSectionKey, ExamInstructionalVideoAsset>`.
All five files already existed in the repository. Nothing was downloaded,
copied, moved, or renamed.

| Key | Title | `src` |
| --- | --- | --- |
| `overview` | Complete test overview video | `/assets/instructional-thumbnails/1. Overview Instructional Video.mp4` |
| `listening` | Listening instructional video | `/assets/instructional-thumbnails/2. Listening Instructional Video.mp4` |
| `reading` | Reading instructional video | `/assets/instructional-thumbnails/3. Reading Instructional Video.mp4` |
| `writing` | Writing instructional video | `/assets/instructional-thumbnails/4. Writing Instructional Video.mp4` |
| `speaking` | Speaking instructional video | `/assets/instructional-thumbnails/5. Speaking Instructional Video.mp4` |

Each entry carries `section`, `title`, `src`, and `description`. `poster`
and `durationLabel` are optional and are unset for all five, because
there is no poster image for any of them and the running times are not
recorded anywhere in the repository. An invented duration would be shown
to a learner as fact, so nothing is shown instead.

Also exported:

- `INSTRUCTIONAL_VIDEO_ORDER` - play order of the five clips
- `getInstructionalVideoAsset(section)` - typed lookup
- `listInstructionalVideoAssets()` - the five clips in play order
- `resolveExamMediaSrc(src)` - encodes each path segment so a file name
  containing spaces and a leading `1. ` still loads, and returns an
  absolute URL such as a Cloudinary link unchanged

`src` holds the raw public path on purpose, so a reader can match it
against the file on disk. Encoding happens in the player.

All five entries are exercised by the preview route, so a broken path or
a missing file shows up on one page rather than section by section.

---

## 3. Preview route

`/dashboard/mock-tests/instruction-preview` renders nine samples in the
order a full practice test opens with. All five local instructional
videos appear, so the whole instructional sequence can be reviewed in one
place:

1. Complete test overview video screen
2. Listening instruction text screen
3. Listening instructional video screen
4. Reading instruction text screen
5. Reading instructional video screen
6. Writing instruction text screen
7. Writing instructional video screen
8. Speaking instruction text screen
9. Speaking instructional video screen

The samples are built from one list in the page, so the numbering and the
Next and Back targets cannot drift apart when a screen is added or
reordered. Each section contributes its instruction screen and its
instructional video screen from the same record.

How it is marked:

- Page title is `Practice test instruction screens preview` under an
  `Internal preview` eyebrow, both from `examCopy`.
- A standing notice above the samples repeats `Internal preview` and
  states that nothing on the page is a practice test or is scored, so a
  screenshot of one sample cannot be mistaken for the product.
- `robots: { index: false, follow: false }`, no navigation entry, and the
  route sits under `/dashboard` so the layout auth guard covers it. The
  page verifies the session again, because a layout does not re-render on
  client navigation.

Rules the page follows:

- The five video screens play the real Toronto Academy instructional
  clips, each one read from the registry through
  `getInstructionalVideoAsset`. No path is typed into the page. Every
  instruction line on the page is placeholder text written for the
  preview, because the section instructions are not structured yet.
- No Mock Test 1 content, no question, no official screenshot, no CELPIP
  logo, and no official wording.
- Next, Back and Skip link between the samples on the page and wrap
  around at the ends, so nothing navigates away and nothing is saved.
- A missing video file needs no special handling on the page.
  `ExamVideoPlayer` swaps the stage for the fallback message, so the
  sample still renders and nothing looks broken. All five files are
  present today.

Both previews are reachable from the temporary dashboard block at the
bottom of `/dashboard`, rendered by `ExamShellPreviewLink`. Each card
says `Internal preview` before anything else.

---

## 4. How these screens match the exam flow

From `docs/product/exam-engine-screen-types.md`, the section mapping is
`1, 2` for every section opening, and `2` alone for the test overview.

| Flow position | Screen | Component |
| --- | --- | --- |
| Start of a full practice test | Complete test overview video | `ExamVideoScreen` with the `overview` asset |
| Start of a section | Section instructions | `ExamInstructionScreen` |
| After the section instructions | Section instructional video | `ExamVideoScreen` with that section asset |
| Start of a part | Part instructions | `ExamInstructionScreen` |
| End of a section | End of section screen, type 15 | Also a bulleted list, so `ExamInstructionScreen` covers it |

Contract with the shell:

- Neither screen renders chrome. `ExamShell` owns the title, the timer
  slot, and the Next and Back controls.
- Instruction and video screens carry no timer in the reference layouts.
  `ExamInstructionScreen` still accepts the timer props so a timed
  instruction screen does not need a second component.
  `ExamVideoScreen` does not.
- Navigation takes either an href or a handler, so a screen works inside
  a route based sequence or a client held one.
- The skip control sits in the canvas under the player, as
  `ExamButton variant="secondary" uppercase={false}`, matching the note
  in section 7 of the shell document.
- The player replaces `ExamMediaPlaceholder kind="video"` in the same
  slot. The layout around it does not change.

Player behaviour:

| Requirement | How it is met |
| --- | --- |
| Native HTML video | A `<video>` element. No player library, no new dependency. |
| Controls | `controls` on. The native control set is keyboard reachable and screen reader aware. |
| Preload metadata | `preload="metadata"` by default. A `preload` prop drops it to `none` for a page holding several players. |
| Responsive | An aspect-video stage with the element filling it, so the box keeps its shape at any width and never forces a sideways scroll. |
| No autoplay | No `autoPlay` attribute anywhere. Nothing plays until the learner asks. |
| Fallback text | Two layers. A media error swaps the stage for a message from `examCopy.videoFallbackHeading` and `videoFallbackText`. A browser that cannot play video at all shows `videoUnsupportedText` from inside the element. |

The `src` sits on the element rather than on a `<source>` child on
purpose: a failed load fires `error` on the media element only when the
attribute form is used, so the fallback can react to a missing file.

---

## 5. What was intentionally not built

- No Listening Part 1, no Reading Part 1, and no other section content.
- No full Mock Test 1 flow, no screen sequence runner, and no saved
  progress.
- No real section instruction text. Every instruction line in the preview
  is placeholder copy. Structuring the real instructions is content work
  that belongs with the section tickets.
- No change to the Speaking or Writing flows, their AI routes, their
  prompts, or their schemas.
- No scoring change.
- No Supabase migration, no API route change, no auth change, no service
  role call.
- No payment and no live classes work.
- No official screenshot, no CELPIP logo or wordmark, and no official
  test wording in any component or document.
- No media file was moved, renamed, downloaded, or copied.
- No new dependency, no new colour token, and no new design token
  variant.

---

## 6. Known follow-up items

1. **Folder name is wrong.** `public/assets/instructional-thumbnails/`
   holds five mp4 videos, not thumbnails. Renaming it to something like
   `public/assets/instructional-videos/` is a file move, so it needs its
   own ticket. `INSTRUCTIONAL_VIDEO_DIRECTORY` in
   `instructional-video-assets.ts` is the single constant that changes
   when it happens.
2. **File names need normalising.** The names carry spaces and a leading
   `1. `, which is why `resolveExamMediaSrc` exists. Rename them to
   lower case hyphenated names in the same ticket as the folder move.
3. **File sizes.** The five clips total about 250 MB and are served from
   `public/`, where the default cache header is `max-age=0`. Before these
   screens ship to learners, decide whether the clips move to a CDN or a
   video host. The registry is the only place that changes. The preview
   route now holds all five players on one page. Each one preloads
   metadata only and none autoplays, so nothing downloads a clip until
   the reviewer presses play, but the page is still the heaviest in the
   app.
4. **No poster images.** A poster would give the player a still frame
   instead of a black stage before playback. Add one per clip and set
   `poster` in the registry.
5. **No durations.** `durationLabel` is unset for all five. Fill it in
   once the real running times are known.
6. **No captions.** There is no `.vtt` track for any clip, so the videos
   are not accessible to a learner who is deaf or hard of hearing. This
   needs a decision before the screens are learner facing.
7. **Real instruction text.** The section instructions in the source
   document are written against the official test. They must be rewritten
   as Toronto Academy wording before they enter the product, as already
   recorded in the content map gap list.
8. **Temporary dashboard block.** `ExamShellPreviewLink` and its call in
   `src/app/dashboard/page.tsx` are review aids. Delete both when the
   real practice test entry points ship in EXAM-06.

---

## 7. How EXAM-03 should use these screens

EXAM-03 builds the Listening Part 1 prototype, which opens with screen
type 1 and then moves into the context, audio, and question screens.

- Use `ExamInstructionScreen` for the Listening section instructions and
  for the Part 1 instruction screen. Pass `instructions` as data, not as
  markup, and put an `ExamSectionIntroCard` in the `intro` slot when the
  screen needs to state which part is starting.
- Use `ExamVideoScreen` with `getInstructionalVideoAsset("listening")`
  for the Listening instructional video. Do not hard code a path.
- The overview video is skipped when a learner enters a single section
  directly. That is a routing decision in the flow ticket, not a screen
  prop.
- Media gating: hold `nextDisabled` true on the screen while a clip is
  blocking, and pass `onVideoEnded` to release it. Both screens accept
  handlers, so the sequence can live in client state. A screen that
  passes a handler must be a client component, since `ExamVideoPlayer`
  already is.
- Listening Part 5 plays a video in the audio slot. That is screen type
  5, not screen type 2, so reuse `ExamVideoPlayer` inside the listening
  layout rather than reusing `ExamVideoScreen`.
- Add any new wording to `exam-copy.ts` and any new class recipe to
  `exam-theme.ts`. Do not put either in a component, and do not fork
  `src/features/design/` or `src/components/app/`.
- Normal hyphens only.
