// Answer review rows and practice scoring for the full Listening section
// (EXAM-15).
//
// The layer above listening-score.ts. Pure functions over the section
// content and the combined answer map, no React, no side effects and no
// storage, so the same helpers run on the server where the answer keys
// live.
//
// It adds no marking rule. Every question in the section is marked by the
// adapter its part already used, so a question checked through the full
// section flow and the same question checked through its part level
// prototype route get the same answer from the same code:
//
// - "sections"   buildListeningReviewRows / buildListeningScoreSummary
// - "dropdown"   the Dropdown pair
// - "video"      the Video pair
// - "viewpoints" the Viewpoints pair
//
// What this file does add is the aggregation, and it carries over the one
// rule listening-score.ts is built around: a missing answer key must never
// make a learner look wrong. The section correct count and the section
// percentage stay null unless every part reports a complete key, so a
// section total can never be a number calculated against a partial key.
// All six Mock Test 1 parts have complete, confirmed keys today, so that
// branch is a guard rather than the state in use.
//
// House style: normal hyphens only, no long hyphens or em dashes.

import {
  buildListeningDropdownReviewRows,
  buildListeningDropdownScoreSummary,
  buildListeningReviewRows,
  buildListeningScoreSummary,
  buildListeningVideoReviewRows,
  buildListeningVideoScoreSummary,
  buildListeningViewpointsReviewRows,
  buildListeningViewpointsScoreSummary,
} from "./listening-score";
import { listListeningSectionPartQuestions } from "./listening-section-flow";
import type { ListeningScoreSummary } from "./listening-review-types";
import type {
  ListeningSectionAnswerMap,
  ListeningSectionContent,
  ListeningSectionMarkedResult,
  ListeningSectionPart,
  ListeningSectionPartResult,
} from "./listening-section-types";

// Mark one part and return its rows and its counts.
//
// The switch is the only place the four content shapes are told apart for
// marking, and each branch calls the pair that shape already had. Nothing
// is widened and nothing is duplicated.
function buildPartResult(
  part: ListeningSectionPart,
  answers: ListeningSectionAnswerMap,
): ListeningSectionPartResult {
  const shared = {
    partNumber: part.partNumber,
    partLabel: part.partLabel,
    partTitle: part.content.partTitle,
  };

  switch (part.kind) {
    case "sections":
      return {
        ...shared,
        rows: buildListeningReviewRows(part.content, answers),
        summary: buildListeningScoreSummary(part.content, answers),
      };
    case "dropdown":
      return {
        ...shared,
        rows: buildListeningDropdownReviewRows(part.content, answers),
        summary: buildListeningDropdownScoreSummary(part.content, answers),
      };
    case "video":
      return {
        ...shared,
        rows: buildListeningVideoReviewRows(part.content, answers),
        summary: buildListeningVideoScoreSummary(part.content, answers),
      };
    case "viewpoints":
      return {
        ...shared,
        rows: buildListeningViewpointsReviewRows(part.content, answers),
        summary: buildListeningViewpointsScoreSummary(part.content, answers),
      };
  }
}

// Section totals, summed from the part summaries.
//
// correctCount and scorePercent are withheld unless every part has a
// complete key. A section total built by adding up whatever happened to be
// checkable would read as a score out of 38 while quietly being a score
// out of fewer, which is exactly the number listening-score.ts refuses to
// print for one part.
//
// An empty section reports no complete key and therefore no score, for the
// same reason hasCompleteKey rejects an empty question list: there is
// nothing to score, so there is no score to show.
function aggregateSummaries(
  summaries: ListeningScoreSummary[],
): ListeningScoreSummary {
  const total = (pick: (summary: ListeningScoreSummary) => number) =>
    summaries.reduce((running, summary) => running + pick(summary), 0);

  const totalQuestions = total((summary) => summary.totalQuestions);
  const complete =
    summaries.length > 0 &&
    summaries.every((summary) => summary.hasCompleteAnswerKey);

  // Safe to read correctCount here: hasCompleteAnswerKey being true is
  // exactly the condition under which listening-score.ts sets it.
  const correctCount = complete
    ? total((summary) => summary.correctCount ?? 0)
    : null;

  return {
    totalQuestions,
    answeredCount: total((summary) => summary.answeredCount),
    correctCount,
    scorePercent:
      correctCount === null || totalQuestions === 0
        ? null
        : Math.round((correctCount / totalQuestions) * 100),
    hasCompleteAnswerKey: complete,
    missingKeyCount: total((summary) => summary.missingKeyCount),
  };
}

// Mark a whole Listening section attempt.
//
// Returns the per part review rows and counts, and the section totals.
// Call this where the answer keys are, which is the server: the content
// the browser holds has had every key stripped by
// withoutListeningSectionAnswerKeys, so calling it there would mark every
// question as answer key pending.
export function buildListeningSectionResult(
  content: ListeningSectionContent,
  answers: ListeningSectionAnswerMap,
): ListeningSectionMarkedResult {
  const parts = content.parts.map((part) => buildPartResult(part, answers));

  return {
    parts,
    summary: aggregateSummaries(parts.map((part) => part.summary)),
  };
}

// Keep only answers that name a real question in this section and a real
// option on that question.
//
// A server action is reachable by direct POST, so the argument is
// untrusted input even though the only caller is our own prototype. This
// discards anything unrecognized rather than rejecting the whole
// submission, so a stale answer left over from a content edit costs the
// learner one row instead of the entire section result.
//
// The same rule the six part actions apply, applied once across all 38
// questions.
export function sanitizeListeningSectionAnswers(
  content: ListeningSectionContent,
  answers: unknown,
): ListeningSectionAnswerMap {
  const clean: Record<string, string> = {};

  if (!answers || typeof answers !== "object") {
    return clean;
  }

  const submitted = answers as Record<string, unknown>;

  content.parts.forEach((part) => {
    listListeningSectionPartQuestions(part).forEach((question) => {
      const selectedOptionId = submitted[question.id];

      if (
        typeof selectedOptionId === "string" &&
        question.options.some((option) => option.id === selectedOptionId)
      ) {
        clean[question.id] = selectedOptionId;
      }
    });
  });

  return clean;
}
