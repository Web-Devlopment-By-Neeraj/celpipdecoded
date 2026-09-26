import { AppCard } from "@/components/app/AppCard";
import { AppStatusBadge } from "@/components/app/AppStatusBadge";
import { cx, text } from "@/features/design/design-tokens";
import type { PartContentSummary } from "@/features/admin/mock-test-content-validation";

// The content problems and warnings found in one part.
//
// Recomputed on every render from the rules in
// src/features/admin/mock-test-content-validation.ts, rather than read
// from a stored table, so what is on screen is what is true now. The
// validatePartContent action runs the same rules and returns a count; it
// stores nothing, because the cached rows in
// mock_test_validation_issues belong to the whole test structure check
// and that one rewrites them wholesale.
//
// A problem means the part cannot be marked. A warning means it can, but
// something a staff member would want to know is missing.

export type MockTestContentValidationPanelProps = {
  summary: PartContentSummary;
  // The heading changes with where this sits, since the part screen and
  // the preview screen both show it.
  title?: string;
};

export function MockTestContentValidationPanel({
  summary,
  title = "Content checks",
}: MockTestContentValidationPanelProps) {
  if (summary.issues.length === 0) {
    return (
      <AppCard as="section" ariaLabel={title} variant="subtle">
        <h2 className={cx(text.heading, "text-lg")}>{title} passed</h2>
        <p className={cx("mt-2 max-w-2xl text-sm leading-6", text.secondary)}>
          Every content rule this version of the builder can check is
          satisfied: {summary.questionCount} question
          {summary.questionCount === 1 ? "" : "s"} worth {summary.totalPoints}{" "}
          point{summary.totalPoints === 1 ? "" : "s"}, each with options and
          an answer key. Timers, scoring rules and rubrics are checked once
          the tickets that build them land.
        </p>
      </AppCard>
    );
  }

  const errors = summary.issues.filter((issue) => issue.severity === "error");
  const warnings = summary.issues.filter(
    (issue) => issue.severity === "warning",
  );

  return (
    <AppCard
      as="section"
      ariaLabel={title}
      variant={errors.length > 0 ? "danger" : "subtle"}
    >
      <h2 className={cx(text.heading, "text-lg")}>{title}</h2>
      <p className={cx("mt-2 text-sm leading-6", text.secondary)}>
        {errors.length} to fix, {warnings.length} to look at. Anything listed
        as a problem means this part cannot be marked as it stands.
      </p>

      {errors.length > 0 ? (
        <IssueGroup title="Problems" tone="error" issues={errors} />
      ) : null}

      {warnings.length > 0 ? (
        <IssueGroup title="Warnings" tone="warning" issues={warnings} />
      ) : null}
    </AppCard>
  );
}

function IssueGroup({
  title,
  tone,
  issues,
}: {
  title: string;
  tone: "error" | "warning";
  issues: PartContentSummary["issues"];
}) {
  return (
    <div className="mt-5">
      <h3 className="flex items-center gap-2 text-sm font-semibold text-academy-navy">
        {title}
        <AppStatusBadge tone={tone}>{issues.length}</AppStatusBadge>
      </h3>
      <ul className="mt-3 space-y-2">
        {issues.map((issue, index) => (
          <li
            key={`${issue.issueType}-${issue.entityId ?? "part"}-${index}`}
            className={cx("text-sm leading-6", text.secondary)}
          >
            {issue.message}
          </li>
        ))}
      </ul>
    </div>
  );
}
