"use client";

import { useActionState, useState } from "react";
import { AppButton } from "@/components/app/AppButton";
import { AppButtonLink } from "@/components/app/AppButtonLink";
import {
  initialAdminActionState,
  type AdminActionState,
} from "@/features/admin/admin-action-state";
import {
  BUILD_STATUSES,
  BUILD_STATUS_LABELS,
  DEFAULT_SCORING_TYPE,
  SCORING_TYPES,
  SCORING_TYPE_LABELS,
  SECTION_TYPES,
  SECTION_TYPE_LABELS,
  type MockTestSectionRow,
  type SectionType,
} from "@/features/admin/mock-test-types";
import {
  AdminFormMessage,
  SelectField,
  TextAreaField,
  TextField,
} from "./AdminFormFields";

// Add or edit one skill section.
//
// The skill drives two defaults: the suggested title and the scoring
// type. Listening and Reading are marked against an answer key, Writing
// and Speaking get an AI review that reports an estimated level. Those
// are suggestions, not locks, so both selects stay editable.
//
// A test holds one section per skill. On the add form the skills already
// on the test are disabled rather than hidden, so it is clear why a
// choice is missing.

export type MockTestSectionFormProps = {
  mode: "create" | "edit";
  mockTestId: string;
  section?: MockTestSectionRow;
  // Skills already on this test. Ignored when editing, since the section
  // being edited already holds one of them.
  takenSectionTypes?: SectionType[];
  // Suggested order for a new section.
  suggestedOrder?: number;
  // The server action this form posts to. The page picks it, so the form
  // stays a form and does not decide which write it is performing.
  action: (
    state: AdminActionState,
    formData: FormData,
  ) => Promise<AdminActionState>;
  cancelHref?: string;
};

export function MockTestSectionForm({
  mode,
  mockTestId,
  section,
  takenSectionTypes = [],
  suggestedOrder = 1,
  action,
  cancelHref,
}: MockTestSectionFormProps) {
  const isEdit = mode === "edit";

  const [state, formAction, pending] = useActionState(
    action,
    initialAdminActionState,
  );

  const available = SECTION_TYPES.filter(
    (type) => isEdit || !takenSectionTypes.includes(type),
  );

  const [sectionType, setSectionType] = useState<SectionType>(
    section?.section_type ?? available[0] ?? "listening",
  );

  const fieldError = (name: string) => state.fieldErrors[name];

  // Remounts the title and scoring inputs when the skill changes, so
  // their defaults follow the skill without either becoming a controlled
  // input or needing an effect to push a new value in.
  const defaultsKey = isEdit ? section?.id : sectionType;

  return (
    <form action={formAction} className="space-y-6" noValidate>
      <input type="hidden" name="mock_test_id" value={mockTestId} />
      {isEdit && section ? (
        <input type="hidden" name="section_id" value={section.id} />
      ) : null}

      <AdminFormMessage state={state} />

      <div className="grid gap-6 sm:grid-cols-2">
        <SelectField
          id={`section-type-${section?.id ?? "new"}`}
          name="section_type"
          label="Skill"
          required
          options={SECTION_TYPES.map((type) => ({
            value: type,
            label: SECTION_TYPE_LABELS[type],
            disabled: !isEdit && takenSectionTypes.includes(type),
          }))}
          value={sectionType}
          onChange={(value) => setSectionType(value as SectionType)}
          hint="One section per skill. A practice test normally has all four."
          error={fieldError("section_type")}
        />

        <TextField
          id={`section-order-${section?.id ?? "new"}`}
          name="section_order"
          label="Section order"
          type="number"
          min={1}
          max={20}
          required
          hint="Exam order runs Listening, Reading, Writing, Speaking."
          error={fieldError("section_order")}
          defaultValue={String(section?.section_order ?? suggestedOrder)}
        />
      </div>

      <TextField
        key={`title-${defaultsKey}`}
        id={`section-title-${section?.id ?? "new"}`}
        name="title"
        label="Section title"
        required
        maxLength={200}
        hint="Shown on the section intro screen."
        error={fieldError("title")}
        defaultValue={section?.title ?? SECTION_TYPE_LABELS[sectionType]}
      />

      <TextAreaField
        id={`section-instructions-${section?.id ?? "new"}`}
        name="instructions"
        label="Instructions"
        rows={4}
        hint="The instruction text a student reads before the section starts."
        error={fieldError("instructions")}
        defaultValue={section?.instructions}
        placeholder="You will hear a series of recordings. You can listen to each one only once."
      />

      <div className="grid gap-6 sm:grid-cols-3">
        <TextField
          id={`section-duration-${section?.id ?? "new"}`}
          name="estimated_duration_minutes"
          label="Estimated duration"
          type="number"
          min={1}
          max={600}
          hint="Minutes. Display only, not the clock a student runs against."
          error={fieldError("estimated_duration_minutes")}
          defaultValue={
            section?.estimated_duration_minutes === null ||
            section?.estimated_duration_minutes === undefined
              ? ""
              : String(section.estimated_duration_minutes)
          }
        />

        <SelectField
          key={`scoring-${defaultsKey}`}
          id={`section-scoring-${section?.id ?? "new"}`}
          name="scoring_type"
          label="Scoring type"
          options={SCORING_TYPES.map((type) => ({
            value: type,
            label: SCORING_TYPE_LABELS[type],
          }))}
          emptyLabel="Not decided yet"
          defaultValue={
            section?.scoring_type ?? DEFAULT_SCORING_TYPE[sectionType]
          }
          hint="Objective sections are marked against an answer key. Rubric sections get an AI review with an estimated level."
          error={fieldError("scoring_type")}
        />

        <SelectField
          id={`section-status-${section?.id ?? "new"}`}
          name="status"
          label="Section status"
          required
          options={BUILD_STATUSES.map((status) => ({
            value: status,
            label: BUILD_STATUS_LABELS[status],
          }))}
          defaultValue={section?.status ?? "draft"}
          hint="A section can be finished before the test is."
          error={fieldError("status")}
        />
      </div>

      <div className="flex flex-wrap items-center gap-3 border-t border-academy-line pt-6">
        <AppButton
          type="submit"
          isLoading={pending}
          loadingText={isEdit ? "Saving..." : "Adding..."}
          size={isEdit ? "sm" : "md"}
        >
          {isEdit ? "Save section" : "Add section"}
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
    </form>
  );
}
