"use client";

import { useActionState, useState } from "react";
import { AppButton } from "@/components/app/AppButton";
import { AppButtonLink } from "@/components/app/AppButtonLink";
import { cx, text } from "@/features/design/design-tokens";
import {
  initialAdminActionState,
  type AdminActionState,
} from "@/features/admin/admin-action-state";
import {
  MOCK_TEST_STATUSES,
  MOCK_TEST_STATUS_HINTS,
  MOCK_TEST_STATUS_LABELS,
  toSlug,
  type MockTestRow,
} from "@/features/admin/mock-test-types";
import {
  AdminFormMessage,
  SelectField,
  TextAreaField,
  TextField,
} from "./AdminFormFields";

// Create and edit the basic details of a practice test.
//
// One component for both, because the two forms differ by exactly two
// things: the create form has no status select, since a new test is
// always a draft, and the edit form carries the id. Splitting them would
// mean maintaining the same six fields twice.
//
// Title and slug are the only controlled inputs on the page. They are
// controlled because they talk to each other: while creating a test the
// slug follows the title, and it stops following the moment a staff
// member types in the slug box. On an existing test the slug is an
// identifier, so it never follows anything.

export type MockTestFormProps = {
  mode: "create" | "edit";
  // Present when editing.
  mockTest?: MockTestRow;
  // The server action this form posts to. The page picks it, so the form
  // stays a form and does not decide which write it is performing.
  action: (
    state: AdminActionState,
    formData: FormData,
  ) => Promise<AdminActionState>;
  cancelHref: string;
};

export function MockTestForm({
  mode,
  mockTest,
  action,
  cancelHref,
}: MockTestFormProps) {
  const isEdit = mode === "edit";

  const [state, formAction, pending] = useActionState(
    action,
    initialAdminActionState,
  );

  const [title, setTitle] = useState(mockTest?.title ?? "");
  const [slug, setSlug] = useState(mockTest?.slug ?? "");
  // An existing slug counts as already chosen, so editing a title never
  // rewrites the URL of a test that has been shared.
  const [slugFollowsTitle, setSlugFollowsTitle] = useState(!isEdit);

  const fieldError = (name: string) => state.fieldErrors[name];

  function handleTitleChange(value: string) {
    setTitle(value);

    if (slugFollowsTitle) {
      setSlug(toSlug(value));
    }
  }

  function handleSlugChange(value: string) {
    setSlug(value);
    setSlugFollowsTitle(false);
  }

  return (
    <form action={formAction} className="space-y-6" noValidate>
      {isEdit && mockTest ? (
        <input type="hidden" name="mock_test_id" value={mockTest.id} />
      ) : null}

      <AdminFormMessage state={state} />

      <div className="grid gap-6 sm:grid-cols-2">
        <TextField
          id="mock-test-title"
          name="title"
          label="Title"
          required
          maxLength={200}
          hint="Staff and student facing. For example, Practice Test 2."
          error={fieldError("title")}
          value={title}
          onChange={handleTitleChange}
          placeholder="Practice Test 2"
        />

        <TextField
          id="mock-test-slug"
          name="slug"
          label="Slug"
          required
          maxLength={120}
          hint={
            slugFollowsTitle
              ? "Suggested from the title. Type here to set your own."
              : "Lowercase letters, numbers and single hyphens. Has to be unique across practice tests."
          }
          error={fieldError("slug")}
          value={slug}
          onChange={handleSlugChange}
          placeholder="practice-test-2"
        />
      </div>

      <TextAreaField
        id="mock-test-description"
        name="description"
        label="Description"
        rows={3}
        hint="One or two sentences. This is practice material and reports an estimated level, not an official CELPIP score."
        error={fieldError("description")}
        defaultValue={mockTest?.description}
        placeholder="A full length CELPIP practice test covering Listening, Reading, Writing and Speaking."
      />

      <div className="grid gap-6 sm:grid-cols-2">
        <TextField
          id="mock-test-version"
          name="version"
          label="Version"
          type="number"
          min={1}
          max={999}
          required
          hint="Raise this when the content changes after a test has been used."
          error={fieldError("version")}
          defaultValue={String(mockTest?.version ?? 1)}
        />

        {isEdit ? (
          <SelectField
            id="mock-test-status"
            name="status"
            label="Status"
            required
            options={MOCK_TEST_STATUSES.map((status) => ({
              value: status,
              label: MOCK_TEST_STATUS_LABELS[status],
            }))}
            defaultValue={mockTest?.status ?? "draft"}
            hint={MOCK_TEST_STATUS_HINTS[mockTest?.status ?? "draft"]}
            error={fieldError("status")}
          />
        ) : (
          <div className="flex items-end">
            <p className={cx("text-xs leading-5", text.muted)}>
              A new practice test is always created as a draft. Students
              cannot see it, and the status can be changed once the
              structure is in place.
            </p>
          </div>
        )}
      </div>

      <TextAreaField
        id="mock-test-internal-notes"
        name="internal_notes"
        label="Internal notes"
        rows={3}
        hint="Staff only. Never shown to a student and never included in a student facing response."
        error={fieldError("internal_notes")}
        defaultValue={mockTest?.internal_notes}
        placeholder="Source material, known gaps, who is reviewing this."
      />

      <div className="flex flex-wrap items-center gap-3 border-t border-academy-line pt-6">
        <AppButton
          type="submit"
          isLoading={pending}
          loadingText={isEdit ? "Saving..." : "Creating..."}
        >
          {isEdit ? "Save details" : "Create draft"}
        </AppButton>

        <AppButtonLink href={cancelHref} variant="ghost" size="md">
          Cancel
        </AppButtonLink>
      </div>
    </form>
  );
}
