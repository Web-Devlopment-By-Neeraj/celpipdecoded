import Link from "next/link";
import { cx, focus, text } from "@/features/design/design-tokens";
import {
  mockResultsHref,
  mockSectionHref,
  sectionLabel,
  type MockRunView,
} from "@/features/mock-tests/mock-run";

export function MockAttemptNote({
  runs,
  slug,
}: {
  runs: MockRunView[];
  slug: string;
}) {
  const mine = runs.filter((run) => run.slug === slug);
  const open = mine.find((run) => run.status === "in_progress");
  const done = mine.find((run) => run.status === "submitted");

  if (!open && !done) return null;

  return (
    <p className={cx("mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm", text.secondary)}>
      {open ? (
        <Link
          href={mockSectionHref(slug, open.section, open.mode)}
          className={cx("font-semibold text-academy-navy underline-offset-2 hover:underline", focus.ring)}
        >
          Resume {sectionLabel(open.section)}
        </Link>
      ) : null}
      {done ? (
        <Link
          href={mockResultsHref(slug)}
          className={cx("font-semibold text-academy-navy underline-offset-2 hover:underline", focus.ring)}
        >
          See results
          {done.summary ? ` · ${done.summary.detail}` : ""}
        </Link>
      ) : null}
    </p>
  );
}
