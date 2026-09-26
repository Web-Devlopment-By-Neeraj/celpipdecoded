// The Speaking windows, and where every number in them came from
// (EXAM-27).
//
// Speaking is the only section in the engine with two clocks on one
// screen, and it is the section whose timings are hardest to source, so
// they get a file of their own rather than being typed into the content
// file eight times over.
//
// Where the numbers came from
// ---------------------------
//
// The Mock Test 1 source document,
// `mock-tests/mock-test-1/Mock Test 1 -Sajinlinks.docx`, publishes one
// Speaking timing and only one:
//
//   Try to complete this practice Speaking Test in 15 minutes.
//
// It publishes no per-task figure in words. Three of its prompt images do
// carry a preparation countdown in the picture: the Task 3 and Task 4
// images show "Preparation Time 29" and the Task 8 image shows
// "Preparation Time 30", which is a 30 second preparation window caught
// mid tick.
//
// The per-task pairs below come from the official Speaking overview,
// `public/Overview and Scoring Descriptors/4. Speaking/Speaking -
// Overview.pdf`, read and recorded as a table in
// `docs/product/celpip-exam-rules-research.md` section 5. That research
// document is the project's transcription of a scanned PDF, so the
// figures are labelled "reference" rather than "published": a real
// source, but not one printed in the Mock Test 1 file.
//
// A disagreement, recorded rather than resolved
// ---------------------------------------------
//
// `docs/product/mock-test-1-content-map.md` also holds a timing table,
// read from screenshots, and it disagrees with the research table on two
// tasks: it gives Task 6 a 30 second preparation where the research gives
// 60, and Task 7 a 60 second recording where the research gives 90.
//
// The research table is used here, for three reasons. It names its source
// as the official Speaking overview, while the content map calls its own
// table "values read from the screenshots, for reference only" and lists
// confirming them as an open task. It is per-task rather than grouped, so
// it distinguishes tasks the screenshot table lumps together. And it adds
// up: the eight preparation windows total 5 minutes and the eight
// recording windows total 9 minutes, which is 14 minutes of clock inside
// the 15 minutes the source document publishes for the Speaking Test. The
// content map's figures total 13 minutes, which leaves two minutes of the
// published allowance unaccounted for.
//
// The check is in code below, not only in this comment: see
// sumSpeakingSectionSeconds and SPEAKING_SECTION_PUBLISHED_SECONDS.
//
// Task 5 is the one task with three windows rather than two. The
// research table reads "60 seconds (x2)" for its preparation, because the
// official task runs across a choice screen and a comparison screen with
// 60 seconds on each.
//
// This prototype used to give Task 5 one screen and therefore one of
// those two windows, which was a documented simplification. SPEAKING-05A
// built the four screens the official task actually has, so both windows
// are back and each one is on the screen it belongs to:
// speakingTaskFiveChooseTimer runs the choice screen and
// speakingTaskFivePrepTimer runs the preparation screen. The section
// total goes up by 60 seconds as a result, to 15 minutes exactly, which
// is what speakingWindowsFitPublishedAllowance is checked against below.
//
// What these windows do and do not do
// -----------------------------------
//
// They count, they change colour, and at zero they read "Time is up".
// Nothing else. Reaching zero does not start a recording, stop one, erase
// one, advance a screen or call anything. The learner continues by
// pressing Next when they are ready. That is what the ticket asks a
// prototype timer to do, and strict Speaking timing is a later ticket.
//
// Pure values and pure functions, no React and no side effects, so this
// file is safe to import from a server component or a client component.
//
// House style: normal hyphens only, no long hyphens or em dashes.

import type {
  SpeakingSectionContent,
  SpeakingTaskContent,
  SpeakingTaskTimer,
} from "./speaking-mock-types";

// The Speaking Test allowance the source document publishes, in seconds.
//
// "Try to complete this practice Speaking Test in 15 minutes." The only
// Speaking timing printed in words anywhere in the Mock Test 1 file. It
// is not a window anything counts down: it is the figure the eight pairs
// below are checked against.
export const SPEAKING_SECTION_PUBLISHED_SECONDS = 900;

// Thresholds for the preparation window.
//
// A preparation window is 30 or 60 seconds, so a five minute amber like
// the Writing one would mean the clock was amber from the first tick. Ten
// seconds of amber and five of red is roughly the same fraction of a
// short window that sixty and twenty seconds are of a Reading part.
const PREP_WARNING_SECONDS = 10;
const PREP_URGENT_SECONDS = 5;

// Thresholds for the recording window.
//
// Wider than the preparation ones, because a speaker needs enough notice
// to finish the sentence they are in rather than be cut off mid clause.
const RESPONSE_WARNING_SECONDS = 20;
const RESPONSE_URGENT_SECONDS = 10;

// A preparation window, from the official Speaking overview.
//
// Every Mock Test 1 preparation window comes from the same place, so the
// note is written once here rather than eight times in the content file.
export function speakingPrepTimer(seconds: number): SpeakingTaskTimer {
  return {
    seconds,
    warningAtSeconds: PREP_WARNING_SECONDS,
    urgentAtSeconds: PREP_URGENT_SECONDS,
    source: "reference",
    note:
      "Preparation window from the official Speaking overview, as recorded in the table in docs/product/celpip-exam-rules-research.md section 5. The Mock Test 1 Task 3, Task 4 and Task 8 prompt images show a 30 second preparation countdown in the picture, which agrees with the table on those three tasks.",
  };
}

// A recording window, from the same table.
export function speakingResponseTimer(seconds: number): SpeakingTaskTimer {
  return {
    seconds,
    warningAtSeconds: RESPONSE_WARNING_SECONDS,
    urgentAtSeconds: RESPONSE_URGENT_SECONDS,
    source: "reference",
    note:
      "Recording window from the official Speaking overview, as recorded in the table in docs/product/celpip-exam-rules-research.md section 5. Nothing enforces it: the countdown reaches zero, reads Time is up, and the recording carries on until the learner stops it.",
  };
}

// The choice window for Task 5 (SPEAKING-05A).
//
// The first of the two windows the research table reads as "60 seconds
// (x2)": the one the learner spends reading both camps and picking one.
// It is its own function rather than a call to speakingPrepTimer because
// it is not a preparation window. Nothing is being planned in it, and its
// note has to be able to say what happens when it closes, which is
// different from what happens when a preparation window closes: a
// preparation window running out leaves the learner ready to record,
// while this one running out leaves them with a choice still to make and
// no clock left to make it on. Neither one advances anything.
//
// The amber and red thresholds are the preparation ones, because it is
// the same 60 seconds and a learner should not have to learn two sets of
// colours inside one task.
export function speakingTaskFiveChooseTimer(
  seconds: number,
): SpeakingTaskTimer {
  return {
    seconds,
    warningAtSeconds: PREP_WARNING_SECONDS,
    urgentAtSeconds: PREP_URGENT_SECONDS,
    source: "reference",
    note:
      "The first of the two 60 second windows the official Speaking overview records for Task 5, spent choosing between the two camps. Nothing is enforced: the countdown reaches zero, reads Time is up, and the learner chooses and presses Next when they are ready. Pressing Next with nothing chosen selects an option, which is what the source screen says happens.",
  };
}

// The preparation window for Task 5, which the source splits in two.
//
// Separated from speakingPrepTimer so the difference is stated in the
// data rather than lost in a shared note. The figure is the source's own
// 60 seconds, and it is the second of the two: the first is the choice
// window above.
export function speakingTaskFivePrepTimer(seconds: number): SpeakingTaskTimer {
  return {
    seconds,
    warningAtSeconds: PREP_WARNING_SECONDS,
    urgentAtSeconds: PREP_URGENT_SECONDS,
    source: "reference",
    note:
      "The second of the two 60 second windows the official Speaking overview records for Task 5, spent planning how to argue for the chosen camp against the camp the sister is suggesting. Nothing is enforced: the countdown reaches zero, reads Time is up, and the learner presses Next when they are ready.",
  };
}

// Every window in the section, in seconds.
//
// Summed from the tasks rather than written down, so the intro card and
// the sixteen countdowns cannot disagree.
export function sumSpeakingSectionSeconds(
  content: SpeakingSectionContent,
): number {
  return content.tasks.reduce(
    (total, task) =>
      total +
      speakingTaskPrepSeconds(task) +
      task.responseTimer.seconds,
    0,
  );
}

// The planning time on one task, in seconds.
//
// The preparation window, plus the choice window on the one task that has
// one (SPEAKING-05A). Both are windows the learner spends reading and
// deciding rather than speaking, so the intro card counts them together
// under "Preparation time" and the section total counts them at all.
//
// Written here rather than inline in the two sums below, so a task with a
// third window cannot be counted by one of them and missed by the other.
export function speakingTaskPrepSeconds(task: SpeakingTaskContent): number {
  return task.prepTimer.seconds + (task.choiceStep?.chooseTimer.seconds ?? 0);
}

// Just the preparation windows, in seconds.
export function sumSpeakingPrepSeconds(
  content: SpeakingSectionContent,
): number {
  return content.tasks.reduce(
    (total, task) => total + speakingTaskPrepSeconds(task),
    0,
  );
}

// Just the recording windows, in seconds.
export function sumSpeakingResponseSeconds(
  content: SpeakingSectionContent,
): number {
  return content.tasks.reduce(
    (total, task) => total + task.responseTimer.seconds,
    0,
  );
}

// Whether the section's windows fit inside the published allowance.
//
// The check the long note at the top of this file describes, written as
// code so it can be read from the intro screen rather than trusted. The
// windows are the clock time inside the tasks; the difference between
// them and the published 15 minutes is the time spent reading prompts and
// moving between screens, so fitting inside is the right test and
// matching exactly would be the wrong one.
export function speakingWindowsFitPublishedAllowance(
  content: SpeakingSectionContent,
): boolean {
  return (
    sumSpeakingSectionSeconds(content) <= SPEAKING_SECTION_PUBLISHED_SECONDS
  );
}
