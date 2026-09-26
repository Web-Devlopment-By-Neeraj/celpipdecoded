// Structure validation for the ADMIN-01 mock test builder.
//
// Pure functions, no database access. The preview screen calls
// evaluateMockTestStructure to show what is wrong without writing
// anything, and the validateMockTestStructure server action calls the
// same function before it refreshes the cached rows in
// mock_test_validation_issues. One set of rules, two callers, so a
// warning on screen and a stored row can never disagree.
//
// Scope note. These are the structure rules only, the subset of
// docs/admin/mock-test-builder-workflow.md section 12 that ADMIN-01 can
// actually check. Questions, options, answer keys, media, timers,
// scoring rules and rubrics are not built yet, so their rules are listed
// at the foot of this file as the ADMIN-02 and later set rather than
// silently omitted.
//
// House style: normal hyphens only, straight quotes only.

import {
  PART_TYPES_BY_SECTION,
  SECTION_TYPE_LABELS,
  type MockTestStructure,
} from "./mock-test-types";

export type IssueSeverity = "error" | "warning";

export type IssueEntityType = "test" | "section" | "part";

export type MockTestIssue = {
  // Rule code, stored as issue_type. Stable, so a resolved issue can be
  // recognized across runs.
  issueType: string;
  message: string;
  severity: IssueSeverity;
  entityType: IssueEntityType;
  // Null for a whole test rule.
  entityId: string | null;
};

export type ValidationSummary = {
  issues: MockTestIssue[];
  errorCount: number;
  warningCount: number;
  // True when nothing of error severity is open. Warnings never block.
  canAdvanceStatus: boolean;
};

// Runs every structure rule and returns the findings in a stable order:
// test rules first, then section rules in section order, then part rules
// in part order. Stable order matters because the preview lists them and
// a jumping list is hard to work through.
export function evaluateMockTestStructure(
  structure: MockTestStructure,
): ValidationSummary {
  const issues: MockTestIssue[] = [];
  const { test, sections } = structure;

  // ---- Whole test rules -------------------------------------------

  if (test.title.trim().length === 0) {
    issues.push({
      issueType: "test_title_missing",
      message: "The practice test has no title.",
      severity: "error",
      entityType: "test",
      entityId: null,
    });
  }

  if (test.slug.trim().length === 0) {
    issues.push({
      issueType: "test_slug_missing",
      message: "The practice test has no slug.",
      severity: "error",
      entityType: "test",
      entityId: null,
    });
  }

  if (sections.length === 0) {
    issues.push({
      issueType: "test_has_no_sections",
      message:
        "The practice test has no sections. Add at least one of Listening, Reading, Writing or Speaking.",
      severity: "error",
      entityType: "test",
      entityId: null,
    });
  }

  if (sections.length > 0 && sections.length < 4) {
    const present = new Set(sections.map((section) => section.section_type));
    const missing = (["listening", "reading", "writing", "speaking"] as const)
      .filter((skill) => !present.has(skill))
      .map((skill) => SECTION_TYPE_LABELS[skill]);

    issues.push({
      issueType: "test_missing_skill_sections",
      message: `The practice test has no ${missing.join(", ")} section. A full practice test normally has all four.`,
      severity: "warning",
      entityType: "test",
      entityId: null,
    });
  }

  if ((test.description ?? "").trim().length === 0) {
    issues.push({
      issueType: "test_description_missing",
      message:
        "The practice test has no description. Students see this wording on the test card.",
      severity: "warning",
      entityType: "test",
      entityId: null,
    });
  }

  // Section order has to be contiguous from 1 across the test. Reported
  // rather than enforced by a unique constraint, so a staff member can
  // reorder two sections without the first write being refused.
  const sectionOrders = sections.map((section) => section.section_order);
  const duplicateSectionOrders = findDuplicates(sectionOrders);

  if (duplicateSectionOrders.length > 0) {
    issues.push({
      issueType: "test_duplicate_section_order",
      message: `Two or more sections share order ${duplicateSectionOrders.join(", ")}. Section order has to be unique.`,
      severity: "error",
      entityType: "test",
      entityId: null,
    });
  }

  if (sections.length > 0 && !isContiguousFromOne(sectionOrders)) {
    issues.push({
      issueType: "test_section_order_not_contiguous",
      message: `Section order should run 1 to ${sections.length} with no gaps. It currently reads ${[...sectionOrders].sort((a, b) => a - b).join(", ")}.`,
      severity: "warning",
      entityType: "test",
      entityId: null,
    });
  }

  // ---- Section and part rules --------------------------------------

  for (const section of sections) {
    const sectionLabel = SECTION_TYPE_LABELS[section.section_type];

    if (section.title.trim().length === 0) {
      issues.push({
        issueType: "section_title_missing",
        message: `The ${sectionLabel} section has no title.`,
        severity: "error",
        entityType: "section",
        entityId: section.id,
      });
    }

    if (section.parts.length === 0) {
      issues.push({
        issueType: "section_has_no_parts",
        message: `The ${sectionLabel} section has no parts.`,
        severity: "error",
        entityType: "section",
        entityId: section.id,
      });
    }

    if ((section.instructions ?? "").trim().length === 0) {
      issues.push({
        issueType: "section_instructions_missing",
        message: `The ${sectionLabel} section has no instruction text for its intro screen.`,
        severity: "warning",
        entityType: "section",
        entityId: section.id,
      });
    }

    if (section.scoring_type === null) {
      issues.push({
        issueType: "section_scoring_type_missing",
        message: `The ${sectionLabel} section has no scoring type. Objective sections are marked against an answer key, rubric sections get an AI review with an estimated level.`,
        severity: "warning",
        entityType: "section",
        entityId: section.id,
      });
    }

    const partOrders = section.parts.map((part) => part.part_order);
    const duplicatePartOrders = findDuplicates(partOrders);

    if (duplicatePartOrders.length > 0) {
      issues.push({
        issueType: "section_duplicate_part_order",
        message: `Two or more parts in the ${sectionLabel} section share order ${duplicatePartOrders.join(", ")}.`,
        severity: "error",
        entityType: "section",
        entityId: section.id,
      });
    }

    if (section.parts.length > 0 && !isContiguousFromOne(partOrders)) {
      issues.push({
        issueType: "section_part_order_not_contiguous",
        message: `Part order in the ${sectionLabel} section should run 1 to ${section.parts.length} with no gaps.`,
        severity: "warning",
        entityType: "section",
        entityId: section.id,
      });
    }

    // The estimated duration is display text, not a clock, so a missing
    // one is a warning. A learner never runs against this number.
    if (section.estimated_duration_minutes === null) {
      issues.push({
        issueType: "section_duration_missing",
        message: `The ${sectionLabel} section has no estimated duration.`,
        severity: "warning",
        entityType: "section",
        entityId: section.id,
      });
    }

    for (const part of section.parts) {
      const partLabel = `${sectionLabel} part ${part.part_order}`;

      if (part.title.trim().length === 0) {
        issues.push({
          issueType: "part_title_missing",
          message: `${partLabel} has no title.`,
          severity: "error",
          entityType: "part",
          entityId: part.id,
        });
      }

      if (part.part_type === null) {
        issues.push({
          issueType: "part_type_missing",
          message: `${partLabel} has no part type, so nothing knows what shape it takes.`,
          severity: "error",
          entityType: "part",
          entityId: part.id,
        });
      } else if (
        !PART_TYPES_BY_SECTION[section.section_type].includes(part.part_type)
      ) {
        issues.push({
          issueType: "part_type_wrong_section",
          message: `${partLabel} uses a part type that does not belong in a ${sectionLabel} section.`,
          severity: "error",
          entityType: "part",
          entityId: part.id,
        });
      }

      if ((part.instructions ?? "").trim().length === 0) {
        issues.push({
          issueType: "part_instructions_missing",
          message: `${partLabel} has no instruction text.`,
          severity: "warning",
          entityType: "part",
          entityId: part.id,
        });
      }

      if (part.timer_type === null) {
        issues.push({
          issueType: "part_timer_type_missing",
          message: `${partLabel} has no timer type.`,
          severity: "warning",
          entityType: "part",
          entityId: part.id,
        });
      }

      // Both Speaking windows are required together. A recording window
      // with no preparation window is a modelling error, not a default,
      // which is the rule the workflow document states for Speaking.
      if (part.timer_type === "prep_and_recording") {
        if (part.prep_time_seconds === null) {
          issues.push({
            issueType: "part_prep_time_missing",
            message: `${partLabel} runs a preparation and recording window but has no preparation time.`,
            severity: "error",
            entityType: "part",
            entityId: part.id,
          });
        }

        if (part.response_time_seconds === null) {
          issues.push({
            issueType: "part_response_time_missing",
            message: `${partLabel} runs a preparation and recording window but has no recording time.`,
            severity: "error",
            entityType: "part",
            entityId: part.id,
          });
        }
      }

      // Question authoring is ADMIN-02. Until then the count is a staff
      // estimate, and a missing one only means the preview cannot show a
      // total. It never blocks anything.
      if (
        section.scoring_type === "objective" &&
        (part.question_count === null || part.question_count === 0)
      ) {
        issues.push({
          issueType: "part_question_count_missing",
          message: `${partLabel} has no expected question count. Questions themselves are authored in a later ticket.`,
          severity: "warning",
          entityType: "part",
          entityId: part.id,
        });
      }
    }
  }

  const errorCount = issues.filter(
    (issue) => issue.severity === "error",
  ).length;

  return {
    issues,
    errorCount,
    warningCount: issues.length - errorCount,
    canAdvanceStatus: errorCount === 0,
  };
}

// Sorted list of every value that appears more than once.
function findDuplicates(values: number[]): number[] {
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

// True when the values are exactly 1, 2, 3 and so on with no gaps and no
// repeats.
function isContiguousFromOne(values: number[]): boolean {
  if (values.length === 0) {
    return true;
  }

  const sorted = [...values].sort((a, b) => a - b);

  return sorted.every((value, index) => value === index + 1);
}

// ---------------------------------------------------------------------
// Rules that are deliberately not checked yet
// ---------------------------------------------------------------------
//
// Listed so the gap is a decision rather than an oversight. Each becomes
// a rule in the ticket that builds the thing it checks.
//
//   ADMIN-02  every objective question has at least two options
//   ADMIN-02  no two options on a question share identical text
//   ADMIN-02  every scored objective question has an answer key row
//   ADMIN-02  every correct option belongs to that question
//   ADMIN-02  no answer key exists for a Writing or Speaking task
//   ADMIN-02  every media screen references an asset with a real URL
//   ADMIN-02  every image asset has non-empty alt text
//   ADMIN-03  required timer rules exist and carry an on_expire value
//   ADMIN-03  a derived timer value has a source note
//   ADMIN-04  every section has a scoring rule with a band map
//   ADMIN-04  every scoring rule and rubric has disclaimer text
//   ADMIN-05  no learner-facing text claims an official CELPIP score
//
// The last one matters most and is the reason publishing stays blocked
// in ADMIN-01: nothing authored here reaches a learner, so no text scan
// is standing between an authored sentence and a student.
