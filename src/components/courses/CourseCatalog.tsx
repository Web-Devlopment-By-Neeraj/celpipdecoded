import { PlanUpgradeButton } from "@/components/pricing/PlanUpgradeButton";
import { DEFAULT_LANGUAGES } from "@/features/platform/video";

export function CourseCatalog({ unlocked = false }: { unlocked?: boolean }) {
  return (
    <div className="mx-auto w-full max-w-3xl">
      <h1 className="font-serif text-3xl font-semibold text-ink">Course</h1>
      <p className="mt-3 text-sm leading-6 text-ink/70">
        {unlocked
          ? "Your course is unlocked. English and Hindi lessons are available."
          : "Paid lessons stay on the page with a lock. A short preview plays for visitors. Full playback needs an active course purchase."}
      </p>
      <ul className="mt-6 space-y-3">
        {DEFAULT_LANGUAGES.map((language) => (
          <li key={language.code} className="rounded-2xl bg-white px-4 py-3 text-sm text-ink ring-1 ring-ink/10">
            <span className="font-semibold">{language.name}</span>
            <span className="ml-2">{language.nativeName}</span>
            <span className="ml-2">
              {language.status !== "live" ? "Soon" : unlocked ? "Unlocked" : "Available"}
            </span>
          </li>
        ))}
      </ul>
      <article className="mt-8 rounded-3xl bg-white p-5 text-ink ring-1 ring-ink/10">
        <h2 className="text-lg font-semibold">
          {unlocked ? "Lesson 1" : "Lesson 1 preview"}
        </h2>
        <p className="mt-2 text-sm leading-6 text-ink/70">
          {unlocked
            ? "This lesson is open on your account."
            : "Locked. The first two minutes are the preview. The rest opens after you buy the course."}
        </p>
        {unlocked ? null : <PlanUpgradeButton productCode="course" />}
      </article>
    </div>
  );
}
