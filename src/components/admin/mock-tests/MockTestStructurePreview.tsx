import { AppCard } from "@/components/app/AppCard";
import { AppStatusBadge } from "@/components/app/AppStatusBadge";
import { cx, text } from "@/features/design/design-tokens";
import {
  MOCK_TEST_STATUS_LABELS,
  MOCK_TEST_STATUS_TONES,
  PART_TYPE_LABELS,
  SCORING_TYPE_LABELS,
  SECTION_TYPE_LABELS,
  TIMER_TYPE_LABELS,
  formatSeconds,
  type MockTestStructure,
} from "@/features/admin/mock-test-types";
import type { ValidationSummary } from "@/features/admin/mock-test-validation";

// The read only view of what has been authored: every section, every
// part, and every structure problem found.
//
// This is a structure preview, not a student preview. It does not render
// a single learner screen, because there are no questions, no options,
// no media and no timer rules to render yet. Calling it a student
// preview would promise something ADMIN-01 does not build.
//
// Nothing here is student facing, and nothing here is an answer key: the
// answer key table does not exist yet.

export type MockTestStructurePreviewProps = {
  structure: MockTestStructure;
  validation: ValidationSummary;
};

export function MockTestStructurePreview({
  structure,
  validation,
}: MockTestStructurePreviewProps) {
  const { test, sections } = structure;

  const totalParts = sections.reduce(
    (running, section) => running + section.parts.length,
    0,
  );

  const expectedQuestions = sections.reduce(
    (running, section) =>
      running +
      section.parts.reduce(
        (partRunning, part) => partRunning + (part.question_count ?? 0),
        0,
      ),
    0,
  );

  return (
    <div className="space-y-8">
      <AppCard as="section" ariaLabel="Practice test summary">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <h2 className={cx(text.heading, "text-xl")}>{test.title}</h2>
            <p className={cx("mt-1 font-mono text-xs", text.muted)}>
              {test.slug} - version {test.version}
            </p>
            {test.description ? (
              <p className={cx("mt-3 max-w-2xl text-sm leading-6", text.secondary)}>
                {test.description}
              </p>
            ) : null}
          </div>

          <AppStatusBadge tone={MOCK_TEST_STATUS_TONES[test.status]} withDot>
            {MOCK_TEST_STATUS_LABELS[test.status]}
          </AppStatusBadge>
        </div>

        <dl className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Stat label="Sections" value={String(sections.length)} />
          <Stat label="Parts" value={String(totalParts)} />
          <Stat
            label="Questions expected"
            value={expectedQuestions === 0 ? "-" : String(expectedQuestions)}
          />
          <Stat
            label="Structure problems"
            value={String(validation.errorCount)}
          />
        </dl>

        <p className={cx("mt-6 text-xs leading-5", text.muted)}>
          This is a structure preview. Questions, options, answer keys,
          media and timer values are authored in later tickets, so nothing
          below runs as a practice test yet and no student can open it.
        </p>
      </AppCard>

      <ValidationPanel validation={validation} />

      <section aria-label="Structure" className="space-y-5">
        <h2 className={cx(text.heading, "text-lg")}>Structure</h2>

        {sections.length === 0 ? (
          <AppCard variant="subtle">
            <p className={cx("text-sm leading-6", text.secondary)}>
              This practice test has no sections yet, so there is nothing
              to preview.
            </p>
          </AppCard>
        ) : (
          <ol className="space-y-5">
            {sections.map((section) => (
              <li key={section.id}>
                <AppCard as="article" padding="none">
                  <div className="border-b border-academy-line px-6 py-5">
                    <p className={text.eyebrow}>
                      Section {section.section_order} -{" "}
                      {SECTION_TYPE_LABELS[section.section_type]}
                    </p>
                    <h3 className={cx(text.heading, "mt-1.5 text-base")}>
                      {section.title}
                    </h3>
                    <p className={cx("mt-1 text-xs", text.muted)}>
                      {section.estimated_duration_minutes === null
                        ? "No estimated duration"
                        : `About ${section.estimated_duration_minutes} minutes`}
                      {" - "}
                      {section.scoring_type === null
                        ? "No scoring type"
                        : SCORING_TYPE_LABELS[section.scoring_type]}
                    </p>
                    {section.instructions ? (
                      <p
                        className={cx(
                          "mt-3 max-w-2xl whitespace-pre-line text-sm leading-6",
                          text.secondary,
                        )}
                      >
                        {section.instructions}
                      </p>
                    ) : null}
                  </div>

                  <div className="px-6 py-5">
                    {section.parts.length === 0 ? (
                      <p className={cx("text-sm", text.muted)}>
                        No parts in this section.
                      </p>
                    ) : (
                      <ol className="space-y-4">
                        {section.parts.map((part) => (
                          <li
                            key={part.id}
                            className="rounded-2xl bg-academy-navy-soft/40 px-4 py-4"
                          >
                            <p
                              className={cx(
                                "text-sm font-semibold",
                                text.primary,
                              )}
                            >
                              Part {part.part_order}: {part.title}
                            </p>
                            <p className={cx("mt-1 text-xs", text.muted)}>
                              {part.part_type
                                ? PART_TYPE_LABELS[part.part_type]
                                : "No part type"}
                              {" - "}
                              {part.timer_type
                                ? TIMER_TYPE_LABELS[part.timer_type]
                                : "No timer type"}
                              {part.timer_type === "prep_and_recording"
                                ? ` - prep ${formatSeconds(part.prep_time_seconds)}, recording ${formatSeconds(part.response_time_seconds)}`
                                : ""}
                            </p>
                            {part.instructions ? (
                              <p
                                className={cx(
                                  "mt-2 whitespace-pre-line text-sm leading-6",
                                  text.secondary,
                                )}
                              >
                                {part.instructions}
                              </p>
                            ) : null}
                            <p className={cx("mt-2 text-xs", text.muted)}>
                              {part.question_count === null
                                ? "No expected question count"
                                : `${part.question_count} question${part.question_count === 1 ? "" : "s"} expected`}
                              {" - questions are authored in a later ticket"}
                            </p>
                          </li>
                        ))}
                      </ol>
                    )}
                  </div>
                </AppCard>
              </li>
            ))}
          </ol>
        )}
      </section>
    </div>
  );
}

// Errors and warnings from the structure rules, recomputed for this
// render rather than read from the cache table, so what is on screen is
// what is true now.
function ValidationPanel({ validation }: { validation: ValidationSummary }) {
  if (validation.issues.length === 0) {
    return (
      <AppCard as="section" ariaLabel="Structure checks" variant="subtle">
        <h2 className={cx(text.heading, "text-lg")}>Structure checks passed</h2>
        <p className={cx("mt-2 max-w-2xl text-sm leading-6", text.secondary)}>
          Every structure rule this version of the builder can check is
          satisfied. Questions, answer keys, media, timers and scoring
          rules are checked once the tickets that build them land.
        </p>
      </AppCard>
    );
  }

  const errors = validation.issues.filter(
    (issue) => issue.severity === "error",
  );
  const warnings = validation.issues.filter(
    (issue) => issue.severity === "warning",
  );

  return (
    <AppCard
      as="section"
      ariaLabel="Structure checks"
      variant={errors.length > 0 ? "danger" : "subtle"}
    >
      <h2 className={cx(text.heading, "text-lg")}>Structure checks</h2>
      <p className={cx("mt-2 text-sm leading-6", text.secondary)}>
        {errors.length} to fix, {warnings.length} to look at. Anything
        listed as a problem blocks this practice test from leaving draft.
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
  issues: ValidationSummary["issues"];
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
            key={`${issue.issueType}-${issue.entityId ?? "test"}-${index}`}
            className={cx("text-sm leading-6", text.secondary)}
          >
            {issue.message}
          </li>
        ))}
      </ul>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className={cx("text-xs font-semibold uppercase tracking-wide", text.muted)}>
        {label}
      </dt>
      <dd className={cx("mt-1 text-xl font-semibold tabular-nums", text.primary)}>
        {value}
      </dd>
    </div>
  );
}
