import Link from "next/link";
import { chooseNextStep, formatFreeEvaluations } from "@/features/public-site/next-step";
import { buildMockLibrary, evaluationsNeeded, markingSplit } from "@/features/public-site/mocks";
import { courseLessons, miniCourseLibrary, SKILL_TAGS } from "@/features/public-site/courses";
import { buildStudyPlan } from "@/features/public-site/study-plan";
import { PRODUCTS } from "@/features/public-site/seed";
import { DEFAULT_SETTINGS } from "@/features/public-site/settings";
import { MARKETING_CONSENT, WHATSAPP_LINE } from "@/features/public-site/account";
import { IMMIGRATION_NOTICE, replyPromise } from "@/features/public-site/ask";
import { areaUnlocked } from "@/features/public-site/access";
import { BookingBoard } from "@/components/site/BookingBoard";
import { LanguageSwitch } from "@/components/site/LanguageSwitch";

const TODAY = "2026-09-29";

export function StudentHome({
  email,
  freeRemaining,
  freeUsed,
}: {
  email: string | null;
  freeRemaining: number;
  freeUsed: number;
}) {
  const card = chooseNextStep({
    testDate: null,
    notBooked: true,
    target: null,
    worry: null,
    firstTimer: freeUsed === 0,
    speakingShortfalls: 0,
    today: TODAY,
  });
  return (
    <section className="space-y-4" aria-label="Your next step">
      <p className="text-sm">Signed in as {email ?? "your account"}</p>
      <h2 className="font-serif text-3xl">Test date not booked yet</h2>
      <p>{formatFreeEvaluations(freeRemaining, DEFAULT_SETTINGS.freeEvaluationLimit, 0)}</p>
      <p className="text-sm">Practice estimate labels apply to every level in the app.</p>
      <article className="rounded-3xl bg-white p-5 ring-1 ring-academy-line">
        <h3 className="font-semibold">Next step</h3>
        <p className="mt-2 text-base leading-7">{card.body}</p>
        <Link href={card.href} className="mt-3 inline-flex min-h-11 items-center text-sm font-semibold underline">{card.href}</Link>
      </article>
    </section>
  );
}

export function MockLibrary() {
  const mocks = buildMockLibrary(10);
  const viewer = { signedIn: true, verified: true, plans: ["free" as const] };
  return (
    <div className="space-y-4">
      <h1 className="font-serif text-3xl">Mock tests</h1>
      <p className="text-sm">Sit at least one mock in Test mode before test day. The real test has no replay and moves on by itself.</p>
      <ul className="space-y-3">
        {mocks.map((mock) => {
          const locked = !mock.isFree && !areaUnlocked(viewer, "mocks");
          const split = markingSplit(evaluationsNeeded("complete"), 3);
          return (
            <li key={mock.id} className="rounded-3xl bg-white p-4 ring-1 ring-academy-line">
              <h2 className="font-semibold">{locked ? "Locked. " : ""}{mock.title}</h2>
              <p className="text-sm">Practice estimate: L - R - W - S</p>
              <p className="text-sm">Listening 38, Reading 38, Writing 2, Speaking 8.</p>
              {locked ? (
                <p className="mt-2 text-sm">Unlocks with Test Sprint or Decoded Course. Preview only: section list and timings, no answer key.</p>
              ) : (
                <p className="mt-2 text-sm">Complete test uses {evaluationsNeeded("complete")} evaluations. {split.now} can be marked now. {split.waiting} will wait.</p>
              )}
              <Link href={locked ? "/plans" : "/dashboard/mock-tests/mock-test-1/listening"} className="mt-3 inline-flex min-h-11 items-center text-sm font-semibold underline">
                {locked ? "See plans" : "Start Mock test 1"}
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export function CoursesArea() {
  const lessons = courseLessons();
  return (
    <div>
      <h1 className="font-serif text-3xl">Courses</h1>
      <div className="mt-4"><LanguageSwitch /></div>
      <ul className="mt-6 space-y-3">
        {lessons.map((lesson) => (
          <li key={lesson.id} className="rounded-2xl bg-white p-4 ring-1 ring-academy-line">
            <p className="font-semibold">{lesson.titles.en}</p>
            <p className="text-sm">{lesson.isFree ? "Included after sign-up" : "Locked. Unlocks with Decoded Course. Preview stops at 2:00."}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function MiniCoursesArea() {
  const courses = miniCourseLibrary(["en", "hi"]);
  return (
    <div>
      <h1 className="font-serif text-3xl">Mini-courses</h1>
      <p className="mt-2 text-sm">{SKILL_TAGS.length} skills, English and Hindi.</p>
      <ul className="mt-4 space-y-2">
        {courses.filter((course) => course.lang === "en").map((course) => (
          <li key={course.id}>
            <Link className="underline" href={`/dashboard/mini-courses/${course.id}`}>{course.title}</Link>
            {course.isFree ? " · Free" : " · Locked preview"}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function AskAmar() {
  return (
    <form className="space-y-4" action="/api/ask" method="post">
      <h1 className="font-serif text-3xl">Ask Amar</h1>
      <p>{replyPromise(DEFAULT_SETTINGS.askAmarReplyHours)}</p>
      <fieldset className="space-y-2">
        <legend className="text-sm font-semibold">Category</legend>
        <label className="flex min-h-11 items-center gap-2"><input type="radio" name="category" value="celpip" defaultChecked /> CELPIP preparation</label>
        <label className="flex min-h-11 items-center gap-2"><input type="radio" name="category" value="immigration" /> An immigration question</label>
        <label className="flex min-h-11 items-center gap-2"><input type="radio" name="category" value="account" /> Account and payment</label>
      </fieldset>
      <textarea name="body" required minLength={10} className="min-h-32 w-full rounded-2xl border border-academy-line p-3 text-base" aria-label="Your question" />
      <input name="file" type="file" accept=".pdf,.docx,.txt,.jpg,.jpeg,.png" className="block w-full text-base" />
      <p className="text-sm">{IMMIGRATION_NOTICE}</p>
      <button className="min-h-11 rounded-full bg-academy-navy px-4 text-sm font-semibold text-white" type="submit">Send</button>
    </form>
  );
}

export function PerformanceArea() {
  const plan = buildStudyPlan(
    { testDate: null, today: TODAY, weakest: "Speaking", dailyEvaluationLimit: 10, hasCourse: false },
    { defaultWeeks: 4, finalDays: 7, fullMockUntilDays: 14 },
  );
  return (
    <div className="space-y-6">
      <h1 className="font-serif text-3xl">Performance</h1>
      <p className="text-sm">Practice estimate (CLB level)</p>
      <table className="w-full text-left text-sm">
        <caption className="text-left">View as table</caption>
        <thead><tr><th>Date</th><th>Module</th><th>Practice estimate</th></tr></thead>
        <tbody>
          <tr><td colSpan={3}>Sit a mock or submit a practice answer to see your progress here.</td></tr>
        </tbody>
      </table>
      <h2 className="font-serif text-2xl">Study plan</h2>
      <ul className="space-y-2 text-sm">
        {plan.map((item) => <li key={item.id}>Week {item.week}: {item.label}</li>)}
      </ul>
      <p className="text-sm">This is a suggested plan, not a prediction of any result.</p>
    </div>
  );
}

export function TemplatesArea() {
  return (
    <div>
      <h1 className="font-serif text-3xl">Templates</h1>
      <article className="mt-4 rounded-3xl bg-white p-4 ring-1 ring-academy-line">
        <h2 className="font-semibold">Writing Task 1, Level A</h2>
        <p className="mt-2 text-sm">Preview: open with the reason, then the request, then one detail.</p>
        <p className="mt-2 text-sm">Unlocks with Test Sprint ({PRODUCTS[1] ? `$${PRODUCTS[1].priceCents / 100}` : ""}).</p>
      </article>
    </div>
  );
}

export function SettingsArea() {
  return (
    <div className="space-y-8">
      <h1 className="font-serif text-3xl">Account settings</h1>
      <section id="profile">
        <h2 className="font-semibold">Profile</h2>
        <label className="mt-2 block text-sm">Name<input className="mt-1 min-h-11 w-full rounded-xl border px-3 text-base" name="name" /></label>
        <label className="mt-2 block text-sm">New email<input className="mt-1 min-h-11 w-full rounded-xl border px-3 text-base" name="email" /></label>
        <p className="mt-1 text-sm">The address changes only after the 6-digit code sent to the new email is verified.</p>
      </section>
      <section>
        <h2 className="font-semibold">WhatsApp</h2>
        <p className="text-sm leading-6">{WHATSAPP_LINE}</p>
        <label className="mt-2 flex gap-2 text-sm"><input type="checkbox" /> {MARKETING_CONSENT}</label>
      </section>
      <section>
        <h2 className="font-semibold">Plan</h2>
        <p className="text-sm">Free. Test Sprint can be cancelled in two clicks: Cancel Test Sprint, then Confirm. You keep access until the paid period ends.</p>
      </section>
      <section>
        <h2 className="font-semibold">Course language</h2>
        <LanguageSwitch />
      </section>
      <section>
        <h2 className="font-semibold">Emails</h2>
        <label className="flex min-h-11 items-center gap-2 text-sm"><input type="checkbox" defaultChecked /> Follow-up emails</label>
        <label className="flex min-h-11 items-center gap-2 text-sm"><input type="checkbox" defaultChecked /> Promotional emails and broadcasts</label>
        <p className="text-sm">Verification codes, receipts, and evaluation-ready emails are always sent.</p>
      </section>
      <section>
        <h2 className="font-semibold">Recordings</h2>
        <p className="text-sm">Recordings are kept for 90 days on paid plans and 14 days on free accounts, then deleted automatically. Transcripts, practice estimates and feedback stay for the life of your account.</p>
      </section>
      <section id="results">
        <h2 className="font-semibold">Your data</h2>
        <a className="underline" href="/api/account/export">Download my data</a>
        <p className="mt-2 text-sm">Delete my account asks for a code and the word DELETE. Payment records needed for tax stay, with personal fields removed.</p>
      </section>
    </div>
  );
}

export function PracticeArea() {
  return (
    <div>
      <h1 className="font-serif text-3xl">Practice</h1>
      <p className="mt-2 text-base leading-7">
        Writing answers use one box, with a live word count and a red underline for spelling. Nothing is corrected automatically.
      </p>
      <p className="mt-4"><Link className="underline" href="/dashboard/writing">Open writing practice</Link></p>
      <p className="mt-2"><Link className="underline" href="/dashboard/speaking">Open speaking practice</Link></p>
    </div>
  );
}

export function LiveArea() {
  return (
    <div>
      <h1 className="font-serif text-3xl">Live classes</h1>
      <BookingBoard signedIn />
    </div>
  );
}
