import { writingResultCopy } from "@/features/writing/task-copy";

export type WritingSkillScore = {
  name: string;
  score: number | null;
  feedback: string | null;
  improvement: string | null;
};

// Category breakdown for the five writing scoring areas. Cards stack
// in one column on mobile and sit two across on larger screens.
export function WritingSkillScoreGrid({
  skills,
}: {
  skills: WritingSkillScore[];
}) {
  return (
    <section
      aria-label={writingResultCopy.skillBreakdownHeading}
      className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-ink/5 sm:p-8"
    >
      <h2 className="font-serif text-xl font-semibold tracking-tight text-ink">
        {writingResultCopy.skillBreakdownHeading}
      </h2>
      <ul className="mt-5 grid gap-4 sm:grid-cols-2">
        {skills.map((skill) => (
          <li
            key={skill.name}
            className="rounded-2xl bg-cream-soft p-5 ring-1 ring-ink/5"
          >
            <div className="flex items-baseline justify-between gap-3">
              <h3 className="text-sm font-semibold text-ink">{skill.name}</h3>
              <p className="shrink-0 text-sm font-semibold text-brand">
                {skill.score !== null ? Math.round(skill.score) : "-"}
                <span className="ml-1 text-xs font-medium text-ink/50">
                  {writingResultCopy.skillScoreScale}
                </span>
              </p>
            </div>
            {skill.feedback && (
              <p className="mt-3 text-sm leading-6 text-ink/70">
                {skill.feedback}
              </p>
            )}
            {skill.improvement && (
              <div className="mt-3 rounded-xl bg-white p-3 ring-1 ring-ink/5">
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-ink/50">
                  {writingResultCopy.improvementLabel}
                </p>
                <p className="mt-1 text-sm leading-6 text-ink/80">
                  {skill.improvement}
                </p>
              </div>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
