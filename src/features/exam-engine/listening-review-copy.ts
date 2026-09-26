// Learner facing wording for the Listening review, score and end screens
// (EXAM-04, made part agnostic by EXAM-06).
//
// Same rule as listening-copy.ts: the closing screens share one wording
// file, so a change lands in one place rather than in five components.
//
// Two wording rules this file exists to hold the line on:
//
// - Nothing here claims an official CELPIP score or an official CELPIP
//   level. The result is named a CELPIP Decoded practice result every
//   time it appears, and the note under it says so in a full sentence.
// - Nothing here says an answer is wrong when the answer key is missing.
//   The pending wording is about the key, never about the learner.
//
// EXAM-04 wrote "Listening Part 1" into eight of these strings, which is
// what docs/product/listening-part-1-review-score.md section 9 flagged as
// the one thing standing between the closing screens and a second part.
// buildListeningReviewCopy takes the part label instead, and the Part 1
// export below is that builder called with the Part 1 labels, so every
// Part 1 string is character for character what it was.
//
// Strings and pure helpers only, no side effects, so this file is safe to
// import from a client component.
//
// House style: normal hyphens only, no long hyphens or em dashes.

import type { ListeningReviewStatus } from "./listening-review-types";

export type ListeningReviewCopyOptions = {
  // The part as a learner names it, for example "Listening Part 2". Not
  // taken from the content object: partTitle there is the section name,
  // "Listening to a Daily Life Conversation", and title is the full
  // practice test heading. Neither is the label wanted here.
  partLabel: string;
  // The part after this one, for the end screen placeholder line. Leave
  // unset for the last part built, which drops the line entirely.
  nextPartLabel?: string;
  // The end screen placeholder line, written out (EXAM-14).
  //
  // Wins over the sentence nextPartLabel generates. It exists for the last
  // part of a section, where what comes next is not another part: Listening
  // Part 6 is followed by the full Listening section result, so
  // "Listening Part 7 will be added in the next ticket" would be wrong in
  // both halves. Leave unset everywhere else, which is what Parts 1 to 5
  // do, so their line is generated exactly as before.
  nextStepText?: string;
};

export type ListeningReviewCopy = {
  reviewTitle: string;
  reviewSubtitle: string;
  viewScoreLabel: string;
  backToQuestionsLabel: string;
  reviewNotice: string;
  tableCaption: string;
  columnQuestion: string;
  columnSelected: string;
  columnCorrect: string;
  columnStatus: string;
  noAnswerText: string;
  pendingAnswerText: string;
  explanationPanelTitle: string;
  explanationPanelIntro: string;
  explanationToggleLabel: string;
  explanationImageCaption: string;
  scoreTitle: string;
  scoreSubtitle: string;
  totalQuestionsLabel: string;
  answeredLabel: string;
  correctLabel: string;
  scoreLabel: string;
  pendingValue: string;
  pendingScoreHeading: string;
  pendingScoreText: string;
  practiceResultNote: string;
  endPartLabel: string;
  reviewAnswersLabel: string;
  endTitle: string;
  endMessage: string;
  backToDashboardLabel: string;
  restartLabel: string;
  // Empty when nextPartLabel is unset, which the end screen reads as
  // "print no placeholder line".
  nextPartPlaceholder: string;
  endNotice: string;
};

// Wording for one Listening part's closing screens.
export function buildListeningReviewCopy({
  partLabel,
  nextPartLabel,
  nextStepText,
}: ListeningReviewCopyOptions): ListeningReviewCopy {
  return {
    // Answer review screen.
    reviewTitle: `${partLabel} Answer Review`,
    reviewSubtitle: "Review your answers before viewing the score.",
    viewScoreLabel: "View score",
    backToQuestionsLabel: "Back",
    // Sits under the table, explaining what the review is and is not.
    reviewNotice:
      "This review is held on this screen only. Nothing is saved and this is not an official CELPIP result.",

    // Review table headers.
    tableCaption: `Your answers for ${partLabel}`,
    columnQuestion: "Question",
    columnSelected: "Your answer",
    columnCorrect: "Correct answer",
    columnStatus: "Status",

    // Cell fallbacks.
    noAnswerText: "No answer selected",
    pendingAnswerText: "Answer key pending",

    // Answer explanation reference panel.
    explanationPanelTitle: "Answer key reference",
    explanationPanelIntro:
      "The answers and explanations for this part are published as an image. Open it to check the correct answers above against the source sheet.",
    explanationToggleLabel: "Show the answer and explanation sheet",
    explanationImageCaption: `Answer and explanation sheet for ${partLabel}, from the practice test source material.`,

    // Score screen.
    scoreTitle: `${partLabel} Score`,
    scoreSubtitle: "Your practice result for this part.",
    totalQuestionsLabel: "Total questions",
    answeredLabel: "Answered",
    correctLabel: "Correct",
    scoreLabel: "Practice score",
    pendingValue: "Pending",
    // Shown in place of a score when the key is incomplete.
    pendingScoreHeading: "Answer key pending",
    pendingScoreText:
      "The answer key for this part is not available yet, so no practice score is calculated. Your answers are shown in the review table, and none of them are marked wrong.",
    practiceResultNote:
      "This is a CELPIP Decoded practice result, not an official CELPIP score.",
    endPartLabel: `End ${partLabel}`,
    reviewAnswersLabel: "Review answers",

    // End of part screen.
    endTitle: `End of ${partLabel}`,
    endMessage: `You have completed ${partLabel} of Mock Test 1.`,
    backToDashboardLabel: "Back to dashboard",
    restartLabel: `Restart ${partLabel}`,
    nextPartPlaceholder:
      nextStepText ??
      (nextPartLabel ? `${nextPartLabel} will be added in the next ticket.` : ""),
    // Standing reminder on the last screen of a prototype run.
    endNotice:
      "Nothing from this run has been saved. Restarting clears the answers held on this page.",
  };
}

// Listening Part 1 (EXAM-04). Also the default every closing screen falls
// back to when no copy is passed, which is how Part 1 keeps working
// without being edited.
export const listeningReviewCopy = buildListeningReviewCopy({
  partLabel: "Listening Part 1",
  nextPartLabel: "Listening Part 2",
});

// Listening Part 2 (EXAM-06).
export const listeningPartTwoReviewCopy = buildListeningReviewCopy({
  partLabel: "Listening Part 2",
  nextPartLabel: "Listening Part 3",
});

// Listening Part 3 (EXAM-08).
//
// Three lines of configuration and no component change, which is what
// buildListeningReviewCopy was factored out for in EXAM-06.
export const listeningPartThreeReviewCopy = buildListeningReviewCopy({
  partLabel: "Listening Part 3",
  nextPartLabel: "Listening Part 4",
});

// Listening Part 4 (EXAM-10).
//
// The first dropdown completion part to reach the closing screens, and it
// still needs no component change: the wording is built the same way
// Parts 2 and 3 build theirs. What differs about Part 4 is the shape of
// its content, which is handled in listening-score.ts, not here.
export const listeningPartFourReviewCopy = buildListeningReviewCopy({
  partLabel: "Listening Part 4",
  nextPartLabel: "Listening Part 5",
});

// Listening Part 5 (EXAM-12).
//
// The first video discussion part to reach the closing screens, and it
// still needs no component change. What differs about Part 5 is the shape
// of its content, which is handled in listening-score.ts, not here.
//
// nextPartLabel is set, so the end screen carries the Listening Part 6
// placeholder line. Part 6 is not built in this ticket, and the line is a
// plain sentence rather than a control, which is the whole reason
// ListeningPartEndScreen prints it as text.
export const listeningPartFiveReviewCopy = buildListeningReviewCopy({
  partLabel: "Listening Part 5",
  nextPartLabel: "Listening Part 6",
});

// Listening Part 6 (EXAM-14).
//
// The first viewpoints part to reach the closing screens, and it still
// needs no component change. What differs about Part 6 is the shape of its
// content, which is handled in listening-score.ts, not here.
//
// It is also the last Listening part, so nextPartLabel is left unset and
// the end screen line is written out instead. There is no Listening Part
// 7, and the thing that comes after this part is the full Listening
// section result, which is a later ticket rather than the next one. The
// line stays a plain sentence, which is why ListeningPartEndScreen prints
// it as text rather than as a control.
export const listeningPartSixReviewCopy = buildListeningReviewCopy({
  partLabel: "Listening Part 6",
  nextStepText:
    "Full Listening section result will be added in a later ticket.",
});

// Status labels for the review table. Short, plain, and not a badge.
export const listeningReviewStatusLabels: Record<
  ListeningReviewStatus,
  string
> = {
  correct: "Correct",
  incorrect: "Incorrect",
  unanswered: "Unanswered",
  "answer-key-pending": "Answer key pending",
};

// Question label for a part that does not print its question stems, for
// example "Question 3".
export function formatListeningQuestionLabel(questionNumber: number): string {
  return `Question ${questionNumber}`;
}

// The incomplete statement of a dropdown completion question, as the
// review table prints it (EXAM-10).
//
// For example "The magician was in trouble because he ..." The blank is
// three dots rather than the row of underscores the question screen
// draws. On the question screen the underscores mark where the control
// goes and are read out as "blank"; in the review the answer is already
// in the next column, so the same row of underscores would only be
// noise.
//
// A blank that ends the statement gets no trailing text, which is every
// question in Mock Test 1 Part 4. Parts 5 and 6 have blanks mid sentence
// and will print the tail after the dots.
export function formatListeningStatementLabel(
  textBefore: string,
  textAfter?: string,
): string {
  const head = `${textBefore} ...`;

  return textAfter ? `${head} ${textAfter}` : head;
}

// Answered line, for example "5 of 8".
export function formatListeningCountOfTotal(
  count: number,
  total: number,
): string {
  return `${count} of ${total}`;
}

// Practice score, for example "63%".
export function formatListeningScorePercent(percent: number): string {
  return `${percent}%`;
}

// Line about how many keys are still missing, for example
// "8 of 8 answer keys are not transcribed yet."
export function formatListeningMissingKeyCount(
  missing: number,
  total: number,
): string {
  return missing === 1
    ? `1 of ${total} answer keys is not transcribed yet.`
    : `${missing} of ${total} answer keys are not transcribed yet.`;
}
