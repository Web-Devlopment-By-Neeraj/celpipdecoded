"use client";

import { useActionState } from "react";
import { AppButton } from "@/components/app/AppButton";
import { cx, text } from "@/features/design/design-tokens";
import { initialAdminActionState } from "@/features/admin/admin-action-state";
import type {
  MockTestAnswerKeyRow,
  MockTestOptionRow,
} from "@/features/admin/mock-test-content-types";
import {
  AdminDeleteForm,
  AdminFormMessage,
  SelectField,
  TextAreaField,
  TextField,
  type AdminFormAction,
} from "./AdminFormFields";

// The answer key for one question.
//
// ADMIN ONLY. This is the one editor in the builder whose contents a
// student must never see. Three things keep that true and none of them
// is this component:
//
//   1. mock_test_answer_keys has no row level security policy for anon
//      or authenticated at all, so a browser holding the anon key reads
//      nothing from it.
//   2. Only a server action that has passed requireAdmin reaches the
//      service role client that can.
//   3. No learner route reads the table, because ADMIN-02 builds no
//      learner route.
//
// This component is rendered inside an admin page behind requireAdmin,
// which is why it can show the answer at all. When a dynamic learner
// runner is built it gets its own read that never fetches a key, rather
// than a flag on the existing one.
//
// Two actions rather than one. setAction creates the key or replaces it;
// updateAction refuses to create one, so a form that believes it is
// editing a key whose row was deleted in another tab hears about it
// instead of quietly making a new one.

export type MockTestAnswerKeyEditorProps = {
  mockTestId: string;
  sectionId: string;
  partId: string;
  questionId: string;
  options: MockTestOptionRow[];
  answerKey: MockTestAnswerKeyRow | null;
  // The points value on the question, offered as the default for a new
  // key so the two agree unless someone changes one on purpose.
  questionPoints: number;
  setAction: AdminFormAction;
  updateAction: AdminFormAction;
  deleteAction: AdminFormAction;
};

export function MockTestAnswerKeyEditor({
  mockTestId,
  sectionId,
  partId,
  questionId,
  options,
  answerKey,
  questionPoints,
  setAction,
  updateAction,
  deleteAction,
}: MockTestAnswerKeyEditorProps) {
  const hasKey = answerKey !== null;

  const [state, formAction, pending] = useActionState(
    hasKey ? updateAction : setAction,
    initialAdminActionState,
  );

  const fieldError = (name: string) => state.fieldErrors[name];
  const idFor = (suffix: string) => `answer-key-${suffix}-${questionId}`;

  return (
    <div className="space-y-6">
      <form action={formAction} className="space-y-6" noValidate>
        <input type="hidden" name="mock_test_id" value={mockTestId} />
        <input type="hidden" name="section_id" value={sectionId} />
        <input type="hidden" name="part_id" value={partId} />
        <input type="hidden" name="question_id" value={questionId} />

        <AdminFormMessage state={state} />

        {options.length === 0 ? (
          <p className={cx("text-sm leading-6", text.secondary)}>
            Add the options first. The correct answer is chosen from them.
          </p>
        ) : null}

        <div className="grid gap-6 sm:grid-cols-[1fr_8rem]">
          <SelectField
            id={idFor("option")}
            name="correct_option_id"
            label="Correct option"
            options={options.map((option) => ({
              value: option.id,
              label: `${option.option_label} - ${truncate(option.option_text, 80)}`,
            }))}
            emptyLabel={
              options.length === 0
                ? "No options on this question yet"
                : "Not decided yet"
            }
            defaultValue={answerKey?.correct_option_id}
            hint="Only the options on this question are offered. A key saved with none is reported as unmarkable."
            error={fieldError("correct_option_id")}
          />

          <TextField
            id={idFor("points")}
            name="points"
            label="Points"
            type="number"
            min={1}
            max={100}
            required
            hint="What a correct answer scores."
            error={fieldError("points")}
            defaultValue={String(answerKey?.points ?? questionPoints ?? 1)}
          />
        </div>

        <TextField
          id={idFor("text")}
          name="correct_text"
          label="Correct text"
          maxLength={2000}
          hint="Only for an item marked against typed text rather than a chosen option. Leave empty for a multiple choice question."
          error={fieldError("correct_text")}
          defaultValue={answerKey?.correct_text}
        />

        <TextAreaField
          id={idFor("explanation")}
          name="explanation"
          label="Explanation"
          rows={4}
          hint="Why this option is right. Staff use it when a student asks about a wrong answer. Never shown to a student in this ticket."
          error={fieldError("explanation")}
          defaultValue={answerKey?.explanation}
        />

        <div className="flex flex-wrap items-center gap-3">
          <AppButton
            type="submit"
            size="sm"
            isLoading={pending}
            loadingText="Saving..."
          >
            {hasKey ? "Save answer key" : "Set answer key"}
          </AppButton>
        </div>
      </form>

      {hasKey ? (
        <div className="border-t border-academy-line pt-5">
          <AdminDeleteForm
            action={deleteAction}
            fields={{
              mock_test_id: mockTestId,
              section_id: sectionId,
              part_id: partId,
              question_id: questionId,
            }}
            label="Remove answer key"
            warning="The question stays and is reported as unmarkable until a key is set again."
          />
        </div>
      ) : null}
    </div>
  );
}

function truncate(value: string, max: number): string {
  return value.length <= max ? value : `${value.slice(0, max - 3)}...`;
}
