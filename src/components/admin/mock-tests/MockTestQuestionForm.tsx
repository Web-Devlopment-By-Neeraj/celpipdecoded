"use client";

import { useActionState, useState } from "react";
import { AppButton } from "@/components/app/AppButton";
import { AppButtonLink } from "@/components/app/AppButtonLink";
import { cx, text } from "@/features/design/design-tokens";
import { initialAdminActionState } from "@/features/admin/admin-action-state";
import {
  QUESTION_TYPES,
  QUESTION_TYPE_HINTS,
  QUESTION_TYPE_LABELS,
  SUGGESTED_QUESTION_TYPES,
  describeMediaAsset,
  type MockTestMediaAssetRow,
  type MockTestQuestionRow,
  type QuestionType,
} from "@/features/admin/mock-test-content-types";
import {
  BUILD_STATUSES,
  BUILD_STATUS_LABELS,
  type SectionType,
} from "@/features/admin/mock-test-types";
import {
  AdminFormMessage,
  SelectField,
  TextAreaField,
  TextField,
  type AdminFormAction,
} from "./AdminFormFields";

// Add or edit one question inside a part.
//
// The type select is ordered so the shapes that fit this skill come
// first, but every type stays selectable: a Listening part can carry a
// sentence completion item, and the database accepts any of the five
// under any part. The order is a suggestion, not a rule, which is why
// there is no server side refusal to match it.
//
// The form saves an unfinished question on purpose. Authoring is not
// linear, and a staff member entering eleven Reading items puts the
// numbers and the passage in first. What is missing is reported by the
// part content check rather than refused here.

export type MockTestQuestionFormProps = {
  mode: "create" | "edit";
  mockTestId: string;
  sectionId: string;
  partId: string;
  sectionType: SectionType;
  question?: MockTestQuestionRow;
  // The media links on this part, offered as an optional attachment.
  media: MockTestMediaAssetRow[];
  suggestedNumber?: number;
  suggestedOrder?: number;
  action: AdminFormAction;
  cancelHref?: string;
};

export function MockTestQuestionForm({
  mode,
  mockTestId,
  sectionId,
  partId,
  sectionType,
  question,
  media,
  suggestedNumber = 1,
  suggestedOrder = 1,
  action,
  cancelHref,
}: MockTestQuestionFormProps) {
  const isEdit = mode === "edit";

  const [state, formAction, pending] = useActionState(
    action,
    initialAdminActionState,
  );

  // Controlled because the hint under the field describes the type, and
  // because a completion item labels its wording box differently.
  const [questionType, setQuestionType] = useState<QuestionType>(
    question?.question_type ?? defaultTypeFor(sectionType),
  );

  const isCompletion = questionType === "dropdown_sentence_completion";
  const fieldError = (name: string) => state.fieldErrors[name];
  const idFor = (suffix: string) =>
    `question-${suffix}-${question?.id ?? "new"}`;

  return (
    <form action={formAction} className="space-y-6" noValidate>
      <input type="hidden" name="mock_test_id" value={mockTestId} />
      <input type="hidden" name="section_id" value={sectionId} />
      <input type="hidden" name="part_id" value={partId} />
      {isEdit && question ? (
        <input type="hidden" name="question_id" value={question.id} />
      ) : null}

      <AdminFormMessage state={state} />

      <SelectField
        id={idFor("type")}
        name="question_type"
        label="Question type"
        required
        options={orderedTypesFor(sectionType).map((type) => ({
          value: type,
          label: QUESTION_TYPE_LABELS[type],
        }))}
        value={questionType}
        onChange={(value) => setQuestionType(value as QuestionType)}
        hint={QUESTION_TYPE_HINTS[questionType]}
        error={fieldError("question_type")}
      />

      <div className="grid gap-6 sm:grid-cols-3">
        <TextField
          id={idFor("number")}
          name="question_number"
          label="Question number"
          type="number"
          min={1}
          max={500}
          required
          hint="The number a student sees."
          error={fieldError("question_number")}
          defaultValue={String(question?.question_number ?? suggestedNumber)}
        />

        <TextField
          id={idFor("order")}
          name="display_order"
          label="Display order"
          type="number"
          min={0}
          max={999}
          required
          hint="The order inside the part. Normally the same as the number."
          error={fieldError("display_order")}
          defaultValue={String(question?.display_order ?? suggestedOrder)}
        />

        <TextField
          id={idFor("points")}
          name="points"
          label="Points"
          type="number"
          min={0}
          max={100}
          required
          hint="What the question is worth. Normally 1."
          error={fieldError("points")}
          defaultValue={String(question?.points ?? 1)}
        />
      </div>

      <TextAreaField
        id={idFor("instruction")}
        name="instruction"
        label="Instruction"
        rows={2}
        hint="The line above the question, for example Choose the best answer."
        error={fieldError("instruction")}
        defaultValue={question?.instruction}
      />

      <TextAreaField
        id={idFor("passage")}
        name="passage_text"
        label="Passage text"
        rows={8}
        hint="The reading passage this question is about. Stored per question for now, so eleven questions on one passage repeat it. A shared passage arrives in a later ticket."
        error={fieldError("passage_text")}
        defaultValue={question?.passage_text}
      />

      <TextAreaField
        id={idFor("prompt")}
        name="prompt"
        label="Prompt"
        rows={3}
        hint={
          isCompletion
            ? "The whole question, if this item asks one. A completion item normally leaves this empty and uses the stem."
            : "The question itself, for example What does the man suggest?"
        }
        error={fieldError("prompt")}
        defaultValue={question?.prompt}
      />

      <TextAreaField
        id={idFor("stem")}
        name="stem"
        label="Stem"
        rows={3}
        hint={
          isCompletion
            ? "The sentence with the blank in it. This is the main wording for a completion item."
            : "The sentence a student completes, when the item works that way. A prompt or a stem is enough; a question needs one of the two."
        }
        error={fieldError("stem")}
        defaultValue={question?.stem}
      />

      <TextAreaField
        id={idFor("helper")}
        name="helper_text"
        label="Helper text"
        rows={2}
        hint="An optional note under the question, for example a hint about where to look in the passage."
        error={fieldError("helper_text")}
        defaultValue={question?.helper_text}
      />

      <div className="grid gap-6 sm:grid-cols-2">
        <SelectField
          id={idFor("media")}
          name="media_asset_id"
          label="Media link"
          options={media.map((asset) => ({
            value: asset.id,
            label: describeMediaAsset(asset),
          }))}
          emptyLabel={
            media.length === 0
              ? "No media links on this part"
              : "No media link"
          }
          defaultValue={question?.media_asset_id}
          hint="Optional. Only the media links already added to this part are offered."
          error={fieldError("media_asset_id")}
        />

        <SelectField
          id={idFor("status")}
          name="status"
          label="Question status"
          required
          options={BUILD_STATUSES.map((status) => ({
            value: status,
            label: BUILD_STATUS_LABELS[status],
          }))}
          defaultValue={question?.status ?? "draft"}
          hint="Ready means this question, its options and its answer key are settled. It does not make anything visible to a student."
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
          {isEdit ? "Save question" : "Add question"}
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

      {isEdit ? null : (
        <p className={cx("text-xs leading-5", text.muted)}>
          Options and the answer key are added on the question screen,
          which opens as soon as this question is saved.
        </p>
      )}
    </form>
  );
}

// The types that fit this skill first, then the rest, so every type is
// still reachable in a Listening part that happens to need one.
function orderedTypesFor(sectionType: SectionType): QuestionType[] {
  const suggested = SUGGESTED_QUESTION_TYPES[sectionType];
  const rest = QUESTION_TYPES.filter((type) => !suggested.includes(type));

  return [...suggested, ...rest];
}

function defaultTypeFor(sectionType: SectionType): QuestionType {
  return SUGGESTED_QUESTION_TYPES[sectionType][0] ?? "single_choice";
}
