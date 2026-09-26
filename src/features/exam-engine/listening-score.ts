// Answer review rows and practice scoring for a Listening part (EXAM-04,
// extended to dropdown completion parts by EXAM-10, to video discussion
// parts by EXAM-12, and to viewpoints parts by EXAM-14).
//
// Pure functions over the part content and the local answer map. No
// React, no side effects, no storage, so the same helpers work on the
// server when review moves off the client later.
//
// The one rule the whole file is built around: a missing answer key must
// never make a learner look wrong. Every path here treats an absent or
// unusable key as "not checkable yet" rather than as a mismatch, and the
// score is withheld entirely until every question in the part has a
// usable key.
//
// Key resolution order per question:
//
//   1. content.answerKey entry for the question, when its correctOptionId
//      is set
//   2. question.correctOptionId, for a part whose key is written question
//      by question
//   3. nothing, which is "answer key pending"
//
// A key that names an option the question does not have is discarded and
// counts as missing. A stale id in the key is a content bug, and marking
// every learner wrong because of it would be the worst possible answer.
//
// EXAM-10 note on the shape of this file. Listening Part 4 is a dropdown
// completion part, so its content is ListeningDropdownPartContent rather
// than ListeningPartContent: one flat question list instead of
// conversation sections, and a printed statement instead of a spoken
// question. None of that changes how an answer is marked. So the marking
// itself moved down into a small internal core that works on any list of
// questions carrying options and an id, and the two public surfaces are
// thin adapters over it:
//
// - the original functions, taking ListeningPartContent, for Parts 1 to 3
// - the Dropdown functions, taking ListeningDropdownPartContent, for
//   Part 4
//
// The Parts 1 to 3 functions keep their names, their signatures and their
// behaviour exactly. Nothing about them was widened to fit Part 4, which
// is what keeps a dropdown part from being able to break them.
//
// EXAM-12 note. Listening Part 5 is a video discussion part, so its
// content is ListeningVideoPartContent: one flat question list again, and
// a printed question answered from a radio group. That is the third
// content shape and it needed no new marking rule either, so it is a
// third thin adapter over the same core, added the same way and with the
// same guarantee. The Parts 1 to 4 functions are untouched by it.
//
// EXAM-14 note. Listening Part 6 is a viewpoints part, so its content is
// ListeningViewpointsPartContent: a flat list of incomplete statements
// answered from a radio group. Fourth content shape, fourth thin adapter,
// and again no new marking rule. Its describe function is the dropdown
// one's twin rather than the video one's, because a viewpoints question is
// a statement split around a blank, so the row needs the same
// formatListeningStatementLabel treatment. What differs is only how the
// question screen draws the control, which marking never sees. The Parts 1
// to 5 functions are untouched by it.
//
// House style: normal hyphens only, no long hyphens or em dashes.

import { listListeningQuestions } from "./listening-flow";
import {
  formatListeningQuestionLabel,
  formatListeningStatementLabel,
} from "./listening-review-copy";
import type {
  ListeningDropdownAnswerMap,
  ListeningDropdownPartContent,
  ListeningDropdownQuestion,
} from "./listening-dropdown-types";
import type {
  ListeningAnswerMap,
  ListeningPartContent,
  ListeningQuestion,
} from "./listening-types";
import type {
  ListeningVideoAnswerMap,
  ListeningVideoPartContent,
  ListeningVideoQuestion,
} from "./listening-video-types";
import type {
  ListeningViewpointsAnswerMap,
  ListeningViewpointsPartContent,
  ListeningViewpointsQuestion,
} from "./listening-viewpoints-types";
import type {
  ListeningAnswerKeyEntry,
  ListeningReviewRow,
  ListeningReviewStatus,
  ListeningScoreSummary,
} from "./listening-review-types";

// The least a question has to carry to be marked: an id to look the
// answer up by, a display number, and the options a key can name.
//
// Both ListeningQuestion and ListeningDropdownQuestion satisfy this
// structurally, so neither has to be converted before it is marked. It is
// deliberately not exported: it is an implementation detail of this file,
// not a third question type the content files should reach for.
type MarkableQuestion = {
  id: string;
  number: number;
  options: { id: string; text: string }[];
  correctOptionId?: string;
};

// How a row names the question it belongs to.
//
// Parts 1 to 3 print no stem, so they return "Question 3" and no
// statement. A dropdown part returns the same label plus the incomplete
// statement, which is the only thing that makes its review readable.
type DescribeQuestion<TQuestion> = (
  question: TQuestion,
  questionNumber: number,
) => { label: string; statement?: string };

// Answer key entries by question id, built once per call rather than
// searched per question.
function indexAnswerKey(
  answerKey: ListeningAnswerKeyEntry[] | undefined,
): Map<string, ListeningAnswerKeyEntry> {
  const index = new Map<string, ListeningAnswerKeyEntry>();

  answerKey?.forEach((entry) => {
    index.set(entry.questionId, entry);
  });

  return index;
}

// The correct option for a question, or undefined when there is no
// usable key for it.
function resolveCorrectOptionId(
  question: MarkableQuestion,
  entry?: ListeningAnswerKeyEntry,
): string | undefined {
  const candidate = entry?.correctOptionId ?? question.correctOptionId;

  if (!candidate) {
    return undefined;
  }

  // Discard a key that does not name one of this question's options.
  return question.options.some((option) => option.id === candidate)
    ? candidate
    : undefined;
}

// Whether every question in the list has a usable correct option.
//
// An empty list returns false. There is nothing to score, so there is no
// score to show.
function hasCompleteKey(
  questions: MarkableQuestion[],
  answerKey: ListeningAnswerKeyEntry[] | undefined,
): boolean {
  if (questions.length === 0) {
    return false;
  }

  const keyIndex = indexAnswerKey(answerKey);

  return questions.every((question) =>
    Boolean(resolveCorrectOptionId(question, keyIndex.get(question.id))),
  );
}

// How many questions have no usable key yet.
function countMissingKeys(
  questions: MarkableQuestion[],
  answerKey: ListeningAnswerKeyEntry[] | undefined,
): number {
  const keyIndex = indexAnswerKey(answerKey);

  return questions.filter(
    (question) => !resolveCorrectOptionId(question, keyIndex.get(question.id)),
  ).length;
}

// How many questions have an option selected.
function countAnswered(
  questions: MarkableQuestion[],
  answers: Readonly<Record<string, string>>,
): number {
  return questions.filter((question) => Boolean(answers[question.id])).length;
}

// How many selected answers match a known correct option.
//
// Questions with no key are skipped rather than counted as wrong, so this
// undercounts while the key is incomplete. Every caller gates the learner
// facing use of it on hasCompleteKey.
function countCorrect(
  questions: MarkableQuestion[],
  answerKey: ListeningAnswerKeyEntry[] | undefined,
  answers: Readonly<Record<string, string>>,
): number {
  const keyIndex = indexAnswerKey(answerKey);

  return questions.filter((question) => {
    const correctOptionId = resolveCorrectOptionId(
      question,
      keyIndex.get(question.id),
    );

    return Boolean(correctOptionId) && answers[question.id] === correctOptionId;
  }).length;
}

// Practice score as a whole percentage, or null when it cannot be
// calculated honestly.
//
// Null means one of two things: the part has no questions, or the answer
// key is incomplete. Both are cases where a number would be a guess.
function scorePercent(
  questions: MarkableQuestion[],
  answerKey: ListeningAnswerKeyEntry[] | undefined,
  answers: Readonly<Record<string, string>>,
): number | null {
  if (questions.length === 0 || !hasCompleteKey(questions, answerKey)) {
    return null;
  }

  return Math.round(
    (countCorrect(questions, answerKey, answers) / questions.length) * 100,
  );
}

// Status of one question.
//
// Order matters. An unanswered question reads as unanswered whether or
// not a key exists, because that fact is true either way and is the more
// useful thing to tell the learner.
function resolveStatus(
  selectedOptionId: string | undefined,
  correctOptionId: string | undefined,
): ListeningReviewStatus {
  if (!selectedOptionId) {
    return "unanswered";
  }

  if (!correctOptionId) {
    return "answer-key-pending";
  }

  return selectedOptionId === correctOptionId ? "correct" : "incorrect";
}

// One review row per question, in list order.
//
// Option text is resolved here rather than in the table, so the table
// renders strings and never has to look anything up.
function buildRows<TQuestion extends MarkableQuestion>(
  questions: TQuestion[],
  answerKey: ListeningAnswerKeyEntry[] | undefined,
  answers: Readonly<Record<string, string>>,
  describe: DescribeQuestion<TQuestion>,
): ListeningReviewRow[] {
  const keyIndex = indexAnswerKey(answerKey);

  return questions.map((question, index) => {
    const entry = keyIndex.get(question.id);
    const correctOptionId = resolveCorrectOptionId(question, entry);
    const selectedOptionId = answers[question.id];

    const findText = (optionId?: string) =>
      optionId
        ? question.options.find((option) => option.id === optionId)?.text
        : undefined;

    // number is display data from the content. Fall back to the position
    // in the part so a row is never numbered zero.
    const questionNumber = question.number || index + 1;
    const { label, statement } = describe(question, questionNumber);

    return {
      questionId: question.id,
      questionNumber,
      label,
      statement,
      selectedOptionId,
      selectedOptionText: findText(selectedOptionId),
      correctOptionId,
      correctOptionText: findText(correctOptionId),
      explanation: entry?.explanation,
      status: resolveStatus(selectedOptionId, correctOptionId),
    };
  });
}

// Everything the score screen needs, in one pass.
//
// correctCount and scorePercent stay null while the key is incomplete, so
// the screen cannot print a partial result by accident.
function buildSummary(
  questions: MarkableQuestion[],
  answerKey: ListeningAnswerKeyEntry[] | undefined,
  answers: Readonly<Record<string, string>>,
): ListeningScoreSummary {
  const complete = hasCompleteKey(questions, answerKey);

  return {
    totalQuestions: questions.length,
    answeredCount: countAnswered(questions, answers),
    correctCount: complete ? countCorrect(questions, answerKey, answers) : null,
    scorePercent: complete ? scorePercent(questions, answerKey, answers) : null,
    hasCompleteAnswerKey: complete,
    missingKeyCount: countMissingKeys(questions, answerKey),
  };
}

// Listening Parts 1 to 3: conversation sections and spoken questions.
//
// The question stem is never printed in these parts, so the row label
// falls back to "Question 3" rather than inventing one, and no statement
// is set. A part that does print a stem sets prompt, which wins.
const describeSectionQuestion: DescribeQuestion<ListeningQuestion> = (
  question,
  questionNumber,
) => ({
  label: question.prompt ?? formatListeningQuestionLabel(questionNumber),
});

// How many questions the part has, for example 8.
export function getTotalQuestions(content: ListeningPartContent): number {
  return listListeningQuestions(content).length;
}

// How many of them have an option selected.
export function getAnsweredCount(
  content: ListeningPartContent,
  answers: ListeningAnswerMap,
): number {
  return countAnswered(listListeningQuestions(content), answers);
}

// Whether every question in the part has a usable correct option.
export function hasCompleteAnswerKey(content: ListeningPartContent): boolean {
  return hasCompleteKey(listListeningQuestions(content), content.answerKey);
}

// How many questions have no usable key yet.
export function countMissingAnswerKeys(content: ListeningPartContent): number {
  return countMissingKeys(listListeningQuestions(content), content.answerKey);
}

// How many selected answers match a known correct option.
//
// Gate any learner facing use of this on hasCompleteAnswerKey, which is
// what buildListeningScoreSummary does.
export function getCorrectCount(
  content: ListeningPartContent,
  answers: ListeningAnswerMap,
): number {
  return countCorrect(
    listListeningQuestions(content),
    content.answerKey,
    answers,
  );
}

// Practice score as a whole percentage, or null when it cannot be
// calculated honestly.
export function getScorePercent(
  content: ListeningPartContent,
  answers: ListeningAnswerMap,
): number | null {
  return scorePercent(
    listListeningQuestions(content),
    content.answerKey,
    answers,
  );
}

// One review row per question, in part order.
export function buildListeningReviewRows(
  content: ListeningPartContent,
  answers: ListeningAnswerMap,
): ListeningReviewRow[] {
  return buildRows(
    listListeningQuestions(content),
    content.answerKey,
    answers,
    describeSectionQuestion,
  );
}

// Everything the score screen needs, in one pass.
export function buildListeningScoreSummary(
  content: ListeningPartContent,
  answers: ListeningAnswerMap,
): ListeningScoreSummary {
  return buildSummary(
    listListeningQuestions(content),
    content.answerKey,
    answers,
  );
}

// Listening Part 4 and the other dropdown completion parts (EXAM-10).
//
// The question is printed on screen as an incomplete statement, so the
// row carries it. Without it the review reads as a list of sentence
// fragments with nothing to attach them to.
const describeDropdownQuestion: DescribeQuestion<ListeningDropdownQuestion> = (
  question,
  questionNumber,
) => ({
  label: formatListeningQuestionLabel(questionNumber),
  statement: formatListeningStatementLabel(
    question.textBefore,
    question.textAfter,
  ),
});

// How many questions the dropdown part has, for example 5.
export function getDropdownTotalQuestions(
  content: ListeningDropdownPartContent,
): number {
  return content.questions.length;
}

// How many of them have an option selected.
export function getDropdownAnsweredCount(
  content: ListeningDropdownPartContent,
  answers: ListeningDropdownAnswerMap,
): number {
  return countAnswered(content.questions, answers);
}

// Whether every question in the dropdown part has a usable correct
// option.
export function hasCompleteDropdownAnswerKey(
  content: ListeningDropdownPartContent,
): boolean {
  return hasCompleteKey(content.questions, content.answerKey);
}

// How many questions in the dropdown part have no usable key yet.
export function countMissingDropdownAnswerKeys(
  content: ListeningDropdownPartContent,
): number {
  return countMissingKeys(content.questions, content.answerKey);
}

// How many selected answers match a known correct option.
//
// Gate any learner facing use of this on hasCompleteDropdownAnswerKey,
// which is what buildListeningDropdownScoreSummary does.
export function getDropdownCorrectCount(
  content: ListeningDropdownPartContent,
  answers: ListeningDropdownAnswerMap,
): number {
  return countCorrect(content.questions, content.answerKey, answers);
}

// Practice score as a whole percentage, or null when the key is
// incomplete.
export function getDropdownScorePercent(
  content: ListeningDropdownPartContent,
  answers: ListeningDropdownAnswerMap,
): number | null {
  return scorePercent(content.questions, content.answerKey, answers);
}

// One review row per completion question, in part order.
export function buildListeningDropdownReviewRows(
  content: ListeningDropdownPartContent,
  answers: ListeningDropdownAnswerMap,
): ListeningReviewRow[] {
  return buildRows(
    content.questions,
    content.answerKey,
    answers,
    describeDropdownQuestion,
  );
}

// Everything the dropdown part's score screen needs, in one pass.
export function buildListeningDropdownScoreSummary(
  content: ListeningDropdownPartContent,
  answers: ListeningDropdownAnswerMap,
): ListeningScoreSummary {
  return buildSummary(content.questions, content.answerKey, answers);
}

// Listening Part 5 and the other video discussion parts (EXAM-12).
//
// The question is printed on screen in full, so the row carries it under
// the number, the way a dropdown row carries its incomplete statement.
// The number is kept as the label rather than replaced by the question:
// the answer columns are read against a numbered list, and a row headed
// by a whole sentence loses the one thing that ties it back to the
// question screen.
//
// The prompt is required on ListeningVideoQuestion, so there is no
// fallback here. A part that somehow has an empty prompt prints the
// number alone, which is what leaving statement empty does.
const describeVideoQuestion: DescribeQuestion<ListeningVideoQuestion> = (
  question,
  questionNumber,
) => ({
  label: formatListeningQuestionLabel(questionNumber),
  statement: question.prompt || undefined,
});

// One review row per multiple-choice question, in part order.
export function buildListeningVideoReviewRows(
  content: ListeningVideoPartContent,
  answers: ListeningVideoAnswerMap,
): ListeningReviewRow[] {
  return buildRows(
    content.questions,
    content.answerKey,
    answers,
    describeVideoQuestion,
  );
}

// Everything the video part's score screen needs, in one pass.
//
// Only these two adapters are exported for the video shape. The dropdown
// block above also exports its counts individually, which nothing outside
// this file reads, so they are not copied a third time. Both screens read
// the summary.
export function buildListeningVideoScoreSummary(
  content: ListeningVideoPartContent,
  answers: ListeningVideoAnswerMap,
): ListeningScoreSummary {
  return buildSummary(content.questions, content.answerKey, answers);
}

// Listening Part 6 and the other viewpoints parts (EXAM-14).
//
// The question is printed on screen as an incomplete statement, exactly as
// a dropdown part's is, so the row carries it and it is built by the same
// helper. Without it the review reads as a list of sentence fragments with
// nothing to attach them to: "Question 3" beside "may be developed into a
// nature walkway." says nothing about what was being asked.
//
// This is deliberately describeDropdownQuestion's twin rather than a reuse
// of it. The two take different question types, and merging them would
// mean widening one part's describe function to accept the other part's
// content, which is the coupling the sibling type files were split up to
// avoid. The shared work is already in formatListeningStatementLabel.
//
// Mock Test 1 Part 6 leaves textAfter unset on every question, since each
// blank ends its statement, so every label here prints as head plus dots.
// A part whose blank falls mid sentence prints the tail after the dots
// without any change here.
const describeViewpointsQuestion: DescribeQuestion<
  ListeningViewpointsQuestion
> = (question, questionNumber) => ({
  label: formatListeningQuestionLabel(questionNumber),
  statement: formatListeningStatementLabel(
    question.textBefore,
    question.textAfter,
  ),
});

// One review row per viewpoints statement, in part order.
export function buildListeningViewpointsReviewRows(
  content: ListeningViewpointsPartContent,
  answers: ListeningViewpointsAnswerMap,
): ListeningReviewRow[] {
  return buildRows(
    content.questions,
    content.answerKey,
    answers,
    describeViewpointsQuestion,
  );
}

// Everything the viewpoints part's score screen needs, in one pass.
//
// Only these two adapters are exported for the viewpoints shape, the same
// pair the video block above exports and for the same reason: the
// individual counts the dropdown block exports are read nowhere outside
// this file, so they are not copied a fourth time. Both closing screens
// read the summary.
export function buildListeningViewpointsScoreSummary(
  content: ListeningViewpointsPartContent,
  answers: ListeningViewpointsAnswerMap,
): ListeningScoreSummary {
  return buildSummary(content.questions, content.answerKey, answers);
}
