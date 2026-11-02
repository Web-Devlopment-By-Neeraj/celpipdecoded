"use client";

import { useActionState } from "react";
import { AppButton } from "@/components/app/AppButton";
import { AppCard } from "@/components/app/AppCard";
import { cx, text } from "@/features/design/design-tokens";
import { importMockTestFile } from "@/app/dashboard/admin/mock-tests/import-actions";
import { idleMockImportState } from "@/features/mock-tests/mock-import-format";

// Title, slug and the filled-in template. The checklist is the result of
// the upload. A file with an error is not saved.
export function MockTestUploadForm() {
  const [state, action, pending] = useActionState(
    importMockTestFile,
    idleMockImportState,
  );

  return (
    <AppCard as="section" ariaLabel="Upload a practice test">
      <h2 className={cx(text.heading, "text-base")}>Upload a practice test</h2>
      <p className={cx("mt-2 max-w-2xl text-sm leading-6", text.secondary)}>
        Download the template, fill in the content, and upload the file.
        Example rows are ignored. A problem such as a missing correct
        answer is listed below and nothing is saved. A clean file becomes
        a draft. Press Publish after you have looked at it.
      </p>
      <p className="mt-3">
        <a
          href="/dashboard/admin/mock-tests/template"
          className={cx("text-sm font-semibold underline underline-offset-2", text.accent)}
        >
          Download the template
        </a>
      </p>

      <form action={action} className="mt-5 space-y-4">
        <Field
          id="mock-title"
          name="title"
          label="Title"
          placeholder="Mock Test 2"
        />
        <Field
          id="mock-slug"
          name="slug"
          label="Slug"
          placeholder="mock-test-2"
          hint="mock-test-2 or later. mock-test-1 stays the built-in free test."
        />
        <div>
          <label htmlFor="mock-file" className="block text-sm font-medium text-academy-navy">
            Content file
          </label>
          <input
            id="mock-file"
            name="file"
            type="file"
            accept=".csv,text/csv"
            required
            className="mt-1.5 block w-full text-sm text-academy-navy"
          />
        </div>
        <AppButton type="submit" size="sm" isLoading={pending} loadingText="Checking the file">
          Upload
        </AppButton>
      </form>

      {state.message ? (
        <p
          role="status"
          className={cx(
            "mt-4 text-sm leading-6",
            state.status === "saved" ? "text-emerald-800" : text.danger,
          )}
        >
          {state.message}
        </p>
      ) : null}

      {state.issues.length > 0 ? (
        <ul className="mt-3 space-y-2">
          {state.issues.map((issue) => (
            <li
              key={`${issue.severity}-${issue.message}`}
              className={cx(
                "text-sm leading-6",
                issue.severity === "error" ? text.danger : "text-amber-800",
              )}
            >
              {issue.severity === "warning" ? "Warning: " : ""}
              {issue.message}
            </li>
          ))}
        </ul>
      ) : null}
    </AppCard>
  );
}

function Field({
  id,
  name,
  label,
  placeholder,
  hint,
}: {
  id: string;
  name: string;
  label: string;
  placeholder: string;
  hint?: string;
}) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-academy-navy">
        {label}
      </label>
      <input
        id={id}
        name={name}
        type="text"
        required
        placeholder={placeholder}
        className="mt-1.5 w-full max-w-md rounded-lg border border-academy-line bg-white px-3 py-2 text-sm text-academy-navy"
      />
      {hint ? <p className={cx("mt-1.5 text-xs leading-5", text.muted)}>{hint}</p> : null}
    </div>
  );
}
