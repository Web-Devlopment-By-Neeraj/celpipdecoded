"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { SAY_HI_BODY, formatDuration, LESSON_GROUPS } from "@/features/courses/format";
import {
  buttonBase,
  buttonSizes,
  buttonVariants,
  cardStyles,
  cx,
  focus,
  progress,
  text,
} from "@/features/design/design-tokens";
import { CourseVideoPlayer } from "./CourseVideoPlayer";
import { CourseWatermark } from "./CourseWatermark";

export type LessonComment = {
  id: string;
  authorLabel: string;
  body: string;
  createdAt: string;
  mine: boolean;
};

export type ScreenLesson = {
  id: string;
  title: string;
  description: string;
  group: string;
  durationSec: number | null;
  positionSeconds: number;
  completed: boolean;
};

export type CourseLessonScreenProps = {
  brand: string;
  email: string | null;
  userId: string;
  course: { slug: string; title: string };
  lessons: ScreenLesson[];
  lessonId: string;
  playback: { src: string | null; maxSeconds: number | null; unavailable: string | null };
  completeRatio: number;
  comments: LessonComment[];
  commentsError: string | null;
};

export function CourseLessonScreen(props: CourseLessonScreenProps) {
  const currentIndex = Math.max(
    0,
    props.lessons.findIndex((lesson) => lesson.id === props.lessonId),
  );
  const current = props.lessons[currentIndex] ?? props.lessons[0];
  const next = props.lessons[currentIndex + 1] ?? null;

  const [completedMap, setCompletedMap] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(props.lessons.map((lesson) => [lesson.id, lesson.completed])),
  );
  const [comments, setComments] = useState(props.comments);
  const [commentBody, setCommentBody] = useState("");
  const [commentError, setCommentError] = useState<string | null>(props.commentsError);
  const [posting, setPosting] = useState(false);

  const completedCount = Object.values(completedMap).filter(Boolean).length;
  const total = props.lessons.length;
  const ratio = total > 0 ? Math.round((completedCount / total) * 100) : 0;
  const currentDone = current ? completedMap[current.id] === true : false;

  const groups = useMemo(() => {
    const present = new Set(props.lessons.map((lesson) => lesson.group));
    const ordered = LESSON_GROUPS.filter((group) => present.has(group));
    const showHeaders = ordered.length > 1 || (ordered.length === 1 && ordered[0] !== "Lessons");
    return { ordered, showHeaders };
  }, [props.lessons]);

  if (!current) {
    return (
      <p className={text.secondary}>This course does not have a lesson yet.</p>
    );
  }

  async function saveCompleted(completed: boolean) {
    setCompletedMap((map) => ({ ...map, [current.id]: completed }));
    await fetch("/api/courses/progress", {
      method: "POST",
      credentials: "same-origin",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        courseSlug: props.course.slug,
        lessonId: current.id,
        positionSeconds: current.positionSeconds,
        completed,
        clearCompletion: !completed,
      }),
    }).catch(() => undefined);
  }

  async function postComment(body: string) {
    const trimmed = body.trim();
    if (!trimmed) {
      setCommentError("Write a comment first.");
      return;
    }
    setPosting(true);
    setCommentError(null);
    try {
      const response = await fetch("/api/courses/comments", {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courseSlug: props.course.slug,
          lessonId: current.id,
          body: trimmed,
        }),
      });
      const payload = (await response.json()) as {
        ok?: boolean;
        error?: string;
        comment?: LessonComment;
      };
      if (!response.ok || !payload.comment) {
        setCommentError(payload.error ?? "Comment could not be posted.");
        return;
      }
      setComments((items) => [...items, payload.comment as LessonComment]);
      setCommentBody("");
    } catch {
      setCommentError("Comment could not be posted.");
    } finally {
      setPosting(false);
    }
  }

  async function removeComment(commentId: string) {
    const previous = comments;
    setComments((items) => items.filter((item) => item.id !== commentId));
    const response = await fetch("/api/courses/comments", {
      method: "DELETE",
      credentials: "same-origin",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        courseSlug: props.course.slug,
        lessonId: current.id,
        commentId,
      }),
    }).catch(() => null);
    if (!response || !response.ok) {
      setComments(previous);
      setCommentError("Comment could not be removed.");
    }
  }

  return (
    <div className="relative">
      <div className="pointer-events-none fixed inset-0 z-30 overflow-hidden">
        <CourseWatermark
          email={props.email}
          brand={props.brand}
          tone="page"
          className="absolute inset-0"
        />
      </div>

      <div className="relative z-10 grid items-start gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
        <aside className="order-2 lg:sticky lg:top-24 lg:order-1 lg:max-h-[calc(100vh-7rem)] lg:overflow-y-auto">
          <Link
            href="/dashboard/courses"
            className={cx(
              "inline-flex items-center gap-1.5 text-sm font-semibold",
              text.secondary,
              "hover:text-academy-navy",
              focus.ring,
              "rounded-full",
            )}
          >
            <span aria-hidden>←</span> All courses
          </Link>

          <div className={cx(cardStyles.default, "mt-3 p-3 sm:p-4")}>
            <h2 className={cx(text.heading, "px-2 text-base")}>{props.course.title}</h2>
            <p className={cx("mt-2 px-2 text-xs font-medium", text.muted)}>
              {completedCount}/{total} complete ({ratio}%)
            </p>
            <div className={cx(progress.track, "mx-2 mt-2 h-1.5")}>
              <div className={progress.fill} style={{ width: `${ratio}%` }} />
            </div>

            <nav aria-label="Lessons" className="mt-3 space-y-3">
              {groups.ordered.map((group) => (
                <div key={group}>
                  {groups.showHeaders ? (
                    <p className={cx("px-2 pb-1 text-[11px] font-semibold uppercase tracking-[0.16em]", text.muted)}>
                      {group}
                    </p>
                  ) : null}
                  <ul className="space-y-1">
                    {props.lessons
                      .filter((lesson) => lesson.group === group)
                      .map((lesson) => {
                        const active = lesson.id === current.id;
                        const done = completedMap[lesson.id] === true;
                        const length = formatDuration(lesson.durationSec);
                        return (
                          <li key={lesson.id}>
                            <Link
                              href={`/dashboard/courses/${props.course.slug}/${lesson.id}`}
                              aria-current={active ? "page" : undefined}
                              className={cx(
                                "flex items-start gap-2.5 rounded-xl px-2.5 py-2 text-sm transition-colors",
                                focus.ring,
                                active
                                  ? "bg-academy-blue-soft font-semibold text-academy-navy"
                                  : "text-academy-navy/80 hover:bg-academy-navy-soft/70",
                              )}
                            >
                              <StatusMark done={done} active={active} />
                              <span className="min-w-0">
                                <span className="block leading-5">{lesson.title}</span>
                                {length ? (
                                  <span className={cx("mt-0.5 block text-[11px] font-medium", text.muted)}>
                                    {length}
                                  </span>
                                ) : null}
                              </span>
                            </Link>
                          </li>
                        );
                      })}
                  </ul>
                </div>
              ))}
            </nav>
          </div>
        </aside>

        <section className="order-1 min-w-0 lg:order-2">
          <p className={cx("text-xs font-semibold uppercase tracking-[0.16em]", text.muted)}>
            Section {currentIndex + 1} of {total}
          </p>
          <h1 className={cx(text.heading, "mt-2 text-2xl sm:text-3xl")}>{current.title}</h1>

          <div className="mt-4">
            <CourseVideoPlayer
              key={current.id}
              title={current.title}
              src={props.playback.src}
              unavailable={props.playback.unavailable}
              maxSeconds={props.playback.maxSeconds}
              initialPosition={current.positionSeconds}
              initialDuration={current.durationSec}
              initialCompleted={currentDone}
              completeRatio={props.completeRatio}
              courseSlug={props.course.slug}
              lessonId={current.id}
              userId={props.userId}
              email={props.email}
              brand={props.brand}
              onCompletedChange={(completed) => {
                setCompletedMap((map) => ({ ...map, [current.id]: completed }));
              }}
            />
          </div>

          <p className={cx("mt-4 max-w-3xl text-sm leading-6", text.secondary)}>{current.description}</p>

          <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => void saveCompleted(!currentDone)}
              className={cx(
                buttonBase,
                currentDone ? buttonVariants.secondary : buttonVariants.primary,
                buttonSizes.md,
              )}
            >
              <CheckIcon />
              {currentDone ? "Completed" : "Mark as complete"}
            </button>
            {next ? (
              <Link
                href={`/dashboard/courses/${props.course.slug}/${next.id}`}
                className={cx(buttonBase, buttonVariants.secondary, buttonSizes.md)}
              >
                Next
                <span aria-hidden>→</span>
              </Link>
            ) : (
              <Link
                href="/dashboard/courses"
                className={cx(buttonBase, buttonVariants.secondary, buttonSizes.md)}
              >
                Back to courses
              </Link>
            )}
          </div>

          <section id="lesson-comments" className={cx(cardStyles.default, "mt-8 p-5 sm:p-6")}>
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <h2 className={cx(text.heading, "text-lg")}>Comments</h2>
                <p className={cx("mt-1 text-sm", text.secondary)}>
                  A note for the other learners on this lesson.
                </p>
              </div>
              <button
                type="button"
                disabled={posting}
                onClick={() => void postComment(SAY_HI_BODY)}
                className={cx(buttonBase, buttonVariants.secondary, buttonSizes.sm)}
              >
                <WaveIcon />
                Say hi
              </button>
            </div>

            <ul className="mt-5 space-y-4">
              {comments.length === 0 ? (
                <li className={cx("text-sm", text.muted)}>Be the first to comment on this lesson.</li>
              ) : (
                comments.map((comment) => (
                  <li key={comment.id} className="flex gap-3">
                    <span className="grid size-9 shrink-0 place-items-center rounded-full bg-academy-navy-soft text-xs font-bold text-academy-navy">
                      {comment.authorLabel.slice(0, 1).toUpperCase()}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm">
                        <span className="font-semibold text-academy-navy">{comment.authorLabel}</span>
                        <time
                          dateTime={comment.createdAt}
                          className={cx("ml-2 text-xs font-medium", text.muted)}
                        >
                          {formatCommentTime(comment.createdAt)}
                        </time>
                      </p>
                      <p className={cx("mt-1 text-sm leading-6", text.secondary)}>{comment.body}</p>
                      {comment.mine ? (
                        <button
                          type="button"
                          onClick={() => void removeComment(comment.id)}
                          className={cx("mt-1 text-xs font-semibold", text.muted, "hover:text-academy-red", focus.ring, "rounded")}
                        >
                          Remove
                        </button>
                      ) : null}
                    </div>
                  </li>
                ))
              )}
            </ul>

            <form
              className="mt-5"
              onSubmit={(event) => {
                event.preventDefault();
                void postComment(commentBody);
              }}
            >
              <label htmlFor="lesson-comment" className="sr-only">
                Comment
              </label>
              <textarea
                id="lesson-comment"
                value={commentBody}
                maxLength={500}
                rows={3}
                onChange={(event) => setCommentBody(event.target.value)}
                placeholder="Comment on this lesson"
                className={cx(
                  "w-full resize-y rounded-2xl bg-academy-paper px-4 py-3 text-sm text-academy-navy ring-1 ring-academy-navy/15 outline-none placeholder:text-academy-navy/40",
                  focus.ring,
                )}
              />
              <div className="mt-3 flex items-center justify-between gap-3">
                <p className={cx("text-xs", commentError ? "text-academy-red" : text.muted)} role={commentError ? "alert" : undefined}>
                  {commentError ?? `${commentBody.length}/500`}
                </p>
                <button
                  type="submit"
                  disabled={posting}
                  className={cx(buttonBase, buttonVariants.primary, buttonSizes.sm)}
                >
                  {posting ? "Posting" : "Comment"}
                </button>
              </div>
            </form>
          </section>
        </section>
      </div>
    </div>
  );
}

function formatCommentTime(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function StatusMark({ done, active }: { done: boolean; active: boolean }) {
  return (
    <span
      className={cx(
        "mt-0.5 grid size-4 shrink-0 place-items-center rounded-full border",
        done
          ? "border-brand bg-brand text-white"
          : active
            ? "border-academy-blue"
            : "border-academy-navy/30",
      )}
      aria-hidden
    >
      {done ? (
        <svg viewBox="0 0 12 12" className="size-2.5">
          <path
            d="M2.2 6.2 4.6 8.6 9.8 3.4"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ) : null}
    </span>
  );
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 16 16" className="size-4" aria-hidden>
      <circle cx="8" cy="8" r="6.2" fill="none" stroke="currentColor" strokeWidth="1.4" />
      <path
        d="M5 8.1 7 10.1 11.2 5.8"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function WaveIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-4" aria-hidden>
      <path
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        d="M8 13.5c.4 2 1.8 3.5 4 3.5 2.6 0 4-2 4-4.2V8.2M8 13.5 6.2 8.8c-.3-.8.2-1.6 1-1.6.5 0 .9.3 1.1.8L9.2 10M12 8.2V6.4c0-.8.7-1.4 1.4-1.4s1.4.6 1.4 1.4v1.8M15.2 8.2V5.8c0-.8.7-1.4 1.4-1.4S18 5 18 5.8v5.2"
      />
    </svg>
  );
}
