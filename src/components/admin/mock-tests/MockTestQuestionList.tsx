import Link from "next/link";
import { AppStatusBadge } from "@/components/app/AppStatusBadge";
import { cx, text } from "@/features/design/design-tokens";
import {
  QUESTION_STATUS_TONES,
  describeQuestion,
  questionBodyText,
  type MockTestQuestionWithContent,
} from "@/features/admin/mock-test-content-types";
import { BUILD_STATUS_LABELS } from "@/features/admin/mock-test-types";

// The questions inside one part, as a list of links.
//
// A server component with no forms in it, unlike the ADMIN-01 part list.
// A question is edited on its own route rather than in a disclosure,
// because editing one means three editors at once: the question fields,
// its options and its answer key. That does not fit in a summary row,
// and the answer key in particular belongs on a screen of its own so it
// is obvious which question it answers.
//
// Nothing here renders a correct answer. Whether a key exists is shown,
// because a question with no key is the thing a staff member is looking
// for; what the key says is shown on the question screen and the part
// preview, both of which are admin only.

export type MockTestQuestionListProps = {
  questions: MockTestQuestionWithContent[];
  // The part detail URL. Each question links to a child of it.
  partHref: string;
  addQuestionHref: string;
};

export function MockTestQuestionList({
  questions,
  partHref,
  addQuestionHref,
}: MockTestQuestionListProps) {
  if (questions.length === 0) {
    return (
      <p className={cx("text-sm leading-6", text.secondary)}>
        No questions in this part yet.{" "}
        <Link
          href={addQuestionHref}
          className={cx(
            "font-semibold underline underline-offset-2 hover:no-underline",
            text.accent,
          )}
        >
          Add the first question
        </Link>
        .
      </p>
    );
  }

  return (
    <ol className="space-y-3">
      {questions.map((question) => (
        <li
          key={question.id}
          className="rounded-2xl border border-academy-line bg-white"
        >
          <Link
            href={`${partHref}/questions/${question.id}`}
            className="block rounded-2xl px-4 py-4 transition hover:bg-academy-navy-soft/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-academy-blue"
          >
            <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
              <span
                className={cx(
                  "inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-academy-navy/5 text-xs font-semibold tabular-nums",
                  text.secondary,
                )}
              >
                {question.question_number}
              </span>

              <span className="min-w-0 flex-1 truncate font-semibold text-academy-navy">
                {questionBodyText(question) || "No prompt or stem yet"}
              </span>

              <AppStatusBadge tone={QUESTION_STATUS_TONES[question.status]}>
                {BUILD_STATUS_LABELS[question.status]}
              </AppStatusBadge>
            </div>

            <p className={cx("mt-2 text-xs", text.muted)}>
              {describeQuestion(question)}
            </p>
          </Link>
        </li>
      ))}
    </ol>
  );
}
