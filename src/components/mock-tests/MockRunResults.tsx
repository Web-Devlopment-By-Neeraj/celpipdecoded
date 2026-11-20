import Link from "next/link";
import { AppCard } from "@/components/app/AppCard";
import { AppSectionHeader } from "@/components/app/AppSectionHeader";
import { cx, focus, text } from "@/features/design/design-tokens";
import {
  mockSectionHref,
  sectionLabel,
  type MockRunView,
} from "@/features/mock-tests/mock-run";

export function MockRunResults({
  slug,
  title,
  runs,
}: {
  slug: string;
  title: string;
  runs: MockRunView[];
}) {
  const submitted = runs.filter(
    (run) => run.slug === slug && run.status === "submitted",
  );
  const open = runs.find(
    (run) => run.slug === slug && run.status === "in_progress",
  );

  return (
    <div className="w-full">
      <AppSectionHeader
        title={`${title} results`}
        description="Each finished section stays on your account. Open it again from here."
        action={
          <Link
            href={`/dashboard/mock-tests/${slug}`}
            className={cx(
              "text-sm font-semibold text-brand underline-offset-2 hover:underline",
              focus.ring,
            )}
          >
            Back to {title}
          </Link>
        }
      />

      {open ? (
        <p className={cx("mt-4 text-sm", text.secondary)}>
          <Link
            href={mockSectionHref(slug, open.section, open.mode)}
            className={cx("font-semibold text-academy-navy underline-offset-2 hover:underline", focus.ring)}
          >
            Resume {sectionLabel(open.section)}
          </Link>
        </p>
      ) : null}

      {submitted.length === 0 ? (
        <AppCard className="mt-6">
          <p className={text.secondary}>
            No finished section yet. Your answers are saved while you are in the test. The result appears here when a section is finished.
          </p>
        </AppCard>
      ) : (
        <div className="mt-6 space-y-4">
          {submitted.map((run) => (
            <AppCard key={run.id} as="article">
              <h2 className={cx(text.heading, "text-lg")}>
                {run.summary?.label ?? sectionLabel(run.section)}
              </h2>
              <p className={cx("mt-2 text-sm leading-6", text.secondary)}>
                {run.summary?.detail ?? "Finished"}
                {" · "}
                {run.mode === "full" ? "Full mock test" : "One section"}
                {" · "}
                {new Date(run.updatedAt).toLocaleDateString("en-CA", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </p>
            </AppCard>
          ))}
        </div>
      )}
    </div>
  );
}
