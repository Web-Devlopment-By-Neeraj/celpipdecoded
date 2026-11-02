"use client";

import { useActionState } from "react";
import { AppButton } from "@/components/app/AppButton";
import { cx, text } from "@/features/design/design-tokens";
import { setImportedMockStatus } from "@/app/dashboard/admin/mock-tests/import-actions";
import { idleMockPublishState } from "@/features/mock-tests/mock-import-format";
import type { MockTestStatus } from "@/features/admin/mock-test-types";

export function MockTestPublishButton({
  id,
  status,
}: {
  id: string;
  status: MockTestStatus;
}) {
  const [state, action, pending] = useActionState(
    setImportedMockStatus,
    idleMockPublishState,
  );
  const published = status === "published";

  return (
    <form action={action} className="space-y-2">
      <input type="hidden" name="mock_test_id" value={id} />
      <input type="hidden" name="intent" value={published ? "unpublish" : "publish"} />
      <AppButton
        type="submit"
        size="sm"
        variant={published ? "secondary" : "primary"}
        isLoading={pending}
        loadingText={published ? "Unpublishing" : "Publishing"}
      >
        {published ? "Unpublish" : "Publish"}
      </AppButton>
      {state.message ? (
        <p
          role="status"
          className={cx(
            "max-w-xs text-xs leading-5",
            state.tone === "error" ? text.danger : "text-emerald-800",
          )}
        >
          {state.message}
        </p>
      ) : null}
    </form>
  );
}
