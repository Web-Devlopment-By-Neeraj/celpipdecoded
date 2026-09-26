// Part content validation for the ADMIN-02 editor.
//
// Pure functions, no database access, the same shape as
// mock-test-validation.ts uses for the ADMIN-01 structure rules. The
// part detail screen and the part preview screen both call
// evaluatePartContent to show what is wrong without writing anything,
// and the validatePartContent server action calls the same function so
// a warning on screen and a warning in an action result can never
// disagree.
//
// Scope note. These are the content rules for one part. Structure rules
// stay in mock-test-validation.ts and are run per practice test, because
// the two answer different questions: "is this test shaped like a
// CELPIP test" and "is this part finished".
//
// Nothing here writes to mock_test_validation_issues. That table is a
// cache for the builder list and validateMockTestStructure rewrites it
// wholesale for a test, so a part level run that added rows to it would
// have them deleted by the next structure check. The part results are
// recomputed on every render instead, which is cheap for one part and
// always current.
//
// House style: normal hyphens only, straight quotes only.

import {
  VISUAL_MEDIA_TYPES,
  isObjectiveQuestionType,
  questionBodyText,
  type MockTestMediaAssetRow,
  type MockTestPartContent,
} from "./mock-test-content-types";

export type ContentIssueSeverity = "error" | "warning";

// An option problem is reported against its question rather than
// against the option, because the question screen is where it gets
// fixed and a warning that names a row nothing links to is not useful.
export type ContentIssueEntityType = "part" | "question" | "media";

export type PartContentIssue = {
  // Rule code. Stable, so a message can be reworded without a caller
  // that matches on the rule breaking.
  issueType: string;
  message: string;
  severity: ContentIssueSeverity;
  entityType: ContentIssueEntityType;
  // Null for a whole part rule.
  entityId: string | null;
};

export type PartContentSummary = {
  issues: PartContentIssue[];
  errorCount: number;
  warningCount: number;
  questionCount: number;
  mediaCount: number;
  // Total points across every question, which is what a part is worth.
  totalPoints: number;
};

// Runs every content rule for one part and returns the findings in a
// stable order: part rules, then media rules, then question rules in
// question order. Stable order matters because the preview lists them
// and a jumping list is hard to work through.
export function evaluatePartContent(
  content: MockTestPartContent,
): PartContentSummary {
  const issues: PartContentIssue[] = [];
  const { questions, media } = content;

  // ---- Whole part rules --------------------------------------------

  if (questions.length === 0) {
    issues.push({
      issueType: "part_has_no_questions",
      message:
        "This part has no questions yet. Add at least one question before the part can be marked ready.",
      severity: "error",
      entityType: "part",
      entityId: null,
    });
  }

  // Duplicate question numbers are reported rather than refused by a
  // unique constraint, because swapping question 3 and question 4 has to
  // pass through a state where two rows share a number. Same choice
  // ADMIN-01 made for section and part order.
  const duplicateNumbers = findDuplicateNumbers(
    questions.map((question) => question.question_number),
  );

  if (duplicateNumbers.length > 0) {
    issues.push({
      issueType: "part_duplicate_question_numbers",
      message: `Two or more questions in this part share number ${duplicateNumbers.join(", ")}. Question numbers have to be unique inside a part.`,
      severity: "error",
      entityType: "part",
      entityId: null,
    });
  }

  // ---- Media rules -------------------------------------------------

  for (const asset of media) {
    const label = describeAssetForMessage(asset);

    if (asset.media_type === null) {
      issues.push({
        issueType: "media_type_missing",
        message: `${label} has no media type, so nothing knows how to render it.`,
        severity: "error",
        entityType: "media",
        entityId: asset.id,
      });
    }

    if ((asset.url ?? "").trim().length === 0) {
      issues.push({
        issueType: "media_url_missing",
        message: `${label} has no URL, so there is nothing to play or show.`,
        severity: "error",
        entityType: "media",
        entityId: asset.id,
      });
    }

    // Alt text on a picture is the accessible text a learner using a
    // screen reader gets instead of the picture. A warning rather than
    // an error, because a placeholder image should still save.
    if (
      asset.media_type !== null &&
      VISUAL_MEDIA_TYPES.includes(asset.media_type) &&
      (asset.alt_text ?? "").trim().length === 0
    ) {
      issues.push({
        issueType: "media_alt_text_missing",
        message: `${label} has no alt text. A learner using a screen reader gets nothing in place of the picture.`,
        severity: "warning",
        entityType: "media",
        entityId: asset.id,
      });
    }

    if (
      asset.media_type === "audio" &&
      (asset.transcript ?? "").trim().length === 0
    ) {
      issues.push({
        issueType: "media_transcript_missing",
        message: `${label} has no transcript. Staff need one to check a Listening clip against its questions.`,
        severity: "warning",
        entityType: "media",
        entityId: asset.id,
      });
    }
  }

  // ---- Question rules ----------------------------------------------

  for (const question of questions) {
    const label = `Question ${question.question_number}`;

    if (questionBodyText(question).length === 0) {
      issues.push({
        issueType: "question_prompt_or_stem_missing",
        message: `${label} has neither a prompt nor a stem, so there is nothing to ask.`,
        severity: "error",
        entityType: "question",
        entityId: question.id,
      });
    }

    const objective = isObjectiveQuestionType(question.question_type);

    if (objective && question.options.length < 2) {
      issues.push({
        issueType: "question_too_few_options",
        message: `${label} has ${question.options.length === 0 ? "no options" : "only one option"}. An objective question needs at least two, and normally four.`,
        severity: "error",
        entityType: "question",
        entityId: question.id,
      });
    }

    const duplicateLabels = findDuplicateLabels(
      question.options.map((option) => option.option_label),
    );

    if (duplicateLabels.length > 0) {
      issues.push({
        issueType: "question_duplicate_option_labels",
        message: `${label} has more than one option labelled ${duplicateLabels.join(", ")}.`,
        severity: "error",
        entityType: "question",
        entityId: question.id,
      });
    }

    const key = question.answerKey;

    if (objective && key === null) {
      issues.push({
        issueType: "question_answer_key_missing",
        message: `${label} has no answer key, so it cannot be marked.`,
        severity: "error",
        entityType: "question",
        entityId: question.id,
      });
    }

    if (key !== null) {
      if (key.correct_option_id === null) {
        issues.push({
          issueType: "answer_key_no_correct_option",
          message: `${label} has an answer key with no correct option selected.`,
          severity: "error",
          entityType: "question",
          entityId: question.id,
        });
      } else if (
        !question.options.some((option) => option.id === key.correct_option_id)
      ) {
        // Reachable when an option was deleted out from under a key, or
        // when a key was written against another question's option.
        issues.push({
          issueType: "answer_key_option_not_on_question",
          message: `${label} has an answer key pointing at an option that is not on this question. Choose the correct option again.`,
          severity: "error",
          entityType: "question",
          entityId: question.id,
        });
      }

      if (!Number.isInteger(key.points) || key.points < 1) {
        issues.push({
          issueType: "answer_key_points_invalid",
          message: `${label} has an answer key worth ${key.points} points. A marked question has to be worth at least one.`,
          severity: "error",
          entityType: "question",
          entityId: question.id,
        });
      } else if (key.points !== question.points) {
        // Not an error. The two values are allowed to differ, and the
        // note is here so a difference is a decision rather than a typo
        // nobody noticed.
        issues.push({
          issueType: "answer_key_points_differ",
          message: `${label} is worth ${question.points} on the question and ${key.points} on the answer key. Marking uses the answer key value.`,
          severity: "warning",
          entityType: "question",
          entityId: question.id,
        });
      }
    }

    // Two options with the same wording make one of them unmarkable,
    // because a learner picking either has picked the same thing.
    const duplicateText = findDuplicateLabels(
      question.options.map((option) => option.option_text),
    );

    if (duplicateText.length > 0) {
      issues.push({
        issueType: "question_duplicate_option_text",
        message: `${label} has two options with identical wording. Only one of them can be the right answer.`,
        severity: "warning",
        entityType: "question",
        entityId: question.id,
      });
    }

    if (question.media_asset_id !== null) {
      const attached = media.some(
        (asset) => asset.id === question.media_asset_id,
      );

      if (!attached) {
        issues.push({
          issueType: "question_media_not_in_part",
          message: `${label} is attached to a media link that is not on this part.`,
          severity: "warning",
          entityType: "question",
          entityId: question.id,
        });
      }
    }

    if ((key?.explanation ?? "").trim().length === 0) {
      issues.push({
        issueType: "answer_key_explanation_missing",
        message: `${label} has no explanation on its answer key. Staff use it when a student asks why an answer is wrong.`,
        severity: "warning",
        entityType: "question",
        entityId: question.id,
      });
    }
  }

  const errorCount = issues.filter(
    (issue) => issue.severity === "error",
  ).length;

  return {
    issues,
    errorCount,
    warningCount: issues.length - errorCount,
    questionCount: questions.length,
    mediaCount: media.length,
    totalPoints: questions.reduce(
      (running, question) => running + question.points,
      0,
    ),
  };
}

// Names one media row in a message. Falls back through title then URL,
// so a row with neither is still identifiable by its type.
function describeAssetForMessage(asset: MockTestMediaAssetRow): string {
  const name = asset.title?.trim();

  if (name) {
    return `The media link "${name}"`;
  }

  const url = asset.url?.trim();

  if (url) {
    return `The media link ${truncate(url, 60)}`;
  }

  return "A media link on this part";
}

function truncate(value: string, max: number): string {
  return value.length <= max ? value : `${value.slice(0, max - 3)}...`;
}

// Sorted list of every number that appears more than once.
function findDuplicateNumbers(values: number[]): number[] {
  const seen = new Set<number>();
  const duplicates = new Set<number>();

  for (const value of values) {
    if (seen.has(value)) {
      duplicates.add(value);
    }
    seen.add(value);
  }

  return [...duplicates].sort((a, b) => a - b);
}

// Sorted list of every string that appears more than once, compared
// case insensitively and with surrounding space ignored, because "a "
// and "A" are the same label to a reader.
function findDuplicateLabels(values: string[]): string[] {
  const seen = new Set<string>();
  const duplicates = new Set<string>();

  for (const value of values) {
    const key = value.trim().toLowerCase();

    if (key.length === 0) {
      continue;
    }

    if (seen.has(key)) {
      duplicates.add(value.trim());
    }
    seen.add(key);
  }

  return [...duplicates].sort((a, b) => a.localeCompare(b));
}
