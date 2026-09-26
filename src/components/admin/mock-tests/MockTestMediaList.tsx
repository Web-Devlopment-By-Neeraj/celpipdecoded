"use client";

import Link from "next/link";
import { cx, text } from "@/features/design/design-tokens";
import {
  MEDIA_TYPE_LABELS,
  type MockTestMediaAssetRow,
} from "@/features/admin/mock-test-content-types";
import { AdminDeleteForm, type AdminFormAction } from "./AdminFormFields";
import { MockTestMediaForm } from "./MockTestMediaForm";

// The media links on one part, each with an edit form behind a
// disclosure.
//
// A details element rather than a route, the same shape the ADMIN-01
// part list uses. Adding is a route because an add form starts empty and
// benefits from a screen of its own. Editing is not, because the thing
// being edited is already on screen, and the transcript field is long
// enough that a page load between reading a clip and correcting its text
// is a real cost.

export type MockTestMediaListProps = {
  mockTestId: string;
  sectionId: string;
  partId: string;
  media: MockTestMediaAssetRow[];
  addMediaHref: string;
  updateAction: AdminFormAction;
  deleteAction: AdminFormAction;
};

export function MockTestMediaList({
  mockTestId,
  sectionId,
  partId,
  media,
  addMediaHref,
  updateAction,
  deleteAction,
}: MockTestMediaListProps) {
  if (media.length === 0) {
    return (
      <p className={cx("text-sm leading-6", text.secondary)}>
        No media links on this part yet. A Listening part needs at least
        one clip.{" "}
        <Link
          href={addMediaHref}
          className={cx(
            "font-semibold underline underline-offset-2 hover:no-underline",
            text.accent,
          )}
        >
          Add a media link
        </Link>
        .
      </p>
    );
  }

  return (
    <ul className="space-y-3">
      {media.map((asset) => (
        <li
          key={asset.id}
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
                {asset.display_order}
              </span>

              <span className="font-semibold text-academy-navy">
                {asset.title?.trim() || "Untitled media link"}
              </span>

              <span className={cx("ml-auto text-xs", text.muted)}>
                {summarize(asset)}
              </span>
            </summary>

            <div className="space-y-5 border-t border-academy-line px-4 py-5">
              <MockTestMediaForm
                mode="edit"
                mockTestId={mockTestId}
                sectionId={sectionId}
                partId={partId}
                asset={asset}
                action={updateAction}
              />

              <div className="border-t border-academy-line pt-5">
                <AdminDeleteForm
                  action={deleteAction}
                  fields={{
                    mock_test_id: mockTestId,
                    section_id: sectionId,
                    part_id: partId,
                    media_asset_id: asset.id,
                  }}
                  label="Remove this media link"
                  warning="Any question attached to it keeps its wording and loses the attachment."
                />
              </div>
            </div>
          </details>
        </li>
      ))}
    </ul>
  );
}

// The one line shown while a media link is collapsed. Says what is
// missing rather than leaving a blank, so an unfinished row is obvious.
function summarize(asset: MockTestMediaAssetRow): string {
  const pieces: string[] = [
    asset.media_type ? MEDIA_TYPE_LABELS[asset.media_type] : "No media type",
    (asset.url ?? "").trim().length > 0 ? "URL set" : "no URL",
  ];

  if ((asset.alt_text ?? "").trim().length > 0) {
    pieces.push("alt text set");
  }

  if ((asset.transcript ?? "").trim().length > 0) {
    pieces.push("transcript set");
  }

  return pieces.join(" - ");
}
