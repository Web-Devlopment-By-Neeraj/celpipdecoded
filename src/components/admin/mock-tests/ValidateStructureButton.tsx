"use client";

import { useActionState } from "react";
import { AppButton } from "@/components/app/AppButton";
import { cx, text } from "@/features/design/design-tokens";
import {
  initialAdminActionState,
  type AdminActionState,
} from "@/features/admin/admin-action-state";

// Runs the structure check and stores the result.
//
// The preview screen recomputes the rules on every render, so this
// button is not what shows a staff member what is wrong. What it does is
// write the findings to mock_test_validation_issues, which is where the
// builder list reads its counts from. Separate on purpose: a page render
// should not write to the database.

export type ValidateStructureButtonProps = {
  mockTestId: string;
  action: (
    state: AdminActionState,
    formData: FormData,
  ) => Promise<AdminActionState>;
  label?: string;
};

export function ValidateStructureButton({
  mockTestId,
  action,
  label = "Run structure check",
}: ValidateStructureButtonProps) {
  const [state, formAction, pending] = useActionState(
    action,
    initialAdminActionState,
  );

  return (
    <form action={formAction} className="flex flex-wrap items-center gap-3">
      <input type="hidden" name="mock_test_id" value={mockTestId} />

      <AppButton
        type="submit"
        variant="secondary"
        size="sm"
        isLoading={pending}
        loadingText="Checking..."
      >
        {label}
      </AppButton>

      {state.status !== "idle" && state.message.length > 0 ? (
        <p
          role="status"
          className={cx(
            "text-xs leading-5",
            state.status === "error" ? text.danger : text.secondary,
          )}
        >
          {state.message}
        </p>
      ) : null}
    </form>
  );
}
