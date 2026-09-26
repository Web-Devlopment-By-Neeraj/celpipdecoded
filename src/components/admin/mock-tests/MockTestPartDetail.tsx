import { AppButtonLink } from "@/components/app/AppButtonLink";
import { AppCard } from "@/components/app/AppCard";
import { AppStatusBadge } from "@/components/app/AppStatusBadge";
import { cx, text } from "@/features/design/design-tokens";
import type { MockTestPartContent } from "@/features/admin/mock-test-content-types";
import type { PartContentSummary } from "@/features/admin/mock-test-content-validation";
import type { MockTestPartContext } from "@/features/admin/mock-test-queries";
import {
  BUILD_STATUS_LABELS,
  BUILD_STATUS_TONES,
  PART_TYPE_LABELS,
  SECTION_TYPE_LABELS,
  TIMER_TYPE_LABELS,
  formatSeconds,
} from "@/features/admin/mock-test-types";
import {
  AdminActionButton,
  type AdminFormAction,
} from "./AdminFormFields";
import { MockTestContentValidationPanel } from "./MockTestContentValidationPanel";
import { MockTestMediaList } from "./MockTestMediaList";
import { MockTestQuestionList } from "./MockTestQuestionList";

// The working screen for one part: what it is, the media on it, and the
// questions under it.
//
// A server component. The two lists inside are client components,
// because a media row edits in place and a delete needs a form, but the
// page around them renders on the server and the answer key never
// crosses into it: nothing on this screen prints a correct answer. The
// preview screen does that, deliberately and in one place.

export type MockTestPartDetailProps = {
  context: MockTestPartContext;
  content: MockTestPartContent;
  validation: PartContentSummary;
  // The part's own URL, which every child route hangs off.
  partHref: string;
  updateMediaAction: AdminFormAction;
  deleteMediaAction: AdminFormAction;
  validateAction: AdminFormAction;
};

export function MockTestPartDetail({
  context,
  content,
  validation,
  partHref,
  updateMediaAction,
  deleteMediaAction,
  validateAction,
}: MockTestPartDetailProps) {
  const { test, section, part } = context;

  const addMediaHref = `${partHref}/media/new`;
  const addQuestionHref = `${partHref}/questions/new`;

  const routeFields = {
    mock_test_id: test.id,
    section_id: section.id,
    part_id: part.id,
  };

  return (
    <div className="space-y-8">
      <AppCard as="section" ariaLabel="Part details">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <p className={text.eyebrow}>
              {SECTION_TYPE_LABELS[section.section_type]} - part{" "}
              {part.part_order}
            </p>
            <h2 className={cx(text.heading, "mt-1.5 text-xl")}>{part.title}</h2>
            <p className={cx("mt-1 text-xs", text.muted)}>{summarize(part)}</p>
          </div>

          <AppStatusBadge tone={BUILD_STATUS_TONES[part.status]} withDot>
            {BUILD_STATUS_LABELS[part.status]}
          </AppStatusBadge>
        </div>

        {part.instructions ? (
          <p
            className={cx(
              "mt-4 max-w-2xl whitespace-pre-line text-sm leading-6",
              text.secondary,
            )}
          >
            {part.instructions}
          </p>
        ) : (
          <p className={cx("mt-4 text-sm leading-6", text.muted)}>
            This part has no instruction text. Add it on the practice test
            screen.
          </p>
        )}

        <dl className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Stat label="Questions" value={String(validation.questionCount)} />
          <Stat label="Media links" value={String(validation.mediaCount)} />
          <Stat
            label="Points"
            value={
              validation.totalPoints === 0
                ? "-"
                : String(validation.totalPoints)
            }
          />
          <Stat label="Problems" value={String(validation.errorCount)} />
        </dl>

        <div className="mt-6 flex flex-wrap items-center gap-3 border-t border-academy-line pt-6">
          <AppButtonLink href={addQuestionHref} size="sm">
            Add question
          </AppButtonLink>
          <AppButtonLink href={addMediaHref} variant="secondary" size="sm">
            Add media link
          </AppButtonLink>
          <AppButtonLink
            href={`${partHref}/preview`}
            variant="secondary"
            size="sm"
          >
            Preview part
          </AppButtonLink>
          <AdminActionButton
            action={validateAction}
            fields={routeFields}
            label="Run content check"
            loadingLabel="Checking..."
            variant="ghost"
          />
        </div>
      </AppCard>

      <MockTestContentValidationPanel summary={validation} />

      <section aria-label="Media links" className="space-y-5">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className={cx(text.heading, "text-lg")}>Media links</h2>
            <p className={cx("mt-1 text-sm leading-6", text.secondary)}>
              Pasted URLs, never uploaded files. A Listening part needs at
              least one clip; a Reading part usually needs none.
            </p>
          </div>

          <AppButtonLink href={addMediaHref} variant="secondary" size="sm">
            Add media link
          </AppButtonLink>
        </div>

        <MockTestMediaList
          mockTestId={test.id}
          sectionId={section.id}
          partId={part.id}
          media={content.media}
          addMediaHref={addMediaHref}
          updateAction={updateMediaAction}
          deleteAction={deleteMediaAction}
        />
      </section>

      <section aria-label="Questions" className="space-y-5">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className={cx(text.heading, "text-lg")}>Questions</h2>
            <p className={cx("mt-1 text-sm leading-6", text.secondary)}>
              Open a question to edit its wording, its options and its
              answer key.
            </p>
          </div>

          <AppButtonLink href={addQuestionHref} size="sm">
            Add question
          </AppButtonLink>
        </div>

        <MockTestQuestionList
          questions={content.questions}
          partHref={partHref}
          addQuestionHref={addQuestionHref}
        />
      </section>
    </div>
  );
}

// The supporting line under the part title. Says what is set and what is
// not, rather than hiding an unset field behind a blank.
function summarize(part: MockTestPartContext["part"]): string {
  const pieces: string[] = [
    part.part_type ? PART_TYPE_LABELS[part.part_type] : "No part type",
    part.timer_type ? TIMER_TYPE_LABELS[part.timer_type] : "No timer type",
  ];

  if (part.timer_type === "prep_and_recording") {
    pieces.push(
      `prep ${formatSeconds(part.prep_time_seconds)}, recording ${formatSeconds(part.response_time_seconds)}`,
    );
  }

  if (part.question_count !== null) {
    pieces.push(
      `${part.question_count} question${part.question_count === 1 ? "" : "s"} expected`,
    );
  }

  return pieces.join(" - ");
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt
        className={cx(
          "text-xs font-semibold uppercase tracking-wide",
          text.muted,
        )}
      >
        {label}
      </dt>
      <dd
        className={cx("mt-1 text-xl font-semibold tabular-nums", text.primary)}
      >
        {value}
      </dd>
    </div>
  );
}
