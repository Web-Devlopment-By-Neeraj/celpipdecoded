"use client";

import { useActionState } from "react";
import { AppButton } from "@/components/app/AppButton";
import { cx, text } from "@/features/design/design-tokens";
import { initialAdminActionState } from "@/features/admin/admin-action-state";
import {
  suggestOptionLabel,
  type MockTestOptionRow,
} from "@/features/admin/mock-test-content-types";
import {
  AdminDeleteForm,
  AdminFormMessage,
  TextAreaField,
  TextField,
  type AdminFormAction,
} from "./AdminFormFields";

// The answer options on one question: an editable row for each, and an
// add form underneath.
//
// Every row is its own form posting its own option id, rather than one
// form holding every option. A single form would mean a typo in option D
// blocks the save of option A, and it would need array field names that
// the server action has to unpick. Four small forms are more markup and
// less to go wrong.
//
// There is no correct answer control here. Correctness lives in the
// answer key editor below this one, for the same reason it lives in its
// own table: an option row a learner route could one day read must not
// be able to carry the answer.

export type MockTestOptionEditorProps = {
  mockTestId: string;
  sectionId: string;
  partId: string;
  questionId: string;
  options: MockTestOptionRow[];
  createAction: AdminFormAction;
  updateAction: AdminFormAction;
  deleteAction: AdminFormAction;
};

export function MockTestOptionEditor({
  mockTestId,
  sectionId,
  partId,
  questionId,
  options,
  createAction,
  updateAction,
  deleteAction,
}: MockTestOptionEditorProps) {
  const routeFields = {
    mock_test_id: mockTestId,
    section_id: sectionId,
    part_id: partId,
    question_id: questionId,
  };

  return (
    <div className="space-y-6">
      {options.length === 0 ? (
        <p className={cx("text-sm leading-6", text.secondary)}>
          This question has no options yet. An objective question needs at
          least two, and normally four.
        </p>
      ) : (
        <ul className="space-y-4">
          {options.map((option) => (
            <li
              key={option.id}
              className="rounded-2xl border border-academy-line bg-white px-4 py-4"
            >
              <OptionRow
                option={option}
                routeFields={routeFields}
                updateAction={updateAction}
                deleteAction={deleteAction}
              />
            </li>
          ))}
        </ul>
      )}

      <div className="rounded-2xl bg-academy-navy-soft/40 px-4 py-4">
        <h4 className={cx("text-sm font-semibold", text.primary)}>
          Add an option
        </h4>
        <div className="mt-4">
          <AddOptionForm
            routeFields={routeFields}
            suggestedLabel={suggestOptionLabel(options)}
            suggestedOrder={nextOrder(options)}
            action={createAction}
          />
        </div>
      </div>
    </div>
  );
}

type RouteFields = Record<string, string>;

// One saved option, editable in place.
function OptionRow({
  option,
  routeFields,
  updateAction,
  deleteAction,
}: {
  option: MockTestOptionRow;
  routeFields: RouteFields;
  updateAction: AdminFormAction;
  deleteAction: AdminFormAction;
}) {
  const [state, formAction, pending] = useActionState(
    updateAction,
    initialAdminActionState,
  );

  const fieldError = (name: string) => state.fieldErrors[name];
  const idFor = (suffix: string) => `option-${suffix}-${option.id}`;

  return (
    <div className="space-y-4">
      <form action={formAction} className="space-y-4" noValidate>
        {Object.entries(routeFields).map(([name, value]) => (
          <input key={name} type="hidden" name={name} value={value} />
        ))}
        <input type="hidden" name="option_id" value={option.id} />

        <AdminFormMessage state={state} />

        <div className="grid gap-4 sm:grid-cols-[6rem_6rem_1fr]">
          <TextField
            id={idFor("label")}
            name="option_label"
            label="Label"
            required
            maxLength={20}
            error={fieldError("option_label")}
            defaultValue={option.option_label}
          />

          <TextField
            id={idFor("order")}
            name="display_order"
            label="Order"
            type="number"
            min={0}
            max={999}
            required
            error={fieldError("display_order")}
            defaultValue={String(option.display_order)}
          />

          <TextAreaField
            id={idFor("text")}
            name="option_text"
            label="Option text"
            rows={2}
            required
            error={fieldError("option_text")}
            defaultValue={option.option_text}
          />
        </div>

        <AppButton
          type="submit"
          variant="secondary"
          size="sm"
          isLoading={pending}
          loadingText="Saving..."
        >
          Save option
        </AppButton>
      </form>

      <AdminDeleteForm
        action={deleteAction}
        fields={{ ...routeFields, option_id: option.id }}
        label="Remove option"
        warning="An option that is the correct answer cannot be removed until the answer key points somewhere else."
      />
    </div>
  );
}

// The add form under the list. Prefilled with the next free letter, so
// entering A to D is four submits and no typing in the label box.
function AddOptionForm({
  routeFields,
  suggestedLabel,
  suggestedOrder,
  action,
}: {
  routeFields: RouteFields;
  suggestedLabel: string;
  suggestedOrder: number;
  action: AdminFormAction;
}) {
  const [state, formAction, pending] = useActionState(
    action,
    initialAdminActionState,
  );

  const fieldError = (name: string) => state.fieldErrors[name];

  // Keyed on the suggestion so the boxes clear and re-prefill after each
  // successful add, rather than holding the option that was just saved.
  const formKey = `${suggestedLabel}-${suggestedOrder}`;

  return (
    <form key={formKey} action={formAction} className="space-y-4" noValidate>
      {Object.entries(routeFields).map(([name, value]) => (
        <input key={name} type="hidden" name={name} value={value} />
      ))}

      <AdminFormMessage state={state} />

      <div className="grid gap-4 sm:grid-cols-[6rem_6rem_1fr]">
        <TextField
          id="option-label-new"
          name="option_label"
          label="Label"
          required
          maxLength={20}
          error={fieldError("option_label")}
          defaultValue={suggestedLabel}
        />

        <TextField
          id="option-order-new"
          name="display_order"
          label="Order"
          type="number"
          min={0}
          max={999}
          required
          error={fieldError("display_order")}
          defaultValue={String(suggestedOrder)}
        />

        <TextAreaField
          id="option-text-new"
          name="option_text"
          label="Option text"
          rows={2}
          required
          error={fieldError("option_text")}
        />
      </div>

      <AppButton
        type="submit"
        size="sm"
        isLoading={pending}
        loadingText="Adding..."
      >
        Add option
      </AppButton>
    </form>
  );
}

function nextOrder(options: MockTestOptionRow[]): number {
  return (
    options.reduce((highest, option) => Math.max(highest, option.display_order), 0) +
    1
  );
}
