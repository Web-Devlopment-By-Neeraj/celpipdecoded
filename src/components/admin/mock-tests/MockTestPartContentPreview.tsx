import { AppCard } from "@/components/app/AppCard";
import { AppStatusBadge } from "@/components/app/AppStatusBadge";
import { cx, text } from "@/features/design/design-tokens";
import {
  MEDIA_TYPE_LABELS,
  QUESTION_TYPE_LABELS,
  type MockTestMediaAssetRow,
  type MockTestPartContent,
  type MockTestQuestionWithContent,
} from "@/features/admin/mock-test-content-types";
import type { PartContentSummary } from "@/features/admin/mock-test-content-validation";
import type { MockTestPartContext } from "@/features/admin/mock-test-queries";
import {
  PART_TYPE_LABELS,
  SECTION_TYPE_LABELS,
} from "@/features/admin/mock-test-types";
import { MockTestContentValidationPanel } from "./MockTestContentValidationPanel";

// The admin preview of one authored part.
//
// ADMIN ONLY, and the correct answer is on screen precisely because of
// that. This is a proofreading tool: a staff member who has typed eleven
// Reading items needs to read the passage, the questions, the options
// and the key together, which is the only way to catch a key that points
// at the wrong option.
//
// This is deliberately NOT the learner preview. It does not render a
// single learner component and it is not a step towards one:
//
//   - No student route reaches it. Every route above it calls
//     getAdminSession first.
//   - The dynamic learner runner is a later ticket, and when it is built
//     it gets its own read that never fetches an answer key, rather than
//     a flag on the admin read. A flag is a thing somebody can pass
//     wrong; a separate query is not.
//   - The learner side today still runs the hardcoded Mock Test 1
//     content files, and ADMIN-02 changes none of them.
//
// Media is described rather than played. A preview that autoloaded six
// Cloudinary clips would be slow and would start downloads a
// proofreader did not ask for, so the URL is a link and the transcript
// is the thing on screen.

export type MockTestPartContentPreviewProps = {
  context: MockTestPartContext;
  content: MockTestPartContent;
  validation: PartContentSummary;
};

export function MockTestPartContentPreview({
  context,
  content,
  validation,
}: MockTestPartContentPreviewProps) {
  const { section, part } = context;
  const { questions, media } = content;

  return (
    <div className="space-y-8">
      <AppCard as="section" ariaLabel="Part summary">
        <p className={text.eyebrow}>
          {SECTION_TYPE_LABELS[section.section_type]} - part {part.part_order}
        </p>
        <h2 className={cx(text.heading, "mt-1.5 text-xl")}>{part.title}</h2>
        <p className={cx("mt-1 text-xs", text.muted)}>
          {part.part_type ? PART_TYPE_LABELS[part.part_type] : "No part type"}
          {" - "}
          {questions.length} question{questions.length === 1 ? "" : "s"}
          {" - "}
          {validation.totalPoints} point
          {validation.totalPoints === 1 ? "" : "s"}
        </p>

        {part.instructions ? (
          <div className="mt-5 rounded-2xl bg-academy-navy-soft/40 px-4 py-4">
            <p
              className={cx(
                "text-xs font-semibold uppercase tracking-wide",
                text.muted,
              )}
            >
              Instructions
            </p>
            <p
              className={cx(
                "mt-2 whitespace-pre-line text-sm leading-6",
                text.secondary,
              )}
            >
              {part.instructions}
            </p>
          </div>
        ) : null}

        <p className={cx("mt-5 text-xs leading-5", text.muted)}>
          Staff preview. Correct answers and explanations are shown here
          because this screen is admin only. No student route reads this
          content, and the practice tests students take are still the
          existing ones.
        </p>
      </AppCard>

      <MockTestContentValidationPanel
        summary={validation}
        title="Content checks"
      />

      {media.length > 0 ? (
        <section aria-label="Media" className="space-y-5">
          <h2 className={cx(text.heading, "text-lg")}>Media</h2>
          <ul className="space-y-4">
            {media.map((asset) => (
              <li key={asset.id}>
                <MediaPreview asset={asset} />
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section aria-label="Questions" className="space-y-5">
        <h2 className={cx(text.heading, "text-lg")}>Questions</h2>

        {questions.length === 0 ? (
          <AppCard variant="subtle">
            <p className={cx("text-sm leading-6", text.secondary)}>
              This part has no questions yet, so there is nothing to
              preview.
            </p>
          </AppCard>
        ) : (
          <ol className="space-y-5">
            {questions.map((question) => (
              <li key={question.id}>
                <QuestionPreview question={question} media={media} />
              </li>
            ))}
          </ol>
        )}
      </section>
    </div>
  );
}

// One media link, described rather than played.
function MediaPreview({ asset }: { asset: MockTestMediaAssetRow }) {
  const url = (asset.url ?? "").trim();

  return (
    <AppCard as="article" padding="compact">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
        <AppStatusBadge tone="info">
          {asset.media_type
            ? MEDIA_TYPE_LABELS[asset.media_type]
            : "No media type"}
        </AppStatusBadge>
        <span className="font-semibold text-academy-navy">
          {asset.title?.trim() || "Untitled media link"}
        </span>
      </div>

      {url.length > 0 ? (
        <p className="mt-2 break-all">
          <a
            href={url}
            target="_blank"
            rel="noreferrer"
            className={cx(
              "font-mono text-xs underline underline-offset-2 hover:no-underline",
              text.accent,
            )}
          >
            {url}
          </a>
        </p>
      ) : (
        <p className={cx("mt-2 text-sm", text.danger)}>
          No URL, so there is nothing to play or show.
        </p>
      )}

      {asset.alt_text ? (
        <p className={cx("mt-3 text-sm leading-6", text.secondary)}>
          <span className="font-semibold">Alt text:</span> {asset.alt_text}
        </p>
      ) : null}

      {asset.transcript ? (
        <details className="mt-3">
          <summary
            className={cx(
              "cursor-pointer text-sm font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-academy-blue",
              text.accent,
            )}
          >
            Transcript
          </summary>
          <p
            className={cx(
              "mt-2 whitespace-pre-line text-sm leading-6",
              text.secondary,
            )}
          >
            {asset.transcript}
          </p>
        </details>
      ) : null}
    </AppCard>
  );
}

// One question with its options, its correct answer and its explanation.
function QuestionPreview({
  question,
  media,
}: {
  question: MockTestQuestionWithContent;
  media: MockTestMediaAssetRow[];
}) {
  const key = question.answerKey;
  const attached = media.find((asset) => asset.id === question.media_asset_id);

  return (
    <AppCard as="article" padding="none">
      <div className="border-b border-academy-line px-6 py-5">
        <p className={text.eyebrow}>
          Question {question.question_number} -{" "}
          {QUESTION_TYPE_LABELS[question.question_type]}
        </p>

        {question.instruction ? (
          <p
            className={cx(
              "mt-3 whitespace-pre-line text-sm leading-6",
              text.secondary,
            )}
          >
            {question.instruction}
          </p>
        ) : null}

        {question.passage_text ? (
          <div className="mt-4 rounded-2xl bg-academy-navy-soft/40 px-4 py-4">
            <p
              className={cx(
                "whitespace-pre-line text-sm leading-6",
                text.secondary,
              )}
            >
              {question.passage_text}
            </p>
          </div>
        ) : null}

        {attached ? (
          <p className={cx("mt-4 text-xs", text.muted)}>
            Media:{" "}
            {attached.media_type
              ? MEDIA_TYPE_LABELS[attached.media_type]
              : "No media type"}
            {attached.title ? ` - ${attached.title}` : ""}
          </p>
        ) : null}

        <p className={cx("mt-4 text-base font-semibold", text.primary)}>
          {question.prompt?.trim() ||
            question.stem?.trim() ||
            "No prompt or stem yet."}
        </p>

        {question.prompt && question.stem ? (
          <p className={cx("mt-2 text-sm leading-6", text.secondary)}>
            {question.stem}
          </p>
        ) : null}

        {question.helper_text ? (
          <p className={cx("mt-2 text-xs leading-5", text.muted)}>
            {question.helper_text}
          </p>
        ) : null}
      </div>

      <div className="px-6 py-5">
        {question.options.length === 0 ? (
          <p className={cx("text-sm", text.muted)}>
            No options on this question.
          </p>
        ) : (
          <ul className="space-y-2">
            {question.options.map((option) => {
              const isCorrect = key?.correct_option_id === option.id;

              return (
                <li
                  key={option.id}
                  className={cx(
                    "flex flex-wrap items-start gap-x-3 gap-y-1 rounded-xl px-3 py-2 text-sm leading-6",
                    isCorrect
                      ? "bg-emerald-50 ring-1 ring-emerald-200"
                      : "bg-academy-navy/[0.03]",
                  )}
                >
                  <span className="font-semibold text-academy-navy">
                    {option.option_label}
                  </span>
                  <span className={cx("min-w-0 flex-1", text.secondary)}>
                    {option.option_text}
                  </span>
                  {isCorrect ? (
                    <AppStatusBadge tone="success">Correct</AppStatusBadge>
                  ) : null}
                </li>
              );
            })}
          </ul>
        )}

        <div className="mt-5 border-t border-academy-line pt-4">
          {key === null ? (
            <p className={cx("text-sm leading-6", text.danger)}>
              No answer key. This question cannot be marked.
            </p>
          ) : (
            <>
              <p className={cx("text-sm leading-6", text.secondary)}>
                <span className="font-semibold">Answer key:</span>{" "}
                {describeKeyAnswer(question)} - worth {key.points} point
                {key.points === 1 ? "" : "s"}
              </p>

              {key.explanation ? (
                <p className={cx("mt-2 text-sm leading-6", text.secondary)}>
                  <span className="font-semibold">Explanation:</span>{" "}
                  {key.explanation}
                </p>
              ) : (
                <p className={cx("mt-2 text-xs leading-5", text.muted)}>
                  No explanation recorded.
                </p>
              )}
            </>
          )}
        </div>
      </div>
    </AppCard>
  );
}

// What the key says the right answer is, in words. Handles the three
// states a key can be in: an option, typed text, or neither.
function describeKeyAnswer(question: MockTestQuestionWithContent): string {
  const key = question.answerKey;

  if (!key) {
    return "not set";
  }

  const option = question.options.find(
    (candidate) => candidate.id === key.correct_option_id,
  );

  if (option) {
    return `${option.option_label} - ${option.option_text}`;
  }

  if ((key.correct_text ?? "").trim().length > 0) {
    return `typed answer "${key.correct_text}"`;
  }

  return "no correct option selected";
}
