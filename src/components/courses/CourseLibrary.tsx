import Link from "next/link";
import { PlanUpgradeButton } from "@/components/pricing/PlanUpgradeButton";
import {
  buttonBase,
  buttonSizes,
  buttonVariants,
  cardStyles,
  cx,
  focus,
  text,
} from "@/features/design/design-tokens";

export type CourseCardModel = {
  slug: string;
  title: string;
  summary: string;
  languageLabel: string;
  tier: "free" | "course";
  lessonCount: number;
  completedCount: number;
  href: string | null;
};

export function CourseLibrary({
  courses,
  unlocked,
  signedIn,
}: {
  courses: CourseCardModel[];
  unlocked: boolean;
  signedIn: boolean;
}) {
  const lockedCount = courses.filter((course) => course.tier === "course" && !unlocked).length;

  return (
    <div className="w-full">
      <header>
        <h1 className={cx(text.heading, "text-3xl sm:text-4xl")}>Courses</h1>
        <p className={cx("mt-3 max-w-2xl text-sm leading-6", text.secondary)}>
          Video lessons for the CELPIP skills. Your place is saved, and each lesson carries your email on screen.
        </p>
      </header>

      {lockedCount > 0 ? (
        <div className="mt-6 flex flex-col gap-4 rounded-2xl bg-academy-blue-soft px-4 py-4 ring-1 ring-academy-blue/20 sm:flex-row sm:items-center sm:justify-between sm:px-5">
          <div>
            <p className="text-sm font-semibold text-academy-navy">
              Some courses open with the Decoded Course
            </p>
            <p className={cx("mt-1 text-sm", text.secondary)}>
              {signedIn
                ? "You can still open every lesson and watch a short preview."
                : "Free accounts can watch a short preview. Sign in to pick up where you left off."}
            </p>
          </div>
          {signedIn ? (
            <PlanUpgradeButton
              productCode="course"
              label="Unlock the course"
              withTopMargin={false}
              className={cx(buttonBase, buttonVariants.primary, buttonSizes.sm)}
            />
          ) : (
            <Link
              href="/login?next=/dashboard/courses"
              className={cx(buttonBase, buttonVariants.primary, buttonSizes.sm)}
            >
              Sign in
            </Link>
          )}
        </div>
      ) : (
        <p className={cx("mt-6 text-sm", text.secondary)}>
          Your course is open. Pick a lesson and your place is saved.
        </p>
      )}

      {courses.length === 0 ? (
        <p className={cx(cardStyles.default, "mt-6 px-5 py-8 text-sm", text.secondary)}>
          No courses are published yet.
        </p>
      ) : (
        <ul className="mt-6 grid gap-4 sm:grid-cols-2">
          {courses.map((course) => (
            <li key={course.slug}>
              <CourseCard course={course} unlocked={unlocked} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function CourseCard({
  course,
  unlocked,
}: {
  course: CourseCardModel;
  unlocked: boolean;
}) {
  const locked = course.tier === "course" && !unlocked;
  const percent =
    course.lessonCount > 0 ? Math.round((course.completedCount / course.lessonCount) * 100) : 0;
  const body = (
    <>
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-academy-blue-soft text-academy-blue">
            <BookIcon />
          </span>
          <span className="min-w-0">
            <span className="flex flex-wrap items-center gap-2">
              <span className={cx(text.heading, "text-base")}>{course.title}</span>
              {course.tier === "free" ? (
                <Badge tone="free">Free</Badge>
              ) : locked ? (
                <Badge tone="locked">Course</Badge>
              ) : (
                <Badge tone="free">Included</Badge>
              )}
            </span>
            <span className={cx("mt-1 block text-sm leading-6", text.secondary)}>{course.summary}</span>
          </span>
        </div>
        <span className="grid size-9 shrink-0 place-items-center rounded-full bg-academy-navy-soft text-academy-navy">
          {locked ? <LockIcon /> : <PlayMiniIcon />}
        </span>
      </div>
      <p className={cx("mt-4 text-xs font-semibold", text.muted)}>
        {course.languageLabel}
        <span className="mx-1.5">·</span>
        {course.lessonCount === 0
          ? "No lessons yet"
          : `${course.lessonCount} ${course.lessonCount === 1 ? "section" : "sections"}`}
        {course.completedCount > 0 ? ` · ${percent}% complete` : ""}
      </p>
    </>
  );

  if (!course.href) {
    return <article className={cx(cardStyles.default, "block h-full p-5")}>{body}</article>;
  }

  return (
    <Link
      href={course.href}
      className={cx(
        cardStyles.default,
        "block h-full p-5 transition hover:-translate-y-0.5 hover:ring-academy-blue/30",
        focus.ring,
      )}
    >
      {body}
    </Link>
  );
}

function Badge({ children, tone }: { children: string; tone: "free" | "locked" }) {
  return (
    <span
      className={cx(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide",
        tone === "free"
          ? "bg-academy-blue-soft text-academy-blue"
          : "bg-academy-navy-soft text-academy-navy",
      )}
    >
      {tone === "locked" ? <LockIcon small /> : null}
      {children}
    </span>
  );
}

function BookIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-5" aria-hidden>
      <path
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
        d="M6 4.5h9.5A2.5 2.5 0 0 1 18 7v12.5H8.5A2.5 2.5 0 0 0 6 22V4.5z"
      />
      <path fill="none" stroke="currentColor" strokeWidth="1.7" d="M6 19.5h12" />
    </svg>
  );
}

function PlayMiniIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-4" aria-hidden>
      <path fill="currentColor" d="M9 7.5v9l8-4.5-8-4.5z" />
    </svg>
  );
}

function LockIcon({ small = false }: { small?: boolean }) {
  return (
    <svg viewBox="0 0 24 24" className={small ? "size-3" : "size-4"} aria-hidden>
      <rect x="6" y="10" width="12" height="9" rx="2" fill="none" stroke="currentColor" strokeWidth="1.7" />
      <path d="M8.5 10V8a3.5 3.5 0 0 1 7 0v2" fill="none" stroke="currentColor" strokeWidth="1.7" />
    </svg>
  );
}
