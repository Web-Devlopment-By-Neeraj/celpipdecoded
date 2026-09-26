// Answer review rows for the full Reading section (EXAM-24).
//
// The layer above reading-review.ts. Pure functions over the section
// content and the combined answer map: no React, no side effects, no
// storage, no network, so the same helpers run on the server beside the
// answer keys, which is the only place they are meant to run.
//
// It adds no marking rule and no row shape. Every question in the section
// is marked by buildReadingReviewRows, the same function the four part
// level actions call, so a question checked through the full section flow
// and the same question checked through its part route get the same
// answer from the same code. What this file adds is the grouping: the
// rows come back per part, carrying the part id, the part number, the
// part label and the CELPIP part title, which is what a review screen
// grouped by part needs and what the ticket asks a review row to be able
// to say about itself.
//
// The one thing a part gets to choose about its own marking is what to
// call a question that prints no stem: Part 1's blanks sit in a written
// reply, Part 2's in an email and Part 4's in a reader comment. That
// choice travels on the section content as blankQuestionText and is
// passed straight through as the ReadingReviewOptions the part action
// already passes, so the wording in the section review matches the
// wording in the part review word for word.
//
// Nothing here writes an explanation. The source document publishes none
// for Reading, so the field is null on every row, and no AI and no guess
// fills it in.
//
// House style: normal hyphens only, no long hyphens or em dashes.

import { buildReadingReviewRows } from "./reading-review";
import { summarizeReadingReviewRows } from "./reading-score";
import type {
  ReadingSectionAnswerMap,
  ReadingSectionContent,
  ReadingSectionPart,
  ReadingSectionPartResult,
} from "./reading-section-types";

// Mark one part of the section and return its rows and its counts.
//
// The summary is counted from the rows rather than marked a second time,
// which is the rule reading-score.ts is built around: a question can
// never be correct in the review and wrong in the score, because there is
// one comparison and both readings come out of it.
export function buildReadingSectionPartResult(
  part: ReadingSectionPart,
  answers: ReadingSectionAnswerMap,
): ReadingSectionPartResult {
  const rows = buildReadingReviewRows(part.content, answers, {
    // Unset on a part whose questions all carry their own text, which
    // leaves buildReadingReviewRows on its own default. Part 3 is the
    // only one.
    blankQuestionText: part.blankQuestionText,
  });

  return {
    partId: part.content.sectionId,
    partNumber: part.partNumber,
    partLabel: part.partLabel,
    partTitle: part.content.partTitle,
    rows,
    summary: summarizeReadingReviewRows(rows),
  };
}

// Every part of the section, marked, in test order.
//
// This is the review grouped by part that the section review screen
// renders and that the section score screen counts its breakdown from.
export function buildReadingSectionPartResults(
  content: ReadingSectionContent,
  answers: ReadingSectionAnswerMap,
): ReadingSectionPartResult[] {
  return content.parts.map((part) =>
    buildReadingSectionPartResult(part, answers),
  );
}
