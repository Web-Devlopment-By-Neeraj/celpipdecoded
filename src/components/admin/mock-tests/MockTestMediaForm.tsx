"use client";

import { useActionState } from "react";
import { AppButton } from "@/components/app/AppButton";
import { AppButtonLink } from "@/components/app/AppButtonLink";
import { cx, text } from "@/features/design/design-tokens";
import { initialAdminActionState } from "@/features/admin/admin-action-state";
import {
  MEDIA_TYPES,
  MEDIA_TYPE_LABELS,
  VISUAL_MEDIA_TYPES,
  type MockTestMediaAssetRow,
} from "@/features/admin/mock-test-content-types";
import {
  AdminFormMessage,
  SelectField,
  TextAreaField,
  TextField,
  type AdminFormAction,
} from "./AdminFormFields";

// Add or edit one media link on a part.
//
// A link and nothing else. ADMIN-02 does not build file upload, so there
// is no file input on this form and the server action accepts none: the
// URL points at an asset that already exists somewhere, which is how all
// 46 Mock Test 1 assets already work.
//
// The URL is checked for shape rather than fetched. A HEAD request would
// say whether the link resolves right now, but it turns every save into
// an outbound request and fails on a Cloudinary asset that is still
// processing. Verifying a link is a later ticket.

export type MockTestMediaFormProps = {
  mode: "create" | "edit";
  mockTestId: string;
  sectionId: string;
  partId: string;
  asset?: MockTestMediaAssetRow;
  // Suggested order for a new media link.
  suggestedOrder?: number;
  action: AdminFormAction;
  cancelHref?: string;
};

export function MockTestMediaForm({
  mode,
  mockTestId,
  sectionId,
  partId,
  asset,
  suggestedOrder = 1,
  action,
  cancelHref,
}: MockTestMediaFormProps) {
  const isEdit = mode === "edit";

  const [state, formAction, pending] = useActionState(
    action,
    initialAdminActionState,
  );

  const fieldError = (name: string) => state.fieldErrors[name];
  const idFor = (suffix: string) => `media-${suffix}-${asset?.id ?? "new"}`;

  return (
    <form action={formAction} className="space-y-6" noValidate>
      <input type="hidden" name="mock_test_id" value={mockTestId} />
      <input type="hidden" name="section_id" value={sectionId} />
      <input type="hidden" name="part_id" value={partId} />
      {isEdit && asset ? (
        <input type="hidden" name="media_asset_id" value={asset.id} />
      ) : null}

      <AdminFormMessage state={state} />

      <div className="grid gap-6 sm:grid-cols-2">
        <SelectField
          id={idFor("type")}
          name="media_type"
          label="Media type"
          required
          options={MEDIA_TYPES.map((type) => ({
            value: type,
            label: MEDIA_TYPE_LABELS[type],
          }))}
          defaultValue={asset?.media_type ?? "audio"}
          hint="What the link points at. Cloudinary serves mp3 audio under its video path, which is normal and still counts as Audio here."
          error={fieldError("media_type")}
        />

        <TextField
          id={idFor("order")}
          name="display_order"
          label="Display order"
          type="number"
          min={0}
          max={999}
          required
          hint="The order this asset appears in on the part."
          error={fieldError("display_order")}
          defaultValue={String(asset?.display_order ?? suggestedOrder)}
        />
      </div>

      <TextField
        id={idFor("url")}
        name="url"
        label="URL"
        required
        maxLength={2000}
        placeholder="https://res.cloudinary.com/..."
        hint="A full delivery URL. Paste the link that plays or displays the asset, not a console page."
        error={fieldError("url")}
        defaultValue={asset?.url}
      />

      <TextField
        id={idFor("title")}
        name="title"
        label="Title"
        maxLength={200}
        hint="A staff facing name, so this asset is recognizable in a list."
        error={fieldError("title")}
        defaultValue={asset?.title}
      />

      <TextAreaField
        id={idFor("alt")}
        name="alt_text"
        label="Alt text"
        rows={2}
        hint={`What a learner using a screen reader hears in place of the asset. Expected on ${VISUAL_MEDIA_TYPES.map((type) => MEDIA_TYPE_LABELS[type].toLowerCase()).join(" and ")} links.`}
        error={fieldError("alt_text")}
        defaultValue={asset?.alt_text}
      />

      <TextAreaField
        id={idFor("transcript")}
        name="transcript"
        label="Transcript"
        rows={8}
        hint="The words spoken in an audio or video clip. Staff use it to check a clip against its questions."
        error={fieldError("transcript")}
        defaultValue={asset?.transcript}
      />

      <TextAreaField
        id={idFor("notes")}
        name="internal_notes"
        label="Internal notes"
        rows={3}
        hint="Staff only. Never shown to a student."
        error={fieldError("internal_notes")}
        defaultValue={asset?.internal_notes}
      />

      <div className="flex flex-wrap items-center gap-3 border-t border-academy-line pt-6">
        <AppButton
          type="submit"
          isLoading={pending}
          loadingText={isEdit ? "Saving..." : "Adding..."}
          size={isEdit ? "sm" : "md"}
        >
          {isEdit ? "Save media link" : "Add media link"}
        </AppButton>

        {cancelHref ? (
          <AppButtonLink
            href={cancelHref}
            variant="ghost"
            size={isEdit ? "sm" : "md"}
          >
            Cancel
          </AppButtonLink>
        ) : null}
      </div>

      <p className={cx("text-xs leading-5", text.muted)}>
        Media is linked, never uploaded. Nothing on this form sends a file
        anywhere, and nothing here is visible to a student.
      </p>
    </form>
  );
}
