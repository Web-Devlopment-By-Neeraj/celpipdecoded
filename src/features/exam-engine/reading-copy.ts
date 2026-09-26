// Learner facing wording for the Reading screens (EXAM-16, score and
// review wording added by EXAM-17).
//
// Same rule as exam-copy.ts and listening-copy.ts: all Reading chrome
// copy lives in one file so the screens say the same thing everywhere,
// and so a wording change is one edit rather than four. The closing
// screen wording sits in its own object at the foot of the file,
// readingReviewCopy, rather than in readingCopy below.
//
// What this file deliberately does not copy from the source document:
//
// - "On the official test, once you leave a page, you cannot go back to
//   it to change your answers. However, in this practice test, you can."
//   That is a Reading Test instruction, not a Part 1 instruction, and the
//   Reading instructions screen is not built in this ticket. The half of
//   it that is true of this prototype is said plainly instead, in
//   partIntroNotice.
// - Any wording naming the official test as the thing the learner is
//   sitting. This is CELPIP Decoded practice software, which is the rule
//   docs/product/exam-engine-reference-audit.md section 9 sets out.
//
// Strings and pure helpers only, no side effects, so this file is safe to
// import from a client component.
//
// House style: normal hyphens only, no long hyphens or em dashes.

import type { ReadingReviewStatus } from "./reading-types";

export const readingCopy = {
  // Part intro screen.
  partIntroSubtitle:
    "Read the following information before this part of the practice test begins.",
  partIntroNotice:
    "Internal prototype. Answers are held on this screen only and nothing is saved. A practice score is shown at the end of the part and is lost when you leave. You can move back and forward between screens and your answers stay as you left them.",
  // What the learner is given, shown on the intro card.
  partIntroFormatLabel: "Message, response and drop-down questions",

  // Split screen column labels.
  passageColumnLabel: "Reading passage",
  questionsColumnLabel: "Questions",
  // Left column label on the diagram part (EXAM-18). Reading Part 2 is
  // answered from a picture rather than from prose, so calling that
  // column "Reading passage" would describe the wrong thing.
  diagramColumnLabel: "Diagram",
  // Left column label on the paragraph matching part (EXAM-20). Reading
  // Part 3's left column is a set of labelled paragraphs a learner scans
  // rather than a passage read straight through, and the source document
  // names the part "Reading for Information", so the column says
  // Information.
  informationColumnLabel: "Information",
  // Left column label on the viewpoints part (EXAM-22). Reading Part 4's
  // left column is a website article carrying several people's views on
  // one proposal, and the second panel on the right is a body of prose
  // too, so naming this column "Reading passage" would not say which of
  // the two a learner is being pointed at.
  articleColumnLabel: "Article",

  // Question list.
  //
  // The placeholder is a real option with an empty value rather than a
  // disabled first choice, so an unanswered select reads "Select answer"
  // instead of silently defaulting to the first option. Same decision
  // ListeningDropdownQuestionList made and for the same reason.
  dropdownPlaceholder: "Select answer",
  // Read in place of the drawn underscores, which are decorative.
  blankLabel: "blank",
  // Accessible name for a numbered blank that prints no stem, for example
  // question 7 inside the reply. Screen readers get "Question 7" rather
  // than a bare number.
  questionNumberLabel: "Question",
  // Shown under the question column while questions are outstanding.
  //
  // EXAM-17 replaced "Answer every question to continue.", which was the
  // wording of a gate that no longer exists. Next is always available, so
  // the line says what a blank costs rather than what it blocks.
  blanksAllowedHint:
    "You can continue with questions unanswered. Any question left blank is counted as incorrect.",

  // Timer label in the top bar. The same sentence as
  // examCopy.timeRemainingLabel, kept separate so Reading can be reworded
  // without touching the other three sections.
  partTimerLabel: "Time remaining",

  // Completion screen.
  //
  // The pending review line is a plain sentence rather than a disabled
  // button, following the rule ListeningPartCompleteScreen sets out: a
  // greyed out control says "press this in a moment", and there is
  // nothing behind it.
  partCompletePendingReview:
    "The answer review and the practice score for this part are added in the next ticket.",
  partCompleteNotice:
    "Nothing from this run has been saved. Restarting clears the answers held on this page.",
  partCompleteBackToDashboardLabel: "Back to dashboard",
  partCompleteRestartLabel: "Restart Reading Part 1",
  partCompleteHeading: "Reading Part 1 complete",

  // Marking states, shown while the server marks the part and if it
  // could not.
  //
  // The failure wording names both causes, a lost session and a request
  // that did not arrive, because they leave the learner in the same place
  // with the same thing to do.
  markingHeading: "Marking your answers",
  markingText:
    "Your answers are being checked. This takes a moment and nothing is saved.",
  markingFailedHeading: "Your answers could not be marked",
  markingFailedText:
    "The check did not complete. Your answers are still held on this page, so you can try again, or go back and change them first. You may need to sign in again.",
  markingRetryLabel: "Try again",

  // Page metadata and the exam region name, for the route.
  part1PageTitle: "Mock Test 1 reading part 1 - CELPIP Decoded",
  part1PageDescription:
    "Internal prototype of Mock Test 1 Reading Part 1, Reading Correspondence.",
  part1ExamRegionLabel: "Mock Test 1 - Reading Part 1",

  // Reading Part 2 (EXAM-18).
  //
  // Part 2 closes on the EXAM-16 completion screen rather than on a score,
  // because its review and its score are the next ticket. So it needs its
  // own heading and its own restart label, and it reuses
  // partCompletePendingReview and partCompleteNotice above unchanged: both
  // say what is true of this part too.
  partTwoIntroFormatLabel: "Diagram, email and drop-down questions",
  partTwoCompleteHeading: "Reading Part 2 complete",
  partTwoRestartLabel: "Restart Reading Part 2",
  part2PageTitle: "Mock Test 1 reading part 2 - CELPIP Decoded",
  part2PageDescription:
    "Internal prototype of Mock Test 1 Reading Part 2, Reading to Apply a Diagram.",
  part2ExamRegionLabel: "Mock Test 1 - Reading Part 2",

  // Reading Part 3 (EXAM-20, closing screens added by EXAM-21).
  //
  // Part 3 closed on the EXAM-16 completion screen until EXAM-21 gave it
  // a practice score and an answer review, the way EXAM-19 gave Part 2
  // its own. The completion heading and the restart label below both
  // stay: the restart label is what the score screen's restart button
  // says, and the heading still names the screen buildReadingFlow can
  // build for this part on request.
  //
  // The format label names what the learner is given rather than the
  // part title, the way the Part 1 and Part 2 labels do. Nine statements
  // are matched to lettered paragraphs, so it says so.
  partThreeIntroFormatLabel: "Labelled paragraphs and paragraph matching",
  partThreeCompleteHeading: "Reading Part 3 complete",
  partThreeRestartLabel: "Restart Reading Part 3",
  part3PageTitle: "Mock Test 1 reading part 3 - CELPIP Decoded",
  part3PageDescription:
    "Internal prototype of Mock Test 1 Reading Part 3, Reading for Information.",
  part3ExamRegionLabel: "Mock Test 1 - Reading Part 3",

  // Reading Part 4 (EXAM-22, closing screens added by EXAM-23).
  //
  // Part 4 closed on the EXAM-16 completion screen until EXAM-23 gave it
  // a practice score and an answer review, which is the same move EXAM-19
  // made for Part 2 and EXAM-21 made for Part 3. The completion heading
  // and the restart label below both stay: the restart label is what the
  // score screen's restart button says, and the heading still names the
  // screen buildReadingFlow can build for this part on request.
  //
  // The format label names what the learner is given rather than the part
  // title, the way the three labels above do. Part 4 is an article, a
  // reader comment with blanks in it, and drop-downs against both, so it
  // says so.
  partFourIntroFormatLabel: "Article, reader comment and drop-down questions",
  partFourCompleteHeading: "Reading Part 4 complete",
  partFourRestartLabel: "Restart Reading Part 4",
  part4PageTitle: "Mock Test 1 reading part 4 - CELPIP Decoded",
  part4PageDescription:
    "Internal prototype of Mock Test 1 Reading Part 4, Reading for Viewpoints.",
  part4ExamRegionLabel: "Mock Test 1 - Reading Part 4",

  // Dashboard internal preview badge (EXAM-18, cut back by EXAM-24).
  //
  // The one Reading card on the dashboard is the full Reading section
  // card, whose wording lives in readingSectionCopy below. This badge is
  // what marks it as an internal build link rather than a released
  // module, and it keeps saying so on purpose: the Reading run still has
  // the prototype behaviour its ticket left in place, and nothing on the
  // card claims a CELPIP level, an official Reading band or a full
  // all-skills Mock Test 1.
  //
  // EXAM-18, EXAM-20 and EXAM-22 each added a card for one Reading part,
  // and their wording lived here beside this badge. EXAM-24 removed those
  // four cards from the dashboard once the assembled Reading section had
  // its own card, so the wording went with them. The four part routes
  // were not touched and still open when their URL is typed.
  //
  // This string goes when the Reading entry point stops being a preview.
  dashboardPreviewBadgeLabel: "Internal preview",
} as const;

// Screen position line, for example Screen 2 of 3.
//
// The Reading counterpart of formatListeningScreenPosition. It is not
// shared with Listening because the two sections are worded separately by
// design, and a shared helper would be one import away from making a
// Reading change a Listening change.
export function formatReadingScreenPosition(
  current: number,
  total: number,
): string {
  return `Screen ${current} of ${total}`;
}

// Answered count under the question column, for example
// "8 of 11 questions answered."
export function formatReadingAnsweredCount(
  answered: number,
  total: number,
): string {
  return `${answered} of ${total} questions answered.`;
}

// Completion line, for example "You answered 8 of 11 questions."
export function formatReadingCompletionMessage(
  answered: number,
  total: number,
): string {
  return `You answered ${answered} of ${total} questions.`;
}

// Wording for the Reading Part 1 score and answer review screens
// (EXAM-17).
//
// A second object rather than more keys on readingCopy above, so the
// closing screens can be reworded without reading past the question
// screen wording, and so it is obvious at a glance which strings are the
// ones that must never claim an official result.
//
// Two rules this object exists to hold the line on, the same two
// listening-review-copy.ts holds:
//
// - Nothing here claims an official CELPIP score or an official CELPIP
//   level. The result is named a CELPIP Decoded practice score every
//   time it appears, and the note under it says in a full sentence that
//   it is not an official CELPIP score.
// - Nothing here estimates a CELPIP Reading band. A band needs the full
//   Reading section and this is one part of four, so there is no wording
//   for one and no screen that could print one.
//
// It is written out for Reading Part 1 rather than built from a part
// label the way buildListeningReviewCopy is. There is one Reading part,
// so a builder now would be a builder with one caller; the moment Reading
// Part 2 reaches its own review, this becomes buildReadingReviewCopy and
// the Part 1 export becomes one call to it, which is exactly the move
// EXAM-06 made for Listening.
export const readingReviewCopy = {
  // Score screen.
  scoreTitle: "Reading Part 1 practice score",
  scoreSubtitle: "Your result for this part. Nothing has been saved.",
  totalQuestionsLabel: "Total questions",
  answeredLabel: "Answered",
  blankLabel: "Left blank",
  correctLabel: "Correct",
  scoreLabel: "Practice score",
  // The one sentence that stops the percentage above it being read as an
  // official result. It sits with the number rather than elsewhere on the
  // screen, so the two are never separated.
  practiceResultNote:
    "This is a CELPIP Decoded practice score, not an official CELPIP score. No CELPIP Reading level is estimated from one part.",
  // Said out loud on the score screen, because a blank is counted as a
  // wrong answer and a learner should not have to work that out from the
  // numbers.
  blankNote:
    "Questions left blank are counted as incorrect in this score. The correct answer for each of them is shown in the review.",
  reviewAnswersLabel: "Review answers",
  restartLabel: "Restart Reading Part 1",
  backToDashboardLabel: "Back to dashboard",
  scoreNotice:
    "Nothing from this run has been saved. Leaving or restarting clears the answers and the score held on this page.",

  // Answer review screen.
  reviewTitle: "Reading Part 1 answer review",
  reviewSubtitle:
    "Every question in this part, with the answer you chose and the correct answer.",
  backToScoreLabel: "Back to score",
  // Column labels inside a review card.
  yourAnswerLabel: "Your answer",
  correctAnswerLabel: "Correct answer",
  // Printed in place of a selected answer on a blank.
  noAnswerText: "No answer selected",
  // Printed in place of a correct answer where a part has no usable key
  // for the question. Mock Test 1 Reading Part 1 never reaches it: its
  // key is complete and confirmed.
  missingAnswerText: "Answer key not available",
  // Said under the cards, so the review is not read as an explanation.
  reviewNotice:
    "This review is held on this screen only. Nothing is saved, no explanations are written for these answers, and this is not an official CELPIP result.",
  // Shown in the unreachable case of a review with no rows in it, rather
  // than an empty screen with no account of itself.
  reviewEmptyText: "There are no questions to review for this part.",

  // The question text a reply blank prints in the review. Questions 7 to
  // 11 have no stem of their own, so the row names the blank instead of
  // inventing a sentence the source does not have.
  responseBlankQuestionText: "Blank in the written response.",

  // The same line for a Reading Part 2 blank (EXAM-19). Questions 1 to 5
  // sit inside the email on the right rather than a written reply, so
  // the neutral line above would point a learner at the wrong text. The
  // marking action passes this one in, the way the Part 2 screens pass
  // their own titles in below.
  emailBlankQuestionText: "Blank in the email message.",

  // Titles for the Reading Part 2 closing screens (EXAM-19). Everything
  // else on those screens is part neutral and reused as it stands: the
  // subtitles, the four summary labels, the practice result note, the
  // blank note, the two answer labels, both notices and the status
  // words. Only the three lines that name the part are written twice.
  partTwoScoreTitle: "Reading Part 2 practice score",
  partTwoReviewTitle: "Reading Part 2 answer review",

  // Titles for the Reading Part 3 closing screens (EXAM-21). Two lines
  // again, and nothing else, for the same reason: everything else on
  // those screens is part neutral and reused as it stands.
  //
  // Part 3 needs no blank question text beside these, unlike Part 2. Its
  // nine questions are whole statements that each carry their own text,
  // so formatReadingQuestionText prints the statement and never falls
  // through to a line naming a blank.
  partThreeScoreTitle: "Reading Part 3 practice score",
  partThreeReviewTitle: "Reading Part 3 answer review",

  // The question text a Reading Part 4 comment blank prints in the review
  // (EXAM-23). Questions 6 to 10 sit inside the reader comment under the
  // article, so neither of the two lines above would point a learner at
  // the right body of text: Part 1's names a written reply and Part 2's
  // names an email message, and this part has neither. The marking action
  // passes this one in, the way markReadingPartTwo passes its own.
  commentBlankQuestionText: "Blank in the reader comment.",

  // Titles for the Reading Part 4 closing screens (EXAM-23). Two lines
  // again, and nothing else, for the same reason: everything else on
  // those screens is part neutral and reused as it stands.
  //
  // These are the fourth near identical pair, which is the point
  // docs/product/reading-part-3-review-score.md named as the moment to
  // build buildReadingReviewCopy and one shared pair of screens. That
  // move is deliberately not made here: it would mean editing three live
  // routes' components to land a fourth part, and this ticket is asked
  // not to change Reading Parts 1 to 3. It is written up as the first
  // thing EXAM-24 should consider instead.
  partFourScoreTitle: "Reading Part 4 practice score",
  partFourReviewTitle: "Reading Part 4 answer review",
} as const;

// Status labels for a review card. Short, plain, and not a badge.
export const readingReviewStatusLabels: Record<ReadingReviewStatus, string> = {
  correct: "Correct",
  incorrect: "Incorrect",
  blank: "Blank",
};

// Question heading on a review card, for example "Question 7".
export function formatReadingQuestionLabel(questionNumber: number): string {
  return `Question ${questionNumber}`;
}

// A count against the part total, for example "9 of 11".
export function formatReadingCountOfTotal(
  count: number,
  total: number,
): string {
  return `${count} of ${total}`;
}

// Practice score, for example "82%".
export function formatReadingScorePercent(percent: number): string {
  return `${percent}%`;
}

// Headline line on the score card, for example
// "You answered 9 of 11 questions correctly."
export function formatReadingScoreMessage(
  correct: number,
  total: number,
): string {
  return `You answered ${correct} of ${total} questions correctly.`;
}

// Wording for the full Reading section screens (EXAM-24).
//
// A third object beside readingCopy and readingReviewCopy, for the
// screens the section owns rather than a part: the section intro, the
// three part transitions, the full Reading practice score with its
// breakdown and its estimated band, and the full Reading answer review.
//
// It is a separate object rather than more keys on the two above for the
// reason readingReviewCopy gives about itself: it is obvious at a glance
// which strings are the ones that must never claim an official result,
// and the section can be reworded without reading past the part wording.
//
// Four wording rules this object exists to hold the line on:
//
// - Nothing here claims an official CELPIP score or an official CELPIP
//   level. The result is named a CELPIP Decoded practice score every
//   time it appears, and the note under it says so in a full sentence.
// - Nothing on a part transition screen says anything about how the
//   learner did. A transition is a doorway between two parts, and a score
//   there would be the part level score this ticket exists to remove from
//   the run.
// - The estimated band is named an estimate every time it appears, the
//   overlap in the source chart is stated out loud rather than hidden
//   behind a single level, and the source note says where the mapping
//   came from so a teacher can check it.
// - Nothing here claims that a full all-skills Mock Test 1 exists. It
//   does not. Two sections of four are built.
//
// buildReadingSectionCopy takes the test label, the way
// buildListeningSectionCopy does, so a second mock test gets its wording
// from a call rather than from a copy of this file.

export type ReadingSectionCopyOptions = {
  // The test as a learner names it, for example "Mock Test 1".
  testLabel: string;
};

// Wording for one test's full Reading section screens.
export function buildReadingSectionCopy({
  testLabel,
}: ReadingSectionCopyOptions) {
  return {
    // Shared chrome.
    sectionLabel: "Reading",
    sectionName: "Reading section",

    // 1. Reading section intro screen.
    //
    // The instruction lines are held as a list rather than as six fields
    // so the screen renders them with the EXAM-02 instruction list and
    // the order lives in one place. None of them states a question count:
    // the count is a detail row on the intro card and is counted off the
    // content, so a line here cannot go stale.
    introScreenTitle: testLabel + " - Reading Test: Instructions",
    introTitle: "Reading Test",
    introSubtitle:
      "Read the following information before the Reading section begins.",
    introLines: [
      "This section has 4 parts.",
      "You will read correspondence, a diagram, an information passage, and a set of viewpoints.",
      "Each part has its own reading time. Answer all questions.",
      "You can continue with questions unanswered. Any question left blank is counted as incorrect.",
      "At the end you will see a practice score, an estimated Reading band, and a full answer review.",
      "This is CELPIP Decoded practice, not an official CELPIP test.",
    ],
    introNotice:
      "Your answers are held on this screen only, nothing is saved, and the practice score and estimated band are not an official CELPIP result.",
    // Quiet note under the instruction list on each part intro screen
    // inside the section run.
    //
    // It replaces readingCopy.partIntroNotice, which is right on a part
    // route and wrong here twice over: it opens "Internal prototype.",
    // which is a label this exam surface must not carry, and it promises
    // a practice score at the end of the part, which is the part level
    // score the section run removes.
    partIntroNotice:
      "Your answers are held on this screen only and nothing is saved. The practice score, the estimated Reading band and the answer review come at the end of the Reading section, not at the end of this part. You can move back and forward between screens and your answers stay as you left them.",
    introCardTitle: "Reading section",
    introCardSummary:
      "Four parts in one run, with the practice score, the estimated Reading band and the answer review at the end rather than after each part.",
    introPartsLabel: "Parts",
    introQuestionsLabel: "Questions",
    introTimeLabel: "Reading time",

    // Part transition screens. No score, no count, and nothing about how
    // the part that just closed went.
    transitionHeading: "Part complete",
    transitionHint:
      "Take a moment to get ready. Continue when you want the next part.",

    // Marking screen, shown while the server checks the section.
    //
    // The wording is about the check, never about the answers. Nothing
    // here implies a result before one exists.
    markingHeading: "Checking your answers",
    markingText:
      "Your Reading answers are being checked. This takes a moment, and nothing is saved.",
    markingFailedHeading: "Your answers could not be checked",
    markingFailedText:
      "The Reading practice score could not be loaded. Check your connection, confirm you are still signed in, and try again. Your answers are still held on this page.",
    markingRetryLabel: "Try again",

    // 10. Full Reading practice score.
    scoreTitle: "Reading practice score",
    scoreSubtitle: "Your practice result for the whole Reading section.",
    // The one sentence that stops the percentage above it being read as
    // an official result. It sits with the number rather than elsewhere
    // on the screen, so the two are never separated.
    //
    // It differs from readingReviewCopy.practiceResultNote by its second
    // sentence. The part level note says no CELPIP level is estimated
    // from one part, which is true there and would be wrong here: this
    // screen does show an estimated band, and the note has to say what
    // that estimate is worth instead.
    practiceResultNote:
      "This is a CELPIP Decoded practice score, not an official CELPIP score. The estimated Reading band below it is an estimate from a published score chart, not a CELPIP result.",
    blankNote:
      "Questions left blank are counted as incorrect in this score. The correct answer for each of them is shown in the review.",
    scoreNotice:
      "Nothing from this run has been saved. Leaving or restarting clears the answers, the score and the estimated band held on this page.",
    reviewAnswersLabel: "Review answers",
    restartLabel: "Restart Reading section",
    backToDashboardLabel: "Return to dashboard",

    // Part breakdown table on the score screen.
    breakdownTitle: "Part breakdown",
    breakdownPartColumn: "Part",
    breakdownQuestionsColumn: "Questions",
    breakdownAnsweredColumn: "Answered",
    breakdownBlankColumn: "Blank",
    breakdownCorrectColumn: "Correct",
    breakdownScoreColumn: "Practice score",

    // Estimated band card on the score screen.
    //
    // Three wording rules, and the first one is the reason this block is
    // reviewed rather than edited casually:
    //
    // - The reading is named an estimate every time it appears, and the
    //   note under it says in a full sentence that it is not an official
    //   CELPIP score.
    // - The range note says out loud that the source chart's rows
    //   overlap, so a two level reading reads as the chart being
    //   approximate rather than as the app being unsure of its own
    //   arithmetic. The ticket asks for the ambiguity to be preserved
    //   rather than resolved, and this is where a learner is told it is
    //   there.
    // - The source note says where the mapping came from, so a learner or
    //   a teacher can check it, and does not claim the mapping models how
    //   a real level is calculated. It does not.
    estimatedBandLabel: "Estimated CELPIP Reading band",
    estimatedBandRangeNote:
      "The score ranges on that chart overlap, so an estimate can cover two levels.",
    estimatedBandSourceNote:
      "Estimated from the published CELPIP Reading score chart held with this program, which maps a Reading score out of 38 to a CELPIP level. A real CELPIP level also takes question difficulty into account, which a practice estimate cannot do.",
    estimatedBandNote:
      "This is a CELPIP Decoded practice estimate, not an official CELPIP score.",

    // 11. Full Reading answer review.
    reviewTitle: "Reading answer review",
    reviewSubtitle:
      "Every question in the Reading section, grouped by part, with the answer you chose and the correct answer.",
    backToScoreLabel: "Back to score",
    reviewNotice:
      "This review is held on this screen only. Nothing is saved, no explanations are written for these answers, and this is not an official CELPIP result.",
    reviewEmptyText: "There are no questions to review for this section.",

    // Page metadata and the exam region name, for the route.
    pageTitle: testLabel + " reading test - CELPIP Decoded",
    pageDescription:
      "The complete " +
      testLabel +
      " Reading section, Parts 1 to 4 in one run, with a practice score, an estimated Reading band and an answer review at the end.",
    examRegionLabel: testLabel + " - Reading Test",

    // Dashboard internal preview card.
    //
    // The full Reading section joins the four part cards as an internal
    // build link, and it is dressed as one. What it deliberately does not
    // say: that a full all-skills Mock Test 1 exists, or that any of this
    // is an official CELPIP result.
    dashboardCardTitle: testLabel + " - Reading test",
    dashboardCardDescription:
      "Full Reading section flow with Parts 1-4, practice score, review, and estimated band.",
    dashboardCardSectionLabel: "Reading",
    dashboardCardPartsLabel: "Parts 1-4",
    dashboardCardCtaLabel: "Open reading test",
  } as const;
}

// Mock Test 1. Also the default every Reading section screen falls back
// to when no copy is passed.
export const readingSectionCopy = buildReadingSectionCopy({
  testLabel: "Mock Test 1",
});

export type ReadingSectionCopy = ReturnType<typeof buildReadingSectionCopy>;

// Transition line between two parts, for example
// "Reading Part 2 complete. Continue to Reading Part 3."
export function formatReadingSectionTransition(
  completedPartLabel: string,
  nextPartLabel: string,
): string {
  return completedPartLabel + " complete. Continue to " + nextPartLabel + ".";
}

// Part position inside the section, for example "Reading Part 3 of 4".
export function formatReadingSectionPartPosition(
  partNumber: number,
  totalParts: number,
): string {
  return "Reading Part " + partNumber + " of " + totalParts;
}

// Top bar note on a screen belonging to a part, for example
// "Reading Part 3 of 4 - Screen 9 of 14".
export function formatReadingSectionPartMeta(
  partNumber: number,
  totalParts: number,
  screenNumber: number,
  totalScreens: number,
): string {
  return (
    formatReadingSectionPartPosition(partNumber, totalParts) +
    " - Screen " +
    screenNumber +
    " of " +
    totalScreens
  );
}

// Top bar note on a screen the section owns rather than a part, for
// example "Reading section - Screen 1 of 14".
export function formatReadingSectionMeta(
  screenNumber: number,
  totalScreens: number,
): string {
  return "Reading section - Screen " + screenNumber + " of " + totalScreens;
}

// Whole minutes, for the intro card, for example "43 minutes".
//
// The Reading part allowances are whole numbers of minutes in every
// source we hold, so nothing here has to print seconds.
export function formatReadingSectionMinutes(seconds: number): string {
  const minutes = Math.round(seconds / 60);

  return minutes + (minutes === 1 ? " minute" : " minutes");
}

// Line under the estimated band, for example
// "Estimated from 25 correct answers out of 38."
//
// The raw count is repeated here rather than left to the summary card
// above, so the reading and the number it came from are never read apart.
export function formatReadingBandBasis(
  correctCount: number,
  totalQuestions: number,
): string {
  return (
    "Estimated from " +
    correctCount +
    (correctCount === 1 ? " correct answer" : " correct answers") +
    " out of " +
    totalQuestions +
    "."
  );
}

// Breakdown cell, for example "5 / 8".
export function formatReadingSectionCountOfTotal(
  count: number,
  total: number,
): string {
  return count + " / " + total;
}

// Group heading count in the section review, for example "11 questions".
export function formatReadingSectionGroupCount(count: number): string {
  return count + (count === 1 ? " question" : " questions");
}
