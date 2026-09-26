// Learner facing wording for the full Listening section screens
// (EXAM-15).
//
// Same rule as listening-copy.ts and listening-review-copy.ts: the screens
// the section owns share one wording file, so a change lands in one place
// rather than in seven components.
//
// Three wording rules this file exists to hold the line on:
//
// - Nothing here claims an official CELPIP score or an official CELPIP
//   level. The result is named a CELPIP Decoded practice result every
//   time it appears, and the note under it says so in a full sentence.
// - Nothing on a part transition screen says anything about how the
//   learner did. A transition is a doorway between two parts, and a score
//   there would be the part level score this ticket exists to remove.
// - Nothing here says an answer is wrong when the answer key is missing.
//   The pending wording is about the key, never about the learner.
//
// buildListeningSectionCopy takes the test label, the way
// buildListeningReviewCopy takes the part label, so a second mock test
// gets its wording from a call rather than from a copy of this file.
//
// Strings and pure helpers only, no side effects, so this file is safe to
// import from a client component.
//
// House style: normal hyphens only, no long hyphens or em dashes.

export type ListeningSectionCopyOptions = {
  // The test as a learner names it, for example "Mock Test 1".
  testLabel: string;
};

export type ListeningSectionCopy = {
  // Shared chrome.
  sectionLabel: string;
  sectionName: string;
  practiceResultNote: string;

  // Instruction text screen.
  instructionTitle: string;
  instructionHeading: string;
  instructionSubtitle: string;
  instructionLines: string[];
  instructionNotice: string;
  introTitle: string;
  introSummary: string;

  // Instructional video screen.
  videoTitle: string;
  videoDescription: string;
  videoHelperText: string;

  // Part transition screens.
  transitionHeading: string;
  transitionHint: string;

  // Marking screen, shown while the section is checked.
  markingHeading: string;
  markingText: string;
  markingFailedHeading: string;
  markingFailedText: string;
  markingRetryLabel: string;

  // Answer review screen.
  reviewTitle: string;
  reviewSubtitle: string;
  viewScoreLabel: string;
  backLabel: string;
  reviewNotice: string;

  // Practice score screen.
  scoreTitle: string;
  scoreSubtitle: string;
  totalQuestionsLabel: string;
  answeredLabel: string;
  correctLabel: string;
  scoreLabel: string;
  pendingValue: string;
  pendingScoreHeading: string;
  pendingScoreText: string;
  breakdownTitle: string;
  breakdownPartColumn: string;
  breakdownCorrectColumn: string;
  breakdownAnsweredColumn: string;
  endSectionLabel: string;
  reviewAnswersLabel: string;

  // Estimated band card on the practice score screen.
  estimatedBandLabel: string;
  estimatedBandRangeNote: string;
  estimatedBandSourceNote: string;
  estimatedBandNote: string;

  // End of section screen.
  endTitle: string;
  endMessage: string;
  backToDashboardLabel: string;
  restartLabel: string;
  nextSectionPlaceholder: string;
  endNotice: string;

  // Progress bar.
  progressLabel: string;
};

// Wording for one test's full Listening section screens.
export function buildListeningSectionCopy({
  testLabel,
}: ListeningSectionCopyOptions): ListeningSectionCopy {
  return {
    sectionLabel: "Listening",
    sectionName: "Listening section",
    practiceResultNote:
      "This is a CELPIP Decoded practice result, not an official CELPIP score.",

    // 1. Listening instruction text screen.
    //
    // The lines the ticket asks for, in order. They are held as a list
    // rather than as six fields so the screen renders them with the
    // EXAM-02 instruction list and the order lives in one place.
    instructionTitle: "Listening Test",
    // Heading beside the information glyph on the instructions screen
    // (EXAM-UI-03). It used to read "Instructions:", which is what every
    // other screen in the player says, so the one screen that is nothing
    // but instructions was the one screen that did not name itself.
    instructionHeading: "Listening Test Instructions",
    instructionSubtitle:
      "Read the following information before the Listening section begins.",
    instructionLines: [
      "This section has 6 parts.",
      "You will listen to conversations, a news item, a discussion, and viewpoints.",
      "Answer all questions.",
      "At the end, you will review your answers and see a practice score.",
      "This is CELPIP Decoded practice, not an official CELPIP score.",
    ],
    // EXAM-15B dropped the "Internal prototype" opening. This route is a
    // learner facing test now, so the notice says what a learner needs to
    // know about their answers and their score and nothing about which
    // build stage the screen is at. What it protects, that the result is
    // not an official CELPIP one, is unchanged.
    instructionNotice:
      "Your answers are held on this screen only, nothing is saved, and the practice score is not an official CELPIP result.",
    introTitle: "Listening section",
    introSummary:
      "Six parts in one run, with the answer review and the practice score at the end rather than after each part.",

    // 2. Listening instructional video screen.
    videoTitle: "Listening instructional video",
    videoDescription:
      "Watch this short video before you start the Listening section.",
    videoHelperText:
      "The video can be replayed, and you can continue before it finishes.",

    // Part transition screens. No score, no count, and nothing about how
    // the last part went.
    transitionHeading: "Part complete",
    transitionHint:
      "Take a moment to get ready. Continue when you want the next part.",

    // Marking screen.
    //
    // A section that keeps its answer keys on the server has its review
    // rows and its practice score fetched rather than calculated in the
    // browser. That is normally too fast to read, but it can fail, and a
    // failure needs a screen that says so and offers another go.
    //
    // The wording is about the check, never about the answers. Nothing
    // here implies a result before one exists.
    markingHeading: "Checking your answers",
    markingText:
      "Your Listening answers are being checked. This takes a moment, and nothing is saved.",
    markingFailedHeading: "Your answers could not be checked",
    markingFailedText:
      "The Listening answer review could not be loaded. Check your connection, confirm you are still signed in, and try again. Your answers are still held on this page.",
    markingRetryLabel: "Try again",

    // 9. Full Listening answer review.
    reviewTitle: "Listening Answer Review",
    reviewSubtitle: "Review your answers before viewing your practice score.",
    viewScoreLabel: "View Listening score",
    backLabel: "Back",
    reviewNotice:
      "This review is held on this screen only. Nothing is saved and this is not an official CELPIP result.",

    // 10. Full Listening practice score.
    scoreTitle: "Listening Practice Score",
    scoreSubtitle: "Your practice result for the whole Listening section.",
    totalQuestionsLabel: "Total questions",
    answeredLabel: "Answered",
    correctLabel: "Correct",
    scoreLabel: "Practice score",
    pendingValue: "Pending",
    pendingScoreHeading: "Answer key pending",
    pendingScoreText:
      "Part of the Listening answer key is not available yet, so no practice score is calculated. Your answers are shown in the review table, and none of them are marked wrong.",
    breakdownTitle: "Part breakdown",
    breakdownPartColumn: "Part",
    breakdownCorrectColumn: "Correct",
    breakdownAnsweredColumn: "Answered",
    endSectionLabel: "End Listening section",
    reviewAnswersLabel: "Review answers",

    // Estimated band card (EXAM-15C).
    //
    // Three wording rules, and the first one is the reason this block is
    // reviewed rather than edited casually:
    //
    // - The reading is named an estimate every time it appears, and the
    //   note under it says in a full sentence that it is not an official
    //   CELPIP score. Nothing here says official score, official band,
    //   guaranteed band or final result.
    // - The range note says out loud that the source chart's rows overlap,
    //   so a two level reading reads as the chart being approximate rather
    //   than as the app being unsure of its own arithmetic.
    // - The source note says where the mapping came from, so a learner or a
    //   teacher can check it, and does not claim the mapping models how a
    //   real level is calculated. It does not.
    estimatedBandLabel: "Estimated CELPIP Listening band",
    estimatedBandRangeNote:
      "The score ranges on that chart overlap, so an estimate can cover two levels.",
    estimatedBandSourceNote:
      "Estimated from the published CELPIP Listening score chart, which maps a Listening score out of 38 to a CELPIP level. A real CELPIP level also takes question difficulty into account, which a practice estimate cannot do.",
    estimatedBandNote:
      "This is a CELPIP Decoded practice estimate, not an official CELPIP score.",

    // 11. End of Listening section.
    endTitle: "End of Listening Section",
    endMessage: `You have completed the Listening section of ${testLabel}.`,
    backToDashboardLabel: "Back to dashboard",
    restartLabel: "Restart Listening section",
    nextSectionPlaceholder: "Reading section will be added later.",
    endNotice:
      "Nothing from this run has been saved. Restarting clears all of the answers held on this page.",

    // Progress bar.
    progressLabel: "Listening progress",
  };
}

// Mock Test 1. Also the default every section screen falls back to when no
// copy is passed.
export const listeningSectionCopy = buildListeningSectionCopy({
  testLabel: "Mock Test 1",
});

// Transition line between two parts, for example
// "Part 3 complete. Continue to Listening Part 4."
export function formatListeningSectionTransition(
  completedPartLabel: string,
  nextPartLabel: string,
): string {
  return `${completedPartLabel} complete. Continue to ${nextPartLabel}.`;
}

// Part position inside the section, for example "Listening Part 3 of 6".
export function formatListeningSectionPartPosition(
  partNumber: number,
  totalParts: number,
): string {
  return `Listening Part ${partNumber} of ${totalParts}`;
}

// Top bar note on a screen belonging to a part, for example
// "Listening Part 3 of 6 - Screen 27 of 61".
export function formatListeningSectionPartMeta(
  partNumber: number,
  totalParts: number,
  screenNumber: number,
  totalScreens: number,
): string {
  return `${formatListeningSectionPartPosition(
    partNumber,
    totalParts,
  )} - Screen ${screenNumber} of ${totalScreens}`;
}

// Top bar note on a screen the section owns rather than a part, for
// example "Listening section - Screen 1 of 61".
export function formatListeningSectionMeta(
  screenNumber: number,
  totalScreens: number,
): string {
  return `Listening section - Screen ${screenNumber} of ${totalScreens}`;
}

// Answered line under the progress bar, for example
// "12 of 38 questions answered."
export function formatListeningSectionAnswered(
  answered: number,
  total: number,
): string {
  return `${answered} of ${total} question${
    total === 1 ? "" : "s"
  } answered.`;
}

// Line under the estimated band, for example
// "Estimated from 25 correct answers out of 38."
//
// The raw count is repeated here rather than left to the summary card
// above, so the reading and the number it came from are never read apart.
export function formatListeningBandBasis(
  correctCount: number,
  totalQuestions: number,
): string {
  return `Estimated from ${correctCount} correct answer${
    correctCount === 1 ? "" : "s"
  } out of ${totalQuestions}.`;
}

// Breakdown cell, for example "5 / 8".
//
// The section score screen prints its four headline readings through the
// EXAM-04 ListeningScoreSummaryCard, so the percentage and the missing key
// line are formatted there and have no twin here.
export function formatListeningSectionCountOfTotal(
  count: number,
  total: number,
): string {
  return `${count} / ${total}`;
}
