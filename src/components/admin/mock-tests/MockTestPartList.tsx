"use client";

import Link from "next/link";
import { AppStatusBadge } from "@/components/app/AppStatusBadge";
import { cx, text } from "@/features/design/design-tokens";
import type { AdminActionState } from "@/features/admin/admin-action-state";
import {
  BUILD_STATUS_LABELS,
  BUILD_STATUS_TONES,
  PART_TYPE_LABELS,
  TIMER_TYPE_LABELS,
  formatSeconds,
  type MockTestPartRow,
  type SectionType,
} from "@/features/admin/mock-test-types";
import { MockTestPartForm } from "./MockTestPartForm";

// The parts inside one section, each with an edit form behind a
// disclosure.
//
// A details element rather than a route, so editing a part does not cost
// a page load and the ticket's route list stays as it is. The forms
// inside are only mounted once opened by the browser, which keeps a
// section with eight parts from rendering eight forms at once.

export type MockTestPartListProps = {
  mockTestId: string;
  sectionId: string;
  sectionType: SectionType;
  parts: MockTestPartRow[];
  // The update part action. Each row posts to it with its own part id.
  updateAction: (
    state: AdminActionState,
    formData: FormData,
  ) => Promise<AdminActionState>;
};

export function MockTestPartList({
  mockTestId,
  sectionId,
  sectionType,
  parts,
  updateAction,
}: MockTestPartListProps) {
  if (parts.length === 0) {
    return (
      <p className={cx("text-sm leading-6", text.muted)}>
        No parts in this section yet.
      </p>
    );
  }

  return (
    <ul className="space-y-3">
      {parts.map((part) => (
        <li
          key={part.id}
          className="rounded-2xl border border-academy-line bg-white"
        >
          <details className="group">
            <summary className="flex cursor-pointer flex-wrap items-center gap-x-3 gap-y-2 rounded-2xl px-4 py-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-academy-blue">
              <span
                className={cx(
                  "inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-academy-navy/5 text-xs font-semibold tabular-nums",
                  text.secondary,
                )}
              >
                {part.part_order}
              </span>

              <span className="font-semibold text-academy-navy">
                {part.title}
              </span>

              <AppStatusBadge tone={BUILD_STATUS_TONES[part.status]}>
                {BUILD_STATUS_LABELS[part.status]}
              </AppStatusBadge>

              <span className={cx("ml-auto text-xs", text.muted)}>
                {summarize(part)}
              </span>
            </summary>

            <div className="space-y-5 border-t border-academy-line px-4 py-5">
              {/* The way into the ADMIN-02 content editor. It sits inside
                  the disclosure rather than in the summary row, because a
                  link inside a summary element is a second control in the
                  same click target and neither one then behaves the way it
                  looks. */}
              <p className="flex flex-wrap items-center gap-x-3 gap-y-1">
                <Link
                  href={`/dashboard/admin/mock-tests/${mockTestId}/sections/${sectionId}/parts/${part.id}`}
                  className={cx(
                    "text-sm font-semibold underline underline-offset-2 hover:no-underline",
                    text.accent,
                  )}
                >
                  Open questions and media
                </Link>
                <span className={cx("text-xs", text.muted)}>
                  Questions, options, answer keys and media links.
                </span>
              </p>

              <MockTestPartForm
                mode="edit"
                mockTestId={mockTestId}
                sectionId={sectionId}
                sectionType={sectionType}
                part={part}
                action={updateAction}
              />
            </div>
          </details>
        </li>
      ))}
    </ul>
  );
}

// The one line shown while a part is collapsed. Reads as a sentence
// rather than a row of dashes, so a half filled part is obvious at a
// glance.
function summarize(part: MockTestPartRow): string {
  const pieces: string[] = [];

  pieces.push(
    part.part_type ? PART_TYPE_LABELS[part.part_type] : "No part type",
  );

  if (part.timer_type) {
    pieces.push(TIMER_TYPE_LABELS[part.timer_type]);
  }

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
