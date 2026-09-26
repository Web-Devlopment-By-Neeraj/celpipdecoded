"use client";

import Link from "next/link";
import { AppCard } from "@/components/app/AppCard";
import { AppStatusBadge } from "@/components/app/AppStatusBadge";
import { cx, text } from "@/features/design/design-tokens";
import type { AdminActionState } from "@/features/admin/admin-action-state";
import {
  BUILD_STATUS_LABELS,
  BUILD_STATUS_TONES,
  SCORING_TYPE_LABELS,
  SECTION_TYPE_LABELS,
  type MockTestSectionWithParts,
} from "@/features/admin/mock-test-types";
import { MockTestPartList } from "./MockTestPartList";
import { MockTestSectionForm } from "./MockTestSectionForm";

// The sections of one practice test, each with its parts and an edit
// form behind a disclosure.
//
// This is the working screen of the builder, so it is a list rather than
// a table: a section carries a title, instructions, a duration, a
// scoring type, a status and a variable number of parts, and none of
// that fits a row.

export type MockTestSectionListProps = {
  mockTestId: string;
  sections: MockTestSectionWithParts[];
  addSectionHref: string;
  updateSectionAction: (
    state: AdminActionState,
    formData: FormData,
  ) => Promise<AdminActionState>;
  updatePartAction: (
    state: AdminActionState,
    formData: FormData,
  ) => Promise<AdminActionState>;
};

export function MockTestSectionList({
  mockTestId,
  sections,
  addSectionHref,
  updateSectionAction,
  updatePartAction,
}: MockTestSectionListProps) {
  if (sections.length === 0) {
    return (
      <AppCard variant="subtle">
        <h3 className={cx(text.heading, "text-base")}>No sections yet</h3>
        <p className={cx("mt-2 max-w-xl text-sm leading-6", text.secondary)}>
          A practice test needs at least one section. Add Listening,
          Reading, Writing or Speaking to start.
        </p>
        <p className="mt-4">
          <Link
            href={addSectionHref}
            className={cx(
              "text-sm font-semibold underline underline-offset-2 hover:no-underline",
              text.accent,
            )}
          >
            Add a section
          </Link>
        </p>
      </AppCard>
    );
  }

  return (
    <ul className="space-y-5">
      {sections.map((section) => (
        <li key={section.id}>
          <AppCard padding="none" as="article">
            <div className="flex flex-wrap items-start gap-x-4 gap-y-2 border-b border-academy-line px-6 py-5">
              <div className="min-w-0 flex-1">
                <p className={text.eyebrow}>
                  Section {section.section_order} -{" "}
                  {SECTION_TYPE_LABELS[section.section_type]}
                </p>
                <h3 className={cx(text.heading, "mt-1.5 text-lg")}>
                  {section.title}
                </h3>
                <p className={cx("mt-1 text-xs", text.muted)}>
                  {describeSection(section)}
                </p>
              </div>

              <AppStatusBadge tone={BUILD_STATUS_TONES[section.status]} withDot>
                {BUILD_STATUS_LABELS[section.status]}
              </AppStatusBadge>
            </div>

            <div className="space-y-5 px-6 py-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h4 className={cx("text-sm font-semibold", text.primary)}>
                  Parts
                </h4>
                <Link
                  href={`/dashboard/admin/mock-tests/${mockTestId}/sections/${section.id}/parts/new`}
                  className={cx(
                    "text-sm font-semibold underline underline-offset-2 hover:no-underline",
                    text.accent,
                  )}
                >
                  Add a part
                </Link>
              </div>

              <MockTestPartList
                mockTestId={mockTestId}
                sectionId={section.id}
                sectionType={section.section_type}
                parts={section.parts}
                updateAction={updatePartAction}
              />

              <details className="rounded-2xl border border-academy-line">
                <summary className="cursor-pointer px-4 py-3 text-sm font-semibold text-academy-navy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-academy-blue">
                  Edit section details
                </summary>
                <div className="border-t border-academy-line px-4 py-5">
                  <MockTestSectionForm
                    mode="edit"
                    mockTestId={mockTestId}
                    section={section}
                    action={updateSectionAction}
                  />
                </div>
              </details>
            </div>
          </AppCard>
        </li>
      ))}
    </ul>
  );
}

// The supporting line under a section title. Says what is set and what
// is not, rather than hiding an unset field behind a blank.
function describeSection(section: MockTestSectionWithParts): string {
  const pieces: string[] = [];

  pieces.push(
    `${section.parts.length} part${section.parts.length === 1 ? "" : "s"}`,
  );

  pieces.push(
    section.estimated_duration_minutes === null
      ? "no estimated duration"
      : `about ${section.estimated_duration_minutes} minutes`,
  );

  pieces.push(
    section.scoring_type === null
      ? "no scoring type"
      : SCORING_TYPE_LABELS[section.scoring_type],
  );

  return pieces.join(" - ");
}
