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
  BUILD_STATUSES,
  BUILD_STATUS_LABELS,
  DEFAULT_TIMER_TYPE,
  PART_TYPES_BY_SECTION,
  PART_TYPE_LABELS,
  TIMER_TYPES,
  TIMER_TYPE_LABELS,
  type MockTestPartRow,
  type SectionType,
  type TimerType,
} from "@/features/admin/mock-test-types";
import {
  AdminFormMessage,
  SelectField,
  TextAreaField,
  TextField,
} from "./AdminFormFields";

// Add or edit one part inside a section.
//
// The part type list is filtered to the section's skill, so a Reading
// part type cannot be picked inside a Listening section. The server
// action checks the same thing, because the select is only a convenience
// and a direct POST does not go through it.
//
// The two Speaking timing fields appear only when the timer type is a
// preparation and recording pair. Both are required together in that
// case: a recording window with no preparation window is a modelling
// error, which is the rule the workflow document states.

export type MockTestPartFormProps = {
  mode: "create" | "edit";
  mockTestId: string;
  sectionId: string;
  sectionType: SectionType;
  part?: MockTestPartRow;
  // Suggested order for a new part.
  suggestedOrder?: number;
  // The server action this form posts to. The page picks it, so the form
  // stays a form and does not decide which write it is performing.
  action: (
    state: AdminActionState,
    formData: FormData,
  ) => Promise<AdminActionState>;
  cancelHref?: string;
};

export function MockTestPartForm({
  mode,
  mockTestId,
  sectionId,
  sectionType,
  part,
  suggestedOrder = 1,
  action,
  cancelHref,
}: MockTestPartFormProps) {
  const isEdit = mode === "edit";

  const [state, formAction, pending] = useActionState(
    action,
    initialAdminActionState,
  );

  // Controlled because the two Speaking timing fields depend on it.
  const [timerType, setTimerType] = useState<TimerType | "">(
    part?.timer_type ?? DEFAULT_TIMER_TYPE[sectionType],
  );

  const showSpeakingTimers = timerType === "prep_and_recording";
  const fieldError = (name: string) => state.fieldErrors[name];
  const idFor = (suffix: string) => `part-${suffix}-${part?.id ?? "new"}`;

  return (
    <form action={formAction} className="space-y-6" noValidate>
      <input type="hidden" name="mock_test_id" value={mockTestId} />
      <input type="hidden" name="section_id" value={sectionId} />
      {isEdit && part ? (
        <input type="hidden" name="part_id" value={part.id} />
      ) : null}

      <AdminFormMessage state={state} />

      <div className="grid gap-6 sm:grid-cols-2">
        <TextField
          id={idFor("title")}
          name="title"
          label="Part title"
          required
          maxLength={200}
          hint="For example, Listening to Viewpoints."
          error={fieldError("title")}
          defaultValue={part?.title}
        />

        <TextField
          id={idFor("order")}
          name="part_order"
          label="Part order"
          type="number"
          min={1}
          max={50}
          required
          hint="Runs from 1 inside this section, with no gaps."
          error={fieldError("part_order")}
          defaultValue={String(part?.part_order ?? suggestedOrder)}
        />
      </div>

      <SelectField
        id={idFor("type")}
        name="part_type"
        label="Part type"
        options={PART_TYPES_BY_SECTION[sectionType].map((type) => ({
          value: type,
          label: PART_TYPE_LABELS[type],
        }))}
        emptyLabel="Not decided yet"
        defaultValue={part?.part_type}
        hint="Only the shapes that belong in this section are listed. The part type decides the screen flow a later ticket builds."
        error={fieldError("part_type")}
      />

      <TextAreaField
        id={idFor("instructions")}
        name="instructions"
        label="Instructions"
        rows={4}
        hint="The instruction text on the part intro screen."
        error={fieldError("instructions")}
        defaultValue={part?.instructions}
      />

      <div className="grid gap-6 sm:grid-cols-2">
        <SelectField
          id={idFor("timer")}
          name="timer_type"
          label="Timer type"
          options={TIMER_TYPES.map((type) => ({
            value: type,
            label: TIMER_TYPE_LABELS[type],
          }))}
          emptyLabel="Not decided yet"
          value={timerType}
          onChange={(value) => setTimerType(value as TimerType | "")}
          hint="The shape of the window. The exact seconds arrive with timer rules in a later ticket."
          error={fieldError("timer_type")}
        />

        <TextField
          id={idFor("question-count")}
          name="question_count"
          label="Expected questions"
          type="number"
          min={0}
          max={100}
          hint="A staff estimate for the preview. Questions themselves are authored in a later ticket."
          error={fieldError("question_count")}
          defaultValue={
            part?.question_count === null || part?.question_count === undefined
              ? ""
              : String(part.question_count)
          }
        />
      </div>

      {showSpeakingTimers ? (
        <div className="grid gap-6 sm:grid-cols-2">
          <TextField
            id={idFor("prep")}
            name="prep_time_seconds"
            label="Preparation time"
            type="number"
            min={0}
            max={3600}
            hint="Seconds. Required alongside a recording window."
            error={fieldError("prep_time_seconds")}
            defaultValue={
              part?.prep_time_seconds === null ||
              part?.prep_time_seconds === undefined
                ? ""
                : String(part.prep_time_seconds)
            }
          />

          <TextField
            id={idFor("response")}
            name="response_time_seconds"
            label="Recording time"
            type="number"
            min={1}
            max={7200}
            hint="Seconds. Required alongside a preparation window."
            error={fieldError("response_time_seconds")}
            defaultValue={
              part?.response_time_seconds === null ||
              part?.response_time_seconds === undefined
                ? ""
                : String(part.response_time_seconds)
            }
          />
        </div>
      ) : (
        <p className={cx("text-xs leading-5", text.muted)}>
          Preparation and recording times apply to a Speaking task. Choose
          the preparation and recording timer type to set them. Saving
          under any other timer type clears both, because they describe a
          window this part no longer runs.
        </p>
      )}

      <SelectField
        id={idFor("status")}
        name="status"
        label="Part status"
        required
        options={BUILD_STATUSES.map((status) => ({
          value: status,
          label: BUILD_STATUS_LABELS[status],
        }))}
        defaultValue={part?.status ?? "draft"}
        hint="Ready means the structure of this part is settled. Questions and answer keys come later."
        error={fieldError("status")}
      />

      <div className="flex flex-wrap items-center gap-3 border-t border-academy-line pt-6">
        <AppButton
          type="submit"
          isLoading={pending}
          loadingText={isEdit ? "Saving..." : "Adding..."}
          size={isEdit ? "sm" : "md"}
        >
          {isEdit ? "Save part" : "Add part"}
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
