// Listening answering windows (EXAM-15F).
//
// The one place that says how long a Listening screen gives a learner.
// Before this ticket every Listening screen ran the generic 30 second
// question window from exam-timer-utils.ts, which is right for Parts 1 to
// 3, where one screen holds one question, and badly wrong for Parts 4 to
// 6, where one screen holds the whole question set for the part.
//
// Types and constants only, no React and no side effects, so a route, a
// screen and a document generator can all read the same numbers.
//
// Where the numbers come from, and why they are labelled.
//
// docs/product/celpip-exam-rules-research.md section 17.5 records that the
// per-screen window in Parts 4 to 6 is not published as a number anywhere.
// What is published is the per-part allowance, which includes the clip, so
// a screen window has to be derived: part total minus clip length. Every
// derived value below carries source "derived" and the arithmetic that
// produced it, so nobody later reads them as sourced figures.
//
// Part 5 needed section 17.2 resolved first, because the part total itself
// was in dispute: the Listening Overview PDF says 6 minutes and the
// Listening Pro Study Pack says about 9 minutes. EXAM-15F resolves it in
// favour of 6 minutes, on three grounds:
//
// 1. The overview PDF is the only source that gives a per-part figure for
//    every part in one consistent unit, which is what section 17.2 itself
//    says to prefer until the conflict is settled.
// 2. The study pack's own strategy note says to allow roughly 30 seconds
//    per question. Eight questions at 30 seconds is 4 minutes, and 4
//    minutes of answering plus the 1.5 to 2 minute video is 6 minutes,
//    which is the overview PDF figure exactly.
// 3. Taking 9 minutes would put Part 5 above Part 6, an 8 minute part with
//    a 3 minute clip, which no other source supports.
//
// So the Part 5 screen window is 4 minutes, and it is the one value below
// that two independent readings agree on. The resolution is written up in
// docs/product/listening-format-strict-timing-polish.md and section 17.2
// of the research document should be read alongside it.
//
// House style: normal hyphens only, no long hyphens or em dashes.

// Where a duration came from.
//
// Nothing in Listening is "published" today, because no source prints a
// screen window as a number. The value is kept so a future mock test whose
// timings are published can say so rather than being flattened into the
// derived pile, and it is the same distinction the timer rule in
// docs/product/admin-mock-test-builder-blueprint.md carries.
export type ListeningTimerSource = "published" | "derived";

// One answering window.
export type ListeningScreenTimer = {
  seconds: number;
  // When the reading turns amber, and then red. A 30 second window and a 5
  // minute window need very different notice, so both thresholds travel
  // with the duration rather than being left to the generic defaults.
  warningAtSeconds: number;
  urgentAtSeconds: number;
  source: ListeningTimerSource;
  // How the number was arrived at, in one line. Read by a person, never
  // rendered.
  note: string;
};

// Parts 1 to 3: one question per screen, 30 seconds each.
//
// This is the one Listening figure that is published directly, and it is
// the number the screens have carried since EXAM-03, so this ticket
// changes what happens at zero and not the duration.
export const LISTENING_QUESTION_TIMER: ListeningScreenTimer = {
  seconds: 30,
  warningAtSeconds: 10,
  urgentAtSeconds: 5,
  source: "published",
  note: "30 seconds per question, published for Listening Parts 1 to 3.",
};

// Long window thresholds. A minute of amber and twenty seconds of red on a
// window measured in minutes, rather than the ten and five seconds that
// suit a 30 second question.
const LONG_WINDOW_WARNING_SECONDS = 60;
const LONG_WINDOW_URGENT_SECONDS = 20;

// Parts 4 to 6: the whole question set on one screen, one window for it.
//
// Keyed by part number rather than by part id, so a second mock test whose
// Part 4 is the same shape reads the same window without a new entry.
export const LISTENING_PART_SCREEN_TIMERS: Readonly<
  Record<number, ListeningScreenTimer>
> = {
  4: {
    seconds: 210,
    warningAtSeconds: LONG_WINDOW_WARNING_SECONDS,
    urgentAtSeconds: LONG_WINDOW_URGENT_SECONDS,
    source: "derived",
    note: "Part 4 is about 5 minutes and its news clip is about 1.5 minutes, leaving about 3.5 minutes for the 5 questions.",
  },
  5: {
    seconds: 240,
    warningAtSeconds: LONG_WINDOW_WARNING_SECONDS,
    urgentAtSeconds: LONG_WINDOW_URGENT_SECONDS,
    source: "derived",
    note: "Part 5 is 6 minutes and its discussion video is about 2 minutes, leaving 4 minutes for the 8 questions. 8 questions at the study pack's 30 seconds each is the same 4 minutes. Research document section 17.2 resolved in favour of 6 minutes.",
  },
  6: {
    seconds: 300,
    warningAtSeconds: LONG_WINDOW_WARNING_SECONDS,
    urgentAtSeconds: LONG_WINDOW_URGENT_SECONDS,
    source: "derived",
    note: "Part 6 is about 8 minutes and its report clip is about 3 minutes, leaving about 5 minutes for the 6 questions.",
  },
};

// The window for one part's single question screen.
//
// Falls back to the per question window for a part number with no entry,
// which is the safe direction: a screen that should have had a long window
// and did not is obvious the first time anybody runs it, where a screen
// with no window at all would silently stop enforcing anything.
export function getListeningPartScreenTimer(
  partNumber: number,
): ListeningScreenTimer {
  return LISTENING_PART_SCREEN_TIMERS[partNumber] ?? LISTENING_QUESTION_TIMER;
}
